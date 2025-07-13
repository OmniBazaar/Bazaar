import React, { useState } from 'react';
import styled from 'styled-components';
import { CategoryGrid } from '../components/marketplace/CategoryGrid';
import { useListings } from '../hooks/useListings';

const Container = styled.div`
    min-height: 100vh;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
`;

const Navigation = styled.nav`
    background: rgba(255, 255, 255, 0.1);
    backdrop-filter: blur(10px);
    padding: ${props => props.theme.spacing[4]} ${props => props.theme.spacing[5]};
    position: sticky;
    top: 0;
    z-index: 100;
`;

const NavContent = styled.div`
    max-width: 1200px;
    margin: 0 auto;
    display: flex;
    align-items: center;
    justify-content: space-between;
`;

const Logo = styled.div`
    display: flex;
    align-items: center;
    gap: ${props => props.theme.spacing[3]};
    color: white;
    font-size: ${props => props.theme.typography.fontSize.xl};
    font-weight: ${props => props.theme.typography.fontWeight.bold};
`;

const LogoIcon = styled.div`
    width: 40px;
    height: 40px;
    background: rgba(255, 255, 255, 0.2);
    border-radius: ${props => props.theme.borderRadius.lg};
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: ${props => props.theme.typography.fontSize.xl};
`;

const NavActions = styled.div`
    display: flex;
    gap: ${props => props.theme.spacing[4]};
    align-items: center;
`;

const NavButton = styled.button<{ $variant?: 'primary' | 'secondary' }>`
    padding: ${props => props.theme.spacing[2]} ${props => props.theme.spacing[4]};
    border: none;
    border-radius: ${props => props.theme.borderRadius.lg};
    font-weight: ${props => props.theme.typography.fontWeight.medium};
    cursor: pointer;
    transition: all 0.3s ease;
    
    ${props => props.$variant === 'primary' ? `
        background: rgba(255, 255, 255, 0.9);
        color: #667eea;
        &:hover {
            background: white;
        }
    ` : `
        background: rgba(255, 255, 255, 0.1);
        color: white;
        border: 1px solid rgba(255, 255, 255, 0.3);
        &:hover {
            background: rgba(255, 255, 255, 0.2);
        }
    `}
`;

const ContentWrapper = styled.div`
    position: relative;
    z-index: 1;
`;

const StatsSection = styled.div`
    background: rgba(255, 255, 255, 0.1);
    backdrop-filter: blur(10px);
    border-radius: ${props => props.theme.borderRadius.xl};
    padding: ${props => props.theme.spacing[8]};
    margin: ${props => props.theme.spacing[8]} auto;
    max-width: 1200px;
    margin-left: ${props => props.theme.spacing[5]};
    margin-right: ${props => props.theme.spacing[5]};
`;

const StatsTitle = styled.h2`
    text-align: center;
    color: white;
    font-size: ${props => props.theme.typography.fontSize['2xl']};
    font-weight: ${props => props.theme.typography.fontWeight.semibold};
    margin-bottom: ${props => props.theme.spacing[6]};
`;

const StatsGrid = styled.div`
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: ${props => props.theme.spacing[6]};
`;

const StatItem = styled.div`
    text-align: center;
    color: white;
`;

const StatValue = styled.div`
    font-size: ${props => props.theme.typography.fontSize['3xl']};
    font-weight: ${props => props.theme.typography.fontWeight.bold};
    margin-bottom: ${props => props.theme.spacing[2]};
`;

const StatLabel = styled.div`
    font-size: ${props => props.theme.typography.fontSize.sm};
    opacity: 0.8;
`;

const FeatureSection = styled.div`
    background: rgba(255, 255, 255, 0.1);
    backdrop-filter: blur(10px);
    border-radius: ${props => props.theme.borderRadius.xl};
    padding: ${props => props.theme.spacing[8]};
    margin: ${props => props.theme.spacing[8]} auto;
    max-width: 1200px;
    margin-left: ${props => props.theme.spacing[5]};
    margin-right: ${props => props.theme.spacing[5]};
`;

const FeatureGrid = styled.div`
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: ${props => props.theme.spacing[6]};
`;

const FeatureCard = styled.div`
    background: rgba(255, 255, 255, 0.1);
    border-radius: ${props => props.theme.borderRadius.lg};
    padding: ${props => props.theme.spacing[6]};
    color: white;
`;

