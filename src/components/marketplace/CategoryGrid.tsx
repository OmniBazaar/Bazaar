import React from 'react';
import styled from 'styled-components';

interface Category {
    id: string;
    name: string;
    description: string;
    icon: string;
    color: string;
    subcategories: string[];
    stats: {
        count: number;
        label: string;
    };
}

interface CategoryGridProps {
    onCategorySelect: (categoryId: string) => void;
}

const Container = styled.div`
    padding: ${props => props.theme.spacing[6]};
    max-width: 1200px;
    margin: 0 auto;
`;

const Header = styled.div`
    text-align: center;
    margin-bottom: ${props => props.theme.spacing[10]};
`;

const Title = styled.h1`
    font-size: ${props => props.theme.typography.fontSize['4xl']};
    font-weight: ${props => props.theme.typography.fontWeight.bold};
    margin-bottom: ${props => props.theme.spacing[3]};
    color: ${props => props.theme.colors.text.primary};
`;

const Subtitle = styled.p`
    font-size: ${props => props.theme.typography.fontSize.lg};
    color: ${props => props.theme.colors.text.secondary};
`;

const SearchBar = styled.div`
    background: rgba(255, 255, 255, 0.95);
    backdrop-filter: blur(10px);
    border-radius: ${props => props.theme.borderRadius.full};
    padding: ${props => props.theme.spacing[4]} ${props => props.theme.spacing[6]};
    margin-bottom: ${props => props.theme.spacing[10]};
    box-shadow: ${props => props.theme.shadows.lg};
`;

const SearchInput = styled.input`
    width: 100%;
    border: none;
    outline: none;
    background: transparent;
    font-size: ${props => props.theme.typography.fontSize.lg};
    color: ${props => props.theme.colors.text.primary};

    &::placeholder {
        color: ${props => props.theme.colors.text.tertiary};
    }
`;

const Grid = styled.div`
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: ${props => props.theme.spacing[6]};
    margin-bottom: ${props => props.theme.spacing[10]};
`;

const CategoryCard = styled.div<{ $color: string }>`
    background: ${props => props.theme.colors.surface};
    border-radius: ${props => props.theme.borderRadius.xl};
    padding: ${props => props.theme.spacing[6]};
    box-shadow: ${props => props.theme.shadows.lg};
    transition: all 0.3s ease;
    cursor: pointer;
    position: relative;
    overflow: hidden;

    &:hover {
        transform: translateY(-8px);
        box-shadow: ${props => props.theme.shadows.xl};
    }

    &::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        height: 4px;
        background: ${props => props.$color};
    }
`;

const CategoryIcon = styled.div<{ $color: string }>`
    width: 64px;
    height: 64px;
    margin: 0 auto ${props => props.theme.spacing[4]};
    background: ${props => props.$color};
    border-radius: ${props => props.theme.borderRadius.lg};
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: ${props => props.theme.typography.fontSize['2xl']};
    color: white;
`;

const CategoryTitle = styled.h3`
    font-size: ${props => props.theme.typography.fontSize.xl};
    font-weight: ${props => props.theme.typography.fontWeight.semibold};
    text-align: center;
    margin-bottom: ${props => props.theme.spacing[2]};
    color: ${props => props.theme.colors.text.primary};
`;

const CategoryDescription = styled.p`
    text-align: center;
    color: ${props => props.theme.colors.text.secondary};
    margin-bottom: ${props => props.theme.spacing[4]};
    line-height: 1.5;
`;

const Subcategories = styled.div`
    margin-top: ${props => props.theme.spacing[3]};
`;

const SubcategoryTag = styled.span`
    display: inline-block;
    background: ${props => props.theme.colors.backgroundAlt};
    color: ${props => props.theme.colors.text.secondary};
    padding: ${props => props.theme.spacing[1]} ${props => props.theme.spacing[2]};
    border-radius: ${props => props.theme.borderRadius.lg};
    font-size: ${props => props.theme.typography.fontSize.sm};
    margin: ${props => props.theme.spacing[1]};
`;

const CategoryStats = styled.div`
    display: flex;
    justify-content: space-between;
    padding-top: ${props => props.theme.spacing[4]};
    border-top: 1px solid ${props => props.theme.colors.border};
    font-size: ${props => props.theme.typography.fontSize.sm};
    color: ${props => props.theme.colors.text.tertiary};
`;

