import React from 'react';
import { interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';
import { Activity, AlertTriangle } from 'lucide-react';

interface DdosOverloadSceneProps {
    durationInFrames: number;
}

export const DdosOverloadScene: React.FC<DdosOverloadSceneProps> = ({ durationInFrames }) => {
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

    // Live request counter
    const rawReqs = interpolate(frame, [0, 80], [12000, 2480900], {
        extrapolateRight: 'clamp',
    });
    const formattedReqs = Math.floor(rawReqs).toLocaleString('tr-TR');

    // Graph line path draw
    const graphDraw = interpolate(frame, [10, 80], [0, 100], {
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
            {/* Aydınlık & Kurumsal Apple/Stripe Tarzı Trafik Denetleyicisi */}
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
                            SUNUCU_MONİTÖR // NETWORK_LOAD.SH
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
                        <Activity size={14} strokeWidth={2} color="#dc2626" />
                        AŞIRI TRAFİK
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
                        AŞIRI YÜKLEME & DDOS
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
                        Sunucu Trafiği ve Aşırı Yük Analizi
                    </div>
                </div>

                {/* Vector Traffic Chart */}
                <div
                    style={{
                        background: 'rgba(248, 250, 252, 0.95)',
                        border: '1.5px solid rgba(226, 232, 240, 0.8)',
                        borderRadius: 16,
                        padding: '18px 24px',
                        marginBottom: 20,
                    }}
                >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 12 }}>
                        <span style={{ fontSize: 13, fontWeight: 700, color: '#64748b', letterSpacing: 1.5, textTransform: 'uppercase' }}>
                            ANLIK İSTEK TRAFİĞİ (REQ / SEC)
                        </span>
                        <span style={{ fontSize: 38, fontWeight: 950, color: '#dc2626', fontFamily: 'monospace', fontVariantNumeric: 'tabular-nums' }}>
                            {formattedReqs}
                        </span>
                    </div>

                    {/* Smooth Vector Exponential Curve */}
                    <svg width="100%" height="80" viewBox="0 0 880 80" style={{ overflow: 'visible' }}>
                        <line x1="0" y1="20" x2="880" y2="20" stroke="rgba(0,0,0,0.06)" strokeWidth="1" strokeDasharray="4 4" />
                        <line x1="0" y1="50" x2="880" y2="50" stroke="rgba(0,0,0,0.06)" strokeWidth="1" strokeDasharray="4 4" />
                        <line x1="0" y1="75" x2="880" y2="75" stroke="rgba(0,0,0,0.06)" strokeWidth="1" strokeDasharray="4 4" />

                        <path
                            d="M 20 75 Q 400 70, 620 45 T 860 15"
                            fill="none"
                            stroke="#dc2626"
                            strokeWidth="3.5"
                            strokeLinecap="round"
                            strokeDasharray="900"
                            strokeDashoffset={900 - (900 * graphDraw) / 100}
                        />

                        {graphDraw > 90 && (
                            <circle cx="860" cy="15" r="5" fill="#dc2626" stroke="#ffffff" strokeWidth="2" />
                        )}
                    </svg>
                </div>

                {/* Status Pill */}
                <div
                    style={{
                        background: 'rgba(254, 242, 242, 0.9)',
                        border: '1.5px solid rgba(254, 202, 202, 0.9)',
                        borderRadius: 12,
                        padding: '14px 22px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                    }}
                >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <AlertTriangle size={18} strokeWidth={2} color="#dc2626" />
                        <span style={{ fontSize: 15, fontWeight: 800, color: '#991b1b', letterSpacing: 1 }}>
                            HTTP 503 • SERVICE UNAVAILABLE
                        </span>
                    </div>

                    <div style={{ fontSize: 14, fontWeight: 800, color: '#dc2626', fontFamily: 'monospace' }}>
                        CPU: %99.8 (AŞIRI YÜK)
                    </div>
                </div>
            </div>
        </div>
    );
};
