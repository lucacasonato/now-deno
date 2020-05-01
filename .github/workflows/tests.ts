import {
  assert,
  assertStrContains,
} from 'https://deno.land/std@v0.42.0/testing/asserts.ts';
import { join } from 'https://deno.land/std@v0.42.0/path/mod.ts';

const isWin = Deno.build.os == 'windows';
const runNow = isWin ? ['now.cmd'] : ['npx', 'now'];

Deno.test({
  name: 'deploy to now',
  async fn() {
    const proc = Deno.run({
      cmd: runNow.concat('-c', '-t', Deno.env.get('NOW_TOKEN')!),
      cwd: join(Deno.cwd(), 'example'),
      stdout: 'piped',
      stderr: 'piped',
    });
    const status = await proc.status();
    const decoder = new TextDecoder();
    assert(status.success, decoder.decode(await proc.stderrOutput()));
    const url = decoder.decode(await proc.output());
    proc.close();
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
  Deno.test({
    name: 'run on now dev',
    async fn() {
      const proc = Deno.run({
        cmd: runNow.concat('dev', '-t', Deno.env.get('NOW_TOKEN')!),
        cwd: join(Deno.cwd(), 'example'),
        stdout: 'inherit',
        stderr: 'inherit',
      });
      await new Promise(resolve => setTimeout(resolve, 20000));
      for (let i = 0; i < 20; i++) {
        try {
          const req = await fetch(`http://localhost:3000/api/version`);
          if (req.ok) {
            const text = await req.text();
            assertStrContains(text, 'Welcome to deno');
            assertStrContains(text, '🦕');
            proc.kill(2);
            proc.close();
            Deno.exit(0);
          }
        } catch (err) {
          console.log(err);
        }
        await new Promise(resolve => setTimeout(resolve, 3000));
      }
      proc.kill(2);
      proc.close();
      throw Error('Failed to send request to now dev');
    },
  });
}
