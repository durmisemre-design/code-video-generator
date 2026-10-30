import cutsJson from '../data/cuts-manifest.json';
import voJson from '../data/voiceover-manifest.json';
import type { CutsManifest, DuckingRegion, VoiceoverManifest } from './types';

export const CUTS_MANIFEST = cutsJson as unknown as CutsManifest;
export const VOICEOVER_MANIFEST = voJson as unknown as VoiceoverManifest;

export const ASMR_FPS = VOICEOVER_MANIFEST.fps;
export const ASMR_TOTAL_FRAMES = VOICEOVER_MANIFEST.totalFrames;
export const ASMR_HOOK_FRAMES = 156; // 2.60s tactile lid snap teaser (starts as lid closes, snap at 0.87s/frame 52, DJI logo held until frame 156)

/**
 * Envelope Sidechain Ducking gain computer at frame `f`:
 * - When speaker is talking (including 50ms lookahead already baked into duckingRegions.fromFrame):
 *   smoothly attenuates ASMR to `duckDb` (e.g. -12 dB, ~0.251 linear).
 * - In >=200ms pauses / ASMR showcase moments:
 *   smoothly swells ASMR back to 0 dB (1.0 linear, full power!).
 */
export const computeAsmrSidechainVolume = (
    frame: number,
    fps: number,
    regions: DuckingRegion[],
    baseVolume: number,
    overrideDuckDb?: number
): number => {
    let minGain = 1.0;
    for (const r of regions) {
        const targetDb = overrideDuckDb ?? r.duckDb;
        const targetGain = Math.pow(10, targetDb / 20);
        const attackFrames = Math.max(1, Math.round((r.attackMs / 1000) * fps));   // 50ms = 3 frames
        const releaseFrames = Math.max(1, Math.round((r.releaseMs / 1000) * fps)); // 140ms = 8 frames

        if (frame >= r.fromFrame - attackFrames && frame <= r.toFrame + releaseFrames) {
            let g = 1.0;
            if (frame < r.fromFrame) {
                // Smooth cosine lookahead attack ramp down to targetGain
                const u = (frame - (r.fromFrame - attackFrames)) / attackFrames;
                const s = 0.5 - 0.5 * Math.cos(Math.PI * Math.max(0, Math.min(1, u)));
                g = 1.0 - s * (1.0 - targetGain);
            } else if (frame <= r.toFrame) {
                g = targetGain;
            } else {
                // Smooth cosine release swell back to 0 dB (full ASMR showcase)
                const u = (frame - r.toFrame) / releaseFrames;
                const s = 0.5 - 0.5 * Math.cos(Math.PI * Math.max(0, Math.min(1, u)));
                g = targetGain + s * (1.0 - targetGain);
            }
            if (g < minGain) minGain = g;
        }
    }
    return baseVolume * minGain;
};
