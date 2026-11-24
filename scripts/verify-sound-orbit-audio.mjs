import { createHash } from 'node:crypto';
import { readFile, stat } from 'node:fs/promises';
import { dirname, isAbsolute, relative, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptDirectory = dirname(fileURLToPath(import.meta.url));
const repositoryRoot = resolve(scriptDirectory, '..');
const publicDirectory = resolve(repositoryRoot, 'public');

export async function validateSoundOrbitAudio({ sceneIds, tracks, provenance, publicDirectory: assetRoot }) {
  const errors = [];
  const expectedIds = new Set(sceneIds);
  const trackEntries = Object.entries(tracks);
  const provenanceByScene = new Map();
  const usedTrackIds = new Set();
  let combinedBytes = 0;

  for (const sceneId of sceneIds) {
    if (!tracks[sceneId]) errors.push(`missing scene mapping: ${sceneId}`);
  }
  for (const sceneId of Object.keys(tracks)) {
    if (!expectedIds.has(sceneId)) errors.push(`unknown scene mapping: ${sceneId}`);
  }

  for (const row of provenance) {
    if (provenanceByScene.has(row.sceneId)) errors.push(`duplicate provenance row: ${row.sceneId}`);
    provenanceByScene.set(row.sceneId, row);
  }
  for (const sceneId of sceneIds) {
    if (!provenanceByScene.has(sceneId)) errors.push(`missing provenance row: ${sceneId}`);
  }
  for (const sceneId of provenanceByScene.keys()) {
    if (!expectedIds.has(sceneId)) errors.push(`unknown provenance scene: ${sceneId}`);
  }

  for (const [sceneId, track] of trackEntries) {
    if (!track.trackId || usedTrackIds.has(track.trackId)) {
      errors.push(`duplicate trackId or empty trackId: ${track.trackId || sceneId}`);
    }
    usedTrackIds.add(track.trackId);
    if (!track.label?.trim()) errors.push(`missing track label: ${sceneId}`);
    if (!track.src?.startsWith('/zine/audio/')) {
      errors.push(`audio src must be a local /zine/audio/ path: ${sceneId}`);
      continue;
    }

    const audioPath = resolve(assetRoot, `.${track.src}`);
    const pathFromRoot = relative(resolve(assetRoot), audioPath);
    if (isAbsolute(pathFromRoot) || pathFromRoot === '..' || pathFromRoot.startsWith(`..${sep}`)) {
      errors.push(`audio src escapes public directory: ${sceneId}`);
      continue;
    }

    const row = provenanceByScene.get(sceneId);
    if (!row) continue;
    if (row.trackId !== track.trackId || row.src !== track.src) {
      errors.push(`manifest and provenance mismatch: ${sceneId}`);
    }
    const sources = [row, ...(row.additionalSources || [])];
    sources.forEach((source, sourceIndex) => {
      const sourceLabel = sourceIndex ? `${sceneId} (additional ${sourceIndex})` : sceneId;
      if (!source.sourceUrl || !source.sourceFile || !source.creator || !source.license || !source.licenseUrl) {
        errors.push(`incomplete source or license provenance: ${sourceLabel}`);
      }
      if (!/^\d{4}-\d{2}-\d{2}$/u.test(source.downloadDate || '')) {
        errors.push(`invalid source download date: ${sourceLabel}`);
      }
      if (!/^[a-f\d]{64}$/i.test(source.sourceSha256 || '')) {
        errors.push(`invalid source SHA-256: ${sourceLabel}`);
      }
      if (!Number.isFinite(source.sourceDurationSeconds) || source.sourceDurationSeconds <= 0) {
        errors.push(`invalid source duration: ${sourceLabel}`);
      }
    });
    if (!/^[a-f\d]{64}$/i.test(row.processedSha256 || '')) {
      errors.push(`invalid processed SHA-256: ${sceneId}`);
    }
    if (!Number.isFinite(row.sizeBytes) || row.sizeBytes <= 0) {
      errors.push(`invalid processed file size: ${sceneId}`);
    }
    if (!Number.isFinite(row.durationSeconds) || row.durationSeconds < 20 || row.durationSeconds > 45) {
      errors.push(`loop duration must be 20–45 seconds: ${sceneId}`);
    }
    if (!Number.isFinite(row.levelAudit?.integratedLufs) || !Number.isFinite(row.levelAudit?.truePeakDbfs)) {
      errors.push(`missing measured loudness audit: ${sceneId}`);
    } else {
      if (row.levelAudit.integratedLufs < -24 || row.levelAudit.integratedLufs > -16) {
        errors.push(`integrated loudness is outside -24 to -16 LUFS: ${sceneId} (${row.levelAudit.integratedLufs} LUFS)`);
      }
      if (row.levelAudit.truePeakDbfs > -1) {
        errors.push(`true peak exceeds -1 dBFS: ${sceneId} (${row.levelAudit.truePeakDbfs} dBFS)`);
      }
    }
    if (row.reviewStatus !== 'local-preview') {
      errors.push(`review status must remain local-preview until user approval: ${sceneId}`);
    }

    try {
      const [bytes, fileInfo] = await Promise.all([readFile(audioPath), stat(audioPath)]);
      combinedBytes += fileInfo.size;
      const actualHash = createHash('sha256').update(bytes).digest('hex');
      if (actualHash !== row.processedSha256.toLowerCase()) {
        errors.push(`processed hash mismatch: ${sceneId}`);
      }
      if (fileInfo.size !== row.sizeBytes) {
        errors.push(`processed file size mismatch: ${sceneId}`);
      }
    } catch {
      errors.push(`missing audio file: ${sceneId} (${track.src})`);
    }
  }

  if (combinedBytes > 6 * 1024 * 1024) errors.push(`audio bundle exceeds 6 MB: ${combinedBytes} bytes`);
  return errors;
}

async function run() {
  const [{ BUBBLE_SCENES }, { SOUND_ORBIT_TRACKS }] = await Promise.all([
    import('../src/zine/bubble-scenes.js'),
    import('../src/zine/sound-orbit-tracks.js'),
  ]);
  const provenancePath = resolve(publicDirectory, 'zine/audio/provenance.json');
  const provenance = JSON.parse(await readFile(provenancePath, 'utf8'));
  const errors = await validateSoundOrbitAudio({
    sceneIds: BUBBLE_SCENES.map((scene) => scene.id),
    tracks: SOUND_ORBIT_TRACKS,
    provenance,
    publicDirectory,
  });

  if (errors.length) {
    console.error(errors.map((error) => `✗ ${error}`).join('\n'));
    process.exitCode = 1;
    return;
  }

  let totalBytes = 0;
  for (const track of Object.values(SOUND_ORBIT_TRACKS)) {
    totalBytes += (await stat(resolve(publicDirectory, `.${track.src}`))).size;
  }
  console.log(`Verified ${BUBBLE_SCENES.length} scene-keyed recordings; ${totalBytes} bytes total; processed files match their recorded SHA-256 hashes. Source hashes are recorded from download time; original source files are not bundled.`);
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  run().catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
}
