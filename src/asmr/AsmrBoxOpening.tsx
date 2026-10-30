import React from 'react';
import {
    AbsoluteFill,
    Audio,
    Easing,
    Img,
    OffthreadVideo,
    Sequence,
    interpolate,
    staticFile,
    useCurrentFrame,
    useVideoConfig,
} from 'remotion';
import { CUTS_MANIFEST, VOICEOVER_MANIFEST, ASMR_HOOK_FRAMES, computeAsmrSidechainVolume } from './timeline';
import type { AsmrBoxProps, CutItem } from './types';

const FONT_STACK = '"Plus Jakarta Sans", "SF Pro Display", -apple-system, BlinkMacSystemFont, sans-serif';

/**
 * High-Impact Editorial Stepped Yellow Hook Banner (00:00 - 00:05.2):
 * - Snappy After Effects punchy spring entrance (0.86 -> 1.05 -> 1.0, NO BLUR)
 * - Ultra-bold Black typography (900 weight, tight -0.04em tracking) on rich vibrant yellow (#FFDE00)
 * - Clean crisp drop shadow, positioned with balanced breathing room
 */
const HookTitleBanner: React.FC<{
    line1: string;
    line2: string;
    topY: number;
    durationFrames: number;
}> = ({ line1, line2, topY, durationFrames }) => {
    const frame = useCurrentFrame();
    if (frame >= durationFrames) return null;

    // Snappy After Effects style spring overshoot (0.86 -> 1.05 -> 1.0 over 12 frames)
    const enterProgress = interpolate(frame, [0, 8, 14], [0.86, 1.045, 1.0], {
        extrapolateLeft: 'clamp',
        extrapolateRight: 'clamp',
        easing: Easing.bezier(0.16, 1, 0.3, 1),
    });
    const enterOpacity = interpolate(frame, [0, 4], [0, 1], {
        extrapolateLeft: 'clamp',
        extrapolateRight: 'clamp',
    });
    const exitProgress = interpolate(frame, [durationFrames - 8, durationFrames], [0, 1], {
        extrapolateLeft: 'clamp',
        extrapolateRight: 'clamp',
        easing: Easing.in(Easing.cubic),
    });

    const scale = enterProgress * (1 - 0.04 * exitProgress);
    const opacity = enterOpacity * (1 - exitProgress);
    const translateY = -10 * exitProgress;

    const commonBoxStyle: React.CSSProperties = {
        display: 'inline-block',
        backgroundColor: '#FFDE00',
        color: '#000000',
        fontFamily: FONT_STACK,
        fontWeight: 900,
        letterSpacing: '-0.04em',
        lineHeight: 1.06,
        borderRadius: 4,
        whiteSpace: 'nowrap',
        textAlign: 'center',
        boxShadow: '0 16px 44px rgba(0, 0, 0, 0.65)',
    };

    return (
        <div
            style={{
                position: 'absolute',
                left: 32,
                right: 32,
                top: topY,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 0,
                opacity,
                transform: `translateY(${translateY.toFixed(2)}px) scale(${scale.toFixed(4)})`,
                pointerEvents: 'none',
                zIndex: 35,
            }}
        >
            <span
                style={{
                    ...commonBoxStyle,
                    fontSize: 74,
                    padding: '14px 34px 12px 34px',
                }}
            >
                {line1}
            </span>
            <span
                style={{
                    ...commonBoxStyle,
                    fontSize: 62,
                    padding: '10px 30px 12px 30px',
                    marginTop: -2,
                }}
            >
                {line2}
            </span>
        </div>
    );
};

/**
 * Clean Editorial Top Showcase Area (0..850px) during the Intro (00:00 .. 00:22.80):
 * Displays 'public/dji 3.png', 'public/dji mini 2.png', and silent box preview B-roll
 * cleanly without cheesy AI badges or colored outlines.
 */
