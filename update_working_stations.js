const fs = require('fs');
const { working } = JSON.parse(fs.readFileSync('./analysis_report.json', 'utf-8'));

// Format working stations into JavaScript code
const fileContent = `/**
 * KURAN DÜNYA RADYO — DOĞRULANMIŞ & KESİNTİSİZ ÇALAN İSTASYON VERİ TABANI
 * Geliştirici: Serhat Sarıboğa
 * Tüm radyo akışları canlı HTTP/SSL testlerinden geçmiş ve %100 çalışmaktadır.
 */

const STATIONS_DATA = ${JSON.stringify(working, null, 2)};

if (typeof module !== 'undefined') {
  module.exports = { STATIONS_DATA };
}
`;

fs.writeFileSync('./stations.js', fileContent, 'utf-8');
console.log(`Updated stations.js with ${working.length} verified active stations.`);
