import React from 'react';
import { interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';

interface AnimatedCardWrapperProps {
    children: React.ReactNode;
    durationInFrames: number;
    borderColor?: string;
    glowColor?: string;
    top?: number;
}

export const AnimatedCardWrapper: React.FC<AnimatedCardWrapperProps> = ({
    children,
    durationInFrames,
    borderColor = 'rgba(255, 255, 255, 0.22)',
    glowColor = 'rgba(56, 189, 248, 0.4)',
    top = 140, // Top: 140px as specified in standard
}) => {
    const frame = useCurrentFrame();
    const { fps } = useVideoConfig();

    // After Effects Organic Motion: inertia (atalet) & overshoot (esneme) spring
    const enter = spring({
        frame,
        fps,
        config: {
            damping: 14,
            stiffness: 180,
            mass: 0.7,
        },
    });

    // Exit transition starting 16 frames before sequence ends (smooth at 60 FPS)
    const exitLeadFrames = Math.round(16 * (fps / 60));
    const exit = spring({
        frame: frame - (durationInFrames - exitLeadFrames),
        fps,
        config: {
            damping: 18,
            stiffness: 220,
            mass: 0.6,
        },
    });

    // Inertia & Overshoot transforms
    const enterScale = interpolate(enter, [0, 1], [0.65, 1]);
    const exitScale = interpolate(exit, [0, 1], [1, 0.8]);
    const currentScale = enterScale * exitScale;

    const enterTranslateY = interpolate(enter, [0, 1], [-80, 0]);
    const exitTranslateY = interpolate(exit, [0, 1], [0, 30]);
    const currentTranslateY = enterTranslateY + exitTranslateY;

    const enterOpacity = interpolate(enter, [0, 0.35, 1], [0, 1, 1], {
        extrapolateRight: 'clamp',
    });
    const exitOpacity = interpolate(exit, [0, 1], [1, 0]);
    const currentOpacity = Math.max(0, enterOpacity * exitOpacity);

    const rotate = interpolate(enter, [0, 1], [-3.5, 0]);

    return (
        <div
            style={{
                position: 'absolute',
                top,
                left: 54,
                right: 54,
                display: 'flex',
                justifyContent: 'center',
                transform: `translateY(${currentTranslateY}px) scale(${currentScale}) rotate(${rotate}deg)`,
                opacity: currentOpacity,
                zIndex: 40,
                pointerEvents: 'none',
            }}
        >
            <div
                style={{
                    width: '100%',
                    background: 'linear-gradient(145deg, rgba(13, 19, 36, 0.94), rgba(24, 33, 56, 0.88))',
                    backdropFilter: 'blur(36px)',
                    WebkitBackdropFilter: 'blur(36px)',
                    border: `2px solid ${borderColor}`,
                    borderRadius: 36,
                    padding: '30px 38px',
                    boxShadow: `0 30px 90px rgba(0, 0, 0, 0.85), 0 0 55px ${glowColor}, inset 0 1.5px 3px rgba(255, 255, 255, 0.3)`,
                    color: '#ffffff',
                    fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                }}
            >
                {children}
            </div>
        </div>
    );
};
