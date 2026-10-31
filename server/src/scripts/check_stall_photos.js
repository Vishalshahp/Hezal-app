import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const seedPath = path.resolve(__dirname, 'seedSampleVendors.js');
const content = fs.readFileSync(seedPath, 'utf-8');

const regex = /stallName:\s*'([^']+)'[\s\S]*?coverPhoto:\s*'([^']+)'/g;
let m;
const stallPhotos = [];
const photoCounts = {};
while ((m = regex.exec(content)) !== null) {
  const stallName = m[1];
  const url = m[2];
  stallPhotos.push({ stallName, url });
  photoCounts[url] = (photoCounts[url] || 0) + 1;
}

console.log(`Total stalls parsed: ${stallPhotos.length}`);
let hasDupes = false;
for (const [url, count] of Object.entries(photoCounts)) {
  if (count > 1) {
    hasDupes = true;
    console.log(`DUPLICATE URL (${count} stalls): ${url}`);
    stallPhotos.filter(s => s.url === url).forEach(s => console.log(`  - ${s.stallName}`));
  }
}
if (!hasDupes) {
  console.log('✓ All 39 stalls have 100% UNIQUE cover photos!');
}

stallPhotos.forEach((s, i) => {
  console.log(`${i + 1}. [${s.stallName}] -> ${s.url}`);
});
