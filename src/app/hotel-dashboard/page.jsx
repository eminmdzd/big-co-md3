'use client';

import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import axios from 'axios';

export default function HotelDashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [idpInfo, setIdpInfo] = useState({
    provider: 'Local Authentication',
    usingLocalFallback: true
  });
  
  useEffect(() => {
    // Check if user is logged in
    const token = localStorage.getItem('auth_token');
    const userStr = localStorage.getItem('user');
    
    if (!token) {
      // Redirect to login if no token
      router.push('/auth/login');
      return;
    }
    
    if (userStr) {
      try {
        setUser(JSON.parse(userStr));
      } catch (e) {
        console.error('Failed to parse user data');
        router.push('/auth/login');
      }
    }

    // Fetch identity provider info
    const fetchIdpInfo = async () => {
      try {
        const response = await axios.get('/api/identity-provider');
        setIdpInfo(response.data);
      } catch (error) {
        console.error('Failed to fetch identity provider info:', error);
      }
    };

    fetchIdpInfo();
  }, [router]);
  
  const handleLogout = () => {
    // Clear all localStorage items
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user_id');
    localStorage.removeItem('user');
    localStorage.removeItem('idp_flow_id');
    localStorage.removeItem('idp_user_id');
    
    // Redirect to login
    router.push('/auth/login');
  };
  
  if (!user) {
    return (
      <div className="min-h-screen bg-gray-100 p-4 flex items-center justify-center">
        <Card className="w-full max-w-4xl">
          <CardContent className="py-6">
            <div className="text-center">Loading dashboard...</div>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="max-w-7xl mx-auto">
        <header className="bg-white shadow-sm rounded-lg mb-6">
          <div className="px-4 py-4 sm:px-6 flex items-center justify-between">
            <div className="flex items-center">
              <div className="ihg-logo mr-4">IHG</div>
              <h1 className="text-xl font-semibold text-gray-900">Hotel Management Dashboard</h1>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-sm text-gray-600 flex flex-col items-end">
                <div>
                  Logged in as <span className="font-semibold">{user.username}</span>
                </div>
                <div className="text-xs text-gray-500">
                  {idpInfo.usingLocalFallback 
                    ? "Using local authentication" 
                    : `Using ${idpInfo.provider}`}
                </div>
              </div>
              <Button 
                onClick={handleLogout}
                variant="outline"
                size="sm"
              >
                Logout
              </Button>
            </div>
          </div>
        </header>
        
        <main className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Stats Card */}
          <Card>
            <CardHeader>
              <CardTitle>Hotel Statistics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="text-blue-600 text-sm font-medium">Room Occupancy</div>
                  <div className="text-2xl font-bold">82%</div>
                </div>
                <div className="bg-green-50 p-4 rounded-lg">
                  <div className="text-green-600 text-sm font-medium">Revenue</div>
                  <div className="text-2xl font-bold">$47K</div>
                </div>
                <div className="bg-yellow-50 p-4 rounded-lg">
                  <div className="text-yellow-600 text-sm font-medium">Bookings</div>
                  <div className="text-2xl font-bold">143</div>
                </div>
                <div className="bg-purple-50 p-4 rounded-lg">
                  <div className="text-purple-600 text-sm font-medium">Avg. Stay</div>
                  <div className="text-2xl font-bold">3.2 days</div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Recent Bookings Card */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Bookings</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {['Smith Family', 'Jane Johnson', 'Robert Brown', 'Maria Garcia'].map((name, index) => (
                  <div key={index} className="flex items-center justify-between border-b pb-2">
                    <div>
                      <div className="font-medium">{name}</div>
                      <div className="text-sm text-gray-500">Room {201 + index} • 3 nights</div>
                    </div>
                    <div className="text-sm text-blue-600">View Details</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
          
          {/* Tasks Card */}
          <Card>
            <CardHeader>
              <CardTitle>Pending Tasks</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {[
                  'Room 302 maintenance request',
                  'Schedule staff meeting',
                  'Review weekend reservations',
                  'Order new supplies'
                ].map((task, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <input type="checkbox" className="h-4 w-4 text-blue-600" id={`task-${index}`} />
                    <label htmlFor={`task-${index}`} className="text-gray-700">{task}</label>
                  </div>
                ))}
                <Button variant="outline" size="sm" className="w-full mt-4">
                  Add New Task
                </Button>
              </div>
            </CardContent>
          </Card>
          
          {/* Guest Reviews Card */}
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>Recent Guest Reviews</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { name: 'Sarah P.', rating: 5, comment: 'Excellent service! The staff was very friendly and helpful. Will definitely stay again.' },
                  { name: 'Michael T.', rating: 4, comment: 'Great location and clean rooms. The breakfast could have more variety.' },
                  { name: 'Lisa R.', rating: 5, comment: 'Amazing experience from check-in to check-out. The room was spotless and comfortable.' }
                ].map((review, index) => (
                  <div key={index} className="border-b pb-3">
                    <div className="flex items-center justify-between">
                      <div className="font-medium">{review.name}</div>
                      <div className="text-yellow-500">
                        {'★'.repeat(review.rating) + '☆'.repeat(5 - review.rating)}
                      </div>
                    </div>
                    <div className="text-gray-600 mt-1">{review.comment}</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
          
          {/* Room Status Card */}
          <Card>
            <CardHeader>
              <CardTitle>Room Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-2">
                <div className="bg-green-50 p-3 rounded-lg text-center">
                  <div className="text-green-600 font-medium">Available</div>
                  <div className="text-2xl font-bold">42</div>
                </div>
                <div className="bg-red-50 p-3 rounded-lg text-center">
                  <div className="text-red-600 font-medium">Occupied</div>
                  <div className="text-2xl font-bold">123</div>
                </div>
                <div className="bg-yellow-50 p-3 rounded-lg text-center">
                  <div className="text-yellow-600 font-medium">Cleaning</div>
                  <div className="text-2xl font-bold">15</div>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg text-center">
                  <div className="text-gray-600 font-medium">Maintenance</div>
                  <div className="text-2xl font-bold">8</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  );
}