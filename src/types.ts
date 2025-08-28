export type AntivirusEngine = 'bytescale' | 'cloudmersive' | 'clamav';

export interface ScanFinding {
  engine: AntivirusEngine;
  malicious: boolean;
  score: number; // 0.0-1.0 probability of maliciousness per engine
  labels?: string[];
  raw?: unknown;
}

export interface ScanAggregateResult {
  filePath: string;
  fileName: string;
  fileSizeBytes: number;
  mimeType?: string;
  sha256?: string;
  findings: ScanFinding[];
  weightedRiskScore: number; // 0.0-1.0
}

export interface DownloadTarget {
  url: string;
  suggestedFileName?: string;
}

