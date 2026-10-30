import { z } from 'zod';

export interface CutItem {
    index: number;
    srcId: string;
    file: string;
    srcStartFrame: number;
    srcEndFrame: number;
    timelineFrom: number;
    durationFrames: number;
    focusX?: number;
    focusY?: number;
    label?: string;
}
export interface CutsManifest {
    fps: number;
    sampleRate: number;
    crossfadeMs: number;
    brollStartFrame: number;
    brollStartSec: number;
    totalFrames: number;
    totalSec: number;
    cuts: CutItem[];
}

export interface VoiceoverSegment {
    index: number;
    sourceId: string;
    mode: 'intro_showcase' | 'intro_speaker' | 'unboxing_broll';
    speakerVideo: string;
    srcStartFrame: number;
    srcEndFrame: number;
    timelineFromFrame: number;
    speechDurationFrames: number;
    pauseAfterFrames: number;
    durationFrames: number;
    label: string;
}

export interface CaptionWord {
    word: string;
    startFrame: number;
    endFrame: number;
    emphasis: boolean;
}

export interface UxCaption {
    index: number;
    text: string;
    fromFrame: number;
    toFrame: number;
    startSec: number;
    endSec: number;
    wordCount: number;
    words?: CaptionWord[];
}

export interface DuckingRegion {
    fromFrame: number;
    toFrame: number;
    duckDb: number;
    attackMs: number;
    releaseMs: number;
}

export interface VoiceoverManifest {
    fps: number;
    sampleRate: number;
    totalFrames: number;
    totalSec: number;
    introEndFrame: number;
    introEndSec: number;
    hookDurationSec: number;
    hookDurationFrames: number;
    hookTitle: {
        line1: string;
        line2: string;
    };
    voiceoverAudioFile: string;
    asmrAudioFile: string;
    bgMusicFile?: string;
    sfxFile?: string;
    segments: VoiceoverSegment[];
    duckingRegions: DuckingRegion[];
    captions: UxCaption[];
}

export const asmrBoxSchema = z.object({
    /** Duration of initial yellow hook title banner in seconds (default 3.8s). */
    hookDurationSec: z.number().min(0).max(10),
    /** Colin & Samir style large yellow hook title lines (00:00 - 00:03.8). */
    hookLine1: z.string(),
    hookLine2: z.string(),
    hookBannerY: z.number(),
    /** White UX/UI subtitle Y position inside mobile safe-zone (1250 - 1450px). */
    captionY: z.number(),
    asmrAudioFile: z.string(),
    voiceoverAudioFile: z.string(),
    bgMusicFile: z.string(),
    sfxFile: z.string(),
    asmrBaseVolume: z.number().min(0).max(1.5),
    voiceoverVolume: z.number().min(0).max(1.5),
    bgMusicVolume: z.number().min(0).max(1.0),
    sfxVolume: z.number().min(0).max(1.0),
    /** Ducking attenuation in dB when speaker is talking (-11 to -13 dB). */
    duckDb: z.number().min(-24).max(0),
    /** Intro speaker crop alignment (0..1) so face + mic stay centered in bottom frame. */
    speakerFocusX: z.number().min(0).max(1),
    speakerFocusY: z.number().min(0).max(1),
});
export type AsmrBoxProps = z.infer<typeof asmrBoxSchema>;
