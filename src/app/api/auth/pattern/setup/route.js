import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyToken, encodePattern, generateToken } from '@/lib/auth';

// Default pattern options that will be used if none are found in the database
// Using universally recognizable symbols without any text
const DEFAULT_PATTERN_OPTIONS = {
  numbers: [
    "1️⃣", // one
    "2️⃣", // two
    "3️⃣", // three
    "4️⃣", // four
    "5️⃣", // five
    "6️⃣", // six
    "7️⃣", // seven
    "8️⃣", // eight
    "9️⃣", // nine
    "0️⃣", // zero
    "🔟", // ten
    "🔢"  // numbers
  ],
  shapes: [
    "⭐", // star
    "🔶", // diamond
    "🔷", // diamond
    "🔺", // triangle
    "🔻", // triangle
    "⬛", // square
    "⬜", // square
    "🔘", // button
    "⚪", // circle
    "🔴", // circle
    "🔵", // circle
    "🟢"  // circle
  ],
  icons: [
    "🏠", // house
    "🚗", // car
    "⚽", // soccer
    "🍎", // apple
    "💻", // laptop
    "📱", // phone
    "🎵", // music
    "🎬", // movie
    "🔒", // lock
    "⏰", // clock
    "🎁", // gift
    "🔑", // key
    "💡", // light bulb
    "📷", // camera
    "🌞", // sun
    "🐶", // dog
    "🐱", // cat
    "🌺", // flower
    "🏔️", // mountain
    "🌊", // wave
    "✈️", // airplane
    "🚢", // ship
    "🌍", // earth
    "🍕"  // pizza
  ]
};

export async function GET(req) {
  try {
    // Extract parameters from query params
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');
    const token = searchParams.get('token');
    
    if (!token) {
      return NextResponse.json({ error: 'Missing required token' }, { status: 400 });
    }
    
    // Verify JWT token
    const decodedToken = verifyToken(token);
    if (!decodedToken) {
      return NextResponse.json({ error: 'Invalid or expired token' }, { status: 401 });
    }
    
    // Check if this is a secure setup token from email link (has purpose field)
    const isSecureSetupToken = decodedToken.purpose === 'pattern_setup';
    
    // For secure tokens from email links, check if token has already been used
    if (isSecureSetupToken) {
      // Check if this token has been used before
      if (decodedToken.tokenId) {
        const usedToken = await prisma.usedSetupToken.findUnique({
          where: { tokenId: decodedToken.tokenId }
        });
        
        if (usedToken) {
          return NextResponse.json({ 
            error: 'This security link has already been used. Please request a new one.' 
          }, { status: 401 });
        }
      }
    } else {
      // For regular tokens (not from email), verify userId matches
      if (!userId || decodedToken.id !== userId) {
        return NextResponse.json({ error: 'Invalid user session' }, { status: 401 });
      }
    }
    
    // Extract user ID from the token
    const targetUserId = decodedToken.id;
    
    // Get user's available pattern options
    let patternSetup = await prisma.patternSetup.findUnique({
      where: { userId: targetUserId }
    });
    
    // Helper function to shuffle an array (Fisher-Yates shuffle)
    const shuffleArray = (array) => {
      const shuffled = [...array];
      for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
      }
      return shuffled;
    };
    
    // If no pattern setup exists, create one with shuffled default options
    if (!patternSetup) {
      // Shuffle each array of options
      const shuffledNumbers = shuffleArray(DEFAULT_PATTERN_OPTIONS.numbers);
      const shuffledShapes = shuffleArray(DEFAULT_PATTERN_OPTIONS.shapes);
      const shuffledIcons = shuffleArray(DEFAULT_PATTERN_OPTIONS.icons);
      
      patternSetup = await prisma.patternSetup.create({
        data: {
          phrases: JSON.stringify(shuffledNumbers),
          images: JSON.stringify(shuffledShapes),
          icons: JSON.stringify(shuffledIcons),
          user: {
            connect: {
              id: targetUserId
            }
          }
        }
      });
    }
    
    // Get user data to return with the pattern options
    const user = await prisma.user.findUnique({
      where: { id: targetUserId },
      select: {
        id: true,
        username: true,
        email: true
      }
    });
    
    // Return available options for pattern setup and user information
    return NextResponse.json({
      phrases: JSON.parse(patternSetup.phrases),
      images: JSON.parse(patternSetup.images),
      icons: JSON.parse(patternSetup.icons),
      userId: targetUserId,
      username: user.username
    });
    
  } catch (error) {
    console.error('Pattern setup fetch error:', error);
    return NextResponse.json({ error: 'Failed to fetch pattern setup options' }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const { userId, pattern, token } = await req.json();
    
    // Check for required token and pattern
    if (!pattern || !token || pattern.length !== 3) {
      return NextResponse.json({ error: 'Invalid pattern setup request' }, { status: 400 });
    }
    
    // Verify JWT token
    const decodedToken = verifyToken(token);
    if (!decodedToken) {
      return NextResponse.json({ error: 'Invalid or expired token' }, { status: 401 });
    }
    
    // Check if this is a secure setup token from email link (has purpose field)
    const isSecureSetupToken = decodedToken.purpose === 'pattern_setup';
    
    // For secure tokens from email links, check if token has already been used
    if (isSecureSetupToken && decodedToken.tokenId) {
      const usedToken = await prisma.usedSetupToken.findUnique({
        where: { tokenId: decodedToken.tokenId }
      });
      
      if (usedToken) {
        return NextResponse.json({ 
          error: 'This security link has already been used. Please request a new one.' 
        }, { status: 401 });
      }
    }
    
    // Determine the target user ID based on token type
    let targetUserId;
    if (isSecureSetupToken) {
      // For secure tokens from email, extract user ID from token
      targetUserId = decodedToken.id;
    } else {
      // For regular tokens, validate provided userId
      if (!userId || userId !== decodedToken.id) {
        return NextResponse.json({ error: 'Invalid user session' }, { status: 401 });
      }
      targetUserId = userId;
    }
    
    // Get user info
    const user = await prisma.user.findUnique({
      where: { id: targetUserId },
      select: {
        id: true,
        username: true,
        email: true
      }
    });
    
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    
    // Encode pattern and save to user record
    const encodedPattern = encodePattern(pattern);
    
    // Update user record in local database
    const updatedUser = await prisma.user.update({
      where: { id: targetUserId },
      data: {
        securityPattern: encodedPattern,
        isPatternSet: true
      },
      select: {
        id: true,
        username: true,
        email: true,
        isPatternSet: true
      }
    });
    
    // Generate new token with updated user info
    const newToken = generateToken(updatedUser);
    
    // For secure tokens from email links, mark the token as used
    if (isSecureSetupToken && decodedToken.tokenId) {
      await prisma.usedSetupToken.create({
        data: {
          tokenId: decodedToken.tokenId,
          user: {
            connect: {
              id: targetUserId
            }
          }
        }
      });
    }
    
    // Return success response
    return NextResponse.json({
      message: 'Pattern setup successful',
      token: newToken,
      userId: updatedUser.id,
      user: {
        id: updatedUser.id,
        username: updatedUser.username,
        email: updatedUser.email
      }
    });
    
  } catch (error) {
    console.error('Pattern setup error:', error);
    return NextResponse.json({ error: 'Failed to set up pattern' }, { status: 500 });
  }
}