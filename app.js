/**
 * KURAN DÜNYA RADYO — ANA UYGULAMA MANTIĞI (APP CONTROLLER)
 * İstasyon yönetimi, Audio Player, Kayıt Fonksiyonları, Arama ve Filtreleme
 */

document.addEventListener("DOMContentLoaded", () => {
  // State
  let currentStationIndex = 0;
  let isPlaying = false;
  let favorites = JSON.parse(localStorage.getItem("kuran_radyo_favs") || "[]");
  let sleepTimerTimeout = null;
  let activeFilter = "all";
  let recTimerInterval = null;

  // DOM Elements
  const mainAudio = document.getElementById("mainAudio");
  const mainPlayBtn = document.getElementById("mainPlayBtn");
  const playBtnIcon = document.getElementById("playBtnIcon");
  const prevStationBtn = document.getElementById("prevStationBtn");
  const nextStationBtn = document.getElementById("nextStationBtn");
  const volumeSlider = document.getElementById("volumeSlider");
  const visualizerCircle = document.querySelector(".visualizer-circle");
  
  // Station Metadata Elements
  const currentStationTitle = document.getElementById("currentStationTitle");
  const currentStationCategory = document.getElementById("currentStationCategory");
  const currentStationDesc = document.getElementById("currentStationDesc");
  const playerCountryFlag = document.getElementById("playerCountryFlag");
  const playerCountryName = document.getElementById("playerCountryName");
  const favToggleBtn = document.getElementById("favToggleBtn");
  const favHeartIcon = document.getElementById("favHeartIcon");

  // Recorder Elements
  const recorderBar = document.getElementById("recorderBar");
  const recToggleBtn = document.getElementById("recToggleBtn");
  const recBtnLabel = document.getElementById("recBtnLabel");
  const recStatusText = document.getElementById("recStatusText");
  const recTimerText = document.getElementById("recTimerText");
  const recordCountBadge = document.getElementById("recordCountBadge");
  const recordListBtn = document.getElementById("recordListBtn");
  const recordingsList = document.getElementById("recordingsList");
  const emptyRecordings = document.getElementById("emptyRecordings");

  // Mini Player Elements
  const miniPlayer = document.getElementById("miniPlayer");
  const miniTitle = document.getElementById("miniTitle");
  const miniCountry = document.getElementById("miniCountry");
  const miniPlayBtn = document.getElementById("miniPlayBtn");
  const miniPlayIcon = document.getElementById("miniPlayIcon");
  const miniRecBtn = document.getElementById("miniRecBtn");
  const miniPlayerClickArea = document.getElementById("miniPlayerClickArea");

  // Tabs & Navigation
  const tabButtons = document.querySelectorAll(".tab-btn");
  const tabPanes = document.querySelectorAll(".tab-pane");
  const stationsListContainer = document.getElementById("stationsListContainer");
  const quickChipsContainer = document.getElementById("quickChipsContainer");
  const stationSearchInput = document.getElementById("stationSearchInput");
  const clearSearchBtn = document.getElementById("clearSearchBtn");
  const countryFiltersBar = document.getElementById("countryFiltersBar");
  const channelCountTag = document.getElementById("channelCountTag");

  // Modal & Sleep Timer
  const sleepTimerBtn = document.getElementById("sleepTimerBtn");
  const sleepTimerLabel = document.getElementById("sleepTimerLabel");
  const sleepModal = document.getElementById("sleepModal");
  const closeSleepModal = document.getElementById("closeSleepModal");
  const timerButtons = document.querySelectorAll(".timer-btn");
  const themeToggleBtn = document.getElementById("themeToggleBtn");
  const toastContainer = document.getElementById("toastContainer");

  // DOM Elements - Türkiye Sekmesi
  const turkeyStationsListContainer = document.getElementById("turkeyStationsListContainer");
  const turkeyFilterChips = document.getElementById("turkeyFilterChips");
  let activeTurkeyFilter = "tr-all";

  // Init
  initApp();

  function initApp() {
    channelCountTag.textContent = `${STATIONS_DATA.length} Kanal`;
    renderQuickChips();
    renderTurkeyStationsList();
    renderStationsList();
    loadStation(0, false);
    updateRecordCountBadge();
    setupEventListeners();
  }

  // İstasyon Yükleme
  function loadStation(index, autoPlay = true) {
    if (index < 0) index = STATIONS_DATA.length - 1;
    if (index >= STATIONS_DATA.length) index = 0;

    currentStationIndex = index;
    const station = STATIONS_DATA[currentStationIndex];

    currentStationTitle.textContent = station.name;
    currentStationCategory.textContent = station.arabicName;
    currentStationDesc.textContent = station.desc;
    playerCountryFlag.textContent = station.flag;
    playerCountryName.textContent = station.countryName;

    // Mini Player güncelle
    miniTitle.textContent = station.name;
    miniCountry.textContent = `${station.flag} ${station.countryName}`;

    // Favori durumu
    updateFavButtonState();

    // Stream URL ata
    mainAudio.src = station.streamUrl;
    mainAudio.load();

    // Aktif kartları güncelle
    updateActiveCardsInList();

    if (autoPlay) {
      playAudio();
    }
  }

  // Oynatma Fonksiyonu
  function playAudio() {
    const playPromise = mainAudio.play();
    if (playPromise !== undefined) {
      playPromise
        .then(() => {
          isPlaying = true;
          updatePlaybackUI(true);
        })
        .catch(err => {
          console.warn("Otomatik oynatma kısıtlaması veya akış hatası, yedek deneniyor:", err);
          // Yedek akışı dene
          const station = STATIONS_DATA[currentStationIndex];
          if (station.backupUrl && mainAudio.src !== station.backupUrl) {
            mainAudio.src = station.backupUrl;
            mainAudio.play().then(() => {
              isPlaying = true;
              updatePlaybackUI(true);
            }).catch(() => {
              isPlaying = false;
              updatePlaybackUI(false);
              showToast("Yayın bağlantısı kuruluyor, lütfen tekrar dokunun.");
            });
          } else {
            isPlaying = false;
            updatePlaybackUI(false);
          }
        });
    }
  }

  // Durdurma
  function pauseAudio() {
    mainAudio.pause();
    isPlaying = false;
    updatePlaybackUI(false);
  }

  // UI Oynatma Durumu
  function updatePlaybackUI(playing) {
    if (playing) {
      playBtnIcon.className = "fa-solid fa-pause";
      miniPlayIcon.className = "fa-solid fa-pause";
      visualizerCircle.classList.add("playing");
      miniPlayer.classList.add("visible");
    } else {
      playBtnIcon.className = "fa-solid fa-play";
      miniPlayIcon.className = "fa-solid fa-play";
      visualizerCircle.classList.remove("playing");
    }
    updateActiveCardsInList();
  }

  // Quick Chips (Yatay İstasyon Kartları)
  function renderQuickChips() {
    quickChipsContainer.innerHTML = "";
    STATIONS_DATA.forEach((st, idx) => {
      const chip = document.createElement("div");
      chip.className = `station-chip ${idx === currentStationIndex ? "active" : ""}`;
      chip.innerHTML = `<span>${st.flag}</span> <span>${st.name}</span>`;
      chip.addEventListener("click", () => {
        loadStation(idx, true);
        switchTab("player-tab");
      });
      quickChipsContainer.appendChild(chip);
    });
  }

  // İstasyon Listesini Çizdir
  function renderStationsList() {
    stationsListContainer.innerHTML = "";
    const searchTerm = stationSearchInput.value.toLowerCase().trim();

    const filtered = STATIONS_DATA.filter(station => {
      // Ülke filtresi
      if (activeFilter === "favorites") {
        if (!favorites.includes(station.id)) return false;
      } else if (activeFilter !== "all" && station.countryCode !== activeFilter) {
        return false;
      }

      // Arama filtresi
      if (searchTerm) {
        const matchName = station.name.toLowerCase().includes(searchTerm);
        const matchArabic = station.arabicName.toLowerCase().includes(searchTerm);
        const matchCountry = station.countryName.toLowerCase().includes(searchTerm);
        const matchCategory = station.category.toLowerCase().includes(searchTerm);
        const matchDesc = station.desc.toLowerCase().includes(searchTerm);
        return matchName || matchArabic || matchCountry || matchCategory || matchDesc;
      }

      return true;
    });

    if (filtered.length === 0) {
      stationsListContainer.innerHTML = `
        <div class="empty-state">
          <i class="fa-solid fa-satellite-dish empty-icon"></i>
          <h4>Aradığınız kriterde radyo bulunamadı</h4>
          <p>Farklı bir arama kelimesi yazabilir veya ülke filtrelerini değiştirebilirsiniz.</p>
        </div>
      `;
      return;
    }

    filtered.forEach(station => {
      const globalIdx = STATIONS_DATA.findIndex(s => s.id === station.id);
      const isFav = favorites.includes(station.id);
      const isCurrent = globalIdx === currentStationIndex;

      const card = document.createElement("div");
      card.className = `station-card ${isCurrent ? "active-playing" : ""}`;
      card.innerHTML = `
        <div class="station-card-left">
          <div class="station-icon-avatar">
            <i class="fa-solid ${station.icon || 'fa-radio'}"></i>
          </div>
          <div class="station-card-info">
            <div class="station-card-title">${station.flag} ${station.name}</div>
            <div class="station-card-sub">
              <span>${station.category}</span> • <span>${station.countryName}</span>
            </div>
          </div>
        </div>
        <div class="station-card-actions">
          <button class="card-action-btn fav ${isFav ? 'active' : ''}" data-id="${station.id}" title="Favori">
            <i class="fa-${isFav ? 'solid' : 'regular'} fa-heart"></i>
          </button>
          <button class="card-action-btn play" title="Dinle">
            <i class="fa-solid ${isCurrent && isPlaying ? 'fa-pause' : 'fa-play'}"></i>
          </button>
        </div>
      `;

      // Kart tıklaması (çal)
      card.querySelector(".station-card-left").addEventListener("click", () => {
        loadStation(globalIdx, true);
        switchTab("player-tab");
      });

      card.querySelector(".card-action-btn.play").addEventListener("click", (e) => {
        e.stopPropagation();
        if (globalIdx === currentStationIndex && isPlaying) {
          pauseAudio();
        } else {
          loadStation(globalIdx, true);
        }
      });

      // Favori butonu
      card.querySelector(".card-action-btn.fav").addEventListener("click", (e) => {
        e.stopPropagation();
        toggleFavorite(station.id);
      });

      stationsListContainer.appendChild(card);
    });
  }

  // Türkiye İstasyonları Listesini Çizdir
  function renderTurkeyStationsList() {
    if (!turkeyStationsListContainer) return;
    turkeyStationsListContainer.innerHTML = "";

    const trStations = STATIONS_DATA.filter(station => {
      if (station.countryCode !== "tr" && station.countryCode !== "risale") return false;
      
      if (activeTurkeyFilter === "tr-trt") {
        return station.subGroup === "trt" || station.id.includes("trt");
      } else if (activeTurkeyFilter === "tr-diyanet") {
        return station.subGroup === "diyanet" || station.id.includes("diyanet") || station.id.includes("meal");
      } else if (activeTurkeyFilter === "tr-haber") {
        return station.subGroup === "haber";
      } else if (activeTurkeyFilter === "tr-yoresel") {
        return station.subGroup === "yoresel";
      } else if (activeTurkeyFilter === "tr-risale") {
        return station.countryCode === "risale" || station.id.includes("risale");
      }
      return true;
    });

    trStations.forEach(station => {
      const globalIdx = STATIONS_DATA.findIndex(s => s.id === station.id);
      const isFav = favorites.includes(station.id);
      const isCurrent = globalIdx === currentStationIndex;

      const card = document.createElement("div");
      card.className = `station-card ${isCurrent ? "active-playing" : ""}`;
      card.innerHTML = `
        <div class="station-card-left">
          <div class="station-icon-avatar">
            <i class="fa-solid ${station.icon || 'fa-radio'}"></i>
          </div>
          <div class="station-card-info">
            <div class="station-card-title">${station.flag} ${station.name}</div>
            <div class="station-card-sub">
              <span>${station.category}</span> • <span>${station.countryName}</span>
            </div>
          </div>
        </div>
        <div class="station-card-actions">
          <button class="card-action-btn fav ${isFav ? 'active' : ''}" data-id="${station.id}" title="Favori">
            <i class="fa-${isFav ? 'solid' : 'regular'} fa-heart"></i>
          </button>
          <button class="card-action-btn play" title="Dinle">
            <i class="fa-solid ${isCurrent && isPlaying ? 'fa-pause' : 'fa-play'}"></i>
          </button>
        </div>
      `;

      // Kart tıklaması (çal)
      card.querySelector(".station-card-left").addEventListener("click", () => {
        loadStation(globalIdx, true);
        switchTab("player-tab");
      });

      card.querySelector(".card-action-btn.play").addEventListener("click", (e) => {
        e.stopPropagation();
        if (globalIdx === currentStationIndex && isPlaying) {
          pauseAudio();
        } else {
          loadStation(globalIdx, true);
        }
      });

      // Favori butonu
      card.querySelector(".card-action-btn.fav").addEventListener("click", (e) => {
        e.stopPropagation();
        toggleFavorite(station.id);
      });

      turkeyStationsListContainer.appendChild(card);
    });
  }

  function updateActiveCardsInList() {
    // Quick chips
    const chips = quickChipsContainer.querySelectorAll(".station-chip");
    chips.forEach((chip, i) => {
      chip.classList.toggle("active", i === currentStationIndex);
    });

    // List cards (Dünya ve Türkiye listeleri)
    const cards = document.querySelectorAll(".station-card");
    cards.forEach(card => {
      const favBtn = card.querySelector(".card-action-btn.fav");
      if (favBtn) {
        const id = favBtn.getAttribute("data-id");
        const idx = STATIONS_DATA.findIndex(s => s.id === id);
        card.classList.toggle("active-playing", idx === currentStationIndex);
        const playIcon = card.querySelector(".card-action-btn.play i");
        if (playIcon) {
          playIcon.className = `fa-solid ${idx === currentStationIndex && isPlaying ? 'fa-pause' : 'fa-play'}`;
        }
      }
    });
  }

  // --- KAYIT MOTORU VE ETKİLEŞİMİ (RECORDING CONTROLLER) ---
  async function handleRecordToggle() {
    const station = STATIONS_DATA[currentStationIndex];

    if (!window.radioRecorder.isRecording) {
      // Oynatmıyorsa önce oynat
      if (!isPlaying) {
        playAudio();
      }

      showToast("🔴 Kayıt başlatılıyor...");
      const result = await window.radioRecorder.startRecording(mainAudio, station);

      if (result.success) {
        recorderBar.classList.add("recording");
        recBtnLabel.textContent = "Kaydı Durdur";
        recStatusText.textContent = "Canlı Yayın Kaydediliyor...";
        showToast("Canlı yayın kaydediliyor! İstediğiniz an durdurabilirsiniz.");

        let seconds = 0;
        recTimerInterval = setInterval(() => {
          seconds++;
          recTimerText.textContent = window.radioRecorder.formatTime(seconds);
        }, 1000);
      } else {
        showToast(result.message);
      }
    } else {
      // Kaydı durdur
      clearInterval(recTimerInterval);
      const savedItem = await window.radioRecorder.stopRecording();
      
      recorderBar.classList.remove("recording");
      recBtnLabel.textContent = "Yayını Kaydet";
      recStatusText.textContent = "Canlı Radyo Kaydı";
      recTimerText.textContent = "00:00";

      if (savedItem) {
        showToast(`✅ "${savedItem.title}" başarıyla arşivlendi!`);
        updateRecordCountBadge();
        renderRecordingsList();
      }
    }
  }

  // Kayıt Listesini Çizdir
  async function renderRecordingsList() {
    const records = await window.radioRecorder.getAllRecordings();

    if (records.length === 0) {
      recordingsList.innerHTML = "";
      recordingsList.appendChild(emptyRecordings);
      emptyRecordings.style.display = "block";
      return;
    }

    recordingsList.innerHTML = "";
    records.forEach(rec => {
      const card = document.createElement("div");
      card.className = "rec-item-card";

      const audioUrl = URL.createObjectURL(rec.blob);

      card.innerHTML = `
        <div class="rec-item-top">
          <div class="rec-item-title-box">
            <h4>${rec.flag} ${rec.title}</h4>
            <div class="rec-item-meta">
              <span><i class="fa-solid fa-stopwatch"></i> ${rec.formattedDuration}</span>
              <span><i class="fa-solid fa-hard-drive"></i> ${rec.sizeFormatted}</span>
              <span><i class="fa-regular fa-calendar"></i> ${new Date(rec.createdAt).toLocaleDateString("tr-TR")}</span>
            </div>
          </div>
          <div class="rec-item-actions">
            <button class="rec-action-icon-btn download" title="Cihaza İndir"><i class="fa-solid fa-download"></i></button>
            <button class="rec-action-icon-btn delete" title="Kaydı Sil"><i class="fa-solid fa-trash"></i></button>
          </div>
        </div>
        <audio controls src="${audioUrl}" class="rec-item-audio-player"></audio>
      `;

      // İndir
      card.querySelector(".download").addEventListener("click", () => {
        window.radioRecorder.downloadRecording(rec);
        showToast("🎵 MP3 ses kaydı galeri / cihazınıza indiriliyor...");
      });

      // Sil
      card.querySelector(".delete").addEventListener("click", async () => {
        if (confirm(`"${rec.title}" kaydını silmek istediğinize emin misiniz?`)) {
          await window.radioRecorder.deleteRecording(rec.id);
          showToast("Kayıt silindi.");
          updateRecordCountBadge();
          renderRecordingsList();
        }
      });

      recordingsList.appendChild(card);
    });
  }

  async function updateRecordCountBadge() {
    const records = await window.radioRecorder.getAllRecordings();
    recordCountBadge.textContent = records.length;
  }

  // --- FAVORİ YÖNETİMİ ---
  function toggleFavorite(stationId) {
    if (favorites.includes(stationId)) {
      favorites = favorites.filter(id => id !== stationId);
      showToast("Favorilerden çıkarıldı");
    } else {
      favorites.push(stationId);
      showToast("❤️ Favorilere eklendi");
    }
    localStorage.setItem("kuran_radyo_favs", JSON.stringify(favorites));
    updateFavButtonState();
    renderStationsList();
  }

  function updateFavButtonState() {
    const currentId = STATIONS_DATA[currentStationIndex].id;
    const isFav = favorites.includes(currentId);
    if (isFav) {
      favToggleBtn.classList.add("active");
      favHeartIcon.className = "fa-solid fa-heart";
      favToggleBtn.innerHTML = `<i class="fa-solid fa-heart" style="color:#ef4444;"></i> Favorilerimde`;
    } else {
      favToggleBtn.classList.remove("active");
      favHeartIcon.className = "fa-regular fa-heart";
      favToggleBtn.innerHTML = `<i class="fa-regular fa-heart"></i> Favoriye Ekle`;
    }
  }

  // --- SEKMELER ARASI GEÇİŞ ---
  function switchTab(tabId) {
    tabButtons.forEach(btn => {
      btn.classList.toggle("active", btn.getAttribute("data-tab") === tabId);
    });
    tabPanes.forEach(pane => {
      pane.classList.toggle("active", pane.id === tabId);
    });

    if (tabId === "recordings-tab") {
      renderRecordingsList();
    }
  }

  // --- UYKU ZAMANLAYICI ---
  function setSleepTimer(minutes) {
    if (sleepTimerTimeout) {
      clearTimeout(sleepTimerTimeout);
      sleepTimerTimeout = null;
    }

    if (minutes > 0) {
      sleepTimerTimeout = setTimeout(() => {
        pauseAudio();
        showToast("🌙 Uyku zamanlayıcı: Radyo kapatıldı. Huzurlu geceler.");
        sleepTimerLabel.textContent = "Uyku Zamanlayıcı";
        sleepTimerBtn.classList.remove("active");
      }, minutes * 60 * 1000);

      sleepTimerLabel.textContent = `${minutes} Dk Kapat`;
      sleepTimerBtn.classList.add("active");
      showToast(`⏰ Radyo ${minutes} dakika sonra otomatik kapanacak.`);
    } else {
      sleepTimerLabel.textContent = "Uyku Zamanlayıcı";
      sleepTimerBtn.classList.remove("active");
      showToast("Uyku zamanlayıcı iptal edildi.");
    }
    sleepModal.classList.remove("open");
  }

  // --- BİLDİRİM TOAST ---
  function showToast(message) {
    const toast = document.createElement("div");
    toast.className = "toast";
    toast.innerHTML = `<i class="fa-solid fa-circle-info" style="color:var(--gold-glow);"></i> <span>${message}</span>`;
    toastContainer.appendChild(toast);
    setTimeout(() => {
      toast.style.opacity = "0";
      setTimeout(() => toast.remove(), 300);
    }, 3200);
  }

  // --- EVENT LISTENERS ---
  function setupEventListeners() {
    // Play/Pause
    mainPlayBtn.addEventListener("click", () => {
      if (isPlaying) pauseAudio();
      else playAudio();
    });

    miniPlayBtn.addEventListener("click", () => {
      if (isPlaying) pauseAudio();
      else playAudio();
    });

    prevStationBtn.addEventListener("click", () => {
      loadStation(currentStationIndex - 1, true);
    });

    nextStationBtn.addEventListener("click", () => {
      loadStation(currentStationIndex + 1, true);
    });

    // Ses Ayarı
    volumeSlider.addEventListener("input", (e) => {
      mainAudio.volume = parseFloat(e.target.value);
    });

    // Kayıt Butonları
    recToggleBtn.addEventListener("click", handleRecordToggle);
    miniRecBtn.addEventListener("click", () => {
      switchTab("player-tab");
      handleRecordToggle();
    });

    // Favori Butonu
    favToggleBtn.addEventListener("click", () => {
      toggleFavorite(STATIONS_DATA[currentStationIndex].id);
    });

    // Türkiye Filtreleri
    if (turkeyFilterChips) {
      turkeyFilterChips.querySelectorAll(".filter-pill").forEach(pill => {
        pill.addEventListener("click", () => {
          turkeyFilterChips.querySelectorAll(".filter-pill").forEach(p => p.classList.remove("active"));
          pill.classList.add("active");
          activeTurkeyFilter = pill.getAttribute("data-filter");
          renderTurkeyStationsList();
        });
      });
    }

    // Tab Geçişleri
    tabButtons.forEach(btn => {
      btn.addEventListener("click", () => {
        switchTab(btn.getAttribute("data-tab"));
      });
    });

    recordListBtn.addEventListener("click", () => {
      switchTab("recordings-tab");
    });

    miniPlayerClickArea.addEventListener("click", () => {
      switchTab("player-tab");
    });

    // Arama & Filtreleme
    stationSearchInput.addEventListener("input", renderStationsList);
    clearSearchBtn.addEventListener("click", () => {
      stationSearchInput.value = "";
      renderStationsList();
    });

    countryFiltersBar.querySelectorAll(".filter-pill").forEach(pill => {
      pill.addEventListener("click", () => {
        countryFiltersBar.querySelectorAll(".filter-pill").forEach(p => p.classList.remove("active"));
        pill.classList.add("active");
        activeFilter = pill.getAttribute("data-filter");
        renderStationsList();
      });
    });

    // Uyku Modalı
    sleepTimerBtn.addEventListener("click", () => sleepModal.classList.add("open"));
    closeSleepModal.addEventListener("click", () => sleepModal.classList.remove("open"));
    timerButtons.forEach(btn => {
      btn.addEventListener("click", () => {
        const time = parseInt(btn.getAttribute("data-time"));
        setSleepTimer(time);
      });
    });

    // Tema Değiştirici
    themeToggleBtn.addEventListener("click", () => {
      const current = document.documentElement.getAttribute("data-theme");
      if (current === "light") {
        document.documentElement.removeAttribute("data-theme");
        themeToggleBtn.innerHTML = `<i class="fa-solid fa-moon"></i>`;
      } else {
        document.documentElement.setAttribute("data-theme", "light");
        themeToggleBtn.innerHTML = `<i class="fa-solid fa-sun"></i>`;
      }
    });

    // Audio Hata Yakalama
    mainAudio.addEventListener("error", () => {
      console.warn("Ses akışı bağlantı hatası oluştu.");
    });
  }
});
