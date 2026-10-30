import React from 'react';
import { useCurrentFrame } from 'remotion';
import { FileText, FileImage, ArrowRight, ShieldX, Terminal } from 'lucide-react';
import { AnimatedCardWrapper } from './AnimatedCardWrapper';

interface FileHackCardProps {
    durationInFrames: number;
    title?: string;
    description?: string;
}

export const FileHackCard: React.FC<FileHackCardProps> = ({
    durationInFrames,
    title = 'DOSYA YÜKLEME AÇIĞI (BYPASS)',
    description = 'Zararlı Kod Görsel Olarak Maskelendi',
}) => {
    const frame = useCurrentFrame();

    // Micro-motion for arrow and sızıldı pulse
    const arrowOffset = Math.sin(frame * 0.25) * 8;
    const badgeScale = 1 + Math.sin(frame * 0.35) * 0.05;

    return (
        <AnimatedCardWrapper
            durationInFrames={durationInFrames}
            borderColor="rgba(245, 158, 11, 0.75)"
            glowColor="rgba(245, 158, 11, 0.4)"
            top={130}
        >
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                {/* Header Tag */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div
                        style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 8,
                            background: 'rgba(245, 158, 11, 0.16)',
                            border: '1.5px solid rgba(245, 158, 11, 0.5)',
                            padding: '6px 16px',
                            borderRadius: 100,
                        }}
                    >
                        <Terminal size={18} color="#fbbf24" />
                        <span
                            style={{
                                fontSize: 18,
                                fontWeight: 800,
                                color: '#fbbf24',
                                letterSpacing: 1.5,
                            }}
                        >
                            {title}
                        </span>
                    </div>

                    <div
                        style={{
                            fontSize: 18,
                            fontWeight: 700,
                            color: '#94a3b8',
                        }}
                    >
                        {description}
                    </div>
                </div>

                {/* File Morph Transformation Visual */}
                <div
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        background: 'rgba(15, 23, 42, 0.75)',
                        border: '1.5px solid rgba(255, 255, 255, 0.1)',
                        borderRadius: 24,
                        padding: '18px 26px',
                        gap: 16,
                    }}
                >
                    {/* Source: .TXT */}
                    <div
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 16,
                            background: 'rgba(239, 68, 68, 0.12)',
                            border: '1px solid rgba(239, 68, 68, 0.35)',
                            padding: '12px 20px',
                            borderRadius: 18,
                            flex: 1,
                        }}
                    >
                        <div
                            style={{
                                background: '#dc2626',
                                borderRadius: 12,
                                padding: 10,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                            }}
                        >
                            <FileText size={32} color="#ffffff" />
                        </div>
                        <div>
                            <div style={{ fontSize: 24, fontWeight: 900, color: '#fca5a5' }}>.TXT</div>
                            <div style={{ fontSize: 15, color: '#94a3b8', fontWeight: 600 }}>script.txt</div>
                        </div>
                    </div>

                    {/* Animated Arrow */}
                    <div
                        style={{
                            transform: `translateX(${arrowOffset}px)`,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                        }}
                    >
                        <div
                            style={{
                                background: 'rgba(245, 158, 11, 0.2)',
                                borderRadius: '50%',
                                padding: 10,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                border: '1px solid rgba(245, 158, 11, 0.4)',
                            }}
                        >
                            <ArrowRight size={28} color="#fbbf24" strokeWidth={2.8} />
                        </div>
                    </div>

                    {/* Disguise: .PNG */}
                    <div
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 16,
                            background: 'rgba(56, 189, 248, 0.12)',
                            border: '1px solid rgba(56, 189, 248, 0.35)',
                            padding: '12px 20px',
                            borderRadius: 18,
                            flex: 1,
                        }}
                    >
                        <div
                            style={{
                                background: '#0284c7',
                                borderRadius: 12,
                                padding: 10,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                            }}
                        >
                            <FileImage size={32} color="#ffffff" />
                        </div>
                        <div>
                            <div style={{ fontSize: 24, fontWeight: 900, color: '#7dd3fc' }}>.PNG</div>
                            <div style={{ fontSize: 15, color: '#94a3b8', fontWeight: 600 }}>image.png</div>
                        </div>
                    </div>

                    {/* "Sunucuya Sızıldı!" Badge */}
                    <div
                        style={{
                            transform: `scale(${badgeScale})`,
                            background: 'linear-gradient(135deg, #ef4444, #b91c1c)',
                            border: '2px solid rgba(255, 255, 255, 0.4)',
                            borderRadius: 18,
                            padding: '14px 22px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 10,
                            boxShadow: '0 8px 24px rgba(239, 68, 68, 0.65)',
                        }}
                    >
                        <ShieldX size={26} color="#ffffff" strokeWidth={2.6} />
                        <span
                            style={{
                                fontSize: 22,
                                fontWeight: 900,
                                color: '#ffffff',
                                letterSpacing: 0.8,
                                whiteSpace: 'nowrap',
                            }}
                        >
                            Sunucuya Sızıldı!
                        </span>
                    </div>
                </div>
            </div>
        </AnimatedCardWrapper>
    );
};
