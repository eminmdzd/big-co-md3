import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { hashPassword } from '@/lib/auth';
import { createUser } from '@/lib/identity-provider';

export async function POST(req) {
  try {
    const { username, email, password } = await req.json();
    
    // Check if required fields are present
    if (!username || !email || !password) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }
    
    // Check if user already exists
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { username },
          { email }
        ]
      }
    });
    
    if (existingUser) {
      return NextResponse.json({ error: 'User already exists' }, { status: 409 });
    }
    
    // Hash password
    const hashedPassword = await hashPassword(password);
    
    // Create user in local database
    const newUser = await prisma.user.create({
      data: {
        username,
        email,
        password: hashedPassword
      }
    });

    // Generate random selection of phrases, images, and icons for pattern setup
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

    // Store available options for user's pattern setup
    await prisma.patternSetup.create({
      data: {
        id: newUser.id,
        phrases: JSON.stringify(shufflePhrases),
        images: JSON.stringify(shuffleImages),
        icons: JSON.stringify(shuffleIcons),
        user: {
          connect: {
            id: newUser.id
          }
        }
      }
    });
    
    // Skip identity provider integration for localhost setup
    
    // Generate JWT token for initial authentication
    const { generateToken } = await import('@/lib/auth');
    const token = generateToken(newUser);
    
    return NextResponse.json({ 
      message: 'User registered successfully',
      userId: newUser.id,
      token: token,
      requiresPatternSetup: true
    }, { status: 201 });
    
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json({ error: 'Failed to register user' }, { status: 500 });
  }
}