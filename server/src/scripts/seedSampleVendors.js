import mongoose from 'mongoose';
import env from '../config/env.js';
import User from '../models/User.js';
import Category from '../models/Category.js';
import VendorProfile from '../models/VendorProfile.js';
import Product from '../models/Product.js';
import bcrypt from 'bcryptjs';

/**
 * Seed realistic approved vendors across Gujarat:
 * - Ahmedabad (Manek Chowk, Law Garden, Vastrapur, Navrangpura, CG Road, Ashram Road, Sindhu Bhavan, Ellisbridge)
 * - Surat (Piplod, Dumas, Chauta Bazar, Adajan, Rander, Varachha, Gopipura)
 * - Vadodara (Sayajigunj, Mandvi, Alkapuri, Fatehgunj, Raopura, Karelibaug)
 * - Rajkot (Yagnik Road, Dharmendra Road, Trikon Baug, Kalawad Road, Gundawadi)
 * - Gandhinagar (Sector 21, Sector 7, Infocity)
 * - Bhavnagar, Jamnagar, Junagadh, Anand, Bhuj
 */
const seedSampleVendors = async () => {
  console.log('--- Seeding Comprehensive Gujarat Vendor Stalls for Hezal Market ---');

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
    // ==========================================
    // AHMEDABAD STALLS (10 Stalls)
    // ==========================================
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
          'Operating in Law Garden since 2012. Known for hygienic mineral water preparations, crispy handmade puris, and 3 distinct spicy, sweet, and garlic waters.',
        categories: [categoryMap['street-food']],
        contactPublic: { phone: '+919876543201', whatsapp: '+919876543201' },
        address: {
          street: 'Law Garden Khau Gali Stall #4',
          area: 'Law Garden',
          city: 'Ahmedabad',
          state: 'Gujarat',
          postalCode: '380006',
          landmark: 'Opposite Law Garden Main Gate'
        },
        location: { type: 'Point', coordinates: [72.5598, 23.0232] },
        approvalStatus: 'approved',
        availabilityStatus: 'open',
        openingHours: [
          { day: 'Mon', open: '16:00', close: '23:30', isClosed: false },
          { day: 'Tue', open: '16:00', close: '23:30', isClosed: false },
          { day: 'Wed', open: '16:00', close: '23:30', isClosed: false },
          { day: 'Thu', open: '16:00', close: '23:30', isClosed: false },
          { day: 'Fri', open: '16:00', close: '23:30', isClosed: false },
          { day: 'Sat', open: '15:30', close: '23:30', isClosed: false },
          { day: 'Sun', open: '15:30', close: '23:30', isClosed: false }
        ]
      },
      products: [
        { name: 'Special Mineral Water Pani Puri (8 pcs)', description: 'Spicy mint, sweet tamarind, and garlic water.', price: 40, isAvailable: true },
        { name: 'Sev Puri (Special Butter Masala)', description: 'Crisp puris with potatoes, chutneys, and nylon sev.', price: 60, isAvailable: true },
        { name: 'Dahi Puri Royal', description: 'Sweetened curd, pomegranate, and chaat masala.', price: 70, isAvailable: true }
      ]
    },
    {
      user: {
        name: 'Babu Gwalior',
        email: 'babu.manekchowk@example.com',
        phone: '+919876543202',
        passwordHash: hashedPassword,
        role: 'vendor',
        accountStatus: 'active'
      },
      profile: {
        stallName: 'Manek Chowk Midnight Dosa & Sandwich',
        stallType: 'fixed',
        tagline: 'Iconic Butter Gwalior Dosa, Chocolate Cheese Sandwich & Kulfi',
        description:
          'The soul of Old Ahmedabad nighttime food. Legendary street stall serving golden crisp butter dosas, pineapple cheese sandwiches, and malai kulfi till 2 AM.',
        categories: [categoryMap['street-food']],
        contactPublic: { phone: '+919876543202', whatsapp: '+919876543202' },
        address: {
          street: 'Manek Chowk Jewelers Market Square',
          area: 'Manek Chowk',
          city: 'Ahmedabad',
          state: 'Gujarat',
          postalCode: '380001',
          landmark: 'Near Jama Masjid'
        },
        location: { type: 'Point', coordinates: [72.5873, 23.0245] },
        approvalStatus: 'approved',
        availabilityStatus: 'open',
        openingHours: [
          { day: 'Mon', open: '19:00', close: '02:00', isClosed: false },
          { day: 'Tue', open: '19:00', close: '02:00', isClosed: false },
          { day: 'Wed', open: '19:00', close: '02:00', isClosed: false },
          { day: 'Thu', open: '19:00', close: '02:00', isClosed: false },
          { day: 'Fri', open: '19:00', close: '02:30', isClosed: false },
          { day: 'Sat', open: '19:00', close: '02:30', isClosed: false },
          { day: 'Sun', open: '19:00', close: '02:30', isClosed: false }
        ]
      },
      products: [
        { name: 'Amul Butter Gwalior Dosa', description: 'Loaded with melted butter and spicy potato roast.', price: 120, isAvailable: true },
        { name: 'Cheese Chocolate Grilled Sandwich', description: 'Hershey chocolate spread with double mozzarella cheese.', price: 140, isAvailable: true },
        { name: 'Kesar Malai Matka Kulfi', description: 'Rich saffron condensed milk kulfi on stick.', price: 50, isAvailable: true }
      ]
    },
    {
      user: {
        name: 'Hansaben Vankar',
        email: 'hansa.chaniya@example.com',
        phone: '+919876543203',
        passwordHash: hashedPassword,
        role: 'vendor',
        accountStatus: 'active'
      },
      profile: {
        stallName: 'Law Garden Traditional Chaniya Choli & Handcrafts',
        stallType: 'fixed',
        tagline: 'Authentic Gujarati mirror-work ghagras, bandhani kurtas & torans',
        description:
          'Generations of artisan craftsmanship in Law Garden. Exquisite Navratri attire, embroidered cotton jackets, oxidized silver jewellery, and bohemian home decor.',
        categories: [categoryMap['clothing'], categoryMap['handcrafts']],
        contactPublic: { phone: '+919876543203', whatsapp: '+919876543203' },
        address: {
          street: 'Law Garden Handicrafts Lane Stall #18',
          area: 'Law Garden',
          city: 'Ahmedabad',
          state: 'Gujarat',
          postalCode: '380006',
          landmark: 'Opposite Netaji Subhash Chandra Bose Road'
        },
        location: { type: 'Point', coordinates: [72.5604, 23.024] },
        approvalStatus: 'approved',
        availabilityStatus: 'open',
        openingHours: [
          { day: 'Mon', open: '11:00', close: '22:00', isClosed: false },
          { day: 'Tue', open: '11:00', close: '22:00', isClosed: false },
          { day: 'Wed', open: '11:00', close: '22:00', isClosed: false },
          { day: 'Thu', open: '11:00', close: '22:00', isClosed: false },
          { day: 'Fri', open: '11:00', close: '22:30', isClosed: false },
          { day: 'Sat', open: '11:00', close: '22:30', isClosed: false },
          { day: 'Sun', open: '11:00', close: '22:30', isClosed: false }
        ]
      },
      products: [
        { name: 'Hand Embroidered Chaniya Choli Set', description: 'Kutchi mirror-work with gamthi border and bandhej dupatta.', price: 1800, isAvailable: true },
        { name: 'Kutchi Mirror Work Ethnic Jacket', description: 'Colorful thread embroidery jacket for festive wear.', price: 650, isAvailable: true }
      ]
    },
    {
      user: {
        name: 'Geeta Clay Crafts',
        email: 'geeta.clay@example.com',
        phone: '+919876543204',
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
        contactPublic: { phone: '+919876543204', whatsapp: '+919876543204' },
        address: {
          street: 'Vastrapur Lake Art Promenade Stall #12',
          area: 'Vastrapur',
          city: 'Ahmedabad',
          state: 'Gujarat',
          postalCode: '380015',
          landmark: 'Near Open Air Amphitheatre'
        },
        location: { type: 'Point', coordinates: [72.5255, 23.0366] },
        approvalStatus: 'approved',
        availabilityStatus: 'open',
        openingHours: [
          { day: 'Mon', open: '09:00', close: '21:00', isClosed: false },
          { day: 'Tue', open: '09:00', close: '21:00', isClosed: false },
          { day: 'Wed', open: '09:00', close: '21:00', isClosed: false },
          { day: 'Thu', open: '09:00', close: '21:00', isClosed: false },
          { day: 'Fri', open: '09:00', close: '21:30', isClosed: false },
          { day: 'Sat', open: '09:00', close: '21:30', isClosed: false },
          { day: 'Sun', open: '09:00', close: '21:30', isClosed: false }
        ]
      },
      products: [
        { name: 'Natural Clay Water Matka (10L)', description: 'Traditional porous cooling pot with clay tap.', price: 250, isAvailable: true },
        { name: 'Terracotta Handi Cookware with Lid', description: 'Unbleached natural clay cooking pot.', price: 350, isAvailable: true },
        { name: 'Hand-Painted Floral Diyas (Set of 6)', description: 'Decorative festival earthen lamps.', price: 120, isAvailable: true }
      ]
    },
    {
      user: {
        name: 'Kishanlal Saini',
        email: 'kishanlal.fruits@example.com',
        phone: '+919876543205',
        passwordHash: hashedPassword,
        role: 'vendor',
        accountStatus: 'active'
      },
      profile: {
        stallName: 'Kishanlal Seasonal Organic Fruits',
        stallType: 'mobile',
        tagline: 'Farm-fresh Nagpur Oranges, Kashmiri Apples & Seasonal Mangoes',
        description:
          'Daily morning pushcart offering fresh orchard fruits, natural handpicked pomegranates, bananas, and certified chemical-free seasonal arrivals.',
        categories: [categoryMap['fresh-produce']],
        contactPublic: { phone: '+919876543205', whatsapp: '+919876543205' },
        address: {
          street: 'University Road Pushcart Zone',
          area: 'Navrangpura',
          city: 'Ahmedabad',
          state: 'Gujarat',
          postalCode: '380009',
          landmark: 'Opposite Gujarat University Tower'
        },
        location: { type: 'Point', coordinates: [72.5489, 23.0375] },
        approvalStatus: 'approved',
        availabilityStatus: 'open',
        openingHours: [
          { day: 'Mon', open: '07:00', close: '20:00', isClosed: false },
          { day: 'Tue', open: '07:00', close: '20:00', isClosed: false },
          { day: 'Wed', open: '07:00', close: '20:00', isClosed: false },
          { day: 'Thu', open: '07:00', close: '20:00', isClosed: false },
          { day: 'Fri', open: '07:00', close: '20:00', isClosed: false },
          { day: 'Sat', open: '07:00', close: '20:00', isClosed: false },
          { day: 'Sun', open: '07:00', close: '20:00', isClosed: false }
        ]
      },
      products: [
        { name: 'Kashmiri Royal Delicious Apples (1 kg)', description: 'Sweet, crisp mountain apples.', price: 140, isAvailable: true },
        { name: 'Nagpur Sweet Oranges (1 Dozen)', description: 'Juicy, rich citrus oranges.', price: 90, isAvailable: true },
        { name: 'Fresh Anar / Pomegranates (1 kg)', description: 'Ruby-red sweet seeds.', price: 160, isAvailable: true }
      ]
    },
    {
      user: {
        name: 'Deepak Patel',
        email: 'deepak.coconuts@example.com',
        phone: '+919876543206',
        passwordHash: hashedPassword,
        role: 'vendor',
        accountStatus: 'active'
      },
      profile: {
        stallName: 'Green Oasis Tender Coconut Water',
        stallType: 'mobile',
        tagline: 'Chilled Malabar tender coconuts and freshly crushed sugarcane',
        description:
          'Pure, unadulterated hydration right on CG Road. Freshly cut Kerala tender coconuts full of sweet water and soft malai, alongside hygienic cold-pressed sugarcane juice.',
        categories: [categoryMap['beverages-juices']],
        contactPublic: { phone: '+919876543206', whatsapp: '+919876543206' },
        address: {
          street: 'C.G. Road Corner Kiosk',
          area: 'C.G. Road',
          city: 'Ahmedabad',
          state: 'Gujarat',
          postalCode: '380009',
          landmark: 'Near Municipal Market'
        },
        location: { type: 'Point', coordinates: [72.5583, 23.0285] },
        approvalStatus: 'approved',
        availabilityStatus: 'open',
        openingHours: [
          { day: 'Mon', open: '08:00', close: '22:00', isClosed: false },
          { day: 'Tue', open: '08:00', close: '22:00', isClosed: false },
          { day: 'Wed', open: '08:00', close: '22:00', isClosed: false },
          { day: 'Thu', open: '08:00', close: '22:00', isClosed: false },
          { day: 'Fri', open: '08:00', close: '22:00', isClosed: false },
          { day: 'Sat', open: '08:00', close: '22:00', isClosed: false },
          { day: 'Sun', open: '08:00', close: '22:00', isClosed: false }
        ]
      },
      products: [
        { name: 'Large Tender Coconut Water (Fresh Cut)', description: 'Electrolyte-rich water with soft tender coconut malai.', price: 60, isAvailable: true },
        { name: 'Cold-Pressed Sugarcane Juice with Ginger & Mint', description: 'Freshly extracted with zero added ice or sugar.', price: 30, isAvailable: true }
      ]
    },
    {
      user: {
        name: 'Jethalal Locksmith',
        email: 'jethalal.keys@example.com',
        phone: '+919876543207',
        passwordHash: hashedPassword,
        role: 'vendor',
        accountStatus: 'active'
      },
      profile: {
        stallName: 'Master Duplicate Key & Locksmith Stall',
        stallType: 'fixed',
        tagline: 'Instant computerized key duplication and lock repairs in 3 minutes',
        description:
          'Experienced roadside locksmith stall on Nehru Bridge corner. We duplicate motorcycle, car, Godrej, computerised dimple keys, and repair jammed locks on the spot.',
        categories: [categoryMap['repair-services']],
        contactPublic: { phone: '+919876543207', whatsapp: '+919876543207' },
        address: {
          street: 'Nehru Bridge East End Kiosk',
          area: 'Ellisbridge',
          city: 'Ahmedabad',
          state: 'Gujarat',
          postalCode: '380006',
          landmark: 'Beside Town Hall Bus Stop'
        },
        location: { type: 'Point', coordinates: [72.5715, 23.0268] },
        approvalStatus: 'approved',
        availabilityStatus: 'open',
        openingHours: [
          { day: 'Mon', open: '10:00', close: '20:30', isClosed: false },
          { day: 'Tue', open: '10:00', close: '20:30', isClosed: false },
          { day: 'Wed', open: '10:00', close: '20:30', isClosed: false },
          { day: 'Thu', open: '10:00', close: '20:30', isClosed: false },
          { day: 'Fri', open: '10:00', close: '20:30', isClosed: false },
          { day: 'Sat', open: '10:00', close: '20:30', isClosed: false },
          { day: 'Sun', open: '10:00', close: '16:00', isClosed: false }
        ]
      },
      products: [
        { name: 'Standard Brass Key Duplication', description: 'Instant cutting for Godrej and household door locks.', price: 50, isAvailable: true },
        { name: 'Computerized Dimple / Laser Key Copy', description: 'High-security dimple keys for main gates.', price: 150, isAvailable: true }
      ]
    },
    {
      user: {
        name: 'Ramkishan Mali',
        email: 'ramkishan.flowers@example.com',
        phone: '+919876543208',
        passwordHash: hashedPassword,
        role: 'vendor',
        accountStatus: 'active'
      },
      profile: {
        stallName: 'Shree Ram Florist & Pooja Essentials',
        stallType: 'fixed',
        tagline: 'Fresh marigold garlands, lotus, tulsi plants and daily pooja flowers',
        description:
          'Daily morning flower stall outside Ashram Road temple. Supplying freshly hand-strung marigold garlands, fragrant roses, bilva patra, and sacred pooja samagri.',
        categories: [categoryMap['flowers-plants']],
        contactPublic: { phone: '+919876543208', whatsapp: '+919876543208' },
        address: {
          street: 'Ashram Road Temple Lane',
          area: 'Ashram Road',
          city: 'Ahmedabad',
          state: 'Gujarat',
          postalCode: '380009',
          landmark: 'Near Gandhi Ashram Junction'
        },
        location: { type: 'Point', coordinates: [72.5724, 23.0401] },
        approvalStatus: 'approved',
        availabilityStatus: 'open',
        openingHours: [
          { day: 'Mon', open: '05:30', close: '20:00', isClosed: false },
          { day: 'Tue', open: '05:30', close: '20:00', isClosed: false },
          { day: 'Wed', open: '05:30', close: '20:00', isClosed: false },
          { day: 'Thu', open: '05:30', close: '20:00', isClosed: false },
          { day: 'Fri', open: '05:30', close: '20:00', isClosed: false },
          { day: 'Sat', open: '05:30', close: '21:00', isClosed: false },
          { day: 'Sun', open: '05:30', close: '21:00', isClosed: false }
        ]
      },
      products: [
        { name: 'Fresh Yellow Marigold Garland (Medium)', description: 'Handmade fresh daily temple garland.', price: 40, isAvailable: true },
        { name: 'Pooja Rose Flowers & Tulsi Basket', description: 'Assortment of red roses and fragrant tulsi leaves.', price: 50, isAvailable: true }
      ]
    },
    {
      user: {
        name: 'Mustafa Tailor',
        email: 'mustafa.tailor@example.com',
        phone: '+919876543209',
        passwordHash: hashedPassword,
        role: 'vendor',
        accountStatus: 'active'
      },
      profile: {
        stallName: 'Old City Tailoring & Fast Alteration Stall',
        stallType: 'fixed',
        tagline: 'Instant pant shortening, suit alterations, and button fixing in 15 mins',
        description:
          'Expert sewing and garment alteration service right on Relief Road. We handle jeans tapering, zip replacement, curtain hemming, and formal fitting quickly.',
        categories: [categoryMap['repair-services']],
        contactPublic: { phone: '+919876543209', whatsapp: '+919876543209' },
        address: {
          street: 'Relief Road Market Arcade',
          area: 'Ellisbridge',
          city: 'Ahmedabad',
          state: 'Gujarat',
          postalCode: '380001',
          landmark: 'Opposite Electricity House'
        },
        location: { type: 'Point', coordinates: [72.5833, 23.0315] },
        approvalStatus: 'approved',
        availabilityStatus: 'open',
        openingHours: [
          { day: 'Mon', open: '10:00', close: '21:00', isClosed: false },
          { day: 'Tue', open: '10:00', close: '21:00', isClosed: false },
          { day: 'Wed', open: '10:00', close: '21:00', isClosed: false },
          { day: 'Thu', open: '10:00', close: '21:00', isClosed: false },
          { day: 'Fri', open: '10:00', close: '21:00', isClosed: false },
          { day: 'Sat', open: '10:00', close: '21:00', isClosed: false },
          { day: 'Sun', open: '11:00', close: '18:00', isClosed: false }
        ]
      },
      products: [
        { name: 'Trouser / Jeans Length Shortening', description: 'Professional chain stitch alteration in 15 mins.', price: 60, isAvailable: true },
        { name: 'Heavy Duty Zip Replacement', description: 'Brass YKK zip replacement for pants or jackets.', price: 100, isAvailable: true }
      ]
    },
    {
      user: {
        name: 'Hiren Sharma',
        email: 'hiren.chai@example.com',
        phone: '+919876543210',
        passwordHash: hashedPassword,
        role: 'vendor',
        accountStatus: 'active'
      },
      profile: {
        stallName: 'Sindhu Bhavan Chai Adda & Bun Maska',
        stallType: 'fixed',
        tagline: 'Special Kadak Ginger Chai, Maska Bun, and Hot Onion Samosas',
        description:
          'Vibrant street corner adda on Bodakdev Sindhu Bhavan Road. Serving cardamom and ginger tea in traditional earthenware kulhads, buttery maska buns, and warm snacks.',
        categories: [categoryMap['beverages-juices'], categoryMap['street-food']],
        contactPublic: { phone: '+919876543210', whatsapp: '+919876543210' },
        address: {
          street: 'Sindhu Bhavan Road Promenade',
          area: 'Sindhu Bhavan Road',
          city: 'Ahmedabad',
          state: 'Gujarat',
          postalCode: '380054',
          landmark: 'Near Pakwan Crossroads'
        },
        location: { type: 'Point', coordinates: [72.4985, 23.0416] },
        approvalStatus: 'approved',
        availabilityStatus: 'open',
        openingHours: [
          { day: 'Mon', open: '06:30', close: '23:30', isClosed: false },
          { day: 'Tue', open: '06:30', close: '23:30', isClosed: false },
          { day: 'Wed', open: '06:30', close: '23:30', isClosed: false },
          { day: 'Thu', open: '06:30', close: '23:30', isClosed: false },
          { day: 'Fri', open: '06:30', close: '23:30', isClosed: false },
          { day: 'Sat', open: '06:30', close: '23:30', isClosed: false },
          { day: 'Sun', open: '06:30', close: '23:30', isClosed: false }
        ]
      },
      products: [
        { name: 'Adrak Elaichi Kulhad Chai', description: 'Brewed with fresh organic ginger and whole green cardamom.', price: 25, isAvailable: true },
        { name: 'Amul Butter Bun Maska', description: 'Fresh toasted soft bun loaded with real Amul butter.', price: 40, isAvailable: true }
      ]
    },

    // ==========================================
    // SURAT STALLS (8 Stalls)
    // ==========================================
    {
      user: {
        name: 'Gordhan Jani',
        email: 'jani.locho@example.com',
        phone: '+919876543211',
        passwordHash: hashedPassword,
        role: 'vendor',
        accountStatus: 'active'
      },
      profile: {
        stallName: 'Jani Surti Butter Locho & Khaman',
        stallType: 'fixed',
        tagline: 'World-famous authentic Surti Locho, Sev Khamani & Green Chutney',
        description:
          'The crowning glory of Surat street food. Steaming hot chana dal locho drizzled with pure Amul butter, special locho masala, spicy green chutney, and fine nylon sev.',
        categories: [categoryMap['street-food']],
        contactPublic: { phone: '+919876543211', whatsapp: '+919876543211' },
        address: {
          street: 'Piplod Main Road Stall #8',
          area: 'Piplod',
          city: 'Surat',
          state: 'Gujarat',
          postalCode: '395007',
          landmark: 'Opposite Kargil Chowk'
        },
        location: { type: 'Point', coordinates: [72.7667, 21.155] },
        approvalStatus: 'approved',
        availabilityStatus: 'open',
        openingHours: [
          { day: 'Mon', open: '07:30', close: '21:30', isClosed: false },
          { day: 'Tue', open: '07:30', close: '21:30', isClosed: false },
          { day: 'Wed', open: '07:30', close: '21:30', isClosed: false },
          { day: 'Thu', open: '07:30', close: '21:30', isClosed: false },
          { day: 'Fri', open: '07:30', close: '22:00', isClosed: false },
          { day: 'Sat', open: '07:00', close: '22:00', isClosed: false },
          { day: 'Sun', open: '07:00', close: '22:00', isClosed: false }
        ]
      },
      products: [
        { name: 'Special Amul Butter Surti Locho', description: 'Steaming hot savory gram flour snack with fresh butter and sev.', price: 60, isAvailable: true },
        { name: 'Cheese Burst Masala Locho', description: 'Topped with generous grated cheese, locho masala, and chillies.', price: 90, isAvailable: true },
        { name: 'Spicy Surti Sev Khamani (250g)', description: 'Crushed steamed chana dal tempered with mustard and pomegranate.', price: 70, isAvailable: true }
      ]
    },
    {
      user: {
        name: 'Ranchhod Bhutta',
        email: 'ranchhod.corn@example.com',
        phone: '+919876543212',
        passwordHash: hashedPassword,
        role: 'vendor',
        accountStatus: 'active'
      },
      profile: {
        stallName: 'Dumas Beach Sweet Corn & Roasted Bhutta',
        stallType: 'mobile',
        tagline: 'Charcoal roasted spicy lemon bhutta and crispy sweet corn pakodas',
        description:
          'A trip to Dumas Beach is incomplete without our famous coal-roasted corn on the cob rubbed with fresh lime, black salt, and chili powder.',
        categories: [categoryMap['street-food']],
        contactPublic: { phone: '+919876543212', whatsapp: '+919876543212' },
        address: {
          street: 'Dumas Beach Promenade',
          area: 'Dumas Road',
          city: 'Surat',
          state: 'Gujarat',
          postalCode: '395007',
          landmark: 'Near Dumas Beach Viewpoint'
        },
        location: { type: 'Point', coordinates: [72.7118, 21.0833] },
        approvalStatus: 'approved',
        availabilityStatus: 'open',
        openingHours: [
          { day: 'Mon', open: '14:00', close: '22:00', isClosed: false },
          { day: 'Tue', open: '14:00', close: '22:00', isClosed: false },
          { day: 'Wed', open: '14:00', close: '22:00', isClosed: false },
          { day: 'Thu', open: '14:00', close: '22:00', isClosed: false },
          { day: 'Fri', open: '14:00', close: '22:30', isClosed: false },
          { day: 'Sat', open: '12:00', close: '23:00', isClosed: false },
          { day: 'Sun', open: '12:00', close: '23:00', isClosed: false }
        ]
      },
      products: [
        { name: 'Charcoal Roasted Masala Lemon Bhutta', description: 'Tender sweet corn roasted on live coals with spices and lime.', price: 40, isAvailable: true },
        { name: 'Hot Sweet Corn Bhajia (Plate)', description: 'Crispy sweet corn fritters served with tangy garlic chutney.', price: 70, isAvailable: true }
      ]
    },
    {
      user: {
        name: 'Parvati Bandhani',
        email: 'parvati.bandhani@example.com',
        phone: '+919876543213',
        passwordHash: hashedPassword,
        role: 'vendor',
        accountStatus: 'active'
      },
      profile: {
        stallName: 'Chauta Bazar Bandhani & Dupatta Bazaar',
        stallType: 'fixed',
        tagline: 'Authentic Surti tie-and-dye bandhani dupattas, sarees and dress materials',
        description:
          'Surat oldest textile market stall. Offering direct weavers bandhani, leheriya dupattas, cotton block prints, and festival dress fabrics at wholesale street rates.',
        categories: [categoryMap['clothing']],
        contactPublic: { phone: '+919876543213', whatsapp: '+919876543213' },
        address: {
          street: 'Chauta Bazar Cloth Lane Stall #24',
          area: 'Chauta Bazar',
          city: 'Surat',
          state: 'Gujarat',
          postalCode: '395003',
          landmark: 'Opposite Jain Derasar'
        },
        location: { type: 'Point', coordinates: [72.8225, 21.1983] },
        approvalStatus: 'approved',
        availabilityStatus: 'open',
        openingHours: [
          { day: 'Mon', open: '10:30', close: '21:00', isClosed: false },
          { day: 'Tue', open: '10:30', close: '21:00', isClosed: false },
          { day: 'Wed', open: '10:30', close: '21:00', isClosed: false },
          { day: 'Thu', open: '10:30', close: '21:00', isClosed: false },
          { day: 'Fri', open: '10:30', close: '21:00', isClosed: false },
          { day: 'Sat', open: '10:30', close: '21:30', isClosed: false },
          { day: 'Sun', open: '11:00', close: '19:00', isClosed: false }
        ]
      },
      products: [
        { name: 'Pure Cotton Bandhani Dupatta', description: 'Traditional multi-color dot tie-dye with golden zari border.', price: 350, isAvailable: true },
        { name: 'Jaipuri Leheriya Cotton Kurti Fabric', description: 'Breathable summer cotton fabric (2.5 meters).', price: 450, isAvailable: true }
      ]
    },
    {
      user: {
        name: 'Haji Randeri',
        email: 'haji.randeri@example.com',
        phone: '+919876543214',
        passwordHash: hashedPassword,
        role: 'vendor',
        accountStatus: 'active'
      },
      profile: {
        stallName: 'Rander Al-Burhan Street Biryani & Tawa Kebab',
        stallType: 'fixed',
        tagline: 'Traditional wood-cooked Randeri spiced dum biryani and seekh kebabs',
        description:
          'Centuries-old Rander recipe cooked in giant copper cauldrons over firewood. Aromatic basmati rice, tender meat, fried onions, and fresh mint raita.',
        categories: [categoryMap['street-food']],
        contactPublic: { phone: '+919876543214', whatsapp: '+919876543214' },
        address: {
          street: 'Rander Main Bazar Street Corner',
          area: 'Rander',
          city: 'Surat',
          state: 'Gujarat',
          postalCode: '395005',
          landmark: 'Near Rander Old Bridge'
        },
        location: { type: 'Point', coordinates: [72.7989, 21.2189] },
        approvalStatus: 'approved',
        availabilityStatus: 'open',
        openingHours: [
          { day: 'Mon', open: '17:00', close: '23:30', isClosed: false },
          { day: 'Tue', open: '17:00', close: '23:30', isClosed: false },
          { day: 'Wed', open: '17:00', close: '23:30', isClosed: false },
          { day: 'Thu', open: '17:00', close: '23:30', isClosed: false },
          { day: 'Fri', open: '17:00', close: '23:30', isClosed: false },
          { day: 'Sat', open: '17:00', close: '23:30', isClosed: false },
          { day: 'Sun', open: '17:00', close: '23:30', isClosed: false }
        ]
      },
      products: [
        { name: 'Rander Special Dum Biryani', description: 'Flavored with whole spices, saffron, and tender chicken.', price: 160, isAvailable: true },
        { name: 'Tawa Seekh Kebab (4 pcs)', description: 'Juicy spiced minced kebabs served with onion rings and lemon.', price: 120, isAvailable: true }
      ]
    },
    {
      user: {
        name: 'Chimanlal Mithaiwala',
        email: 'chiman.ghari@example.com',
        phone: '+919876543215',
        passwordHash: hashedPassword,
        role: 'vendor',
        accountStatus: 'active'
      },
      profile: {
        stallName: 'Adajan Royal Ghari & Traditional Farsan',
        stallType: 'fixed',
        tagline: 'Authentic pure ghee Surti Mawa Ghari, Fafda, and Masala Sing',
        description:
          'Chandi Padvo celebration favorite year-round. Pure mawa ghari drenched in pure desi ghee with pistachios and almonds, plus freshly fried crunchy fafda.',
        categories: [categoryMap['street-food']],
        contactPublic: { phone: '+919876543215', whatsapp: '+919876543215' },
        address: {
          street: 'Adajan Gam Road Stall #14',
          area: 'Adajan',
          city: 'Surat',
          state: 'Gujarat',
          postalCode: '395009',
          landmark: 'Near Adajan Bus Depo'
        },
        location: { type: 'Point', coordinates: [72.7915, 21.1945] },
        approvalStatus: 'approved',
        availabilityStatus: 'open',
        openingHours: [
          { day: 'Mon', open: '08:00', close: '22:00', isClosed: false },
          { day: 'Tue', open: '08:00', close: '22:00', isClosed: false },
          { day: 'Wed', open: '08:00', close: '22:00', isClosed: false },
          { day: 'Thu', open: '08:00', close: '22:00', isClosed: false },
          { day: 'Fri', open: '08:00', close: '22:00', isClosed: false },
          { day: 'Sat', open: '08:00', close: '22:00', isClosed: false },
          { day: 'Sun', open: '08:00', close: '22:00', isClosed: false }
        ]
      },
      products: [
        { name: 'Surti Kesar Pista Ghari (250g)', description: 'Condensed milk mawa sweet bathed in pure cow ghee.', price: 220, isAvailable: true },
        { name: 'Crispy Hot Fafda (250g)', description: 'Gram flour crisps served with papaya sambharo and fried chillies.', price: 110, isAvailable: true }
      ]
    },
    {
      user: {
        name: 'Bharat Shakes',
        email: 'bharat.shakes@example.com',
        phone: '+919876543216',
        passwordHash: hashedPassword,
        role: 'vendor',
        accountStatus: 'active'
      },
      profile: {
        stallName: 'Varachha Diamond Circle Fresh Juice & Shakes',
        stallType: 'fixed',
        tagline: 'Fresh Alphonso mango shakes, dry fruit falooda and cold juices',
        description:
          'Bustling evening refreshment stall in the heart of Varachha diamond district. Thick fruit shakes with ice cream scoops and rich vermicelli falooda.',
        categories: [categoryMap['beverages-juices']],
        contactPublic: { phone: '+919876543216', whatsapp: '+919876543216' },
        address: {
          street: 'Varachha Main Road Circle Kiosk',
          area: 'Varachha',
          city: 'Surat',
          state: 'Gujarat',
          postalCode: '395006',
          landmark: 'Near Mini Bazar Crossroads'
        },
        location: { type: 'Point', coordinates: [72.8552, 21.2168] },
        approvalStatus: 'approved',
        availabilityStatus: 'open',
        openingHours: [
          { day: 'Mon', open: '10:00', close: '23:30', isClosed: false },
          { day: 'Tue', open: '10:00', close: '23:30', isClosed: false },
          { day: 'Wed', open: '10:00', close: '23:30', isClosed: false },
          { day: 'Thu', open: '10:00', close: '23:30', isClosed: false },
          { day: 'Fri', open: '10:00', close: '23:30', isClosed: false },
          { day: 'Sat', open: '10:00', close: '23:30', isClosed: false },
          { day: 'Sun', open: '10:00', close: '23:30', isClosed: false }
        ]
      },
      products: [
        { name: 'Royal Kesar Pista Falooda', description: 'Rose syrup, basil seeds, vermicelli, and vanilla ice cream.', price: 90, isAvailable: true },
        { name: 'Thick Alphonso Mango Milkshake', description: 'Fresh Ratnagiri mango pulp with rich full-cream milk.', price: 80, isAvailable: true }
      ]
    },
    {
      user: {
        name: 'Magan Mojdiwala',
        email: 'magan.mojdi@example.com',
        phone: '+919876543217',
        passwordHash: hashedPassword,
        role: 'vendor',
        accountStatus: 'active'
      },
      profile: {
        stallName: 'Gopipura Handmade Mojdi & Leather Chappals',
        stallType: 'fixed',
        tagline: 'Hand-stitched leather mojdis, wedding juttis & comfortable sandals',
        description:
          'Generations-old cobbler family hand-crafting durable leather mojdis with intricate thread patterns and soft cushioned soles for wedding and daily wear.',
        categories: [categoryMap['clothing'], categoryMap['handcrafts']],
        contactPublic: { phone: '+919876543217', whatsapp: '+919876543217' },
        address: {
          street: 'Gopipura Footwear Market Lane',
          area: 'Gopipura',
          city: 'Surat',
          state: 'Gujarat',
          postalCode: '395001',
          landmark: 'Near Subhash Garden'
        },
        location: { type: 'Point', coordinates: [72.8189, 21.1912] },
        approvalStatus: 'approved',
        availabilityStatus: 'open',
        openingHours: [
          { day: 'Mon', open: '10:00', close: '21:00', isClosed: false },
          { day: 'Tue', open: '10:00', close: '21:00', isClosed: false },
          { day: 'Wed', open: '10:00', close: '21:00', isClosed: false },
          { day: 'Thu', open: '10:00', close: '21:00', isClosed: false },
          { day: 'Fri', open: '10:00', close: '21:00', isClosed: false },
          { day: 'Sat', open: '10:00', close: '21:00', isClosed: false },
          { day: 'Sun', open: '10:00', close: '16:00', isClosed: false }
        ]
      },
      products: [
        { name: 'Traditional Embroidered Wedding Mojdi', description: 'Fine golden embroidery on premium buffalo leather.', price: 650, isAvailable: true },
        { name: 'Genuine Kolhapuri Leather Chappals', description: 'Hand-braided straps with durable leather sole.', price: 500, isAvailable: true }
      ]
    },
    {
      user: {
        name: 'Kantaben Steel',
        email: 'kantaben.steel@example.com',
        phone: '+919876543218',
        passwordHash: hashedPassword,
        role: 'vendor',
        accountStatus: 'active'
      },
      profile: {
        stallName: 'Ring Road Wholesale Household Goods & Plastics',
        stallType: 'fixed',
        tagline: 'Stainless steel dabbas, storage boxes, and kitchenware essentials',
        description:
          'Budget-friendly household stall on Ring Road. Stainless steel masala boxes, insulated water bottles, storage containers, and kitchen utilities.',
        categories: [categoryMap['household-essentials']],
        contactPublic: { phone: '+919876543218', whatsapp: '+919876543218' },
        address: {
          street: 'Ring Road Flyover Market',
          area: 'Ring Road',
          city: 'Surat',
          state: 'Gujarat',
          postalCode: '395002',
          landmark: 'Below Ring Road Flyover'
        },
        location: { type: 'Point', coordinates: [72.8402, 21.1895] },
        approvalStatus: 'approved',
        availabilityStatus: 'open',
        openingHours: [
          { day: 'Mon', open: '10:30', close: '20:30', isClosed: false },
          { day: 'Tue', open: '10:30', close: '20:30', isClosed: false },
          { day: 'Wed', open: '10:30', close: '20:30', isClosed: false },
          { day: 'Thu', open: '10:30', close: '20:30', isClosed: false },
          { day: 'Fri', open: '10:30', close: '20:30', isClosed: false },
          { day: 'Sat', open: '10:30', close: '21:00', isClosed: false },
          { day: 'Sun', open: '11:00', close: '17:00', isClosed: false }
        ]
      },
      products: [
        { name: '7-Compartment Stainless Steel Masala Dabba', description: 'Airtight spice container with transparent lid and spoons.', price: 280, isAvailable: true },
        { name: 'Insulated Hot Pot Food Casserole (1.5L)', description: 'Stainless steel interior keeps rotis piping hot for 6 hours.', price: 340, isAvailable: true }
      ]
    },

    // ==========================================
    // VADODARA / BARODA STALLS (6 Stalls)
    // ==========================================
    {
      user: {
        name: 'Mahakali Sev Usal',
        email: 'mahakali.sevusal@example.com',
        phone: '+919876543219',
        passwordHash: hashedPassword,
        role: 'vendor',
        accountStatus: 'active'
      },
      profile: {
        stallName: 'Mahakali Special Sev Usal',
        stallType: 'fixed',
        tagline: 'Iconic Baroda Tari Sev Usal, buttery bun pav, and extra spicy oil',
        description:
          'Vadodara signature street food legacy since decades. Dried green peas cooked in fiery gravy, loaded with spicy nylon sev, spring onions, and butter pav.',
        categories: [categoryMap['street-food']],
        contactPublic: { phone: '+919876543219', whatsapp: '+919876543219' },
        address: {
          street: 'Sayajigunj Food Street Stall #3',
          area: 'Sayajigunj',
          city: 'Vadodara',
          state: 'Gujarat',
          postalCode: '390005',
          landmark: 'Opposite Vadodara Central Railway Station'
        },
        location: { type: 'Point', coordinates: [73.1812, 22.311] },
        approvalStatus: 'approved',
        availabilityStatus: 'open',
        openingHours: [
          { day: 'Mon', open: '08:00', close: '21:30', isClosed: false },
          { day: 'Tue', open: '08:00', close: '21:30', isClosed: false },
          { day: 'Wed', open: '08:00', close: '21:30', isClosed: false },
          { day: 'Thu', open: '08:00', close: '21:30', isClosed: false },
          { day: 'Fri', open: '08:00', close: '22:00', isClosed: false },
          { day: 'Sat', open: '08:00', close: '22:00', isClosed: false },
          { day: 'Sun', open: '08:00', close: '22:00', isClosed: false }
        ]
      },
      products: [
        { name: 'Special Mahakali Sev Usal with Bun Pav', description: 'Fiery pea curry with crispy sev, spring onion, and lime.', price: 70, isAvailable: true },
        { name: 'Cheese Burst Sev Usal', description: 'Topped with double shredded mozzarella and extra tari.', price: 100, isAvailable: true }
      ]
    },
    {
      user: {
        name: 'Rekhaben Mandvi',
        email: 'rekha.mandvi@example.com',
        phone: '+919876543220',
        passwordHash: hashedPassword,
        role: 'vendor',
        accountStatus: 'active'
      },
      profile: {
        stallName: 'Mandvi Gate Chaniya Choli & Traditional Attire',
        stallType: 'fixed',
        tagline: 'Festive Navratri ghagras, bandhej dupattas & oxidized silver jewelry',
        description:
          'Historical heritage market stall under the arches of Mandvi Gate. Famous for vibrant handcrafted chaniya choli with real mirror work and festive accessories.',
        categories: [categoryMap['clothing'], categoryMap['handcrafts']],
        contactPublic: { phone: '+919876543220', whatsapp: '+919876543220' },
        address: {
          street: 'Mandvi Gate Archway Bazar',
          area: 'Mandvi',
          city: 'Vadodara',
          state: 'Gujarat',
          postalCode: '390001',
          landmark: 'Under Mandvi Clock Tower'
        },
        location: { type: 'Point', coordinates: [73.2045, 22.2989] },
        approvalStatus: 'approved',
        availabilityStatus: 'open',
        openingHours: [
          { day: 'Mon', open: '10:00', close: '21:30', isClosed: false },
          { day: 'Tue', open: '10:00', close: '21:30', isClosed: false },
          { day: 'Wed', open: '10:00', close: '21:30', isClosed: false },
          { day: 'Thu', open: '10:00', close: '21:30', isClosed: false },
          { day: 'Fri', open: '10:00', close: '21:30', isClosed: false },
          { day: 'Sat', open: '10:00', close: '22:00', isClosed: false },
          { day: 'Sun', open: '10:00', close: '22:00', isClosed: false }
        ]
      },
      products: [
        { name: 'Flared Kutchi Embroidered Ghagra Set', description: 'Full circle flare with mirror work and contrast blouse.', price: 1650, isAvailable: true },
        { name: 'Oxidized Silver Choker Necklace & Jhumkas', description: 'Traditional tribal metal festive set.', price: 350, isAvailable: true }
      ]
    },
    {
      user: {
        name: 'Vikas Chaiwala',
        email: 'vikas.chai@example.com',
        phone: '+919876543221',
        passwordHash: hashedPassword,
        role: 'vendor',
        accountStatus: 'active'
      },
      profile: {
        stallName: 'Fatehgunj University Chai & Bun Omelette Stall',
        stallType: 'fixed',
        tagline: 'Student hangout for strong ginger masala chai and hot bun maska',
        description:
          'Beloved spot outside MS University campus. Piping hot ginger-infused tea served in earthen kulhads, buttery maska buns, and warm samosas.',
        categories: [categoryMap['beverages-juices'], categoryMap['street-food']],
        contactPublic: { phone: '+919876543221', whatsapp: '+919876543221' },
        address: {
          street: 'Fatehgunj University Road Kiosk',
          area: 'Fatehgunj',
          city: 'Vadodara',
          state: 'Gujarat',
          postalCode: '390002',
          landmark: 'Near MS University Pavilion'
        },
        location: { type: 'Point', coordinates: [73.1895, 22.3212] },
        approvalStatus: 'approved',
        availabilityStatus: 'open',
        openingHours: [
          { day: 'Mon', open: '06:00', close: '23:00', isClosed: false },
          { day: 'Tue', open: '06:00', close: '23:00', isClosed: false },
          { day: 'Wed', open: '06:00', close: '23:00', isClosed: false },
          { day: 'Thu', open: '06:00', close: '23:00', isClosed: false },
          { day: 'Fri', open: '06:00', close: '23:00', isClosed: false },
          { day: 'Sat', open: '06:00', close: '23:00', isClosed: false },
          { day: 'Sun', open: '06:00', close: '23:00', isClosed: false }
        ]
      },
      products: [
        { name: 'Desi Masala Chai in Kulhad', description: 'Fresh ginger, clove, and cardamom black tea with milk.', price: 20, isAvailable: true },
        { name: 'Toasted Bun Maska with Jam', description: 'Freshly baked soft bun toasted with salted butter.', price: 35, isAvailable: true }
      ]
    },
    {
      user: {
        name: 'Sunil Fruitwala',
        email: 'sunil.alkapuri@example.com',
        phone: '+919876543222',
        passwordHash: hashedPassword,
        role: 'vendor',
        accountStatus: 'active'
      },
      profile: {
        stallName: 'Alkapuri Seasonal Fresh Juice & Fruit Bowl',
        stallType: 'fixed',
        tagline: 'Cold-pressed pomegranate, kiwi-strawberry bowls & seasonal juices',
        description:
          'High quality health stall in posh Alkapuri area. Freshly cut fruit salads, exotic dragon fruit bowls, and pure cold pressed fruit juices with zero preservatives.',
        categories: [categoryMap['fresh-produce'], categoryMap['beverages-juices']],
        contactPublic: { phone: '+919876543222', whatsapp: '+919876543222' },
        address: {
          street: 'Alkapuri RC Dutt Road Kiosk',
          area: 'Alkapuri',
          city: 'Vadodara',
          state: 'Gujarat',
          postalCode: '390007',
          landmark: 'Near Alkapuri Club'
        },
        location: { type: 'Point', coordinates: [73.1705, 22.3105] },
        approvalStatus: 'approved',
        availabilityStatus: 'open',
        openingHours: [
          { day: 'Mon', open: '07:30', close: '22:00', isClosed: false },
          { day: 'Tue', open: '07:30', close: '22:00', isClosed: false },
          { day: 'Wed', open: '07:30', close: '22:00', isClosed: false },
          { day: 'Thu', open: '07:30', close: '22:00', isClosed: false },
          { day: 'Fri', open: '07:30', close: '22:00', isClosed: false },
          { day: 'Sat', open: '07:30', close: '22:00', isClosed: false },
          { day: 'Sun', open: '07:30', close: '22:00', isClosed: false }
        ]
      },
      products: [
        { name: 'Fresh Exotic Fruit Salad Bowl', description: 'Pineapple, kiwi, pomegranate, and seasonal berries.', price: 100, isAvailable: true },
        { name: 'Cold-Pressed Pomegranate Juice', description: '100% natural, freshly extracted without water or sugar.', price: 90, isAvailable: true }
      ]
    },
    {
      user: {
        name: 'Pyarelal Farsan',
        email: 'pyarelal.farsan@example.com',
        phone: '+919876543223',
        passwordHash: hashedPassword,
        role: 'vendor',
        accountStatus: 'active'
      },
      profile: {
        stallName: 'Raopura Pyarelal Farsan & Bhakharwadi',
        stallType: 'fixed',
        tagline: 'Crispy mini bhakharwadi, spicy dry kachori, and ratlami sev',
        description:
          'Famous historical farsan makers in old Raopura. World renowned mini bhakharwadis spiral stuffed with sweet-spicy coconut and sesame filling.',
        categories: [categoryMap['street-food']],
        contactPublic: { phone: '+919876543223', whatsapp: '+919876543223' },
        address: {
          street: 'Raopura Main Road Stall #16',
          area: 'Raopura',
          city: 'Vadodara',
          state: 'Gujarat',
          postalCode: '390001',
          landmark: 'Near Tower Clock'
        },
        location: { type: 'Point', coordinates: [73.2001, 22.3045] },
        approvalStatus: 'approved',
        availabilityStatus: 'open',
        openingHours: [
          { day: 'Mon', open: '08:30', close: '21:00', isClosed: false },
          { day: 'Tue', open: '08:30', close: '21:00', isClosed: false },
          { day: 'Wed', open: '08:30', close: '21:00', isClosed: false },
          { day: 'Thu', open: '08:30', close: '21:00', isClosed: false },
          { day: 'Fri', open: '08:30', close: '21:00', isClosed: false },
          { day: 'Sat', open: '08:30', close: '21:00', isClosed: false },
          { day: 'Sun', open: '08:30', close: '21:00', isClosed: false }
        ]
      },
      products: [
        { name: 'Special Gujarati Mini Bhakharwadi (500g)', description: 'Crisp spiral savoury snacks with spicy coconut filling.', price: 160, isAvailable: true },
        { name: 'Dry Fruit Mini Kachori (500g)', description: 'Crunchy pastry balls filled with dry spices and raisins.', price: 180, isAvailable: true }
      ]
    },
    {
      user: {
        name: 'Govind Kumbhar',
        email: 'govind.pots@example.com',
        phone: '+919876543224',
        passwordHash: hashedPassword,
        role: 'vendor',
        accountStatus: 'active'
      },
      profile: {
        stallName: 'Karelibaug Pottery & Terracotta Plant Pots',
        stallType: 'fixed',
        tagline: 'Glazed terracotta garden planters, bonsai pots & ceramic vases',
        description:
          'Open-air roadside nursery and pottery stall on Karelibaug road. Handcrafted clay planters, hanging baskets, and decorative terracotta garden artifacts.',
        categories: [categoryMap['handcrafts'], categoryMap['flowers-plants']],
        contactPublic: { phone: '+919876543224', whatsapp: '+919876543224' },
        address: {
          street: 'Karelibaug Main Road Roadside Nursery',
          area: 'Karelibaug',
          city: 'Vadodara',
          state: 'Gujarat',
          postalCode: '390018',
          landmark: 'Opposite Amrapali Complex'
        },
        location: { type: 'Point', coordinates: [73.2089, 22.3255] },
        approvalStatus: 'approved',
        availabilityStatus: 'open',
        openingHours: [
          { day: 'Mon', open: '09:00', close: '20:00', isClosed: false },
          { day: 'Tue', open: '09:00', close: '20:00', isClosed: false },
          { day: 'Wed', open: '09:00', close: '20:00', isClosed: false },
          { day: 'Thu', open: '09:00', close: '20:00', isClosed: false },
          { day: 'Fri', open: '09:00', close: '20:00', isClosed: false },
          { day: 'Sat', open: '09:00', close: '20:00', isClosed: false },
          { day: 'Sun', open: '09:00', close: '20:00', isClosed: false }
        ]
      },
      products: [
        { name: 'Hand-Molded Clay Garden Planter (12-inch)', description: 'Porous breathable pot ideal for healthy plant roots.', price: 180, isAvailable: true },
        { name: 'Hanging Terracotta Orchid Pot', description: 'With rustic jute rope for balcony gardens.', price: 150, isAvailable: true }
      ]
    },

    // ==========================================
    // RAJKOT STALLS (5 Stalls)
    // ==========================================
    {
      user: {
        name: 'Prabhashankar Gathiyawala',
        email: 'saurashtra.gathiya@example.com',
        phone: '+919876543225',
        passwordHash: hashedPassword,
        role: 'vendor',
        accountStatus: 'active'
      },
      profile: {
        stallName: 'Saurashtra Real Vanela Gathiya & Jalebi',
        stallType: 'fixed',
        tagline: 'Steaming Vanela Gathiya, raw papaya sambharo & hot saffron jalebis',
        description:
          'Rajkot iconic breakfast institution on Yagnik Road. Freshly rolled and fried vanela gathiya made from pure besan and black pepper, served with spicy shredded raw papaya and fried green chillies.',
        categories: [categoryMap['street-food']],
        contactPublic: { phone: '+919876543225', whatsapp: '+919876543225' },
        address: {
          street: 'Yagnik Road Stall #5',
          area: 'Yagnik Road',
          city: 'Rajkot',
          state: 'Gujarat',
          postalCode: '360001',
          landmark: 'Near Jagnath Mandir Chowk'
        },
        location: { type: 'Point', coordinates: [70.795, 22.2985] },
        approvalStatus: 'approved',
        availabilityStatus: 'open',
        openingHours: [
          { day: 'Mon', open: '06:30', close: '21:00', isClosed: false },
          { day: 'Tue', open: '06:30', close: '21:00', isClosed: false },
          { day: 'Wed', open: '06:30', close: '21:00', isClosed: false },
          { day: 'Thu', open: '06:30', close: '21:00', isClosed: false },
          { day: 'Fri', open: '06:30', close: '21:30', isClosed: false },
          { day: 'Sat', open: '06:00', close: '21:30', isClosed: false },
          { day: 'Sun', open: '06:00', close: '21:30', isClosed: false }
        ]
      },
      products: [
        { name: 'Fresh Steaming Vanela Gathiya (250g)', description: 'Melt-in-mouth soft besan gathiya with spicy papaya sambharo.', price: 90, isAvailable: true },
        { name: 'Crispy Desi Ghee Jalebi (250g)', description: 'Golden spirals soaked in fragrant saffron sugar syrup.', price: 120, isAvailable: true }
      ]
    },
    {
      user: {
        name: 'Devji Kutchi',
        email: 'devji.kutchi@example.com',
        phone: '+919876543226',
        passwordHash: hashedPassword,
        role: 'vendor',
        accountStatus: 'active'
      },
      profile: {
        stallName: 'Dharmendra Road Kutchi Embroidery & Traditional Wear',
        stallType: 'fixed',
        tagline: 'Kutchi mirror jackets, ethnic bandhani kurtas, and festival wall torans',
        description:
          'Located in Rajkot oldest shopping street. Vibrant ethnic apparel, Rabari needlework, handcrafted tote bags, and traditional festive wear directly from Kutch artisans.',
        categories: [categoryMap['clothing'], categoryMap['handcrafts']],
        contactPublic: { phone: '+919876543226', whatsapp: '+919876543226' },
        address: {
          street: 'Dharmendra Road Cloth Bazar',
          area: 'Dharmendra Road',
          city: 'Rajkot',
          state: 'Gujarat',
          postalCode: '360001',
          landmark: 'Near Jubilee Garden'
        },
        location: { type: 'Point', coordinates: [70.8033, 22.3025] },
        approvalStatus: 'approved',
        availabilityStatus: 'open',
        openingHours: [
          { day: 'Mon', open: '10:00', close: '21:00', isClosed: false },
          { day: 'Tue', open: '10:00', close: '21:00', isClosed: false },
          { day: 'Wed', open: '10:00', close: '21:00', isClosed: false },
          { day: 'Thu', open: '10:00', close: '21:00', isClosed: false },
          { day: 'Fri', open: '10:00', close: '21:00', isClosed: false },
          { day: 'Sat', open: '10:00', close: '21:30', isClosed: false },
          { day: 'Sun', open: '10:00', close: '18:00', isClosed: false }
        ]
      },
      products: [
        { name: 'Kutchi Mirror Work Sleeveless Jacket', description: 'Traditional colorful mirror embroidered waist-length jacket.', price: 550, isAvailable: true },
        { name: 'Handmade Door Hanging Toran', description: 'Artisan cotton toran with bells and beads for auspicious entry.', price: 280, isAvailable: true }
      ]
    },
    {
      user: {
        name: 'Mansukh Golawala',
        email: 'mansukh.gola@example.com',
        phone: '+919876543227',
        passwordHash: hashedPassword,
        role: 'vendor',
        accountStatus: 'active'
      },
      profile: {
        stallName: 'Trikon Baug Famous Rajkot Ice Dish Gola',
        stallType: 'fixed',
        tagline: 'Legendary Rajkot ice dish gola, dry fruit rabdi, and kala khatta',
        description:
          'Rajkot hot summer night savior at Trikon Baug. Shaved ice mountain platters covered with natural fruit syrups, mawa, cashew nuts, and thick condensed rabdi.',
        categories: [categoryMap['street-food'], categoryMap['beverages-juices']],
        contactPublic: { phone: '+919876543227', whatsapp: '+919876543227' },
        address: {
          street: 'Trikon Baug Promenade Stall #9',
          area: 'Trikon Baug',
          city: 'Rajkot',
          state: 'Gujarat',
          postalCode: '360001',
          landmark: 'Beside Trikon Baug City Bus Stand'
        },
        location: { type: 'Point', coordinates: [70.8012, 22.2995] },
        approvalStatus: 'approved',
        availabilityStatus: 'open',
        openingHours: [
          { day: 'Mon', open: '15:00', close: '00:30', isClosed: false },
          { day: 'Tue', open: '15:00', close: '00:30', isClosed: false },
          { day: 'Wed', open: '15:00', close: '00:30', isClosed: false },
          { day: 'Thu', open: '15:00', close: '00:30', isClosed: false },
          { day: 'Fri', open: '15:00', close: '01:00', isClosed: false },
          { day: 'Sat', open: '14:00', close: '01:30', isClosed: false },
          { day: 'Sun', open: '14:00', close: '01:30', isClosed: false }
        ]
      },
      products: [
        { name: 'Special Rajwadi Dry Fruit Ice Dish', description: 'Crushed ice drenched in rose, pineapple, topped with rabdi and nuts.', price: 120, isAvailable: true },
        { name: 'Tangy Kala Khatta Ice Gola on Stick', description: 'Traditional tangy blackberry gola with chaat masala.', price: 40, isAvailable: true }
      ]
    },
    {
      user: {
        name: 'Virendra Dabeli',
        email: 'virendra.dabeli@example.com',
        phone: '+919876543228',
        passwordHash: hashedPassword,
        role: 'vendor',
        accountStatus: 'active'
      },
      profile: {
        stallName: 'Kalawad Road Royal Dabeli & Jumbo Vada Pav',
        stallType: 'fixed',
        tagline: 'Buttery roasted Kutchi dabeli loaded with masala peanuts & nylon sev',
        description:
          'Spicy potato masala packed into pav buns with sweet tamarind chutney, spicy garlic dip, roasted peanuts, pomegranate pearls, and toasted on butter.',
        categories: [categoryMap['street-food']],
        contactPublic: { phone: '+919876543228', whatsapp: '+919876543228' },
        address: {
          street: 'Kalawad Road Fast Food Line',
          area: 'Kalawad Road',
          city: 'Rajkot',
          state: 'Gujarat',
          postalCode: '360005',
          landmark: 'Near Kotecha Chowk'
        },
        location: { type: 'Point', coordinates: [70.7785, 22.2845] },
        approvalStatus: 'approved',
        availabilityStatus: 'open',
        openingHours: [
          { day: 'Mon', open: '11:00', close: '22:30', isClosed: false },
          { day: 'Tue', open: '11:00', close: '22:30', isClosed: false },
          { day: 'Wed', open: '11:00', close: '22:30', isClosed: false },
          { day: 'Thu', open: '11:00', close: '22:30', isClosed: false },
          { day: 'Fri', open: '11:00', close: '23:00', isClosed: false },
          { day: 'Sat', open: '11:00', close: '23:00', isClosed: false },
          { day: 'Sun', open: '11:00', close: '23:00', isClosed: false }
        ]
      },
      products: [
        { name: 'Special Amul Butter Kutchi Dabeli', description: 'Toasted pav with rich spiced potato, pomegranate, and crunchy peanuts.', price: 40, isAvailable: true },
        { name: 'Mumbai Style Hot Vada Pav', description: 'Spiced potato fritter with dry garlic chutney in soft pav.', price: 35, isAvailable: true }
      ]
    },
    {
      user: {
        name: 'Dhirubhai Sabziwala',
        email: 'dhiru.sabzi@example.com',
        phone: '+919876543229',
        passwordHash: hashedPassword,
        role: 'vendor',
        accountStatus: 'active'
      },
      profile: {
        stallName: 'Gundawadi Fresh Vegetable & Organic Greens',
        stallType: 'fixed',
        tagline: 'Farm-picked methi, palak, coriander, ginger and fresh green vegetables',
        description:
          'Wholesale quality retail vegetable stall in Gundawadi market. Direct from local farmers: fresh fenugreek greens, tender okra, tindora, and seasonal vegetables.',
        categories: [categoryMap['fresh-produce']],
        contactPublic: { phone: '+919876543229', whatsapp: '+919876543229' },
        address: {
          street: 'Gundawadi Main Mandi Stall #11',
          area: 'Gundawadi',
          city: 'Rajkot',
          state: 'Gujarat',
          postalCode: '360002',
          landmark: 'Beside Gundawadi Vegetable Market Gate'
        },
        location: { type: 'Point', coordinates: [70.8089, 22.2945] },
        approvalStatus: 'approved',
        availabilityStatus: 'open',
        openingHours: [
          { day: 'Mon', open: '06:00', close: '19:30', isClosed: false },
          { day: 'Tue', open: '06:00', close: '19:30', isClosed: false },
          { day: 'Wed', open: '06:00', close: '19:30', isClosed: false },
          { day: 'Thu', open: '06:00', close: '19:30', isClosed: false },
          { day: 'Fri', open: '06:00', close: '19:30', isClosed: false },
          { day: 'Sat', open: '06:00', close: '19:30', isClosed: false },
          { day: 'Sun', open: '06:00', close: '14:00', isClosed: false }
        ]
      },
      products: [
        { name: 'Fresh Country Methi Greens (1 Bunch)', description: 'Tender aromatic fenugreek leaves harvested this morning.', price: 20, isAvailable: true },
        { name: 'Fresh Desi Okra / Bhindi (1 kg)', description: 'Crisp green tender ladyfingers for stir fry.', price: 50, isAvailable: true }
      ]
    },

    // ==========================================
    // GANDHINAGAR STALLS (3 Stalls)
    // ==========================================
    {
      user: {
        name: 'Hasmukhbhai Patel',
        email: 'capital.dalbaati@example.com',
        phone: '+919876543230',
        passwordHash: hashedPassword,
        role: 'vendor',
        accountStatus: 'active'
      },
      profile: {
        stallName: 'Capital Desi Dal Baati & Rajwadi Khichdi',
        stallType: 'fixed',
        tagline: 'Pure ghee wood-fire roasted Dal Baati thali, Kadhi, and Churma',
        description:
          'Beloved evening eating stall in Gandhinagar Sector 21 market. Serving pure cow ghee Rajwadi khichdi, traditional Gujarati Kadhi, and wood-roasted Dal Baati with garlic chutney.',
        categories: [categoryMap['street-food']],
        contactPublic: { phone: '+919876543230', whatsapp: '+919876543230' },
        address: {
          street: 'Sector 21 Market Stall #19',
          area: 'Sector 21',
          city: 'Gandhinagar',
          state: 'Gujarat',
          postalCode: '382021',
          landmark: 'Beside Sector 21 Post Office'
        },
        location: { type: 'Point', coordinates: [72.6515, 23.2384] },
        approvalStatus: 'approved',
        availabilityStatus: 'open',
        openingHours: [
          { day: 'Mon', open: '17:00', close: '23:00', isClosed: false },
          { day: 'Tue', open: '17:00', close: '23:00', isClosed: false },
          { day: 'Wed', open: '17:00', close: '23:00', isClosed: false },
          { day: 'Thu', open: '17:00', close: '23:00', isClosed: false },
          { day: 'Fri', open: '17:00', close: '23:30', isClosed: false },
          { day: 'Sat', open: '17:00', close: '23:30', isClosed: false },
          { day: 'Sun', open: '17:00', close: '23:30', isClosed: false }
        ]
      },
      products: [
        { name: 'Rajwadi Masala Khichdi & Kadhi Bowl', description: 'Slow-cooked spiced rice & moong dal simmered with pure ghee and vegetables.', price: 90, isAvailable: true },
        { name: 'Special Kathiyawadi Dal Baati Thali', description: '3 oven-roasted baatis dipped in ghee, rich spicy dal, churma, and fiery garlic chutney.', price: 150, isAvailable: true }
      ]
    },
    {
      user: {
        name: 'Murugan Dosa',
        email: 'murugan.dosa@example.com',
        phone: '+919876543231',
        passwordHash: hashedPassword,
        role: 'vendor',
        accountStatus: 'active'
      },
      profile: {
        stallName: 'Sector 7 Khau Gali Live Dosa & Mysore Masala',
        stallType: 'fixed',
        tagline: 'Crisp butter paper dosa, cheese blast dosa, and steaming idli sambar',
        description:
          'Long-standing evening stall in Sector 7 shopping centre. Authentic fermented batter roasted on hot tawa with fresh coconut chutney and sambar.',
        categories: [categoryMap['street-food']],
        contactPublic: { phone: '+919876543231', whatsapp: '+919876543231' },
        address: {
          street: 'Sector 7 Shopping Centre Food Court',
          area: 'Sector 7',
          city: 'Gandhinagar',
          state: 'Gujarat',
          postalCode: '382007',
          landmark: 'Near Sector 7 Circle'
        },
        location: { type: 'Point', coordinates: [72.6385, 23.2185] },
        approvalStatus: 'approved',
        availabilityStatus: 'open',
        openingHours: [
          { day: 'Mon', open: '16:30', close: '23:00', isClosed: false },
          { day: 'Tue', open: '16:30', close: '23:00', isClosed: false },
          { day: 'Wed', open: '16:30', close: '23:00', isClosed: false },
          { day: 'Thu', open: '16:30', close: '23:00', isClosed: false },
          { day: 'Fri', open: '16:30', close: '23:30', isClosed: false },
          { day: 'Sat', open: '16:30', close: '23:30', isClosed: false },
          { day: 'Sun', open: '16:30', close: '23:30', isClosed: false }
        ]
      },
      products: [
        { name: 'Mysore Masala Butter Dosa', description: 'Red garlic chutney spread with mashed potato masala.', price: 100, isAvailable: true },
        { name: 'Steaming Rice Idli Sambar (4 pcs)', description: 'Soft fluffy idlis served with hot drumstick sambar.', price: 50, isAvailable: true }
      ]
    },
    {
      user: {
        name: 'Arjun Infocity',
        email: 'arjun.infocity@example.com',
        phone: '+919876543232',
        passwordHash: hashedPassword,
        role: 'vendor',
        accountStatus: 'active'
      },
      profile: {
        stallName: 'Infocity Late Night Chai, Maggi & Coffee Point',
        stallType: 'fixed',
        tagline: '24/7 IT corridor adda for kulhad chai, cheese peri-peri maggi & cold coffee',
        description:
          'Tech workers and students favorite round-the-clock hangout at Infocity. Quick snacks, strong filter coffee, and piping hot noodles.',
        categories: [categoryMap['beverages-juices'], categoryMap['street-food']],
        contactPublic: { phone: '+919876543232', whatsapp: '+919876543232' },
        address: {
          street: 'Infocity Commercial Arcade',
          area: 'Infocity',
          city: 'Gandhinagar',
          state: 'Gujarat',
          postalCode: '382007',
          landmark: 'Beside TCS Gateway'
        },
        location: { type: 'Point', coordinates: [72.6312, 23.1895] },
        approvalStatus: 'approved',
        availabilityStatus: 'open',
        openingHours: [
          { day: 'Mon', open: '00:00', close: '23:59', isClosed: false },
          { day: 'Tue', open: '00:00', close: '23:59', isClosed: false },
          { day: 'Wed', open: '00:00', close: '23:59', isClosed: false },
          { day: 'Thu', open: '00:00', close: '23:59', isClosed: false },
          { day: 'Fri', open: '00:00', close: '23:59', isClosed: false },
          { day: 'Sat', open: '00:00', close: '23:59', isClosed: false },
          { day: 'Sun', open: '00:00', close: '23:59', isClosed: false }
        ]
      },
      products: [
        { name: 'Double Cheese Peri-Peri Maggi', description: 'Buttery noodles tossed with vegetables and loaded with cheese.', price: 80, isAvailable: true },
        { name: 'Cold Bournvita Thick Shake', description: 'Rich chocolate malt milk with crushed cookies.', price: 60, isAvailable: true }
      ]
    },

    // ==========================================
    // BHAVNAGAR STALLS (2 Stalls)
    // ==========================================
    {
      user: {
        name: 'Vaghjibhai Gathiya',
        email: 'vaghji.bhavnagar@example.com',
        phone: '+919876543233',
        passwordHash: hashedPassword,
        role: 'vendor',
        accountStatus: 'active'
      },
      profile: {
        stallName: 'Bhavnagar Crescent Famous Gathiya & Kadhi',
        stallType: 'fixed',
        tagline: 'Authentic Bhavnagri thick pepper gathiya with piping hot yellow kadhi',
        description:
          'The historical origin of Bhavnagri gathiya at Crescent Circle. Coarse gram flour gathiya seasoned with whole black peppercorns and ajwain.',
        categories: [categoryMap['street-food']],
        contactPublic: { phone: '+919876543233', whatsapp: '+919876543233' },
        address: {
          street: 'Crescent Circle Corner Stall #2',
          area: 'Crescent Circle',
          city: 'Bhavnagar',
          state: 'Gujarat',
          postalCode: '364001',
          landmark: 'Near Crescent Tower'
        },
        location: { type: 'Point', coordinates: [72.1501, 21.7645] },
        approvalStatus: 'approved',
        availabilityStatus: 'open',
        openingHours: [
          { day: 'Mon', open: '06:00', close: '20:30', isClosed: false },
          { day: 'Tue', open: '06:00', close: '20:30', isClosed: false },
          { day: 'Wed', open: '06:00', close: '20:30', isClosed: false },
          { day: 'Thu', open: '06:00', close: '20:30', isClosed: false },
          { day: 'Fri', open: '06:00', close: '20:30', isClosed: false },
          { day: 'Sat', open: '06:00', close: '21:00', isClosed: false },
          { day: 'Sun', open: '06:00', close: '21:00', isClosed: false }
        ]
      },
      products: [
        { name: 'Traditional Bhavnagri Gathiya (250g)', description: 'Thick crunchy black pepper gathiya with tangy sweet kadhi.', price: 80, isAvailable: true },
        { name: 'Kadhi Samosa Plate', description: 'Golden potato samosa served immersed in piping hot Gujarati kadhi.', price: 50, isAvailable: true }
      ]
    },
    {
      user: {
        name: 'Ganshyam Soda',
        email: 'ghanshyam.soda@example.com',
        phone: '+919876543234',
        passwordHash: hashedPassword,
        role: 'vendor',
        accountStatus: 'active'
      },
      profile: {
        stallName: 'Ghogha Circle Fresh Sugarcane & Lemon Soda',
        stallType: 'mobile',
        tagline: 'Fizzy fresh lemon sodas, ginger sugarcane juice, and masala shikanji',
        description:
          'Refreshing street stall at Ghogha Circle. Classic marble soda bottles, fresh mint lemonades, and sugarcane juice extracted on-demand.',
        categories: [categoryMap['beverages-juices']],
        contactPublic: { phone: '+919876543234', whatsapp: '+919876543234' },
        address: {
          street: 'Ghogha Circle Kiosk Zone',
          area: 'Ghogha Circle',
          city: 'Bhavnagar',
          state: 'Gujarat',
          postalCode: '364002',
          landmark: 'Near Ghogha Gate'
        },
        location: { type: 'Point', coordinates: [72.1445, 21.7585] },
        approvalStatus: 'approved',
        availabilityStatus: 'open',
        openingHours: [
          { day: 'Mon', open: '09:00', close: '23:00', isClosed: false },
          { day: 'Tue', open: '09:00', close: '23:00', isClosed: false },
          { day: 'Wed', open: '09:00', close: '23:00', isClosed: false },
          { day: 'Thu', open: '09:00', close: '23:00', isClosed: false },
          { day: 'Fri', open: '09:00', close: '23:00', isClosed: false },
          { day: 'Sat', open: '09:00', close: '23:30', isClosed: false },
          { day: 'Sun', open: '09:00', close: '23:30', isClosed: false }
        ]
      },
      products: [
        { name: 'Masala Lemon Goti Soda', description: 'Effervescent vintage bottle soda with rock salt and lemon.', price: 25, isAvailable: true },
        { name: 'Fresh Mint Sugarcane Juice (Tall Glass)', description: 'Chilled cold pressed juice with crushed ice and ginger.', price: 30, isAvailable: true }
      ]
    },

    // ==========================================
    // JAMNAGAR STALLS (2 Stalls)
    // ==========================================
    {
      user: {
        name: 'Hasmukh Kachori',
        email: 'hasmukh.kachori@example.com',
        phone: '+919876543235',
        passwordHash: hashedPassword,
        role: 'vendor',
        accountStatus: 'active'
      },
      profile: {
        stallName: 'Bedi Gate Authentic Jamnagari Dry Fruit Kachori',
        stallType: 'fixed',
        tagline: 'World-renowned crunchy dry fruit spiced kachoris with sweet chutney',
        description:
          'Jamnagar famous export quality dry fruit kachoris at Bedi Gate. Made with cashews, raisins, cloves, cinnamon, and savory gram flour in crisp pastry shells.',
        categories: [categoryMap['street-food']],
        contactPublic: { phone: '+919876543235', whatsapp: '+919876543235' },
        address: {
          street: 'Bedi Gate Historical Lane Stall #7',
          area: 'Bedi Gate',
          city: 'Jamnagar',
          state: 'Gujarat',
          postalCode: '361001',
          landmark: 'Opposite Bedi Gate Police Chowki'
        },
        location: { type: 'Point', coordinates: [70.0667, 22.4707] },
        approvalStatus: 'approved',
        availabilityStatus: 'open',
        openingHours: [
          { day: 'Mon', open: '08:00', close: '21:00', isClosed: false },
          { day: 'Tue', open: '08:00', close: '21:00', isClosed: false },
          { day: 'Wed', open: '08:00', close: '21:00', isClosed: false },
          { day: 'Thu', open: '08:00', close: '21:00', isClosed: false },
          { day: 'Fri', open: '08:00', close: '21:00', isClosed: false },
          { day: 'Sat', open: '08:00', close: '21:30', isClosed: false },
          { day: 'Sun', open: '08:00', close: '21:30', isClosed: false }
        ]
      },
      products: [
        { name: 'Special Dry Fruit Kachori Box (500g)', description: 'Crisp kachoris filled with cashew, raisins, and aromatic spices.', price: 180, isAvailable: true },
        { name: 'Live Hot Hing Kachori with Kadhi (Plate)', description: 'Steaming asafoetida spiced kachoris served with warm kadhi.', price: 50, isAvailable: true }
      ]
    },
    {
      user: {
        name: 'Pratapsingh Brass',
        email: 'pratap.brass@example.com',
        phone: '+919876543236',
        passwordHash: hashedPassword,
        role: 'vendor',
        accountStatus: 'active'
      },
      profile: {
        stallName: 'Chandi Bazar Brass & Metal Artifacts',
        stallType: 'fixed',
        tagline: 'Handmade brass pooja bells, oil diyas, and traditional home ornaments',
        description:
          'Jamnagar Brass City heritage stall. Direct manufacture brass lamps, ornate temple bells, antique polished urli bowls, and bronze utensils.',
        categories: [categoryMap['handcrafts'], categoryMap['household-essentials']],
        contactPublic: { phone: '+919876543236', whatsapp: '+919876543236' },
        address: {
          street: 'Chandi Bazar Metal Arcade',
          area: 'Chandi Bazar',
          city: 'Jamnagar',
          state: 'Gujarat',
          postalCode: '361001',
          landmark: 'Near Ratan Bai Masjid'
        },
        location: { type: 'Point', coordinates: [70.0712, 22.4685] },
        approvalStatus: 'approved',
        availabilityStatus: 'open',
        openingHours: [
          { day: 'Mon', open: '10:00', close: '20:30', isClosed: false },
          { day: 'Tue', open: '10:00', close: '20:30', isClosed: false },
          { day: 'Wed', open: '10:00', close: '20:30', isClosed: false },
          { day: 'Thu', open: '10:00', close: '20:30', isClosed: false },
          { day: 'Fri', open: '10:00', close: '20:30', isClosed: false },
          { day: 'Sat', open: '10:00', close: '20:30', isClosed: false },
          { day: 'Sun', open: '10:00', close: '15:00', isClosed: false }
        ]
      },
      products: [
        { name: 'Solid Brass Temple Bell with Peacock Handle', description: 'Resonant acoustic chime crafted in pure brass.', price: 450, isAvailable: true },
        { name: 'Traditional Brass Samai / Stand Diya (14-inch)', description: 'Tall oil lamp for festive celebration and pooja.', price: 750, isAvailable: true }
      ]
    },

    // ==========================================
    // JUNAGADH STALL (1 Stall)
    // ==========================================
    {
      user: {
        name: 'Keshavbhai Girnar',
        email: 'keshav.honey@example.com',
        phone: '+919876543237',
        passwordHash: hashedPassword,
        role: 'vendor',
        accountStatus: 'active'
      },
      profile: {
        stallName: 'Girnar Foothills Pure Herbal Honey & Forest Ayurveda',
        stallType: 'fixed',
        tagline: 'Raw Girnar forest honey, wild amla candy, and herbal forest tea',
        description:
          'Located at the starting base of Mount Girnar. Sourcing unheated wild forest honey from tribal gatherers, alongside amla murabba, shilajit, and natural Ayurvedic roots.',
        categories: [categoryMap['fresh-produce'], categoryMap['household-essentials']],
        contactPublic: { phone: '+919876543237', whatsapp: '+919876543237' },
        address: {
          street: 'Bhavnath Taleti Pilgrim Road',
          area: 'Bhavnath',
          city: 'Junagadh',
          state: 'Gujarat',
          postalCode: '362004',
          landmark: 'At the base of Mount Girnar Steps'
        },
        location: { type: 'Point', coordinates: [70.4985, 21.5285] },
        approvalStatus: 'approved',
        availabilityStatus: 'open',
        openingHours: [
          { day: 'Mon', open: '05:00', close: '21:00', isClosed: false },
          { day: 'Tue', open: '05:00', close: '21:00', isClosed: false },
          { day: 'Wed', open: '05:00', close: '21:00', isClosed: false },
          { day: 'Thu', open: '05:00', close: '21:00', isClosed: false },
          { day: 'Fri', open: '05:00', close: '21:00', isClosed: false },
          { day: 'Sat', open: '05:00', close: '22:00', isClosed: false },
          { day: 'Sun', open: '05:00', close: '22:00', isClosed: false }
        ]
      },
      products: [
        { name: '100% Pure Wild Girnar Forest Honey (500g)', description: 'Unprocessed, unfiltered natural floral honey.', price: 320, isAvailable: true },
        { name: 'Spiced Dried Amla Candy (250g)', description: 'Natural vitamin C chewable digestive amla.', price: 100, isAvailable: true }
      ]
    },

    // ==========================================
    // ANAND STALL (1 Stall)
    // ==========================================
    {
      user: {
        name: 'Sureshbhai Kulfi',
        email: 'suresh.anand@example.com',
        phone: '+919876543238',
        passwordHash: hashedPassword,
        role: 'vendor',
        accountStatus: 'active'
      },
      profile: {
        stallName: 'Amul Dairy Road Kulfi & Rabdi Stall',
        stallType: 'fixed',
        tagline: 'Slow-churned pure milk mawa kulfi on wooden sticks and thick kesar rabdi',
        description:
          'In the milk capital of India. Using pure fresh Buffalo milk from Anand dairies, slow boiled for 6 hours with saffron, pistachios, and green cardamom.',
        categories: [categoryMap['street-food'], categoryMap['beverages-juices']],
        contactPublic: { phone: '+919876543238', whatsapp: '+919876543238' },
        address: {
          street: 'Amul Dairy Road Promenade',
          area: 'Amul Dairy Road',
          city: 'Anand',
          state: 'Gujarat',
          postalCode: '388001',
          landmark: 'Opposite Amul Chocolate Plant'
        },
        location: { type: 'Point', coordinates: [72.9289, 22.5645] },
        approvalStatus: 'approved',
        availabilityStatus: 'open',
        openingHours: [
          { day: 'Mon', open: '12:00', close: '23:30', isClosed: false },
          { day: 'Tue', open: '12:00', close: '23:30', isClosed: false },
          { day: 'Wed', open: '12:00', close: '23:30', isClosed: false },
          { day: 'Thu', open: '12:00', close: '23:30', isClosed: false },
          { day: 'Fri', open: '12:00', close: '23:30', isClosed: false },
          { day: 'Sat', open: '11:00', close: '00:00', isClosed: false },
          { day: 'Sun', open: '11:00', close: '00:00', isClosed: false }
        ]
      },
      products: [
        { name: 'Kesar Pista Malai Kulfi on Stick', description: 'Rich condensed whole milk kulfi with almond shavings.', price: 40, isAvailable: true },
        { name: 'Earthen Bowl Thick Rabdi (150g)', description: 'Chilled thickened milk with saffron threads.', price: 70, isAvailable: true }
      ]
    },

    // ==========================================
    // BHUJ / KUTCH STALL (1 Stall)
    // ==========================================
    {
      user: {
        name: 'Valjibhai Kutch',
        email: 'valji.kutch@example.com',
        phone: '+919876543239',
        passwordHash: hashedPassword,
        role: 'vendor',
        accountStatus: 'active'
      },
      profile: {
        stallName: 'Shroff Bazar Kutchi Dabeli & Mud Art Work',
        stallType: 'fixed',
        tagline: 'Original Mandvi double-roti Dabeli and Kutchi lippan art wall decor',
        description:
          'Located in Bhuj historic Shroff Bazar. Serving the true birthplace recipe of Kutchi dabeli roasted in peanut oil alongside beautiful white clay mud-mirror lippan wall panels.',
        categories: [categoryMap['street-food'], categoryMap['handcrafts']],
        contactPublic: { phone: '+919876543239', whatsapp: '+919876543239' },
        address: {
          street: 'Shroff Bazar Heritage Lane Stall #4',
          area: 'Shroff Bazar',
          city: 'Bhuj',
          state: 'Gujarat',
          postalCode: '370001',
          landmark: 'Near Aina Mahal'
        },
        location: { type: 'Point', coordinates: [69.6669, 23.242] },
        approvalStatus: 'approved',
        availabilityStatus: 'open',
        openingHours: [
          { day: 'Mon', open: '10:00', close: '22:00', isClosed: false },
          { day: 'Tue', open: '10:00', close: '22:00', isClosed: false },
          { day: 'Wed', open: '10:00', close: '22:00', isClosed: false },
          { day: 'Thu', open: '10:00', close: '22:00', isClosed: false },
          { day: 'Fri', open: '10:00', close: '22:00', isClosed: false },
          { day: 'Sat', open: '10:00', close: '22:30', isClosed: false },
          { day: 'Sun', open: '10:00', close: '22:30', isClosed: false }
        ]
      },
      products: [
        { name: 'Original Mandvi Double Roti Dabeli', description: 'Secret blend of 18 spices with roasted masala peanuts.', price: 35, isAvailable: true },
        { name: 'Handcrafted Kutchi Lippan Mud Mirror Panel (10x10)', description: 'Traditional camel dung & clay mirror craft for walls.', price: 450, isAvailable: true }
      ]
    }
  ];

  let createdCount = 0;
  let updatedCount = 0;

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
      createdCount++;
      console.log(`✓ Created vendor stall: ${profile.stallName} (${profile.address.area}, ${profile.address.city})`);
    } else {
      // Update coordinates, approval status, and city if needed
      await VendorProfile.updateOne(
        { _id: profile._id },
        {
          $set: {
            approvalStatus: 'approved',
            availabilityStatus: 'open',
            address: item.profile.address,
            location: item.profile.location,
            categories: item.profile.categories,
            tagline: item.profile.tagline,
            description: item.profile.description
          }
        }
      );
      updatedCount++;
      console.log(`- Updated existing vendor stall: ${profile.stallName}`);
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

  console.log(`✓ Successfully seeded sample approved vendors! Created: ${createdCount}, Updated: ${updatedCount}`);
  process.exit(0);
};

seedSampleVendors().catch((err) => {
  console.error('Failed to seed sample vendors:', err);
  process.exit(1);
});
