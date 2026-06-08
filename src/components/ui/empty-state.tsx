import React from 'react';

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}

export default function EmptyState({ icon, title, description, action, className = '' }: EmptyStateProps) {
  return (
    <div 
      className={className}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '48px 24px',
        textAlign: 'center',
        background: 'hsla(228, 20%, 16%, 0.4)',
        border: '1px solid hsla(228, 20%, 40%, 0.2)',
        borderRadius: '16px',
        height: '100%',
        minHeight: '250px'
      }}
    >
      {icon && (
        <div style={{ color: 'hsla(220, 14%, 68%, 0.6)', marginBottom: '16px' }}>
          {icon}
        </div>
      )}
      <h3 style={{ margin: '0 0 8px 0', fontSize: '18px', fontWeight: 500, color: '#fff' }}>
        {title}
      </h3>
      {description && (
        <p style={{ margin: '0 0 24px 0', fontSize: '14px', color: 'hsla(220, 14%, 68%, 1)', maxWidth: '300px' }}>
          {description}
        </p>
      )}
      {action && <div>{action}</div>}
    </div>
  );
}
