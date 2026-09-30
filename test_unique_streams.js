const https = require('https');
const http = require('http');

const testStreams = [
  // AKRA FM
  { id: 'tr-akra', name: 'Akra FM', urls: [
    'https://stream.akradyo.net/akra.mp3',
    'https://radyo.akradyo.net/akra.mp3',
    'http://46.20.7.126/listen.pls',
    'https://stream.zeno.fm/f3wvbbqmdg8uv'
  ]},
  // DİYANET KURAN
  { id: 'tr-diyanet-kuran', name: 'Diyanet Kur\'an', urls: [
    'https://kuranradyo.canliyayin.org/;',
    'http://yayin.diyanet.gov.tr:8000/kuran',
    'https://yayin.diyanet.gov.tr/kuranradyo',
    'https://stream.radiojar.com/0tpy1h0kxtzuv'
  ]},
  // DİYANET RADYO
  { id: 'tr-diyanet-radyo', name: 'Diyanet Radyo', urls: [
    'https://diyanetradyo.canliyayin.org/;',
    'http://yayin.diyanet.gov.tr:8000/radyo',
    'https://yayin.diyanet.gov.tr/diyanetradyo'
  ]},
  // SEMERKAND
  { id: 'tr-semerkand', name: 'Semerkand Radyo', urls: [
    'https://semerkandradyo.canliyayin.org/;',
    'http://yayin.semerkandradyo.com:8020/;'
  ]},
  // ERKAM
  { id: 'tr-erkam', name: 'Erkam Radyo', urls: [
    'https://yayin.erkamradyo.com/erkamradyo.mp3',
    'http://yayin.erkamradyo.com:8000/erkam'
  ]},
  // LALEGÜL
  { id: 'tr-lalegul', name: 'Lalegül FM', urls: [
    'https://yayin.lalegulfm.com/lalegulfm',
    'http://yayin.lalegulfm.com:8000/lalegul'
  ]},
  // TGRT FM
  { id: 'tr-tgrt', name: 'TGRT FM', urls: [
    'https://tgrtfm.canliyayin.org/;',
    'http://stream.tgrthaber.com.tr:8000/tgrtfm'
  ]},
  // RİSALE-İ NUR RADYO
  { id: 'tr-risale', name: 'Risale-i Nur Radyo', urls: [
    'https://qurango.net/radio/translation_quran_turkish',
    'https://stream.zeno.fm/0tpy1h0kxtzuv'
  ]}
];

function checkUrl(url) {
  return new Promise((resolve) => {
    try {
      const parsed = new URL(url);
      const client = parsed.protocol === 'https:' ? https : http;
      const req = client.get(url, {
        headers: { 'User-Agent': 'Mozilla/5.0 VLC/3.0.18 LibVLC/3.0.18' }
      }, (res) => {
        const isOk = res.statusCode >= 200 && res.statusCode < 400;
        res.destroy();
        resolve({ url, ok: isOk, status: res.statusCode, contentType: res.headers['content-type'] });
      });
      req.on('error', (e) => resolve({ url, ok: false, error: e.message }));
      req.setTimeout(4000, () => {
        req.destroy();
        resolve({ url, ok: false, error: 'TIMEOUT' });
      });
    } catch (e) {
      resolve({ url, ok: false, error: e.message });
    }
  });
}

async function run() {
  for (const item of testStreams) {
    console.log(`\nTesting ${item.name}:`);
    for (const url of item.urls) {
      const res = await checkUrl(url);
      console.log(`  ${url} -> ${res.ok ? '✅ ' + res.status + ' (' + (res.contentType || '') + ')' : '❌ ' + (res.error || res.status)}`);
    }
  }
}

run();
