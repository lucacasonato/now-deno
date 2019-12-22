import path from 'path';

export const getWorkPath = (workPath: string, entrypoint: string) => path.join(workPath, ".now", entrypoint)