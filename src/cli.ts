#!/usr/bin/env node
import 'dotenv/config';
import { extractAndDownload } from './extractor.js';
import { scanFileAllEngines } from './scan.js';
import { explainRisk } from './explainer.js';

function parseArgs(): Record<string, string | boolean | number> {
  const args = process.argv.slice(2);
  const out: Record<string, any> = {};
  for (let i = 0; i < args.length; i++) {
    const a = args[i];
    if (a.startsWith('--')) {
      const key = a.slice(2);
      const next = args[i + 1];
      if (next && !next.startsWith('--')) {
        out[key] = next;
        i++;
      } else {
        out[key] = true;
      }
    }
  }
  return out;
}

async function main() {
  const args = parseArgs();
  const url = String(args.url || '');
  if (!url) {
    console.error('Usage: safedlbuddy --url <page> [--pattern <selector>] [--max 3]');
    process.exit(1);
  }
  const selector = (args.pattern as string) || "a[href$='.exe'], a[href$='.zip'], a[href$='.pdf']";
  const max = args.max ? Number(args.max) : 3;

  const downloads = await extractAndDownload({ url, selector, headless: true, maxFiles: max });
  if (downloads.length === 0) {
    console.error('No downloads captured. Try adjusting the selector.');
    process.exit(2);
  }

  for (const d of downloads) {
    console.log(`Scanning: ${d.fileName}`);
    const result = await scanFileAllEngines(d.filePath);
    const explanation = await explainRisk(result);
    console.log(JSON.stringify({ result, explanation }, null, 2));
  }
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});

