import 'dotenv/config';
import express from 'express';
import { extractAndDownload } from './extractor.js';
import { scanFileAllEngines } from './scan.js';
import { explainRisk } from './explainer.js';
import path from 'node:path';
const app = express();
app.use(express.json({ limit: '2mb' }));
app.use(express.static(path.join(process.cwd(), 'public')));
app.post('/api/scan', async (req, res) => {
    const { url, selector, max = 3 } = req.body || {};
    if (!url) {
        return res.status(400).json({ error: 'url is required' });
    }
    try {
        const downloads = await extractAndDownload({ url, selector, headless: true, maxFiles: Math.min(Number(max) || 3, 10) });
        const results = [];
        for (const d of downloads) {
            const scan = await scanFileAllEngines(d.filePath);
            const explanation = await explainRisk(scan);
            results.push({ download: d, scan, explanation });
        }
        res.json({ count: results.length, results });
    }
    catch (err) {
        res.status(500).json({ error: err?.message || 'Internal error' });
    }
});
const port = Number(process.env.PORT || 3000);
app.listen(port, () => {
    console.log(`SafeDLBuddy API listening on http://localhost:${port}`);
});
