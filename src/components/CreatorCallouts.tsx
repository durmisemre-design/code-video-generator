import React from 'react';
import { interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';

interface CalloutItem {
    fromFrame: number;
    toFrame: number;
    text: string;
}

export const CreatorCallouts: React.FC = () => {
    const frame = useCurrentFrame();
    const { fps } = useVideoConfig();

    // SADECE "MCP BAĞLAMANIZA GEREK YOK" vurgusu:
    // Konuşmada 'MCP bağlamanıza' dendiği an (2.32s - 5.09s / frame 139 - 305) ile %100 senkronize
    const callouts: CalloutItem[] = [
        {
            fromFrame: 139,
            toFrame: 305,
            text: 'MCP BAĞLAMANIZA GEREK YOK',
        },
    ];

    const activeCallout = callouts.find(
        (c) => frame >= c.fromFrame && frame < c.toFrame
    );

    if (!activeCallout) {
        return null;
    }

    const frameInCallout = frame - activeCallout.fromFrame;
    const calloutDuration = activeCallout.toFrame - activeCallout.fromFrame;

    // Sade, tok ve düz geçiş (Sıfır rotasyon, saf merkezleme)
    const entrance = spring({
        frame: frameInCallout,
        fps,
        config: {
            damping: 18,
            mass: 0.5,
            stiffness: 200,
        },
    });

    const scale = interpolate(entrance, [0, 1], [0.94, 1]);
    const opacity = interpolate(frameInCallout, [0, 5], [0, 1], {
        extrapolateLeft: 'clamp',
        extrapolateRight: 'clamp',
    });

    // Yumuşak çıkış
    const exitOpacity = interpolate(
        frameInCallout,
        [calloutDuration - 6, calloutDuration],
        [1, 0],
        {
            extrapolateLeft: 'clamp',
            extrapolateRight: 'clamp',
        }
    );

    return (
        <div
            style={{
                position: 'absolute',
                top: 220,
                left: 0,
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                textAlign: 'center',
                zIndex: 85,
                pointerEvents: 'none',
                transform: `scale(${scale})`,
                opacity: opacity * exitOpacity,
                padding: '0 40px',
                boxSizing: 'border-box',
            }}
        >
            {/* Büyük, Düz, Sade Ana Metin (Kutusuz, Simgesiz, Saf Beyaz) */}
            <div
                style={{
                    fontFamily:
                        '"Montserrat", "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
                    fontSize: 52,
                    fontWeight: 900,
                    lineHeight: 1.15,
                    letterSpacing: '-0.02em',
                    color: '#FFFFFF',
                    textTransform: 'uppercase',
                    textAlign: 'center',
                    whiteSpace: 'nowrap',
                    textShadow:
                        '0 4px 24px rgba(0, 0, 0, 0.95), 0 2px 6px rgba(0, 0, 0, 0.95), 0 0 2px rgba(0, 0, 0, 1)',
                }}
            >
                {activeCallout.text}
            </div>
        </div>
    );
};
