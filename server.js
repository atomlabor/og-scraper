const express = require('express');
const cors = require('cors');
const puppeteer = require('puppeteer');

const app = express();
app.use(cors());

app.get('/api/events', async (req, res) => {
    let browser;
    try {
        browser = await puppeteer.launch({ 
            headless: "new",
            args: [
                '--no-sandbox', 
                '--disable-setuid-sandbox',
                '--disable-dev-shm-usage'
            ] 
        });
        
        const page = await browser.newPage();
        await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');

        await page.goto('https://www.openground.club/de/', { waitUntil: 'networkidle2' });

        const events = await page.evaluate(() => {
            const eventElements = document.querySelectorAll('.event-item, article, .program-row'); 
            const extractedData = [];

            eventElements.forEach(el => {
                extractedData.push({
                    date: el.querySelector('.date, time')?.innerText || 'TBA',
                    time: el.querySelector('.time')?.innerText || '',
                    title: el.querySelector('h2, .title')?.innerText || 'Secret Event',
                    lineup: el.querySelector('.lineup, .artists')?.innerText || 'Special Guests',
                    location: el.querySelector('.location, .room')?.innerText || 'OPEN GROUND',
                    type: "TICKETS"
                });
            });
            return extractedData;
        });

        await browser.close();
        res.json(events);

    } catch (error) {
        if (browser) await browser.close();
        res.status(500).json({ error: 'Scraping failed' });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
