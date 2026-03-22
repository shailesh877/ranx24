import * as Location from 'expo-location';
import { Alert, Linking, Platform } from 'react-native';

export class LocationService {
    private static hasPermission: boolean | null = null;

    /**
     * Request location permissions
     */
    static async requestPermissions(): Promise<boolean> {
        try {
            const { status } = await Location.requestForegroundPermissionsAsync();

            if (status !== 'granted') {
                Alert.alert(
                    'Location Permission Required',
                    'This app needs location access to show nearby jobs and navigate to customer locations.',
                    [
                        { text: 'Cancel', style: 'cancel' },
                        {
                            text: 'Open Settings',
                            onPress: () => {
                                if (Platform.OS === 'ios') {
                                    Linking.openURL('app-settings:');
                                } else {
                                    Linking.openSettings();
                                }
                            },
                        },
                    ]
                );
                this.hasPermission = false;
                return false;
            }

            this.hasPermission = true;
            return true;
        } catch (error) {
            console.error('Error requesting location permissions:', error);
            this.hasPermission = false;
            return false;
        }
    }

    /**
     * Check if location permissions are granted
     */
    static async checkPermissions(): Promise<boolean> {
        try {
            const { status } = await Location.getForegroundPermissionsAsync();
            this.hasPermission = status === 'granted';
            return this.hasPermission;
        } catch (error) {
            console.error('Error checking location permissions:', error);
            return false;
        }
    }

    /**
     * Get current location
     */
    static async getCurrentLocation(): Promise<Location.LocationObject | null> {
        try {
            const hasPermission = await this.checkPermissions();

            if (!hasPermission) {
                const granted = await this.requestPermissions();
                if (!granted) return null;
            }

            const location = await Location.getCurrentPositionAsync({
                accuracy: Location.Accuracy.Balanced,
            });

            return location;
        } catch (error) {
            console.error('Error getting current location:', error);
            Alert.alert('Error', 'Failed to get your current location');
            return null;
        }
    }

    /**
     * Watch location changes
     */
    static async watchLocation(
        callback: (location: Location.LocationObject) => void
    ): Promise<Location.LocationSubscription | null> {
        try {
            const hasPermission = await this.checkPermissions();

            if (!hasPermission) {
                const granted = await this.requestPermissions();
                if (!granted) return null;
            }

            const subscription = await Location.watchPositionAsync(
                {
                    accuracy: Location.Accuracy.Balanced,
                    timeInterval: 10000, // Update every 10 seconds
                    distanceInterval: 50, // Update every 50 meters
                },
                callback
            );

            return subscription;
        } catch (error) {
            console.error('Error watching location:', error);
            return null;
        }
    }
}
