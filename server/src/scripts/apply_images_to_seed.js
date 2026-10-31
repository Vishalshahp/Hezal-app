import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { CURATED_PRODUCT_IMAGES } from './curate_photos.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const seedPath = path.resolve(__dirname, 'seedSampleVendors.js');
let content = fs.readFileSync(seedPath, 'utf-8');

// For each product name in CURATED_PRODUCT_IMAGES, add or update the `image` property
let replacedCount = 0;
for (const [prodName, imgUrl] of Object.entries(CURATED_PRODUCT_IMAGES)) {
  // Find { name: 'prodName', ... }
  // We want: { name: 'prodName', image: 'imgUrl', ... }
  const escapedName = prodName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const regex = new RegExp(`(\\{\\s*name:\\s*'${escapedName}',)(?!\\s*image:)`, 'g');
  if (regex.test(content)) {
    content = content.replace(regex, `$1\n          image: '${imgUrl}',`);
    replacedCount++;
  }
}

console.log(`Injected image field for ${replacedCount} products into seedSampleVendors.js`);

// Now update product upsert loop in seedSampleVendors.js
// Look for `for (const prod of item.products) {`
const oldLoop = `    // Insert sample products
    for (const prod of item.products) {
      const existingProd = await Product.findOne({ vendorId: profile._id, name: prod.name });
      if (!existingProd) {
        await Product.create({
          ...prod,
          vendorId: profile._id,
          categoryId: profile.categories[0] || null
        });
      }
    }`;

const newLoop = `    // Clean up outdated / duplicate products for this vendor
    const validProductNames = item.products.map(p => p.name);
    await Product.deleteMany({
      vendorId: profile._id,
      name: { $nin: validProductNames }
    });

    // Upsert canonical sample products with explicit real images
    for (const prod of item.products) {
      const existingProd = await Product.findOne({ vendorId: profile._id, name: prod.name });
      if (!existingProd) {
        await Product.create({
          ...prod,
          vendorId: profile._id,
          categoryId: profile.categories[0] || null
        });
      } else {
        await Product.updateOne(
          { _id: existingProd._id },
          {
            $set: {
              image: prod.image,
              price: prod.price,
              description: prod.description,
              isAvailable: prod.isAvailable,
              categoryId: profile.categories[0] || null
            }
          }
        );
      }
    }`;

if (content.includes('for (const prod of item.products) {')) {
  content = content.replace(oldLoop, newLoop);
  console.log('✓ Successfully updated product upsert and cleanup loop in seedSampleVendors.js');
} else {
  console.log('Warning: could not find exact product loop to replace, will check manually.');
}

fs.writeFileSync(seedPath, content, 'utf-8');
console.log('Saved seedSampleVendors.js successfully!');
