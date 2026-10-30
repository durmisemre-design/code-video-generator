# 🎬 Kurumsal Reels Video Standartları & Otomasyon Kılavuzu

Bu belge, Remotion tabanlı tüm 9:16 dikey (Reels / Shorts / TikTok) video kurgu ve otomasyon projelerindeki resmi tasarım, motion grafik, ses, 4K render ve **Instagram HDR/SDR** çıktı standartlarını içerir. Tüm yeni videolar bu şablona göre hazırlanmalıdır.

---

## 📐 1. Temel Kompozisyon & Giriş Video Standardı

| Parametre | Değer | Açıklama |
| :--- | :--- | :--- |
| **Çözünürlük** | `2160 x 3840` px (4K) | 9:16 Dikey Master Çözünürlük |
| **Kare Hızı (FPS)** | `60.00 FPS` (CFR) | Sıfır kare atlamalı akıcı hareket |
| **Toplam Kare** | `2088 frame` | 34.8 saniye $\times$ 60 FPS |
| **Ham Kamera Girişi** | `public/input-4k-60fps.mp4` | 4K 60FPS Constant Frame Rate (GOP=1 / All-Intra) |
| **Arka Plan Motoru**| `<BackgroundVideo />` | `contrast(1.05) brightness(1.02) saturate(1.06)` hafif CapCut renk takviyesi |
| **Kamera Motoru** | `<CinematicCamera />` | Zoom punch-in, kamera momentumu ve yumuşak odak drifti |
| **Pencere Konumu** | `top: 80px` | Konuşmacının yüzünü kapatmayan üst bölge |
| **Altyazı Konumu** | `bottom: 240px` | Instagram/TikTok alt buton alanına taşmayan güvenli bölge |

> [!IMPORTANT]
> **GOP=1 (All-Intra) Kuralı**: Ham video kameradan değişken kare hızı (VFR) veya uzun GOP (Long-GOP) ile gelirse Remotion renderında frame arama (seek) gecikmesi ve kare atlamaları yaşanır. Giriş videosu her zaman `h264_videotoolbox` ile `-r 60 -g 1` olarak önceden 60 FPS CFR'ye dönüştürülmelidir.

---

## 🎨 2. Apple Studio Opak Kart Tasarım Dili

> [!CAUTION]
> **ANGLE & Backdrop-Filter Hatası**: Chromium headless tarayıcılarda `backdropFilter: blur(...)` kullanıldığında, GPU doku atlasında döşeme (tiling) bug'ı oluşur ve 20. veya 28. saniye gibi karelerde rastgele ekran yırtılması/resim flaşlaması yaşanır. **Bileşenlerde asla CSS `backdropFilter` KULLANILMAZ!**

Kartlar, Apple macOS pencere tasarım estetiğinde **katı ve temiz opak gövdelerle** inşa edilir:

```css
/* Resmi Apple Opak Kart Stili */
background: rgba(255, 255, 255, 0.98);
border: 1px solid rgba(0, 0, 0, 0.08);
box-shadow: 0 20px 50px rgba(0, 0, 0, 0.15), 0 4px 12px rgba(0, 0, 0, 0.05);
border-radius: 24px;
padding: 24px;
```

- **Pencere Başlığı**: Sol üstte macOS kontrol noktaları (`#ff5f56`, `#ffbd2e`, `#27c93f`), sağ üstte canlı durum rozetleri (`CANLI SİSTEM`, `PROMPT AKTİF`).
- **Mikro Elementler**: Yumuşak gri-mavi alt kartlar (`#f8fafc`), 12px köşe yuvarlatmaları, temiz SVG ikonlar (Lucide).
- **Vurgular & Skor Barları**: İnce progress bar çizgileri (`#10b981` zümrüt yeşili, `#f59e0b` turuncu, `#6366f1` indigo).

---

## 💬 3. Snapchat Kapsül Kinetik Tipografi Standardı

Altyazılar konuşmacının göğüs bölgesinde, Instagram alt butonlarının hemen üstünde sabit bir kapsül içinde yer alır:

```css
/* Snapchat Frosted Kapsül Stili */
background: rgba(0, 0, 0, 0.65);
border-radius: 9999px;
padding: 10px 22px;
box-shadow: 0 4px 20px rgba(0, 0, 0, 0.35);

/* Tipografi */
font-family: -apple-system, BlinkMacSystemFont, "Inter", "SF Pro Display", sans-serif;
font-size: 30px;
font-weight: 600;
color: #ffffff;
letter-spacing: -0.01em;
line-height: 1.25;
```

- **Kelime Parlaması**: Aktif kelime (`isActive`) parlak sarı (`#fef08a`) tonunda ışıldar, diğer kelimeler saf beyaz (`#ffffff`) kalır.
- **Flaşlama Önleme (Flicker-Free)**: Altyazı kutusu her kelimede açılıp kapanmaz; kelime grupları (cümlecikler) halinde ekranda sabit durur, sadece içindeki aktif kelime vurgusu kayar.

