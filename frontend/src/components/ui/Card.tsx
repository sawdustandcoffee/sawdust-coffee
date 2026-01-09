import React from 'react';

interface CardProps {
  title?: string;
  children: React.ReactNode;
  className?: string;
  headerAction?: React.ReactNode;
}

export default function Card({
  title,
  children,
  className = '',
  headerAction,
}: CardProps) {
  return (
    <div className={`bg-white rounded-lg shadow ${className}`}>
      {(title || headerAction) && (
        <div className="flex items-center justify-between px-6 py-4 border-b">
          {title && <h3 className="text-lg font-semibold text-gray-900">{title}</h3>}
          {headerAction && <div>{headerAction}</div>}
        </div>
      )}
      <div className="p-6">{children}</div>
    </div>
  );
}
