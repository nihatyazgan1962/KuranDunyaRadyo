# 📻 Kuran Dünya Radyo — Canlı İslami Radyolar & Ses Kaydedici

Dünyanın dört bir yanından canlı Kuran ve İslami radyo yayınlarını dinleyebileceğiniz, ses kaydı yapabileceğiniz Android uygulamasıdır.

## ✨ Özellikler

- 📡 Dünya genelinde canlı Kuran radyo istasyonları
- 🎙️ Canlı yayın ses kayıt (Capacitor Filesystem)
- ⭐ Favori istasyonlar listesi
- 🌍 Ülkeye göre radyo filtreleme
- 📱 Android APK (Capacitor wrapper)
- 🔈 Arka planda çalma desteği

## 🛠️ Teknolojiler

| Katman | Teknoloji |
|--------|-----------|
| Frontend | HTML5, CSS3, JavaScript (Vanilla) |
| Ses Akışı | HLS.js / HTML5 Audio |
| Mobil Wrapper | Capacitor 6.x |
| Dosya Sistemi | @capacitor/filesystem |
| Platform | Android APK |

## 📋 Gereksinimler

- Node.js 18+
- Android Studio
- Java 17+
- Android SDK 21+

## 🚀 Kurulum

```bash
npm install
npx cap sync android
npx cap open android
```

### APK Derleme
```powershell
.\apk_yap.ps1
# veya
.\apk_yap.bat
```

## 📁 Proje Yapısı

```
├── www/              # Web uygulaması (HTML/JS/CSS)
├── android/          # Android native proje
└── package.json
```

## 📞 İletişim

<div align="center">

[![E-posta](https://img.shields.io/badge/E--posta-yazganbilisim2026@gmail.com-00b4d8?style=for-the-badge&logo=gmail&logoColor=white&labelColor=0d1117)](mailto:yazganbilisim2026@gmail.com)
[![Diğer Uygulamalarımız](https://img.shields.io/badge/Diğer_Uygulamalarımız-Tüm_Projeler-00b4d8?style=for-the-badge&logo=android&logoColor=white&labelColor=0d1117)](https://github.com/nihatyazgan1962?tab=repositories)

**Yazgan Bilişim**

</div>
