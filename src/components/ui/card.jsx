import React from 'react';

export function Card({ className, children, ...props }) {
  return (
    <div 
      className={`rounded-lg border bg-white shadow-sm ${className || ''}`}
      style={{
        borderRadius: '0.5rem',
        border: '1px solid #e5e7eb',
        backgroundColor: '#ffffff',
        boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)'
      }}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({ className, children, ...props }) {
  return (
    <div 
      className={`flex flex-col space-y-1.5 p-6 ${className || ''}`}
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '0.375rem',
        padding: '1.5rem'
      }}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardTitle({ className, children, ...props }) {
  return (
    <h3 
      className={`text-2xl font-semibold leading-none tracking-tight ${className || ''}`}
      style={{
        fontSize: '1.5rem',
        fontWeight: '600',
        lineHeight: '1',
        letterSpacing: '-0.025em'
      }}
      {...props}
    >
      {children}
    </h3>
  );
}

export function CardDescription({ className, children, ...props }) {
  return (
    <p 
      className={`text-sm text-gray-500 ${className || ''}`}
      style={{
        fontSize: '0.875rem',
        color: '#6b7280'
      }}
      {...props}
    >
      {children}
    </p>
  );
}

export function CardContent({ className, children, ...props }) {
  return (
    <div 
      className={`p-6 pt-0 ${className || ''}`}
      style={{
        padding: '1.5rem',
        paddingTop: '0'
      }}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardFooter({ className, children, ...props }) {
  return (
    <div 
      className={`flex items-center p-6 pt-0 ${className || ''}`}
      style={{
        display: 'flex',
        alignItems: 'center',
        padding: '1.5rem',
        paddingTop: '0'
      }}
      {...props}
    >
      {children}
    </div>
  );
}