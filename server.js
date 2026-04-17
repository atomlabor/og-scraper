const express = require('express');
const cors = require('cors');
const cheerio = require('cheerio');

const app = express();
app.use(cors());

// Status-Seite für den Browser-Check
app.get('/', (req, res) => {
    res.send('🟢 OG-SCRAPER V2.0.0 ONLINE - Nutze /api/events für Daten');
});

app.get('/api/events', async (req, res) => {
    try {
        const response = await fetch('https://www.openground.club/de/', {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
            }
        });

        if (!response.ok) throw new Error(`Website Error: ${response.status}`);

        const html = await response.text();
        const $ = cheerio.load(html);
        const extractedData = [];

        // Wir scannen die von dir gefundenen .newschedule__item Container
        $('.newschedule__item').each((index, element) => {
            
            // Überspringe vergangene Events (falls die Klasse existiert)
            if ($(element).hasClass('newschedule__item--past')) return;

            const category = $(element).find('.newschedule__category').text().trim();
            const date = $(element).find('.newschedule__date').text().trim();
            
            // Extrahiere Künstler/Lineup (oft in fett oder spezifischen spans innerhalb des Items)
            // Wir nehmen hier den Textinhalt und säubern ihn von Kategorie und Datum
            let fullText = $(element).text().replace(/\s+/g, ' ').trim();
            let lineup = fullText.replace(category, '').replace(date, '').trim();

            if (lineup) {
                extractedData.push({
                    date: date,
                    location: category || 'OPEN GROUND',
                    title: category === 'Open Lobby' ? 'Lobby / Annex' : 'Clubnight',
                    lineup: lineup,
                    type: "INFO"
                });
            }
        });

        // Falls wir zu viele Daten haben, begrenzen wir auf die aktuelle Woche (die ersten 6 Treffer)
        res.json(extractedData.slice(0, 6));

    } catch (error) {
        console.error("Scraping Error:", error.message);
        res.status(500).json({ error: 'Failed to fetch events', details: error.message });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server läuft auf Port ${PORT}`);
});
