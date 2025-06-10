export const theme = {
    colors: {
        primary: '#2196F3',
        secondary: '#607D8B',
        background: '#FFFFFF',
        backgroundAlt: '#F5F5F5',
        text: {
            primary: '#212121',
            secondary: '#757575',
        },
        border: '#E0E0E0',
        disabled: '#BDBDBD',
        error: '#F44336',
        success: '#4CAF50',
        warning: '#FFC107',
    },
    spacing: {
        xs: '0.25rem',
        sm: '0.5rem',
        md: '1rem',
        lg: '1.5rem',
        xl: '2rem',
    },
    breakpoints: {
        xs: '0px',
        sm: '600px',
        md: '960px',
        lg: '1280px',
        xl: '1920px',
    },
    typography: {
        fontFamily: "'Roboto', 'Helvetica', 'Arial', sans-serif",
        fontSize: {
            xs: '0.75rem',
            sm: '0.875rem',
            md: '1rem',
            lg: '1.25rem',
            xl: '1.5rem',
        },
        fontWeight: {
            light: 300,
            regular: 400,
            medium: 500,
            bold: 700,
        },
    },
    shadows: {
        sm: '0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24)',
        md: '0 3px 6px rgba(0,0,0,0.15), 0 2px 4px rgba(0,0,0,0.12)',
        lg: '0 10px 20px rgba(0,0,0,0.15), 0 3px 6px rgba(0,0,0,0.10)',
    },
    borderRadius: {
        sm: '4px',
        md: '8px',
        lg: '16px',
    },
    transitions: {
        default: '0.2s ease',
        fast: '0.1s ease',
        slow: '0.3s ease',
    },
} as const;

export type Theme = typeof theme; 