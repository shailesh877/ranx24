import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, ActivityIndicator, Alert } from 'react-native';
import MapView, { Marker, Region } from 'react-native-maps';
import * as Location from 'expo-location';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import { useLocation } from '../../context/LocationContext';

const { width, height } = Dimensions.get('window');
const ASPECT_RATIO = width / height;
const LATITUDE_DELTA = 0.0922;
const LONGITUDE_DELTA = LATITUDE_DELTA * ASPECT_RATIO;

const MapScreen = ({ navigation }: any) => {
    const { colors, isDark } = useTheme();
    const { setManualLocation } = useLocation();
    const mapRef = useRef<MapView>(null);

    const [region, setRegion] = useState<Region | null>(null);
    const [loading, setLoading] = useState(true);
    const [address, setAddress] = useState<string>('Locating...');
    const [selectedLocation, setSelectedLocation] = useState<{ latitude: number; longitude: number } | null>(null);

    useEffect(() => {
        getCurrentLocation();
    }, []);

    const getCurrentLocation = async () => {
        try {
            let { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
                Alert.alert('Permission to access location was denied');
                setLoading(false);
                return;
            }

            let location = await Location.getCurrentPositionAsync({});
            const newRegion = {
                latitude: location.coords.latitude,
                longitude: location.coords.longitude,
                latitudeDelta: LATITUDE_DELTA,
                longitudeDelta: LONGITUDE_DELTA,
            };

            setRegion(newRegion);
            setSelectedLocation({
                latitude: location.coords.latitude,
                longitude: location.coords.longitude
            });

            // Initial reverse geocode
            reverseGeocode(location.coords.latitude, location.coords.longitude);

            setLoading(false);
        } catch (error) {
            console.error(error);
            setLoading(false);
            Alert.alert('Error', 'Failed to get current location');
        }
    };

    const reverseGeocode = async (latitude: number, longitude: number) => {
        try {
            const result = await Location.reverseGeocodeAsync({ latitude, longitude });
            if (result.length > 0) {
                const item = result[0];
                const addressString = `${item.street || ''} ${item.city || ''}, ${item.region || ''}`;
                setAddress(addressString.trim());
            }
        } catch (error) {
            console.log('Reverse geocoding failed', error);
            setAddress('Unknown Location');
        }
    };

    const onRegionChangeComplete = (newRegion: Region) => {
        setSelectedLocation({
            latitude: newRegion.latitude,
            longitude: newRegion.longitude
        });
        reverseGeocode(newRegion.latitude, newRegion.longitude);
    };

    const handleConfirm = async () => {
        if (!selectedLocation) return;

        try {
            setLoading(true);
            const result = await Location.reverseGeocodeAsync({
                latitude: selectedLocation.latitude,
                longitude: selectedLocation.longitude
            });

            if (result.length > 0) {
                const item = result[0];
                // Update global location context
                setManualLocation({
                    latitude: selectedLocation.latitude,
                    longitude: selectedLocation.longitude,
                    city: item.city || item.subregion || '',
                    state: item.region || '',
                });

                navigation.goBack();
            }
        } catch (error) {
            console.error(error);
            Alert.alert('Error', 'Failed to set location');
        } finally {
            setLoading(false);
        }
    };

    if (loading && !region) {
        return (
            <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
                <ActivityIndicator size="large" color={colors.primary} />
                <Text style={{ marginTop: 10, color: colors.text }}>Loading Map...</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <MapView
                ref={mapRef}
                style={styles.map}
                initialRegion={region!}
                onRegionChangeComplete={onRegionChangeComplete}
                showsUserLocation
                showsMyLocationButton
            />

            {/* Center Marker */}
            <View style={styles.markerFixed}>
                <Ionicons name="location" size={40} color={colors.primary} />
            </View>

            {/* Back Button */}
            <TouchableOpacity
                style={[styles.backButton, { backgroundColor: colors.card }]}
                onPress={() => navigation.goBack()}
            >
                <Ionicons name="arrow-back" size={24} color={colors.text} />
            </TouchableOpacity>

            {/* Bottom Panel */}
            <View style={[styles.footer, { backgroundColor: colors.card }]}>
                <Text style={[styles.addressLabel, { color: colors.textSecondary }]}>Selected Location</Text>
                <Text style={[styles.addressText, { color: colors.text }]} numberOfLines={2}>
                    {address}
                </Text>

                <TouchableOpacity
                    style={[styles.confirmButton, { backgroundColor: colors.primary }]}
                    onPress={handleConfirm}
                >
                    <Text style={styles.confirmButtonText}>Confirm Location</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    map: {
        width: '100%',
        height: '100%',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    markerFixed: {
        position: 'absolute',
        top: '50%',
        left: '50%',
        marginLeft: -20,
        marginTop: -40,
        alignItems: 'center',
        justifyContent: 'center',
    },
    backButton: {
        position: 'absolute',
        top: 50,
        left: 20,
        padding: 10,
        borderRadius: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 5,
    },
    footer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        padding: 20,
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 10,
    },
    addressLabel: {
        fontSize: 12,
        fontWeight: '600',
        marginBottom: 4,
    },
    addressText: {
        fontSize: 16,
        fontWeight: '700',
        marginBottom: 20,
    },
    confirmButton: {
        padding: 16,
        borderRadius: 12,
        alignItems: 'center',
    },
    confirmButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
    },
});

export default MapScreen;
