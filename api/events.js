import ical from 'node-ical';

export default async function handler(req, res) {
  try {
    const url = 'https://calendar.google.com/calendar/ical/92f3abbb95e0965e767ecd6e0efdcf3d6f0a4a3c083bfda41d52eed766a13950%40group.calendar.google.com/public/basic.ics';
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

        return {
          title: e.summary || '',
          start: e.start,
          description: description,
          type: typeMatch ? typeMatch[1].trim() : '',
          ticket: ticketMatch ? ticketMatch[1].trim() : '',
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
