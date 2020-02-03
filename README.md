# now-deno

> ZEIT Now Deno builder - run Deno on Zeit. 🦕 + λ = ❤

This builder allows you to run [Deno](https://deno.land) as a lambda on ZEIT Now.

## Usage

If you're unfamiliar with now runtimes, please read the [runtime docs](https://zeit.co/docs/runtimes) first. This runtime can be used like any other Community Runtime.

```json
// now.json
{
  "functions": {
    "api/**/*.ts": {
      "runtime": "now-deno@0.2.0"
    }
  }
}
```

```ts
// api/hello.ts
import { APIGatewayEventRequestContext, APIGatewayEvent } from 'https://deno.land/x/lambda/mod.ts';

export async function handler(event: APIGatewayEvent, context: APIGatewayEventRequestContext) {
  return {
    statusCode: 200,
    body: `Welcome to deno ${Deno.version.deno} 🦕`,
    headers: {
      'content-type': 'text/html; charset=utf-8',
    },
  };
}
```

That's the simplest way to use this runtime!

## Advanced usage

You can place a `build.sh` function in the root of your deploy directory. This will be executed before the lambda is built.

## `now dev`

> `now dev` is currently only supported on macOS and Linux. It is not supported on Windows.

If you have have `deno` installed in your path then you can use `now dev` with this runtime. It should work just like any other runtime.

## Credits

This was only possible due to the great work of [Andy Hayden](https://github.com/hayd) who made the first attempts at running [deno in a lambda function](https://github.com/hayd/deno-lambda).
