import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const seedPath = path.resolve(__dirname, 'seedSampleVendors.js');
const content = fs.readFileSync(seedPath, 'utf-8');

// Match each stall block: stallName and products array
const stallRegex = /stallName:\s*'([^']+)'[\s\S]*?products:\s*\[([\s\S]*?)\]/g;
let match;
let count = 0;
let totalProducts = 0;
const allProducts = [];

while ((match = stallRegex.exec(content)) !== null) {
  count++;
  const stallName = match[1];
  const prodBlock = match[2];
  const prodRegex = /name:\s*'([^']+)'(?:,\s*description:\s*'([^']+)')?(?:,\s*price:\s*(\d+))?/g;
  let pMatch;
  const stallProds = [];
  while ((pMatch = prodRegex.exec(prodBlock)) !== null) {
    stallProds.push({
      name: pMatch[1],
      description: pMatch[2] || '',
      price: pMatch[3] ? Number(pMatch[3]) : 0
    });
    totalProducts++;
  }
  allProducts.push({
    stall: stallName,
    products: stallProds
  });
}

console.log(`Parsed ${count} stalls with ${totalProducts} total products.`);
fs.writeFileSync(path.resolve(__dirname, 'seed_inventory.json'), JSON.stringify(allProducts, null, 2));
console.log('Saved inventory to seed_inventory.json');
