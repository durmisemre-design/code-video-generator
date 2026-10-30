import React from 'react';
import { useCurrentFrame } from 'remotion';
import { MessageCircle, Send, Sparkles, ArrowRight } from 'lucide-react';
import { AnimatedCardWrapper } from './AnimatedCardWrapper';

const InstagramIcon: React.FC<{ size?: number; color?: string }> = ({ size = 20, color = 'currentColor' }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect width="20" height="20" x="2" y="2" rx="5" ry="5"/>
        <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
        <line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/>
    </svg>
);

interface CtaCommentCardProps {
    durationInFrames: number;
    ctaWord?: string;
}

export const CtaCommentCard: React.FC<CtaCommentCardProps> = ({
    durationInFrames,
    ctaWord = 'ZIRH',
}) => {
    const frame = useCurrentFrame();

    // Gentle floating & pulsing effect
    const bounce = Math.sin(frame * 0.28) * 4;
    const glowPulse = Math.sin(frame * 0.22) * 0.2 + 0.8;

    return (
        <AnimatedCardWrapper
            durationInFrames={durationInFrames}
            borderColor="rgba(236, 72, 153, 0.85)"
            glowColor={`rgba(217, 70, 239, ${0.45 * glowPulse})`}
            top={135}
        >
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                {/* Top Badge: AI Prompt & Direct Access */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div
                        style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 8,
                            background: 'linear-gradient(135deg, rgba(236, 72, 153, 0.2), rgba(168, 85, 247, 0.2))',
                            border: '1.5px solid rgba(236, 72, 153, 0.6)',
                            padding: '6px 16px',
                            borderRadius: 100,
                        }}
                    >
                        <Sparkles size={18} color="#f472b6" />
                        <span
                            style={{
                                fontSize: 18,
                                fontWeight: 800,
                                color: '#f472b6',
                                letterSpacing: 1.5,
                            }}
                        >
                            ÖZEL ERİŞİM PROMPTU
                        </span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#e2e8f0', fontSize: 17, fontWeight: 700 }}>
                        <InstagramIcon size={20} color="#e1306c" />
                        <span>Instagram DM Otomasyonu</span>
                    </div>
                </div>

                {/* Main Action Callout */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 22 }}>
                    <div
                        style={{
                            background: 'linear-gradient(135deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%)',
                            padding: 22,
                            borderRadius: 24,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            boxShadow: '0 10px 30px rgba(220, 39, 67, 0.6)',
                            transform: `translateY(${bounce}px)`,
                        }}
                    >
                        <MessageCircle size={52} color="#ffffff" strokeWidth={2.4} />
                    </div>

                    <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 22, fontWeight: 700, color: '#cbd5e1' }}>
                            Hemen Gönderi Altına:
                        </div>
                        <div
                            style={{
                                fontSize: 42,
                                fontWeight: 900,
                                color: '#ffffff',
                                letterSpacing: -0.5,
                                lineHeight: 1.15,
                                marginTop: 2,
                            }}
                        >
                            Yoruma <span style={{ color: '#38bdf8', textShadow: '0 0 24px rgba(56, 189, 248, 0.8)' }}>"{ctaWord}"</span> Yaz
                        </div>
                        <div
                            style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: 8,
                                fontSize: 24,
                                fontWeight: 800,
                                color: '#4ade80',
                                marginTop: 6,
                            }}
                        >
                            <ArrowRight size={22} color="#4ade80" strokeWidth={3} />
                            <span>DM Kutuna Gelsin</span>
                        </div>
                    </div>
                </div>

                {/* Instagram Comment Input Simulation Bar */}
                <div
                    style={{
                        background: 'rgba(255, 255, 255, 0.08)',
                        border: '1.5px solid rgba(255, 255, 255, 0.2)',
                        borderRadius: 22,
                        padding: '14px 22px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                    }}
                >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <div
                            style={{
                                width: 34,
                                height: 34,
                                borderRadius: '50%',
                                background: 'linear-gradient(135deg, #38bdf8, #818cf8)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: 16,
                                fontWeight: 800,
                            }}
                        >
                            Sen
                        </div>
                        <span style={{ fontSize: 22, color: '#f1f5f9', fontWeight: 600 }}>
                            Yoruma <strong style={{ color: '#38bdf8' }}>{ctaWord}</strong> yazıyorsun...
                        </span>
                    </div>

                    <div
                        style={{
                            background: 'linear-gradient(135deg, #0284c7, #2563eb)',
                            borderRadius: 14,
                            padding: '10px 18px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 8,
                            boxShadow: '0 4px 15px rgba(2, 132, 199, 0.4)',
                        }}
                    >
                        <span style={{ fontSize: 18, fontWeight: 800, color: '#ffffff' }}>GÖNDER</span>
                        <Send size={18} color="#ffffff" />
                    </div>
                </div>
            </div>
        </AnimatedCardWrapper>
    );
};
