import { useColorScheme as useRNColorScheme } from 'react-native';
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

type ThemeMode = 'light' | 'dark' | 'auto';

interface ThemeContextType {
    theme: 'light' | 'dark';
    themeMode: ThemeMode;
    setThemeMode: (mode: ThemeMode) => void;
    isDark: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
    const systemColorScheme = useRNColorScheme();
    const [themeMode, setThemeModeState] = useState<ThemeMode>('auto');

    const isDark = themeMode === 'auto'
        ? systemColorScheme === 'dark'
        : themeMode === 'dark';

    const theme = isDark ? 'dark' : 'light';

    useEffect(() => {
        loadThemePreference();
    }, []);

    const loadThemePreference = async () => {
        try {
            const savedMode = await AsyncStorage.getItem('theme_mode');
            if (savedMode) {
                setThemeModeState(savedMode as ThemeMode);
            }
        } catch (error) {
            console.error('Error loading theme preference:', error);
        }
    };

    const setThemeMode = async (mode: ThemeMode) => {
        try {
            await AsyncStorage.setItem('theme_mode', mode);
            setThemeModeState(mode);
        } catch (error) {
            console.error('Error saving theme preference:', error);
        }
    };

    return (
        <ThemeContext.Provider value={{ theme, themeMode, setThemeMode, isDark }}>
            {children}
        </ThemeContext.Provider>
    );
};

export const useTheme = () => {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error('useTheme must be used within ThemeProvider');
    }
    return context;
};

// Extended theme colors for dark mode
export const darkTheme = {
    colors: {
        primary: '#60A5FA',
        secondary: '#A78BFA',
        background: '#0F172A',
        surface: '#1E293B',
        border: '#334155',
        text: {
            primary: '#F1F5F9',
            secondary: '#CBD5E1',
            tertiary: '#94A3B8',
            light: '#FFFFFF',
        },
        success: '#34D399',
        error: '#F87171',
        warning: '#FBBF24',
        info: '#60A5FA',
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
        s: 4,
        m: 8,
        l: 12,
        xl: 16,
        round: 999,
    },
    typography: {
        h1: { fontSize: 32, fontWeight: '700' as const },
        h2: { fontSize: 24, fontWeight: '700' as const },
        h3: { fontSize: 20, fontWeight: '600' as const },
        body: { fontSize: 16, fontWeight: '400' as const },
        caption: { fontSize: 14, fontWeight: '400' as const },
    },
    shadows: {
        small: {
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.25,
            shadowRadius: 3.84,
            elevation: 2,
        },
        medium: {
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.30,
            shadowRadius: 4.65,
            elevation: 4,
        },
        large: {
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 6 },
            shadowOpacity: 0.37,
            shadowRadius: 7.49,
            elevation: 8,
        },
        primary: {
            shadowColor: '#60A5FA',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.3,
            shadowRadius: 8,
            elevation: 4,
        },
    },
};
