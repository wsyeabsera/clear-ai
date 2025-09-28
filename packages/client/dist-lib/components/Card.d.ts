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
declare const Card: React.FC<CardProps>;
export default Card;
//# sourceMappingURL=Card.d.ts.map