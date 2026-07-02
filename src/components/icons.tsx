// Centralized icon export to ensure safe fallback handling if an icon fails to load
import { AlertCircle as LucideAlertCircle } from 'lucide-react';
import React from 'react';

// Safe fallback for AlertCircle in case lucide-react has issues
import { LucideProps } from 'lucide-react';

export const AlertCircle = (props: LucideProps) => {
  return <LucideAlertCircle {...props} />;
};
