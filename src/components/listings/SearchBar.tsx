import React, { useState, useEffect } from 'react';
import styled from 'styled-components';

interface SearchBarProps {
    onSearch: (query: string) => void;
    placeholder?: string;
    initialValue?: string;
}

const Container = styled.div`
    display: flex;
    align-items: center;
    position: relative;
    max-width: 600px;
    margin: 0 auto;
`;

const SearchInput = styled.input`
    width: 100%;
    padding: ${props => props.theme.spacing[4]} ${props => props.theme.spacing[6]};
    padding-right: ${props => props.theme.spacing[12]};
    border: 2px solid ${props => props.theme.colors.border};
    border-radius: ${props => props.theme.borderRadius.lg};
    background: ${props => props.theme.colors.background};
    color: ${props => props.theme.colors.text.primary};
    font-size: ${props => props.theme.typography.fontSize.lg};
    transition: all ${props => props.theme.transitions.base};

    &:focus {
        outline: none;
        border-color: ${props => props.theme.colors.primary};
        box-shadow: 0 0 0 3px ${props => props.theme.colors.focus};
    }

    &::placeholder {
        color: ${props => props.theme.colors.text.tertiary};
    }
`;

const SearchButton = styled.button`
    position: absolute;
    right: ${props => props.theme.spacing[2]};
    top: 50%;
    transform: translateY(-50%);
    padding: ${props => props.theme.spacing[2]};
    background: ${props => props.theme.colors.primary};
    color: ${props => props.theme.colors.background};
    border: none;
    border-radius: ${props => props.theme.borderRadius.base};
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all ${props => props.theme.transitions.base};

    &:hover {
        background: ${props => props.theme.colors.primaryHover};
    }

    &:active {
        background: ${props => props.theme.colors.primaryActive};
    }
`;

const SearchIcon = styled.svg`
    width: 20px;
    height: 20px;
    fill: currentColor;
`;

const SuggestionsContainer = styled.div`
    position: absolute;
    top: 100%;
    left: 0;
    right: 0;
    background: ${props => props.theme.colors.background};
    border: 1px solid ${props => props.theme.colors.border};
    border-radius: ${props => props.theme.borderRadius.base};
    box-shadow: ${props => props.theme.shadows.md};
    z-index: ${props => props.theme.zIndex.dropdown};
    max-height: 300px;
    overflow-y: auto;
    margin-top: ${props => props.theme.spacing[1]};
`;

const SuggestionItem = styled.div`
    padding: ${props => props.theme.spacing[3]} ${props => props.theme.spacing[4]};
    cursor: pointer;
    color: ${props => props.theme.colors.text.primary};
    border-bottom: 1px solid ${props => props.theme.colors.borderLight};
    transition: background ${props => props.theme.transitions.fast};

    &:hover {
        background: ${props => props.theme.colors.hover};
    }

    &:last-child {
        border-bottom: none;
    }
`;

export function SearchBar({ onSearch, placeholder = "Search for products, services, or jobs...", initialValue = "" }: SearchBarProps) {
    const [query, setQuery] = useState(initialValue);
    const [suggestions, setSuggestions] = useState<string[]>([]);
    const [showSuggestions, setShowSuggestions] = useState(false);

    // Mock suggestions - in a real app, this would come from an API
    const mockSuggestions = [
        "iPhone 15 Pro",
        "MacBook Pro M3",
        "Web Development Services",
        "Graphic Design",
        "Remote Software Engineer",
        "Photography Services",
        "Tutoring Services",
        "Bitcoin Trading",
        "OmniCoin Exchange"
    ];

    useEffect(() => {
        if (query.length > 2) {
            const filtered = mockSuggestions.filter(suggestion =>
                suggestion.toLowerCase().includes(query.toLowerCase())
            );
            setSuggestions(filtered.slice(0, 5));
            setShowSuggestions(true);
        } else {
            setSuggestions([]);
            setShowSuggestions(false);
        }
    }, [query]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSearch(query);
        setShowSuggestions(false);
    };

    const handleSuggestionClick = (suggestion: string) => {
        setQuery(suggestion);
        onSearch(suggestion);
        setShowSuggestions(false);
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setQuery(e.target.value);
    };

    return (
        <Container>
            <form onSubmit={handleSubmit} style={{ width: '100%' }}>
                <SearchInput
                    type="text"
                    value={query}
                    onChange={handleInputChange}
                    placeholder={placeholder}
                    onFocus={() => query.length > 2 && setShowSuggestions(true)}
                    onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                />
                <SearchButton type="submit">
                    <SearchIcon viewBox="0 0 24 24">
                        <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
                    </SearchIcon>
                </SearchButton>
            </form>

            {showSuggestions && suggestions.length > 0 && (
                <SuggestionsContainer>
                    {suggestions.map((suggestion, index) => (
                        <SuggestionItem
                            key={index}
                            onClick={() => handleSuggestionClick(suggestion)}
                        >
                            {suggestion}
                        </SuggestionItem>
                    ))}
                </SuggestionsContainer>
            )}
        </Container>
    );
} 