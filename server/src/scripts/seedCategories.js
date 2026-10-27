import mongoose from 'mongoose';
import Category from '../models/Category.js';
import { connectDB, disconnectDB } from '../config/db.js';
import logger from '../utils/logger.js';

export const initialCategories = [
  { name: 'Fruits & Vegetables', slug: 'fruits-vegetables', icon: 'apple', displayOrder: 1 },
  { name: 'Street Food & Chaat', slug: 'street-food-chaat', icon: 'utensils', displayOrder: 2 },
  { name: 'Beverages & Chai', slug: 'beverages-chai', icon: 'coffee', displayOrder: 3 },
  { name: 'Fast Food & Meals', slug: 'fast-food-meals', icon: 'sandwich', displayOrder: 4 },
  { name: 'Tailoring & Alterations', slug: 'tailoring-alterations', icon: 'scissors', displayOrder: 5 },
  { name: 'Repairs & Services', slug: 'repairs-services', icon: 'wrench', displayOrder: 6 },
  { name: 'Bakery & Sweets', slug: 'bakery-sweets', icon: 'cake', displayOrder: 7 },
  { name: 'Flowers & Puja Items', slug: 'flowers-puja', icon: 'flower', displayOrder: 8 }
];

export const seedCategories = async () => {
  logger.info('Starting Category Taxonomy Seeding Script...');

  try {
    await connectDB();

    for (const cat of initialCategories) {
      await Category.findOneAndUpdate(
        { slug: cat.slug },
        { ...cat, isActive: true },
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );
    }

    const count = await Category.countDocuments();
    logger.info(`Categories taxonomy seeded successfully. Total active categories: ${count}`);

    if (process.argv[1] && process.argv[1].endsWith('seedCategories.js')) {
      await disconnectDB();
      process.exit(0);
    }
  } catch (error) {
    logger.error('Failed to seed categories:', error.message);
    if (mongoose.connection.readyState !== 0) {
      await disconnectDB();
    }
    if (process.argv[1] && process.argv[1].endsWith('seedCategories.js')) {
      process.exit(1);
    }
  }
};

if (process.argv[1] && process.argv[1].endsWith('seedCategories.js')) {
  seedCategories();
}

export default seedCategories;
