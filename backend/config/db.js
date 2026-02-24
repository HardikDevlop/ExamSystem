/**
 * MongoDB connection configuration
 * Uses Mongoose to connect to the database
 * Also ensures that at least one admin user exists.
 */
const mongoose = require('mongoose');
const User = require('../models/User');

// Create a default admin user if none exists
const ensureAdminUser = async () => {
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@email.com';
  const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';
  const adminName = process.env.ADMIN_NAME || 'Admin';

  const existingAdmin = await User.findOne({ email: adminEmail, role: 'admin' });
  if (existingAdmin) {
    console.log(`Admin user already exists: ${existingAdmin.email}`);
    return;
  }

  await User.create({
    name: adminName,
    email: adminEmail,
    password: adminPassword,
    role: 'admin',
  });

  console.log(
    `Default admin created. Email: ${adminEmail}, Password: ${adminPassword}`
  );
};

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);

    // After successful connection, ensure there is an admin user
    await ensureAdminUser();
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
