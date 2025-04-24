// File: api/events.js (for Vercel serverless function)

import ical from 'node-ical';
import fetch from 'node-fetch';

export default async function handler(req, res) {
  const icsUrl = "https://calendar.google.com/calendar/ical/92f3abbb95e0965e767ecd6e0efdcf3d6f0a4a3c083bfda41d52eed766a13950%40group.calendar.google.com/public/basic.ics";

  try {
    const response = await fetch(icsUrl);
    if (!response.ok) throw new Error("Kalender konnte nicht geladen werden");

    const icsText = await response.text();
    const data = ical.parseICS(icsText);

    const events = Object.values(data)
      .filter(e => e.type === 'VEVENT' && e.start >= new Date())
      .map(e => {
        // Beschreibung parsen (optional: Typ + Ticket-Link)
        const details = {
          description: '',
          type: '',
          ticket: ''
        };

        if (e.description) {
          const lines = e.description.split(/\r?\n/);
          lines.forEach(line => {
            if (line.startsWith("Typ:")) details.type = line.replace("Typ:", "").trim();
            else if (line.startsWith("Ticket:")) details.ticket = line.replace("Ticket:", "").trim();
            else details.description += line + ' ';
          });
        }

        return {
          title: e.summary,
          start: e.start,
          description: details.description.trim(),
          type: details.type,
          ticket: details.ticket
        };
      });

    res.setHeader('Access-Control-Allow-Origin', '*');
    res.status(200).json(events);
  } catch (err) {
    console.error("Fehler beim Parsen des Kalenders:", err);
    res.status(500).json({ error: "Fehler beim Laden der Events" });
  }
}
