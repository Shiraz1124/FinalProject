import axios from 'axios';
import FormData from 'form-data';
import fs from 'node:fs';
export async function scanWithCloudmersive(filePath, apiKey) {
    const key = apiKey ?? process.env.CLOUDMERSIVE_API_KEY;
    if (!key)
        return null;
    const form = new FormData();
    form.append('inputFile', fs.createReadStream(filePath));
    const resp = await axios.post('https://api.cloudmersive.com/virus/scan/file', form, {
        headers: {
            ...form.getHeaders(),
            'Apikey': key
        },
        timeout: 60_000
    });
    const data = resp.data;
    const isInfected = Boolean(data?.CleanResult === false || data?.IsMalicious === true || data?.FoundViruses?.length);
    const labels = (data?.FoundViruses ?? []).map((v) => v?.VirusName).filter(Boolean);
    const score = isInfected ? 1 : 0;
    const finding = {
        engine: 'cloudmersive',
        malicious: isInfected,
        score,
        labels,
        raw: data
    };
    return finding;
}
