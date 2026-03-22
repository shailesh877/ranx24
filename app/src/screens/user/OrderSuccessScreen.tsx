import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Image,
    StatusBar
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';

const OrderSuccessScreen = ({ navigation, route }) => {
    const { colors, isDark } = useTheme();
    const { bookingId } = route.params || {};

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
            <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} backgroundColor={colors.background} />
            <View style={styles.content}>
                <View style={styles.successIcon}>
                    <Ionicons name="checkmark-circle" size={100} color="#10B981" />
                </View>

                <Text style={[styles.title, { color: colors.text }]}>Booking Confirmed!</Text>
                <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
                    Your booking has been placed successfully
                </Text>

                {bookingId && (
                    <View style={[styles.bookingIdContainer, { backgroundColor: colors.card }]}>
                        <Text style={[styles.bookingIdLabel, { color: colors.textSecondary }]}>Booking ID</Text>
                        <Text style={[styles.bookingId, { color: colors.primary }]}>#{bookingId.slice(-8)}</Text>
                    </View>
                )}

                <View style={[styles.infoBox, { backgroundColor: isDark ? 'rgba(30, 64, 175, 0.2)' : '#EFF6FF' }]}>
                    <Ionicons name="information-circle-outline" size={24} color={colors.primary} />
                    <Text style={[styles.infoText, { color: colors.primary }]}>
                        You will receive a confirmation call from our team shortly
                    </Text>
                </View>

                <View style={styles.buttonsContainer}>
                    <TouchableOpacity
                        style={[styles.primaryButton, { backgroundColor: colors.primary }]}
                        onPress={() => navigation.navigate('Main', { screen: 'MyBookings' })}
                    >
                        <Text style={[styles.primaryButtonText, { color: '#FFFFFF' }]}>View My Bookings</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.secondaryButton, { backgroundColor: colors.card, borderColor: colors.border }]}
                        onPress={() => navigation.navigate('Main', { screen: 'Home' })}
                    >
                        <Text style={[styles.secondaryButtonText, { color: colors.text }]}>Back to Home</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    content: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 24,
    },
    successIcon: {
        marginBottom: 24,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        marginBottom: 8,
        textAlign: 'center',
    },
    subtitle: {
        fontSize: 16,
        textAlign: 'center',
        marginBottom: 32,
    },
    bookingIdContainer: {
        padding: 16,
        borderRadius: 12,
        alignItems: 'center',
        marginBottom: 24,
        minWidth: 200,
    },
    bookingIdLabel: {
        fontSize: 12,
        marginBottom: 4,
    },
    bookingId: {
        fontSize: 20,
        fontWeight: 'bold',
        fontFamily: 'monospace',
    },
    infoBox: {
        flexDirection: 'row',
        padding: 16,
        borderRadius: 12,
        marginBottom: 32,
        alignItems: 'center',
        gap: 12,
    },
    infoText: {
        flex: 1,
        fontSize: 14,
    },
    buttonsContainer: {
        width: '100%',
        gap: 12,
    },
    primaryButton: {
        padding: 16,
        borderRadius: 12,
        alignItems: 'center',
    },
    primaryButtonText: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    secondaryButton: {
        padding: 16,
        borderRadius: 12,
        alignItems: 'center',
        borderWidth: 2,
    },
    secondaryButtonText: {
        fontSize: 16,
        fontWeight: '600',
    },
});

export default OrderSuccessScreen;

