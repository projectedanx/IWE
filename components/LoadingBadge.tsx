
import React from 'react';

interface LoadingBadgeProps {
  loading: boolean;
  label?: string;
  className?: string;
}

const LoadingBadge: React.FC<LoadingBadgeProps> = ({ loading, label = 'loading...', className = '' }) => {
  if (!loading) return null;
  return (
    <span className={`inline-flex items-center text-xs text-gray-500 ${className}`}>
      <span className="mr-1.5 h-2 w-2 rounded-full bg-gray-400 animate-pulse" />
      {label}
    </span>
  );
};

export default LoadingBadge;
