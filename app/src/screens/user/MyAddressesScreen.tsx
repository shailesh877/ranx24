import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    RefreshControl,
    Alert,
    StatusBar
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Toast from 'react-native-toast-message';
import api from '../../services/api';
import * as Location from 'expo-location';
import { useTheme } from '../../context/ThemeContext';
import { useLocation } from '../../context/LocationContext';

const MyAddressesScreen = ({ navigation }) => {
    const { colors, isDark } = useTheme();
    const { setManualLocation } = useLocation();
    const [addresses, setAddresses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [selecting, setSelecting] = useState(false);

    useEffect(() => {
        fetchAddresses();
    }, []);

    const handleSelectAddress = async (address) => {
        if (selecting) return;
        setSelecting(true);

        try {
            let latitude = address.latitude;
            let longitude = address.longitude;

            // If coordinates are missing, try to geocode
            if (!latitude || !longitude) {
                const fullAddress = `${address.addressLine1}, ${address.addressLine2 ? address.addressLine2 + ', ' : ''}${address.city}, ${address.state}, ${address.pincode}`;
                try {
                    const geocoded = await Location.geocodeAsync(fullAddress);
                    if (geocoded && geocoded.length > 0) {
                        latitude = geocoded[0].latitude;
                        longitude = geocoded[0].longitude;
                    }
                } catch (geoError) {
                    console.log('Geocoding failed:', geoError);
                }
            }

            if (latitude && longitude) {
                setManualLocation({
                    latitude,
                    longitude,
                    city: address.city,
                    state: address.state
                });
                navigation.navigate('Main', { screen: 'Home' });
                Toast.show({
                    type: 'success',
                    text1: 'Location Updated',
                    text2: `Location set to ${address.city}`,
                });
            } else {
                Toast.show({
                    type: 'error',
                    text1: 'Invalid Address',
                    text2: 'Could not determine location coordinates.',
                });
            }
        } catch (error) {
            console.error('Selection error:', error);
            Toast.show({
                type: 'error',
                text1: 'Error',
                text2: 'Failed to select address',
            });
        } finally {
            setSelecting(false);
        }
    };

    const fetchAddresses = async () => {
        try {
            const response = await api.get('/addresses');
            setAddresses(response.data);
        } catch (error) {
            console.error('Error fetching addresses:', error);
            Toast.show({
                type: 'error',
                text1: 'Error',
                text2: 'Failed to load addresses',
            });
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const handleSetDefault = async (addressId) => {
        try {
            await api.put(`/addresses/${addressId}/default`);
            Toast.show({
                type: 'success',
                text1: 'Success',
                text2: 'Default address updated',
            });
            fetchAddresses();
        } catch (error) {
            Toast.show({
                type: 'error',
                text1: 'Error',
                text2: 'Failed to set default address',
            });
        }
    };

    const handleDelete = (addressId) => {
        Alert.alert(
            'Delete Address',
            'Are you sure you want to delete this address?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await api.delete(`/addresses/${addressId}`);
                            Toast.show({
                                type: 'success',
                                text1: 'Success',
                                text2: 'Address deleted',
                            });
                            fetchAddresses();
                        } catch (error) {
                            Toast.show({
                                type: 'error',
                                text1: 'Error',
                                text2: 'Failed to delete address',
                            });
                        }
                    },
                },
            ]
        );
    };

    const renderAddress = ({ item }) => (
        <View style={[styles.addressCard, { backgroundColor: colors.card }]}>
            <View style={styles.addressHeader}>
                <View style={styles.typeContainer}>
                    <Ionicons
                        name={item.type === 'home' ? 'home' : item.type === 'work' ? 'briefcase' : 'location'}
                        size={20}
                        color={colors.primary}
                    />
                    <Text style={[styles.addressType, { color: colors.text }]}>{item.type}</Text>
                </View>
                {item.isDefault && (
                    <View style={[styles.defaultBadge, { backgroundColor: isDark ? 'rgba(59, 130, 246, 0.2)' : '#DBEAFE' }]}>
                        <Text style={[styles.defaultText, { color: colors.primary }]}>Default</Text>
                    </View>
                )}
            </View>

            <Text style={[styles.addressLine, { color: colors.textSecondary }]}>{item.addressLine1}</Text>
            {item.addressLine2 && <Text style={[styles.addressLine, { color: colors.textSecondary }]}>{item.addressLine2}</Text>}
            <Text style={[styles.addressLine, { color: colors.textSecondary }]}>
                {item.city}, {item.state} - {item.pincode}
            </Text>
            {item.landmark && <Text style={[styles.landmark, { color: colors.textLight }]}>Landmark: {item.landmark}</Text>}

            <View style={[styles.actions, { borderTopColor: colors.border }]}>
                <TouchableOpacity
                    style={styles.actionButton}
                    onPress={() => handleSelectAddress(item)}
                >
                    <Ionicons name="checkmark-done-circle-outline" size={20} color={colors.primary} />
                    <Text style={[styles.actionText, { color: colors.primary }]}>Select</Text>
                </TouchableOpacity>

                {!item.isDefault && (
                    <TouchableOpacity
                        style={styles.actionButton}
                        onPress={() => handleSetDefault(item._id)}
                    >
                        <Ionicons name="checkmark-circle-outline" size={20} color="#10B981" />
                        <Text style={[styles.actionText, { color: '#10B981' }]}>Set Default</Text>
                    </TouchableOpacity>
                )}
                <TouchableOpacity
                    style={styles.actionButton}
                    onPress={() => handleDelete(item._id)}
                >
                    <Ionicons name="trash-outline" size={20} color="#EF4444" />
                    <Text style={[styles.actionText, { color: '#EF4444' }]}>Delete</Text>
                </TouchableOpacity>
            </View>
        </View>
    );

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
            <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} backgroundColor={colors.background} />
            <View style={[styles.header, { backgroundColor: colors.background, borderBottomColor: colors.border }]}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Ionicons name="arrow-back" size={24} color={colors.text} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: colors.text }]}>My Addresses</Text>
                <TouchableOpacity onPress={() => navigation.navigate('AddAddress')}>
                    <Ionicons name="add" size={24} color={colors.primary} />
                </TouchableOpacity>
            </View>

            <FlatList
                data={addresses}
                renderItem={renderAddress}
                keyExtractor={(item) => item._id}
                contentContainerStyle={styles.list}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={() => {
                            setRefreshing(true);
                            fetchAddresses();
                        }}
                        tintColor={colors.primary}
                    />
                }
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <Ionicons name="location-outline" size={60} color={colors.textLight} />
                        <Text style={[styles.emptyText, { color: colors.textLight }]}>No addresses saved</Text>
                        <TouchableOpacity
                            style={[styles.addButton, { backgroundColor: colors.primary }]}
                            onPress={() => navigation.navigate('AddAddress')}
                        >
                            <Text style={styles.addButtonText}>Add Address</Text>
                        </TouchableOpacity>
                    </View>
                }
            />
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
        borderBottomWidth: 1,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    list: {
        padding: 16,
    },
    addressCard: {
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        elevation: 1,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
    },
    addressHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    typeContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    addressType: {
        fontSize: 16,
        fontWeight: 'bold',
        textTransform: 'capitalize',
    },
    defaultBadge: {
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 12,
    },
    defaultText: {
        fontSize: 12,
        fontWeight: '600',
    },
    addressLine: {
        fontSize: 14,
        marginBottom: 4,
    },
    landmark: {
        fontSize: 12,
        marginTop: 4,
    },
    actions: {
        flexDirection: 'row',
        marginTop: 12,
        paddingTop: 12,
        borderTopWidth: 1,
        gap: 16,
    },
    actionButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    actionText: {
        fontSize: 14,
        fontWeight: '600',
    },
    emptyContainer: {
        alignItems: 'center',
        padding: 48,
    },
    emptyText: {
        fontSize: 16,
        marginTop: 16,
        marginBottom: 24,
    },
    addButton: {
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 8,
    },
    addButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
    },
});

export default MyAddressesScreen;
