import {
  test,
  assert,
  assertStrContains,
} from 'https://deno.land/std/testing/mod.ts';
import { join } from 'https://deno.land/std/path/mod.ts';

const isWin = Deno.build.os == 'win';
const runNow = isWin ? ['now.cmd'] : ['npx', 'now'];

test({
  name: 'deploy to now',
  async fn() {
    const proc = Deno.run({
      args: runNow.concat('-c', '-t', Deno.env()['NOW_TOKEN']),
      cwd: join(Deno.cwd(), 'example'),
      stdout: 'piped',
      stderr: 'piped',
    });
    const status = await proc.status();
    const decoder = new TextDecoder();
    assert(status.success, decoder.decode(await proc.stderrOutput()));
    const url = decoder.decode(await proc.output());
    console.log(`Deployed to ${url}`);
    await new Promise(resolve => setTimeout(resolve, 1000));
    const req = await fetch(`${url}/api/version`);
    assert(req.ok);
    const text = await req.text();
    assertStrContains(text, 'Welcome to deno');
    assertStrContains(text, '🦕');
  },
});

if (!isWin) {
  test({
    name: 'run on now dev',
    async fn() {
      const proc = Deno.run({
        args: runNow.concat('dev', '-c', '-t', Deno.env()['NOW_TOKEN']),
        cwd: join(Deno.cwd(), 'example'),
        stdout: 'inherit',
        stderr: 'inherit',
      });
      for (let i = 0; i < 20; i++) {
        try {
          const req = await fetch(`http://localhost:3000/api/version`);
          if (req.ok) {
            const text = await req.text();
            assertStrContains(text, 'Welcome to deno');
            assertStrContains(text, '🦕');
            proc.kill(2);
            return;
          }
        } catch (err) {}
        await new Promise(resolve => setTimeout(resolve, 3000));
      }
      proc.kill(2);
      throw Error('Failed to send request to now dev');
    },
  });
}
