import React from 'react';
import { createRoot } from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from 'styled-components';
import { IntlProvider } from 'react-intl';

import { App } from './App';
import { theme } from './styles/theme';
import { GlobalStyle } from './styles/global';

// Create React Query client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 3,
      staleTime: 5 * 60 * 1000, // 5 minutes
      cacheTime: 10 * 60 * 1000, // 10 minutes
    },
  },
});

// Initialize popup
const container = document.getElementById('root');
if (!container) {
  throw new Error('Root element not found');
}

const root = createRoot(container);

// Default locale (will be enhanced with user preferences)
const locale = 'en';
const messages = {}; // Will be populated with actual translations

root.render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <IntlProvider locale={locale} messages={messages}>
        <ThemeProvider theme={theme}>
          <GlobalStyle />
          <App />
        </ThemeProvider>
      </IntlProvider>
    </QueryClientProvider>
  </React.StrictMode>
); 