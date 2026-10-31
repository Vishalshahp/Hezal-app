import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const inventory = JSON.parse(fs.readFileSync(path.resolve(__dirname, 'seed_inventory.json'), 'utf-8'));

console.log(`Total Stalls: ${inventory.length}`);
let pCount = 0;
for (const s of inventory) {
  for (const p of s.products) {
    pCount++;
    console.log(`${pCount}. [${s.stall}] -> "${p.name}" | "${p.description}"`);
  }
}
