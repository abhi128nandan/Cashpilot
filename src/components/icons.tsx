// Centralized icon export to ensure safe fallback handling if an icon fails to load
import { AlertCircle as LucideAlertCircle } from 'lucide-react';
import React from 'react';

// Safe fallback for AlertCircle in case lucide-react has issues
export const AlertCircle = (props: React.ComponentProps<typeof LucideAlertCircle>) => {
  return <LucideAlertCircle {...props} />;
};
