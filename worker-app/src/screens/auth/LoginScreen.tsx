import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    Image,
    StatusBar,
    ActivityIndicator
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
import { Ionicons } from '@expo/vector-icons';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import { theme } from '../../theme/theme';

// Map theme to constants for compatibility
const COLORS = {
    background: theme.colors.background,
    text: theme.colors.text.primary,
    textSecondary: theme.colors.text.secondary,
    textLight: theme.colors.text.tertiary,
    white: theme.colors.surface,
    primary: theme.colors.primary,
    secondary: theme.colors.text.inverse, // Button text color
    input: theme.colors.surface,
    border: theme.colors.border,
};

const SPACING = theme.spacing;
const SHADOWS = theme.shadows;

type RootStackParamList = {
    Main: undefined;
    Register: undefined;
    ForgotPassword: undefined;
};

const LoginScreen: React.FC = () => {
    const [identifier, setIdentifier] = useState<string>('');
    const [password, setPassword] = useState<string>('');
    const [loading, setLoading] = useState<boolean>(false);
    const [showPassword, setShowPassword] = useState<boolean>(false);
    const { login } = useAuth();

    const navigation = useNavigation<NavigationProp<RootStackParamList>>();

    const handleLogin = async (): Promise<void> => {
        if (!identifier || !password) {
            Toast.show({
                type: 'error',
                text1: 'Missing Fields',
                text2: 'Please enter both phone number and password',
            });
            return;
        }

        try {
            setLoading(true);
            const response = await api.post('/auth/login', {
                identifier,
                password,
                userType: 'worker' // Worker App
            });

            const { token, user } = response.data;
            await login(user, token);

            Toast.show({
                type: 'success',
                text1: 'Welcome Back!',
                text2: `Logged in as ${user.firstName || 'Worker'}`,
            });

        } catch (error: any) {
            Toast.show({
                type: 'error',
                text1: 'Login Failed',
                text2: error.response?.data?.message || 'Invalid credentials',
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.keyboardView}
            >
                <ScrollView contentContainerStyle={styles.scrollView} showsVerticalScrollIndicator={false}>

                    <View style={styles.header}>
                        <Image
                            source={require('../../../assets/logo.png')}
                            style={styles.logoImage}
                            resizeMode="contain"
                        />
                        <Text style={styles.appName}>RanX24 Partner</Text>
                        <Text style={styles.subtitle}>Grow your business with us</Text>
                    </View>

                    <View style={styles.card}>
                        <Text style={styles.cardTitle}>Partner Login</Text>
                        <Text style={styles.cardSubtitle}>Login to manage your bookings</Text>

                        <View style={styles.inputContainer}>
                            <Ionicons name="call-outline" size={20} color={COLORS.textSecondary} style={styles.inputIcon} />
                            <TextInput
                                style={styles.input}
                                placeholder="Phone Number"
                                placeholderTextColor={COLORS.textLight}
                                value={identifier}
                                onChangeText={setIdentifier}
                                keyboardType="phone-pad"
                            />
                        </View>

                        <View style={styles.inputContainer}>
                            <Ionicons name="lock-closed-outline" size={20} color={COLORS.textSecondary} style={styles.inputIcon} />
                            <TextInput
                                style={styles.input}
                                placeholder="Password"
                                placeholderTextColor={COLORS.textLight}
                                value={password}
                                onChangeText={setPassword}
                                secureTextEntry={!showPassword}
                            />
                            <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                                <Ionicons name={showPassword ? "eye-off-outline" : "eye-outline"} size={20} color={COLORS.textSecondary} />
                            </TouchableOpacity>
                        </View>

                        <TouchableOpacity
                            style={styles.forgotPassword}
                            onPress={() => navigation.navigate('ForgotPassword')}
                        >
                            <Text style={styles.linkText}>Forgot Password?</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[styles.button, loading && styles.buttonDisabled]}
                            onPress={handleLogin}
                            disabled={loading}
                        >
                            {loading ? (
                                <ActivityIndicator color={COLORS.secondary} />
                            ) : (
                                <Text style={styles.buttonText}>Login</Text>
                            )}
                        </TouchableOpacity>

                        <View style={styles.footer}>
                            <Text style={styles.footerText}>New Partner? </Text>
                            <TouchableOpacity onPress={() => navigation.navigate('Register')}>
                                <Text style={styles.linkText}>Register Here</Text>
                            </TouchableOpacity>
                        </View>
                    </View>

                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background
    },
    keyboardView: {
        flex: 1
    },
    scrollView: {
        flexGrow: 1,
        justifyContent: 'center',
        padding: SPACING.l
    },
    header: {
        alignItems: 'center',
        marginBottom: SPACING.xl
    },
    logoImage: {
        width: 100,
        height: 100,
        marginBottom: SPACING.m
    },
    appName: {
        fontSize: 28,
        fontWeight: 'bold',
        color: COLORS.text,
        marginBottom: 4,
    },
    subtitle: {
        fontSize: 16,
        color: COLORS.textSecondary,
        fontWeight: '500'
    },
    card: {
        backgroundColor: COLORS.white,
        borderRadius: 24,
        padding: SPACING.l,
        ...SHADOWS.medium,
        marginBottom: SPACING.l,
    },
    cardTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: COLORS.text,
        marginBottom: 8,
        textAlign: 'center',
    },
    cardSubtitle: {
        fontSize: 14,
        color: COLORS.textSecondary,
        textAlign: 'center',
        marginBottom: SPACING.l,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: COLORS.border,
        borderRadius: 12,
        paddingHorizontal: SPACING.m,
        height: 56,
        backgroundColor: COLORS.input,
        marginBottom: SPACING.m,
    },
    inputIcon: {
        marginRight: 8,
    },
    input: {
        flex: 1,
        fontSize: 16,
        color: COLORS.text,
        height: '100%',
    },
    button: {
        backgroundColor: COLORS.primary,
        borderRadius: 12,
        height: 56,
        justifyContent: 'center',
        alignItems: 'center',
        ...SHADOWS.medium,
        marginTop: SPACING.m,
    },
    buttonDisabled: {
        opacity: 0.7
    },
    buttonText: {
        color: COLORS.secondary,
        fontSize: 16,
        fontWeight: 'bold'
    },
    forgotPassword: {
        alignSelf: 'flex-end',
        marginBottom: SPACING.m,
    },
    linkText: {
        color: COLORS.primary,
        fontSize: 14,
        fontWeight: '600'
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: SPACING.l,
    },
    footerText: {
        color: COLORS.textSecondary,
        fontSize: 14,
    }
});

export default LoginScreen;
