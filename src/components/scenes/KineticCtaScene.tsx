import React from 'react';
import { interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';
import { MessageSquare, Send, ArrowDown, CheckCircle2 } from 'lucide-react';

interface KineticCtaSceneProps {
    durationInFrames: number;
    ctaWord?: string;
}

export const KineticCtaScene: React.FC<KineticCtaSceneProps> = ({
    durationInFrames,
    ctaWord = 'ZIRH',
}) => {
    const frame = useCurrentFrame();
    const { fps } = useVideoConfig();

    // Smooth spring entrance
    const enter = spring({
        frame,
        fps,
        config: { damping: 15, stiffness: 200, mass: 0.6 },
    });

    const progress = enter;
    const opacity = interpolate(progress, [0, 0.3, 1], [0, 1, 1]);
    const scale = interpolate(progress, [0, 1], [0.9, 1]);

    // Letter-by-letter typing simulation for "ZIRH"
    const typedLength = Math.min(
        ctaWord.length,
        Math.floor(interpolate(frame, [15, 45], [0, ctaWord.length], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }))
    );
    const displayedTyped = ctaWord.slice(0, typedLength);
    const showCursor = frame < 65 && Math.sin(frame * 0.4) > 0;

    // Send button click
    const isSent = frame >= 55;
    const sendClickSpring = spring({
        frame: frame - 55,
        fps,
        config: { damping: 10, stiffness: 280 },
    });
    const sendScale = isSent ? interpolate(sendClickSpring, [0, 0.5, 1], [1, 0.85, 1]) : 1;

    // Push notification banner entrance
    const notifySpring = spring({
        frame: frame - 65,
        fps,
        config: { damping: 14, stiffness: 220 },
    });
    const notifyY = interpolate(notifySpring, [0, 1], [-70, 0]);
    const notifyOpacity = interpolate(notifySpring, [0, 0.3, 1], [0, 1, 1]);

    // Bouncing downward arrow
    const arrowBounce = Math.sin(frame * 0.2) * 8;

    return (
        <div
            style={{
                position: 'absolute',
                top: 80,
                left: 40,
                right: 40,
                opacity,
                transform: `scale(${scale})`,
                pointerEvents: 'none',
                zIndex: 35,
            }}
        >
            {/* Apple Dynamic Island / iOS Push Notification Banner */}
            {frame >= 65 && (
                <div
                    style={{
                        transform: `translateY(${notifyY}px)`,
                        opacity: notifyOpacity,
                        background: 'rgba(255, 255, 255, 0.96)',
                        border: '1.5px solid rgba(37, 99, 235, 0.4)',
                        borderRadius: 20,
                        padding: '12px 24px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 14,
                        boxShadow: '0 15px 35px rgba(0, 0, 0, 0.15)',
                        marginBottom: 16,
                    }}
                >
                    <div
                        style={{
                            width: 38,
                            height: 38,
                            borderRadius: '50%',
                            background: '#2563eb',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                        }}
                    >
                        <MessageSquare size={20} strokeWidth={2} color="#ffffff" />
                    </div>
                    <div>
                        <div style={{ fontSize: 15, fontWeight: 900, color: '#0f172a' }}>
                            AI Güvenlik Asistanı
                        </div>
                        <div style={{ fontSize: 13, color: '#2563eb', fontWeight: 700 }}>
                            Güvenlik Zırhı Prompt Paketi DM Kutunuza Gönderildi!
                        </div>
                    </div>
                </div>
            )}

            {/* Aydınlık & Kurumsal Apple/Stripe Tarzı CTA Penceresi */}
            <div
                style={{
                    position: 'relative',
                    background: 'rgba(255, 255, 255, 0.98)',
                    borderRadius: 24,
                    border: '1.5px solid rgba(255, 255, 255, 0.9)',
                    boxShadow: '0 25px 60px rgba(0, 0, 0, 0.28), 0 2px 10px rgba(0, 0, 0, 0.08)',
                    padding: '28px 32px 32px',
                    textAlign: 'center',
                    overflow: 'hidden',
                }}
            >
                {/* Hero Title */}
                <div
                    style={{
                        fontSize: 52,
                        fontWeight: 950,
                        color: '#0f172a',
                        textTransform: 'uppercase',
                        letterSpacing: -0.5,
                        lineHeight: 1.1,
                        fontFamily: '-apple-system, BlinkMacSystemFont, "Inter", "Montserrat", sans-serif',
                        marginBottom: 8,
                    }}
                >
                    YORUMA <span style={{ color: '#2563eb' }}>"{ctaWord}"</span> YAZIN!
                </div>

                <div
                    style={{
                        fontSize: 18,
                        fontWeight: 700,
                        color: '#64748b',
                        letterSpacing: 1.5,
                        textTransform: 'uppercase',
                        marginBottom: 22,
                    }}
                >
                    Tüm Güvenlik Prompt Paketini Direkt Paylaşayım
                </div>

                {/* Simulated Comment Input Bar */}
                <div
                    style={{
                        background: 'rgba(248, 250, 252, 0.95)',
                        border: '1.5px solid rgba(203, 213, 225, 0.8)',
                        borderRadius: 24,
                        padding: '10px 14px 10px 20px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        boxShadow: '0 4px 15px rgba(0, 0, 0, 0.04)',
                        marginBottom: 18,
                    }}
                >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <MessageSquare size={20} strokeWidth={2} color="#64748b" />

                        <div style={{ fontSize: 20, fontWeight: 900, color: '#0f172a', fontFamily: 'monospace' }}>
                            {displayedTyped}
                            {showCursor && <span style={{ color: '#2563eb' }}>|</span>}
                            {!displayedTyped && (
                                <span style={{ color: '#94a3b8', fontWeight: 600 }}>
                                    Yorum yazın...
                                </span>
                            )}
                        </div>
                    </div>

                    {/* Send Button */}
                    <div
                        style={{
                            transform: `scale(${sendScale})`,
                            background: isSent ? '#059669' : '#2563eb',
                            color: '#ffffff',
                            padding: '8px 20px',
                            borderRadius: 18,
                            fontWeight: 800,
                            fontSize: 14,
                            letterSpacing: 0.5,
                            display: 'flex',
                            alignItems: 'center',
                            gap: 6,
                            boxShadow: isSent ? '0 4px 15px rgba(5, 150, 105, 0.3)' : '0 4px 15px rgba(37, 99, 235, 0.3)',
                            transition: 'all 0.2s ease',
                        }}
                    >
                        {isSent ? (
                            <>
                                <CheckCircle2 size={16} strokeWidth={2} color="#ffffff" />
                                <span>GÖNDERİLDİ</span>
                            </>
                        ) : (
                            <>
                                <span>GÖNDER</span>
                                <Send size={14} strokeWidth={2} color="#ffffff" />
                            </>
                        )}
                    </div>
                </div>

                {/* Bouncing Downward Indicator */}
                <div
                    style={{
                        transform: `translateY(${arrowBounce}px)`,
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        gap: 10,
                        color: '#2563eb',
                        fontSize: 16,
                        fontWeight: 900,
                    }}
                >
                    <ArrowDown size={18} strokeWidth={2.5} color="#2563eb" />
                    <span style={{ letterSpacing: 2, textTransform: 'uppercase' }}>
                        AŞAĞIDAN YORUM YAPIN
                    </span>
                    <ArrowDown size={18} strokeWidth={2.5} color="#2563eb" />
                </div>
            </div>
        </div>
    );
};
