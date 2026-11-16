import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { connectDB, disconnectDB } from '../config/db.js';
import VendorProfile from '../models/VendorProfile.js';
import Category from '../models/Category.js';
import Product from '../models/Product.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function run() {
  await connectDB();

  const rawCategories = await Category.find({ isActive: true }).lean();
  const rawVendors = await VendorProfile.find({ approvalStatus: 'approved' }).lean();
  const rawProducts = await Product.find({ isAvailable: true }).lean();

  const categoriesMap = new Map();
  const formattedCategories = rawCategories.map((c) => {
    const item = {
      id: c._id.toString(),
      _id: c._id.toString(),
      name: c.name,
      slug: c.slug,
      icon: c.icon || 'Utensils',
      description: c.description,
    };
    categoriesMap.set(c._id.toString(), item);
    return item;
  });

  const productsByVendor = new Map();
  rawProducts.forEach((p) => {
    if (!p.vendorProfile) return;
    const vId = p.vendorProfile.toString();
    if (!productsByVendor.has(vId)) productsByVendor.set(vId, []);
    productsByVendor.get(vId).push({
      id: p._id.toString(),
      _id: p._id.toString(),
      name: p.name,
      price: p.price,
      description: p.description,
      isAvailable: p.isAvailable,
      category: p.category ? p.category.toString() : null,
    });
  });

  const formattedVendors = rawVendors.map((v) => {
    const vId = v._id.toString();
    const vendorProds = productsByVendor.get(vId) || [];
    const populatedCategories = (v.categories || []).map((catId) => {
      return (
        categoriesMap.get(catId.toString()) || {
          id: catId.toString(),
          name: 'Street Food',
          slug: 'street-food',
        }
      );
    });

    return {
      id: vId,
      _id: vId,
      stallName: v.stallName,
      stallType: v.stallType || 'mobile',
      tagline: v.tagline,
      description: v.description,
      coverImageUrl: v.coverImageUrl,
      address: v.address,
      location: v.location,
      locationUpdatedAt: v.locationUpdatedAt
        ? v.locationUpdatedAt.toISOString()
        : new Date().toISOString(),
      availabilityStatus: v.availabilityStatus || 'open',
      approvalStatus: 'approved',
      openingHours: v.openingHours || [],
      contactPublic: v.contactPublic || { phone: '+919876543210', whatsapp: '+919876543210' },
      categories: populatedCategories,
      productCount: vendorProds.length,
      sampleProducts: vendorProds.slice(0, 4),
      products: vendorProds,
    };
  });

  const code = `// Auto-generated verified offline & Vercel demo fallback data
export const FALLBACK_CATEGORIES = ${JSON.stringify(formattedCategories, null, 2)};

export const FALLBACK_VENDORS = ${JSON.stringify(formattedVendors, null, 2)};
`;

  const outPath = path.resolve(__dirname, '../../../client/src/data/fallbackData.js');
  fs.writeFileSync(outPath, code, 'utf-8');
  console.log('Successfully wrote', formattedVendors.length, 'vendors to', outPath);

  await disconnectDB();
  process.exit(0);
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
