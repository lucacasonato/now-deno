import path from 'path';
import commandExists from 'command-exists';
import which from 'which';
import { symlink, remove } from 'fs-extra';

export async function ensureDeno() {
  try {
    await commandExists('deno');
  } catch (error) {
    console.error(
      'deno is not installed. Please install deno from https://deno.land/.'
    );
    throw error;
  }
}

export async function replaceAmzDeno(workPath: string) {
  const denoPath = await which('deno');
  const amzDenoPath = path.join(workPath, 'layer', 'amz-deno');
  await remove(amzDenoPath);
  await symlink(denoPath, amzDenoPath);
}
