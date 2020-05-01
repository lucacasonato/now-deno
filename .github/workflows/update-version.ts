import { readJson, writeJson } from 'https://deno.land/std@v0.42.0/fs/mod.ts';
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

const now: any = await readJson('example/now.json');
now.functions['api/**/*.ts'].runtime = `${name}@${tag}`;
await writeJson('example/now.json', now, { spaces: 2 });
