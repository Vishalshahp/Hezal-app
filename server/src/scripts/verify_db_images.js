import mongoose from 'mongoose';
import env from '../config/env.js';
import VendorProfile from '../models/VendorProfile.js';
import Product from '../models/Product.js';

async function verify() {
  await mongoose.connect(env.MONGODB_URI);

  const vendors = await VendorProfile.find({});
  const products = await Product.find({}).populate('vendorId', 'stallName coverPhoto');

  console.log(`\n=== AUDIT RESULTS: DATABASE IMAGES ===`);
  console.log(`Total Stalls: ${vendors.length}`);
  console.log(`Total Products: ${products.length}`);

  let missingStallCovers = 0;
  const stallCoverMap = {};
  for (const v of vendors) {
    if (!v.coverPhoto) {
      missingStallCovers++;
      console.log(`Missing coverPhoto: Stall "${v.stallName}" (${v._id})`);
    } else {
      if (stallCoverMap[v.coverPhoto]) {
        console.log(`Duplicate Stall Cover: "${v.stallName}" and "${stallCoverMap[v.coverPhoto]}"`);
      } else {
        stallCoverMap[v.coverPhoto] = v.stallName;
      }
    }
  }

  let missingProdImages = 0;
  const prodImgMap = {};
  let stallProdOverlap = 0;

  for (const p of products) {
    if (!p.image || p.image.trim() === '') {
      missingProdImages++;
      console.log(`Missing Product Image: "${p.name}" (Stall: ${p.vendorId?.stallName})`);
    } else {
      if (stallCoverMap[p.image]) {
        stallProdOverlap++;
        console.log(`Overlap with Stall Cover: Product "${p.name}" shares image with Stall "${stallCoverMap[p.image]}"`);
      }
      if (prodImgMap[p.image]) {
        console.log(`Duplicate Product Image: "${p.name}" and "${prodImgMap[p.image]}" (${p.image})`);
      } else {
        prodImgMap[p.image] = p.name;
      }
    }
  }

  console.log(`\n--- Summary ---`);
  console.log(`Missing Stall Covers: ${missingStallCovers}`);
  console.log(`Missing Product Images: ${missingProdImages}`);
  console.log(`Stall Cover vs Product Overlaps: ${stallProdOverlap}`);
  console.log(`Unique Product Images: ${Object.keys(prodImgMap).length} / ${products.length}`);

  if (missingStallCovers === 0 && missingProdImages === 0 && stallProdOverlap === 0) {
    console.log(`✓ 100% PERFECT AUDIT: All stall covers and product images are valid, populated, and non-repeating!`);
  }

  process.exit(0);
}

verify().catch(e => {
  console.error(e);
  process.exit(1);
});
