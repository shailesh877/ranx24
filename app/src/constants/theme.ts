import { Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');

export const lightColors = {
    primary: '#FFC627', // Yellow from hard hat (Brand Color)
    secondary: '#1E3A8A', // Dark Blue (Brand Accent)

    // Backgrounds
    background: '#F8F9FA', // Slightly off-white for better contrast
    card: '#FFFFFF',
    input: '#F3F4F6',

    // Text
    text: '#111827', // Almost black
    textSecondary: '#6B7280', // Gray
    textLight: '#9CA3AF', // Light Gray
    textInverse: '#FFFFFF',

    // Status
    success: '#10B981',
    error: '#EF4444',
    warning: '#F59E0B',
    info: '#3B82F6',

    // Basics
    white: '#FFFFFF',
    black: '#000000',
    transparent: 'transparent',
    border: '#E5E7EB',

    // Overlay
    overlay: 'rgba(0,0,0,0.5)',
};

export const darkColors = {
    primary: '#FFC627', // Keep brand yellow
    secondary: '#60A5FA', // Lighter blue for dark mode

    // Backgrounds
    background: '#111827', // Dark gray/black
    card: '#1F2937', // Slightly lighter dark
    input: '#374151',

    // Text
    text: '#F9FAFB', // White-ish
    textSecondary: '#D1D5DB', // Light gray
    textLight: '#9CA3AF',
    textInverse: '#111827',

    // Status
    success: '#34D399',
    error: '#F87171',
    warning: '#FBBF24',
    info: '#60A5FA',

    // Basics
    white: '#FFFFFF',
    black: '#000000',
    transparent: 'transparent',
    border: '#374151',

    // Overlay
    overlay: 'rgba(0,0,0,0.7)',
};

export const COLORS = lightColors; // Default for backward compatibility

export const SIZES = {
    // Global sizes
    base: 8,
    font: 14,
    radius: 12,
    padding: 24,

    // Font Sizes
    h1: 30,
    h2: 22,
    h3: 16,
    h4: 14,
    body1: 30,
    body2: 22,
    body3: 16,
    body4: 14,

    // App dimensions
    width,
    height,

    // Specifics
    icon: 24,
    iconSmall: 16,
    iconLarge: 32,
    cardRadius: 16,
    buttonRadius: 12,
};

export const SPACING = {
    xs: 4,
    s: 8,
    m: 16,
    l: 24,
    xl: 32,
    xxl: 40,
};

export const SHADOWS = {
    light: {
        shadowColor: COLORS.black,
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.05,
        shadowRadius: 3.84,
        elevation: 2,
    },
    medium: {
        shadowColor: COLORS.black,
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.1,
        shadowRadius: 5.46,
        elevation: 5,
    },
    dark: {
        shadowColor: COLORS.black,
        shadowOffset: {
            width: 0,
            height: 6,
        },
        shadowOpacity: 0.2,
        shadowRadius: 8.30,
        elevation: 10,
    },
};

const appTheme = { COLORS, SIZES, SPACING, SHADOWS };

export default appTheme;
