import OpenAI from 'openai';
export async function explainRisk(result) {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey)
        return null;
    const openai = new OpenAI({ apiKey });
    const summary = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
            {
                role: 'system',
                content: 'You are a security assistant. Explain file scan risks clearly for non-technical users. Be concise and actionable.'
            },
            {
                role: 'user',
                content: JSON.stringify({
                    fileName: result.fileName,
                    fileSizeBytes: result.fileSizeBytes,
                    mimeType: result.mimeType,
                    sha256: result.sha256,
                    weightedRiskScore: result.weightedRiskScore,
                    findings: result.findings.map(f => ({ engine: f.engine, malicious: f.malicious, score: f.score, labels: f.labels }))
                })
            }
        ],
        temperature: 0.2,
        max_tokens: 250
    });
    return summary.choices?.[0]?.message?.content ?? null;
}
