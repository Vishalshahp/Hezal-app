import mongoose from 'mongoose';
import env from '../config/env.js';
import User from '../models/User.js';
import { connectDB, disconnectDB } from '../config/db.js';
import logger from '../utils/logger.js';

const seedAdmin = async () => {
  logger.info('Starting Administrator Seeding Script...');

  try {
    await connectDB();

    const adminEmail = (env.ADMIN_EMAIL || 'admin@hezalmarket.com').toLowerCase().trim();
    const adminPassword = env.ADMIN_PASSWORD || 'AdminPassword123!';
    const adminName = env.ADMIN_NAME || 'Platform Administrator';

    const DEMO_TOTP_SECRET = 'JBSWY3DPEHPK3PXP';

    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: adminEmail }).select('+twoFactorSecret');

    if (existingAdmin) {
      existingAdmin.role = 'admin';
      existingAdmin.accountStatus = 'active';
      existingAdmin.twoFactorEnabled = true;
      existingAdmin.twoFactorSecret = DEMO_TOTP_SECRET;
      await existingAdmin.save();
      logger.info(`Administrator account (${adminEmail}) updated with Google Authenticator TOTP support (Secret: ${DEMO_TOTP_SECRET}).`);
      await disconnectDB();
      process.exit(0);
    }

    // Create new admin
    const passwordHash = await User.hashPassword(adminPassword);

    await User.create({
      name: adminName,
      email: adminEmail,
      phone: '+919999999999',
      passwordHash,
      role: 'admin',
      accountStatus: 'active',
      twoFactorEnabled: true,
      twoFactorSecret: DEMO_TOTP_SECRET
    });

    logger.info(`=================================================`);
    logger.info(`  Administrator Provisioned Successfully!`);
    logger.info(`  Name:   ${adminName}`);
    logger.info(`  Email:  ${adminEmail}`);
    logger.info(`  Role:   admin`);
    logger.info(`  2FA:    Google Authenticator Enabled`);
    logger.info(`  Secret: ${DEMO_TOTP_SECRET}`);
    logger.info(`=================================================`);

    await disconnectDB();
    process.exit(0);
  } catch (error) {
    logger.error('Failed to seed administrator account:', error.message);
    if (mongoose.connection.readyState !== 0) {
      await disconnectDB();
    }
    process.exit(1);
  }
};

seedAdmin();
