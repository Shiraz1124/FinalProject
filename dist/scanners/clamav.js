import NodeClam from 'clamscan';
export async function scanWithClamAV(filePath) {
    const host = process.env.CLAMAV_HOST || '127.0.0.1';
    const port = Number(process.env.CLAMAV_PORT || '3310');
    const clamscan = await new NodeClam().init({
        removeInfected: false,
        quarantineInfected: false,
        scanLog: null,
        debugMode: false,
        preference: 'clamdscan',
        clamdscan: {
            host,
            port,
            timeout: 60_000,
            localFallback: true
        },
        clamscan: {
            path: '/usr/bin/clamscan'
        }
    });
    const { isInfected, viruses } = await clamscan.isInfected(filePath);
    return {
        engine: 'clamav',
        malicious: Boolean(isInfected),
        score: isInfected ? 1 : 0,
        labels: Array.isArray(viruses) ? viruses : (viruses ? [String(viruses)] : []),
        raw: { isInfected, viruses }
    };
}
