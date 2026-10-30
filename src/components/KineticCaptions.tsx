import React from 'react';
import { interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';
import { CaptionItem } from '../types/video';

export const KineticCaptions: React.FC<{ captions: CaptionItem[] }> = ({ captions }) => {
    const frame = useCurrentFrame();
    const { fps } = useVideoConfig();
    const currentTimeSec = frame / fps;

    // Aktif altyazı tespiti
    const activeCaption = captions.find(
        (c) => currentTimeSec >= c.startSec && currentTimeSec < c.endSec
    );

    if (!activeCaption) {
        return null;
    }

    const captionStartFrame = Math.round(activeCaption.startSec * fps);
    const frameWithinCaption = frame - captionStartFrame;

    // Hafif ve tok yaylanma (pop-in) efekti
    const entranceScale = spring({
        frame: frameWithinCaption,
        fps,
        config: {
            damping: 15,
            mass: 0.45,
            stiffness: 220,
        },
    });

    const scale = interpolate(entranceScale, [0, 1], [0.95, 1.0], {
        extrapolateLeft: 'clamp',
        extrapolateRight: 'clamp',
    });

    const opacity = interpolate(frameWithinCaption, [0, 3], [0, 1], {
        extrapolateLeft: 'clamp',
        extrapolateRight: 'clamp',
    });

    // 1. videoda (0.0s - 25.50s) Reels açıklamalarının altyazıyı kapatmaması için hafif yukarıda (bottom: 350px),
    // 2. ve 3. videolarda ise kullanıcının istediği el hizasında (bottom: 240px).
    const isPart1 = currentTimeSec < 25.50;
    const bottomPosition = isPart1 ? 350 : 240;

    return (
        <div
            style={{
                position: 'absolute',
                bottom: bottomPosition,
                left: 40,
                right: 40,
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                textAlign: 'center',
                zIndex: 80,
                pointerEvents: 'none',
            }}
        >
            {/* Kullanıcının eski videosundaki font stiliyle birebir: Büyük/küçük harf kurallı, tok gölgeli beyaz font */}
            <div
                style={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    textAlign: 'center',
                    transform: `scale(${scale})`,
                    opacity,
                    maxWidth: 1000,
                    userSelect: 'none',
                }}
            >
                <span
                    style={{
                        fontFamily:
                            '"Montserrat", "Inter", -apple-system, BlinkMacSystemFont, "SF Pro Display", "Helvetica Neue", Arial, sans-serif',
                        fontSize: 56,
                        fontWeight: 800,
                        color: '#FFFFFF',
                        lineHeight: 1.22,
                        letterSpacing: '-0.015em',
                        textAlign: 'center',
                        textTransform: 'none',
                        // Referans görseldeki gibi temiz, net ve belirgin siyah derinlik gölgesi
                        textShadow:
                            '0 2px 4px rgba(0, 0, 0, 0.95), 0 0 4px rgba(0, 0, 0, 0.85), 0 1px 2px rgba(0, 0, 0, 1)',
                    }}
                >
                    {activeCaption.text}
                </span>
            </div>
        </div>
    );
};
