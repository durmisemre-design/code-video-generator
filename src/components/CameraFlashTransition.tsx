import React from 'react';
import { interpolate, useCurrentFrame } from 'remotion';

export const CameraFlashTransition: React.FC = () => {
    const frame = useCurrentFrame();

    // Kamera Flaş & Deklanşör Görsel Efekti (Toplam 10 kare / ~0.16s)
    // 0. karede anlık beyaz patlama, 8. karede tamamen pürüzsüz kaybolma
    const flashOpacity = interpolate(frame, [0, 1, 8], [0.85, 0.50, 0], {
        extrapolateLeft: 'clamp',
        extrapolateRight: 'clamp',
    });

    const scale = interpolate(frame, [0, 8], [1.02, 1.0], {
        extrapolateLeft: 'clamp',
        extrapolateRight: 'clamp',
    });

    if (flashOpacity <= 0) {
        return null;
    }

    return (
        <div
            style={{
                position: 'absolute',
                inset: 0,
                width: '100%',
                height: '100%',
                pointerEvents: 'none',
                zIndex: 999,
                transform: `scale(${scale})`,
            }}
        >
            {/* 1. Beyaz Flaş & Radyal Işık Parlaması */}
            <div
                style={{
                    position: 'absolute',
                    inset: 0,
                    backgroundColor: `rgba(255, 255, 255, ${flashOpacity})`,
                    boxShadow: `inset 0 0 120px rgba(255, 255, 255, ${flashOpacity})`,
                }}
            />

            {/* 2. Modern Kamera Vizör / Deklanşör Köşe İşaretleri (Kamera Efekti Hissi) */}
            <div
                style={{
                    position: 'absolute',
                    inset: 40,
                    opacity: flashOpacity * 1.2,
                }}
            >
                {/* Sol Üst Köşe */}
                <div
                    style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: 36,
                        height: 36,
                        borderTop: '4px solid #FFFFFF',
                        borderLeft: '4px solid #FFFFFF',
                        borderRadius: '4px 0 0 0',
                        boxShadow: '0 0 12px rgba(255, 255, 255, 0.8)',
                    }}
                />
                {/* Sağ Üst Köşe */}
                <div
                    style={{
                        position: 'absolute',
                        top: 0,
                        right: 0,
                        width: 36,
                        height: 36,
                        borderTop: '4px solid #FFFFFF',
                        borderRight: '4px solid #FFFFFF',
                        borderRadius: '0 4px 0 0',
                        boxShadow: '0 0 12px rgba(255, 255, 255, 0.8)',
                    }}
                />
                {/* Sol Alt Köşe */}
                <div
                    style={{
                        position: 'absolute',
                        bottom: 0,
                        left: 0,
                        width: 36,
                        height: 36,
                        borderBottom: '4px solid #FFFFFF',
                        borderLeft: '4px solid #FFFFFF',
                        borderRadius: '0 0 0 4px',
                        boxShadow: '0 0 12px rgba(255, 255, 255, 0.8)',
                    }}
                />
                {/* Sağ Alt Köşe */}
                <div
                    style={{
                        position: 'absolute',
                        bottom: 0,
                        right: 0,
                        width: 36,
                        height: 36,
                        borderBottom: '4px solid #FFFFFF',
                        borderRight: '4px solid #FFFFFF',
                        borderRadius: '0 0 4px 0',
                        boxShadow: '0 0 12px rgba(255, 255, 255, 0.8)',
                    }}
                />
            </div>
        </div>
    );
};

