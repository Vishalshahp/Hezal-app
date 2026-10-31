import mongoose from 'mongoose';
import env from '../config/env.js';
import User from '../models/User.js';
import VendorProfile from '../models/VendorProfile.js';
import Product from '../models/Product.js';

async function cleanup() {
  await mongoose.connect(env.MONGODB_URI);
  console.log('--- Cleaning Stale Duplicate Vendor Profiles ---');

  const staleEmails = [
    'pooja.coconut@example.com',
    'kathiyawadi.gathiya@example.com',
    'sector21.khichdi@example.com'
  ];

  for (const email of staleEmails) {
    const user = await User.findOne({ email });
    if (user) {
      const profile = await VendorProfile.findOne({ userId: user._id });
      if (profile) {
        const delProds = await Product.deleteMany({ vendorId: profile._id });
        console.log(`Deleted ${delProds.deletedCount} products for stale profile: ${profile.stallName}`);
        await VendorProfile.deleteOne({ _id: profile._id });
        console.log(`Deleted stale vendor profile: ${profile.stallName} (ID: ${profile._id})`);
      }
      await User.deleteOne({ _id: user._id });
      console.log(`Deleted stale user: ${email}`);
    }
  }

  // Also clean up any products whose vendorId doesn't exist
  const allProfiles = await VendorProfile.find({}, '_id');
  const validIds = allProfiles.map(p => p._id);
  const orphanedProds = await Product.deleteMany({ vendorId: { $nin: validIds } });
  if (orphanedProds.deletedCount > 0) {
    console.log(`Cleaned up ${orphanedProds.deletedCount} orphaned products with invalid vendorId`);
  }

  const remainingVendors = await VendorProfile.countDocuments({});
  console.log(`✓ Cleanup complete! Remaining active vendors in DB: ${remainingVendors}`);

  process.exit(0);
}

cleanup().catch(e => {
  console.error('Cleanup failed:', e);
  process.exit(1);
});
