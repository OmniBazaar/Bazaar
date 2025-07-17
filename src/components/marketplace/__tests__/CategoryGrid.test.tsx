import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { CategoryGrid } from '../CategoryGrid';
import { ThemeProvider } from '../../common/ThemeProvider';

const renderWithTheme = (component: React.ReactElement) => {
    return render(
        <ThemeProvider>
            {component}
        </ThemeProvider>
    );
};

describe('CategoryGrid', () => {
    const mockOnCategorySelect = jest.fn();

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('renders the main title', () => {
        renderWithTheme(<CategoryGrid onCategorySelect={mockOnCategorySelect} />);
        expect(screen.getByText('OmniBazaar Marketplace')).toBeInTheDocument();
    });

    it('renders the subtitle', () => {
        renderWithTheme(<CategoryGrid onCategorySelect={mockOnCategorySelect} />);
        expect(screen.getByText('Discover amazing products, services, and opportunities')).toBeInTheDocument();
    });

    it('renders the search bar', () => {
        renderWithTheme(<CategoryGrid onCategorySelect={mockOnCategorySelect} />);
        expect(screen.getByPlaceholderText('Search for anything...')).toBeInTheDocument();
    });

    it('renders all four main categories', () => {
        renderWithTheme(<CategoryGrid onCategorySelect={mockOnCategorySelect} />);
        
        expect(screen.getByText('For Sale')).toBeInTheDocument();
        expect(screen.getByText('Services')).toBeInTheDocument();
        expect(screen.getByText('Jobs')).toBeInTheDocument();
        expect(screen.getByText('CryptoBazaar')).toBeInTheDocument();
    });

    it('renders category descriptions', () => {
        renderWithTheme(<CategoryGrid onCategorySelect={mockOnCategorySelect} />);
        
        expect(screen.getByText('Buy and sell physical goods, from antiques to vehicles')).toBeInTheDocument();
        expect(screen.getByText('Professional services and skilled trades')).toBeInTheDocument();
        expect(screen.getByText('Find employment opportunities and post job openings')).toBeInTheDocument();
        expect(screen.getByText('Cryptocurrency trading and crypto-specific services')).toBeInTheDocument();
    });

    it('displays category statistics', () => {
        renderWithTheme(<CategoryGrid onCategorySelect={mockOnCategorySelect} />);
        
        expect(screen.getByText('2,847 listings')).toBeInTheDocument();
        expect(screen.getByText('1,523 listings')).toBeInTheDocument();
        expect(screen.getByText('834 listings')).toBeInTheDocument();
        expect(screen.getByText('456 listings')).toBeInTheDocument();
    });

    it('displays category status labels', () => {
        renderWithTheme(<CategoryGrid onCategorySelect={mockOnCategorySelect} />);
        
        expect(screen.getByText('Active now')).toBeInTheDocument();
        expect(screen.getByText('Available')).toBeInTheDocument();
        expect(screen.getByText('Updated daily')).toBeInTheDocument();
        expect(screen.getByText('Live rates')).toBeInTheDocument();
    });

    it('calls onCategorySelect when For Sale category is clicked', () => {
        renderWithTheme(<CategoryGrid onCategorySelect={mockOnCategorySelect} />);
        
        const forSaleCard = screen.getByText('For Sale').parentElement;
        if (forSaleCard) {
            fireEvent.click(forSaleCard);
        }
        
        expect(mockOnCategorySelect).toHaveBeenCalledWith('for-sale');
    });

    it('calls onCategorySelect when Services category is clicked', () => {
        renderWithTheme(<CategoryGrid onCategorySelect={mockOnCategorySelect} />);
        
        const servicesCard = screen.getByText('Services').parentElement;
        if (servicesCard) {
            fireEvent.click(servicesCard);
        }
        
        expect(mockOnCategorySelect).toHaveBeenCalledWith('services');
    });

    it('calls onCategorySelect when Jobs category is clicked', () => {
        renderWithTheme(<CategoryGrid onCategorySelect={mockOnCategorySelect} />);
        
        const jobsCard = screen.getByText('Jobs').parentElement;
        if (jobsCard) {
            fireEvent.click(jobsCard);
        }
        
        expect(mockOnCategorySelect).toHaveBeenCalledWith('jobs');
    });

    it('calls onCategorySelect when CryptoBazaar category is clicked', () => {
        renderWithTheme(<CategoryGrid onCategorySelect={mockOnCategorySelect} />);
        
        const cryptoCard = screen.getByText('CryptoBazaar').parentElement;
        if (cryptoCard) {
            fireEvent.click(cryptoCard);
        }
        
        expect(mockOnCategorySelect).toHaveBeenCalledWith('cryptobazaar');
    });

    it('renders category icons', () => {
        renderWithTheme(<CategoryGrid onCategorySelect={mockOnCategorySelect} />);
        
        expect(screen.getByText('🛍️')).toBeInTheDocument(); // For Sale
        expect(screen.getByText('🔧')).toBeInTheDocument(); // Services
        expect(screen.getByText('💼')).toBeInTheDocument(); // Jobs
        expect(screen.getByText('₿')).toBeInTheDocument(); // CryptoBazaar
    });

    it('renders subcategory tags', () => {
        renderWithTheme(<CategoryGrid onCategorySelect={mockOnCategorySelect} />);
        
        // For Sale subcategories
        expect(screen.getByText('Electronics')).toBeInTheDocument();
        expect(screen.getByText('Vehicles')).toBeInTheDocument();
        expect(screen.getByText('Furniture')).toBeInTheDocument();
        expect(screen.getByText('+20 more')).toBeInTheDocument();
        
        // Services subcategories
        expect(screen.getByText('Computer/IT')).toBeInTheDocument();
        expect(screen.getByText('Legal')).toBeInTheDocument();
        expect(screen.getByText('Healthcare')).toBeInTheDocument();
        expect(screen.getByText('+15 more')).toBeInTheDocument();
        
        // Jobs subcategories
        expect(screen.getByText('Tech')).toBeInTheDocument();
        expect(screen.getByText('Remote')).toBeInTheDocument();
        expect(screen.getByText('Part-time')).toBeInTheDocument();
        expect(screen.getByText('+10 more')).toBeInTheDocument();
        
        // CryptoBazaar subcategories
        expect(screen.getByText('OmniCoin')).toBeInTheDocument();
        expect(screen.getByText('Bitcoin')).toBeInTheDocument();
        expect(screen.getByText('Ethereum')).toBeInTheDocument();
        expect(screen.getByText('+5 more')).toBeInTheDocument();
    });

    it('renders quick action buttons', () => {
        renderWithTheme(<CategoryGrid onCategorySelect={mockOnCategorySelect} />);
        
        expect(screen.getByText('Create Listing')).toBeInTheDocument();
        expect(screen.getByText('My Listings')).toBeInTheDocument();
        expect(screen.getByText('Advanced Search')).toBeInTheDocument();
        expect(screen.getByText('Featured Items')).toBeInTheDocument();
    });

    it('calls onCategorySelect for quick action buttons', () => {
        renderWithTheme(<CategoryGrid onCategorySelect={mockOnCategorySelect} />);
        
        fireEvent.click(screen.getByText('Create Listing'));
        expect(mockOnCategorySelect).toHaveBeenCalledWith('create');
        
        fireEvent.click(screen.getByText('My Listings'));
        expect(mockOnCategorySelect).toHaveBeenCalledWith('my-listings');
        
        fireEvent.click(screen.getByText('Advanced Search'));
        expect(mockOnCategorySelect).toHaveBeenCalledWith('search');
        
        fireEvent.click(screen.getByText('Featured Items'));
        expect(mockOnCategorySelect).toHaveBeenCalledWith('featured');
    });

    it('has proper accessibility structure', () => {
        renderWithTheme(<CategoryGrid onCategorySelect={mockOnCategorySelect} />);
        
        // Check for heading hierarchy
        const mainTitle = screen.getByRole('heading', { level: 1 });
        expect(mainTitle).toHaveTextContent('OmniBazaar Marketplace');
        
        // Check for category titles (should be h3)
        const categoryTitles = screen.getAllByRole('heading', { level: 3 });
        expect(categoryTitles).toHaveLength(4);
        expect(categoryTitles[0]).toHaveTextContent('For Sale');
        expect(categoryTitles[1]).toHaveTextContent('Services');
        expect(categoryTitles[2]).toHaveTextContent('Jobs');
        expect(categoryTitles[3]).toHaveTextContent('CryptoBazaar');
    });

    it('applies hover effects to category cards', () => {
        renderWithTheme(<CategoryGrid onCategorySelect={mockOnCategorySelect} />);
        
        const forSaleCard = screen.getByText('For Sale').closest('div');
        expect(forSaleCard).toHaveStyle('cursor: pointer');
    });

    it('formats numbers correctly in statistics', () => {
        renderWithTheme(<CategoryGrid onCategorySelect={mockOnCategorySelect} />);
        
        // Check that large numbers are formatted with commas
        expect(screen.getByText('2,847 listings')).toBeInTheDocument();
        expect(screen.getByText('1,523 listings')).toBeInTheDocument();
    });

    it('renders with responsive design structure', () => {
        renderWithTheme(<CategoryGrid onCategorySelect={mockOnCategorySelect} />);
        
        // Check that the grid container exists
        const container = screen.getByText('OmniBazaar Marketplace').closest('div');
        expect(container).toBeInTheDocument();
    });
}); 