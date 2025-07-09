// Design tokens based on OmniBazaar legacy UI analysis
const tokens = {
  // Color palette inspired by legacy OmniBazaar branding
  colors: {
    // Primary brand colors
    primary: {
      50: '#E3F2FD',
      100: '#BBDEFB', 
      200: '#90CAF9',
      300: '#64B5F6',
      400: '#42A5F5',
      500: '#2196F3', // Main brand blue
      600: '#1E88E5',
      700: '#1976D2',
      800: '#1565C0',
      900: '#0D47A1',
    },
    // Secondary colors
    secondary: {
      50: '#ECEFF1',
      100: '#CFD8DC',
      200: '#B0BEC5',
      300: '#90A4AE',
      400: '#78909C',
      500: '#607D8B', // Legacy secondary color
      600: '#546E7A',
      700: '#455A64',
      800: '#37474F',
      900: '#263238',
    },
    // Semantic colors
    success: {
      50: '#E8F5E8',
      100: '#C8E6C9',
      200: '#A5D6A7',
      300: '#81C784',
      400: '#66BB6A',
      500: '#4CAF50',
      600: '#43A047',
      700: '#388E3C',
      800: '#2E7D32',
      900: '#1B5E20',
    },
    warning: {
      50: '#FFF8E1',
      100: '#FFECB3',
      200: '#FFE082',
      300: '#FFD54F',
      400: '#FFCA28',
      500: '#FFC107',
      600: '#FFB300',
      700: '#FFA000',
      800: '#FF8F00',
      900: '#FF6F00',
    },
    error: {
      50: '#FFEBEE',
      100: '#FFCDD2',
      200: '#EF9A9A',
      300: '#E57373',
      400: '#EF5350',
      500: '#F44336',
      600: '#E53935',
      700: '#D32F2F',
      800: '#C62828',
      900: '#B71C1C',
    },
    // Neutral grays
    gray: {
      50: '#FAFAFA',
      100: '#F5F5F5',
      200: '#EEEEEE',
      300: '#E0E0E0',
      400: '#BDBDBD',
      500: '#9E9E9E',
      600: '#757575',
      700: '#616161',
      800: '#424242',
      900: '#212121',
    },
    // Special marketplace colors
    marketplace: {
      featured: '#FF9800', // Orange for featured listings
      escrow: '#9C27B0', // Purple for SecureSend
      reputation: '#795548', // Brown for user reputation
      crypto: '#FF5722', // Red-orange for crypto features
    },
  },
  
  // Spacing system (8px base)
  spacing: {
    0: '0',
    1: '0.25rem', // 4px
    2: '0.5rem',  // 8px
    3: '0.75rem', // 12px
    4: '1rem',    // 16px
    5: '1.25rem', // 20px
    6: '1.5rem',  // 24px
    8: '2rem',    // 32px
    10: '2.5rem', // 40px
    12: '3rem',   // 48px
    16: '4rem',   // 64px
    20: '5rem',   // 80px
    24: '6rem',   // 96px
    32: '8rem',   // 128px
  },
  
  // Typography scale
  fontSizes: {
    xs: '0.75rem',   // 12px
    sm: '0.875rem',  // 14px
    base: '1rem',    // 16px
    lg: '1.125rem',  // 18px
    xl: '1.25rem',   // 20px
    '2xl': '1.5rem', // 24px
    '3xl': '1.875rem', // 30px
    '4xl': '2.25rem',  // 36px
    '5xl': '3rem',     // 48px
    '6xl': '3.75rem',  // 60px
  },
  
  fontWeights: {
    thin: 100,
    extralight: 200,
    light: 300,
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
    extrabold: 800,
    black: 900,
  },
  
  lineHeights: {
    none: 1,
    tight: 1.25,
    snug: 1.375,
    normal: 1.5,
    relaxed: 1.625,
    loose: 2,
  },
  
  // Border radius
  radii: {
    none: '0',
    sm: '0.25rem',  // 4px
    base: '0.375rem', // 6px
    md: '0.5rem',   // 8px
    lg: '0.75rem',  // 12px
    xl: '1rem',     // 16px
    '2xl': '1.5rem', // 24px
    '3xl': '2rem',   // 32px
    full: '9999px',
  },
  
  // Shadows
  shadows: {
    xs: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    sm: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
    base: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    md: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
    lg: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
    xl: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
    inner: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)',
  },
  
  // Z-index scale
  zIndices: {
    hide: -1,
    auto: 'auto',
    base: 0,
    docked: 10,
    dropdown: 1000,
    sticky: 1100,
    banner: 1200,
    overlay: 1300,
    modal: 1400,
    popover: 1500,
    skipLink: 1600,
    toast: 1700,
    tooltip: 1800,
  },
  
  // Breakpoints for responsive design
  breakpoints: {
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
    '2xl': '1536px',
  },
  
  // Transitions
  transitions: {
    fast: '150ms ease',
    base: '250ms ease',
    slow: '350ms ease',
    slower: '500ms ease',
  },
} as const;

