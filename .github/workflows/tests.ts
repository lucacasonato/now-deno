import {
  test,
  assert,
  assertStrContains,
} from 'https://deno.land/std/testing/mod.ts';
import { join } from 'https://deno.land/std/path/mod.ts';

test(async function deployNow() {
  const proc = Deno.run({
    args: ['npx', 'now', '-t', Deno.env()['NOW_TOKEN']],
    cwd: join(Deno.cwd(), 'example'),
    stdout: 'piped',
    stderr: 'piped',
  });
  const status = await proc.status();
  const decoder = new TextDecoder();
  assert(status.success, decoder.decode(await proc.stderrOutput()));
  const url = decoder.decode(await proc.output());
  console.log(`Deployed to ${url}`);
  const req = await fetch(`${url}/api/version`);
  assert(req.ok, JSON.stringify(req));
  const text = await req.text();
  assertStrContains(text, 'Welcome to deno');
  assertStrContains(text, '🦕');
});
