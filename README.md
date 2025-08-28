## SafeDLBuddy

AI-powered file scanning system that ensures safe downloads from the internet.

### Features
- Extracts download links with Playwright automation
- Securely downloads to temporary storage
- Scans files with multiple engines: Bytescale, Cloudmersive, and ClamAV
- Aggregates into a weighted safety score
- Explains risks using ChatGPT (OpenAI)
- CLI and minimal HTTP API

### Quickstart
1. Install Node.js 18+
2. Copy `.env.example` to `.env` and fill keys
3. Install deps and Playwright browsers:
   ```bash
   npm i
   npm run playwright
   ```
4. Run API:
   ```bash
   npm run dev
   ```
5. CLI example:
   ```bash
   npm run cli -- --url https://example.com --pattern "a[href$='.pdf']"
   ```

### Environment
- `CLOUDMERSIVE_API_KEY` — Cloudmersive Virus Scan API key
- `BYTESCALE_API_KEY` — Bytescale API key
- `OPENAI_API_KEY` — OpenAI API key
- `CLAMAV_HOST`/`CLAMAV_PORT` — optional clamd; fallback to `clamscan` if available
- `PORT` — server port (default 3000)

### Notes
- Use ethically and comply with site terms.
- Files are stored in temp and deleted after scanning.

