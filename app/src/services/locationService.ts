import * as Location from 'expo-location';
import { Alert } from 'react-native';

export interface LocationCoords {
    latitude: number;
    longitude: number;
}

export interface LocationPermissionResult {
    granted: boolean;
    coords?: LocationCoords;
}

/**
 * Request location permissions from the user
 */
export const requestLocationPermission = async (): Promise<boolean> => {
    try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        return status === 'granted';
    } catch (error) {
        console.error('Error requesting location permission:', error);
        return false;
    }
};

/**
 * Get current location with permission check
 */
export const getCurrentLocation = async (): Promise<LocationPermissionResult> => {
    try {
        // Check if permission is granted
        const { status } = await Location.getForegroundPermissionsAsync();

        if (status !== 'granted') {
            const permissionResult = await Location.requestForegroundPermissionsAsync();
            if (permissionResult.status !== 'granted') {
                return { granted: false };
            }
        }

        // Get current position
        const location = await Location.getCurrentPositionAsync({
            accuracy: Location.Accuracy.Balanced,
        });

        return {
            granted: true,
            coords: {
                latitude: location.coords.latitude,
                longitude: location.coords.longitude,
            },
        };
    } catch (error) {
        console.error('Error getting current location:', error);
        return { granted: false };
    }
};

/**
 * Calculate distance between two coordinates in kilometers
 */
export const calculateDistance = (
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
): number => {
    const R = 6371; // Radius of the earth in km
    const dLat = deg2rad(lat2 - lat1);
    const dLon = deg2rad(lon2 - lon1);
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c; // Distance in km
    return Math.round(distance * 10) / 10; // Round to 1 decimal
};

const deg2rad = (deg: number): number => {
    return deg * (Math.PI / 180);
};

/**
 * Reverse geocode coordinates to address
 */
export const reverseGeocode = async (
    latitude: number,
    longitude: number
): Promise<Location.LocationGeocodedAddress | null> => {
    try {
        const addresses = await Location.reverseGeocodeAsync({
            latitude,
            longitude,
        });

        if (addresses.length > 0) {
            return addresses[0];
        }
        return null;
    } catch (error) {
        console.error('Error reverse geocoding:', error);
        return null;
    }
};

/**
 * Geocode address to coordinates
 */
export const geocodeAddress = async (
    address: string
): Promise<LocationCoords | null> => {
    try {
        const locations = await Location.geocodeAsync(address);

        if (locations.length > 0) {
            return {
                latitude: locations[0].latitude,
                longitude: locations[0].longitude,
            };
        }
        return null;
    } catch (error) {
        console.error('Error geocoding address:', error);
        return null;
    }
};

/**
 * Format distance for display
 */
export const formatDistance = (distanceKm: number): string => {
    if (distanceKm < 1) {
        return `${Math.round(distanceKm * 1000)}m`;
    }
    return `${distanceKm.toFixed(1)}km`;
};

/**
 * Check if location services are enabled
 */
export const isLocationEnabled = async (): Promise<boolean> => {
    try {
        return await Location.hasServicesEnabledAsync();
    } catch (error) {
        console.error('Error checking location services:', error);
        return false;
    }
};

/**
 * Show location permission alert
 */
export const showLocationPermissionAlert = () => {
    Alert.alert(
        'Location Permission Required',
        'This app needs access to your location to show nearby workers and calculate distances.',
        [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Grant Permission', onPress: requestLocationPermission },
        ]
    );
};
