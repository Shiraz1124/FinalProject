import { chromium } from 'playwright';
import tmp from 'tmp';
import path from 'node:path';
import { ensureDir } from './utils.js';
export async function extractAndDownload(options) {
    const { url, selector = 'a[href]', downloadDir, headless = true, maxFiles = 5 } = options;
    const tmpDir = downloadDir ?? tmp.dirSync({ unsafeCleanup: true }).name;
    ensureDir(tmpDir);
    const browser = await chromium.launch({ headless });
    const context = await browser.newContext({ acceptDownloads: true });
    const page = await context.newPage();
    await page.goto(url, { waitUntil: 'load', timeout: 60_000 });
    const elements = await page.$$(selector);
    const results = [];
    for (const element of elements.slice(0, maxFiles)) {
        const tag = await element.evaluate(el => el.tagName.toLowerCase());
        let downloadUrl = null;
        if (tag === 'a') {
            downloadUrl = await element.getAttribute('href');
        }
        if (!downloadUrl)
            continue;
        const [download] = await Promise.all([
            page.waitForEvent('download', { timeout: 30_000 }).catch(() => null),
            element.click({ button: 'left' })
        ]);
        if (!download)
            continue;
        const suggested = download.suggestedFilename();
        const savePath = path.join(tmpDir, suggested);
        await download.saveAs(savePath);
        results.push({ url: downloadUrl, filePath: savePath, fileName: suggested });
    }
    await browser.close();
    return results;
}
