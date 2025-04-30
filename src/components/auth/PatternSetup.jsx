"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertCircle } from 'lucide-react';
import axios from 'axios';
import { useRouter } from 'next/navigation';

const PatternSetup = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [pattern, setPattern] = useState([]);
  const [error, setError] = useState('');
  const [setupOptions, setSetupOptions] = useState({
    phrases: [],
    images: [],
    icons: []
  });

  useEffect(() => {
    const fetchPatternOptions = async () => {
      try {
        // First check for a token in the URL (for email links)
        const urlParams = new URLSearchParams(window.location.search);
        const urlToken = urlParams.get('token');
        
        let requestToken;
        let userId;
        
        if (urlToken) {
          // Use the token from the URL for secure direct setup from email
          requestToken = urlToken;
        } else {
          // Otherwise use local storage token (for users who are already logged in)
          userId = localStorage.getItem('user_id');
          requestToken = localStorage.getItem('auth_token');
          
          if (!userId || !requestToken) {
            router.push('/auth/login');
            return;
          }
        }
        
        // Build the API request with the appropriate parameters
        let apiUrl = '/api/auth/pattern/setup?';
        if (urlToken) {
          apiUrl += `token=${requestToken}`;
        } else {
          apiUrl += `userId=${userId}&token=${requestToken}`;
        }
        
        const response = await axios.get(apiUrl);
        setSetupOptions(response.data);
        
        // If we have user info in the response, store it
        if (response.data.userId) {
          localStorage.setItem('user_id', response.data.userId);
        }
        
        setLoading(false);
      } catch (err) {
        setError(err.response?.data?.error || 'Failed to load pattern options');
        setLoading(false);
      }
    };
    
    fetchPatternOptions();
  }, [router]);
  
  const handlePatternSelection = (type, index) => {
    // Create identifier for the element (e.g., 'phrase-0', 'image-2')
    const elementId = `${type}-${index}`;
    
    // Check if already selected
    const newPattern = [...pattern];
    const existingIndex = newPattern.findIndex(item => item === elementId);
    
    if (existingIndex >= 0) {
      // If already selected, remove it
      newPattern.splice(existingIndex, 1);
    } else if (newPattern.length < 3) {
      // If not selected and we have less than 3 items, add it
      newPattern.push(elementId);
    }
    
    setPattern(newPattern);
  };
  
  const handleSetupSubmit = async () => {
    if (pattern.length !== 3) {
      setError('Please select exactly 3 elements for your pattern');
      return;
    }
    
    setError('');
    setLoading(true);
    
    try {
      // First check for a token in the URL (for email links)
      const urlParams = new URLSearchParams(window.location.search);
      const urlToken = urlParams.get('token');
      
      let requestToken;
      let userId;
      
      if (urlToken) {
        // Use the token from the URL for secure direct setup from email
        requestToken = urlToken;
        // The userId will be extracted from the token on the server
      } else {
        // Otherwise use local storage values for users who are already logged in
        userId = localStorage.getItem('user_id');
        requestToken = localStorage.getItem('auth_token');
        
        if (!userId || !requestToken) {
          router.push('/auth/login');
          return;
        }
      }
      
      // Make the API request with the appropriate parameters
      const requestData = { pattern };
      
      if (urlToken) {
        requestData.token = urlToken;
      } else {
        requestData.userId = userId;
        requestData.token = requestToken;
      }
      
      const response = await axios.post('/api/auth/pattern/setup', requestData);
      
      // Handle successful response
      if (response.data && response.data.token) {
        localStorage.setItem('auth_token', response.data.token);
        if (response.data.userId) {
          localStorage.setItem('user_id', response.data.userId);
        }
        
        // Redirect to dashboard or success page
        router.push('/auth/setup-success');
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to set up pattern');
    } finally {
      setLoading(false);
    }
  };
  
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 p-4 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="py-6">
            <div className="text-center">Loading pattern options...</div>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <div className="flex items-center gap-4">
          <div className="ihg-logo">IHG</div>
          <CardTitle>Set Up Security Pattern</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div>
            <p className="text-sm text-gray-600 mb-4">
              Select 3 elements to create your security pattern: one number, one shape, and one object.
              You'll need to remember this pattern in the same order for future logins.
            </p>
          </div>
          
          <div>
            <p className="text-sm font-medium mb-2">Numbers</p>
            <div className="grid grid-cols-4 gap-2">
              {setupOptions.phrases?.map((number, index) => (
                <Button
                  key={`phrase-${index}`}
                  onClick={() => handlePatternSelection('phrase', index)}
                  variant={pattern.includes(`phrase-${index}`) ? "default" : "outline"}
                  className={`h-16 text-3xl ${pattern.includes(`phrase-${index}`) ? 'bg-blue-600' : ''}`}
                >
                  {number}
                </Button>
              ))}
            </div>
          </div>
          
          <div>
            <p className="text-sm font-medium mb-2">Shapes</p>
            <div className="grid grid-cols-4 gap-2">
              {setupOptions.images?.map((shape, index) => (
                <Button
                  key={`image-${index}`}
                  onClick={() => handlePatternSelection('image', index)}
                  variant={pattern.includes(`image-${index}`) ? "default" : "outline"}
                  className={`h-16 text-3xl ${pattern.includes(`image-${index}`) ? 'bg-blue-600' : ''}`}
                >
                  {shape}
                </Button>
              ))}
            </div>
          </div>
          
          <div>
            <p className="text-sm font-medium mb-2">Objects</p>
            <div className="grid grid-cols-4 gap-2">
              {setupOptions.icons?.map((icon, index) => (
                <Button
                  key={`icon-${index}`}
                  onClick={() => handlePatternSelection('icon', index)}
                  variant={pattern.includes(`icon-${index}`) ? "default" : "outline"}
                  className={`h-16 text-3xl ${pattern.includes(`icon-${index}`) ? 'bg-blue-600' : ''}`}
                >
                  {icon}
                </Button>
              ))}
            </div>
          </div>
          
          <div>
            <p className="text-sm font-medium mb-2">Your Pattern (Select 3 Elements)</p>
            <div className="grid grid-cols-3 gap-2">
              {[0, 1, 2].map((index) => (
                <div 
                  key={`pattern-${index}`}
                  className="h-16 border rounded flex items-center justify-center bg-gray-50"
                >
                  {pattern[index] ? '✓' : (index + 1)}
                </div>
              ))}
            </div>
          </div>
          
          {error && (
            <div className="text-red-500 text-sm flex items-center gap-2">
              <AlertCircle className="h-4 w-4" />
              {error}
            </div>
          )}
          
          <Button 
            onClick={handleSetupSubmit} 
            className="w-full bg-blue-600 hover:bg-blue-700"
            disabled={pattern.length !== 3 || loading}
          >
            {loading ? 'Setting up...' : 'Save Pattern'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default PatternSetup;