import path from 'path';
import fs from 'fs';

export const getWorkPath = (workPath: string, entrypoint: string) => {
  const vercelPath = path.join(workPath, '.vercel');
  if (fs.existsSync(vercelPath)) {
    return path.join(vercelPath, 'builders', 'now-deno', entrypoint);
  }
  return path.join(workPath, '.now', 'builders', 'now-deno', entrypoint);
}
