import React from 'react';
import { interpolate, useCurrentFrame } from 'remotion';

interface CinematicCameraProps {
    children: React.ReactNode;
}

export const CinematicCamera: React.FC<CinematicCameraProps> = ({ children }) => {
    const frame = useCurrentFrame();

    // Animasyon Kartları İçin Dinamik Yaklaştırma (Dynamic Zoom Punch-in)
    // Sadece animasyon pencerelerini yaklaştırıp vurgular, konuşmacıyı asla kapatmaz.
    const animScale = interpolate(
        frame,
        [
            0, 60, 70,           // 01. 0s - 1s konuşmacı doğal başlar, 60. frame SaaS girişi
            120, 132, 155, 380,  // 02. SaaS: Next.js 15 kartına tıklama anında yakınlaşma (1.06x)
            402, 420, 510,       // 03. Güvenlik Uyarısı: CVE-2024 zafiyet kutusuna yakınlaşma (1.08x)
            700, 720, 745, 840,  // 04. Dosya Bypass: .TXT -> .PNG dönüşümüne odaklanma (1.08x)
            858, 880, 1020,      // 05. DDoS Saldırısı: 2.48M req/sec sayaç ve grafiğine odaklanma (1.075x)
            1130, 1152, 1180, 1680, // 06. AI Kod Denetleyicisi: Zafiyetli kodun yamalandığı satıra yakınlaşma (1.09x)
            1710, 1740, 1890,    // 07. Güvenlik Zırhı: 3D kalkan amblemine kilitlenme (1.06x)
            1908, 1930, 2088     // 08. CTA: "ZIRH" yorum çubuğuna yakınlaşma (1.07x)
        ],
        [
            1.0, 1.0, 1.0,
            1.0, 1.06, 1.01, 1.01,
            1.08, 1.03, 1.03,
            1.01, 1.08, 1.02, 1.02,
            1.075, 1.03, 1.03,
            1.02, 1.09, 1.03, 1.03,
            1.06, 1.01, 1.01,
            1.07, 1.02, 1.02
        ],
        { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
    );

    // Animasyon Kartları İçin Dinamik Kaydırma (Pan / Slide - translateX & translateY)
    // Animasyonun içindeki aktif aksiyon alanını (kod, sayaç, buton, zafiyet) merkeze kaydırır.
    const panX = interpolate(
        frame,
        [
            0, 70,               // Merkezde
            120, 132, 160, 380,  // SaaS: Soldaki Next.js 15 kartını merkeze getirmek için hafif sağa kaydırma
            402, 430, 510,       // Güvenlik uyarısı
            700, 720, 750, 840,  // Dosya bypass: Sağdaki .PNG dosya kartına kaydırma
            858, 880, 1020,      // DDoS: Sayaç ve grafiğe kaydırma
            1130, 1152, 1190, 1680, // AI Denetleyici: Kod editörünün yamalanan 3. satırına kaydırma
            1710, 1750, 1890,    // Güvenlik zırhı: Merkez
            1908, 1935, 2088     // CTA: Yorum çubuğuna merkezleme
        ],
        [
            0, 0,
            0, 16, 0, 0,
            0, 0, 0,
            0, -18, 0, 0,
            0, 14, 0,
            0, -12, 0, 0,
            0, 0, 0,
            0, 0, 0
        ],
        { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
    );

    const panY = interpolate(
        frame,
        [
            0, 70,
            120, 132, 160, 380,  // SaaS: Kart hizası
            402, 430, 510,       // Güvenlik zafiyet kutusunu vurgulama
            700, 720, 750, 840,  // Dosya kartı
            858, 880, 1020,      // DDoS grafiği
            1130, 1152, 1190, 1680, // Kod satırına hafif kaydırma
            1710, 1750, 1890,    // Kalkan
            1908, 1935, 2088     // CTA yorum alanı
        ],
        [
            0, 0,
            0, 6, 0, 0,
            0, 8, 0,
            0, 8, 0, 0,
            0, 8, 0,
            0, 10, 0, 0,
            0, 0, 0,
            0, 8, 0
        ],
        { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
    );

    return (
        <div
            style={{
                position: 'absolute',
                inset: 0,
                width: '100%',
                height: '100%',
                transform: `scale(${animScale}) translate(${panX}px, ${panY}px)`,
                transformOrigin: '50% 25%',
                willChange: 'transform',
                pointerEvents: 'none',
                zIndex: 35,
            }}
        >
            {children}
        </div>
    );
};
