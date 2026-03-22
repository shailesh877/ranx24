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
    ActivityIndicator
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
import api from '../../services/api';
import { useNavigation } from '@react-navigation/native';
import { COLORS, SPACING, SHADOWS } from '../../constants/theme';

const ForgotPasswordScreen: React.FC = () => {
    const [identifier, setIdentifier] = useState('');
    const [loading, setLoading] = useState(false);
    const navigation = useNavigation();

    const handleResetRequest = async () => {
        if (!identifier) {
            Toast.show({
                type: 'error',
                text1: 'Required',
                text2: 'Please enter your phone number',
            });
            return;
        }

        try {
            setLoading(true);
            const response = await api.post('/auth/forgotpassword', {
                identifier,
                userType: 'worker',
            });

            Toast.show({
                type: 'success',
                text1: 'Reset Link Sent',
                text2: 'Please check your phone for instructions',
            });

            navigation.goBack();

        } catch (error: any) {
            Toast.show({
                type: 'error',
                text1: 'Error',
                text2: error.response?.data?.message || 'Failed to send reset link',
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.keyboardView}
            >
                <ScrollView contentContainerStyle={styles.scrollView}>
                    <View style={styles.header}>
                        <Text style={styles.title}>Forgot Password</Text>
                        <Text style={styles.subtitle}>Enter your phone number to receive a reset link.</Text>
                    </View>

                    <View style={styles.form}>
                        <Text style={styles.label}>Phone Number</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Enter phone number"
                            value={identifier}
                            onChangeText={setIdentifier}
                            keyboardType="phone-pad"
                        />

                        <TouchableOpacity
                            style={[styles.button, loading && styles.buttonDisabled]}
                            onPress={handleResetRequest}
                            disabled={loading}
                        >
                            {loading ? (
                                <ActivityIndicator color="white" />
                            ) : (
                                <Text style={styles.buttonText}>Send Reset Link</Text>
                            )}
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.linkButton}
                            onPress={() => navigation.goBack()}
                        >
                            <Text style={styles.linkText}>Back to Login</Text>
                        </TouchableOpacity>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F9FAFB' },
    keyboardView: { flex: 1 },
    scrollView: { flexGrow: 1, justifyContent: 'center', padding: 20 },
    header: { alignItems: 'center', marginBottom: 30 },
    title: { fontSize: 28, fontWeight: 'bold', color: '#1E40AF', marginBottom: 8 },
    subtitle: { fontSize: 16, color: '#6B7280', textAlign: 'center' },
    form: {
        backgroundColor: 'white',
        borderRadius: 16,
        padding: 24,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
    },
    label: {
        fontSize: 14,
        fontWeight: '500',
        color: '#374151',
        marginBottom: 8,
    },
    input: {
        borderWidth: 1,
        borderColor: '#D1D5DB',
        borderRadius: 8,
        padding: 12,
        fontSize: 16,
        marginBottom: 20,
    },
    button: {
        backgroundColor: '#1E40AF',
        borderRadius: 12,
        padding: 16,
        alignItems: 'center',
        marginTop: 8,
    },
    buttonDisabled: { opacity: 0.6 },
    buttonText: { color: 'white', fontSize: 16, fontWeight: 'bold' },
    linkButton: { marginTop: 16, alignItems: 'center' },
    linkText: { color: '#1E40AF', fontSize: 14, fontWeight: '600' },
});

export default ForgotPasswordScreen;
