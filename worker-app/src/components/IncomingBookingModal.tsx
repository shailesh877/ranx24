import React, { useEffect, useState, useRef } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Modal,
    TouchableOpacity,
    Dimensions,
    Image,
    Vibration,
    Platform,
} from 'react-native';
import { Audio } from 'expo-av';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../theme/theme';
import MapView, { Marker } from 'react-native-maps';

const { width, height } = Dimensions.get('window');

interface IncomingBookingModalProps {
    visible: boolean;
    booking: any;
    onAccept: () => void;
    onReject: () => void;
}

const IncomingBookingModal: React.FC<IncomingBookingModalProps> = ({
    visible,
    booking,
    onAccept,
    onReject,
}) => {
    const [sound, setSound] = useState<Audio.Sound | null>(null);
    const mapRef = useRef<MapView>(null);

    useEffect(() => {
        let soundObject: Audio.Sound | null = null;

        const playSound = async () => {
            if (visible) {
                try {
                    // Load and play sound
                    const { sound } = await Audio.Sound.createAsync(
                        require('../../assets/sounds/ringtone.mp3'),
                        { shouldPlay: true, isLooping: true }
                    );
                    soundObject = sound;
                    setSound(sound);

                    // Vibrate pattern
                    const PATTERN = [1000, 2000, 3000];
                    Vibration.vibrate(PATTERN, true);
                } catch (error) {
                    console.error('Error playing sound:', error);
                }
            } else {
                // Stop sound and vibration if not visible
                if (soundObject) {
                    await soundObject.unloadAsync();
                    setSound(null);
                }
                Vibration.cancel();
            }
        };

        playSound();

        return () => {
            if (soundObject) {
                soundObject.unloadAsync();
            }
            Vibration.cancel();
        };
    }, [visible]);

    if (!booking) return null;

    return (
        <Modal
            visible={visible}
            transparent
            animationType="slide"
            statusBarTranslucent
        >
            <View style={styles.container}>
                {/* Map Background */}
                <View style={styles.mapContainer}>
                    <MapView
                        ref={mapRef}
                        style={styles.map}
                        initialRegion={{
                            latitude: booking.location?.coordinates?.[1] || 25.3176, // Default to Varanasi
                            longitude: booking.location?.coordinates?.[0] || 82.9739,
                            latitudeDelta: 0.01,
                            longitudeDelta: 0.01,
                        }}
                        scrollEnabled={false}
                        zoomEnabled={false}
                    >
                        {booking.location?.coordinates && (
                            <Marker
                                coordinate={{
                                    latitude: booking.location.coordinates[1],
                                    longitude: booking.location.coordinates[0],
                                }}
                            >
                                <View style={styles.markerContainer}>
                                    <Ionicons name="location" size={30} color={theme.colors.primary} />
                                </View>
                            </Marker>
                        )}
                    </MapView>
                    <View style={styles.mapOverlay} />
                </View>

                {/* Content */}
                <View style={styles.content}>
                    <View style={styles.header}>
                        <View style={styles.serviceIcon}>
                            <Ionicons name="construct" size={32} color="#FFFFFF" />
                        </View>
                        <Text style={styles.title}>New Booking Request!</Text>
                        <Text style={styles.subtitle}>Someone needs your help</Text>
                    </View>

                    <View style={styles.card}>
                        <View style={styles.customerInfo}>
                            <View style={styles.avatar}>
                                <Text style={styles.avatarText}>
                                    {booking.user.name.charAt(0).toUpperCase()}
                                </Text>
                            </View>
                            <View>
                                <Text style={styles.customerName}>{booking.user.name}</Text>
                                <Text style={styles.distance}>2.5 km away</Text>
                            </View>
                            <View style={styles.priceTag}>
                                <Text style={styles.price}>₹{booking.totalAmount}</Text>
                            </View>
                        </View>

                        <View style={styles.divider} />

                        <View style={styles.detailsRow}>
                            <Ionicons name="location-outline" size={20} color="#64748B" />
                            <Text style={styles.address} numberOfLines={2}>
                                {booking.address.addressLine1}, {booking.address.city}
                            </Text>
                        </View>

                        <View style={styles.detailsRow}>
                            <Ionicons name="time-outline" size={20} color="#64748B" />
                            <Text style={styles.time}>
                                {new Date(booking.scheduledDate).toLocaleDateString()} • {booking.scheduledTime}
                            </Text>
                        </View>
                    </View>

                    {/* Action Buttons */}
                    <View style={styles.actions}>
                        <TouchableOpacity
                            style={[styles.button, styles.rejectButton]}
                            onPress={onReject}
                        >
                            <Ionicons name="close" size={32} color="#FFFFFF" />
                            <Text style={styles.buttonText}>Decline</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[styles.button, styles.acceptButton]}
                            onPress={onAccept}
                        >
                            <Ionicons name="checkmark" size={32} color="#FFFFFF" />
                            <Text style={styles.buttonText}>Accept</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#1E293B',
    },
    mapContainer: {
        ...StyleSheet.absoluteFillObject,
        height: height * 0.6,
    },
    map: {
        ...StyleSheet.absoluteFillObject,
    },
    mapOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(30, 41, 59, 0.4)',
    },
    markerContainer: {
        padding: 4,
        backgroundColor: '#FFFFFF',
        borderRadius: 20,
        elevation: 4,
    },
    content: {
        flex: 1,
        justifyContent: 'flex-end',
        padding: 24,
        paddingBottom: Platform.OS === 'ios' ? 40 : 24,
    },
    header: {
        alignItems: 'center',
        marginBottom: 32,
    },
    serviceIcon: {
        width: 64,
        height: 64,
        borderRadius: 32,
        backgroundColor: theme.colors.primary,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
        borderWidth: 4,
        borderColor: 'rgba(255, 255, 255, 0.2)',
    },
    title: {
        fontSize: 24,
        fontWeight: '800',
        color: '#FFFFFF',
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 16,
        color: '#94A3B8',
    },
    card: {
        backgroundColor: '#FFFFFF',
        borderRadius: 24,
        padding: 20,
        marginBottom: 32,
    },
    customerInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
    },
    avatar: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: '#F1F5F9',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    avatarText: {
        fontSize: 20,
        fontWeight: '700',
        color: '#64748B',
    },
    customerName: {
        fontSize: 18,
        fontWeight: '700',
        color: '#1E293B',
    },
    distance: {
        fontSize: 14,
        color: '#64748B',
    },
    priceTag: {
        marginLeft: 'auto',
        backgroundColor: '#DCFCE7',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 12,
    },
    price: {
        fontSize: 16,
        fontWeight: '700',
        color: '#166534',
    },
    divider: {
        height: 1,
        backgroundColor: '#F1F5F9',
        marginVertical: 16,
    },
    detailsRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
        gap: 12,
    },
    address: {
        flex: 1,
        fontSize: 14,
        color: '#334155',
        lineHeight: 20,
    },
    time: {
        fontSize: 14,
        color: '#334155',
    },
    actions: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: 20,
    },
    button: {
        flex: 1,
        height: 64,
        borderRadius: 32,
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'row',
        gap: 8,
    },
    rejectButton: {
        backgroundColor: '#EF4444',
    },
    acceptButton: {
        backgroundColor: '#10B981',
    },
    buttonText: {
        fontSize: 18,
        fontWeight: '700',
        color: '#FFFFFF',
    },
});

export default IncomingBookingModal;
