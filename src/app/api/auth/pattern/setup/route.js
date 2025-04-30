import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyToken, encodePattern, generateToken } from '@/lib/auth';

// Default pattern options that will be used if none are found in the database
const DEFAULT_PATTERN_OPTIONS = {
  phrases: [
    "The sky is blue",
    "Water is wet",
    "Fire is hot",
    "Mountains are tall",
    "Coffee is bitter",
    "Honey is sweet",
    "Birds can fly",
    "Fish can swim",
    "Trees have leaves",
    "Flowers smell nice"
  ],
  images: [
    "/patterns/image1.jpg",
    "/patterns/image2.jpg",
    "/patterns/image3.jpg",
    "/patterns/image4.jpg",
    "/patterns/image5.jpg",
    "/patterns/image6.jpg",
    "/patterns/image7.jpg",
    "/patterns/image8.jpg",
    "/patterns/image9.jpg",
    "/patterns/image10.jpg"
  ],
  icons: [
    "🏠", "🚗", "⚽", "🍎", "💻", "📱", "🎵", "🎬",
    "📚", "✈️", "🔒", "⏰", "☂️", "🎁", "🔑", "💡",
    "📷", "🌈", "⭐", "🐱", "🐶", "🌺", "🌞", "📝"
  ]
};

export async function GET(req) {
  try {
    // Extract user ID from query params
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');
    const token = searchParams.get('token');
    
    if (!userId || !token) {
      return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 });
    }
    
    // Verify JWT token
    const decodedToken = verifyToken(token);
    if (!decodedToken || decodedToken.id !== userId) {
      return NextResponse.json({ error: 'Invalid or expired session' }, { status: 401 });
    }
    
    // Get user's available pattern options
    let patternSetup = await prisma.patternSetup.findUnique({
      where: { userId }
    });
    
    // If no pattern setup exists, create one with default options
    if (!patternSetup) {
      patternSetup = await prisma.patternSetup.create({
        data: {
          userId,
          phrases: JSON.stringify(DEFAULT_PATTERN_OPTIONS.phrases),
          images: JSON.stringify(DEFAULT_PATTERN_OPTIONS.images),
          icons: JSON.stringify(DEFAULT_PATTERN_OPTIONS.icons),
          user: {
            connect: {
              id: userId
            }
          }
        }
      });
    }
    
    // Return available options for pattern setup
    return NextResponse.json({
      phrases: JSON.parse(patternSetup.phrases),
      images: JSON.parse(patternSetup.images),
      icons: JSON.parse(patternSetup.icons)
    });
    
  } catch (error) {
    console.error('Pattern setup fetch error:', error);
    return NextResponse.json({ error: 'Failed to fetch pattern setup options' }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const { userId, pattern, token } = await req.json();
    
    // Check if required fields are present
    if (!userId || !pattern || !token || pattern.length !== 3) {
      return NextResponse.json({ error: 'Invalid pattern setup request' }, { status: 400 });
    }
    
    // Verify JWT token
    const decodedToken = verifyToken(token);
    if (!decodedToken || decodedToken.id !== userId) {
      return NextResponse.json({ error: 'Invalid or expired session' }, { status: 401 });
    }
    
    // Get user info
    const user = await prisma.user.findUnique({
      where: { id: userId },
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
      where: { id: userId },
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
    
    // Return success response
    return NextResponse.json({
      message: 'Pattern setup successful',
      token: newToken,
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