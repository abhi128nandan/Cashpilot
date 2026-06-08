import React from 'react';

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
}

export default function Skeleton({ className = '', style, ...props }: SkeletonProps) {
  return (
    <div 
      className={className} 
      style={{
        ...style,
        background: 'linear-gradient(90deg, hsla(228, 20%, 20%, 0.4) 25%, hsla(228, 20%, 30%, 0.6) 50%, hsla(228, 20%, 20%, 0.4) 75%)',
        backgroundSize: '400% 100%',
        animation: 'shimmer 1.5s infinite',
        borderRadius: '16px'
      }} 
      {...props} 
    />
  );
}
