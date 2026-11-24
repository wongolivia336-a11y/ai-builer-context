import { readdir, stat } from 'node:fs/promises';
import { dirname, isAbsolute, relative, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptDirectory = dirname(fileURLToPath(import.meta.url));
const repositoryRoot = resolve(scriptDirectory, '..');
const publicDirectory = resolve(repositoryRoot, 'public');
const scrapbookDirectory = resolve(publicDirectory, 'zine', 'assets', 'scrapbook');
const SCRAPBOOK_PREFIX = '/zine/assets/scrapbook/';
const MAX_IMAGE_BYTES = 600 * 1024;

export async function validateZineCollageAssets({ assets, referencedAssetKeys = [], publicDirectory: assetRoot }) {
  const errors = [];
  const ids = new Set();
  const availableIds = new Set();
  const allowedRoot = resolve(assetRoot, 'zine', 'assets', 'scrapbook');

  if (!Array.isArray(assets)) return ['collage assets must be an array'];

  for (const asset of assets) {
    if (!asset?.id?.trim()) {
      errors.push('collage asset is missing an ID');
      continue;
    }
    if (ids.has(asset.id)) errors.push(`duplicate asset ID: ${asset.id}`);
    ids.add(asset.id);
    availableIds.add(asset.id);

    if (!asset.alt?.trim()) errors.push(`missing alt text: ${asset.id}`);
    if (typeof asset.src !== 'string' || !asset.src.startsWith(SCRAPBOOK_PREFIX)) {
      errors.push(`image must use a local scrapbook path: ${asset.id}`);
      continue;
    }

    const pathPart = asset.src.split(/[?#]/u, 1)[0];
    if (pathPart.includes('\\') || pathPart.split('/').includes('..') || /%2e/i.test(pathPart)) {
      errors.push(`path escapes scrapbook directory: ${asset.id}`);
      continue;
    }

    const imagePath = resolve(assetRoot, `.${pathPart}`);
    const pathFromScrapbook = relative(allowedRoot, imagePath);
    if (isAbsolute(pathFromScrapbook) || pathFromScrapbook === '..' || pathFromScrapbook.startsWith(`..${sep}`)) {
      errors.push(`path escapes scrapbook directory: ${asset.id}`);
      continue;
    }

    try {
      const info = await stat(imagePath);
      if (!info.isFile()) {
        errors.push(`collage image is not a file: ${asset.id}`);
      } else if (info.size <= 0) {
        errors.push(`collage image is empty: ${asset.id}`);
      } else if (info.size > MAX_IMAGE_BYTES) {
        errors.push(`collage image exceeds 600 KB: ${asset.id} (${info.size} bytes)`);
      }
    } catch {
      errors.push(`missing collage image: ${asset.id} (${asset.src})`);
    }
  }

  for (const key of referencedAssetKeys) {
    if (!availableIds.has(key)) errors.push(`unknown referenced asset: ${key}`);
  }

  return errors;
}

async function run() {
  const [{ ZINE_COLLAGE_ASSETS }, { PAGE_LAYOUTS }] = await Promise.all([
    import('../src/zine/scrapbook-assets.js'),
    import('../src/zine/page-art.js'),
  ]);
  const referencedAssetKeys = PAGE_LAYOUTS.flatMap((layout) => [
    ...(layout.feature?.assetIds || []),
    ...(layout.feature?.items || []).map((item) => item.assetId),
    ...(layout.feature?.details || []).map((item) => item.assetId),
    ...(layout.decorations || []).map((item) => item.assetId),
  ]);
  const errors = await validateZineCollageAssets({
    assets: ZINE_COLLAGE_ASSETS,
    referencedAssetKeys,
    publicDirectory,
  });
  const files = await readdir(scrapbookDirectory);
  const knownPaths = new Set(ZINE_COLLAGE_ASSETS.map((asset) => asset.src.split('/').at(-1)));
  for (const name of files) {
    if (!knownPaths.has(name)) errors.push(`unregistered scrapbook file: ${name}`);
  }

  if (errors.length) {
    console.error(errors.map((error) => `✗ ${error}`).join('\n'));
    process.exitCode = 1;
    return;
  }

  console.log(`Verified ${ZINE_COLLAGE_ASSETS.length} local Zine collage assets (${files.length} files: 11 photos and 3 hand-drawn PNGs).`);
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  run().catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
}
