#!/usr/bin/env node

// This script creates test users - some with and some without security patterns set up
// To run: npm run create-test-users

import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Initialize Prisma Client directly in this script
const prisma = new PrismaClient();

// For hashing passwords
async function hashPassword(password) {
  const saltRounds = 10;
  return bcrypt.hash(password, saltRounds);
}

// For encoding patterns
function encodePattern(pattern) {
  return JSON.stringify(pattern);
}

// Test users to create
const users = [
  {
    username: 'user_with_pattern',
    email: 'user_with_pattern@example.com',
    password: 'password123',
    hasPattern: true
  },
  {
    username: 'user_no_pattern',
    email: 'eminmammadzada.b@gmail.com',
    password: 'password123',
    hasPattern: false
  },
  {
    username: 'admin',
    email: 'em876@cornell.edu',
    password: 'admin123',
    hasPattern: false
  }
];

// Default pattern setup options
const patternOptions = {
  phrases: [
    "Blue Sky", "Red Door", "Green Tree", "Silver Moon",
    "Golden Sun", "Purple Rain", "Yellow Star", "Orange Leaf"
  ],
  images: ['🌴', '🏔️', '🌊', '🌺', '🌇', '🏙️', '🏞️', '🌄'],
  icons: ['♠️', '⭐', '△', '□', '♦️', '♥️', '○', '✓']
};

// Sample pattern for users with pattern
const samplePattern = [
  { type: "phrase", value: "Blue Sky" },
  { type: "image", value: "🌴" }, 
  { type: "icon", value: "⭐" }
];

// Function to create a test user
async function createTestUser(userData) {
  try {
    // Check if user already exists
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { username: userData.username },
          { email: userData.email }
        ]
      }
    });

    if (existingUser) {
      console.log(`User ${userData.username} already exists, skipping...`);
      return existingUser;
    }

    // Hash password
    const hashedPassword = await hashPassword(userData.password);

    // Create user
    const user = await prisma.user.create({
      data: {
        username: userData.username,
        email: userData.email,
        password: hashedPassword,
        isPatternSet: userData.hasPattern
      }
    });

    console.log(`Created user: ${user.username} (${user.email})`);

    // Create pattern setup
    await prisma.patternSetup.create({
      data: {
        id: user.id,
        phrases: JSON.stringify(patternOptions.phrases),
        images: JSON.stringify(patternOptions.images),
        icons: JSON.stringify(patternOptions.icons),
        user: {
          connect: {
            id: user.id
          }
        }
      }
    });

    console.log(`Created pattern setup for user: ${user.username}`);

    // Set security pattern for users who should have one
    if (userData.hasPattern) {
      const encodedPattern = encodePattern(samplePattern);
      
      await prisma.user.update({
        where: { id: user.id },
        data: {
          securityPattern: encodedPattern,
          isPatternSet: true
        }
      });

      console.log(`Set security pattern for user: ${user.username}`);
    }

    return user;
  } catch (error) {
    console.error(`Error creating user ${userData.username}:`, error);
    throw error;
  }
}

// Main function to create all test users
async function createTestUsers() {
  try {
    console.log('Starting test user creation...');
    
    for (const userData of users) {
      await createTestUser(userData);
    }
    
    console.log('\nTest users created successfully:');
    console.log('-------------------------------');
    for (const user of users) {
      console.log(`${user.username} / ${user.password} ${user.hasPattern ? '(has pattern)' : '(NO PATTERN)'}`);
    }
    console.log('\nYou can now test the notification feature with these users.');
    
  } catch (error) {
    console.error('Error creating test users:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the function
createTestUsers();