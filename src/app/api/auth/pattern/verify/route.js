import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyToken, verifyPattern, recordFailedAttempt, resetFailedAttempts, generateToken } from '@/lib/auth';

export async function POST(req) {
  try {
    const { userId, pattern, token } = await req.json();
    
    // Check if required fields are present
    if (!userId || !pattern || !token) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }
    
    // Verify JWT token
    const decodedToken = verifyToken(token);
    if (!decodedToken || decodedToken.id !== userId) {
      return NextResponse.json({ error: 'Invalid or expired session' }, { status: 401 });
    }
    
    // Verify the pattern
    const isPatternValid = await verifyPattern(userId, pattern);
    
    // Skip identity provider authentication for localhost setup
    
    if (!isPatternValid) {
      // Record failed attempt
      await recordFailedAttempt(userId);
      
      // Check if user is now locked out
      const user = await prisma.user.findUnique({
        where: { id: userId }
      });
      
      const attemptsLeft = Math.max(0, 5 - (user?.failedAttempts || 0));
      
      return NextResponse.json({ 
        error: 'Invalid pattern', 
        attemptsLeft 
      }, { status: 401 });
    }
    
    // If pattern is correct, reset failed attempts
    await resetFailedAttempts(userId);
    
    // Generate new token for full authentication
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        username: true,
        email: true,
        isPatternSet: true
      }
    });
    
    const newToken = generateToken(user);
    
    // Return success response
    return NextResponse.json({
      message: 'Pattern verification successful',
      token: newToken,
      user: {
        id: user.id,
        username: user.username,
        email: user.email
      }
    });
    
  } catch (error) {
    console.error('Pattern verification error:', error);
    return NextResponse.json({ error: 'Failed to verify pattern' }, { status: 500 });
  }
}