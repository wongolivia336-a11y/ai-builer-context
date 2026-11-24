import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { mkdtemp, mkdir, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import test from 'node:test';
import { validateSoundOrbitAudio } from './verify-sound-orbit-audio.mjs';

const hash = (value) => createHash('sha256').update(value).digest('hex');

async function fixture() {
  const root = await mkdtemp(join(tmpdir(), 'sound-orbit-check-'));
  const publicDirectory = join(root, 'public');
  const firstBytes = Buffer.from('real audio one');
  const secondBytes = Buffer.from('real audio two');
  await mkdir(join(publicDirectory, 'zine', 'audio'), { recursive: true });
  await writeFile(join(publicDirectory, 'zine', 'audio', 'one.mp3'), firstBytes);
  await writeFile(join(publicDirectory, 'zine', 'audio', 'two.mp3'), secondBytes);
  const tracks = {
    meadow: { trackId: 'meadow-wind', src: '/zine/audio/one.mp3', label: '草坡风声' },
    orchard: { trackId: 'orchard-birds', src: '/zine/audio/two.mp3', label: '果园鸟鸣' },
  };
  const sharedProvenance = {
    sourceUrl: 'https://example.org/source',
    sourceFile: 'source.ogg',
    creator: 'Test creator',
    license: 'CC0',
    licenseUrl: 'https://example.org/license',
    downloadDate: '2026-11-24',
    sourceSha256: hash(Buffer.from('source file')),
    sourceDurationSeconds: 30,
    durationSeconds: 30,
    sizeBytes: firstBytes.length,
    downloadDate: '2026-11-24',
    reviewStatus: 'local-preview',
    levelAudit: { integratedLufs: -20, truePeakDbfs: -3, analyzer: 'FFmpeg ebur128=peak=true' },
  };
  const provenance = [
    { ...sharedProvenance, sceneId: 'meadow', trackId: 'meadow-wind', src: tracks.meadow.src, processedSha256: hash(firstBytes) },
    { ...sharedProvenance, sceneId: 'orchard', trackId: 'orchard-birds', src: tracks.orchard.src, processedSha256: hash(secondBytes) },
  ];
  return { root, publicDirectory, sceneIds: ['meadow', 'orchard'], tracks, provenance };
}

test('accepts complete, unique, hashed scene-keyed audio', async () => {
  const data = await fixture();
  try {
    assert.deepEqual(await validateSoundOrbitAudio(data), []);
  } finally {
    await rm(data.root, { recursive: true, force: true });
  }
});

test('rejects a missing scene mapping', async () => {
  const data = await fixture();
  try {
    delete data.tracks.orchard;
    assert.match((await validateSoundOrbitAudio(data)).join('\n'), /missing scene mapping: orchard/i);
  } finally {
    await rm(data.root, { recursive: true, force: true });
  }
});

test('rejects duplicate track IDs', async () => {
  const data = await fixture();
  try {
    data.tracks.orchard.trackId = data.tracks.meadow.trackId;
    assert.match((await validateSoundOrbitAudio(data)).join('\n'), /duplicate trackId/i);
  } finally {
    await rm(data.root, { recursive: true, force: true });
  }
});

test('rejects missing files and processed hash mismatches', async () => {
  const data = await fixture();
  try {
    data.tracks.orchard.src = '/zine/audio/removed.mp3';
    data.provenance[0].processedSha256 = '0'.repeat(64);
    const errors = (await validateSoundOrbitAudio(data)).join('\n');
    assert.match(errors, /missing audio file/i);
    assert.match(errors, /processed hash mismatch/i);
  } finally {
    await rm(data.root, { recursive: true, force: true });
  }
});

test('rejects composite sources without independent source hashes', async () => {
  const data = await fixture();
  try {
    data.provenance[0].additionalSources = [{
      sourceUrl: 'https://example.org/bed',
      sourceFile: 'bed.wav',
      creator: 'Ambient Author',
      license: 'CC BY 4.0',
      licenseUrl: 'https://creativecommons.org/licenses/by/4.0/',
      downloadDate: '2026-11-24',
      sourceDurationSeconds: 12,
    }];
    assert.match((await validateSoundOrbitAudio(data)).join('\n'), /invalid source SHA-256: meadow \(additional 1\)/i);
  } finally {
    await rm(data.root, { recursive: true, force: true });
  }
});

test('rejects near-silent tracks based on their measured integrated loudness', async () => {
  const data = await fixture();
  try {
    data.provenance[0].levelAudit = {
      integratedLufs: -91,
      truePeakDbfs: -69.5,
      analyzer: 'FFmpeg ebur128=peak=true',
    };
    assert.match((await validateSoundOrbitAudio(data)).join('\n'), /integrated loudness is outside -24 to -16 LUFS/i);
  } finally {
    await rm(data.root, { recursive: true, force: true });
  }
});
