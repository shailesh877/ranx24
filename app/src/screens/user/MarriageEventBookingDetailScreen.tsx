import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    ActivityIndicator,
    Alert,
    StatusBar,
    Image,
    RefreshControl
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import api from '../../services/api';
import { SPACING, SHADOWS } from '../../constants/theme';
import Toast from 'react-native-toast-message';
import RazorpayCheckout from 'react-native-razorpay';
import { getRazorpayKey } from '../../services/razorpayService';
import { useTheme } from '../../context/ThemeContext';

const MarriageEventBookingDetailScreen = ({ navigation, route }: any) => {
    const { colors, isDark } = useTheme();
    const { bookingId } = route.params;
    const [booking, setBooking] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);

    useEffect(() => {
        fetchBookingDetails();
    }, [bookingId]);

    const fetchBookingDetails = async () => {
        try {
            const response = await api.get(`/marriage-event-bookings/${bookingId}`);
            setBooking(response.data);
        } catch (error) {
            console.error('Error fetching marriage booking details:', error);
            Toast.show({ type: 'error', text1: 'Error', text2: 'Failed to load booking details' });
            navigation.goBack();
        } finally {
            setLoading(false);
        }
    };

    const handlePayment = async () => {
        if (!booking) return;

        setActionLoading(true);
        try {
            const razorpayKey = await getRazorpayKey();

            // Determine amount to pay
            let amountToPay = 0;
            let description = '';

            if (booking.payment_status === 'Pending') {
                amountToPay = booking.advance_amount - (booking.advance_paid || 0);
                description = `Advance Payment for ${booking.package_id?.name || 'Event'}`;
            } else {
                amountToPay = booking.total_price - (booking.advance_paid || 0);
                description = `Final Payment for ${booking.package_id?.name || 'Event'}`;
            }

            if (amountToPay <= 0) {
                Toast.show({ type: 'info', text1: 'Already Paid', text2: 'No pending amount to pay.' });
                setActionLoading(false);
                return;
            }

            const orderResponse = await api.post('/payment/order', { amount: amountToPay });
            const { id: order_id, currency, amount: razorpayAmount } = orderResponse.data;

            const options = {
                description: description,
                image: 'https://cdn-icons-png.flaticon.com/512/12145/12145443.png',
                currency: currency,
                key: razorpayKey,
                amount: razorpayAmount,
                name: 'RanX24 Events',
                order_id: order_id,
                prefill: {
                    contact: '',
                    email: ''
                },
                theme: { color: colors.primary }
            };

            RazorpayCheckout.open(options).then(async (data: any) => {
                const verifyResponse = await api.post('/payment/verify', {
                    razorpay_order_id: data.razorpay_order_id,
                    razorpay_payment_id: data.razorpay_payment_id,
                    razorpay_signature: data.razorpay_signature
                });

                if (verifyResponse.data.success) {
                    // Update advance paid and payment status in backend
                    await api.post(`/marriage-event-bookings/${booking._id}/pay-advance`, {
                        razorpay_payment_id: data.razorpay_payment_id,
                        amount_paid: amountToPay
                    });

                    Toast.show({ type: 'success', text1: 'Payment Successful!' });
                    fetchBookingDetails();
                } else {
                    Toast.show({ type: 'error', text1: 'Payment Verification Failed' });
                }
            }).catch((error: any) => {
                console.log('Payment Error:', error);
                Toast.show({ type: 'error', text1: 'Payment Cancelled/Failed', text2: error.description || 'Something went wrong' });
            }).finally(() => {
                setActionLoading(false);
            });

        } catch (error) {
            console.error('Event payment init error:', error);
            Toast.show({ type: 'error', text1: 'Failed to initiate payment' });
            setActionLoading(false);
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'Pending': return '#F59E0B';
            case 'Active': return '#3B82F6';
            case 'Completed': return '#10B981';
            case 'Cancelled': return '#EF4444';
            default: return '#6B7280';
        }
    };

    const getPaymentStatusColor = (status: string) => {
        switch (status) {
            case 'Paid': return '#10B981';
            case 'Partial Payment Paid': return '#F59E0B';
            case 'Pending': return '#EF4444';
            default: return '#6B7280';
        }
    };

    if (loading) {
        return (
            <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
                <ActivityIndicator size="large" color={colors.primary} />
            </View>
        );
    }

    if (!booking) {
        return (
            <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
                <View style={[styles.header, { backgroundColor: colors.background, borderBottomColor: colors.border }]}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                        <Ionicons name="arrow-back" size={24} color={colors.text} />
                    </TouchableOpacity>
                    <Text style={[styles.headerTitle, { color: colors.text }]}>Event Details</Text>
                </View>
                <View style={[styles.loadingContainer, { justifyContent: 'flex-start', paddingTop: 100, backgroundColor: colors.background }]}>
                    <Ionicons name="alert-circle-outline" size={64} color={colors.textLight} />
                    <Text style={{ marginTop: 16, fontSize: 16, color: colors.textSecondary }}>
                        Booking details not found.
                    </Text>
                </View>
            </SafeAreaView>
        );
    }

    const packageImg = booking.package_id?.images?.[0] || 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?q=80&w=600&auto=format&fit=crop';
    const remainingBalance = Math.max(0, booking.total_price - (booking.advance_paid || 0));

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top', 'left', 'right']}>
            <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} backgroundColor={colors.background} />

            {/* Header */}
            <View style={[styles.header, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                    <Ionicons name="arrow-back" size={24} color={colors.text} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: colors.text }]}>Event Booking</Text>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl
                        refreshing={loading}
                        onRefresh={fetchBookingDetails}
                        colors={[colors.primary]}
                        tintColor={colors.primary}
                    />
                }
            >
                {/* Banner Image */}
                <Image source={{ uri: packageImg }} style={styles.bannerImage} />

                <View style={styles.content}>
                    {/* Status & Contract */}
                    <View style={[styles.statusRow, { marginBottom: 16 }]}>
                        <View style={[styles.statusBadge, { backgroundColor: `${getStatusColor(booking.status)}15` }]}>
                            <Text style={[styles.statusText, { color: getStatusColor(booking.status) }]}>
                                {booking.status?.toUpperCase()}
                            </Text>
                        </View>
                        <View style={[styles.statusBadge, { backgroundColor: `${getPaymentStatusColor(booking.payment_status)}15` }]}>
                            <Text style={[styles.statusText, { color: getPaymentStatusColor(booking.payment_status) }]}>
                                {booking.payment_status?.toUpperCase()}
                            </Text>
                        </View>
                    </View>

                    {/* Booking Basic Details */}
                    <View style={[styles.section, { backgroundColor: colors.card }]}>
                        <Text style={[styles.contractText, { color: colors.textSecondary }]}>
                            Contract No: <Text style={{ color: colors.primary, fontWeight: '700' }}>{booking.contract_number}</Text>
                        </Text>
                        <Text style={[styles.packageName, { color: colors.text }]}>
                            {booking.package_id?.name || 'Event Package'}
                        </Text>
                        {booking.package_id?.hall_name && (
                            <View style={styles.iconInfoRow}>
                                <Ionicons name="location" size={16} color={colors.textSecondary} />
                                <Text style={[styles.hallName, { color: colors.textSecondary }]}>
                                    {booking.package_id.hall_name}
                                </Text>
                            </View>
                        )}
                        {booking.package_id?.description && (
                            <Text style={[styles.description, { color: colors.textSecondary }]}>
                                {booking.package_id.description}
                            </Text>
                        )}
                    </View>

                    {/* Event Schedule & Notes */}
                    <View style={[styles.section, { backgroundColor: colors.card }]}>
                        <Text style={[styles.sectionTitle, { color: colors.text }]}>Event Info</Text>
                        <View style={styles.infoDetailRow}>
                            <View style={[styles.infoIcon, { backgroundColor: isDark ? '#374151' : '#F1F5F9' }]}>
                                <Ionicons name="calendar-outline" size={20} color={colors.textSecondary} />
                            </View>
                            <View>
                                <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>Event Date</Text>
                                <Text style={[styles.infoValue, { color: colors.text }]}>
                                    {new Date(booking.event_date).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
                                </Text>
                            </View>
                        </View>

                        {booking.notes ? (
                            <View style={[styles.infoDetailRow, { marginTop: 12 }]}>
                                <View style={[styles.infoIcon, { backgroundColor: isDark ? '#374151' : '#F1F5F9' }]}>
                                    <Ionicons name="document-text-outline" size={20} color={colors.textSecondary} />
                                </View>
                                <View style={{ flex: 1 }}>
                                    <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>Special Notes</Text>
                                    <Text style={[styles.infoValue, { color: colors.text, fontStyle: 'italic' }]}>
                                        "{booking.notes}"
                                    </Text>
                                </View>
                            </View>
                        ) : null}
                    </View>

                    {/* Pricing details */}
                    <View style={[styles.section, { backgroundColor: colors.card }]}>
                        <Text style={[styles.sectionTitle, { color: colors.text }]}>Payment Summary</Text>
                        
                        <View style={styles.billRow}>
                            <Text style={[styles.billLabel, { color: colors.textSecondary }]}>Total Package Price</Text>
                            <Text style={[styles.billVal, { color: colors.text }]}>₹{booking.total_price.toLocaleString('en-IN')}</Text>
                        </View>
                        
                        <View style={styles.billRow}>
                            <Text style={[styles.billLabel, { color: colors.textSecondary }]}>Advance Required (15%)</Text>
                            <Text style={[styles.billVal, { color: colors.text }]}>₹{booking.advance_amount.toLocaleString('en-IN')}</Text>
                        </View>

                        <View style={[styles.divider, { backgroundColor: colors.border }]} />

                        <View style={styles.billRow}>
                            <Text style={[styles.billLabel, { color: '#16a34a', fontWeight: '600' }]}>Total Paid</Text>
                            <Text style={[styles.billVal, { color: '#16a34a', fontWeight: '700' }]}>
                                ₹{(booking.advance_paid || 0).toLocaleString('en-IN')}
                            </Text>
                        </View>

                        <View style={styles.billRow}>
                            <Text style={[styles.billLabel, { color: colors.text, fontWeight: '600' }]}>Remaining Balance</Text>
                            <Text style={[styles.billVal, { color: colors.primary, fontWeight: '700' }]}>
                                ₹{remainingBalance.toLocaleString('en-IN')}
                            </Text>
                        </View>

                        {booking.payment_status === 'Pending' ? (
                            <View style={[styles.noticeBox, { backgroundColor: isDark ? '#3b1515' : '#fef2f2' }]}>
                                <Ionicons name="alert-circle" size={16} color="#ef4444" />
                                <Text style={[styles.noticeText, { color: '#ef4444' }]}>
                                    Please pay the 15% advance amount to confirm your booking.
                                </Text>
                            </View>
                        ) : booking.payment_status === 'Partial Payment Paid' ? (
                            <View style={[styles.noticeBox, { backgroundColor: isDark ? '#1a2e1a' : '#f0fdf4' }]}>
                                <Ionicons name="checkmark-circle" size={16} color="#16a34a" />
                                <Text style={[styles.noticeText, { color: '#16a34a' }]}>
                                    Advance paid! Your booking is active. Remaining balance to be paid before/at the event.
                                </Text>
                            </View>
                        ) : (
                            <View style={[styles.noticeBox, { backgroundColor: isDark ? '#1a2e1a' : '#f0fdf4' }]}>
                                <Ionicons name="checkmark-circle" size={16} color="#16a34a" />
                                <Text style={[styles.noticeText, { color: '#16a34a' }]}>
                                    Fully paid! Enjoy your event.
                                </Text>
                            </View>
                        )}
                    </View>

                    {/* Actions */}
                    {booking.payment_status !== 'Paid' && booking.status !== 'Cancelled' && (
                        <TouchableOpacity
                            style={[styles.payBtn, { backgroundColor: colors.primary }]}
                            onPress={handlePayment}
                            disabled={actionLoading}
                        >
                            {actionLoading ? (
                                <ActivityIndicator color="#FFF" />
                            ) : (
                                <>
                                    <Ionicons name="card-outline" size={20} color="#FFF" />
                                    <Text style={styles.payBtnText}>
                                        {booking.payment_status === 'Pending'
                                            ? `Pay Advance - ₹${(booking.advance_amount - (booking.advance_paid || 0)).toLocaleString('en-IN')}`
                                            : `Pay Remaining Balance - ₹${remainingBalance.toLocaleString('en-IN')}`
                                        }
                                    </Text>
                                </>
                            )}
                        </TouchableOpacity>
                    )}

                    <View style={{ height: 40 }} />
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1 },
    loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16, borderBottomWidth: 1 },
    backBtn: { padding: 4 },
    headerTitle: { fontSize: 18, fontWeight: '700' },
    bannerImage: { width: '100%', height: 220, resizeMode: 'cover' },
    content: { padding: 16 },
    statusRow: { flexDirection: 'row', gap: 8 },
    statusBadge: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 },
    statusText: { fontSize: 12, fontWeight: '700' },
    section: { borderRadius: 16, padding: 16, marginBottom: 16, ...SHADOWS.light },
    contractText: { fontSize: 12, fontFamily: 'monospace', marginBottom: 6 },
    packageName: { fontSize: 20, fontWeight: '800', marginBottom: 4 },
    iconInfoRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 8 },
    hallName: { fontSize: 14, fontWeight: '500' },
    description: { fontSize: 13, lineHeight: 18, marginTop: 4 },
    sectionTitle: { fontSize: 16, fontWeight: '700', marginBottom: 12 },
    infoDetailRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
    infoIcon: { width: 36, height: 36, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
    infoLabel: { fontSize: 11, marginBottom: 2 },
    infoValue: { fontSize: 14, fontWeight: '600' },
    billRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
    billLabel: { fontSize: 14 },
    billVal: { fontSize: 14, fontWeight: '600' },
    divider: { height: 1, marginVertical: 12 },
    noticeBox: { flexDirection: 'row', gap: 8, padding: 12, borderRadius: 8, marginTop: 12 },
    noticeText: { fontSize: 12, flex: 1, fontWeight: '500', lineHeight: 16 },
    payBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, padding: 16, borderRadius: 14, marginTop: 8 },
    payBtnText: { color: '#FFF', fontSize: 16, fontWeight: '700' }
});

export default MarriageEventBookingDetailScreen;
