import React from 'react';
import AuthForm from '@/components/auth/AuthForm';

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-gray-100 p-4 flex items-center justify-center">
      <AuthForm type="login" />
    </div>
  );
}