import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import FileType from 'file-type';

export async function computeSha256(filePath: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const hash = crypto.createHash('sha256');
    const stream = fs.createReadStream(filePath);
    stream.on('data', chunk => hash.update(chunk));
    stream.on('error', reject);
    stream.on('end', () => resolve(hash.digest('hex')));
  });
}

export async function detectMimeType(filePath: string): Promise<string | undefined> {
  const fd = fs.openSync(filePath, 'r');
  try {
    const chunkSize = 4100;
    const buffer = Buffer.alloc(chunkSize);
    const bytesRead = fs.readSync(fd, buffer, 0, chunkSize, 0);
    const ft = await FileType.fromBuffer(buffer.slice(0, bytesRead));
    return ft?.mime;
  } finally {
    fs.closeSync(fd);
  }
}

export function ensureDir(dirPath: string): void {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

export function safeJoin(baseDir: string, requestedName: string): string {
  const resolved = path.resolve(baseDir, requestedName);
  if (!resolved.startsWith(path.resolve(baseDir))) {
    throw new Error('Path traversal attempt');
  }
  return resolved;
}

