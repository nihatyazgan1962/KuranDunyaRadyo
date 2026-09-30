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

## 👨‍💻 Geliştirici

**Nihat Yazgan** — Yazgan Bileşim  
GitHub: [@nihatyazgan1962](https://github.com/nihatyazgan1962)
