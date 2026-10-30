import React from 'react';
import { AbsoluteFill, Sequence, staticFile } from 'remotion';
import { BackgroundVideo } from './components/BackgroundVideo';
import { SplitScreenDemo } from './components/SplitScreenDemo';
import { KineticCaptions } from './components/KineticCaptions';
import { AudioManager } from './components/AudioManager';
import { CallToAction } from './components/CallToAction';
import { CreatorCallouts } from './components/CreatorCallouts';
import { CameraFlashTransition } from './components/CameraFlashTransition';
import { CaptionItem } from './types/video';
import defaultVideoData from './data/videoData.json';

export interface ReelsVideoProps {
    captions?: CaptionItem[];
    videoSrc?: string;
}

export const ReelsVideo: React.FC<ReelsVideoProps> = ({
    captions = defaultVideoData.captions,
    videoSrc = staticFile('input-4k-60fps.mp4'),
}) => {
    return (
        <AbsoluteFill style={{ backgroundColor: '#000000', overflow: 'hidden' }}>
            {/* 1. BÖLÜM (0 - 1530 frame / 0.0s - 25.50s): Tam Ekran Giriş Videosu (1. Video) */}
            {/* Kullanıcı isteği: Başlangıçtaki 3 kare (kadraja giren el) silindi (startFrom={3}) */}
            <Sequence from={0} durationInFrames={1530}>
                <BackgroundVideo src={videoSrc} startFrom={3} />
            </Sequence>

            {/* 2. BÖLÜM (1530 - 3108 frame / 25.50s - 51.80s): Yarı Ekran Bölünmüş Demo */}
            {/* Üstte sabit zoomlu + geniş açılı ekran kayıtları, altta kafayı kesmeyen 2. video */}
            <Sequence from={1530} durationInFrames={1578}>
                <SplitScreenDemo />
            </Sequence>

            {/* 3. BÖLÜM (3108 - 3840 frame / 51.80s - 64.00s): Tam Ekran Kapanış (3. Video 20.80s - 33.00s) */}
            {/* Kullanıcı isteği: Tam 'Bu araç tamamen kodla üretildiği için' sözüyle doğrudan başlar */}
            <Sequence from={3108} durationInFrames={732}>
                <BackgroundVideo src={staticFile('v3-clean.mp4')} startFrom={0} />

                {/* SADECE 3. VİDEOYA ÖZEL: Üst boşlukta konuşmaya senkronize 'MCP BAĞLAMANIZA GEREK YOK' vurgusu */}
                <CreatorCallouts />

                {/* Kapanışta Gösterilen Beyaz Kutu Call to Action Kartı (Videonun tam sonunda 'Bütün yapay zekaları' derken) */}
                <Sequence from={570} durationInFrames={162}>
                    <CallToAction />
                </Sequence>
            </Sequence>

            {/* 4. KAMERA GEÇİŞ EFEKTLERİ (Kamera Vizör & Deklanşör Flaş Snap Görseli) */}
            {/* Geçiş 1 (1530. kare / 25.50s): 1. Videodan Split Screen Demo'ya Geçiş */}
            <Sequence from={1530} durationInFrames={10}>
                <CameraFlashTransition />
            </Sequence>

            {/* Geçiş 2 (2610. kare / 43.50s): Kod Analizinden Geniş Program Ekranına Geçiş */}
            <Sequence from={2610} durationInFrames={10}>
                <CameraFlashTransition />
            </Sequence>

            {/* Geçiş 3 (3108. kare / 51.80s): Split Screen Demo'dan 3. Kapanış Videosuna Geçiş */}
            <Sequence from={3108} durationInFrames={10}>
                <CameraFlashTransition />
            </Sequence>

            {/* 5. NET, TOK BEYAZ ALTYAZILAR (Referans Görseldeki Font Stiliyle Birebir, Noktalama Kurallı) */}
            <KineticCaptions captions={captions} />

            {/* 6. MASTERING UYGULANMIŞ STÜDYO SES KANALLARI (Riser, Whoosh, Click, Pop, Shutter, Müzik & Vokal) */}
            <AudioManager />
        </AbsoluteFill>
    );
};
