"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertCircle } from 'lucide-react';
import axios from 'axios';
import { useRouter } from 'next/navigation';

const PatternVerify = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [pattern, setPattern] = useState([]);
  const [error, setError] = useState('');
  const [attemptsLeft, setAttemptsLeft] = useState(5);
  const [idpData, setIdpData] = useState({
    flowId: null,
    userId: null
  });
  
  const [verifyOptions, setVerifyOptions] = useState({
    phrases: [],
    images: [],
    icons: []
  });
  
  useEffect(() => {
    const fetchPatternOptions = async () => {
      try {
        const userId = localStorage.getItem('user_id');
        const token = localStorage.getItem('auth_token');
        const idpFlowId = localStorage.getItem('idp_flow_id');
        const idpUserId = localStorage.getItem('idp_user_id');
        
        if (!userId || !token) {
          router.push('/auth/login');
          return;
        }
        
        // Store identity provider data if available
        if (idpFlowId && idpUserId) {
          setIdpData({
            flowId: idpFlowId,
            userId: idpUserId
          });
        }
        
        // Fetch the user's specific pattern options - using the same endpoint as setup
        const response = await axios.get(`/api/auth/pattern/setup?userId=${userId}&token=${token}`);
        setVerifyOptions(response.data);
        setLoading(false);
      } catch (err) {
        setError('Failed to load verification options');
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
  
  const handleVerifySubmit = async () => {
    if (pattern.length !== 3) {
      setError('Please select exactly 3 elements for your pattern');
      return;
    }
    
    setError('');
    setLoading(true);
    
    try {
      const userId = localStorage.getItem('user_id');
      const token = localStorage.getItem('auth_token');
      
      if (!userId || !token) {
        router.push('/auth/login');
        return;
      }
      
      const response = await axios.post('/api/auth/pattern/verify', {
        userId,
        token,
        pattern,
        idpFlowId: idpData.flowId,
        idpUserId: idpData.userId
      });
      
      // Handle successful response
      if (response.data && response.data.token) {
        localStorage.setItem('auth_token', response.data.token);
        // Also store user data if needed
        localStorage.setItem('user', JSON.stringify(response.data.user));
        
        // Clean up identity provider data
        localStorage.removeItem('idp_flow_id');
        localStorage.removeItem('idp_user_id');
        
        // Redirect to dashboard
        router.push('/hotel-dashboard');
      }
    } catch (err) {
      // Update attempts left
      if (err.response?.data?.attemptsLeft !== undefined) {
        setAttemptsLeft(err.response.data.attemptsLeft);
      }
      
      setError(err.response?.data?.error || 'Invalid pattern');
      setPattern([]);
    } finally {
      setLoading(false);
    }
  };
  
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 p-4 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="py-6">
            <div className="text-center">Loading verification...</div>
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
          <CardTitle>Security Verification</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div>
            <p className="text-sm text-gray-600 mb-4">
              Select the 3 elements in the correct order that match your security pattern.
            </p>
          </div>
          
          <div>
            <p className="text-sm font-medium mb-2">Security Phrases</p>
            <div className="grid grid-cols-2 gap-2">
              {verifyOptions.phrases.map((phrase, index) => (
                <Button
                  key={`phrase-${index}`}
                  onClick={() => handlePatternSelection('phrase', index)}
                  variant={pattern.includes(`phrase-${index}`) ? "default" : "outline"}
                  className={`h-12 ${pattern.includes(`phrase-${index}`) ? 'bg-blue-600 text-white' : ''}`}
                >
                  {phrase}
                </Button>
              ))}
            </div>
          </div>
          
          <div>
            <p className="text-sm font-medium mb-2">Security Images</p>
            <div className="grid grid-cols-4 gap-2">
              {verifyOptions.images.map((image, index) => (
                <Button
                  key={`image-${index}`}
                  onClick={() => handlePatternSelection('image', index)}
                  variant={pattern.includes(`image-${index}`) ? "default" : "outline"}
                  className={`h-16 text-3xl ${pattern.includes(`image-${index}`) ? 'bg-blue-600' : ''}`}
                >
                  {image}
                </Button>
              ))}
            </div>
          </div>
          
          <div>
            <p className="text-sm font-medium mb-2">Security Icons</p>
            <div className="grid grid-cols-4 gap-2">
              {verifyOptions.icons.map((icon, index) => (
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
              {attemptsLeft > 0 && ` (${attemptsLeft} attempts remaining)`}
            </div>
          )}
          
          <Button 
            onClick={handleVerifySubmit} 
            className="w-full bg-blue-600 hover:bg-blue-700"
            disabled={pattern.length !== 3 || loading}
          >
            {loading ? 'Verifying...' : 'Verify Pattern'}
          </Button>
          
          <div className="text-center text-sm">
            <a href="/auth/reset-pattern" className="text-blue-600 hover:underline">
              Forgot your pattern?
            </a>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default PatternVerify;