const IntroTopShowcase: React.FC<{ introEndFrame: number }> = ({ introEndFrame }) => {
    const frame = useCurrentFrame();
    if (frame >= introEndFrame) return null;

    const renderScene = () => {
        // 0 .. 156 (0.0s .. 2.6s): "DJI 3'e iki katı para vermeden..."
        if (frame < 156) {
            const p = interpolate(frame, [0, 10], [0, 1], { extrapolateRight: 'clamp', easing: Easing.out(Easing.cubic) });
            const drift = interpolate(frame, [0, 156], [1, 1.03], { extrapolateRight: 'clamp' });
            return (
                <div
                    style={{
                        width: '100%',
                        height: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: '48px 40px 72px 40px',
                        boxSizing: 'border-box',
                        opacity: p,
                    }}
                >
                    <div
                        style={{
                            width: '100%',
                            height: '100%',
                            backgroundColor: '#FFFFFF',
                            borderRadius: 24,
                            overflow: 'hidden',
                            boxShadow: '0 24px 60px rgba(0,0,0,0.55)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                        }}
                    >
                        <Img
                            src={staticFile('dji 3.png')}
                            style={{
                                width: '92%',
                                height: '92%',
                                objectFit: 'contain',
                                transform: `scale(${drift.toFixed(4)})`,
                            }}
                        />
                    </div>
                </div>
            );
        }

        // 156 .. 312 (2.6s .. 5.2s): "...önce kesinlikle bu videoyu izlemelisin."
        if (frame < 312) {
            const local = frame - 156;
            const p = interpolate(local, [0, 10], [0, 1], { extrapolateRight: 'clamp', easing: Easing.out(Easing.cubic) });
            return (
                <div
                    style={{
                        width: '100%',
                        height: '100%',
                        display: 'flex',
                        flexDirection: 'row',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: 22,
                        padding: '50px 32px 74px 32px',
                        boxSizing: 'border-box',
                        opacity: p,
                        transform: `translateY(${((1 - p) * 14).toFixed(2)}px)`,
                    }}
                >
                    <div
                        style={{
                            flex: 1,
                            height: '100%',
                            backgroundColor: '#FFFFFF',
                            borderRadius: 22,
                            overflow: 'hidden',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            boxShadow: '0 20px 48px rgba(0,0,0,0.45)',
                        }}
                    >
                        <Img
                            src={staticFile('dji 3.png')}
                            style={{ width: '94%', height: '88%', objectFit: 'contain' }}
                        />
                    </div>
                    <div
                        style={{
                            flex: 1,
                            height: '100%',
                            backgroundColor: '#FFFFFF',
                            borderRadius: 22,
                            overflow: 'hidden',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            boxShadow: '0 20px 48px rgba(0,0,0,0.45)',
                        }}
                    >
                        <Img
                            src={staticFile('dji mini 2.png')}
                            style={{ width: '94%', height: '88%', objectFit: 'contain' }}
                        />
                    </div>
                </div>
            );
        }

        // 312 .. 588 (5.2s .. 9.8s): "Şu an elimde gördüğünüz bu cihaz DJI serisinin Mini 2'si..."
        if (frame < 588) {
            const local = frame - 312;
            const p = interpolate(local, [0, 10], [0, 1], { extrapolateRight: 'clamp', easing: Easing.out(Easing.cubic) });
            const drift = interpolate(local, [0, 276], [1, 1.03], { extrapolateRight: 'clamp' });
            return (
                <div
                    style={{
                        width: '100%',
                        height: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: '44px 36px 44px 36px',
                        boxSizing: 'border-box',
                        opacity: p,
                        transform: `scale(${(0.96 + 0.04 * p).toFixed(4)})`,
                    }}
                >
                    <div
                        style={{
                            width: '100%',
                            height: '100%',
                            backgroundColor: '#FFFFFF',
                            borderRadius: 24,
                            overflow: 'hidden',
                            boxShadow: '0 24px 60px rgba(0,0,0,0.55)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                        }}
                    >
                        <Img
                            src={staticFile('dji mini 2.png')}
                            style={{
                                width: '94%',
                                height: '92%',
                                objectFit: 'contain',
                                transform: `scale(${drift.toFixed(4)})`,
                            }}
                        />
                    </div>
                </div>
            );
        }

        // 588 .. 948 (9.8s .. 15.8s): "...ve DJI 3'e göre yarı fiyatına. Finlandiya'da yaklaşık 109 Euro'ya aldım..."
        if (frame < 948) {
            const local = frame - 588;
            const p = interpolate(local, [0, 10], [0, 1], { extrapolateRight: 'clamp', easing: Easing.out(Easing.cubic) });
            return (
                <div
                    style={{
                        width: '100%',
                        height: '100%',
                        display: 'flex',
                        flexDirection: 'row',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: 22,
                        padding: '44px 32px 44px 32px',
                        boxSizing: 'border-box',
                        opacity: p,
                        transform: `scale(${(0.96 + 0.04 * p).toFixed(4)})`,
                    }}
                >
                    <div
                        style={{
                            flex: 1.15,
                            height: '100%',
                            backgroundColor: '#FFFFFF',
                            borderRadius: 22,
                            overflow: 'hidden',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            boxShadow: '0 24px 54px rgba(0,0,0,0.5)',
                        }}
                    >
                        <Img
                            src={staticFile('dji mini 2.png')}
                            style={{ width: '95%', height: '88%', objectFit: 'contain' }}
                        />
                    </div>
                    <div
                        style={{
                            flex: 0.88,
                            height: '90%',
                            backgroundColor: '#FFFFFF',
                            borderRadius: 22,
                            overflow: 'hidden',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            opacity: 0.78,
                            boxShadow: '0 16px 36px rgba(0,0,0,0.35)',
                        }}
                    >
                        <Img
                            src={staticFile('dji 3.png')}
                            style={{ width: '92%', height: '84%', objectFit: 'contain' }}
                        />
                    </div>
                </div>
            );
        }

        // 948 .. 1368: "...ve videoda kutu açılımını yaptım. Kutudan neler çıktığını sizinle paylaşmak istiyorum. Videoya geçelim."
        const local = frame - 948;
        const p = interpolate(local, [0, 10], [0, 1], { extrapolateRight: 'clamp', easing: Easing.out(Easing.cubic) });
        return (
            <div
                style={{
                    width: '100%',
                    height: '100%',
                    position: 'relative',
                    overflow: 'hidden',
                    opacity: p,
                }}
            >
                <Sequence from={948} durationInFrames={introEndFrame - 948} premountFor={30} layout="none">
                    <OffthreadVideo
                        src={staticFile('clips/intro_teaser.mp4')}
                        startFrom={0}
                        muted
                        style={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover',
                            objectPosition: '50% 52%',
                            filter: 'contrast(1.04) brightness(1.02) saturate(1.05)',
                        }}
                    />
                </Sequence>
            </div>
        );
    };

    return (
        <div
            style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: 1080,
                height: 850,
                background: 'radial-gradient(circle at 50% 45%, #182232 0%, #090D16 100%)',
                overflow: 'hidden',
                zIndex: 18,
            }}
        >
            {renderScene()}
        </div>
    );
};

/**
 * Tok, Crisp, Solid Pure White Kinetic Subtitles:
 * - 100% PURE SOLID WHITE (#FFFFFF) across all words — no weird colors!
 * - ZERO BLUR, ZERO OUTLINE/STROKE — solid, crisp, heavy typographic feel (900 Black weight)
 * - Rock-solid typographic layout: All words in the phrase are rendered in-place so words
 *   NEVER jump horizontally or bounce across the screen.
 * - Continuous smooth speech: ZERO black-out dips between consecutive phrases!
 *   Subtitles transition cleanly from phrase to phrase without strobe-like flickering.
 * - Spoken words pop into full 100% brilliance as vocalized, with upcoming words at a clean 0.75 resting state.
 */
/**
 * Rock-Solid Tok Subtitles:
 * - 100% PURE SOLID WHITE (#FFFFFF) across ALL words at ALL times.
 * - ZERO word-by-word dimming (completely eliminates the grey-to-white flashing!).
 * - ZERO word-by-word scale pulsing or popping.
 * - ZERO blackout dips during continuous speech.
 * - Fixed typography: 900 Black weight, clean cinema shadow, rock-solid stability.
 */
const FlowingUxCaptions: React.FC<{
    startAfterFrame: number;
    introEndFrame: number;
    captionY: number;
}> = ({ startAfterFrame, introEndFrame, captionY }) => {
    const frame = useCurrentFrame();
    if (frame < startAfterFrame) return null;

    const active = VOICEOVER_MANIFEST.captions.find(
        (c) => frame >= c.fromFrame && frame < c.toFrame
    );
    if (!active) return null;

    // During Intro split screen: lower chest area (Y: 1620px)
    // During Unboxing B-Roll: anchored directly on the clean wooden desk surface (Y: 1540px)
    const effectiveY = frame < introEndFrame ? 1620 : 1540;

    return (
        <div
            style={{
                position: 'absolute',
                left: 60,
                right: 60,
                top: effectiveY,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                textAlign: 'center',
                pointerEvents: 'none',
                zIndex: 35,
            }}
        >
            <span
                style={{
                    display: 'inline-block',
                    fontFamily: FONT_STACK,
                    fontWeight: 900,
                    fontSize: 58,
                    color: '#FFFFFF',
                    letterSpacing: '-0.03em',
                    lineHeight: 1.15,
                    opacity: 1.0,
                    textAlign: 'center',
                    // Pure solid white with crisp cinema drop shadow — ZERO stroke, ZERO blur, ZERO flashing!
                    textShadow: '0 3px 14px rgba(0, 0, 0, 0.9), 0 1px 3px rgba(0, 0, 0, 0.95)',
                }}
            >
                {active.text}
            </span>
        </div>
    );
};

/**
 * Tasteful visual micro-transition wrapper for each Unboxing B-Roll cut:
 * - Cut 0 (right after "Videoya geçelim!"): Smooth 12-frame whip-zoom entrance + soft exposure glow
 * - Subsequent cuts: Subtle 7-frame micro-push + gentle continuous Ken Burns drift
 */
const AnimatedBrollClip: React.FC<{ cut: CutItem; isFirstAfterIntro: boolean }> = ({
    cut,
    isFirstAfterIntro,
}) => {
    const frame = useCurrentFrame();
    const fx = cut.focusX ?? 0.38;
    const fy = cut.focusY ?? 0.52;

    const enterFrames = isFirstAfterIntro ? 12 : 7;
    const startScale = isFirstAfterIntro ? 1.065 : 1.024;
    const enterBoost = interpolate(frame, [0, enterFrames], [startScale - 1.0, 0], {
        extrapolateLeft: 'clamp',
        extrapolateRight: 'clamp',
        easing: Easing.out(Easing.cubic),
    });
    const kenBurns = interpolate(frame, [0, cut.durationFrames], [1.0, 1.026], {
        extrapolateLeft: 'clamp',
        extrapolateRight: 'clamp',
    });
    const brightness = interpolate(frame, [0, enterFrames], [isFirstAfterIntro ? 1.12 : 1.05, 1.02], {
        extrapolateLeft: 'clamp',
        extrapolateRight: 'clamp',
        easing: Easing.out(Easing.quad),
    });

    return (
        <AbsoluteFill style={{ overflow: 'hidden', opacity: frame < 0 ? 0 : 1 }}>
            <OffthreadVideo
                src={staticFile(cut.file.replace(/^public\//, ''))}
                startFrom={cut.srcStartFrame}
                muted
                style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    objectPosition: `${(fx * 100).toFixed(1)}% ${(fy * 100).toFixed(1)}%`,
                    transform: `scale(${(kenBurns + enterBoost).toFixed(4)})`,
                    filter: `contrast(1.05) brightness(${brightness.toFixed(3)}) saturate(1.06)`,
                }}
            />
        </AbsoluteFill>
    );
};

/**
 * Centered Floating 109€ Model Recommendation Card (~02:07 / frame 7440..7740):
 * - User Request: "ORAYA 109 EUROLUK MODELI EKRANIN UZERINDE GOSTER BLUR OLARAK GELSIN
 *   EKRANIN ORTASINA DOGRU GOSTERILSIN DAHA SONRA KAYBOLSUN HAFIFCE AMA DURSUN BIRAZ EKRANDA HEMEN KAYBETME"
 * - Entrance: Snappy blur-to-sharp pop from below (blur: 16px -> 0px, opacity: 0 -> 1, scale: 0.92 -> 1.0)
 * - Rest: Holds steady in screen center for ~3.8 seconds with subtle gentle micro-drift
 * - Exit: Soft graceful fadeout with gentle blur dissipation (opacity: 1 -> 0, blur: 0px -> 12px)
 */
const Model109Card: React.FC<{ durationFrames: number }> = ({ durationFrames }) => {
    const frame = useCurrentFrame();
    if (frame >= durationFrames) return null;

    const ENTER_FRAMES = 18;
    const EXIT_FRAMES = 30;
    const exitStart = durationFrames - EXIT_FRAMES;

    // Entrance: blur(16px -> 0px), opacity(0 -> 1), translateY(48px -> 0px), scale(0.92 -> 1.0)
    const enterProgress = interpolate(frame, [0, ENTER_FRAMES], [0, 1], {
        extrapolateLeft: 'clamp',
        extrapolateRight: 'clamp',
        easing: Easing.bezier(0.16, 1, 0.3, 1),
    });

    const enterBlur = interpolate(enterProgress, [0, 1], [16, 0]);
    const enterOpacity = interpolate(enterProgress, [0, 0.4, 1], [0, 0.85, 1]);
    const enterTranslateY = interpolate(enterProgress, [0, 1], [48, 0]);
    const enterScale = interpolate(enterProgress, [0, 1], [0.92, 1.0]);

    // Exit: opacity(1 -> 0), blur(0px -> 12px), translateY(0px -> -16px)
    const exitProgress = interpolate(frame, [exitStart, durationFrames], [0, 1], {
        extrapolateLeft: 'clamp',
        extrapolateRight: 'clamp',
        easing: Easing.in(Easing.quad),
    });

    const exitBlur = interpolate(exitProgress, [0, 1], [0, 12]);
    const exitOpacity = 1 - exitProgress;
    const exitTranslateY = interpolate(exitProgress, [0, 1], [0, -16]);

    // Combine transforms & filters
    const currentBlur = frame < exitStart ? enterBlur : exitBlur;
    const currentOpacity = enterOpacity * exitOpacity;
    const currentTranslateY = enterTranslateY + exitTranslateY;
    // Gentle floating breathing motion while resting
    const driftScale = interpolate(frame, [0, durationFrames], [1.0, 1.025], {
        extrapolateRight: 'clamp',
    });
    const currentScale = enterScale * driftScale;

    return (
        <div
            style={{
                position: 'absolute',
                top: 460,
                left: 140,
                width: 800,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                backgroundColor: 'rgba(255, 255, 255, 0.96)',
                backdropFilter: 'blur(20px)',
                borderRadius: 32,
                padding: '36px 36px 32px 36px',
                boxSizing: 'border-box',
                boxShadow: '0 32px 80px rgba(0, 0, 0, 0.65), 0 8px 24px rgba(0, 0, 0, 0.3)',
                border: '1px solid rgba(255, 255, 255, 0.8)',
                opacity: currentOpacity,
                filter: `blur(${currentBlur.toFixed(2)}px)`,
                transform: `translateY(${currentTranslateY.toFixed(2)}px) scale(${currentScale.toFixed(4)})`,
                pointerEvents: 'none',
                zIndex: 38,
            }}
        >
            {/* Top Recommended Tag */}
            <div
                style={{
                    backgroundColor: '#FFDE00',
                    color: '#000000',
                    fontFamily: FONT_STACK,
                    fontWeight: 900,
                    fontSize: 26,
                    letterSpacing: '-0.02em',
                    padding: '8px 24px',
                    borderRadius: 100,
                    textTransform: 'uppercase',
                    marginBottom: 16,
                    boxShadow: '0 4px 14px rgba(0, 0, 0, 0.12)',
                }}
            >
                Önerilen Model
            </div>

            {/* Product Image */}
            <div
                style={{
                    width: '100%',
                    height: 380,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: 16,
                }}
            >
                <Img
                    src={staticFile('dji mini 2.png')}
                    style={{
                        maxHeight: '100%',
                        maxWidth: '92%',
                        objectFit: 'contain',
                        filter: 'drop-shadow(0 16px 28px rgba(0,0,0,0.22))',
                    }}
                />
            </div>

            {/* Product Title & Highlight Price */}
            <div
                style={{
                    width: '100%',
                    display: 'flex',
                    flexDirection: 'row',
                    alignItems: 'baseline',
                    justifyContent: 'space-between',
                    borderTop: '2px solid rgba(0, 0, 0, 0.08)',
                    paddingTop: 18,
                    boxSizing: 'border-box',
                }}
            >
                <div>
                    <div
                        style={{
                            fontFamily: FONT_STACK,
                            fontWeight: 900,
                            fontSize: 44,
                            color: '#0F172A',
                            letterSpacing: '-0.03em',
                            lineHeight: 1.1,
                        }}
                    >
                        DJI Mic Mini 2
                    </div>
                    <div
                        style={{
                            fontFamily: FONT_STACK,
                            fontWeight: 800,
                            fontSize: 24,
                            color: '#64748B',
                            marginTop: 4,
                        }}
                    >
                        Fiyatına Göre Premium Kalite
                    </div>
                </div>

                <div
                    style={{
                        fontFamily: FONT_STACK,
                        fontWeight: 900,
                        fontSize: 54,
                        color: '#000000',
                        letterSpacing: '-0.04em',
                    }}
                >
                    109,00 €
                </div>
            </div>
        </div>
    );
};

export const AsmrBoxOpening: React.FC<AsmrBoxProps> = ({
    hookDurationSec,
    hookLine1,
    hookLine2,
    hookBannerY,
    captionY,
    asmrAudioFile,
    voiceoverAudioFile,
    bgMusicFile,
    sfxFile,
    asmrBaseVolume,
    voiceoverVolume,
    bgMusicVolume,
    sfxVolume,
    duckDb,
    speakerFocusX,
    speakerFocusY,
}) => {
    const { fps } = useVideoConfig();
    const hookFrames = Math.round(hookDurationSec * fps);
    const introEndFrame = VOICEOVER_MANIFEST.introEndFrame;
    const introSeg = VOICEOVER_MANIFEST.segments[0];

    return (
        <AbsoluteFill style={{ backgroundColor: '#000000' }}>
            {/* Google Font Plus Jakarta Sans (800 / 900 Black) for Tok Typography */}
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@800;900&display=swap');
            `}</style>

            {/* =========================================================================
                PHASE 0 (0 .. ASMR_HOOK_FRAMES): TACTILE ASMR LID SNAP TEASER (2.60s / 156 frames)
                Opens with case closing motion, LOUD tactile "PAT!" snap at 0.87s,
                then holds prominently on the embossed DJI logo until 2.60s!
               ========================================================================= */}
            <Sequence from={0} durationInFrames={ASMR_HOOK_FRAMES} layout="none">
                <AbsoluteFill style={{ overflow: 'hidden', zIndex: 20 }}>
                    <OffthreadVideo
                        src={staticFile('clips/asmr_snap_hook.mp4')}
                        muted
                        style={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover',
                            objectPosition: '50% 50%',
                        }}
                    />
                </AbsoluteFill>
                <Audio src={staticFile('audio/asmr_snap_hook.wav')} volume={1.2} />
            </Sequence>

            {/* =========================================================================
                MAIN VIDEO (ASMR_HOOK_FRAMES .. End):
                Speaker enters immediately after the tactile ASMR lid snap!
               ========================================================================= */}
            <Sequence
                from={ASMR_HOOK_FRAMES}
                durationInFrames={VOICEOVER_MANIFEST.totalFrames}
                layout="none"
            >
                {/* PHASE 1 (0 .. introEndFrame): SPLIT SHOWCASE INTRO
                    - Top Half (0..850px): Clean Product Showcase ('dji 3.png' vs 'dji mini 2.png' & silent preview)
                    - Bottom Half (850..1920px): Speaker 100% original untouched pristine quality (NO filters, NO vignettes!)
                    - ZERO ASMR unboxing audio during Intro! */}
                <Sequence from={0} durationInFrames={introEndFrame} layout="none">
                    <AbsoluteFill style={{ overflow: 'hidden', zIndex: 15 }}>
                        <IntroTopShowcase introEndFrame={introEndFrame} />
                        <div
                            style={{
                                position: 'absolute',
                                top: 850,
                                left: 0,
                                width: 1080,
                                height: 1070,
                                overflow: 'hidden',
                                backgroundColor: '#090D16',
                            }}
                        >
                            <OffthreadVideo
                                src={staticFile(introSeg.speakerVideo)}
                                startFrom={introSeg.srcStartFrame}
                                muted
                                style={{
                                    width: '100%',
                                    height: '100%',
                                    objectFit: 'cover',
                                    objectPosition: `${(speakerFocusX * 100).toFixed(1)}% ${(speakerFocusY * 100).toFixed(1)}%`,
                                }}
                            />
                        </div>
                    </AbsoluteFill>
                </Sequence>

                {/* PHASE 2 (introEndFrame .. End): FULL-SCREEN UNBOXING VIDEO (1080x1920)
                    Starts right after "Videoya geçelim!" with Lidl knife cutting box plastic (C002)
                    and every subsequent action synced to the unbroken voiceover narration! */}
                <Sequence
                    from={introEndFrame}
                    durationInFrames={VOICEOVER_MANIFEST.totalFrames - introEndFrame}
                    premountFor={30}
                    layout="none"
                >
                    <AbsoluteFill style={{ overflow: 'hidden', zIndex: 15 }}>
                        {CUTS_MANIFEST.cuts.map((c, idx) => (
                            <Sequence
                                key={c.index}
                                from={c.timelineFrom - introEndFrame}
                                durationInFrames={c.durationFrames}
                                premountFor={30}
                                layout="none"
                            >
                                <AnimatedBrollClip cut={c} isFirstAfterIntro={idx === 0} />
                            </Sequence>
                        ))}
                    </AbsoluteFill>
                </Sequence>

                {/* HIGH-IMPACT TYPOGRAPHY LAYERS */}
                <HookTitleBanner
                    line1={hookLine1}
                    line2={hookLine2}
                    topY={hookBannerY}
                    durationFrames={hookFrames}
                />
                <FlowingUxCaptions
                    startAfterFrame={hookFrames}
                    introEndFrame={introEndFrame}
                    captionY={captionY}
                />

                {/* FLOATING 109€ RECOMMENDATION CARD AT ~02:07 ("bu modeli almak istiyorsanız") */}
                <Sequence from={7440} durationInFrames={300} layout="none">
                    <Model109Card durationFrames={300} />
                </Sequence>

                {/* 1. MASTER VOICEOVER (-13 LUFS, 100% unclipped acoustic-valley verified blocks) */}
                <Audio src={staticFile(voiceoverAudioFile)} volume={voiceoverVolume} />

                {/* 2. WARM CHILL BACKGROUND MUSIC (Gently ducked under voiceover, swells slightly in pauses) */}
                <Audio
                    src={staticFile(bgMusicFile)}
                    volume={(f) =>
                        computeAsmrSidechainVolume(
                            f,
                            fps,
                            VOICEOVER_MANIFEST.duckingRegions,
                            bgMusicVolume,
                            -4.5
                        )
                    }
                />

                {/* 3. SUBTLE ORGANIC TRANSITION SFX (Low-passed air whoosh & soft felt thump at key transitions) */}
                <Audio src={staticFile(sfxFile)} volume={sfxVolume} />

                {/* 4. ASMR MASTER TRACK: Plays ONLY after "Videoya geçelim!" (from={introEndFrame}) with Envelope Sidechain Ducking! */}
                <Sequence
                    from={introEndFrame}
                    durationInFrames={VOICEOVER_MANIFEST.totalFrames - introEndFrame}
                    layout="none"
                >
                    <Audio
                        src={staticFile(asmrAudioFile)}
                        volume={(f) =>
                            computeAsmrSidechainVolume(
                                f + introEndFrame,
                                fps,
                                VOICEOVER_MANIFEST.duckingRegions,
                                asmrBaseVolume,
                                duckDb
                            )
                        }
                    />
                </Sequence>
            </Sequence>
        </AbsoluteFill>
    );
};
