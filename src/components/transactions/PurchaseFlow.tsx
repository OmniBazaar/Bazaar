import React, { useState } from 'react';
import styled from 'styled-components';
import { ListingMetadata } from '../../types/listing';
import { SecureSend } from '../SecureSend/SecureSend';

interface PurchaseFlowProps {
    listing: ListingMetadata;
    onComplete: (transactionId: string) => void;
    onCancel: () => void;
}

const Container = styled.div`
    max-width: 600px;
    margin: 0 auto;
    padding: ${props => props.theme.spacing[6]};
`;

const Header = styled.div`
    text-align: center;
    margin-bottom: ${props => props.theme.spacing[6]};
`;

const Title = styled.h2`
    color: ${props => props.theme.colors.text.primary};
    margin-bottom: ${props => props.theme.spacing[2]};
`;

const Subtitle = styled.p`
    color: ${props => props.theme.colors.text.secondary};
`;

const ListingPreview = styled.div`
    display: flex;
    gap: ${props => props.theme.spacing[4]};
    padding: ${props => props.theme.spacing[4]};
    background: ${props => props.theme.colors.surface};
    border-radius: ${props => props.theme.borderRadius.lg};
    margin-bottom: ${props => props.theme.spacing[6]};
`;

const ListingImage = styled.img`
    width: 80px;
    height: 80px;
    object-fit: cover;
    border-radius: ${props => props.theme.borderRadius.base};
`;

const ListingDetails = styled.div`
    flex: 1;
`;

const ListingTitle = styled.h3`
    margin: 0 0 ${props => props.theme.spacing[1]};
    color: ${props => props.theme.colors.text.primary};
`;

const ListingPrice = styled.div`
    font-size: ${props => props.theme.typography.fontSize.lg};
    font-weight: ${props => props.theme.typography.fontWeight.semibold};
    color: ${props => props.theme.colors.primary};
    margin-bottom: ${props => props.theme.spacing[2]};
`;

const ListingSeller = styled.div`
    color: ${props => props.theme.colors.text.secondary};
    font-size: ${props => props.theme.typography.fontSize.sm};
`;

const StepIndicator = styled.div`
    display: flex;
    justify-content: center;
    margin-bottom: ${props => props.theme.spacing[6]};
`;

const Step = styled.div<{ $active: boolean; $completed: boolean }>`
    display: flex;
    align-items: center;
    gap: ${props => props.theme.spacing[2]};
    padding: ${props => props.theme.spacing[2]} ${props => props.theme.spacing[4]};
    border-radius: ${props => props.theme.borderRadius.full};
    background: ${props => {
        if (props.$completed) return props.theme.colors.success;
        if (props.$active) return props.theme.colors.primary;
        return props.theme.colors.backgroundAlt;
    }};
    color: ${props => {
        if (props.$completed || props.$active) return props.theme.colors.background;
        return props.theme.colors.text.secondary;
    }};
    margin: 0 ${props => props.theme.spacing[1]};
`;

const StepNumber = styled.div`
    width: 24px;
    height: 24px;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.2);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: ${props => props.theme.typography.fontSize.sm};
    font-weight: ${props => props.theme.typography.fontWeight.bold};
`;

const ButtonGroup = styled.div`
    display: flex;
    gap: ${props => props.theme.spacing[3]};
    justify-content: center;
    margin-top: ${props => props.theme.spacing[6]};
`;

const Button = styled.button<{ $primary?: boolean }>`
    padding: ${props => props.theme.spacing[3]} ${props => props.theme.spacing[6]};
    border: none;
    border-radius: ${props => props.theme.borderRadius.base};
    font-weight: ${props => props.theme.typography.fontWeight.medium};
    cursor: pointer;
    transition: all ${props => props.theme.transitions.base};
    
    ${props => props.$primary ? `
        background: ${props.theme.colors.primary};
        color: white;
        &:hover {
            background: ${props.theme.colors.primaryHover};
        }
    ` : `
        background: ${props.theme.colors.backgroundAlt};
        color: ${props.theme.colors.text.primary};
        border: 1px solid ${props.theme.colors.border};
        &:hover {
            background: ${props.theme.colors.hover};
        }
    `}
`;

