"use client";

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { AlertCircle } from 'lucide-react';
import axios from 'axios';
import { useRouter } from 'next/navigation';

const AuthForm = ({ type = 'login' }) => {
  const router = useRouter();
  const [formData, setFormData] = useState({
    username: '',
    email: type === 'register' ? '' : undefined,
    password: '',
    confirmPassword: type === 'register' ? '' : undefined
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Validation for registration
    if (type === 'register') {
      if (formData.password !== formData.confirmPassword) {
        setError('Passwords do not match');
        setLoading(false);
        return;
      }

      if (!formData.email || !formData.username || !formData.password) {
        setError('All fields are required');
        setLoading(false);
        return;
      }
    }

    try {
      let response;
      if (type === 'login') {
        response = await axios.post('/api/auth/login', {
          username: formData.username,
          password: formData.password
        });
      } else {
        response = await axios.post('/api/auth/register', {
          username: formData.username,
          email: formData.email,
          password: formData.password
        });
      }

      // Handle successful response
      if (response.data) {
        // Store PingOne flow ID if available
        if (response.data.idpFlowId) {
          localStorage.setItem('idp_flow_id', response.data.idpFlowId);
        }
        
        // Store identity provider user ID if available
        if (response.data.idpUserId) {
          localStorage.setItem('idp_user_id', response.data.idpUserId);
        }
        
        if (response.data.requiresPatternSetup) {
          // Redirect to pattern setup
          localStorage.setItem('auth_token', response.data.token);
          localStorage.setItem('user_id', response.data.userId);
          router.push('/auth/pattern-setup');
        } else if (response.data.requiresPatternVerification) {
          // Redirect to pattern verification
          localStorage.setItem('auth_token', response.data.token);
          localStorage.setItem('user_id', response.data.userId);
          router.push('/auth/pattern-verify');
        } else if (type === 'register' && response.data.requiresPatternSetup) {
          // Registration successful, redirect to pattern setup
          localStorage.setItem('auth_token', response.data.token);
          localStorage.setItem('user_id', response.data.userId);
          router.push('/auth/pattern-setup');
        } else if (type === 'register') {
          // Registration successful but no pattern required, redirect to login
          router.push('/auth/login?registered=true');
        }
      }
    } catch (err) {
      setError(err.response?.data?.error || 'An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <div className="flex items-center gap-4">
          <div className="ihg-logo">IHG</div>
          <CardTitle>
            {type === 'login' ? 'Employee Login' : 'Create Account'}
          </CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="username" className="block text-sm font-medium mb-1">
              Username
            </label>
            <Input
              id="username"
              name="username"
              type="text"
              value={formData.username}
              onChange={handleChange}
              placeholder="Enter your username"
              required
            />
          </div>

          {type === 'register' && (
            <div>
              <label htmlFor="email" className="block text-sm font-medium mb-1">
                Email
              </label>
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Enter your email"
                required
              />
            </div>
          )}

          <div>
            <label htmlFor="password" className="block text-sm font-medium mb-1">
              Password
            </label>
            <Input
              id="password"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Enter your password"
              required
            />
          </div>

          {type === 'register' && (
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium mb-1">
                Confirm Password
              </label>
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="Confirm your password"
                required
              />
            </div>
          )}

          {error && (
            <div className="text-red-500 text-sm flex items-center gap-2">
              <AlertCircle className="h-4 w-4" />
              {error}
            </div>
          )}

          <Button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700"
            disabled={loading}
          >
            {loading ? 'Processing...' : type === 'login' ? 'Login' : 'Create Account'}
          </Button>

          <div className="text-center text-sm">
            {type === 'login' ? (
              <>
                Don't have an account?{' '}
                <a href="/auth/register" className="text-blue-600 hover:underline">
                  Register
                </a>
              </>
            ) : (
              <>
                Already have an account?{' '}
                <a href="/auth/login" className="text-blue-600 hover:underline">
                  Login
                </a>
              </>
            )}
          </div>
          
          {type === 'login' && (
            <div className="text-center text-sm">
              <a href="/auth/reset-pattern" className="text-blue-600 hover:underline">
                Forgot your pattern?
              </a>
            </div>
          )}
        </form>
      </CardContent>
    </Card>
  );
};

export default AuthForm;