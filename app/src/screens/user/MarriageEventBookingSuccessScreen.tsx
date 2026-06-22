import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, StatusBar } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';

const MarriageEventBookingSuccessScreen = () => {
    const { colors, isDark } = useTheme();
    const navigation = useNavigation();
    const route = useRoute();
    // @ts-ignore
    const { booking, packageName } = route.params || {};

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
            <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} backgroundColor={colors.background} />

            <View style={styles.content}>
                {/* Success Icon */}
                <View style={[styles.iconCircle, { backgroundColor: '#dcfce7' }]}>
                    <Ionicons name="checkmark-circle" size={72} color="#16a34a" />
                </View>

                <Text style={[styles.title, { color: colors.text }]}>Booking Confirmed! 🎉</Text>
                <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
                    Your event has been successfully booked.
                </Text>

                {/* Booking Details Card */}
                <View style={[styles.detailCard, { backgroundColor: colors.card }]}>
                    {booking?.contract_number && (
                        <View style={styles.detailRow}>
                            <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>Contract No.</Text>
                            <Text style={[styles.detailVal, { color: colors.primary, fontWeight: '800' }]}>
                                {booking.contract_number}
                            </Text>
                        </View>
                    )}
                    <View style={styles.detailRow}>
                        <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>Package</Text>
                        <Text style={[styles.detailVal, { color: colors.text }]} numberOfLines={1}>
                            {packageName || 'Event Package'}
                        </Text>
                    </View>
                    {booking?.event_date && (
                        <View style={styles.detailRow}>
                            <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>Event Date</Text>
                            <Text style={[styles.detailVal, { color: colors.text }]}>{booking.event_date}</Text>
                        </View>
                    )}
                    <View style={styles.detailRow}>
                        <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>Advance Paid</Text>
                        <Text style={[styles.detailVal, { color: '#16a34a', fontWeight: '700' }]}>
                            ₹{(booking?.advance_paid || 0).toLocaleString('en-IN')}
                        </Text>
                    </View>
                    <View style={styles.detailRow}>
                        <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>Total Price</Text>
                        <Text style={[styles.detailVal, { color: colors.text }]}>
                            ₹{(booking?.total_price || 0).toLocaleString('en-IN')}
                        </Text>
                    </View>
                    <View style={[styles.statusBadge, { backgroundColor: '#fef9c3' }]}>
                        <Ionicons name="time-outline" size={14} color="#ca8a04" />
                        <Text style={[styles.statusText, { color: '#ca8a04' }]}>
                            {booking?.payment_status || 'Partial Payment Paid'}
                        </Text>
                    </View>
                </View>

                <Text style={[styles.note, { color: colors.textSecondary }]}>
                    💡 Remaining 85% balance to be paid at the event venue.
                </Text>
            </View>

            {/* Buttons */}
            <View style={styles.bottomBtns}>
                <TouchableOpacity
                    style={[styles.homeBtn, { backgroundColor: colors.primary }]}
                    onPress={() => {
                        // @ts-ignore
                        navigation.reset({ index: 0, routes: [{ name: 'Main' }] });
                    }}
                >
                    <Ionicons name="home-outline" size={18} color="#fff" />
                    <Text style={styles.homeBtnText}>Go to Home</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1 },
    content: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
    iconCircle: {
        width: 120, height: 120, borderRadius: 60,
        justifyContent: 'center', alignItems: 'center', marginBottom: 24,
    },
    title: { fontSize: 26, fontWeight: '800', marginBottom: 8, textAlign: 'center' },
    subtitle: { fontSize: 15, textAlign: 'center', marginBottom: 24, lineHeight: 22 },
    detailCard: {
        width: '100%', borderRadius: 16, padding: 20,
        elevation: 3, shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 4,
        marginBottom: 16,
    },
    detailRow: {
        flexDirection: 'row', justifyContent: 'space-between',
        alignItems: 'center', marginBottom: 12,
    },
    detailLabel: { fontSize: 13 },
    detailVal: { fontSize: 14, fontWeight: '600', maxWidth: '60%', textAlign: 'right' },
    statusBadge: {
        flexDirection: 'row', alignItems: 'center', gap: 6,
        paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20,
        alignSelf: 'center', marginTop: 4,
    },
    statusText: { fontSize: 13, fontWeight: '700' },
    note: { fontSize: 13, textAlign: 'center', lineHeight: 20 },
    bottomBtns: { padding: 20, paddingBottom: 32 },
    homeBtn: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
        gap: 8, paddingVertical: 16, borderRadius: 14,
    },
    homeBtnText: { color: '#fff', fontWeight: '700', fontSize: 16 },
});

export default MarriageEventBookingSuccessScreen;
