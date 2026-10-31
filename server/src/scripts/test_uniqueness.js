import { STALL_COVERS, CURATED_PRODUCT_IMAGES } from './curate_photos.js';

const allUrls = {};

console.log('--- Checking Stall Covers Uniqueness ---');
let stallCount = 0;
for (const [stall, url] of Object.entries(STALL_COVERS)) {
  stallCount++;
  if (allUrls[url]) {
    console.log(`Stall collision for "${stall}": already used by "${allUrls[url]}"`);
  } else {
    allUrls[url] = `Stall: ${stall}`;
  }
}
console.log(`Total Stalls checked: ${stallCount}`);

console.log('\n--- Checking Product Images Uniqueness & Overlap with Stalls ---');
let prodCount = 0;
let collisions = 0;
for (const [prod, url] of Object.entries(CURATED_PRODUCT_IMAGES)) {
  prodCount++;
  if (allUrls[url]) {
    collisions++;
    console.log(`Collision for Product "${prod}": already used by "${allUrls[url]}" (${url})`);
  } else {
    allUrls[url] = `Product: ${prod}`;
  }
}

console.log(`\nTotal Products checked: ${prodCount}`);
console.log(`Total Collisions: ${collisions}`);
if (collisions === 0) {
  console.log('✓ 100% UNIQUE! Zero duplicates across all stalls and products!');
}
