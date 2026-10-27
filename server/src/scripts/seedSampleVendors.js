import mongoose from 'mongoose';
import env from '../config/env.js';
import User from '../models/User.js';
import Category from '../models/Category.js';
import VendorProfile from '../models/VendorProfile.js';
import Product from '../models/Product.js';
import bcrypt from 'bcryptjs';

/**
 * Seed realistic approved vendors in Ahmedabad across various areas:
 * - Law Garden (Khau Gali & Handicrafts)
 * - Vastrapur Lake
 * - Manek Chowk
 * - Navrangpura
 * - CG Road
 */
const seedSampleVendors = async () => {
  console.log('--- Seeding Sample Approved Vendors for Hezal Market ---');

  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(env.MONGODB_URI);
  }

  // Ensure categories exist
  let categories = await Category.find({});
  if (categories.length === 0) {
    console.log('No categories found. Seeding categories first...');
    const defaultCategories = [
      { name: 'Street Food', slug: 'street-food', icon: 'Utensils', displayOrder: 1 },
      { name: 'Fresh Produce', slug: 'fresh-produce', icon: 'Apple', displayOrder: 2 },
      { name: 'Beverages & Juices', slug: 'beverages-juices', icon: 'Coffee', displayOrder: 3 },
      { name: 'Flowers & Plants', slug: 'flowers-plants', icon: 'Flower2', displayOrder: 4 },
      { name: 'Handcrafts', slug: 'handcrafts', icon: 'Palette', displayOrder: 5 },
      { name: 'Clothing', slug: 'clothing', icon: 'Shirt', displayOrder: 6 },
      { name: 'Household Essentials', slug: 'household-essentials', icon: 'Home', displayOrder: 7 },
      { name: 'Repair & Services', slug: 'repair-services', icon: 'Wrench', displayOrder: 8 }
    ];
    categories = await Category.insertMany(defaultCategories);
  }

  const categoryMap = {};
  for (const c of categories) {
    categoryMap[c.slug] = c._id;
  }

  const hashedPassword = await bcrypt.hash('SampleVendor123!', 10);

  const sampleData = [
    {
      user: {
        name: 'Ramesh Chatwala',
        email: 'ramesh.chaat@example.com',
        phone: '+919876543201',
        passwordHash: hashedPassword,
        role: 'vendor',
        accountStatus: 'active'
      },
      profile: {
        stallName: 'Ramesh Famous Chaat & Pani Puri',
        stallType: 'mobile',
        tagline: 'Authentic Ahmedabad Khau Gali Pani Puri & Dahi Puri',
        description:
          'Operating in Law Garden since 2012. Known for hygienic mineral water preparations, crispy handmade puris, and 3 distinct spicy/tangy waters.',
        categories: [categoryMap['street-food']],
        contactPublic: {
          phone: '+919876543201',
          whatsapp: '+919876543201'
        },
        address: {
          street: 'Law Garden Khau Gali Stall #4',
          area: 'Ellisbridge',
          city: 'Ahmedabad',
          state: 'Gujarat',
          postalCode: '380006',
          landmark: 'Opposite Law Garden Main Gate'
        },
        location: {
          type: 'Point',
          coordinates: [72.5598, 23.0232] // [lng, lat]
        },
        approvalStatus: 'approved',
        availabilityStatus: 'open',
        openingHours: [
          { day: 'Mon', open: '16:00', close: '23:00', isClosed: false },
          { day: 'Tue', open: '16:00', close: '23:00', isClosed: false },
          { day: 'Wed', open: '16:00', close: '23:00', isClosed: false },
          { day: 'Thu', open: '16:00', close: '23:00', isClosed: false },
          { day: 'Fri', open: '16:00', close: '23:30', isClosed: false },
          { day: 'Sat', open: '15:30', close: '23:30', isClosed: false },
          { day: 'Sun', open: '15:30', close: '23:30', isClosed: false }
        ]
      },
      products: [
        {
          name: 'Special Mineral Water Pani Puri (8 pcs)',
          description: 'Hygienically prepared puris with spicy mint, sweet tamarind, and garlic water.',
          price: 40,
          isAvailable: true
        },
        {
          name: 'Sev Puri (Special Butter Masala)',
          description: 'Crisp flat puris topped with potatoes, onions, chutneys, and nylon sev.',
          price: 60,
          isAvailable: true
        },
        {
          name: 'Dahi Puri Royal',
          description: 'Stuffed puris loaded with sweetened curd, pomegranate seeds, and chaat masala.',
          price: 70,
          isAvailable: true
        }
      ]
    },
    {
      user: {
        name: 'Geeta Clay Crafts',
        email: 'geeta.clay@example.com',
        phone: '+919876543202',
        passwordHash: hashedPassword,
        role: 'vendor',
        accountStatus: 'active'
      },
      profile: {
        stallName: 'Geeta Traditional Terracotta & Pottery',
        stallType: 'fixed',
        tagline: 'Handmade terracotta cookware, matkas, and festival diyas',
        description:
          'Local artisan stall specializing in natural earthenware, water cooling pots, painted clay diyas, and authentic hand-molded clay cookware for healthy cooking.',
        categories: [categoryMap['handcrafts'], categoryMap['household-essentials']],
        contactPublic: {
          phone: '+919876543202',
          whatsapp: '+919876543202'
        },
        address: {
          street: 'Vastrapur Lake Art Promenade Stall #12',
          area: 'Vastrapur',
          city: 'Ahmedabad',
          state: 'Gujarat',
          postalCode: '380015',
          landmark: 'Near Open Air Amphitheatre'
        },
        location: {
          type: 'Point',
          coordinates: [72.5293, 23.035]
        },
        approvalStatus: 'approved',
        availabilityStatus: 'open',
        openingHours: [
          { day: 'Mon', open: '10:00', close: '20:30', isClosed: false },
          { day: 'Tue', open: '10:00', close: '20:30', isClosed: false },
          { day: 'Wed', open: '10:00', close: '20:30', isClosed: false },
          { day: 'Thu', open: '10:00', close: '20:30', isClosed: false },
          { day: 'Fri', open: '10:00', close: '21:00', isClosed: false },
          { day: 'Sat', open: '09:30', close: '21:30', isClosed: false },
          { day: 'Sun', open: '09:30', close: '21:30', isClosed: false }
        ]
      },
      products: [
        {
          name: 'Natural Clay Water Matka (8L with Tap)',
          description: 'Traditionally baked earthenware pot that naturally cools water without electricity.',
          price: 250,
          isAvailable: true
        },
        {
          name: 'Hand-painted Tea Kulhad Set (Pack of 6)',
          description: 'Artisanal clay cups painted with traditional Gujarati motifs.',
          price: 180,
          isAvailable: true
        },
        {
          name: 'Clay Cooking Handi with Lid (2L)',
          description: 'Unglazed earthenware pot suitable for slow flame cooking.',
          price: 320,
          isAvailable: true
        }
      ]
    },
    {
      user: {
        name: 'Kishanlal Fresh Fruits',
        email: 'kishanlal.fruits@example.com',
        phone: '+919876543203',
        passwordHash: hashedPassword,
        role: 'vendor',
        accountStatus: 'active'
      },
      profile: {
        stallName: 'Kishanlal Seasonal Organic Fruits',
        stallType: 'mobile',
        tagline: 'Farm-fresh daily fruits directly from regional orchards',
        description:
          'Roaming pushcart vendor bringing fresh seasonal fruits to the Navrangpura and Gujarat University area every morning. Known for Alphonso mangoes, fresh oranges, and sweet guavas.',
        categories: [categoryMap['fresh-produce']],
        contactPublic: {
          phone: '+919876543203'
        },
        address: {
          street: 'University Road Cart Spot #2',
          area: 'Navrangpura',
          city: 'Ahmedabad',
          state: 'Gujarat',
          postalCode: '380009',
          landmark: 'Beside University Library Gate'
        },
        location: {
          type: 'Point',
          coordinates: [72.5482, 23.0365]
        },
        approvalStatus: 'approved',
        availabilityStatus: 'open',
        openingHours: [
          { day: 'Mon', open: '07:30', close: '13:00', isClosed: false },
          { day: 'Tue', open: '07:30', close: '13:00', isClosed: false },
          { day: 'Wed', open: '07:30', close: '13:00', isClosed: false },
          { day: 'Thu', open: '07:30', close: '13:00', isClosed: false },
          { day: 'Fri', open: '07:30', close: '13:00', isClosed: false },
          { day: 'Sat', open: '07:00', close: '14:00', isClosed: false },
          { day: 'Sun', open: '07:00', close: '14:00', isClosed: false }
        ]
      },
      products: [
        {
          name: 'Sweet Nagpur Oranges (1 Kg)',
          description: 'Juicy, naturally ripened sweet oranges.',
          price: 80,
          isAvailable: true
        },
        {
          name: 'Crisp Royal Gala Apples (1 Kg)',
          description: 'Fresh seasonal hill apples.',
          price: 160,
          isAvailable: true
        },
        {
          name: 'Pomegranate / Anar (per kg)',
          description: 'Deep red, seed-sweet fruit.',
          price: 140,
          isAvailable: true
        }
      ]
    },
    {
      user: {
        name: 'Pooja Fresh Coconut',
        email: 'pooja.coconut@example.com',
        phone: '+919876543204',
        passwordHash: hashedPassword,
        role: 'vendor',
        accountStatus: 'active'
      },
      profile: {
        stallName: 'Green Oasis Tender Coconut Water',
        stallType: 'fixed',
        tagline: 'Chilled sweet tender coconuts and fresh sugarcane juice',
        description:
          'Located at CG Road junction. Daily arrivals of tender coconuts from coastal Gujarat and Southern farms. Clean, hygienic, and served fresh with compostable straws.',
        categories: [categoryMap['beverages-juices'], categoryMap['fresh-produce']],
        contactPublic: {
          phone: '+919876543204',
          whatsapp: '+919876543204'
        },
        address: {
          street: 'CG Road Corner Kiosk #8',
          area: 'Navrangpura',
          city: 'Ahmedabad',
          state: 'Gujarat',
          postalCode: '380009',
          landmark: 'Near Supermall Crossing'
        },
        location: {
          type: 'Point',
          coordinates: [72.5564, 23.0318]
        },
        approvalStatus: 'approved',
        availabilityStatus: 'open',
        openingHours: [
          { day: 'Mon', open: '08:00', close: '20:00', isClosed: false },
          { day: 'Tue', open: '08:00', close: '20:00', isClosed: false },
          { day: 'Wed', open: '08:00', close: '20:00', isClosed: false },
          { day: 'Thu', open: '08:00', close: '20:00', isClosed: false },
          { day: 'Fri', open: '08:00', close: '20:00', isClosed: false },
          { day: 'Sat', open: '08:00', close: '21:00', isClosed: false },
          { day: 'Sun', open: '08:00', close: '21:00', isClosed: false }
        ]
      },
      products: [
        {
          name: 'Sweet Tender Coconut (Single)',
          description: 'Naturally sweet electrolyte water with soft malai.',
          price: 55,
          isAvailable: true
        },
        {
          name: 'Cold Pressed Sugarcane Juice (with Ginger & Lemon)',
          description: 'Freshly squeezed without ice, sweetened with natural cane only.',
          price: 30,
          isAvailable: true
        }
      ]
    },
    {
      user: {
        name: 'Jethalal Lock & Key',
        email: 'jethalal.keys@example.com',
        phone: '+919876543205',
        passwordHash: hashedPassword,
        role: 'vendor',
        accountStatus: 'active'
      },
      profile: {
        stallName: 'Master Duplicate Key & Locksmith Stall',
        stallType: 'fixed',
        tagline: 'Computerized duplicate keys made in 3 minutes',
        description:
          'Expert local roadside locksmith servicing Ellisbridge for over 25 years. Duplicate keys for home locks, padlocks, scooters, and computerized car keys.',
        categories: [categoryMap['repair-services'], categoryMap['household-essentials']],
        contactPublic: {
          phone: '+919876543205'
        },
        address: {
          street: 'Nehru Bridge Approach Road Stall #1',
          area: 'Ellisbridge',
          city: 'Ahmedabad',
          state: 'Gujarat',
          postalCode: '380006',
          landmark: 'Under Town Hall Flyover'
        },
        location: {
          type: 'Point',
          coordinates: [72.5694, 23.0245]
        },
        approvalStatus: 'approved',
        availabilityStatus: 'away',
        openingHours: [
          { day: 'Mon', open: '09:00', close: '19:30', isClosed: false },
          { day: 'Tue', open: '09:00', close: '19:30', isClosed: false },
          { day: 'Wed', open: '09:00', close: '19:30', isClosed: false },
          { day: 'Thu', open: '09:00', close: '19:30', isClosed: false },
          { day: 'Fri', open: '09:00', close: '19:30', isClosed: false },
          { day: 'Sat', open: '09:00', close: '19:30', isClosed: false },
          { day: 'Sun', open: '09:00', close: '14:00', isClosed: false }
        ]
      },
      products: [
        {
          name: 'Standard Brass Key Duplication',
          description: 'Precision cut brass duplicate key for padlocks and house doors.',
          price: 50,
          isAvailable: true
        },
        {
          name: 'Dimple Computerized Security Key Cut',
          description: 'Laser guided dimple key cut for multi-bolt security locks.',
          price: 150,
          isAvailable: true
        }
      ]
    }
  ];

  for (const item of sampleData) {
    let user = await User.findOne({ email: item.user.email });
    if (!user) {
      user = await User.create(item.user);
    }

    let profile = await VendorProfile.findOne({ userId: user._id });
    if (!profile) {
      profile = await VendorProfile.create({
        ...item.profile,
        userId: user._id
      });
      console.log(`✓ Created vendor stall: ${profile.stallName}`);
    } else {
      console.log(`- Vendor stall exists: ${profile.stallName}`);
    }

    // Insert sample products
    for (const prod of item.products) {
      const existingProd = await Product.findOne({ vendorId: profile._id, name: prod.name });
      if (!existingProd) {
        await Product.create({
          ...prod,
          vendorId: profile._id,
          categoryId: profile.categories[0] || null
        });
      }
    }
  }

  console.log('✓ Successfully seeded sample approved vendors and catalogues!');
  process.exit(0);
};

seedSampleVendors().catch((err) => {
  console.error('Failed to seed sample vendors:', err);
  process.exit(1);
});
