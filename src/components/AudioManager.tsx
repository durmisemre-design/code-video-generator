import React from 'react';
import { Audio, Sequence, interpolate, staticFile } from 'remotion';

export const AudioManager: React.FC = () => {
    // 1. ARKA PLAN MÜZİĞİ SES KONTROLÜ
    // Girişte vokale yol verir, 2. ve 3. anlatımda enerjik phonk ritmi dengeli duyulur
    const musicVolume = (f: number) =>
        interpolate(
            f,
            [0, 1530, 3780, 3840],
            [0.20, 0.42, 0.42, 0.0],
            {
                extrapolateLeft: 'clamp',
                extrapolateRight: 'clamp',
            }
        );

    return (
        <>
            {/* =========================================================================
                1. MASTER SES EFEKTLERİ KANALI (Tek ve Kesintisiz Akış)
                - Eski orijinal giriş sesi (viral-intro-whoosh) 0.0s'de
                - Yakınlaştırma/uzaklaştırma whoosh sesleri
                - Mouse tıklama sesleri (video kaydındaki anlar)
                - Kamera geçiş deklanşör sesleri
                - Ekrana kart/yazı geldiğindeki pop sesleri
               ========================================================================= */}
            <Audio
                src={staticFile('audio/sfx-master.wav')}
                volume={1.0}
            />

            {/* =========================================================================
                2. HAREKETLİ & ENERJİK ARKA PLAN MÜZİĞİ
               ========================================================================= */}
            <Audio
                src={staticFile('audio/energetic-beat.wav')}
                volume={musicVolume}
            />

            {/* =========================================================================
                3. VOKAL KANALLARI (16-bit 48kHz Stüdyo Mastering, %100 Kesintisiz)
               ========================================================================= */}
            {/* 1. Bölüm Vokali (0.0s - 25.50s / 1530 frame) - 3 kare kırpılmış vokal */}
            <Sequence from={0} durationInFrames={1530}>
                <Audio
                    src={staticFile('audio/voice-mastered.wav')}
                    startFrom={3}
                    volume={1.0}
                />
            </Sequence>

            {/* 2. Bölüm Vokali (25.50s - 51.80s / 1578 frame) */}
            <Sequence from={1530} durationInFrames={1578}>
                <Audio
                    src={staticFile('audio/voice-mastered-v2.wav')}
                    volume={1.0}
                />
            </Sequence>

            {/* 3. Bölüm Vokali (51.80s - 64.00s / 732 frame) */}
            <Sequence from={3108} durationInFrames={732}>
                <Audio
                    src={staticFile('audio/voice-v3-clean.wav')}
                    volume={1.0}
                />
            </Sequence>
        </>
    );
};
