import React from 'react';

export function Button({ className, variant = 'default', size = 'default', children, ...props }) {
  // Define styles directly with Tailwind classes
  const styles = {
    base: 'inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none',
    variants: {
      default: 'bg-blue-600 text-white hover:bg-blue-700',
      outline: 'border border-gray-300 bg-white hover:bg-gray-100',
      secondary: 'bg-gray-100 text-gray-900 hover:bg-gray-200',
      ghost: 'hover:bg-gray-100',
      link: 'text-blue-600 underline-offset-4 hover:underline',
    },
    sizes: {
      default: 'h-10 py-2 px-4',
      sm: 'h-8 px-3 text-sm',
      lg: 'h-12 px-6 text-lg',
    }
  };
  
  // Combine the styles
  const cssClasses = [
    styles.base,
    styles.variants[variant] || styles.variants.default,
    styles.sizes[size] || styles.sizes.default,
    className || ''
  ].join(' ');
  
  return (
    <button
      className={cssClasses}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: '0.375rem',
        fontWeight: '500',
        transition: 'colors 0.2s',
        backgroundColor: variant === 'default' ? '#2563eb' : undefined,
        color: variant === 'default' ? 'white' : undefined,
        border: variant === 'outline' ? '1px solid #d1d5db' : undefined,
      }}
      {...props}
    >
      {children}
    </button>
  );
}