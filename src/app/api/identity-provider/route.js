import { NextResponse } from 'next/server';
import { getProviderName, isUsingLocalFallback } from '@/lib/identity-provider';

// This endpoint provides information about the active identity provider configuration
// It's used by the dashboard to display the current identity provider info

export async function GET(req) {
  try {
    // Get identity provider information
    const providerName = getProviderName();
    const usingLocalFallback = isUsingLocalFallback();
    
    return NextResponse.json({
      provider: providerName,
      usingLocalFallback,
      localAuthEnabled: true
    });
  } catch (error) {
    console.error('Error fetching identity provider info:', error);
    return NextResponse.json(
      { error: 'Failed to get identity provider information' }, 
      { status: 500 }
    );
  }
}