import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyToken, encodePattern, generateToken } from '@/lib/auth';
import { storePattern, getUser } from '@/lib/identity-provider';

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
    const patternSetup = await prisma.patternSetup.findUnique({
      where: { userId }
    });
    
    if (!patternSetup) {
      return NextResponse.json({ error: 'Pattern setup not found' }, { status: 404 });
    }
    
    // Return available options for pattern setup
    return NextResponse.json({
      phrases: JSON.parse(patternSetup.availablePhrases),
      images: JSON.parse(patternSetup.availableImages),
      icons: JSON.parse(patternSetup.availableIcons)
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
    
    // Try to store pattern in identity provider if integration is enabled
    try {
      // Get identity provider user ID
      const idpUser = await getUser(user.username);
      
      if (idpUser) {
        await storePattern(idpUser.id, encodedPattern);
      }
    } catch (idpError) {
      console.warn('Identity provider pattern storage failed, continuing with local storage:', idpError.message);
      // Don't fail the pattern setup if identity provider integration fails
    }
    
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