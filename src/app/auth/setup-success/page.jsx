'use client';

import React, { useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function SetupSuccessPage() {
  const router = useRouter();
  
  useEffect(() => {
    // Redirect to login after 5 seconds
    const timer = setTimeout(() => {
      router.push('/auth/login');
    }, 5000);
    
    return () => clearTimeout(timer);
  }, [router]);
  
  return (
    <div className="min-h-screen bg-gray-100 p-4 flex items-center justify-center">
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="flex items-center gap-4">
            <div className="ihg-logo">IHG</div>
            <CardTitle>Pattern Setup Complete</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-6 text-center">
            <div className="flex justify-center">
              <CheckCircle className="h-20 w-20 text-green-500" />
            </div>
            
            <h3 className="text-xl font-semibold">Security Pattern Successfully Set Up</h3>
            
            <p className="text-gray-600">
              Your new security pattern has been saved. You'll need to use this pattern for future logins.
            </p>
            
            <p className="text-sm text-gray-500">
              You will be redirected to the login page in 5 seconds...
            </p>
            
            <Button 
              onClick={() => router.push('/auth/login')} 
              className="w-full bg-blue-600 hover:bg-blue-700"
            >
              Return to Login
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}