# now-deno
> ZEIT Now Deno builder - run Deno on Zeit. 🦕 + λ = ❤

This builder allows you to run [Deno](https://deno.land) as a lambda on ZEIT Now.

## Usage

If you're unfamiliar with now runtimes, please read the [runtime docs](https://zeit.co/docs/runtimes) first. This runtime can be used like any other Community Runtime.

```json
{
	"functions": {
		"api/**/*.ts": {
			"runtime": "now-deno@1.0.0"
		}
	}
}
```
That's the simplest way to use this runtime!

