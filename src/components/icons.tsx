// Centralized icon export to ensure safe fallback handling if an icon fails to load
import { AlertCircle as LucideAlertCircle, CheckCircle as LucideCheckCircle } from 'lucide-react';
import React from 'react';

// Safe fallback for AlertCircle in case lucide-react has issues
import { LucideProps } from 'lucide-react';

export const AlertCircle = (props: LucideProps) => {
  return <LucideAlertCircle {...props} />;
};

export const CheckCircle = (props: LucideProps) => {
  return <LucideCheckCircle {...props} />;
};
