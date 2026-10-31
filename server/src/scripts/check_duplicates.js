import mongoose from 'mongoose';
import env from '../config/env.js';
import VendorProfile from '../models/VendorProfile.js';
import User from '../models/User.js';

async function check() {
  await mongoose.connect(env.MONGODB_URI);
  const profiles = await VendorProfile.find({}).populate('userId', 'email name role');
  console.log(`Total profiles: ${profiles.length}`);

  const byName = {};
  for (const p of profiles) {
    if (!byName[p.stallName]) byName[p.stallName] = [];
    byName[p.stallName].push({
      profileId: p._id,
      userEmail: p.userId?.email,
      userName: p.userId?.name,
      coverPhoto: p.coverPhoto,
      categoriesCount: p.categories?.length || 0,
      createdAt: p.createdAt
    });
  }

  for (const [name, list] of Object.entries(byName)) {
    if (list.length > 1) {
      console.log(`\nDUPLICATE STALL: "${name}" (${list.length} entries):`);
      list.forEach(l => console.log(`  - ID: ${l.profileId}, Email: ${l.userEmail}, Cover: ${l.coverPhoto ? 'YES' : 'NONE'}, Cats: ${l.categoriesCount}`));
    }
  }

  process.exit(0);
}

check().catch(e => { console.error(e); process.exit(1); });
