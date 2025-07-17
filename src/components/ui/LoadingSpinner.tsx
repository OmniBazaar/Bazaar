import React from 'react';
import styled, { keyframes } from 'styled-components';

const spin = keyframes`
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
`;

const Spinner = styled.div`
    border: 4px solid #f3f3f3;
    border-top: 4px solid #007bff;
    border-radius: 50%;
    width: 40px;
    height: 40px;
    animation: ${spin} 1s linear infinite;
    margin: 1rem auto;
`;

const Container = styled.div`
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 2rem;
`;

interface LoadingSpinnerProps {
    className?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ className }) => {
    return (
        <Container className={className} data-testid="loading-spinner">
            <Spinner />
        </Container>
    );
}; 