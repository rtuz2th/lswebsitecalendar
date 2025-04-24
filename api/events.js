<!DOCTYPE html PUBLIC "-//W3C//DTD HTML 4.01//EN" "http://www.w3.org/TR/html4/strict.dtd">
<html>
<head>
  <meta http-equiv="Content-Type" content="text/html; charset=utf-8">
  <meta http-equiv="Content-Style-Type" content="text/css">
  <title></title>
  <meta name="Generator" content="Cocoa HTML Writer">
  <meta name="CocoaVersion" content="2487.5">
  <style type="text/css">
    p.p1 {margin: 0.0px 0.0px 0.0px 0.0px; font: 12.0px Helvetica}
    p.p2 {margin: 0.0px 0.0px 0.0px 0.0px; font: 12.0px Helvetica; min-height: 14.0px}
  </style>
</head>
<body>
<p class="p1">// File: api/events.js (for Vercel serverless function)</p>
<p class="p2"><br></p>
<p class="p1">import ical from 'node-ical';</p>
<p class="p1">import fetch from 'node-fetch';</p>
<p class="p2"><br></p>
<p class="p1">export default async function handler(req, res) {</p>
<p class="p1"><span class="Apple-converted-space">  </span>const icsUrl = "https://calendar.google.com/calendar/ical/92f3abbb95e0965e767ecd6e0efdcf3d6f0a4a3c083bfda41d52eed766a13950%40group.calendar.google.com/public/basic.ics";</p>
<p class="p2"><br></p>
<p class="p1"><span class="Apple-converted-space">  </span>try {</p>
<p class="p1"><span class="Apple-converted-space">    </span>const response = await fetch(icsUrl);</p>
<p class="p1"><span class="Apple-converted-space">    </span>if (!response.ok) throw new Error("Kalender konnte nicht geladen werden");</p>
<p class="p2"><br></p>
<p class="p1"><span class="Apple-converted-space">    </span>const icsText = await response.text();</p>
<p class="p1"><span class="Apple-converted-space">    </span>const data = ical.parseICS(icsText);</p>
<p class="p2"><br></p>
<p class="p1"><span class="Apple-converted-space">    </span>const events = Object.values(data)</p>
<p class="p1"><span class="Apple-converted-space">      </span>.filter(e =&gt; e.type === 'VEVENT' &amp;&amp; e.start &gt;= new Date())</p>
<p class="p1"><span class="Apple-converted-space">      </span>.map(e =&gt; {</p>
<p class="p1"><span class="Apple-converted-space">        </span>// Beschreibung parsen (optional: Typ + Ticket-Link)</p>
<p class="p1"><span class="Apple-converted-space">        </span>const details = {</p>
<p class="p1"><span class="Apple-converted-space">          </span>description: '',</p>
<p class="p1"><span class="Apple-converted-space">          </span>type: '',</p>
<p class="p1"><span class="Apple-converted-space">          </span>ticket: ''</p>
<p class="p1"><span class="Apple-converted-space">        </span>};</p>
<p class="p2"><br></p>
<p class="p1"><span class="Apple-converted-space">        </span>if (e.description) {</p>
<p class="p1"><span class="Apple-converted-space">          </span>const lines = e.description.split(/\r?\n/);</p>
<p class="p1"><span class="Apple-converted-space">          </span>lines.forEach(line =&gt; {</p>
<p class="p1"><span class="Apple-converted-space">            </span>if (line.startsWith("Typ:")) details.type = line.replace("Typ:", "").trim();</p>
<p class="p1"><span class="Apple-converted-space">            </span>else if (line.startsWith("Ticket:")) details.ticket = line.replace("Ticket:", "").trim();</p>
<p class="p1"><span class="Apple-converted-space">            </span>else details.description += line + ' ';</p>
<p class="p1"><span class="Apple-converted-space">          </span>});</p>
<p class="p1"><span class="Apple-converted-space">        </span>}</p>
<p class="p2"><br></p>
<p class="p1"><span class="Apple-converted-space">        </span>return {</p>
<p class="p1"><span class="Apple-converted-space">          </span>title: e.summary,</p>
<p class="p1"><span class="Apple-converted-space">          </span>start: e.start,</p>
<p class="p1"><span class="Apple-converted-space">          </span>description: details.description.trim(),</p>
<p class="p1"><span class="Apple-converted-space">          </span>type: details.type,</p>
<p class="p1"><span class="Apple-converted-space">          </span>ticket: details.ticket</p>
<p class="p1"><span class="Apple-converted-space">        </span>};</p>
<p class="p1"><span class="Apple-converted-space">      </span>});</p>
<p class="p2"><br></p>
<p class="p1"><span class="Apple-converted-space">    </span>res.setHeader('Access-Control-Allow-Origin', '*');</p>
<p class="p1"><span class="Apple-converted-space">    </span>res.status(200).json(events);</p>
<p class="p1"><span class="Apple-converted-space">  </span>} catch (err) {</p>
<p class="p1"><span class="Apple-converted-space">    </span>console.error("Fehler beim Parsen des Kalenders:", err);</p>
<p class="p1"><span class="Apple-converted-space">    </span>res.status(500).json({ error: "Fehler beim Laden der Events" });</p>
<p class="p1"><span class="Apple-converted-space">  </span>}</p>
<p class="p1">}</p>
</body>
</html>
