import React from 'react';
import { render, screen } from '@testing-library/react';
import { MarketplaceLayout } from '../MarketplaceLayout';
import { ThemeProvider } from '../../common/ThemeProvider';

const renderWithTheme = (component: React.ReactElement) => {
    return render(
        <ThemeProvider>
            {component}
        </ThemeProvider>
    );
};

describe('MarketplaceLayout', () => {
    const mockFilters = <div data-testid="filters">Mock Filters</div>;
    const mockContent = <div data-testid="content">Mock Content</div>;

    it('renders filters and content props', () => {
        renderWithTheme(
            <MarketplaceLayout 
                filters={mockFilters} 
                content={mockContent} 
            />
        );

        expect(screen.getByTestId('filters')).toBeInTheDocument();
        expect(screen.getByTestId('content')).toBeInTheDocument();
    });

    it('renders filters in sidebar', () => {
        renderWithTheme(
            <MarketplaceLayout 
                filters={mockFilters} 
                content={mockContent} 
            />
        );

        const filters = screen.getByTestId('filters');
        const sidebar = filters.closest('aside');
        
        expect(sidebar).toBeInTheDocument();
        expect(sidebar).toContainElement(filters);
    });

    it('renders content in main area', () => {
        renderWithTheme(
            <MarketplaceLayout 
                filters={mockFilters} 
                content={mockContent} 
            />
        );

        const content = screen.getByTestId('content');
        const main = content.closest('main');
        
        expect(main).toBeInTheDocument();
        expect(main).toContainElement(content);
    });

    it('has proper grid layout structure', () => {
        renderWithTheme(
            <MarketplaceLayout 
                filters={mockFilters} 
                content={mockContent} 
            />
        );

        const layout = screen.getByTestId('filters').closest('div');
        expect(layout).toHaveStyle('display: grid');
    });

    it('positions sidebar and main content correctly', () => {
        renderWithTheme(
            <MarketplaceLayout 
                filters={mockFilters} 
                content={mockContent} 
            />
        );

        const sidebar = screen.getByRole('complementary');
        const main = screen.getByRole('main');
        
        expect(sidebar).toBeInTheDocument();
        expect(main).toBeInTheDocument();
        
        // Both should be children of the layout container
        const container = sidebar.parentElement;
        expect(container).toContainElement(sidebar);
        expect(container).toContainElement(main);
    });

    it('applies responsive design styles', () => {
        renderWithTheme(
            <MarketplaceLayout 
                filters={mockFilters} 
                content={mockContent} 
            />
        );

        const layout = screen.getByTestId('filters').closest('div');
        
        // Should have responsive grid layout
        expect(layout).toHaveStyle('display: grid');
        // Gap between columns
        expect(layout).toHaveStyle('gap: 2rem');
    });

    it('makes sidebar sticky', () => {
        renderWithTheme(
            <MarketplaceLayout 
                filters={mockFilters} 
                content={mockContent} 
            />
        );

        const sidebar = screen.getByRole('complementary');
        
        expect(sidebar).toHaveStyle('position: sticky');
        expect(sidebar).toHaveStyle('top: 2rem');
    });

    it('sets proper max width and margins', () => {
        renderWithTheme(
            <MarketplaceLayout 
                filters={mockFilters} 
                content={mockContent} 
            />
        );

        const layout = screen.getByTestId('filters').closest('div');
        
        expect(layout).toHaveStyle('max-width: 1440px');
        expect(layout).toHaveStyle('margin: 0 auto');
    });

    it('handles empty filters gracefully', () => {
        renderWithTheme(
            <MarketplaceLayout 
                filters={null} 
                content={mockContent} 
            />
        );

        expect(screen.getByTestId('content')).toBeInTheDocument();
        const sidebar = screen.getByRole('complementary');
        expect(sidebar).toBeInTheDocument();
    });

    it('handles empty content gracefully', () => {
        renderWithTheme(
            <MarketplaceLayout 
                filters={mockFilters} 
                content={null} 
            />
        );

        expect(screen.getByTestId('filters')).toBeInTheDocument();
        const main = screen.getByRole('main');
        expect(main).toBeInTheDocument();
    });

    it('renders complex filter components', () => {
        const complexFilters = (
            <div data-testid="complex-filters">
                <select>
                    <option>All Categories</option>
                    <option>Electronics</option>
                </select>
                <input placeholder="Search..." />
                <button>Apply Filters</button>
            </div>
        );

        renderWithTheme(
            <MarketplaceLayout 
                filters={complexFilters} 
                content={mockContent} 
            />
        );

        expect(screen.getByTestId('complex-filters')).toBeInTheDocument();
        expect(screen.getByRole('combobox')).toBeInTheDocument();
        expect(screen.getByPlaceholderText('Search...')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /apply filters/i })).toBeInTheDocument();
    });

    it('renders complex content components', () => {
        const complexContent = (
            <div data-testid="complex-content">
                <h1>Marketplace Results</h1>
                <div>
                    <div>Item 1</div>
                    <div>Item 2</div>
                    <div>Item 3</div>
                </div>
                <nav>
                    <button>Previous</button>
                    <button>Next</button>
                </nav>
            </div>
        );

        renderWithTheme(
            <MarketplaceLayout 
                filters={mockFilters} 
                content={complexContent} 
            />
        );

        expect(screen.getByTestId('complex-content')).toBeInTheDocument();
        expect(screen.getByRole('heading', { name: /marketplace results/i })).toBeInTheDocument();
        expect(screen.getByText('Item 1')).toBeInTheDocument();
        expect(screen.getByText('Item 2')).toBeInTheDocument();
        expect(screen.getByText('Item 3')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /previous/i })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /next/i })).toBeInTheDocument();
    });

    it('maintains proper semantic structure', () => {
        renderWithTheme(
            <MarketplaceLayout 
                filters={mockFilters} 
                content={mockContent} 
            />
        );

        // Should have proper ARIA landmarks
        expect(screen.getByRole('complementary')).toBeInTheDocument(); // sidebar
        expect(screen.getByRole('main')).toBeInTheDocument(); // main content
    });

    it('supports different filter types', () => {
        const multipleFilters = (
            <div data-testid="multiple-filters">
                <div>Price Range</div>
                <div>Category</div>
                <div>Location</div>
                <div>Rating</div>
            </div>
        );

        renderWithTheme(
            <MarketplaceLayout 
                filters={multipleFilters} 
                content={mockContent} 
            />
        );

        expect(screen.getByText('Price Range')).toBeInTheDocument();
        expect(screen.getByText('Category')).toBeInTheDocument();
        expect(screen.getByText('Location')).toBeInTheDocument();
        expect(screen.getByText('Rating')).toBeInTheDocument();
    });
}); 