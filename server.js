const express = require('express');
const cors = require('cors');
const cheerio = require('cheerio');

const app = express();
app.use(cors());

app.get('/', (req, res) => {
    res.send('🟢 LIGHTWEIGHT SCAPING MOTOR ONLINE!');
});

app.get('/api/events', async (req, res) => {
    try {
        const response = await fetch('https://www.openground.club/de/', {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
            }
        });

        if (!response.ok) {
            throw new Error(`Website antwortet nicht: Status ${response.status}`);
        }

        const html = await response.text();
        const $ = cheerio.load(html);
        const extractedData = [];

        $('.event-item, article, .program-row').each((index, element) => {
            const title = $(element).find('h2, .title').text().trim();
            const date = $(element).find('.date, time').text().trim() || 'TBA';
            const time = $(element).find('.time').text().trim() || '';
            const lineup = $(element).find('.lineup, .artists').text().trim() || 'Lineup TBA';
            const location = $(element).find('.location, .room').text().trim() || 'OPEN GROUND';


            if (title) {
                extractedData.push({
                    date: `${date} ${time}`.trim(),
                    title: title,
                    lineup: lineup,
                    location: location,
                    type: "TICKETS"
                });
            }
        });

        res.json(extractedData);

    } catch (error) {
        console.error("🚨 SCRAPING FEHLER:", error.message);
        res.status(500).json({ error: 'Scraping failed', detail: error.message });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server läuft auf Port ${PORT}`);
});
