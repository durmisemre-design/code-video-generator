import React from 'react';
import { interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';
import { ShieldAlert, AlertTriangle } from 'lucide-react';

interface RedAlertSceneProps {
    durationInFrames: number;
}

export const RedAlertScene: React.FC<RedAlertSceneProps> = ({ durationInFrames }) => {
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

    // Vector cursor gliding in
    const cursorX = interpolate(frame, [10, 45], [780, 520], {
        extrapolateLeft: 'clamp',
        extrapolateRight: 'clamp',
    });
    const cursorY = interpolate(frame, [10, 45], [360, 250], {
        extrapolateLeft: 'clamp',
        extrapolateRight: 'clamp',
    });

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
            {/* Aydınlık & Kurumsal Apple/Stripe Tarzı Güvenlik Penceresi */}
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
                            GÜVENLİK DENETİMİ // AUDIT_SCAN.SH
                        </span>
                    </div>

                    <div
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 6,
                            padding: '4px 12px',
                            borderRadius: 16,
                            background: 'rgba(220, 38, 38, 0.08)',
                            border: '1px solid rgba(220, 38, 38, 0.25)',
                            fontSize: 12,
                            fontWeight: 800,
                            color: '#dc2626',
                            letterSpacing: 1,
                        }}
                    >
                        <ShieldAlert size={14} strokeWidth={2} color="#dc2626" />
                        KRİTİK UYARI
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
                        PEKİ GÜVENLİK AÇIKLARI?
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
                        Sistem Mimarisi Zafiyet Taraması
                    </div>
                </div>

                {/* Vector Inspection Container with Corner Anchor Handles */}
                <div
                    style={{
                        position: 'relative',
                        background: 'rgba(248, 250, 252, 0.95)',
                        border: '1.5px dashed rgba(37, 99, 235, 0.6)',
                        borderRadius: 14,
                        padding: '18px 24px',
                        fontFamily: 'monospace',
                        color: '#0f172a',
                        fontSize: 15,
                        lineHeight: 1.8,
                    }}
                >
                    {/* 4 Vector Bounding Box Corner Handles */}
                    <div style={{ position: 'absolute', top: -5, left: -5, width: 10, height: 10, backgroundColor: '#2563eb', border: '1px solid #fff' }} />
                    <div style={{ position: 'absolute', top: -5, right: -5, width: 10, height: 10, backgroundColor: '#2563eb', border: '1px solid #fff' }} />
                    <div style={{ position: 'absolute', bottom: -5, left: -5, width: 10, height: 10, backgroundColor: '#2563eb', border: '1px solid #fff' }} />
                    <div style={{ position: 'absolute', bottom: -5, right: -5, width: 10, height: 10, backgroundColor: '#2563eb', border: '1px solid #fff' }} />

                    <div style={{ color: '#2563eb', fontWeight: 700 }}>$ npx audit-ci --critical</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#dc2626', fontWeight: 800 }}>
                        <AlertTriangle size={16} strokeWidth={2} color="#dc2626" />
                        <span>[!] 1 KRİTİK GÜVENLİK AÇIĞI TESPİT EDİLDİ</span>
                    </div>
                    <div style={{ color: '#334155' }}>
                        &gt; CVE-2024-FILE-BYPASS: Doğrulanmamış Dosya Yükleme Zafiyeti
                    </div>
                    <div style={{ color: '#64748b', fontSize: 13 }}>
                        Kritiklik Skoru: 9.8 / 10 • Acil Yama Gerekiyor
                    </div>
                </div>

                {/* Vector Cursor Arrow */}
                <svg
                    width="28"
                    height="28"
                    viewBox="0 0 32 32"
                    style={{
                        position: 'absolute',
                        left: cursorX,
                        top: cursorY,
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
