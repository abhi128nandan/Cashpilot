// Centralized icon export to ensure safe fallback handling if an icon fails to load
import { AlertCircle as LucideAlertCircle } from 'lucide-react';
import React from 'react';

// Safe fallback for AlertCircle in case lucide-react has issues
export const AlertCircle = (props: any) => {
  try {
    return <LucideAlertCircle {...props} />;
  } catch (error) {
    // Fallback simple SVG if Lucide crashes
    return (
      <svg 
        width="24" height="24" viewBox="0 0 24 24" fill="none" 
        stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
        {...props}
      >
        <circle cx="12" cy="12" r="10"></circle>
        <line x1="12" y1="8" x2="12" y2="12"></line>
        <line x1="12" y1="16" x2="12.01" y2="16"></line>
      </svg>
    );
  }
};
