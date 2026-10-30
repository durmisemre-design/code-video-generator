import React from 'react';
import { interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';
import { FileCode, FileCheck, AlertTriangle } from 'lucide-react';

interface FileBypassSceneProps {
    durationInFrames: number;
}

export const FileBypassScene: React.FC<FileBypassSceneProps> = ({ durationInFrames }) => {
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

    // Timeline scrubber position
    const scrubberProgress = interpolate(frame, [20, 110], [0, 100], {
        extrapolateLeft: 'clamp',
        extrapolateRight: 'clamp',
    });

    // Vector cursor arrow moving across
    const cursorX = interpolate(frame, [25, 85], [260, 680], {
        extrapolateLeft: 'clamp',
        extrapolateRight: 'clamp',
    });
    const cursorY = interpolate(frame, [25, 85], [290, 290], {
        extrapolateLeft: 'clamp',
        extrapolateRight: 'clamp',
    });

    // File morph transition
    const isMorphed = frame >= 65;

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
            {/* Aydınlık & Kurumsal Apple/Stripe Tarzı Dosya Denetleyicisi */}
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
                            DOSYA_DENETİM // MIME_VALIDATION.TS
                        </span>
                    </div>

                    <div
                        style={{
                            padding: '4px 12px',
                            borderRadius: 16,
                            background: 'rgba(234, 88, 12, 0.08)',
                            border: '1px solid rgba(234, 88, 12, 0.25)',
                            fontSize: 12,
                            fontWeight: 800,
                            color: '#ea580c',
                            letterSpacing: 1,
                        }}
                    >
                        BYPASS TESTİ
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
                        DOSYA YÜKLEME ZAFİYETİ
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
                        .TXT Dosyası .PNG Maskesiyle Sisteme Yükleniyor
                    </div>
                </div>

                {/* File Inspection Arena */}
                <div
                    style={{
                        display: 'grid',
                        gridTemplateColumns: '1fr auto 1fr',
                        alignItems: 'center',
                        gap: 20,
                        background: 'rgba(248, 250, 252, 0.95)',
                        border: '1.5px solid rgba(226, 232, 240, 0.8)',
                        borderRadius: 16,
                        padding: '20px 24px',
                        marginBottom: 20,
                    }}
                >
                    {/* Left: Original Malicious File */}
                    <div
                        style={{
                            background: 'rgba(254, 242, 242, 0.9)',
                            border: '1.5px solid rgba(254, 202, 202, 0.8)',
                            borderRadius: 12,
                            padding: '14px 16px',
                        }}
                    >
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                            <FileCode size={20} strokeWidth={1.8} color="#dc2626" />
                            <span style={{ fontSize: 16, fontWeight: 800, color: '#b91c1c', fontFamily: 'monospace' }}>
                                payload.txt
                            </span>
                        </div>
                        <div style={{ fontSize: 13, color: '#64748b', fontFamily: 'monospace' }}>
                            &lt;?php system($_GET['cmd']); ?&gt;
                        </div>
                    </div>

                    {/* Middle: Keyframe Timeline & Scrubber */}
                    <div style={{ textAlign: 'center', width: 90 }}>
                        <div style={{ fontSize: 12, fontWeight: 800, color: '#2563eb', letterSpacing: 2, marginBottom: 6 }}>
                            DÖNÜŞÜM
                        </div>
                        <div style={{ width: '100%', height: 4, backgroundColor: 'rgba(203, 213, 225, 0.8)', borderRadius: 2, position: 'relative' }}>
                            <div style={{ width: `${scrubberProgress}%`, height: '100%', backgroundColor: '#2563eb' }} />
                            {/* Keyframe Diamond (◆) */}
                            <div
                                style={{
                                    position: 'absolute',
                                    top: -4,
                                    left: `calc(${scrubberProgress}% - 6px)`,
                                    width: 12,
                                    height: 12,
                                    transform: 'rotate(45deg)',
                                    backgroundColor: '#2563eb',
                                    boxShadow: '0 0 8px rgba(37, 99, 235, 0.5)',
                                }}
                            />
                        </div>
                    </div>

                    {/* Right: Masqueraded Innocent Image */}
                    <div
                        style={{
                            background: isMorphed ? 'rgba(240, 253, 244, 0.9)' : 'rgba(248, 250, 252, 0.9)',
                            border: `1.5px solid ${isMorphed ? 'rgba(187, 247, 208, 0.9)' : 'rgba(226, 232, 240, 0.8)'}`,
                            borderRadius: 12,
                            padding: '14px 16px',
                            transition: 'all 0.3s ease',
                        }}
                    >
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                            <FileCheck size={20} strokeWidth={1.8} color="#059669" />
                            <span style={{ fontSize: 16, fontWeight: 800, color: '#047857', fontFamily: 'monospace' }}>
                                avatar.png
                            </span>
                        </div>
                        <div style={{ fontSize: 13, color: isMorphed ? '#059669' : '#64748b', fontFamily: 'monospace' }}>
                            Content-Type: image/png
                        </div>
                    </div>
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
                            SUNUCUYA SIZMA RİSKİ: ZARARLI DOSYA KABUL EDİLDİ
                        </span>
                    </div>

                    <div style={{ fontSize: 14, fontWeight: 800, color: '#dc2626', fontFamily: 'monospace' }}>
                        DURUM: 200 OK
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
