import React from 'react';
import { ThemeProvider } from './components/common/ThemeProvider';
import { GlobalStyle } from './styles/global';
import { MarketplacePage } from './pages/MarketplacePage';

export const App: React.FC = () => {
    return (
        <ThemeProvider>
            <GlobalStyle />
            <MarketplacePage />
        </ThemeProvider>
    );
}; 