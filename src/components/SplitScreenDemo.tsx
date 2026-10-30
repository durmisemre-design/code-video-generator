import React from 'react';
import { AbsoluteFill, OffthreadVideo, Sequence, staticFile } from 'remotion';

export const SplitScreenDemo: React.FC = () => {
    return (
        <AbsoluteFill style={{ backgroundColor: '#000000', overflow: 'hidden' }}>
            {/* 1. ÜST YARIM (0 - 960px): Ekran Kayıtları */}
            <div
                style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: 1080,
                    height: 960,
                    overflow: 'hidden',
                    backgroundColor: '#0c0d12',
                }}
            >
                {/* 1. Aşama (0 - 360 frame / 6.0 sn): Antigravity IDE Açılışı (Sabit Ön-Zoomlu) */}
                <Sequence from={0} durationInFrames={360}>
                    <div
                        style={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            width: 1080,
                            height: 960,
                            overflow: 'hidden',
                        }}
                    >
                        <OffthreadVideo
                            src={staticFile('screen-cfr.mp4')}
                            startFrom={Math.round(8.0 * 60)}
                            pauseWhenBuffering={true}
                            muted={true}
                            style={{
                                position: 'absolute',
                                left: -778,
                                top: -261,
                                width: 1920,
                                height: 1080,
                                transform: 'scale(1.6)',
                                transformOrigin: '0 0',
                            }}
                        />
                    </div>
                </Sequence>

                {/* 2. Aşama (360 - 720 frame / 6.0 sn): Prompt Gönderimi (Sabit Ön-Zoomlu) */}
                <Sequence from={360} durationInFrames={360}>
                    <div
                        style={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            width: 1080,
                            height: 960,
                            overflow: 'hidden',
                        }}
                    >
                        <OffthreadVideo
                            src={staticFile('screen-cfr.mp4')}
                            startFrom={Math.round(24.5 * 60)}
                            pauseWhenBuffering={true}
                            muted={true}
                            style={{
                                position: 'absolute',
                                left: -2295,
                                top: -80,
                                width: 1920,
                                height: 1080,
                                transform: 'scale(1.75)',
                                transformOrigin: '0 0',
                            }}
                        />
                    </div>
                </Sequence>

                {/* 3. Aşama (720 - 1080 frame / 6.0 sn): Kod ve Ajan Analizi (Sabit Zoomlu & 3x Hızlandırılmış) */}
                <Sequence from={720} durationInFrames={360}>
                    <div
                        style={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            width: 1080,
                            height: 960,
                            overflow: 'hidden',
                        }}
                    >
                        <OffthreadVideo
                            src={staticFile('screen-cfr.mp4')}
                            startFrom={Math.round(33.0 * 60)}
                            playbackRate={3.0}
                            pauseWhenBuffering={true}
                            muted={true}
                            style={{
                                position: 'absolute',
                                left: -2225,
                                top: -185,
                                width: 1920,
                                height: 1080,
                                transform: 'scale(1.75)',
                                transformOrigin: '0 0',
                            }}
                        />
                    </div>
                </Sequence>

                {/* 4. Aşama (1080 - 1578 frame / 8.3 sn): Video Programını Tanıtırken (Tam Genişlik, Siyah Boşluksuz) */}
                <Sequence from={1080} durationInFrames={498}>
                    <div
                        style={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            width: 1080,
                            height: 960,
                            overflow: 'hidden',
                            backgroundColor: '#0c0d12',
                        }}
                    >
                        <OffthreadVideo
                            src={staticFile('prog-cfr.mp4')}
                            startFrom={Math.round(6.0 * 60)}
                            playbackRate={1.0}
                            pauseWhenBuffering={true}
                            muted={true}
                            style={{
                                width: 1080,
                                height: 960,
                                objectFit: 'cover',
                                transform: 'scale(1.15)',
                                transformOrigin: 'center center',
                            }}
                        />
                    </div>
                </Sequence>
            </div>

            {/* 2. ORTA AYIRICI ÇİZGİ (Modern Sleek Glowing Divider at y=958) */}
            <div
                style={{
                    position: 'absolute',
                    top: 958,
                    left: 0,
                    width: 1080,
                    height: 4,
                    background:
                        'linear-gradient(90deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.95) 50%, rgba(255,255,255,0.05) 100%)',
                    boxShadow: '0 0 16px rgba(255, 255, 255, 0.55)',
                    zIndex: 60,
                }}
            />

            {/* 3. ALT YARIM (960 - 1920px): Kullanıcının 2. Videosu */}
            {/* Sıfır zoom (scale: 1, %100 orijinal 4K piksel kalitesi), kafayı kesmeyen ferah tavan payı (top: -780px) */}
            <div
                style={{
                    position: 'absolute',
                    top: 960,
                    left: 0,
                    width: 1080,
                    height: 960,
                    overflow: 'hidden',
                    backgroundColor: '#000000',
                }}
            >
                <OffthreadVideo
                    src={staticFile('v2-4k-60fps.mp4')}
                    pauseWhenBuffering={true}
                    muted={true}
                    style={{
                        position: 'absolute',
                        left: 0,
                        top: -780,
                        width: 1080,
                        height: 1920,
                        objectFit: 'cover',
                    }}
                />
            </div>
        </AbsoluteFill>
    );
};
