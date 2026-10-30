import React from 'react';
import { interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';
import { Code2, CheckCircle2 } from 'lucide-react';

interface AiAuditorSceneProps {
    durationInFrames: number;
}

export const AiAuditorScene: React.FC<AiAuditorSceneProps> = ({ durationInFrames }) => {
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
    const scale = interpolate(progress, [0, 1], [0.9, 1]);
    const translateY = interpolate(progress, [0, 1], [25, 0]);

    // Sweeping laser cursor line
    const scanLaserY = interpolate(frame % 90, [0, 90], [0, 170]);

    // Code patch morph
    const isPatched = frame >= 130;
    const patchSpring = spring({
        frame: frame - 130,
        fps,
        config: { damping: 12, stiffness: 240 },
    });
    const patchScale = isPatched ? interpolate(patchSpring, [0, 1], [0.94, 1]) : 1;

    // Audit score counter
    const rawScore = interpolate(frame, [40, 180], [35, 100], {
        extrapolateLeft: 'clamp',
        extrapolateRight: 'clamp',
    });
    const auditScore = Math.floor(rawScore);

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
            {/* Aydınlık & Kurumsal Apple/Stripe Tarzı Kod Denetleyicisi */}
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
                            AI_AUDITOR // PROMPT_SCANNER.TS
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
                            border: '1px solid rgba(37, 99, 235, 0.25)',
                            fontSize: 12,
                            fontWeight: 800,
                            color: '#2563eb',
                            letterSpacing: 1,
                        }}
                    >
                        <Code2 size={14} strokeWidth={2} color="#2563eb" />
                        PROMPT AKTİF
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
                        AI KOD GÜVENLİK DENETLEYİCİSİ
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
                        Tüm Kodları Satır Satır Analiz Eder & Yamalar
                    </div>
                </div>

                {/* Code Editor Window */}
                <div
                    style={{
                        position: 'relative',
                        background: 'rgba(248, 250, 252, 0.95)',
                        border: '1.5px solid rgba(226, 232, 240, 0.9)',
                        borderRadius: 16,
                        padding: '18px 22px',
                        fontFamily: 'monospace',
                        fontSize: 16,
                        lineHeight: 1.7,
                        color: '#0f172a',
                        marginBottom: 20,
                        overflow: 'hidden',
                    }}
                >
                    {/* Laser Cursor Line */}
                    <div
                        style={{
                            position: 'absolute',
                            left: 0,
                            right: 0,
                            top: scanLaserY,
                            height: 2,
                            background: 'linear-gradient(90deg, transparent, #2563eb, #0284c7, transparent)',
                        }}
                    />

                    {/* Code Lines */}
                    <div style={{ color: '#64748b' }}>
                        1 | <span style={{ color: '#7c3aed' }}>import</span> {'{'} sanitizeUpload {'}'}{' '}
                        <span style={{ color: '#7c3aed' }}>from</span> <span style={{ color: '#0284c7' }}>'@defense/shield'</span>;
                    </div>
                    <div style={{ color: '#64748b' }}>
                        2 | <span style={{ color: '#ea580c' }}>function</span> <span style={{ color: '#2563eb' }}>handleFile</span>(req, res) {'{'}
                    </div>

                    {!isPatched ? (
                        <div
                            style={{
                                background: 'rgba(254, 242, 242, 0.9)',
                                borderLeft: '4px solid #dc2626',
                                paddingLeft: 8,
                                color: '#b91c1c',
                                fontWeight: 600,
                            }}
                        >
                            3 | &nbsp;&nbsp;fs.save(req.file.name); <span style={{ color: '#dc2626', fontWeight: 800 }}>// GÜVENLİK AÇIĞI!</span>
                        </div>
                    ) : (
                        <div
                            style={{
                                transform: `scale(${patchScale})`,
                                background: 'rgba(240, 253, 244, 0.9)',
                                borderLeft: '4px solid #059669',
                                paddingLeft: 8,
                                color: '#047857',
                                fontWeight: 600,
                                transition: 'all 0.2s ease',
                            }}
                        >
                            3 | &nbsp;&nbsp;await sanitizeUpload(req.file); <span style={{ color: '#059669', fontWeight: 800 }}>// OTOMATİK YAMALANDI</span>
                        </div>
                    )}

                    <div style={{ color: '#64748b' }}>
                        4 | {'}'}
                    </div>
                </div>

                {/* Audit Health Progress Bar */}
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
                        <CheckCircle2 size={18} strokeWidth={2} color={auditScore === 100 ? '#059669' : '#ea580c'} />
                        <span style={{ fontSize: 14, fontWeight: 800, color: '#1e293b', letterSpacing: 1 }}>
                            GÜVENLİK DENETİM SKORU:
                        </span>
                    </div>

                    <div style={{ width: 420, height: 8, backgroundColor: 'rgba(203, 213, 225, 0.6)', borderRadius: 4, overflow: 'hidden' }}>
                        <div
                            style={{
                                width: `${auditScore}%`,
                                height: '100%',
                                background: auditScore === 100
                                    ? 'linear-gradient(90deg, #2563eb, #059669)'
                                    : 'linear-gradient(90deg, #ea580c, #f59e0b)',
                                transition: 'width 0.1s linear',
                            }}
                        />
                    </div>

                    <div
                        style={{
                            fontSize: 16,
                            fontWeight: 900,
                            color: auditScore === 100 ? '#059669' : '#ea580c',
                            fontFamily: 'monospace',
                        }}
                    >
                        %{auditScore}
                    </div>
                </div>
            </div>
        </div>
    );
};