// Theme object using design tokens
export const theme = {
  // Core colors
  colors: {
    primary: tokens.colors.primary[500],
    primaryHover: tokens.colors.primary[600],
    primaryActive: tokens.colors.primary[700],
    secondary: tokens.colors.secondary[500],
    secondaryHover: tokens.colors.secondary[600],
    
    // Backgrounds
    background: '#FFFFFF',
    backgroundAlt: tokens.colors.gray[50],
    backgroundSecondary: tokens.colors.gray[100],
    surface: '#FFFFFF',
    
    // Text colors
    text: {
      primary: tokens.colors.gray[900],
      secondary: tokens.colors.gray[600],
      tertiary: tokens.colors.gray[500],
      inverse: '#FFFFFF',
    },
    
    // Border and dividers
    border: tokens.colors.gray[300],
    borderLight: tokens.colors.gray[200],
    divider: tokens.colors.gray[200],
    
    // States
    disabled: tokens.colors.gray[400],
    hover: tokens.colors.gray[50],
    focus: tokens.colors.primary[100],
    
    // Semantic colors
    success: tokens.colors.success[500],
    successLight: tokens.colors.success[100],
    warning: tokens.colors.warning[500],
    warningLight: tokens.colors.warning[100],
    error: tokens.colors.error[500],
    errorLight: tokens.colors.error[100],
    
    // Marketplace specific
    featured: tokens.colors.marketplace.featured,
    escrow: tokens.colors.marketplace.escrow,
    reputation: tokens.colors.marketplace.reputation,
    crypto: tokens.colors.marketplace.crypto,
  },
  
  // Spacing using design tokens
  spacing: tokens.spacing,
  
  // Typography
  typography: {
    fontFamily: {
      sans: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', sans-serif",
      mono: "'JetBrains Mono', 'Fira Code', 'Courier New', monospace",
    },
    fontSize: tokens.fontSizes,
    fontWeight: tokens.fontWeights,
    lineHeight: tokens.lineHeights,
  },
  
  // Layout
  borderRadius: tokens.radii,
  shadows: tokens.shadows,
  zIndex: tokens.zIndices,
  
  // Responsive breakpoints
  breakpoints: tokens.breakpoints,
  
  // Animations
  transitions: tokens.transitions,
  
  // Component specific tokens
  components: {
    button: {
      height: {
        sm: tokens.spacing[8],
        md: tokens.spacing[10],
        lg: tokens.spacing[12],
      },
      padding: {
        sm: `${tokens.spacing[2]} ${tokens.spacing[3]}`,
        md: `${tokens.spacing[3]} ${tokens.spacing[4]}`,
        lg: `${tokens.spacing[4]} ${tokens.spacing[6]}`,
      },
    },
    input: {
      height: {
        sm: tokens.spacing[8],
        md: tokens.spacing[10],
        lg: tokens.spacing[12],
      },
    },
    card: {
      padding: tokens.spacing[6],
      borderRadius: tokens.radii.lg,
      shadow: tokens.shadows.base,
    },
    modal: {
      borderRadius: tokens.radii.xl,
      shadow: tokens.shadows.xl,
    },
  },
} as const;

export type Theme = typeof theme;

// Dark theme variant
export const darkTheme: Theme = {
  ...theme,
  colors: {
    ...theme.colors,
    background: tokens.colors.gray[900],
    backgroundAlt: tokens.colors.gray[800],
    backgroundSecondary: tokens.colors.gray[700],
    surface: tokens.colors.gray[800],
    
    text: {
      primary: tokens.colors.gray[100],
      secondary: tokens.colors.gray[300],
      tertiary: tokens.colors.gray[400],
      inverse: tokens.colors.gray[900],
    },
    
    border: tokens.colors.gray[600],
    borderLight: tokens.colors.gray[700],
    divider: tokens.colors.gray[700],
    
    hover: tokens.colors.gray[700],
    focus: tokens.colors.primary[900],
  },
}; 