const QuickActions = styled.div`
    display: flex;
    gap: ${props => props.theme.spacing[4]};
    justify-content: center;
    margin-top: ${props => props.theme.spacing[10]};
`;

const ActionButton = styled.button<{ $primary?: boolean }>`
    padding: ${props => props.theme.spacing[3]} ${props => props.theme.spacing[6]};
    border: none;
    border-radius: ${props => props.theme.borderRadius.full};
    font-weight: ${props => props.theme.typography.fontWeight.medium};
    cursor: pointer;
    transition: all 0.3s ease;
    text-decoration: none;
    
    ${props => props.$primary ? `
        background: ${props.theme.colors.primary};
        color: white;
        &:hover {
            background: ${props.theme.colors.primaryHover};
            transform: translateY(-2px);
        }
    ` : `
        background: rgba(255, 255, 255, 0.1);
        backdrop-filter: blur(10px);
        border: 1px solid rgba(255, 255, 255, 0.2);
        color: ${props.theme.colors.text.primary};
        &:hover {
            background: rgba(255, 255, 255, 0.2);
            transform: translateY(-2px);
        }
    `}
`;

const categories: Category[] = [
    {
        id: 'for-sale',
        name: 'For Sale',
        description: 'Buy and sell physical goods, from antiques to vehicles',
        icon: '🛍️',
        color: '#4CAF50',
        subcategories: ['Electronics', 'Vehicles', 'Furniture', 'Antiques', 'Books', '+20 more'],
        stats: { count: 2847, label: 'Active now' }
    },
    {
        id: 'services',
        name: 'Services',
        description: 'Professional services and skilled trades',
        icon: '🔧',
        color: '#2196F3',
        subcategories: ['Computer/IT', 'Legal', 'Healthcare', 'Creative', 'Construction', '+15 more'],
        stats: { count: 1523, label: 'Available' }
    },
    {
        id: 'jobs',
        name: 'Jobs',
        description: 'Find employment opportunities and post job openings',
        icon: '💼',
        color: '#FF9800',
        subcategories: ['Tech', 'Remote', 'Part-time', 'Freelance', 'Full-time', '+10 more'],
        stats: { count: 834, label: 'Updated daily' }
    },
    {
        id: 'cryptobazaar',
        name: 'CryptoBazaar',
        description: 'Cryptocurrency trading and crypto-specific services',
        icon: '₿',
        color: '#9C27B0',
        subcategories: ['OmniCoin', 'Bitcoin', 'Ethereum', 'Local Trading', 'Mining', '+5 more'],
        stats: { count: 456, label: 'Live rates' }
    }
];

export function CategoryGrid({ onCategorySelect }: CategoryGridProps) {
    return (
        <Container>
            <Header>
                <Title>OmniBazaar Marketplace</Title>
                <Subtitle>Discover amazing products, services, and opportunities</Subtitle>
            </Header>

            <SearchBar>
                <SearchInput placeholder="Search for anything..." />
            </SearchBar>

            <Grid>
                {categories.map(category => (
                    <CategoryCard
                        key={category.id}
                        $color={category.color}
                        onClick={() => onCategorySelect(category.id)}
                    >
                        <CategoryIcon $color={category.color}>
                            {category.icon}
                        </CategoryIcon>
                        <CategoryTitle>{category.name}</CategoryTitle>
                        <CategoryDescription>
                            {category.description}
                        </CategoryDescription>
                        <Subcategories>
                            {category.subcategories.map((sub, index) => (
                                <SubcategoryTag key={index}>{sub}</SubcategoryTag>
                            ))}
                        </Subcategories>
                        <CategoryStats>
                            <span>{category.stats.count.toLocaleString()} listings</span>
                            <span>{category.stats.label}</span>
                        </CategoryStats>
                    </CategoryCard>
                ))}
            </Grid>

            <QuickActions>
                <ActionButton $primary onClick={() => onCategorySelect('create')}>
                    Create Listing
                </ActionButton>
                <ActionButton onClick={() => onCategorySelect('my-listings')}>
                    My Listings
                </ActionButton>
                <ActionButton onClick={() => onCategorySelect('search')}>
                    Advanced Search
                </ActionButton>
                <ActionButton onClick={() => onCategorySelect('featured')}>
                    Featured Items
                </ActionButton>
            </QuickActions>
        </Container>
    );
} 