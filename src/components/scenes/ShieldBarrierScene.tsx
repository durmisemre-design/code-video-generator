import React from 'react';
import { interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';
import { ShieldCheck, CheckCircle2 } from 'lucide-react';

interface ShieldBarrierSceneProps {
    durationInFrames: number;
}

export const ShieldBarrierScene: React.FC<ShieldBarrierSceneProps> = ({ durationInFrames }) => {
    const frame = useCurrentFrame();
    const { fps } = useVideoConfig();

    // Smooth spring entrance
    const enter = spring({
        frame,
        fps,
        config: { damping: 15, stiffness: 200, mass: 0.6 },
    });

    const exitLead = Math.round(10 * (fps / 60));
    const exit = spring({
        frame: frame - (durationInFrames - exitLead),
        fps,
        config: { damping: 16, stiffness: 220 },
    });

    const progress = Math.max(0, enter - exit);
    const opacity = interpolate(progress, [0, 0.3, 1], [0, 1, 1]);
    const scale = interpolate(progress, [0, 1], [0.9, 1]);
    const translateY = interpolate(progress, [0, 1], [25, 0]);

    // Shield scale pop
    const shieldPop = spring({
        frame: frame - 10,
        fps,
        config: { damping: 12, stiffness: 240, mass: 0.5 },
    });
    const shieldScale = interpolate(shieldPop, [0, 1], [0.85, 1]);

    return (
        <div
            style={{
                position: 'absolute',
                top: 80,
                left: 40,
                right: 40,
                opacity,
                transform: `scale(${scale}) translateY(${translateY}px)`,
                pointerEvents: 'none',
                zIndex: 35,
            }}
        >
            {/* Aydınlık & Kurumsal Apple/Stripe Tarzı Güvenlik Zırhı Penceresi */}
            <div
                style={{
                    position: 'relative',
                    background: 'rgba(255, 255, 255, 0.98)',
                    borderRadius: 24,
                    border: '1.5px solid rgba(255, 255, 255, 0.9)',
                    boxShadow: '0 25px 60px rgba(0, 0, 0, 0.28), 0 2px 10px rgba(0, 0, 0, 0.08)',
                    padding: '24px 32px 30px',
                    overflow: 'hidden',
                }}
            >
                {/* macOS Title Bar */}
                <div
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        borderBottom: '1px solid rgba(15, 23, 42, 0.08)',
                        paddingBottom: 16,
                        marginBottom: 20,
                    }}
                >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{ width: 12, height: 12, borderRadius: '50%', backgroundColor: '#ff5f56' }} />
                        <div style={{ width: 12, height: 12, borderRadius: '50%', backgroundColor: '#ffbd2e' }} />
                        <div style={{ width: 12, height: 12, borderRadius: '50%', backgroundColor: '#27c93f' }} />
                        <span
                            style={{
                                marginLeft: 16,
                                fontSize: 14,
                                fontWeight: 700,
                                letterSpacing: 1.5,
                                color: '#475569',
                                fontFamily: 'monospace',
                            }}
                        >
                            GÜVENLİK_ÇEKİRDEĞİ // SHIELD_ARMED.TS
                        </span>
                    </div>

                    <div
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 6,
                            padding: '4px 12px',
                            borderRadius: 16,
                            background: 'rgba(5, 150, 105, 0.08)',
                            border: '1px solid rgba(5, 150, 105, 0.25)',
                            fontSize: 12,
                            fontWeight: 800,
                            color: '#059669',
                            letterSpacing: 1,
                        }}
                    >
                        <CheckCircle2 size={14} strokeWidth={2} color="#059669" />
                        %100 KORUMA
                    </div>
                </div>

                {/* Hero Title */}
                <div style={{ textAlign: 'center', marginBottom: 20 }}>
                    <div
                        style={{
                            fontSize: 46,
                            fontWeight: 950,
                            color: '#0f172a',
                            textTransform: 'uppercase',
                            letterSpacing: -0.5,
                            lineHeight: 1.1,
                            fontFamily: '-apple-system, BlinkMacSystemFont, "Inter", "Montserrat", sans-serif',
                        }}
                    >
                        GÜVENLİK ZIRHI KURULDU!
                    </div>
                    <div
                        style={{
                            fontSize: 17,
                            fontWeight: 600,
                            color: '#64748b',
                            letterSpacing: 1.5,
                            marginTop: 6,
                            textTransform: 'uppercase',
                        }}
                    >
                        Tüm Güvenlik Protokolleri Aktif Edildi
                    </div>
                </div>

                {/* 3D Shield & Verification Checklist */}
                <div
                    style={{
                        display: 'grid',
                        gridTemplateColumns: 'auto 1fr',
                        alignItems: 'center',
                        gap: 28,
                        background: 'rgba(248, 250, 252, 0.95)',
                        border: '1.5px solid rgba(226, 232, 240, 0.9)',
                        borderRadius: 18,
                        padding: '20px 28px',
                        marginBottom: 10,
                    }}
                >
                    {/* Modern Clean Shield Badge */}
                    <div
                        style={{
                            transform: `scale(${shieldScale})`,
                            width: 90,
                            height: 90,
                            borderRadius: 22,
                            background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
                            boxShadow: '0 8px 25px rgba(5, 150, 105, 0.3)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                        }}
                    >
                        <ShieldCheck size={48} strokeWidth={1.8} color="#ffffff" />
                    </div>

                    {/* Verification Checklist */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 15, fontWeight: 700, color: '#1e293b' }}>
                            <CheckCircle2 size={16} strokeWidth={2} color="#059669" />
                            <span>MIME-Type & Magic Byte Doğrulayıcı: Aktif</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 15, fontWeight: 700, color: '#1e293b' }}>
                            <CheckCircle2 size={16} strokeWidth={2} color="#059669" />
                            <span>DDoS Akıllı Hız Sınırlayıcı (Rate Limiter): Aktif</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 15, fontWeight: 700, color: '#1e293b' }}>
                            <CheckCircle2 size={16} strokeWidth={2} color="#059669" />
                            <span>Sistem Zafiyet Skoru: %100 Güvenli</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
