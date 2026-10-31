import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const seedPath = path.resolve(__dirname, 'seedSampleVendors.js');
const content = fs.readFileSync(seedPath, 'utf-8');

// Find all stallNames and products
const stallRegex = /stallName:\s*'([^']+)'/g;
let match;
const stalls = [];
while ((match = stallRegex.exec(content)) !== null) {
  stalls.push(match[1]);
}
console.log(`Found ${stalls.length} stalls in seed file:`);
stalls.forEach((s, i) => console.log(`${i + 1}. ${s}`));
