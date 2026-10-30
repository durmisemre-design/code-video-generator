import React from 'react';
import { useCurrentFrame } from 'remotion';
import { Bot, Sparkles, Terminal, CheckCircle2 } from 'lucide-react';
import { AnimatedCardWrapper } from './AnimatedCardWrapper';

interface AiPromptCardProps {
    durationInFrames: number;
    title?: string;
    description?: string;
}

export const AiPromptCard: React.FC<AiPromptCardProps> = ({
    durationInFrames,
    title = 'AI SECURITY AUDITOR',
    description = 'Tüm Kodları Derinlemesine Tarar',
}) => {
    const frame = useCurrentFrame();

    // Pulse effect
    const pulse = Math.sin(frame * 0.12) * 0.15 + 0.85;

    return (
        <AnimatedCardWrapper
            durationInFrames={durationInFrames}
            borderColor="rgba(168, 85, 247, 0.85)"
            glowColor={`rgba(147, 51, 234, ${0.45 * pulse})`}
            top={140}
        >
            <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
                    {/* Glowing Purple Bot Badge */}
                    <div
                        style={{
                            background: 'linear-gradient(135deg, #9333ea, #4f46e5)',
                            padding: 24,
                            borderRadius: 26,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            boxShadow: '0 12px 35px rgba(147, 51, 234, 0.65), inset 0 2px 4px rgba(255,255,255,0.4)',
                            transform: `scale(${1 + (pulse - 0.85) * 0.08})`,
                        }}
                    >
                        <Bot size={54} color="#ffffff" strokeWidth={2.4} />
                    </div>

                    <div style={{ flex: 1 }}>
                        <div
                            style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: 8,
                                background: 'rgba(168, 85, 247, 0.18)',
                                border: '1.5px solid rgba(192, 132, 252, 0.5)',
                                padding: '6px 14px',
                                borderRadius: 100,
                                marginBottom: 8,
                            }}
                        >
                            <Sparkles size={16} color="#c084fc" />
                            <span
                                style={{
                                    fontSize: 18,
                                    fontWeight: 800,
                                    color: '#c084fc',
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
                    </div>
                </div>

                {/* Cyber Terminal Analysis Bar */}
                <div
                    style={{
                        background: 'rgba(15, 23, 42, 0.8)',
                        border: '1.5px solid rgba(168, 85, 247, 0.3)',
                        borderRadius: 20,
                        padding: '14px 22px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                    }}
                >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <Terminal size={20} color="#c084fc" />
                        <span style={{ fontSize: 20, color: '#e2e8f0', fontFamily: 'monospace', fontWeight: 700 }}>
                            &gt; prompt.run(&quot;audit_full_codebase&quot;)
                        </span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#4ade80', fontSize: 18, fontWeight: 800 }}>
                        <CheckCircle2 size={18} color="#4ade80" />
                        <span>Analiz Tamamlandı</span>
                    </div>
                </div>
            </div>
        </AnimatedCardWrapper>
    );
};
