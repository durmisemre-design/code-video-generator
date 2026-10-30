import React from 'react';
import { interpolate, Sequence, spring, useCurrentFrame, useVideoConfig } from 'remotion';
import { CaptionItem } from '../types/video';

interface SingleCaptionProps {
    caption: CaptionItem;
    durationInFrames: number;
}

const SingleCaptionView: React.FC<SingleCaptionProps> = ({ caption, durationInFrames }) => {
    const frame = useCurrentFrame();
    const { fps } = useVideoConfig();

    // After Effects organic spring motion (inertia & overshoot)
    const enter = spring({
        frame,
        fps,
        config: {
            damping: 14,
            stiffness: 180,
            mass: 0.7,
        },
    });

    // Smooth exit before next caption begins
    const exitLead = Math.round(6 * (fps / 60));
    const exit = spring({
        frame: frame - (durationInFrames - exitLead),
        fps,
        config: {
            damping: 16,
            stiffness: 220,
            mass: 0.6,
        },
    });

    const enterScale = interpolate(enter, [0, 1], [0.75, 1]);
    const exitScale = interpolate(exit, [0, 1], [1, 0.85]);
    const currentScale = enterScale * exitScale;

    const enterTranslateY = interpolate(enter, [0, 1], [30, 0]);
    const exitTranslateY = interpolate(exit, [0, 1], [0, 15]);
    const currentTranslateY = enterTranslateY + exitTranslateY;

    const enterOpacity = interpolate(enter, [0, 0.35, 1], [0, 1, 1], {
        extrapolateRight: 'clamp',
    });
    const exitOpacity = interpolate(exit, [0, 1], [1, 0]);
    const currentOpacity = Math.max(0, enterOpacity * exitOpacity);

    const renderText = () => {
        if (!caption.highlight) {
            return <span>{caption.text}</span>;
        }

        const parts = caption.text.split(caption.highlight);
        return (
            <>
                {parts.map((part, index) => (
                    <React.Fragment key={index}>
                        {part}
                        {index < parts.length - 1 && (
                            <span
                                style={{
                                    color: '#38bdf8',
                                    textShadow:
                                        '0 0 25px rgba(56, 189, 248, 1), 0 0 50px rgba(56, 189, 248, 0.7), 0 0 80px rgba(56, 189, 248, 0.4)',
                                    fontWeight: 950,
                                }}
                            >
                                {caption.highlight}
                            </span>
                        )}
                    </React.Fragment>
                ))}
            </>
        );
    };

    return (
        <div
            style={{
                position: 'absolute',
                bottom: 220, // Exactly as requested: bottom: 220px
                left: 48,
                right: 48,
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                transform: `translateY(${currentTranslateY}px) scale(${currentScale})`,
                opacity: currentOpacity,
                zIndex: 50,
                pointerEvents: 'none',
            }}
        >
            <div
                style={{
                    background: 'rgba(9, 14, 28, 0.88)',
                    backdropFilter: 'blur(32px)',
                    WebkitBackdropFilter: 'blur(32px)',
                    border: '2px solid rgba(255, 255, 255, 0.22)',
                    borderRadius: 32,
                    padding: '24px 44px',
                    boxShadow:
                        '0 30px 80px rgba(0, 0, 0, 0.85), 0 0 40px rgba(56, 189, 248, 0.25), inset 0 1.5px 3px rgba(255, 255, 255, 0.28)',
                    textAlign: 'center',
                    fontSize: 44,
                    fontWeight: 900,
                    lineHeight: 1.3,
                    color: '#ffffff',
                    fontFamily: 'Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
                    maxWidth: 960,
                }}
            >
                {renderText()}
            </div>
        </div>
    );
};

interface DynamicCaptionsProps {
    captions: CaptionItem[];
}

export const DynamicCaptions: React.FC<DynamicCaptionsProps> = ({ captions }) => {
    const { fps } = useVideoConfig();

    return (
        <>
            {captions.map((caption, idx) => {
                const fromFrame = Math.round(caption.startSec * fps);
                const durationInFrames = Math.max(1, Math.round((caption.endSec - caption.startSec) * fps));

                return (
                    <Sequence
                        key={`caption-${idx}-${caption.startSec}`}
                        from={fromFrame}
                        durationInFrames={durationInFrames}
                        name={`Caption: ${caption.text.slice(0, 20)}...`}
                    >
                        <SingleCaptionView
                            caption={caption}
                            durationInFrames={durationInFrames}
                        />
                    </Sequence>
                );
            })}
        </>
    );
};
