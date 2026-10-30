import React from 'react';
import { interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';

export const CallToAction: React.FC = () => {
    const frame = useCurrentFrame();
    const { fps } = useVideoConfig();

    // Yaylanarak geliş efekti
    const entrance = spring({
        frame,
        fps,
        config: {
            damping: 14,
            mass: 0.6,
            stiffness: 180,
        },
    });

    const scale = interpolate(entrance, [0, 1], [0.85, 1]);
    const opacity = interpolate(entrance, [0, 1], [0, 1]);

    // Hafif dikkat çekici nabız (pulse) efekti
    const pulse = 1 + 0.02 * Math.sin((frame / fps) * Math.PI * 2);

    return (
        <div
            style={{
                position: 'absolute',
                top: 600,
                left: 50,
                right: 50,
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                zIndex: 90,
                transform: `scale(${scale * pulse})`,
                opacity,
                pointerEvents: 'none',
            }}
        >
            {/* Kullanıcının Tercihi: Beyaz Kutu, Büyük ve Belirgin Yazı */}
            <div
                style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '36px 44px',
                    borderRadius: 36,
                    backgroundColor: '#FFFFFF',
                    border: '3px solid rgba(255, 255, 255, 0.9)',
                    boxShadow:
                        '0 30px 70px rgba(0, 0, 0, 0.65), 0 8px 24px rgba(0, 0, 0, 0.25)',
                    textAlign: 'center',
                    width: '100%',
                    maxWidth: 920,
                }}
            >
                {/* Üst Satır: Yoruma EDİTÖR Yaz */}
                <div
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 14,
                        marginBottom: 12,
                        flexWrap: 'nowrap',
                    }}
                >
                    <span style={{ fontSize: 40, lineHeight: 1 }}>💬</span>
                    <span
                        style={{
                            fontFamily:
                                '"Montserrat", "Inter", -apple-system, sans-serif',
                            fontSize: 36,
                            fontWeight: 800,
                            letterSpacing: '0.04em',
                            color: '#0F172A',
                            textTransform: 'uppercase',
                        }}
                    >
                        Yoruma
                    </span>
                    <span
                        style={{
                            fontFamily:
                                '"Montserrat", "Inter", -apple-system, sans-serif',
                            fontSize: 44,
                            fontWeight: 900,
                            letterSpacing: '0.04em',
                            color: '#0284C7',
                            backgroundColor: '#E0F2FE',
                            padding: '6px 22px',
                            borderRadius: 16,
                            border: '2px solid #BAE6FD',
                            textShadow: '0 1px 3px rgba(2, 132, 199, 0.25)',
                        }}
                    >
                        EDİTÖR
                    </span>
                    <span
                        style={{
                            fontFamily:
                                '"Montserrat", "Inter", -apple-system, sans-serif',
                            fontSize: 36,
                            fontWeight: 800,
                            letterSpacing: '0.04em',
                            color: '#0F172A',
                            textTransform: 'uppercase',
                        }}
                    >
                        Yaz
                    </span>
                </div>

                {/* Alt Satır: Sana Hemen Göndereyim */}
                <span
                    style={{
                        fontFamily:
                            '"Montserrat", "Inter", -apple-system, sans-serif',
                        fontSize: 34,
                        fontWeight: 800,
                        color: '#1E293B',
                        letterSpacing: '-0.01em',
                    }}
                >
                    Sana Hemen Göndereyim! 🚀
                </span>
            </div>
        </div>
    );
};
