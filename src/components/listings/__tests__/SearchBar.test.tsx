import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { SearchBar } from '../SearchBar';
import { ThemeProvider } from '../../common/ThemeProvider';

const renderWithTheme = (component: React.ReactElement) => {
    return render(
        <ThemeProvider>
            {component}
        </ThemeProvider>
    );
};

describe('SearchBar', () => {
    const mockOnSearch = jest.fn();

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('renders search input with placeholder', () => {
        renderWithTheme(
            <SearchBar 
                onSearch={mockOnSearch}
                placeholder="Search test"
            />
        );

        expect(screen.getByPlaceholderText('Search test')).toBeInTheDocument();
    });

    it('renders with initial value', () => {
        renderWithTheme(
            <SearchBar 
                onSearch={mockOnSearch}
                initialValue="test query"
            />
        );

        expect(screen.getByDisplayValue('test query')).toBeInTheDocument();
    });

    it('calls onSearch when form is submitted', () => {
        renderWithTheme(
            <SearchBar onSearch={mockOnSearch} />
        );

        const input = screen.getByRole('textbox');
        const submitButton = screen.getByRole('button', { name: '' });

        fireEvent.change(input, { target: { value: 'test search' } });
        fireEvent.click(submitButton);

        expect(mockOnSearch).toHaveBeenCalledWith('test search');
    });

    it('calls onSearch when Enter key is pressed', () => {
        renderWithTheme(
            <SearchBar onSearch={mockOnSearch} />
        );

        const input = screen.getByRole('textbox');
        fireEvent.change(input, { target: { value: 'keyboard search' } });
        
        const form = input.closest('form');
        if (form) {
            fireEvent.submit(form);
        }

        expect(mockOnSearch).toHaveBeenCalledWith('keyboard search');
    });

    it('shows suggestions when typing', async () => {
        renderWithTheme(
            <SearchBar onSearch={mockOnSearch} />
        );

        const input = screen.getByRole('textbox');
        fireEvent.change(input, { target: { value: 'iPhone' } });
        fireEvent.focus(input);

        await waitFor(() => {
            expect(screen.getByText('iPhone 15 Pro')).toBeInTheDocument();
        });
    });

    it('hides suggestions when input is too short', () => {
        renderWithTheme(
            <SearchBar onSearch={mockOnSearch} />
        );

        const input = screen.getByRole('textbox');
        fireEvent.change(input, { target: { value: 'iP' } }); // Only 2 characters
        fireEvent.focus(input);

        expect(screen.queryByText('iPhone 15 Pro')).not.toBeInTheDocument();
    });

    it('calls onSearch when suggestion is clicked', async () => {
        renderWithTheme(
            <SearchBar onSearch={mockOnSearch} />
        );

        const input = screen.getByRole('textbox');
        fireEvent.change(input, { target: { value: 'MacBook' } });
        fireEvent.focus(input);

        await waitFor(() => {
            const suggestion = screen.getByText('MacBook Pro M3');
            fireEvent.click(suggestion);
        });

        expect(mockOnSearch).toHaveBeenCalledWith('MacBook Pro M3');
    });

    it('hides suggestions when input loses focus', async () => {
        renderWithTheme(
            <SearchBar onSearch={mockOnSearch} />
        );

        const input = screen.getByRole('textbox');
        fireEvent.change(input, { target: { value: 'iPhone' } });
        fireEvent.focus(input);

        await waitFor(() => {
            expect(screen.getByText('iPhone 15 Pro')).toBeInTheDocument();
        });

        fireEvent.blur(input);

        await waitFor(() => {
            expect(screen.queryByText('iPhone 15 Pro')).not.toBeInTheDocument();
        }, { timeout: 300 }); // Wait for the blur timeout
    });

    it('updates input value when typing', () => {
        renderWithTheme(
            <SearchBar onSearch={mockOnSearch} />
        );

        const input = screen.getByRole('textbox');
        fireEvent.change(input, { target: { value: 'new search term' } });

        expect(input).toHaveValue('new search term');
    });

    it('renders search icon in button', () => {
        renderWithTheme(
            <SearchBar onSearch={mockOnSearch} />
        );

        const searchButton = screen.getByRole('button');
        const svgElement = searchButton.querySelector('svg');
        
        expect(svgElement).toBeInTheDocument();
        expect(svgElement).toHaveAttribute('viewBox', '0 0 24 24');
    });

    it('handles empty search submission', () => {
        renderWithTheme(
            <SearchBar onSearch={mockOnSearch} />
        );

        const submitButton = screen.getByRole('button');
        fireEvent.click(submitButton);

        expect(mockOnSearch).toHaveBeenCalledWith('');
    });

    it('uses default placeholder when none provided', () => {
        renderWithTheme(
            <SearchBar onSearch={mockOnSearch} />
        );

        expect(screen.getByPlaceholderText('Search for products, services, or jobs...')).toBeInTheDocument();
    });
}); 