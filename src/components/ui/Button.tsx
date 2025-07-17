import React from 'react';
import styled from 'styled-components';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    primary?: boolean;
    children: React.ReactNode;
}

const StyledButton = styled.button<{ $primary?: boolean }>`
    padding: 0.5rem 1rem;
    border: 1px solid ${props => props.$primary ? '#007bff' : '#ccc'};
    background: ${props => props.$primary ? '#007bff' : 'white'};
    color: ${props => props.$primary ? 'white' : '#333'};
    border-radius: 4px;
    cursor: pointer;
    
    &:hover {
        opacity: 0.8;
    }
    
    &:disabled {
        opacity: 0.5;
        cursor: not-allowed;
    }
`;

export const Button: React.FC<ButtonProps> = ({ primary, children, ...props }) => {
    return (
        <StyledButton $primary={primary ?? false} {...props}>
            {children}
        </StyledButton>
    );
}; 