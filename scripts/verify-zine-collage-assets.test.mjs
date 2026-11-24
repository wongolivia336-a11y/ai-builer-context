import assert from 'node:assert/strict';
import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import test from 'node:test';
import { validateZineCollageAssets } from './verify-zine-collage-assets.mjs';
import { ZINE_COLLAGE_ASSETS } from '../src/zine/scrapbook-assets.js';
import { PAGE_LAYOUTS } from '../src/zine/page-art.js';

async function makeFixture() {
  const root = await mkdtemp(join(tmpdir(), 'zine-collage-assets-'));
  const publicDirectory = join(root, 'public');
  await mkdir(join(publicDirectory, 'zine', 'assets', 'scrapbook'), { recursive: true });
  await writeFile(join(publicDirectory, 'zine', 'assets', 'scrapbook', 'city.webp'), Buffer.from('image-one'));
  await writeFile(join(publicDirectory, 'zine', 'assets', 'scrapbook', 'park.webp'), Buffer.from('image-two'));
  const assets = [
    { id: 'city-night', src: '/zine/assets/scrapbook/city.webp', alt: '城市夜色' },
    { id: 'park-trees', src: '/zine/assets/scrapbook/park.webp', alt: '树下的公园' },
  ];
  return { root, publicDirectory, assets, referencedAssetKeys: ['city-night', 'park-trees'] };
}

test('accepts unique local assets when every referenced key has a file', async () => {
  const fixture = await makeFixture();
  try {
    assert.deepEqual(await validateZineCollageAssets(fixture), []);
  } finally {
    await rm(fixture.root, { recursive: true, force: true });
  }
});

test('rejects duplicate IDs, missing references, path traversal, and missing files', async () => {
  const fixture = await makeFixture();
  try {
    fixture.assets.push({ id: 'city-night', src: '/zine/assets/scrapbook/park.webp', alt: '重复 ID' });
    fixture.assets.push({ id: 'escape', src: '/zine/assets/scrapbook/../../../outside.webp', alt: '越界' });
    fixture.assets.push({ id: 'missing-file', src: '/zine/assets/scrapbook/missing.webp', alt: '缺失' });
    fixture.referencedAssetKeys.push('unknown-reference');
    const errors = (await validateZineCollageAssets(fixture)).join('\n');
    assert.match(errors, /duplicate asset ID: city-night/i);
    assert.match(errors, /unknown referenced asset: unknown-reference/i);
    assert.match(errors, /path escapes scrapbook directory/i);
    assert.match(errors, /missing collage image/i);
  } finally {
    await rm(fixture.root, { recursive: true, force: true });
  }
});

test('rejects oversized optimized image files', async () => {
  const fixture = await makeFixture();
  try {
    await writeFile(join(fixture.publicDirectory, 'zine', 'assets', 'scrapbook', 'park.webp'), Buffer.alloc(600 * 1024 + 1));
    assert.match((await validateZineCollageAssets(fixture)).join('\n'), /exceeds 600 KB/i);
  } finally {
    await rm(fixture.root, { recursive: true, force: true });
  }
});

test('keeps the ten-page scrapbook feature rhythm and resolves every image reference', async () => {
  assert.equal(PAGE_LAYOUTS.length, 10);
  assert.equal(PAGE_LAYOUTS[2].feature.type, 'photo-clock');
  const clock = PAGE_LAYOUTS[2].feature;
  const clockPhotoCenterSpacing = 2 * clock.radius * Math.sin(Math.PI / clock.assetIds.length);
  assert.ok(clock.photoSize >= clockPhotoCenterSpacing, 'clock photo masks should meet or overlap around the ring');
  assert.equal(PAGE_LAYOUTS[5].feature.type, 'contact-sheet');
  assert.equal(PAGE_LAYOUTS[7].feature.type, 'paired-time');
  assert.deepEqual(PAGE_LAYOUTS[2].feature.assetIds.length, 8);
  assert.equal(PAGE_LAYOUTS[5].feature.assetIds.length, 6);
  assert.ok(PAGE_LAYOUTS[5].feature.cellWidth >= 290);
  assert.ok(PAGE_LAYOUTS[5].body.y <= 1100, 'the contact sheet should not leave a large gap above the story');
  assert.ok(PAGE_LAYOUTS[7].feature.details.length >= 3, 'the time spread should layer in close-up photos');

  const referencedAssetKeys = PAGE_LAYOUTS.flatMap((layout) => [
    ...(layout.feature?.assetIds || []),
    ...(layout.feature?.items || []).map((item) => item.assetId),
    ...(layout.feature?.details || []).map((item) => item.assetId),
    ...(layout.decorations || []).map((item) => item.assetId),
  ]);
  assert.ok(referencedAssetKeys.includes('handdrawn-ginkgo'));
  assert.ok(referencedAssetKeys.includes('handdrawn-sparrow'));
  assert.ok(referencedAssetKeys.includes('handdrawn-rain'));
  assert.deepEqual(await validateZineCollageAssets({
    assets: ZINE_COLLAGE_ASSETS,
    referencedAssetKeys,
    publicDirectory: fileURLToPath(new URL('../public/', import.meta.url)),
  }), []);
});
