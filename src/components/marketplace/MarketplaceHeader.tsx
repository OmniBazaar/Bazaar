import React from 'react';
import styled from 'styled-components';

const Header = styled.header`
  background: ${props => props.theme.colors.background};
  border-bottom: 1px solid ${props => props.theme.colors.border};
  padding: 1rem 2rem;
`;

const Container = styled.div`
  max-width: 1440px;
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const Logo = styled.div`
  font-size: 1.5rem;
  font-weight: bold;
  color: ${props => props.theme.colors.primary};
`;

const Nav = styled.nav`
  display: flex;
  gap: 2rem;
`;

const NavLink = styled.a`
  color: ${props => props.theme.colors.text};
  text-decoration: none;
  font-size: 0.875rem;
  transition: color 0.2s ease;

  &:hover {
    color: ${props => props.theme.colors.primary};
  }
`;

const Actions = styled.div`
  display: flex;
  gap: 1rem;
  align-items: center;
`;

const Button = styled.button`
  padding: 0.5rem 1rem;
  background: ${props => props.theme.colors.primary};
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: opacity 0.2s ease;

  &:hover {
    opacity: 0.9;
  }
`;

interface MarketplaceHeaderProps {
    onCreateListing?: () => void;
}

export const MarketplaceHeader: React.FC<MarketplaceHeaderProps> = ({
    onCreateListing,
}) => {
    return (
        <Header>
            <Container>
                <Logo>OmniBazaar</Logo>
                <Nav>
                    <NavLink href="/marketplace">Browse</NavLink>
                    <NavLink href="/marketplace/categories">Categories</NavLink>
                    <NavLink href="/marketplace/trending">Trending</NavLink>
                    <NavLink href="/marketplace/nearby">Nearby</NavLink>
                </Nav>
                <Actions>
                    <Button onClick={onCreateListing}>
                        Create Listing
                    </Button>
                </Actions>
            </Container>
        </Header>
    );
}; 