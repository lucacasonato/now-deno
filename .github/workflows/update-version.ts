const sha = Deno.env()['GITHUB_SHA'];
if (!sha) {
  throw Error('No GITHUB_SHA specified.');
}
const name = Deno.env()['PACKAGE_NAME'];
if (!name) {
  throw Error('No PACKAGE_NAME specified.');
}
const tag = `0.1.0-${sha}`;
const decoder = new TextDecoder();
const encoder = new TextEncoder();
const pkg = JSON.parse(decoder.decode(await Deno.readFile('package.json')));
pkg.name = name;
pkg.version = tag;
await Deno.writeFile(
  'package.json',
  encoder.encode(JSON.stringify(pkg, null, 2))
);

const now = JSON.parse(decoder.decode(await Deno.readFile('example/now.json')));
now.functions['api/**/*.ts'].runtime = `${name}@${tag}`;
await Deno.writeFile(
  'example/now.json',
  encoder.encode(JSON.stringify(now, null, 2))
);
