
import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

export const Card: React.FC<CardProps> = ({ children, className = '', onClick }) => {
  return (
    // FIX: Added onClick handler to the div element.
    <div className={`bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden p-6 ${className}`} onClick={onClick}>
      {children}
    </div>
  );
};

interface CardTitleProps {
    children: React.ReactNode;
}

export const CardTitle: React.FC<CardTitleProps> = ({ children }) => {
    return (
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">{children}</h3>
    );
}
