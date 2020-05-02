import path from 'path';
import commandExists from 'command-exists';
import which from 'which';
import { symlink, remove, readFile, writeFile } from 'fs-extra';

export async function ensureDeno() {
  try {
    await commandExists('deno');
  } catch (error) {
    console.error(
      'deno is not installed or not in your PATH. Please install deno from https://deno.land/.'
    );
    throw error;
  }
}

export async function ensureBash() {
  try {
    await commandExists('bash');
  } catch (error) {
    console.error(
      'bash is not installed or not in your PATH. Please install bash or add it to your PATH.'
    );
    throw error;
  }
}

export async function replaceBinDeno(workPath: string) {
  const denoPath = await which('deno');
  const binDenoPath = path.join(workPath, 'layer', 'bin', 'deno');
  await remove(binDenoPath);
  await symlink(denoPath, binDenoPath);
}

export async function replaceBootstrapBash(bootstrapPath: string) {
  const bashPath = await which('bash');
  const bootstrapFile = await readFile(bootstrapPath, 'utf8');
  await writeFile(
    bootstrapPath,
    bootstrapFile.replace('#!/bin/sh', `#!${bashPath}`)
  );
}
