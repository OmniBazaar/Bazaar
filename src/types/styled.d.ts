import 'styled-components';

declare module 'styled-components' {
    export interface DefaultTheme {
        colors: {
            primary: string;
            secondary: string;
            background: string;
            backgroundAlt: string;
            text: {
                primary: string;
                secondary: string;
            };
            border: string;
            disabled: string;
            error: string;
            success: string;
            warning: string;
        };
        spacing: {
            xs: string;
            sm: string;
            md: string;
            lg: string;
            xl: string;
        };
        breakpoints: {
            xs: string;
            sm: string;
            md: string;
            lg: string;
            xl: string;
        };
        typography: {
            fontFamily: string;
            fontSize: {
                xs: string;
                sm: string;
                md: string;
                lg: string;
                xl: string;
            };
            fontWeight: {
                light: number;
                regular: number;
                medium: number;
                bold: number;
            };
        };
        shadows: {
            sm: string;
            md: string;
            lg: string;
        };
        borderRadius: {
            sm: string;
            md: string;
            lg: string;
        };
        transitions: {
            default: string;
            fast: string;
            slow: string;
        };
    }
} 