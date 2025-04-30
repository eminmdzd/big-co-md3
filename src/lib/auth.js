import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { prisma } from './prisma';

// Secret key for JWT token
const JWT_SECRET = process.env.JWT_SECRET || 'ihg-pattern-2fa-secret-key';

// Encrypt password
export async function hashPassword(password) {
  const saltRounds = 10;
  return bcrypt.hash(password, saltRounds);
}

// Compare password with hashed password
export async function comparePassword(password, hashedPassword) {
  return bcrypt.compare(password, hashedPassword);
}

// Generate JWT token
export function generateToken(user, expiresIn = '1h') {
  const payload = {
    id: user.id,
    username: user.username,
    email: user.email,
    isPatternSet: user.isPatternSet
  };
  
  return jwt.sign(payload, JWT_SECRET, { expiresIn });
}

// Generate a secure setup token for email links
export function generateSetupToken(user) {
  const payload = {
    id: user.id,
    username: user.username,
    email: user.email,
    purpose: 'pattern_setup',
    isPatternSet: user.isPatternSet
  };
  
  // Setup links valid for 7 days
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
}

// Verify JWT token
export function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    return null;
  }
}

// Check if user has too many failed login attempts
export async function checkLoginAttempts(userId) {
  const user = await prisma.user.findUnique({
    where: { id: userId }
  });
  
  if (!user) {
    return { blocked: false };
  }
  
  // If user has 5 or more failed attempts within the last 30 minutes
  if (user.failedAttempts >= 5 && user.lastFailedAttempt) {
    const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000);
    if (new Date(user.lastFailedAttempt) > thirtyMinutesAgo) {
      return { 
        blocked: true, 
        remainingTime: Math.ceil((new Date(user.lastFailedAttempt).getTime() + 30 * 60 * 1000 - Date.now()) / 60000) 
      };
    }
    
    // Reset failed attempts if 30 minutes have passed
    await prisma.user.update({
      where: { id: userId },
      data: { failedAttempts: 0 }
    });
  }
  
  return { blocked: false };
}

// Record failed login attempt
export async function recordFailedAttempt(userId) {
  return prisma.user.update({
    where: { id: userId },
    data: {
      failedAttempts: { increment: 1 },
      lastFailedAttempt: new Date()
    }
  });
}

// Reset failed login attempts
export async function resetFailedAttempts(userId) {
  return prisma.user.update({
    where: { id: userId },
    data: {
      failedAttempts: 0
    }
  });
}

// Encode and decode security pattern
export function encodePattern(pattern) {
  return JSON.stringify(pattern);
}

export function decodePattern(encodedPattern) {
  return JSON.parse(encodedPattern);
}

// Verify user's pattern
export async function verifyPattern(userId, submittedPattern) {
  const user = await prisma.user.findUnique({
    where: { id: userId }
  });
  
  if (!user || !user.securityPattern) {
    return false;
  }
  
  const storedPattern = decodePattern(user.securityPattern);
  const encodedSubmitted = JSON.stringify(submittedPattern);
  
  return JSON.stringify(storedPattern) === encodedSubmitted;
}