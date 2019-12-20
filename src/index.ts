import fs from 'fs-extra';
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
} from '@now/build-utils';

export const version = process.env.RUNTIME_NAME ? 3 : 1;

export async function build(opts: BuildOptions) {
  if (version !== 3) {
    console.error('now-deno only supports v3 ZEIT Now builders');
    throw Error();
  }

  const lambdaFiles = await getDenoLambdaLayer(opts);

  const { files, entrypoint, workPath, config, meta = {} } = opts;
  console.log('downloading files');
  const downloadedFiles = await download(
    files,
    path.join(workPath, 'src'),
    meta
  );
  const entryPath = downloadedFiles[entrypoint].fsPath;

  await runUserScripts(entryPath);
  const extraFiles = await gatherExtraFiles(config.includeFiles, entryPath);

  return buildDenoLambda(opts, downloadedFiles, extraFiles, lambdaFiles);
}

async function buildDenoLambda(
  { workPath, entrypoint, config }: BuildOptions,
  downloadedFiles: DownloadedFiles,
  extraFiles: DownloadedFiles,
  layerFiles: Files
) {
  console.log('building single file');
  const entrypointPath = downloadedFiles[entrypoint].fsPath;
  const entrypointDirname = path.dirname(entrypointPath);

  const binName = path.basename(entrypointPath);
  const binPath = path.join(workPath, binName);

  const { debug } = config;
  console.log('running `deno bundle`...');
  try {
    await execa(
      path.join(workPath, 'layer', 'amz-deno'),
      ['bundle', entrypointPath, binPath].concat(debug ? ['-L debug'] : []),
      {
        env: {
          DENO_DIR: path.join(workPath, 'layer', '.deno_dir'),
        },
        cwd: entrypointDirname,
        stdio: 'inherit',
      }
    );
  } catch (err) {
    console.error('failed to `deno build`');
    throw err;
  }

  const extname = path.extname(entrypointPath);
  const lambda = await createLambda({
    files: {
      ...extraFiles,
      ...layerFiles,
      [binName]: new FileFsRef({
        mode: 0o755,
        fsPath: binPath,
      }),
    },
    handler: binName.replace(extname, '.handler'),
    runtime: 'provided',
  });

  console.log(lambda);

  if (version === 3) {
    return { output: lambda };
  }

  return {
    [entrypoint]: lambda,
  };
}

async function getDenoLambdaLayer({ workPath }: BuildOptions): Promise<Files> {
  const zipPath = path.join(workPath, 'deno-lambda-layer.zip');
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
        stdio: 'inherit',
      }
    );
  } catch (err) {
    console.error('failed to download `deno-lambda-layer.zip`');
    throw err;
  }

  const layerDir = path.join(workPath, 'layer');
  try {
    await execa('unzip', [zipPath, '-d', layerDir], {
      stdio: 'inherit',
    });
  } catch (err) {
    console.error('failed to unzip `deno-lambda-layer.zip` into `layer`');
    throw err;
  }

  return {
    bootstrap: new FileFsRef({
      mode: 0o755,
      fsPath: path.join(layerDir, 'bootstrap'),
    }),
    'amz-deno': new FileFsRef({
      mode: 0o755,
      fsPath: path.join(layerDir, 'amz-deno'),
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
