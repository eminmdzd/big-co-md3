import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { notifyUsersWithoutPattern } from '../../../../../scripts/notify-pattern-setup.js';

// API endpoint for triggering notifications via HTTP request (e.g., from a cron job)
export async function GET(req) {
  try {
    // Check for API key or other authorization if needed
    const { searchParams } = new URL(req.url);
    const apiKey = searchParams.get('apiKey');
    
    if (!apiKey || apiKey !== process.env.CRON_API_KEY) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Run the notification process
    const result = await notifyUsersWithoutPattern();
    
    // Return the results
    return NextResponse.json({
      message: 'Pattern setup notifications sent',
      totalUsers: result.totalUsers,
      successCount: result.successCount,
      failureCount: result.failureCount
    });
    
  } catch (error) {
    console.error('Cron pattern notifications error:', error);
    return NextResponse.json({ error: 'Failed to process pattern notifications' }, { status: 500 });
  }
}