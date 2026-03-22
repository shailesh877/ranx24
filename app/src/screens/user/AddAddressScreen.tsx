import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    ScrollView,
    ActivityIndicator,
    StatusBar
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Toast from 'react-native-toast-message';
import api from '../../services/api';
import { useTheme } from '../../context/ThemeContext';

import * as Location from 'expo-location';

const AddAddressScreen = ({ navigation, route }) => {
    const { colors, isDark } = useTheme();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        type: 'home',
        addressLine1: '',
        addressLine2: '',
        city: '',
        state: '',
        pincode: '',
        landmark: '',
        isDefault: false,
    });

    const addressTypes = ['home', 'work', 'other'];

    const handleSave = async () => {
        // Validation
        if (!formData.addressLine1.trim()) {
            Toast.show({
                type: 'error',
                text1: 'Error',
                text2: 'Address Line 1 is required',
            });
            return;
        }

        if (!formData.city.trim()) {
            Toast.show({
                type: 'error',
                text1: 'Error',
                text2: 'City is required',
            });
            return;
        }

        if (!formData.state.trim()) {
            Toast.show({
                type: 'error',
                text1: 'Error',
                text2: 'State is required',
            });
            return;
        }

        if (!formData.pincode.trim() || formData.pincode.length !== 6) {
            Toast.show({
                type: 'error',
                text1: 'Error',
                text2: 'Please enter a valid 6-digit pincode',
            });
            return;
        }

        try {
            setLoading(true);

            // Geocode address
            const fullAddress = `${formData.addressLine1}, ${formData.addressLine2 ? formData.addressLine2 + ', ' : ''}${formData.city}, ${formData.state}, ${formData.pincode}`;
            let latitude = null;
            let longitude = null;

            try {
                const geocoded = await Location.geocodeAsync(fullAddress);
                if (geocoded && geocoded.length > 0) {
                    latitude = geocoded[0].latitude;
                    longitude = geocoded[0].longitude;
                }
            } catch (geoError) {
                console.log('Geocoding failed:', geoError);
                // Continue saving without coordinates if geocoding fails
            }

            // Ensure boolean values are properly sent
            const addressData = {
                ...formData,
                latitude,
                longitude,
                isDefault: Boolean(formData.isDefault), // Explicitly convert to boolean
            };

            await api.post('/addresses', addressData);

            Toast.show({
                type: 'success',
                text1: 'Success',
                text2: 'Address added successfully',
            });

            navigation.goBack();
        } catch (error) {
            console.error('Error adding address:', error);
            Toast.show({
                type: 'error',
                text1: 'Error',
                text2: error.response?.data?.message || 'Failed to add address',
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
            <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} backgroundColor={colors.background} />
            <View style={[styles.header, { backgroundColor: colors.background, borderBottomColor: colors.border }]}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Ionicons name="arrow-back" size={24} color={colors.text} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: colors.text }]}>Add Address</Text>
                <View style={{ width: 24 }} />
            </View>

            <ScrollView style={styles.content}>
                <View style={styles.form}>
                    <Text style={[styles.sectionTitle, { color: colors.text }]}>Address Type</Text>
                    <View style={styles.typeContainer}>
                        {addressTypes.map((type) => (
                            <TouchableOpacity
                                key={type}
                                style={[
                                    styles.typeButton,
                                    { backgroundColor: colors.card, borderColor: colors.border },
                                    formData.type === type && { borderColor: colors.primary, backgroundColor: isDark ? 'rgba(59, 130, 246, 0.2)' : '#EFF6FF' },
                                ]}
                                onPress={() => setFormData({ ...formData, type })}
                            >
                                <Ionicons
                                    name={
                                        type === 'home'
                                            ? 'home'
                                            : type === 'work'
                                                ? 'briefcase'
                                                : 'location'
                                    }
                                    size={20}
                                    color={formData.type === type ? colors.primary : colors.textSecondary}
                                />
                                <Text
                                    style={[
                                        styles.typeText,
                                        { color: colors.textSecondary },
                                        formData.type === type && { color: colors.primary },
                                    ]}
                                >
                                    {type.charAt(0).toUpperCase() + type.slice(1)}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={[styles.label, { color: colors.text }]}>Address Line 1 *</Text>
                        <TextInput
                            style={[styles.input, { backgroundColor: isDark ? '#374151' : '#FFFFFF', borderColor: colors.border, color: colors.text }]}
                            value={formData.addressLine1}
                            onChangeText={(text) =>
                                setFormData({ ...formData, addressLine1: text })
                            }
                            placeholder="House No., Building Name"
                            placeholderTextColor={colors.textLight}
                        />
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={[styles.label, { color: colors.text }]}>Address Line 2</Text>
                        <TextInput
                            style={[styles.input, { backgroundColor: isDark ? '#374151' : '#FFFFFF', borderColor: colors.border, color: colors.text }]}
                            value={formData.addressLine2}
                            onChangeText={(text) =>
                                setFormData({ ...formData, addressLine2: text })
                            }
                            placeholder="Road Name, Area, Colony"
                            placeholderTextColor={colors.textLight}
                        />
                    </View>

                    <View style={styles.row}>
                        <View style={[styles.inputGroup, { flex: 1, marginRight: 8 }]}>
                            <Text style={[styles.label, { color: colors.text }]}>City *</Text>
                            <TextInput
                                style={[styles.input, { backgroundColor: isDark ? '#374151' : '#FFFFFF', borderColor: colors.border, color: colors.text }]}
                                value={formData.city}
                                onChangeText={(text) =>
                                    setFormData({ ...formData, city: text })
                                }
                                placeholder="City"
                                placeholderTextColor={colors.textLight}
                            />
                        </View>

                        <View style={[styles.inputGroup, { flex: 1, marginLeft: 8 }]}>
                            <Text style={[styles.label, { color: colors.text }]}>State *</Text>
                            <TextInput
                                style={[styles.input, { backgroundColor: isDark ? '#374151' : '#FFFFFF', borderColor: colors.border, color: colors.text }]}
                                value={formData.state}
                                onChangeText={(text) =>
                                    setFormData({ ...formData, state: text })
                                }
                                placeholder="State"
                                placeholderTextColor={colors.textLight}
                            />
                        </View>
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={[styles.label, { color: colors.text }]}>Pincode *</Text>
                        <TextInput
                            style={[styles.input, { backgroundColor: isDark ? '#374151' : '#FFFFFF', borderColor: colors.border, color: colors.text }]}
                            value={formData.pincode}
                            onChangeText={(text) =>
                                setFormData({ ...formData, pincode: text })
                            }
                            placeholder="6-digit pincode"
                            placeholderTextColor={colors.textLight}
                            keyboardType="number-pad"
                            maxLength={6}
                        />
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={[styles.label, { color: colors.text }]}>Landmark</Text>
                        <TextInput
                            style={[styles.input, { backgroundColor: isDark ? '#374151' : '#FFFFFF', borderColor: colors.border, color: colors.text }]}
                            value={formData.landmark}
                            onChangeText={(text) =>
                                setFormData({ ...formData, landmark: text })
                            }
                            placeholder="Nearby landmark"
                            placeholderTextColor={colors.textLight}
                        />
                    </View>

                    <TouchableOpacity
                        style={styles.defaultContainer}
                        onPress={() =>
                            setFormData({ ...formData, isDefault: !formData.isDefault })
                        }
                    >
                        <View style={[styles.checkbox, { borderColor: colors.primary }]}>
                            {formData.isDefault && (
                                <Ionicons name="checkmark" size={16} color={colors.primary} />
                            )}
                        </View>
                        <Text style={[styles.defaultText, { color: colors.text }]}>Set as default address</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>

            <View style={[styles.footer, { backgroundColor: colors.card, borderTopColor: colors.border }]}>
                <TouchableOpacity
                    style={[styles.saveButton, { backgroundColor: colors.primary }, loading && styles.saveButtonDisabled]}
                    onPress={handleSave}
                    disabled={loading}
                >
                    {loading ? (
                        <ActivityIndicator color="white" />
                    ) : (
                        <Text style={styles.saveButtonText}>Save Address</Text>
                    )}
                </TouchableOpacity>
            </View>
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
    content: {
        flex: 1,
    },
    form: {
        padding: 16,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 12,
    },
    typeContainer: {
        flexDirection: 'row',
        gap: 12,
        marginBottom: 24,
    },
    typeButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        paddingVertical: 12,
        borderRadius: 8,
        borderWidth: 2,
    },
    typeText: {
        fontSize: 14,
        fontWeight: '600',
    },
    inputGroup: {
        marginBottom: 20,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        marginBottom: 8,
    },
    input: {
        borderWidth: 1,
        borderRadius: 8,
        padding: 12,
        fontSize: 16,
    },
    row: {
        flexDirection: 'row',
    },
    defaultContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 8,
    },
    checkbox: {
        width: 24,
        height: 24,
        borderRadius: 4,
        borderWidth: 2,
        marginRight: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    defaultText: {
        fontSize: 14,
    },
    footer: {
        padding: 16,
        borderTopWidth: 1,
    },
    saveButton: {
        borderRadius: 8,
        padding: 16,
        alignItems: 'center',
    },
    saveButtonDisabled: {
        opacity: 0.6,
    },
    saveButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
    },
});

export default AddAddressScreen;
