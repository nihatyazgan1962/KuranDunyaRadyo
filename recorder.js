/**
 * KURAN DÜNYA RADYO — CANLI SES VE YAYIN KAYDEDİCİ (AUDIO RECORDER ENGINE)
 * Web Audio API & MediaStream Recording Engine with IndexedDB Arşivleme
 */

class RadioStreamRecorder {
  constructor() {
    this.mediaRecorder = null;
    this.recordedChunks = [];
    this.isRecording = false;
    this.startTime = null;
    this.timerInterval = null;
    this.currentStation = null;
    this.audioContext = null;
    this.mediaStreamDestination = null;
    this.sourceNode = null;
    this.dbName = "KuranDunyaRadyoDB";
    this.dbVersion = 1;
    this.db = null;

    this.initDatabase();
  }

  // IndexedDB başlatma (Kayıtların kalıcı saklanması için)
  async initDatabase() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.dbVersion);

      request.onupgradeneeded = (e) => {
        const db = e.target.result;
        if (!db.objectStoreNames.contains("recordings")) {
          const store = db.createObjectStore("recordings", { keyPath: "id", autoIncrement: true });
          store.createIndex("stationId", "stationId", { unique: false });
          store.createIndex("createdAt", "createdAt", { unique: false });
        }
      };

      request.onsuccess = (e) => {
        this.db = e.target.result;
        resolve(this.db);
      };

      request.onerror = (e) => {
        console.error("IndexedDB başlatılamadı:", e);
        resolve(null);
      };
    });
  }

  // Canlı radyo akışından veya mikrofondan kayıt başlatma
  async startRecording(audioElement, station) {
    if (this.isRecording) return { success: false, message: "Kayıt zaten devam ediyor." };

    try {
      this.currentStation = station;
      this.recordedChunks = [];

      let streamToRecord = null;

      // 1. Yöntem: Audio Element Capture Stream (Web Audio API)
      if (audioElement.captureStream || audioElement.mozCaptureStream) {
        try {
          streamToRecord = (audioElement.captureStream) ? audioElement.captureStream() : audioElement.mozCaptureStream();
        } catch (err) {
          console.warn("captureStream CORS kısıtlamasına takıldı, mikrofon/fallback deneniyor...", err);
        }
      }

      // 2. Yöntem: Eğer CORS koruması varsa Web Audio Context or Mikrofon ile yakalama
      if (!streamToRecord || streamToRecord.getAudioTracks().length === 0) {
        try {
          if (!this.audioContext) {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
          }
          if (this.audioContext.state === 'suspended') {
            await this.audioContext.resume();
          }

          if (!this.sourceNode) {
            this.sourceNode = this.audioContext.createMediaElementSource(audioElement);
          }
          
          this.mediaStreamDestination = this.audioContext.createMediaStreamDestination();
          this.sourceNode.connect(this.mediaStreamDestination);
          this.sourceNode.connect(this.audioContext.destination); // hoparlöre ver

          streamToRecord = this.mediaStreamDestination.stream;
        } catch (audioCtxErr) {
          console.warn("WebAudio Source oluşturulamadı, mikrofon yedek akışına geçiliyor:", audioCtxErr);
          // Mikrofon veya ortam sesi yedek modu
          streamToRecord = await navigator.mediaDevices.getUserMedia({ audio: true });
        }
      }

      // Desteklenen MIME tiplerini kontrol et (Android Chrome / Safari / Desktop)
      let mimeType = 'audio/webm;codecs=opus';
      if (!MediaRecorder.isTypeSupported(mimeType)) {
        if (MediaRecorder.isTypeSupported('audio/webm')) {
          mimeType = 'audio/webm';
        } else if (MediaRecorder.isTypeSupported('audio/mp4')) {
          mimeType = 'audio/mp4';
        } else if (MediaRecorder.isTypeSupported('audio/ogg')) {
          mimeType = 'audio/ogg';
        } else {
          mimeType = ''; // Varsayılan
        }
      }

      const options = mimeType ? { mimeType } : {};
      this.mediaRecorder = new MediaRecorder(streamToRecord, options);

      this.mediaRecorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          this.recordedChunks.push(event.data);
        }
      };

      this.mediaRecorder.start(1000); // Her 1 saniyede parça topla
      this.isRecording = true;
      this.startTime = Date.now();

      return { success: true, message: "Kayıt başarıyla başladı." };
    } catch (error) {
      console.error("Kayıt başlatılamadı:", error);
      return { 
        success: false, 
        message: "Kayıt başlatılamadı: Lütfen yayının çaldığından emin olun veya mikrofon izni verin." 
      };
    }
  }

  // Kaydı durdur ve kaydet
  async stopRecording() {
    if (!this.isRecording || !this.mediaRecorder) {
      return null;
    }

    return new Promise((resolve) => {
      this.mediaRecorder.onstop = async () => {
        const durationSec = Math.round((Date.now() - this.startTime) / 1000);
        const mimeType = this.mediaRecorder.mimeType || 'audio/webm';
        const blob = new Blob(this.recordedChunks, { type: mimeType });
        
        const recordingData = {
          id: Date.now(),
          title: `${this.currentStation ? this.currentStation.name : "Kuran Radyo"} Kaydı`,
          stationId: this.currentStation ? this.currentStation.id : "unknown",
          countryName: this.currentStation ? this.currentStation.countryName : "Dünya",
          flag: this.currentStation ? this.currentStation.flag : "🎙️",
          createdAt: new Date().toISOString(),
          durationSec: durationSec,
          formattedDuration: this.formatTime(durationSec),
          blob: blob,
          sizeFormatted: this.formatBytes(blob.size)
        };

        // Veritabanına kaydet
        await this.saveToIndexedDB(recordingData);

        this.isRecording = false;
        this.startTime = null;
        resolve(recordingData);
      };

      this.mediaRecorder.stop();
    });
  }

  // IndexedDB'ye ses dosyasını yaz
  async saveToIndexedDB(recordItem) {
    if (!this.db) await this.initDatabase();
    if (!this.db) return false;

    return new Promise((resolve) => {
      try {
        const transaction = this.db.transaction(["recordings"], "readwrite");
        const store = transaction.objectStore("recordings");
        const request = store.put(recordItem);
        request.onsuccess = () => resolve(true);
        request.onerror = (e) => {
          console.error("Kayıt DB'ye eklenemedi:", e);
          resolve(false);
        };
      } catch (err) {
        console.error("DB işlemi hatası:", err);
        resolve(false);
      }
    });
  }

  // Kayıtları listele
  async getAllRecordings() {
    if (!this.db) await this.initDatabase();
    if (!this.db) return [];

    return new Promise((resolve) => {
      try {
        const transaction = this.db.transaction(["recordings"], "readonly");
        const store = transaction.objectStore("recordings");
        const request = store.getAll();
        request.onsuccess = (e) => {
          // En yeni kayıtlar başta
          const list = (e.target.result || []).sort((a, b) => b.id - a.id);
          resolve(list);
        };
        request.onerror = () => resolve([]);
      } catch (e) {
        resolve([]);
      }
    });
  }

  // Kayıt sil
  async deleteRecording(id) {
    if (!this.db) await this.initDatabase();
    if (!this.db) return false;

    return new Promise((resolve) => {
      try {
        const transaction = this.db.transaction(["recordings"], "readwrite");
        const store = transaction.objectStore("recordings");
        const request = store.delete(id);
        request.onsuccess = () => resolve(true);
        request.onerror = () => resolve(false);
      } catch (e) {
        resolve(false);
      }
    });
  }

  // Kayıt dosyasını cihaza indir (.mp3 / ses dosyası olarak - Dahili Depolama / Music & Downloads)
  async downloadRecording(recordItem) {
    const cleanStationName = recordItem.title
      .replace(/[^a-zA-Z0-9çğıöşüÇĞİÖŞÜ_ -]/g, "")
      .replace(/\s+/g, "_");
    const fileName = `Kuran_Dunya_Radyo_${cleanStationName}_${recordItem.id}.mp3`;

    // Capacitor Native Filesystem desteği kontrolü (Android Dahili Depolama)
    if (window.Capacitor && window.Capacitor.Plugins && window.Capacitor.Plugins.Filesystem) {
      try {
        const { Filesystem } = window.Capacitor.Plugins;
        
        // Blob verisini Base64'e dönüştür
        const reader = new FileReader();
        const base64Promise = new Promise((resolve, reject) => {
          reader.onloadend = () => {
            const base64data = reader.result.split(',')[1];
            resolve(base64data);
          };
          reader.onerror = reject;
        });
        reader.readAsDataURL(recordItem.blob);
        const base64Data = await base64Promise;

        // 1. Önce Documents / Music klasörüne yazmayı dene
        let savedPath = '';
        try {
          const res = await Filesystem.writeFile({
            path: `Music/${fileName}`,
            data: base64Data,
            directory: 'DOCUMENTS',
            recursive: true
          });
          savedPath = res.uri || 'Dahili Depolama/Music';
        } catch (dirErr) {
          // Doğrudan Documents veya root dizine yaz
          const res = await Filesystem.writeFile({
            path: fileName,
            data: base64Data,
            directory: 'DOCUMENTS',
            recursive: true
          });
          savedPath = res.uri || 'Dahili Depolama/Documents';
        }

        if (window.showToast) {
          window.showToast(`✅ MP3 Kaydedildi: Dahili Depolama / Music / ${fileName}`, 'success');
        } else {
          alert(`✅ MP3 Kaydedildi:\nDahili Depolama / Music / ${fileName}`);
        }
        return;
      } catch (nativeErr) {
        console.warn("Capacitor Filesystem yazma hatası, standart indirmeye geçiliyor:", nativeErr);
      }
    }

    // Web / Tarayıcı indirme standardı
    const mp3Blob = new Blob([recordItem.blob], { type: "audio/mp3" });
    const url = URL.createObjectURL(mp3Blob);
    const a = document.createElement("a");
    a.style.display = "none";
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    }, 300);

    if (window.showToast) {
      window.showToast(`📥 MP3 İndirildi: ${fileName} (Music / İndirilenler)`, 'info');
    }
  }

  // Zaman formatlayıcı (02:45)
  formatTime(totalSeconds) {
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }

  // Boyut formatlayıcı
  formatBytes(bytes, decimals = 1) {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  }
}

// Global instance
window.radioRecorder = new RadioStreamRecorder();