---

## 🔊 4. Ses Tasarımı & Audio Mimarisi (`AudioManager.tsx`)

| Ses Bileşeni | Dosya | Seviye (`volume`) | Açıklama |
| :--- | :--- | :--- | :--- |
| **Master Vocal** | `public/audio/voice-mastered.wav` | `1.0` | Shure SM7B broadcast vokal zinciri, **-14 LUFS** loudness standardı |
| **Arka Plan Beat** | `public/audio/skins-slowed.mp3` | `0.12` | *Skins (Slowed + Reverb)*, tam **1:00 (60. saniye)** noktasından başlar |
| **Pencere Swoosh** | `public/audio/ui-swoosh.wav` | `0.4` | Tok Apple pencere açılış hava yastığı süzülmesi |
| **İmleç Tıklama** | `public/audio/mouse-click.wav` | `0.5` | Tok Apple Taptic Engine trackpad tıklaması |
| **Tech Uyarısı** | `public/audio/tech-ping.wav` | `0.55` | Tok Apple Glass kristal bildirim tonu |
| **Klavye Yazımı** | `public/audio/keyboard-type.wav` | `0.45` | MacBook Pro mekanik klavye tuşlama sesi |
| **DM Bildirimi** | `public/audio/dm-chime.wav` | `0.6` | Canlı modern iOS mesaj bildirim akoru |

---

## 🚀 5. Render ve Çıktı Pipeline'ı

### Adım 1: Remotion 4K Master Renderı
```bash
npx remotion render ReelsVideo out/render-4k-master.mp4 --scale=2 --concurrency=8 --crf=16
```
*(Bu komut 1080x1920 kompozisyonu 2 kat vektörel ölçekleyerek tam `2160 x 3840` 4K 60FPS olarak üretir)*

---

### Adım 2A: Instagram 4K 60FPS HDR (CapCut Smart HDR Standardı)
Bu komut videoyu Apple ve Instagram'ın tanıdığı **10-bit BT.2020 HLG HDR** formatına dönüştürür. Instagram'da Reels izleyenlerin telefonunda **ekran parlaklığı zirveye (1000+ nit) çıkar ve HDR etiketi gösterilir**:

```bash
DYLD_LIBRARY_PATH=./node_modules/@remotion/compositor-darwin-arm64 ./node_modules/@remotion/compositor-darwin-arm64/ffmpeg \
  -i out/render-4k-master.mp4 \
  -vf "zscale=tin=bt709:pin=bt709:min=bt709:t=arib-std-b67:p=bt2020:m=bt2020nc:npl=1000,format=p010le" \
  -c:v hevc_videotoolbox \
  -profile:v main10 \
  -pix_fmt p010le \
  -b:v 55M \
  -tag:v hvc1 \
  -bsf:v "hevc_metadata=colour_primaries=9:transfer_characteristics=18:matrix_coefficients=9" \
  -c:a copy \
  -movflags +faststart \
  /Users/emre/Desktop/zirh-reels-instagram-4k-hdr.mp4 -y
```

**HDR Teknik Özellikleri:**
- **Kapsayıcı**: MP4 (`hvc1`)
- **Codec**: HEVC / H.265 (Main 10 Profile)
- **Renk Derinliği**: 10-bit (`p010le` / 1.07 Milyar Renk)
- **Renk Alanı & Matrisi**: `BT.2020 HLG (9-18-9)`
- **Bitrate**: ~56 Mbps
- **Ses**: 320 kbps AAC Stereo

---

### Adım 2B: Instagram 4K 60FPS Standart SDR (Doğal / Non-HDR)
Ekran parlaklığını artırmayan, her ekranda ve tarayıcıda standart doğal parlaklıkta oynayan evrensel SDR çıktısı:

```bash
DYLD_LIBRARY_PATH=./node_modules/@remotion/compositor-darwin-arm64 ./node_modules/@remotion/compositor-darwin-arm64/ffmpeg \
  -i out/render-4k-master.mp4 \
  -pix_fmt yuv420p \
  -color_primaries bt709 -color_trc bt709 -colorspace bt709 \
  -c:v h264_videotoolbox \
  -b:v 50M \
  -c:a copy \
  -movflags +faststart \
  /Users/emre/Desktop/zirh-reels-4k-sdr-standart.mp4 -y
```

**SDR Teknik Özellikleri:**
- **Codec**: H.264 High Profile (AVC1)
- **Renk Alanı**: Rec.709 Limited Range (`yuv420p`)
- **Bitrate**: ~50 Mbps
- **Ses**: 320 kbps AAC Stereo
