import { NextResponse } from 'next/server';

// Simple endpoint providing system configuration information

export async function GET(req) {
  return NextResponse.json({
    provider: 'LocalAuth',
    localAuthEnabled: true,
    environment: process.env.NODE_ENV || 'development'
  });
}