import dotenv from 'dotenv';
import mongoose from 'mongoose';
import Admin from './models/Admin.js';

// Load environment variables
dotenv.config();

const createAdmin = async () => {
  try {
    console.log('🔧 Setting up admin account...\n');

    // Connect to database
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    // Get admin credentials from .env
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@mindcare.com';
    const adminPassword = process.env.ADMIN_PASSWORD;

    if (!adminPassword) {
      console.error('❌ ERROR: ADMIN_PASSWORD not set in .env file');
      process.exit(1);
    }

    // Check if admin already exists
    const existingAdmin = await Admin.findOne({ email: adminEmail });
    
    if (existingAdmin) {
      console.log(`⚠️  Admin account already exists for: ${adminEmail}`);
      console.log('Would you like to update the password? (This will be implemented in future)');
      console.log('\nTo update password:');
      console.log('1. Delete the admin from MongoDB');
      console.log('2. Run this script again\n');
      process.exit(0);
    }

    // Create new admin
    const admin = new Admin({
      email: adminEmail,
      password: adminPassword,
      role: 'superadmin'
    });

    await admin.save();

    console.log('✅ Admin account created successfully!\n');
    console.log('📧 Email:', adminEmail);
    console.log('🔑 Password: ****** (hashed and stored securely)');
    console.log('👤 Role: superadmin\n');
    console.log('🎉 You can now login to the admin dashboard!\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating admin:', error.message);
    process.exit(1);
  }
};

createAdmin();
