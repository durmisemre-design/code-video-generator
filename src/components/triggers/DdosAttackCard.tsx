import React from 'react';
import { useCurrentFrame } from 'remotion';
import { Activity, Flame, ServerCrash } from 'lucide-react';
import { AnimatedCardWrapper } from './AnimatedCardWrapper';

interface DdosAttackCardProps {
    durationInFrames: number;
    title?: string;
    description?: string;
}

export const DdosAttackCard: React.FC<DdosAttackCardProps> = ({
    durationInFrames,
    title = 'DDoS Trafik Saldırısı!',
    description = 'Trafik Kapasite Aşımı: 2.8M Req/s',
}) => {
    const frame = useCurrentFrame();

    // 16 equalizer bars calculating real-time surging traffic
    const barCount = 18;
    const bars = Array.from({ length: barCount }, (_, i) => {
        const wave1 = Math.sin(frame * 0.45 + i * 0.7) * 30;
        const wave2 = Math.cos(frame * 0.3 + i * 1.1) * 20;
        const heightPercent = Math.min(100, Math.max(30, Math.round(55 + wave1 + wave2)));
        const isCritical = heightPercent > 75;
        return { heightPercent, isCritical };
    });

    // Pulsing danger glow
    const pulse = Math.sin(frame * 0.4) * 0.15 + 0.85;

    return (
        <AnimatedCardWrapper
            durationInFrames={durationInFrames}
            borderColor="rgba(239, 68, 68, 0.9)"
            glowColor={`rgba(239, 68, 68, ${0.5 * pulse})`}
            top={135}
        >
            <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
                {/* Header with status badges */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <div
                            style={{
                                width: 14,
                                height: 14,
                                borderRadius: '50%',
                                background: '#ef4444',
                                boxShadow: '0 0 16px #ef4444',
                                transform: `scale(${pulse})`,
                            }}
                        />
                        <div
                            style={{
                                fontSize: 18,
                                fontWeight: 800,
                                color: '#f87171',
                                letterSpacing: 2,
                                textTransform: 'uppercase',
                            }}
                        >
                            AŞIRI YÜKLEME TESPİT EDİLDİ
                        </div>
                    </div>

                    <div
                        style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 6,
                            background: 'rgba(239, 68, 68, 0.25)',
                            border: '1px solid rgba(239, 68, 68, 0.6)',
                            padding: '4px 12px',
                            borderRadius: 10,
                            fontSize: 16,
                            fontWeight: 800,
                            color: '#fecaca',
                        }}
                    >
                        <Flame size={16} color="#ef4444" />
                        <span>CPU %99.4</span>
                    </div>
                </div>

                {/* Main title & Attack details */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
                        <div
                            style={{
                                background: 'linear-gradient(135deg, #b91c1c, #7f1d1d)',
                                padding: 18,
                                borderRadius: 20,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                boxShadow: '0 8px 25px rgba(220, 38, 38, 0.6)',
                            }}
                        >
                            <ServerCrash size={46} color="#ffffff" strokeWidth={2.4} />
                        </div>
                        <div>
                            <div style={{ fontSize: 38, fontWeight: 900, color: '#ffffff', lineHeight: 1.15 }}>
                                {title}
                            </div>
                            <div style={{ fontSize: 20, fontWeight: 600, color: '#fca5a5', marginTop: 4 }}>
                                {description}
                            </div>
                        </div>
                    </div>

                    <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: 15, fontWeight: 700, color: '#94a3b8', letterSpacing: 1 }}>STATUS</div>
                        <div style={{ fontSize: 24, fontWeight: 900, color: '#ef4444' }}>DOWN (503)</div>
                    </div>
                </div>

                {/* Animated Traffic Wave / Equalizer Bars peaking in the RED zone */}
                <div
                    style={{
                        background: 'rgba(10, 15, 30, 0.8)',
                        border: '1.5px solid rgba(239, 68, 68, 0.4)',
                        borderRadius: 20,
                        padding: '16px 20px',
                        display: 'flex',
                        alignItems: 'flex-end',
                        justifyContent: 'space-between',
                        gap: 8,
                        height: 90,
                    }}
                >
                    {bars.map((bar, idx) => (
                        <div
                            key={idx}
                            style={{
                                flex: 1,
                                height: `${bar.heightPercent}%`,
                                borderRadius: 6,
                                background: bar.isCritical
                                    ? 'linear-gradient(180deg, #ef4444 0%, #dc2626 60%, #ea580c 100%)'
                                    : 'linear-gradient(180deg, #f59e0b 0%, #ea580c 100%)',
                                boxShadow: bar.isCritical ? '0 0 14px rgba(239, 68, 68, 0.8)' : 'none',
                                transition: 'height 0.05s ease',
                            }}
                        />
                    ))}
                </div>
            </div>
        </AnimatedCardWrapper>
    );
};
