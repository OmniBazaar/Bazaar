import React from 'react';
import styled from 'styled-components';

const StyledInput = styled.input`
    padding: 0.5rem;
    border: 1px solid #ddd;
    border-radius: 4px;
    font-size: 1rem;
    
    &:focus {
        outline: none;
        border-color: #0066cc;
    }
`;

export const Input: React.FC<React.InputHTMLAttributes<HTMLInputElement>> = (props) => {
    return <StyledInput {...props} />;
}; 