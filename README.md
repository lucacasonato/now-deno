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

### Permissions

To use Deno permissions, pass the options you want to pass through in the `env` section of `now.json`:

#### Allow All

Allow Deno all permissions.

> NOTE! - Not recomended for production code. Use more specific permissions.

```json
// now.json

"env": {
  "DENO_ALLOW_ALL": true
}
```

#### Allow Env

Allow Deno to have acess to the environment.

```json
// now.json

"env": {
  "DENO_ALLOW_ENV": true
}
```

#### Allow Run

Allow Deno to spawn and run child processes.

```json
// now.json

"env": {
  "DENO_ALLOW_RUN": true
}

```

#### Allow HR Time

Allow Deno to to use high resolution time measurement.

```json
// now.json

"env": {
  "DENO_ALLOW_HR_TIME": true
}

```

#### Allow Read

Allow Deno to read specific files.

##### All Files

```json
// now.json

"env": {
  "DENO_ALLOW_READ": true
}

```

##### White List of Files

```json
// now.json

"env": {
   "DENO_ALLOW_READ": "file.txt"
}

```

#### Allow Write

Allow Deno to write to specific file locations.

##### All Files

```json
// now.json

"env": {
  "DENO_ALLOW_WRITE": true
}

```

##### White List of Files

```json
// now.json

"env": {
   "DENO_ALLOW_WRITE": "file.txt"
}

```

#### Allow Net

Allow Deno to access the network and make requests.

##### The Whole Internet

```json
// now.json

"env": {
  "DENO_ALLOW_NET": true
}

```

##### Whitelist of Domains

```json
// now.json

"env": {
   "DENO_ALLOW_NET": "deno.land"
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
