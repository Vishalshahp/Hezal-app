import mongoose from 'mongoose';
import env from '../config/env.js';
import VendorProfile from '../models/VendorProfile.js';
import Product from '../models/Product.js';
import Category from '../models/Category.js';

async function run() {
  await mongoose.connect(env.MONGODB_URI);

  const vendors = await VendorProfile.find({}).populate('categories', 'name slug');
  console.log(`Total vendors in DB: ${vendors.length}`);

  const vendorMap = {};
  for (const v of vendors) {
    const prods = await Product.find({ vendorId: v._id });
    console.log(`\nStall: "${v.stallName}" | ID: ${v._id} | City: ${v.address?.city} | Category: ${v.categories?.map(c => c.name).join(', ')} | Cover: ${v.coverPhoto ? 'YES' : 'NONE'}`);
    console.log(`Products (${prods.length}):`);
    for (const p of prods) {
      console.log(`  - "${p.name}" (Price: ₹${p.price}, HasImg: ${!!p.image})`);
    }
  }

  process.exit(0);
}

run().catch(e => {
  console.error(e);
  process.exit(1);
});
