import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { hashPassword, comparePassword, verifyToken, generateToken } from '@/lib/auth';

export async function POST(req) {
  try {
    const { username, email, currentPassword } = await req.json();
    
    // Check if required fields are present
    if (!username || !email || !currentPassword) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }
    
    // Find user by username and email
    const user = await prisma.user.findFirst({
      where: {
        username,
        email
      }
    });
    
    // Check if user exists
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    
    // Verify current password
    const isPasswordValid = await comparePassword(currentPassword, user.password);
    if (!isPasswordValid) {
      return NextResponse.json({ error: 'Invalid password' }, { status: 401 });
    }
    
    // Reset the pattern setup in local database
    await prisma.user.update({
      where: { id: user.id },
      data: {
        securityPattern: null,
        isPatternSet: false
      }
    });
    
    // No external identity provider integration
    
    // Generate new selection of phrases, images, and icons
    const phrases = [
      "Blue Sky", "Red Door", "Green Tree", "Silver Moon", 
      "Golden Sun", "Purple Rain", "Yellow Star", "Orange Leaf"
    ];
    
    const images = ['🌴', '🏔️', '🌊', '🌺', '🌇', '🏙️', '🏞️', '🌄'];
    const icons = ['♠️', '⭐', '△', '□', '♦️', '♥️', '○', '✓'];
    
    // Shuffle and select subset for user
    const shufflePhrases = [...phrases].sort(() => 0.5 - Math.random()).slice(0, 4);
    const shuffleImages = [...images].sort(() => 0.5 - Math.random()).slice(0, 4);
    const shuffleIcons = [...icons].sort(() => 0.5 - Math.random()).slice(0, 4);
    
    // Update pattern setup options
    await prisma.patternSetup.update({
      where: { userId: user.id },
      data: {
        phrases: JSON.stringify(shufflePhrases),
        images: JSON.stringify(shuffleImages),
        icons: JSON.stringify(shuffleIcons)
      }
    });
    
    // Generate token for pattern setup
    const token = generateToken(user);
    
    // Return success response
    return NextResponse.json({
      message: 'Pattern reset successful',
      userId: user.id,
      token,
      requiresPatternSetup: true
    });
    
  } catch (error) {
    console.error('Pattern reset error:', error);
    return NextResponse.json({ error: 'Failed to reset pattern' }, { status: 500 });
  }
}