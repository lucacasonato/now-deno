import {
  assert,
  assertStrContains,
} from 'https://deno.land/std@0.51.0/testing/asserts.ts';
import { join } from 'https://deno.land/std@0.51.0/path/mod.ts';

const isWin = Deno.build.os == 'windows';
const runNow = isWin ? ['vercel.cmd'] : ['npx', 'vercel'];

Deno.test({
  name: 'deploy to vercel',
  async fn() {
    const proc = Deno.run({
      cmd: runNow.concat('-c', '-f', '-t', Deno.env.get('VERCEL_TOKEN')!),
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

Deno.test({
  name: 'deploy to vercel with specific version',
  async fn() {
    const proc = Deno.run({
      cmd: runNow.concat(
        '-c',
        '-f',
        '-t',
        Deno.env.get('VERCEL_TOKEN')!,
        '--build-env',
        'DENO_VERSION=0.40.0'
      ),
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
    assertStrContains(text, '0.40.0');
    assertStrContains(text, '🦕');
  },
});

// TODO(lucacasonato): reenable test on macOS
if (Deno.build.os === 'linux') {
  Deno.test({
    name: 'run on vercel dev',
    async fn() {
      const proc = Deno.run({
        cmd: runNow.concat('dev', '-t', Deno.env.get('VERCEL_TOKEN')!),
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
      throw Error('Failed to send request to vercel dev');
    },
  });
}
