import React, { useState, useEffect } from 'react';
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
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';

const EditProfileScreen = ({ navigation }) => {
    const { colors, isDark } = useTheme();
    const { user, updateUser } = useAuth();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
    });

    useEffect(() => {
        if (user) {
            setFormData({
                name: user.name || '',
                email: user.email || '',
                phone: user.phone || '',
            });
        }
    }, [user]);

    const handleSave = async () => {
        // Validation
        if (!formData.name.trim()) {
            Toast.show({
                type: 'error',
                text1: 'Error',
                text2: 'Name is required',
            });
            return;
        }

        if (formData.email && !isValidEmail(formData.email)) {
            Toast.show({
                type: 'error',
                text1: 'Error',
                text2: 'Please enter a valid email',
            });
            return;
        }

        try {
            setLoading(true);
            const response = await api.put('/users/profile', formData);

            // Update user in context
            if (updateUser) {
                updateUser(response.data);
            }

            Toast.show({
                type: 'success',
                text1: 'Success',
                text2: 'Profile updated successfully',
            });

            navigation.goBack();
        } catch (error) {
            console.error('Error updating profile:', error);
            Toast.show({
                type: 'error',
                text1: 'Error',
                text2: error.response?.data?.message || 'Failed to update profile',
            });
        } finally {
            setLoading(false);
        }
    };

    const isValidEmail = (email) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    };

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
            <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} backgroundColor={colors.background} />
            <View style={[styles.header, { backgroundColor: colors.background, borderBottomColor: colors.border }]}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Ionicons name="arrow-back" size={24} color={colors.text} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: colors.text }]}>Edit Profile</Text>
                <View style={{ width: 24 }} />
            </View>

            <ScrollView style={styles.content}>
                <View style={[styles.avatarContainer, { backgroundColor: colors.card }]}>
                    <View style={[styles.avatar, { backgroundColor: isDark ? '#374151' : '#DBEAFE' }]}>
                        <Ionicons name="person" size={50} color={colors.primary} />
                    </View>

                </View>

                <View style={[styles.form, { backgroundColor: colors.card }]}>
                    <View style={styles.inputGroup}>
                        <Text style={[styles.label, { color: colors.text }]}>Name *</Text>
                        <TextInput
                            style={[styles.input, { backgroundColor: isDark ? '#374151' : '#FFFFFF', borderColor: colors.border, color: colors.text }]}
                            value={formData.name}
                            onChangeText={(text) => setFormData({ ...formData, name: text })}
                            placeholder="Enter your name"
                            placeholderTextColor={colors.textLight}
                        />
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={[styles.label, { color: colors.text }]}>Email</Text>
                        <TextInput
                            style={[styles.input, { backgroundColor: isDark ? '#374151' : '#FFFFFF', borderColor: colors.border, color: colors.text }]}
                            value={formData.email}
                            onChangeText={(text) => setFormData({ ...formData, email: text })}
                            placeholder="Enter your email"
                            placeholderTextColor={colors.textLight}
                            keyboardType="email-address"
                            autoCapitalize="none"
                        />
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={[styles.label, { color: colors.text }]}>Phone Number</Text>
                        <TextInput
                            style={[styles.input, styles.inputDisabled, { backgroundColor: isDark ? '#1F2937' : '#F3F4F6', borderColor: colors.border, color: colors.textSecondary }]}
                            value={formData.phone}
                            editable={false}
                            placeholder="Phone number"
                            placeholderTextColor={colors.textLight}
                        />
                        <Text style={[styles.helperText, { color: colors.textSecondary }]}>
                            Phone number cannot be changed
                        </Text>
                    </View>
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
                        <Text style={styles.saveButtonText}>Save Changes</Text>
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
    avatarContainer: {
        alignItems: 'center',
        paddingVertical: 32,
        marginBottom: 16,
    },
    avatar: {
        width: 100,
        height: 100,
        borderRadius: 50,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
    },
    changePhotoButton: {
        paddingHorizontal: 16,
        paddingVertical: 8,
    },
    changePhotoText: {
        fontSize: 14,
        fontWeight: '600',
    },
    form: {
        padding: 16,
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
    inputDisabled: {
        opacity: 0.8,
    },
    helperText: {
        fontSize: 12,
        marginTop: 4,
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

export default EditProfileScreen;