export function PurchaseFlow({ listing, onComplete, onCancel }: PurchaseFlowProps) {
    const [currentStep, setCurrentStep] = useState(1);
    const [useSecureSend, setUseSecureSend] = useState(true);

    const steps = [
        { number: 1, label: 'Review', completed: currentStep > 1 },
        { number: 2, label: 'Payment', completed: currentStep > 2 },
        { number: 3, label: 'Complete', completed: currentStep > 3 },
    ];

    const handleSecureSendSuccess = () => {
        setCurrentStep(3);
        // In a real implementation, this would return the actual transaction ID
        onComplete('txn_' + Date.now());
    };

    const handleDirectPurchase = () => {
        // Handle direct purchase without SecureSend
        setCurrentStep(2);
        // Simulate payment processing
        setTimeout(() => {
            setCurrentStep(3);
            onComplete('txn_' + Date.now());
        }, 1000);
    };

    const renderStep = () => {
        switch (currentStep) {
            case 1:
                return (
                    <div>
                        <Header>
                            <Title>Review Purchase</Title>
                            <Subtitle>Please review the details of your purchase</Subtitle>
                        </Header>
                        
                        <ListingPreview>
                            <ListingImage src={listing.images[0]} alt={listing.title} />
                            <ListingDetails>
                                <ListingTitle>{listing.title}</ListingTitle>
                                <ListingPrice>{listing.price} {listing.currency}</ListingPrice>
                                <ListingSeller>Seller: {listing.seller.name}</ListingSeller>
                            </ListingDetails>
                        </ListingPreview>

                        <div style={{ marginBottom: '24px' }}>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                                <input
                                    type="checkbox"
                                    checked={useSecureSend}
                                    onChange={(e) => setUseSecureSend(e.target.checked)}
                                />
                                Use SecureSend for transaction protection (recommended)
                            </label>
                            {useSecureSend && (
                                <p style={{ fontSize: '14px', color: '#666', marginLeft: '24px' }}>
                                    SecureSend provides escrow protection with a 1% fee. Funds are held safely until transaction completion.
                                </p>
                            )}
                        </div>

                        <ButtonGroup>
                            <Button onClick={onCancel}>Cancel</Button>
                            <Button 
                                $primary 
                                onClick={() => useSecureSend ? setCurrentStep(2) : handleDirectPurchase()}
                            >
                                {useSecureSend ? 'Continue with SecureSend' : 'Purchase Now'}
                            </Button>
                        </ButtonGroup>
                    </div>
                );

            case 2:
                return useSecureSend ? (
                    <SecureSend
                        listingId={listing.cid ?? ''}
                        sellerAddress={listing.seller.id}
                        amount={listing.price.toString()}
                        onSuccess={handleSecureSendSuccess}
                        onCancel={() => setCurrentStep(1)}
                    />
                ) : (
                    <div>
                        <Header>
                            <Title>Processing Payment</Title>
                            <Subtitle>Please wait while we process your payment...</Subtitle>
                        </Header>
                    </div>
                );

            case 3:
                return (
                    <div>
                        <Header>
                            <Title>Purchase Complete!</Title>
                            <Subtitle>Your transaction has been processed successfully</Subtitle>
                        </Header>
                        
                        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
                            <div style={{ fontSize: '48px', marginBottom: '16px' }}>✅</div>
                            <p>You will receive an email confirmation shortly.</p>
                            <p>The seller has been notified and will process your order.</p>
                        </div>

                        <ButtonGroup>
                            <Button $primary onClick={() => onComplete('txn_' + Date.now())}>
                                Continue Shopping
                            </Button>
                        </ButtonGroup>
                    </div>
                );

            default:
                return null;
        }
    };

    return (
        <Container>
            <StepIndicator>
                {steps.map((step) => (
                    <Step 
                        key={step.number}
                        $active={currentStep === step.number}
                        $completed={step.completed}
                    >
                        <StepNumber>{step.number}</StepNumber>
                        {step.label}
                    </Step>
                ))}
            </StepIndicator>
            
            {renderStep()}
        </Container>
    );
} 