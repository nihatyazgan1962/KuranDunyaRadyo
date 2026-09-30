const https = require('https');
const http = require('http');

const islamicQuranRadios = [
  // MEKKE & MEDİNE
  { id: 'makkah-live', url: 'https://stream.radiojar.com/0tpy1h0kxtzuv', name: 'Mekke Kâbe Canlı' },
  { id: 'tarteel', url: 'https://qurango.net/radio/tarteel', name: 'Dünya Hatim Radyosu' },
  { id: 'saudi-quran', url: 'https://stream.zeno.fm/4wgahvqy0zquv', name: 'Suudi Kur\'an Radyosu' },
  
  // TÜRKİYE RESMİ DİYANET
  { id: 'tr-diyanet-kuran', url: 'https://yayin.diyanet.gov.tr/kuranradyo', name: 'Diyanet Kur\'an Radyo' },
  { id: 'tr-diyanet-radyo', url: 'https://yayin.diyanet.gov.tr/diyanetradyo', name: 'Diyanet Radyo' },
  { id: 'tr-diyanet-risalet', url: 'https://yayin.diyanet.gov.tr/risaletradyo', name: 'Diyanet Risalet Radyo' },
  
  // TÜRKÇE MEAL & DUA & RİSALE
  { id: 'tr-quran-meal', url: 'https://qurango.net/radio/translation_quran_turkish', name: 'Türkçe Kur\'an Meali' },
  { id: 'tr-ruqyah', url: 'https://qurango.net/radio/roqiah', name: 'Rukye ve Şifa Ayetleri' },
  { id: 'tr-athkar', url: 'https://qurango.net/radio/athkar_sabah', name: 'Sabah Akşam Zikirleri' },
  { id: 'tr-fatawa', url: 'https://qurango.net/radio/fatawa', name: 'Fetva ve Fıkıh Radyosu' },

  // DÜNYACA MEŞHUR HAFIZLAR (HER BİRİ FARKLI SES VE HATİM)
  { id: 'abdulbasit-mojawwad', url: 'https://qurango.net/radio/abdulbasit_abdulsamad_mojawwad', name: 'Şeyh Abdussamed (Mücevved)' },
  { id: 'abdulbasit-murattal', url: 'https://qurango.net/radio/abdulbasit_abdulsamad', name: 'Şeyh Abdussamed (Murattal)' },
  { id: 'abdulbasit-warsh', url: 'https://qurango.net/radio/abdulbasit_abdulsamad_warsh', name: 'Şeyh Abdussamed (Verş Kıraati)' },
  { id: 'minshawi-mojawwad', url: 'https://qurango.net/radio/mohammed_siddiq_alminshawi_mojawwad', name: 'Şeyh Minşavi (Mücevved)' },
  { id: 'minshawi-murattal', url: 'https://qurango.net/radio/mohammed_siddiq_alminshawi', name: 'Şeyh Minşavi (Murattal)' },
  { id: 'husary-mojawwad', url: 'https://qurango.net/radio/mahmoud_khalil_alhussary_mojawwad', name: 'Şeyh Husari (Tecvid)' },
  { id: 'husary-murattal', url: 'https://qurango.net/radio/mahmoud_khalil_alhussary', name: 'Şeyh Husari (Hatim)' },
  { id: 'mustafa-ismail', url: 'https://qurango.net/radio/mustafa_ismail', name: 'Şeyh Mustafa İsmail' },
  { id: 'mishary-alafasi', url: 'https://qurango.net/radio/mishary_alafasi', name: 'Şeyh Mişari el-Afasi' },
  { id: 'sudais', url: 'https://qurango.net/radio/abdulrahman_alsudaes', name: 'Şeyh Abdurrahman es-Sudeys' },
  { id: 'shuraim', url: 'https://qurango.net/radio/saood_alshuraim', name: 'Şeyh Suud eş-Şureym' },
  { id: 'maher-almuaiqly', url: 'https://qurango.net/radio/maher', name: 'Şeyh Mahir el-Muaykili' },
  { id: 'saad-alghamdi', url: 'https://qurango.net/radio/saad_alghamdi', name: 'Şeyh Saad el-Gamidi' },
  { id: 'abu-bakr-shatri', url: 'https://qurango.net/radio/shatri', name: 'Şeyh Ebu Bekir eş-Şatri' },
  { id: 'yasser-aldosari', url: 'https://qurango.net/radio/yasser_aldosari', name: 'Şeyh Yasir ed-Devseri' },
  { id: 'nasser-alqatami', url: 'https://qurango.net/radio/nasser_alqatami', name: 'Şeyh Nasır el-Katami' },
  { id: 'fares-abbad', url: 'https://qurango.net/radio/fares_abbad', name: 'Şeyh Faris Abbad' },
  { id: 'ahmad-alajmy', url: 'https://qurango.net/radio/ahmad_alajmy', name: 'Şeyh Ahmed el-Acemi' },
  { id: 'ali-jaber', url: 'https://qurango.net/radio/ali_jaber', name: 'Şeyh Ali Cabir (Eski Kâbe İmamı)' },
  { id: 'khalid-aljalil', url: 'https://qurango.net/radio/khalid_aljaleel', name: 'Şeyh Halid el-Celil' },
  { id: 'idrees-abkar', url: 'https://qurango.net/radio/idrees_abkar', name: 'Şeyh İdris Ebker' },
  { id: 'mohammad-ayyub', url: 'https://qurango.net/radio/mohammad_ayyub', name: 'Şeyh Muhammed Eyyub (Mescid-i Nebevi)' },
  { id: 'abdullah-basfar', url: 'https://qurango.net/radio/abdullah_basfar', name: 'Şeyh Abdullah Basfar' },
  { id: 'abdullah-khayat', url: 'https://qurango.net/radio/abdullah_khayyat', name: 'Şeyh Abdullah Hayyat' },
  { id: 'salah-albudair', url: 'https://qurango.net/radio/salah_albudair', name: 'Şeyh Salah el-Budeyr' },
  { id: 'salah-bukhatir', url: 'https://qurango.net/radio/salah_bukhatir', name: 'Şeyh Salah Bu Hatir' },
  { id: 'ali-alhudhaifi', url: 'https://qurango.net/radio/ali_alhudhaifi', name: 'Şeyh Ali el-Huzeyfi' },
  { id: 'mohammad-jibreel', url: 'https://qurango.net/radio/mohammed_jibreel', name: 'Şeyh Muhammed Cibril' }
];

function checkUrl(url) {
  return new Promise((resolve) => {
    try {
      const parsed = new URL(url);
      const client = parsed.protocol === 'https:' ? https : http;
      const req = client.get(url, {
        headers: { 'User-Agent': 'Mozilla/5.0' }
      }, (res) => {
        const isOk = res.statusCode >= 200 && res.statusCode < 400;
        res.destroy();
        resolve({ ok: isOk, status: res.statusCode });
      });
      req.on('error', (e) => resolve({ ok: false, error: e.message }));
      req.setTimeout(4000, () => {
        req.destroy();
        resolve({ ok: false, error: 'TIMEOUT' });
      });
    } catch (e) {
      resolve({ ok: false, error: e.message });
    }
  });
}

async function verifyAll() {
  console.log(`Testing ${islamicQuranRadios.length} distinct stations...`);
  const valid = [];
  for (const item of islamicQuranRadios) {
    const res = await checkUrl(item.url);
    console.log(`${item.name}: ${res.ok ? '✅ ' + res.status : '❌ ' + (res.error || res.status)}`);
    if (res.ok) valid.push(item);
  }
  console.log(`\nVerified distinct stations: ${valid.length} / ${islamicQuranRadios.length}`);
}

verifyAll();
