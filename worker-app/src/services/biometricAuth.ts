import * as LocalAuthentication from 'expo-local-authentication';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert } from 'react-native';

export class BiometricAuth {
    private static readonly BIOMETRIC_ENABLED_KEY = 'biometric_enabled';

    /**
     * Check if biometric authentication is available
     */
    static async isAvailable(): Promise<boolean> {
        try {
            const compatible = await LocalAuthentication.hasHardwareAsync();
            if (!compatible) return false;

            const enrolled = await LocalAuthentication.isEnrolledAsync();
            return enrolled;
        } catch (error) {
            console.error('Error checking biometric availability:', error);
            return false;
        }
    }

    /**
     * Get supported biometric types
     */
    static async getSupportedTypes(): Promise<string[]> {
        try {
            const types = await LocalAuthentication.supportedAuthenticationTypesAsync();
            return types.map(type => {
                switch (type) {
                    case LocalAuthentication.AuthenticationType.FINGERPRINT:
                        return 'Fingerprint';
                    case LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION:
                        return 'Face ID';
                    case LocalAuthentication.AuthenticationType.IRIS:
                        return 'Iris';
                    default:
                        return 'Biometric';
                }
            });
        } catch (error) {
            console.error('Error getting biometric types:', error);
            return [];
        }
    }

    /**
     * Authenticate with biometrics
     */
    static async authenticate(reason: string = 'Authenticate to continue'): Promise<boolean> {
        try {
            const available = await this.isAvailable();
            if (!available) {
                Alert.alert(
                    'Biometric Not Available',
                    'Please set up biometric authentication in your device settings.'
                );
                return false;
            }

            const result = await LocalAuthentication.authenticateAsync({
                promptMessage: reason,
                cancelLabel: 'Cancel',
                disableDeviceFallback: false,
            });

            return result.success;
        } catch (error) {
            console.error('Biometric authentication error:', error);
            return false;
        }
    }

    /**
     * Check if biometric is enabled for the app
     */
    static async isEnabled(): Promise<boolean> {
        try {
            const enabled = await AsyncStorage.getItem(this.BIOMETRIC_ENABLED_KEY);
            return enabled === 'true';
        } catch (error) {
            console.error('Error checking biometric enabled status:', error);
            return false;
        }
    }

    /**
     * Enable biometric authentication
     */
    static async enable(): Promise<boolean> {
        try {
            const available = await this.isAvailable();
            if (!available) {
                Alert.alert(
                    'Biometric Not Available',
                    'Biometric authentication is not available on this device.'
                );
                return false;
            }

            // Test authentication before enabling
            const authenticated = await this.authenticate('Enable biometric login');
            if (authenticated) {
                await AsyncStorage.setItem(this.BIOMETRIC_ENABLED_KEY, 'true');
                return true;
            }
            return false;
        } catch (error) {
            console.error('Error enabling biometric:', error);
            return false;
        }
    }

    /**
     * Disable biometric authentication
     */
    static async disable(): Promise<void> {
        try {
            await AsyncStorage.removeItem(this.BIOMETRIC_ENABLED_KEY);
        } catch (error) {
            console.error('Error disabling biometric:', error);
        }
    }
}
