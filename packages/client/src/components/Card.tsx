import React from 'react';

export interface CardProps {
  /**
   * The content to display inside the card
   */
  children: React.ReactNode;
  /**
   * The title of the card
   */
  title?: string;
  /**
   * Whether the card has a shadow
   */
  shadow?: boolean;
  /**
   * Whether the card is clickable
   */
  clickable?: boolean;
  /**
   * Click handler
   */
  onClick?: () => void;
  /**
   * Additional CSS classes
   */
  className?: string;
}

const Card: React.FC<CardProps> = ({
  children,
  title,
  shadow = true,
  clickable = false,
  onClick,
  className = '',
}) => {
  const baseClasses = 'bg-white rounded-lg border border-gray-200 p-6';
  const shadowClasses = shadow ? 'shadow-sm' : '';
  const clickableClasses = clickable ? 'cursor-pointer hover:shadow-md transition-shadow' : '';
  
  const classes = `${baseClasses} ${shadowClasses} ${clickableClasses} ${className}`.trim();
  
  return (
    <div className={classes} onClick={onClick}>
      {title && (
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          {title}
        </h3>
      )}
      {children}
    </div>
  );
};

export default Card;
