import {
  readJson,
  writeJson,
  ensureDir,
} from 'https://deno.land/std@0.51.0/fs/mod.ts';
const sha = Deno.env.get('GITHUB_SHA');
if (!sha) {
  throw Error('No GITHUB_SHA specified.');
}
const name = Deno.env.get('PACKAGE_NAME');
if (!name) {
  throw Error('No PACKAGE_NAME specified.');
}
const tag = `0.1.0-${sha}`;
const pkg: any = await readJson('package.json');
pkg.name = name;
pkg.version = tag;
await writeJson('package.json', pkg, { spaces: 2 });

const vercel: any = await readJson('example/now.json');
vercel.functions['api/**/*.ts'].runtime = `${name}@${tag}`;
await writeJson('example/now.json', vercel, { spaces: 2 });
await ensureDir('example/.now');
await writeJson('example/.now/project.json', {
  projectId: 'QmT3dw3FcMmKeRh24bRCTR6iF5VCp6kB5CNjgGePK57cC6',
  orgId: 'eTmgUytG3YzmHs86JcUzFSmc',
});
