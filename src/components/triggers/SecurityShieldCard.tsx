import React from 'react';
import { useCurrentFrame } from 'remotion';
import { ShieldCheck, CheckCircle2, Lock } from 'lucide-react';
import { AnimatedCardWrapper } from './AnimatedCardWrapper';

interface SecurityShieldCardProps {
    durationInFrames: number;
    title?: string;
    description?: string;
}

export const SecurityShieldCard: React.FC<SecurityShieldCardProps> = ({
    durationInFrames,
    title = 'GÜVENLİK ZIRHI AKTİF!',
    description = 'Sistem Zırhı Başarıyla Kuruldu',
}) => {
    const frame = useCurrentFrame();

    // Pulse effect
    const pulse = Math.sin(frame * 0.16) * 0.15 + 0.85;

    return (
        <AnimatedCardWrapper
            durationInFrames={durationInFrames}
            borderColor="rgba(34, 197, 94, 0.85)"
            glowColor={`rgba(34, 197, 94, ${0.45 * pulse})`}
            top={140}
        >
            <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
                {/* Glowing Green Shield Badge */}
                <div
                    style={{
                        position: 'relative',
                        background: 'linear-gradient(135deg, #22c55e, #15803d)',
                        padding: 24,
                        borderRadius: 26,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: '0 12px 35px rgba(34, 197, 94, 0.65), inset 0 2px 4px rgba(255,255,255,0.4)',
                        transform: `scale(${1 + (pulse - 0.85) * 0.08})`,
                    }}
                >
                    <ShieldCheck size={56} color="#ffffff" strokeWidth={2.4} />
                    <div
                        style={{
                            position: 'absolute',
                            bottom: -6,
                            right: -6,
                            background: '#052e16',
                            border: '2px solid #22c55e',
                            borderRadius: '50%',
                            padding: 6,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                        }}
                    >
                        <Lock size={18} color="#86efac" />
                    </div>
                </div>

                <div style={{ flex: 1 }}>
                    <div
                        style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 8,
                            background: 'rgba(34, 197, 94, 0.18)',
                            border: '1.5px solid rgba(74, 222, 128, 0.5)',
                            padding: '6px 14px',
                            borderRadius: 100,
                            marginBottom: 8,
                        }}
                    >
                        <CheckCircle2 size={16} color="#4ade80" />
                        <span
                            style={{
                                fontSize: 18,
                                fontWeight: 800,
                                color: '#4ade80',
                                letterSpacing: 2,
                            }}
                        >
                            %100 KORUMA
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
                        {title}
                    </div>

                    <div
                        style={{
                            fontSize: 20,
                            fontWeight: 600,
                            color: '#cbd5e1',
                            marginTop: 6,
                        }}
                    >
                        {description}
                    </div>
                </div>
            </div>
        </AnimatedCardWrapper>
    );
};
