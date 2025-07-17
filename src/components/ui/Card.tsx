import React from 'react';
import styled from 'styled-components';

interface CardProps {
    children: React.ReactNode;
    className?: string;
}

const StyledCard = styled.div`
    background: white;
    border: 1px solid #ddd;
    border-radius: 8px;
    padding: 1rem;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`;

export const Card: React.FC<CardProps> = ({ children, className }) => {
    return <StyledCard className={className}>{children}</StyledCard>;
}; 