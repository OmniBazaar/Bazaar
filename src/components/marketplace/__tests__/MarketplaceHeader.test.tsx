import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { MarketplaceHeader } from '../MarketplaceHeader';
import { ThemeProvider } from '../../common/ThemeProvider';

const renderWithTheme = (component: React.ReactElement) => {
    return render(
        <ThemeProvider>
            {component}
        </ThemeProvider>
    );
};

describe('MarketplaceHeader', () => {
    it('renders the OmniBazaar logo', () => {
        renderWithTheme(<MarketplaceHeader />);
        
        expect(screen.getByText('OmniBazaar')).toBeInTheDocument();
    });

    it('renders all navigation links', () => {
        renderWithTheme(<MarketplaceHeader />);
        
        expect(screen.getByText('Browse')).toBeInTheDocument();
        expect(screen.getByText('Categories')).toBeInTheDocument();
        expect(screen.getByText('Trending')).toBeInTheDocument();
        expect(screen.getByText('Nearby')).toBeInTheDocument();
    });

    it('renders navigation links with correct href attributes', () => {
        renderWithTheme(<MarketplaceHeader />);
        
        expect(screen.getByText('Browse')).toHaveAttribute('href', '/marketplace');
        expect(screen.getByText('Categories')).toHaveAttribute('href', '/marketplace/categories');
        expect(screen.getByText('Trending')).toHaveAttribute('href', '/marketplace/trending');
        expect(screen.getByText('Nearby')).toHaveAttribute('href', '/marketplace/nearby');
    });

    it('renders the Create Listing button', () => {
        renderWithTheme(<MarketplaceHeader />);
        
        const createButton = screen.getByRole('button', { name: /create listing/i });
        expect(createButton).toBeInTheDocument();
    });

    it('calls onCreateListing when Create Listing button is clicked', () => {
        const mockOnCreateListing = jest.fn();
        
        renderWithTheme(<MarketplaceHeader onCreateListing={mockOnCreateListing} />);
        
        const createButton = screen.getByRole('button', { name: /create listing/i });
        fireEvent.click(createButton);
        
        expect(mockOnCreateListing).toHaveBeenCalledTimes(1);
    });

    it('does not crash when onCreateListing is not provided', () => {
        renderWithTheme(<MarketplaceHeader />);
        
        const createButton = screen.getByRole('button', { name: /create listing/i });
        fireEvent.click(createButton);
        
        // Should not crash
        expect(createButton).toBeInTheDocument();
    });

    it('has proper header structure', () => {
        renderWithTheme(<MarketplaceHeader />);
        
        const header = screen.getByRole('banner');
        expect(header).toBeInTheDocument();
    });

    it('has proper navigation structure', () => {
        renderWithTheme(<MarketplaceHeader />);
        
        const nav = screen.getByRole('navigation');
        expect(nav).toBeInTheDocument();
        
        // Check that all navigation items are within the nav element
        const navLinks = screen.getAllByRole('link');
        expect(navLinks).toHaveLength(4); // Browse, Categories, Trending, Nearby
    });

    it('applies hover styles to navigation links', () => {
        renderWithTheme(<MarketplaceHeader />);
        
        const browseLink = screen.getByText('Browse');
        
        // The link should have proper styling
        expect(browseLink).toHaveStyle('text-decoration: none');
    });

    it('renders with responsive layout structure', () => {
        renderWithTheme(<MarketplaceHeader />);
        
        const header = screen.getByRole('banner');
        
        // Should contain the container div with proper layout
        const container = header.firstChild;
        expect(container).toBeInTheDocument();
    });

    it('positions logo, navigation, and actions correctly', () => {
        renderWithTheme(<MarketplaceHeader />);
        
        const logo = screen.getByText('OmniBazaar');
        const nav = screen.getByRole('navigation');
        const createButton = screen.getByRole('button', { name: /create listing/i });
        
        expect(logo).toBeInTheDocument();
        expect(nav).toBeInTheDocument();
        expect(createButton).toBeInTheDocument();
        
        // All elements should be present in the header
        const header = screen.getByRole('banner');
        expect(header).toContainElement(logo);
        expect(header).toContainElement(nav);
        expect(header).toContainElement(createButton);
    });

    it('maintains consistent branding', () => {
        renderWithTheme(<MarketplaceHeader />);
        
        const logo = screen.getByText('OmniBazaar');
        
        // Logo should be styled as expected
        expect(logo).toHaveStyle('font-weight: bold');
    });

    it('has accessible button for screen readers', () => {
        renderWithTheme(<MarketplaceHeader />);
        
        const createButton = screen.getByRole('button', { name: /create listing/i });
        
        // Button should be accessible
        expect(createButton).toBeInTheDocument();
        expect(createButton).toHaveAttribute('type', 'button');
    });
}); 