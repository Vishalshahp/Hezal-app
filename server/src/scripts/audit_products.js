import mongoose from 'mongoose';
import env from '../config/env.js';
import Product from '../models/Product.js';
import VendorProfile from '../models/VendorProfile.js';

// Import from client stallImages.js
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function run() {
  await mongoose.connect(env.MONGODB_URI);
  const products = await Product.find({}).populate('vendorId', 'stallName coverPhoto categories');
  console.log(`Total Products in DB: ${products.length}`);

  // Read stallImages.js to extract PRODUCT_IMAGES
  const clientImagesPath = path.resolve(__dirname, '../../../client/src/utils/stallImages.js');
  const fileContent = fs.readFileSync(clientImagesPath, 'utf-8');

  // Parse PRODUCT_IMAGES object keys
  const match = fileContent.match(/export const PRODUCT_IMAGES = {([\s\S]*?)};/);
  const productImages = {};
  if (match) {
    const lines = match[1].split('\n');
    for (const line of lines) {
      const lineMatch = line.match(/'([^']+)':\s*'([^']+)'/);
      if (lineMatch) {
        productImages[lineMatch[1].toLowerCase()] = lineMatch[2];
      }
    }
  }
  console.log(`Found ${Object.keys(productImages).length} mapping keys in PRODUCT_IMAGES`);

  let matchedCount = 0;
  let unmatchedCount = 0;
  const unmatchedList = [];
  const matchedList = [];

  for (const p of products) {
    const nameLower = (p.name || '').toLowerCase();
    let matchedKey = null;
    let matchedUrl = null;
    for (const [key, url] of Object.entries(productImages)) {
      if (nameLower.includes(key)) {
        matchedKey = key;
        matchedUrl = url;
        break;
      }
    }

    if (matchedKey) {
      matchedCount++;
      matchedList.push({
        stall: p.vendorId?.stallName || 'Orphaned',
        name: p.name,
        key: matchedKey
      });
    } else {
      unmatchedCount++;
      unmatchedList.push({
        stall: p.vendorId?.stallName || 'Orphaned',
        name: p.name,
        price: p.price,
        description: p.description
      });
    }
  }

  console.log(`\nMatched: ${matchedCount}, Unmatched: ${unmatchedCount}`);
  console.log('\n--- UNMATCHED PRODUCTS ---');
  unmatchedList.forEach((item, i) => {
    console.log(`${i + 1}. [${item.stall}] -> "${item.name}" (₹${item.price}) | ${item.description}`);
  });

  process.exit(0);
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});
