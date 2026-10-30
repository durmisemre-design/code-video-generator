import React from 'react';
import { interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';
import { Layers, Database, CreditCard, Cloud, CheckCircle2 } from 'lucide-react';

interface SaasEcosystemSceneProps {
    durationInFrames: number;
}

export const SaasEcosystemScene: React.FC<SaasEcosystemSceneProps> = ({ durationInFrames }) => {
    const frame = useCurrentFrame();
    const { fps } = useVideoConfig();

    // Smooth spring entrance
    const enter = spring({
        frame,
        fps,
        config: { damping: 15, stiffness: 200, mass: 0.6 },
    });

    const exitLead = Math.round(12 * (fps / 60));
    const exit = spring({
        frame: frame - (durationInFrames - exitLead),
        fps,
        config: { damping: 16, stiffness: 220 },
    });

    const progress = Math.max(0, enter - exit);
    const opacity = interpolate(progress, [0, 0.3, 1], [0, 1, 1]);
    const scale = interpolate(progress, [0, 1], [0.92, 1]);
    const translateY = interpolate(progress, [0, 1], [25, 0]);

    // Build progress
    const buildProgress = Math.min(100, Math.floor(interpolate(frame, [15, 120], [0, 100], {
        extrapolateLeft: 'clamp',
        extrapolateRight: 'clamp',
    })));

    return (
        <div
            style={{
                position: 'absolute',
                top: 75,
                left: 40,
                right: 40,
                opacity,
                transform: `scale(${scale}) translateY(${translateY}px)`,
                pointerEvents: 'none',
                zIndex: 35,
            }}
        >
            {/* macOS Developer Architecture Window */}
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
                            BULUT MİMARİSİ // v2.4
                        </span>
                    </div>

                    <div
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 6,
                            padding: '4px 12px',
                            borderRadius: 16,
                            background: 'rgba(37, 99, 235, 0.08)',
                            border: '1px solid rgba(37, 99, 235, 0.2)',
                            fontSize: 12,
                            fontWeight: 800,
                            color: '#2563eb',
                            letterSpacing: 1,
                        }}
                    >
                        <span style={{ width: 7, height: 7, borderRadius: '50%', backgroundColor: '#2563eb' }} />
                        CANLI SİSTEM
                    </div>
                </div>

                {/* Hero Title */}
                <div style={{ textAlign: 'center', marginBottom: 20 }}>
                    <div
                        style={{
                            fontSize: 44,
                            fontWeight: 950,
                            color: '#0f172a',
                            textTransform: 'uppercase',
                            letterSpacing: -0.5,
                            lineHeight: 1.1,
                            fontFamily: '-apple-system, BlinkMacSystemFont, "Inter", "Montserrat", sans-serif',
                        }}
                    >
                        DAKİKALAR İÇİNDE SAAS SİSTEMİ
                    </div>
                    <div
                        style={{
                            fontSize: 16,
                            fontWeight: 600,
                            color: '#64748b',
                            letterSpacing: 1.5,
                            marginTop: 6,
                            textTransform: 'uppercase',
                        }}
                    >
                        Modern Web & API Mimarisi Otomatik Kuruluyor
                    </div>
                </div>

                {/* 4 Aydınlık Kurumsal Teknoloji Kartı */}
                <div
                    style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(4, 1fr)',
                        gap: 16,
                        marginBottom: 22,
                    }}
                >
                    {/* Next.js 15 */}
                    <div
                        style={{
                            background: frame >= 72 ? 'rgba(37, 99, 235, 0.1)' : 'rgba(248, 250, 252, 0.9)',
                            border: `1.5px solid ${frame >= 72 ? '#2563eb' : 'rgba(226, 232, 240, 0.8)'}`,
                            borderRadius: 16,
                            padding: '16px 14px',
                            textAlign: 'center',
                            boxShadow: frame >= 72 ? '0 0 20px rgba(37, 99, 235, 0.25)' : '0 4px 15px rgba(0, 0, 0, 0.04)',
                            transform: frame >= 72 && frame <= 85 ? 'scale(0.96)' : 'scale(1)',
                        }}
                    >
                        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 6 }}>
                            <Layers size={24} strokeWidth={1.8} color="#2563eb" />
                        </div>
                        <div style={{ fontSize: 17, fontWeight: 900, color: '#0f172a' }}>NEXT.JS 15</div>
                        <div style={{ fontSize: 13, color: '#2563eb', fontWeight: 700, marginTop: 4 }}>App Router</div>
                    </div>

                    {/* Postgres */}
                    <div
                        style={{
                            background: 'rgba(248, 250, 252, 0.9)',
                            border: '1.5px solid rgba(226, 232, 240, 0.8)',
                            borderRadius: 16,
                            padding: '16px 14px',
                            textAlign: 'center',
                            boxShadow: '0 4px 15px rgba(0, 0, 0, 0.04)',
                        }}
                    >
                        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 6 }}>
                            <Database size={24} strokeWidth={1.8} color="#7c3aed" />
                        </div>
                        <div style={{ fontSize: 17, fontWeight: 900, color: '#0f172a' }}>POSTGRES</div>
                        <div style={{ fontSize: 13, color: '#7c3aed', fontWeight: 700, marginTop: 4 }}>Vector DB</div>
                    </div>

                    {/* Stripe */}
                    <div
                        style={{
                            background: 'rgba(248, 250, 252, 0.9)',
                            border: '1.5px solid rgba(226, 232, 240, 0.8)',
                            borderRadius: 16,
                            padding: '16px 14px',
                            textAlign: 'center',
                            boxShadow: '0 4px 15px rgba(0, 0, 0, 0.04)',
                        }}
                    >
                        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 6 }}>
                            <CreditCard size={24} strokeWidth={1.8} color="#059669" />
                        </div>
                        <div style={{ fontSize: 17, fontWeight: 900, color: '#0f172a' }}>STRIPE</div>
                        <div style={{ fontSize: 13, color: '#059669', fontWeight: 700, marginTop: 4 }}>Abonelik</div>
                    </div>

                    {/* Edge Cloud */}
                    <div
                        style={{
                            background: 'rgba(248, 250, 252, 0.9)',
                            border: '1.5px solid rgba(226, 232, 240, 0.8)',
                            borderRadius: 16,
                            padding: '16px 14px',
                            textAlign: 'center',
                            boxShadow: '0 4px 15px rgba(0, 0, 0, 0.04)',
                        }}
                    >
                        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 6 }}>
                            <Cloud size={24} strokeWidth={1.8} color="#0284c7" />
                        </div>
                        <div style={{ fontSize: 17, fontWeight: 900, color: '#0f172a' }}>EDGE CLOUD</div>
                        <div style={{ fontSize: 13, color: '#0284c7', fontWeight: 700, marginTop: 4 }}>Global Dağıtım</div>
                    </div>
                </div>

                {/* Progress Bar */}
                <div
                    style={{
                        background: 'rgba(241, 245, 249, 0.8)',
                        borderRadius: 14,
                        padding: '12px 20px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        border: '1px solid rgba(203, 213, 225, 0.6)',
                    }}
                >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <CheckCircle2 size={18} strokeWidth={2} color="#059669" />
                        <span style={{ fontSize: 14, fontWeight: 800, color: '#1e293b', letterSpacing: 1 }}>
                            {buildProgress < 100 ? 'SİSTEM DERLENİYOR...' : 'KURULUM TAMAMLANDI (48sn)'}
                        </span>
                    </div>

                    <div style={{ width: 440, height: 8, backgroundColor: 'rgba(203, 213, 225, 0.6)', borderRadius: 4, overflow: 'hidden' }}>
                        <div
                            style={{
                                width: `${buildProgress}%`,
                                height: '100%',
                                background: 'linear-gradient(90deg, #2563eb, #059669)',
                            }}
                        />
                    </div>

                    <div style={{ fontSize: 15, fontWeight: 900, color: '#0f172a', fontFamily: 'monospace' }}>
                        %{buildProgress}
                    </div>
                </div>

                {/* Vector Cursor Arrow */}
                <svg
                    width="28"
                    height="28"
                    viewBox="0 0 32 32"
                    style={{
                        position: 'absolute',
                        left: interpolate(frame, [15, 72], [380, 155], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }),
                        top: interpolate(frame, [15, 72], [340, 240], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }),
                        filter: 'drop-shadow(0 4px 10px rgba(0,0,0,0.25))',
                        pointerEvents: 'none',
                    }}
                >
                    <path
                        d="M 4 4 L 4 26 L 10 20 L 16 30 L 20 28 L 14 18 L 22 18 Z"
                        fill="#2563eb"
                        stroke="#ffffff"
                        strokeWidth="1.5"
                    />
                </svg>
            </div>
        </div>
    );
};
