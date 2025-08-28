import axios from 'axios';
import FormData from 'form-data';
import fs from 'node:fs';
// NOTE: Bytescale has various APIs; this assumes a malware scanning endpoint under /v2/contentSafety/scan
// Adjust the endpoint/fields to match your account's configuration.
export async function scanWithBytescale(filePath, apiKey) {
    const key = apiKey ?? process.env.BYTESCALE_API_KEY;
    if (!key)
        return null;
    const form = new FormData();
    form.append('file', fs.createReadStream(filePath));
    const resp = await axios.post('https://api.bytescale.com/v2/contentSafety/scan', form, {
        headers: {
            ...form.getHeaders(),
            'Authorization': `Bearer ${key}`
        },
        timeout: 60_000
    });
    const data = resp.data;
    const malicious = Boolean(data?.malicious || data?.threats?.length);
    const labels = (data?.threats ?? []).map((t) => t?.name || t?.type).filter(Boolean);
    const score = typeof data?.riskScore === 'number' ? Math.min(Math.max(data.riskScore, 0), 1) : (malicious ? 1 : 0);
    return {
        engine: 'bytescale',
        malicious,
        score,
        labels,
        raw: data
    };
}
