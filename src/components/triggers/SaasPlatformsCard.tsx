import React from 'react';
import { useCurrentFrame } from 'remotion';
import { Sparkles, Layers, Code2 } from 'lucide-react';
import { AnimatedCardWrapper } from './AnimatedCardWrapper';

interface SaasPlatformsCardProps {
    durationInFrames: number;
    title?: string;
    description?: string;
}

export const SaasPlatformsCard: React.FC<SaasPlatformsCardProps> = ({
    durationInFrames,
    title = 'SAAS PLATFORMS',
    description = 'Dakikalar İçinde Web Sistemleri',
}) => {
    const frame = useCurrentFrame();

    // Rhythmic organic glow pulse
    const pulse = Math.sin(frame * 0.15) * 0.15 + 0.85;

    return (
        <AnimatedCardWrapper
            durationInFrames={durationInFrames}
            borderColor="rgba(56, 189, 248, 0.85)"
            glowColor={`rgba(14, 165, 233, ${0.45 * pulse})`}
            top={140}
        >
            <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
                {/* Glowing Blue Gradient Icon Badge */}
                <div
                    style={{
                        background: 'linear-gradient(135deg, #0ea5e9, #2563eb)',
                        padding: 24,
                        borderRadius: 26,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: '0 12px 30px rgba(14, 165, 233, 0.6), inset 0 2px 4px rgba(255,255,255,0.4)',
                        transform: `scale(${1 + (pulse - 0.85) * 0.08})`,
                    }}
                >
                    <Sparkles size={52} color="#ffffff" strokeWidth={2.4} />
                </div>

                <div style={{ flex: 1 }}>
                    <div
                        style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 8,
                            background: 'rgba(14, 165, 233, 0.18)',
                            border: '1.5px solid rgba(56, 189, 248, 0.5)',
                            padding: '6px 14px',
                            borderRadius: 100,
                            marginBottom: 8,
                        }}
                    >
                        <Layers size={16} color="#38bdf8" />
                        <span
                            style={{
                                fontSize: 18,
                                fontWeight: 800,
                                color: '#38bdf8',
                                letterSpacing: 2,
                            }}
                        >
                            {title}
                        </span>
                    </div>

                    <div
                        style={{
                            fontSize: 40,
                            fontWeight: 900,
                            color: '#ffffff',
                            lineHeight: 1.15,
                            letterSpacing: -0.5,
                        }}
                    >
                        {description}
                    </div>

                    <div
                        style={{
                            fontSize: 20,
                            fontWeight: 600,
                            color: '#94a3b8',
                            marginTop: 6,
                            display: 'flex',
                            alignItems: 'center',
                            gap: 8,
                        }}
                    >
                        <Code2 size={18} color="#38bdf8" />
                        <span>Next.js • Cloud • Yapay Zeka Mimarisi</span>
                    </div>
                </div>
            </div>
        </AnimatedCardWrapper>
    );
};
