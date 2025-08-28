import { scanWithCloudmersive } from './scanners/cloudmersive.js';
import { scanWithBytescale } from './scanners/bytescale.js';
import { scanWithClamAV } from './scanners/clamav.js';
import { aggregateFindings } from './scoring.js';
export async function scanFileAllEngines(filePath) {
    const findings = [];
    const [bytescale, cloudmersive, clamav] = await Promise.all([
        scanWithBytescale(filePath).catch(() => null),
        scanWithCloudmersive(filePath).catch(() => null),
        scanWithClamAV(filePath).catch(() => null)
    ]);
    for (const f of [bytescale, cloudmersive, clamav]) {
        if (f)
            findings.push(f);
    }
    return aggregateFindings(filePath, findings);
}
