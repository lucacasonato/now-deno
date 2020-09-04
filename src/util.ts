import path from 'path';

export const getWorkPath = (workPath: string, entrypoint: string) =>
  path.join(workPath, '.vercel', 'builders', 'now-deno', entrypoint);
