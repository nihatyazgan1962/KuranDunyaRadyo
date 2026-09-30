const https = require('https');
const http = require('http');
const { STATIONS_DATA } = require('./stations.js');

function testUrl(url, timeoutMs = 6000) {
  return new Promise((resolve) => {
    try {
      const parsed = new URL(url);
      const client = parsed.protocol === 'https:' ? https : http;
      
      const req = client.get(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': '*/*'
        }
      }, (res) => {
        // HTTP 200, 206, 301, 302, etc.
        const isOk = (res.statusCode >= 200 && res.statusCode < 400);
        const contentType = res.headers['content-type'] || '';
        res.destroy(); // stop downloading
        resolve({ ok: isOk, status: res.statusCode, contentType });
      });

      req.on('error', (e) => {
        resolve({ ok: false, error: e.message });
      });

      req.setTimeout(timeoutMs, () => {
        req.destroy();
        resolve({ ok: false, error: 'TIMEOUT' });
      });
    } catch (err) {
      resolve({ ok: false, error: err.message });
    }
  });
}

async function analyzeAll() {
  console.log(`Analyzing ${STATIONS_DATA.length} stations...`);
  const working = [];
  const broken = [];

  for (let i = 0; i < STATIONS_DATA.length; i++) {
    const station = STATIONS_DATA[i];
    process.stdout.write(`[${i+1}/${STATIONS_DATA.length}] Testing: ${station.name}... `);

    // Test primary stream
    let result = await testUrl(station.streamUrl);
    let workingUrl = station.streamUrl;

    if (!result.ok && station.backupUrl) {
      const backupResult = await testUrl(station.backupUrl);
      if (backupResult.ok) {
        result = backupResult;
        workingUrl = station.backupUrl;
      }
    }

    if (result.ok) {
      console.log(`✅ OK (${result.status} ${result.contentType || ''})`);
      working.push({
        ...station,
        streamUrl: workingUrl
      });
    } else {
      console.log(`❌ FAILED (${result.error || result.status})`);
      broken.push({ name: station.name, id: station.id, error: result.error || result.status });
    }
  }

  console.log(`\n=== SUMMARY ===`);
  console.log(`Total: ${STATIONS_DATA.length}`);
  console.log(`Working: ${working.length}`);
  console.log(`Broken / Inactive: ${broken.length}`);

  // Write working stations to verified_stations.json
  const fs = require('fs');
  fs.writeFileSync('./analysis_report.json', JSON.stringify({
    total: STATIONS_DATA.length,
    workingCount: working.length,
    brokenCount: broken.length,
    working,
    broken
  }, null, 2), 'utf-8');

  console.log("Analysis saved to analysis_report.json");
}

analyzeAll();
