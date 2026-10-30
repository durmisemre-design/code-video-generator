import React from 'react';
import { useCurrentFrame } from 'remotion';
import { ShieldAlert, Lock, AlertTriangle } from 'lucide-react';
import { AnimatedCardWrapper } from './AnimatedCardWrapper';

interface SecurityAlertCardProps {
    durationInFrames: number;
    title?: string;
    description?: string;
}

export const SecurityAlertCard: React.FC<SecurityAlertCardProps> = ({
    durationInFrames,
    title = 'Güvenlik Açıkları Tespit Edildi!',
    description = 'Yetkisiz Erişim & Veri İhlali Riski',
}) => {
    const frame = useCurrentFrame();

    // Subtle rhythmic pulsing red alert glow
    const pulse = Math.sin(frame * 0.3) * 0.2 + 0.8;
    const glowIntensity = Math.round(pulse * 30);

    return (
        <AnimatedCardWrapper
            durationInFrames={durationInFrames}
            borderColor="rgba(239, 68, 68, 0.85)"
            glowColor={`rgba(239, 68, 68, ${0.45 * pulse})`}
            top={140}
        >
            <div style={{ display: 'flex', alignItems: 'center', gap: 26 }}>
                {/* Glowing red icon container */}
                <div
                    style={{
                        position: 'relative',
                        background: 'linear-gradient(135deg, #ef4444, #b91c1c)',
                        padding: 24,
                        borderRadius: 26,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: `0 0 ${glowIntensity}px rgba(239, 68, 68, 0.9), 0 10px 20px rgba(0,0,0,0.5)`,
                        transform: `scale(${1 + (pulse - 0.8) * 0.08})`,
                    }}
                >
                    <ShieldAlert size={56} color="#ffffff" strokeWidth={2.4} />
                    <div
                        style={{
                            position: 'absolute',
                            bottom: -6,
                            right: -6,
                            background: '#111827',
                            border: '2px solid #ef4444',
                            borderRadius: '50%',
                            padding: 6,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                        }}
                    >
                        <Lock size={18} color="#fca5a5" />
                    </div>
                </div>

                {/* Content */}
                <div style={{ flex: 1 }}>
                    <div
                        style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 8,
                            background: 'rgba(239, 68, 68, 0.18)',
                            border: '1.5px solid rgba(239, 68, 68, 0.5)',
                            padding: '6px 14px',
                            borderRadius: 100,
                            marginBottom: 8,
                        }}
                    >
                        <AlertTriangle size={16} color="#f87171" />
                        <span
                            style={{
                                fontSize: 18,
                                fontWeight: 800,
                                color: '#fca5a5',
                                letterSpacing: 2,
                                textTransform: 'uppercase',
                            }}
                        >
                            KRİTİK UYARI
                        </span>
                    </div>

                    <div
                        style={{
                            fontSize: 40,
                            fontWeight: 900,
                            letterSpacing: -0.5,
                            lineHeight: 1.15,
                            color: '#ffffff',
                            textShadow: '0 2px 10px rgba(0,0,0,0.5)',
                        }}
                    >
                        {title}
                    </div>

                    <div
                        style={{
                            fontSize: 22,
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