const FeatureIcon = styled.div`
    font-size: ${props => props.theme.typography.fontSize['2xl']};
    margin-bottom: ${props => props.theme.spacing[3]};
`;

const FeatureTitle = styled.h3`
    font-size: ${props => props.theme.typography.fontSize.lg};
    font-weight: ${props => props.theme.typography.fontWeight.semibold};
    margin-bottom: ${props => props.theme.spacing[2]};
`;

const FeatureDescription = styled.p`
    font-size: ${props => props.theme.typography.fontSize.sm};
    opacity: 0.9;
    line-height: 1.5;
`;

export function MarketplaceHomePage() {
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
    const { listings } = useListings();

    const handleCategorySelect = (categoryId: string) => {
        console.log('Selected category:', categoryId);
        // Here you would typically navigate to the category page
        // or update the view to show listings for that category
        setSelectedCategory(categoryId);
        
        // Example navigation logic (would use React Router in real app)
        switch (categoryId) {
            case 'create':
                console.log('Navigate to create listing page');
                break;
            case 'my-listings':
                console.log('Navigate to my listings page');
                break;
            case 'search':
                console.log('Navigate to advanced search');
                break;
            case 'featured':
                console.log('Navigate to featured listings');
                break;
            default:
                console.log('Navigate to category listings:', categoryId);
        }
    };

    return (
        <Container>
            <Navigation>
                <NavContent>
                    <Logo>
                        <LogoIcon>🌐</LogoIcon>
                        OmniBazaar
                    </Logo>
                    <NavActions>
                        <NavButton>Wallet</NavButton>
                        <NavButton>SecureSend</NavButton>
                        <NavButton $variant="primary">Sign In</NavButton>
                    </NavActions>
                </NavContent>
            </Navigation>

            <ContentWrapper>
                <CategoryGrid onCategorySelect={handleCategorySelect} />

                <StatsSection>
                    <StatsTitle>Marketplace Statistics</StatsTitle>
                    <StatsGrid>
                        <StatItem>
                            <StatValue>5,660</StatValue>
                            <StatLabel>Active Listings</StatLabel>
                        </StatItem>
                        <StatItem>
                            <StatValue>1,234</StatValue>
                            <StatLabel>Verified Sellers</StatLabel>
                        </StatItem>
                        <StatItem>
                            <StatValue>₿2,847</StatValue>
                            <StatLabel>Total Volume</StatLabel>
                        </StatItem>
                        <StatItem>
                            <StatValue>99.2%</StatValue>
                            <StatLabel>Success Rate</StatLabel>
                        </StatItem>
                    </StatsGrid>
                </StatsSection>

                <FeatureSection>
                    <StatsTitle>Why Choose OmniBazaar?</StatsTitle>
                    <FeatureGrid>
                        <FeatureCard>
                            <FeatureIcon>🛡️</FeatureIcon>
                            <FeatureTitle>SecureSend Protection</FeatureTitle>
                            <FeatureDescription>
                                Every transaction is protected by our escrow service. Your funds are safe until you receive your item and confirm satisfaction.
                            </FeatureDescription>
                        </FeatureCard>
                        <FeatureCard>
                            <FeatureIcon>🌍</FeatureIcon>
                            <FeatureTitle>Global Marketplace</FeatureTitle>
                            <FeatureDescription>
                                Buy and sell with anyone, anywhere. Support for multiple cryptocurrencies and traditional payment methods.
                            </FeatureDescription>
                        </FeatureCard>
                        <FeatureCard>
                            <FeatureIcon>⚡</FeatureIcon>
                            <FeatureTitle>Fast & Decentralized</FeatureTitle>
                            <FeatureDescription>
                                Built on blockchain technology for fast, secure, and transparent transactions without intermediaries.
                            </FeatureDescription>
                        </FeatureCard>
                        <FeatureCard>
                            <FeatureIcon>💎</FeatureIcon>
                            <FeatureTitle>Premium Features</FeatureTitle>
                            <FeatureDescription>
                                Advanced search, reputation system, community policing, and integrated wallet for the complete experience.
                            </FeatureDescription>
                        </FeatureCard>
                    </FeatureGrid>
                </FeatureSection>
            </ContentWrapper>
        </Container>
    );
} 