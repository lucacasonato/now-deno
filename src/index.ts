import fs, { pathExists } from 'fs-extra';
import path from 'path';
import execa from 'execa';
import {
  glob,
  createLambda,
  download,
  FileFsRef,
  runShellScript,
  BuildOptions,
  DownloadedFiles,
  Files,
  debug,
} from '@now/build-utils';
import { ensureDeno, replaceAmzDeno } from './dev';
import { getWorkPath } from './util';

export const version = 3;

export async function build(opts: BuildOptions) {
  const { files, entrypoint, workPath: wp, config, meta = {} } = opts;
  const workPath = getWorkPath(wp, entrypoint);
  await fs.mkdirp(workPath);
  if (meta.isDev) {
    debug('checking that deno is available');
    ensureDeno();
  }

  const lambdaFiles = await getDenoLambdaLayer(workPath);
  if (meta.isDev) {
    debug('symlinking local deno to replace amz-deno');
    await replaceAmzDeno(workPath);
  }

  debug('downloading source files');
  const downloadedFiles = await download(
    files,
    path.join(workPath, 'src'),
    meta
  );
  const entryPath = downloadedFiles[entrypoint].fsPath;

  await runUserScripts(entryPath);
  const extraFiles = await gatherExtraFiles(config.includeFiles, entryPath);

  return buildDenoLambda(
    opts,
    downloadedFiles,
    extraFiles,
    lambdaFiles,
    workPath
  );
}

async function buildDenoLambda(
  { entrypoint, config }: BuildOptions,
  downloadedFiles: DownloadedFiles,
  extraFiles: DownloadedFiles,
  layerFiles: Files,
  workPath: string
) {
  debug('building single file');
  const entrypointPath = downloadedFiles[entrypoint].fsPath;
  const entrypointDirname = path.dirname(entrypointPath);

  const extname = path.extname(entrypointPath);
  const binName = path.basename(entrypointPath).replace(extname, '');
  const binPath = path.join(workPath, binName) + '.bundle.js';

  const { debug: isDebug } = config;
  debug('running `deno bundle`...');
  try {
    await execa(
      path.join(workPath, 'layer', 'amz-deno'),
      ['bundle', entrypointPath, binPath].concat(isDebug ? ['-L debug'] : []),
      {
        env: {
          DENO_DIR: path.join(workPath, 'layer', '.deno_dir'),
        },
        cwd: entrypointDirname,
        stdio: 'pipe',
      }
    );
  } catch (err) {
    debug('failed to `deno bundle`');
    throw new Error(
      'Failed to run `deno bundle`: ' + err.stdout + ' ' + err.stderr
    );
  }

  const lambda = await createLambda({
    files: {
      ...extraFiles,
      ...layerFiles,
      [binName + '.bundle.js']: new FileFsRef({
        mode: 0o755,
        fsPath: binPath,
      }),
    },
    handler: binName + '.handler',
    runtime: 'provided',
    environment: {
      HANDLER_EXT: 'bundle.js',
    },
  });

  if (version === 3) {
    return { output: lambda };
  }

  return {
    [entrypoint]: lambda,
  };
}

async function getDenoLambdaLayer(workPath: string): Promise<Files> {
  const zipPath = path.join(workPath, 'deno-lambda-layer.zip');
  if (!(await pathExists(zipPath))) {
    debug('downloading deno-lambda-layer.zip');
    try {
      await execa(
        'curl',
        [
          '-o',
          zipPath,
          '-L',
          'https://github.com/hayd/deno-lambda/releases/latest/download/deno-lambda-layer.zip',
        ],
        {
          stdio: 'pipe',
        }
      );
    } catch (err) {
      debug('failed to download deno-lambda-layer');
      throw new Error(
        'Failed to download deno-lambda-layer.zip: ' +
          err.stdout +
          ' ' +
          err.stderr
      );
    }
  }

  const layerDir = path.join(workPath, 'layer');
  const bootstrapPath = path.join(layerDir, 'bootstrap');
  const amzDenoPath = path.join(layerDir, 'amz-deno');

  if (!(await pathExists(bootstrapPath)) || !(await pathExists(amzDenoPath))) {
    debug('unzipping `deno-lambda-layer.zip` into `layer`');
    try {
      await execa('unzip', [zipPath, '-d', layerDir], {
        stdio: 'ignore',
      });
    } catch (err) {
      debug('failed to unzip `deno-lambda-layer.zip` into `layer`');
      throw new Error(
        'Failed to unzip `deno-lambda-layer.zip` into `layer`: ' +
          err.stdout +
          ' ' +
          err.stderr
      );
    }
  }

  return {
    bootstrap: new FileFsRef({
      mode: 0o755,
      fsPath: bootstrapPath,
    }),
    'amz-deno': new FileFsRef({
      mode: 0o755,
      fsPath: amzDenoPath,
    }),
  };
}

async function runUserScripts(entrypoint: string) {
  const entryDir = path.dirname(entrypoint);
  const buildScriptPath = path.join(entryDir, 'build.sh');
  const buildScriptExists = await fs.pathExists(buildScriptPath);

  if (buildScriptExists) {
    console.log('running `build.sh`...');
    await runShellScript(buildScriptPath);
  }
}

async function gatherExtraFiles(
  globMatcher: string | string[] | undefined,
  entrypoint: string
) {
  if (!globMatcher) return {};

  console.log('gathering extra files for the fs...');

  const entryDir = path.dirname(entrypoint);

  if (Array.isArray(globMatcher)) {
    const allMatches = await Promise.all(
      globMatcher.map(pattern => glob(pattern, entryDir))
    );

    return allMatches.reduce((acc, matches) => ({ ...acc, ...matches }), {});
  }

  return glob(globMatcher, entryDir);
}
