import ical from 'node-ical';

export default async function handler(req, res) {
  try {
    const url = 'https://calendar.google.com/calendar/ical/92f3abbb95e0965e767ecd6e0efdcf3d6f0a4a3c083bfda41d52eed766a13950%40group.calendar.google.com/public/basic.ics';
    const data = await ical.async.fromURL(url);

    const now = new Date();
    now.setHours(0, 0, 0, 0);

    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);

    const events = Object.values(data)
      .filter(e => e.type === 'VEVENT')
      .filter(e => {
        const eventDate = new Date(e.start);
        eventDate.setHours(0, 0, 0, 0);
        return eventDate >= yesterday;
      })
      .map(e => {
        const description = e.description || '';

        // Zeilenumbrüche vereinheitlichen und HTML entfernen
        const normalized = description.replace(/\n\s*/g, '\n').replace(/<.*?>/g, '');
        const lines = normalized.split(/\n|<br\s*\/?>/i);

        let type = '';
        let ticket = '';
        let location = '';

        lines.forEach(line => {
          const clean = line.trim();
          if (/^(typ|type):/i.test(clean)) {
            type = clean.replace(/^(typ|type):/i, '').trim();
          } else if (/^t[ai]ckets?:/i.test(clean)) {
            ticket = clean.replace(/^t[ai]ckets?:/i, '').trim();
          } else if (/^location:/i.test(clean)) {
            location = clean.replace(/^location:/i, '').trim();
          }
        });

        const isLink = /^https?:\/\//i.test(ticket);

        return {
          title: e.summary || '',
          start: e.start,
          description,
          type: type || '–',
          ticket: ticket || '–',
          ticketUrl: isLink ? ticket : '',
          location: location || '–'
        };
      })
      .sort((a, b) => new Date(a.start) - new Date(b.start));

    res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate');
    res.status(200).json(events);
  } catch (error) {
    console.error('Error fetching calendar:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}
