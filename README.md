# now-deno

> Deno builder for Vercel - run Deno on `vercel`. 🦕 + λ = ❤️

This builder allows you to run [Deno](https://deno.land) as a lambda on `vercel`.

## Usage

If you're unfamiliar with `vercel` runtimes, please read the [runtime docs](https://vercel.com/docs/runtimes) first. This runtime can be used like any other Community Runtime.

```json
// now.json
{
  "functions": {
    "api/**/*.{j,t}s": {
      "runtime": "now-deno@0.4.0"
    }
  }
}
```

Note: You need `vercel` v17.x or above to use the above configuration.

```ts
// api/hello.ts
import {
  APIGatewayProxyEvent,
  APIGatewayProxyResult,
  Context,
} from 'https://deno.land/x/lambda/mod.ts';

export async function handler(
  event: APIGatewayProxyEvent,
  context: Context
): Promise<APIGatewayProxyResult> {
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

### Specific Deno version

To use a specific version of Deno you can specify a environment variable in your `now.json`:

```json
// now.json
{
  "functions": {
    ...
  },
  "env": {
    "DENO_VERSION": "0.42.0"
  }
}
```

### Unstable mode

To use Deno's `unstable` mode you can specify the environment variable `DENO_UNSTABLE` in your `now.json`:

```json
// now.json
{
  "functions": {
    ...
  },
  "env": {
    "DENO_UNSTABLE": "true"
  }
}
```

### TS Config

To pass a custom config, you can specify the variable `DENO_CONFIG` in your `now.json`:

```json
// now.json
{
  "functions": {
    ...
  },
  "env": {
    "DENO_CONFIG": "tsconfig.json"
  }
}
```

### Custom pre-package script

You can place a `build.sh` function in the root of your deploy directory. This will be executed before the function is packaged up.

## `vercel dev`

> **`vercel dev` is currently only supported on macOS and Linux. It is not supported on Windows.**

If you have have `deno` installed in your path then you can use `vercel dev` with this runtime. It should work just like any other runtime.

## Credits

This was only possible due to the great work of [Andy Hayden](https://github.com/hayd) who made the first attempts at running [deno in a lambda function](https://github.com/hayd/deno-lambda).
