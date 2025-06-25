import ical from 'node-ical';

export default async function handler(req, res) {
  try {
    const url = 'https://calendar.google.com/calendar/u/2?cid=OTJmM2FiYmI5NWUwOTY1ZTc2N2VjZDZlMGVmZGNmM2Q2ZjBhNGEzYzA4M2JmZGE0MWQ1MmVlZDc2NmExMzk1MEBncm91cC5jYWxlbmRhci5nb29nbGUuY29t';
    const data = await ical.async.fromURL(url);

    const now = new Date();
    now.setHours(0, 0, 0, 0); // Vergleich ab heute, unabhängig von Uhrzeit

    const events = Object.values(data)
      .filter(e => e.type === 'VEVENT')
      .filter(e => {
        const eventDate = new Date(e.start);
        eventDate.setHours(0, 0, 0, 0);
        return eventDate >= now;
      })
      .map(e => {
        const description = e.description || '';
        const typeMatch = description.match(/Typ:\s*(.*)/i);
        const ticketMatch = description.match(/Ticket:\s*(.*)/i);
        const locationMatch = description.match(/Location:\s*(.*)/i);

        const ticketRaw = ticketMatch ? ticketMatch[1].trim() : '';
        const isLink = /^https?:\/\//i.test(ticketRaw);

        const ticket = ticketRaw || 'Nur Abendkasse';
        const ticketUrl = isLink ? ticketRaw : '';

        return {
          title: e.summary || '',
          start: e.start,
          description: description,
          type: typeMatch ? typeMatch[1].trim() : '',
          ticket,
          ticketUrl,
          location: locationMatch ? locationMatch[1].trim() : ''
        };
      });

    res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate');
    res.status(200).json(events);
  } catch (error) {
    console.error('Fehler beim Abrufen des Kalenders:', error);
    res.status(500).json({ error: 'Interner Serverfehler' });
  }
}
