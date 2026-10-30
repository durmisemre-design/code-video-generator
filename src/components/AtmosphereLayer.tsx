import React from 'react';
import { interpolate, useCurrentFrame, useVideoConfig } from 'remotion';

export const AtmosphereLayer: React.FC = () => {
    const frame = useCurrentFrame();
    const { fps } = useVideoConfig();

    // Key scene transition points
    const fSecurity = Math.round(6.7 * fps);   // 402
    const fFileHack = Math.round(8.8 * fps);   // 528
    const fDdos = Math.round(14.3 * fps);      // 858
    const fPrompt = Math.round(17.3 * fps);    // 1038
    const fShield = Math.round(28.5 * fps);    // 1710
    const fCta = Math.round(31.8 * fps);       // 1908

    // Dynamic background dimming during graphic sequences
    const isGraphicActive =
        (frame >= 60 && frame < 402) ||
        (frame >= 402 && frame < 528) ||
        (frame >= 528 && frame < 858) ||
        (frame >= 858 && frame < 1038) ||
        (frame >= 1038 && frame < 1710) ||
        (frame >= 1710 && frame < 1908) ||
        (frame >= 1908);

    const dimOpacity = isGraphicActive ? 0.35 : 0.1;

    // Red alert pulse for Security Alert & DDoS
    let alertGlow = 0;
    if (frame >= fSecurity && frame < fFileHack) {
        alertGlow = Math.sin(frame * 0.3) * 0.4 + 0.5;
    } else if (frame >= fDdos && frame < fPrompt) {
        alertGlow = Math.sin(frame * 0.4) * 0.5 + 0.5;
    }

    // Emerald shield aura
    let shieldGlow = 0;
    if (frame >= fShield && frame < fCta) {
        shieldGlow = interpolate(frame, [fShield, fShield + 15, fCta], [0, 0.6, 0.3], {
            extrapolateLeft: 'clamp',
            extrapolateRight: 'clamp',
        });
    }

    // Cyan tech aura for SaaS & Prompt
    let cyanGlow = 0;
    if (frame >= 60 && frame < 402) {
        cyanGlow = 0.35;
    } else if (frame >= fPrompt && frame < fShield) {
        cyanGlow = 0.4;
    }

    // Subtle drifting cyber dust particles
    const particles = [
        { id: 1, x: 180, y: (frame * 1.2) % 1920, size: 4, op: 0.5 },
        { id: 2, x: 340, y: (1920 - (frame * 0.9) % 1920), size: 3, op: 0.4 },
        { id: 3, x: 520, y: (frame * 1.5 + 400) % 1920, size: 5, op: 0.6 },
        { id: 4, x: 740, y: (1920 - (frame * 1.1 + 800) % 1920), size: 3, op: 0.35 },
        { id: 5, x: 920, y: (frame * 0.8 + 200) % 1920, size: 4, op: 0.5 },
    ];

    return (
        <div
            style={{
                position: 'absolute',
                inset: 0,
                pointerEvents: 'none',
                zIndex: 20,
                overflow: 'hidden',
            }}
        >
            {/* Cinematic depth vignette & dimming */}
            <div
                style={{
                    position: 'absolute',
                    inset: 0,
                    backgroundColor: '#000000',
                    opacity: dimOpacity,
                    transition: 'opacity 0.3s ease',
                }}
            />

            {/* Radial Vignette */}
            <div
                style={{
                    position: 'absolute',
                    inset: 0,
                    background:
                        'radial-gradient(circle at 50% 40%, transparent 35%, rgba(0, 0, 0, 0.75) 100%)',
                }}
            />

            {/* Red Alert Flash Vignette */}
            {alertGlow > 0 && (
                <div
                    style={{
                        position: 'absolute',
                        inset: 0,
                        background: `radial-gradient(circle at 50% 30%, rgba(255, 0, 60, ${alertGlow * 0.35}) 0%, rgba(255, 0, 60, ${alertGlow * 0.65}) 100%)`,
                        mixBlendMode: 'screen',
                    }}
                />
            )}

            {/* Shield Emerald Aura */}
            {shieldGlow > 0 && (
                <div
                    style={{
                        position: 'absolute',
                        inset: 0,
                        background: `radial-gradient(circle at 50% 35%, rgba(16, 185, 129, ${shieldGlow * 0.4}) 0%, transparent 70%)`,
                        mixBlendMode: 'screen',
                    }}
                />
            )}

            {/* Cyan / Purple Tech Aura */}
            {cyanGlow > 0 && (
                <div
                    style={{
                        position: 'absolute',
                        inset: 0,
                        background: `radial-gradient(circle at 50% 30%, rgba(0, 240, 255, ${cyanGlow * 0.25}) 0%, transparent 65%)`,
                        mixBlendMode: 'screen',
                    }}
                />
            )}

            {/* Drifting Cyber Dust */}
            {particles.map((p) => (
                <div
                    key={p.id}
                    style={{
                        position: 'absolute',
                        left: p.x,
                        top: p.y,
                        width: p.size,
                        height: p.size,
                        borderRadius: '50%',
                        backgroundColor: alertGlow > 0 ? '#ff0055' : shieldGlow > 0 ? '#10b981' : '#00f0ff',
                        opacity: p.op,
                        boxShadow: `0 0 10px ${alertGlow > 0 ? '#ff0055' : shieldGlow > 0 ? '#10b981' : '#00f0ff'}`,
                    }}
                />
            ))}
        </div>
    );
};
