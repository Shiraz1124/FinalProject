import fs from 'node:fs';
import path from 'node:path';
import { computeSha256, detectMimeType } from './utils.js';
import { ScanAggregateResult, ScanFinding } from './types.js';

export interface ScoringWeights {
  bytescale: number;
  cloudmersive: number;
  clamav: number;
}

export const DEFAULT_WEIGHTS: ScoringWeights = {
  bytescale: 0.4,
  cloudmersive: 0.35,
  clamav: 0.25
};

export async function aggregateFindings(filePath: string, findings: ScanFinding[], weights: ScoringWeights = DEFAULT_WEIGHTS): Promise<ScanAggregateResult> {
  const fileName = path.basename(filePath);
  const stats = fs.statSync(filePath);
  const sha256 = await computeSha256(filePath);
  const mimeType = await detectMimeType(filePath);

  const weightSum = Object.values(weights).reduce((a, b) => a + b, 0) || 1;
  const weightedRiskScore = findings.reduce((sum, f) => {
    const w = (weights as any)[f.engine] ?? 0;
    return sum + (f.score * w);
  }, 0) / weightSum;

  return {
    filePath,
    fileName,
    fileSizeBytes: stats.size,
    mimeType,
    sha256,
    findings,
    weightedRiskScore
  };
}

