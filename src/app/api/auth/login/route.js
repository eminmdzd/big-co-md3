import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { comparePassword, generateToken, checkLoginAttempts, recordFailedAttempt } from '@/lib/auth';
import { getUser, initiateAuthentication } from '@/lib/identity-provider';

export async function POST(req) {
  try {
    const { username, password } = await req.json();
    
    // Check if required fields are present
    if (!username || !password) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }
    
    // Find user by username
    const user = await prisma.user.findUnique({
      where: { username }
    });
    
    // Check if user exists
    if (!user) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }
    
    // Check if account is locked due to too many failed attempts
    const loginCheck = await checkLoginAttempts(user.id);
    if (loginCheck.blocked) {
      return NextResponse.json({ 
        error: 'Account temporarily locked', 
        remainingTime: loginCheck.remainingTime 
      }, { status: 403 });
    }
    
    // Check password
    const isPasswordValid = await comparePassword(password, user.password);
    if (!isPasswordValid) {
      // Record failed attempt
      await recordFailedAttempt(user.id);
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }
    
    // Try to get the user from identity provider if integration is enabled
    let idpUser = null;
    let authFlow = null;
    try {
      idpUser = await getUser(username);
      
      // If identity provider user exists, initiate authentication flow
      if (idpUser) {
        authFlow = await initiateAuthentication(username);
      }
    } catch (idpError) {
      console.warn('Identity provider not available, using local auth flow:', idpError.message);
      // Continue with local auth flow if identity provider integration fails
    }
    
    // Generate JWT token for initial authentication
    const token = generateToken(user);
    
    // Check if user has set up 2FA pattern
    if (!user.isPatternSet) {
      // Return user ID for setup and token
      return NextResponse.json({
        message: 'Login successful - Pattern setup required',
        userId: user.id,
        token,
        requiresPatternSetup: true,
        idpFlowId: authFlow?.flowId
      });
    }
    
    // If user has 2FA set up, require pattern verification
    return NextResponse.json({
      message: 'Login successful - Pattern verification required',
      userId: user.id,
      token,
      requiresPatternVerification: true,
      idpFlowId: authFlow?.flowId,
      idpUserId: idpUser?.id
    });
    
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({ error: 'Failed to process login' }, { status: 500 });
  }
}