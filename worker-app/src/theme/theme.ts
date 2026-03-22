export const theme = {
    colors: {
        primary: '#2563EB', // Modern Blue (Primary Brand)
        primaryDark: '#1E40AF', // Deep Blue
        primaryLight: '#60A5FA', // Light Blue
        secondary: '#10B981', // Emerald Green (Success/Action)
        secondaryDark: '#059669',
        background: '#F8FAFC', // Slate 50 (Cleaner Background)
        surface: '#FFFFFF',
        text: {
            primary: '#0F172A', // Slate 900 (Sharper Text)
            secondary: '#475569', // Slate 600
            tertiary: '#94A3B8', // Slate 400
            light: '#FFFFFF',
            inverse: '#FFFFFF',
        },
        border: '#E2E8F0', // Slate 200
        error: '#EF4444', // Red 500
        warning: '#F59E0B', // Amber 500
        success: '#10B981', // Emerald 500
        info: '#3B82F6', // Blue 500
        gradients: {
            primary: ['#2563EB', '#1D4ED8'],
            success: ['#10B981', '#059669'],
            warning: ['#F59E0B', '#D97706'],
            error: ['#EF4444', '#DC2626'],
            dark: ['#1E293B', '#0F172A'],
        }
    },
    spacing: {
        xs: 4,
        s: 8,
        m: 16,
        l: 24,
        xl: 32,
        xxl: 48,
    },
    borderRadius: {
        s: 8,
        m: 12,
        l: 16,
        xl: 24,
        round: 9999,
    },
    typography: {
        h1: {
            fontSize: 32,
            fontWeight: '800',
            lineHeight: 40,
            letterSpacing: -0.5,
        },
        h2: {
            fontSize: 24,
            fontWeight: '700',
            lineHeight: 32,
            letterSpacing: -0.5,
        },
        h3: {
            fontSize: 20,
            fontWeight: '600',
            lineHeight: 28,
        },
        body: {
            fontSize: 16,
            lineHeight: 24,
            fontWeight: '400',
        },
        caption: {
            fontSize: 14,
            lineHeight: 20,
            fontWeight: '500',
        },
        small: {
            fontSize: 12,
            lineHeight: 16,
            fontWeight: '500',
        },
    },
    shadows: {
        small: {
            shadowColor: '#64748B',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.05,
            shadowRadius: 4,
            elevation: 2,
        },
        medium: {
            shadowColor: '#64748B',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.1,
            shadowRadius: 8,
            elevation: 4,
        },
        large: {
            shadowColor: '#64748B',
            shadowOffset: { width: 0, height: 8 },
            shadowOpacity: 0.15,
            shadowRadius: 16,
            elevation: 8,
        },
        primary: {
            shadowColor: '#2563EB',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.3,
            shadowRadius: 8,
            elevation: 6,
        }
    },
} as const;
