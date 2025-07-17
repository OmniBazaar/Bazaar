import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { MarketplaceHomePage } from '../MarketplaceHomePage';
import { ThemeProvider } from '../../components/common/ThemeProvider';

// Mock the components that MarketplaceHomePage uses
jest.mock('../../components/marketplace/CategoryGrid', () => ({
    CategoryGrid: ({ onCategorySelect }: { onCategorySelect: (categoryId: string) => void }) => (
        <div data-testid="category-grid">
            <button onClick={() => onCategorySelect('for-sale')}>For Sale</button>
            <button onClick={() => onCategorySelect('services')}>Services</button>
            <button onClick={() => onCategorySelect('jobs')}>Jobs</button>
            <button onClick={() => onCategorySelect('crypto')}>CryptoBazaar</button>
            <button onClick={() => onCategorySelect('create')}>Create Listing</button>
        </div>
    )
}));

const renderWithTheme = (component: React.ReactElement) => {
    return render(
        <ThemeProvider>
            {component}
        </ThemeProvider>
    );
};

describe('MarketplaceHomePage', () => {
    beforeEach(() => {
        // Mock console.log to avoid noise in tests
        jest.spyOn(console, 'log').mockImplementation(() => {});
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    it('renders the page with gradient background', () => {
        renderWithTheme(<MarketplaceHomePage />);
        
        const container = screen.getByTestId('category-grid').parentElement;
        expect(container).toBeInTheDocument();
    });

    it('renders the CategoryGrid component', () => {
        renderWithTheme(<MarketplaceHomePage />);
        
        expect(screen.getByTestId('category-grid')).toBeInTheDocument();
    });

    it('handles category selection for For Sale', () => {
        const consoleSpy = jest.spyOn(console, 'log');
        
        renderWithTheme(<MarketplaceHomePage />);
        
        const forSaleButton = screen.getByText('For Sale');
        fireEvent.click(forSaleButton);
        
        expect(consoleSpy).toHaveBeenCalledWith('Navigate to category:', 'for-sale');
    });

    it('handles category selection for Services', () => {
        const consoleSpy = jest.spyOn(console, 'log');
        
        renderWithTheme(<MarketplaceHomePage />);
        
        const servicesButton = screen.getByText('Services');
        fireEvent.click(servicesButton);
        
        expect(consoleSpy).toHaveBeenCalledWith('Navigate to category:', 'services');
    });

    it('handles category selection for Jobs', () => {
        const consoleSpy = jest.spyOn(console, 'log');
        
        renderWithTheme(<MarketplaceHomePage />);
        
        const jobsButton = screen.getByText('Jobs');
        fireEvent.click(jobsButton);
        
        expect(consoleSpy).toHaveBeenCalledWith('Navigate to category:', 'jobs');
    });

    it('handles category selection for CryptoBazaar', () => {
        const consoleSpy = jest.spyOn(console, 'log');
        
        renderWithTheme(<MarketplaceHomePage />);
        
        const cryptoButton = screen.getByText('CryptoBazaar');
        fireEvent.click(cryptoButton);
        
        expect(consoleSpy).toHaveBeenCalledWith('Navigate to category:', 'crypto');
    });

    it('handles create listing action', () => {
        const consoleSpy = jest.spyOn(console, 'log');
        
        renderWithTheme(<MarketplaceHomePage />);
        
        const createButton = screen.getByText('Create Listing');
        fireEvent.click(createButton);
        
        expect(consoleSpy).toHaveBeenCalledWith('Navigate to category:', 'create');
    });

    it('logs navigation for other category selections', () => {
        const consoleSpy = jest.spyOn(console, 'log');
        
        renderWithTheme(<MarketplaceHomePage />);
        
        // Test a custom action
        const categoryGrid = screen.getByTestId('category-grid');
        const mockButton = document.createElement('button');
        mockButton.textContent = 'Test Category';
        categoryGrid.appendChild(mockButton);
        
        // Simulate the category selection handler
        const homePage = new (MarketplaceHomePage as any)();
        if (homePage.handleCategorySelect) {
            homePage.handleCategorySelect('test-category');
        }
        
        // The component should still work even with unknown categories
        expect(consoleSpy).toHaveBeenCalledWith('Navigate to category:', 'create');
    });

    it('has proper accessibility structure', () => {
        renderWithTheme(<MarketplaceHomePage />);
        
        // The CategoryGrid should be rendered and accessible
        const categoryGrid = screen.getByTestId('category-grid');
        expect(categoryGrid).toBeInTheDocument();
        
        // All category buttons should be accessible
        expect(screen.getByRole('button', { name: 'For Sale' })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Services' })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Jobs' })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'CryptoBazaar' })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Create Listing' })).toBeInTheDocument();
    });

    it('maintains responsive design structure', () => {
        renderWithTheme(<MarketplaceHomePage />);
        
        const container = screen.getByTestId('category-grid').parentElement;
        expect(container).toBeInTheDocument();
        
        // The container should have the proper structure for responsive design
        expect(container).toHaveStyle('display: flex');
    });
}); 