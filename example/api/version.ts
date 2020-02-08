import {
  APIGatewayProxyEvent,
  Context
} from 'https://deno.land/x/lambda/mod.ts';

export async function handler(
  event: APIGatewayProxyEvent,
  context: Context
) {
  return {
    statusCode: 200,
    body: `Welcome to deno ${Deno.version.deno} 🦕`,
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
    },
  };
}
