

import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    ActivityIndicator,
    Alert,
    Linking,
    StatusBar,
    Image,
    Platform,
    RefreshControl
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import api from '../../services/api';
import { SPACING, SHADOWS, SIZES } from '../../constants/theme';
import Toast from 'react-native-toast-message';
import RazorpayCheckout from 'react-native-razorpay';
import { getRazorpayKey } from '../../services/razorpayService';
import { useTheme } from '../../context/ThemeContext';
import ReviewModal from '../../components/ReviewModal';
import ReviewCard from '../../components/ReviewCard';
import StarRating from '../../components/StarRating';
import { generateInvoice } from '../../utils/InvoiceGenerator';

const BookingDetailScreen = ({ navigation, route }: any) => {
    const { colors, isDark } = useTheme();
    const { bookingId } = route.params;
    const [booking, setBooking] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);
    const [showReviewModal, setShowReviewModal] = useState(false);
    const [userReview, setUserReview] = useState<any>(null);

    useEffect(() => {
        fetchBookingDetails();
    }, [bookingId]);

    const fetchBookingDetails = async () => {
        try {
            const response = await api.get(`/bookings/${bookingId}`);
            setBooking(response.data);

            // Fetch user's review for this booking if completed
            if (response.data.status === 'completed') {
                fetchUserReview();
            }
        } catch (error) {
            console.error('Error fetching booking details:', error);
            Toast.show({ type: 'error', text1: 'Error', text2: 'Failed to load booking details' });
            navigation.goBack();
        } finally {
            setLoading(false);
        }
    };

    const fetchUserReview = async () => {
        try {
            const response = await api.get('/reviews/my');
            const review = response.data.find((r: any) => r.booking._id === bookingId);
            setUserReview(review || null);
        } catch (error) {
            console.error('Error fetching user review:', error);
        }
    };

    const handleOnlinePayment = async () => {
        if (!booking) return;

        setActionLoading(true);
        try {
            // Fetch Razorpay key from backend
            const razorpayKey = await getRazorpayKey();

            const amount = Math.max(0, (booking.finalPrice || 0) - (booking.amountPaid || 0));
            const orderResponse = await api.post('/payment/order', { amount });
            const { id: order_id, currency, amount: razorpayAmount } = orderResponse.data;

            const options = {
                description: `Payment for ${booking.service}`,
                image: 'https://cdn-icons-png.flaticon.com/512/12145/12145443.png',
                currency: currency,
                key: razorpayKey,
                amount: razorpayAmount,
                name: 'RanX24',
                order_id: order_id,
                prefill: {
                    contact: booking.user?.phone || '',
                    email: booking.user?.email || ''
                },
                theme: { color: colors.primary }
            };

            RazorpayCheckout.open(options).then(async (data: any) => {
                const verifyResponse = await api.post('/payment/verify', {
                    razorpay_order_id: data.razorpay_order_id,
                    razorpay_payment_id: data.razorpay_payment_id,
                    razorpay_signature: data.razorpay_signature,
                    bookingId: booking._id, // Send booking ID to update status
                    amount: amount // Send amount to update amountPaid
                });

                if (verifyResponse.data.success) {
                    Toast.show({ type: 'success', text1: 'Payment Successful!' });
                    // Update booking status locally and fetch fresh details
                    fetchBookingDetails();
                } else {
                    Toast.show({ type: 'error', text1: 'Payment Verification Failed' });
                }
            }).catch((error: any) => {
                console.log('Payment Error:', error);
                // Razorpay returns error object with code and description
                Toast.show({ type: 'error', text1: 'Payment Cancelled/Failed', text2: error.description || 'Something went wrong' });
            }).finally(() => {
                setActionLoading(false);
            });

        } catch (error) {
            console.error('Online payment init error:', error);
            Toast.show({ type: 'error', text1: 'Failed to initiate payment' });
            setActionLoading(false);
        }
    };

    const handleCancelBooking = async () => {
        Alert.alert(
            'Cancel Booking',
            'Are you sure you want to cancel this booking? This action cannot be undone.',
            [
                { text: 'No', style: 'cancel' },
                {
                    text: 'Yes, Cancel',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            setActionLoading(true);
                            await api.put(`/bookings/${bookingId}/cancel`);
                            Toast.show({ type: 'success', text1: 'Booking Cancelled' });
                            fetchBookingDetails();
                        } catch (error) {
                            console.error('Error cancelling booking:', error);
                            Toast.show({ type: 'error', text1: 'Cancellation Failed', text2: 'Could not cancel booking.' });
                        } finally {
                            setActionLoading(false);
                        }
                    },
                },
            ]
        );
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'pending': return '#F59E0B';
            case 'confirmed': return '#3B82F6';
            case 'in-progress': return '#8B5CF6';
            case 'completed': return '#10B981';
            case 'cancelled': return '#EF4444';
            default: return '#6B7280';
        }
    };

    const getStatusLabel = (status: string) => {
        switch (status) {
            case 'pending': return 'Pending Confirmation';
            case 'confirmed': return 'Booking Confirmed';
            case 'in-progress': return 'Work in Progress';
            case 'completed': return 'Completed';
            case 'cancelled': return 'Cancelled';
            default: return status;
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
                    <Text style={[styles.headerTitle, { color: colors.text }]}>Booking Details</Text>
                </View>
                <View style={[styles.loadingContainer, { justifyContent: 'flex-start', paddingTop: 100, backgroundColor: colors.background }]}>
                    <Ionicons name="alert-circle-outline" size={64} color={colors.textLight} />
                    <Text style={{ marginTop: 16, fontSize: 16, color: colors.textSecondary }}>
                        Booking details not found.
                    </Text>
                    <Text style={{ marginTop: 8, fontSize: 12, color: colors.textLight }}>
                        ID: {bookingId}
                    </Text>
                </View>
            </SafeAreaView>
        );
    }

    // Chat is enabled only if booking is confirmed or in-progress
    const isChatEnabled = ['confirmed', 'in-progress'].includes(booking.status);

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
            <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} backgroundColor={colors.background} />

            {/* Header */}
            <View style={[styles.header, { backgroundColor: colors.background, borderBottomColor: colors.border }]}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                    <Ionicons name="arrow-back" size={24} color={colors.text} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: colors.text }]}>Booking Details</Text>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView 
                contentContainerStyle={styles.content} 
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

                {/* Status Banner */}
                <View style={[styles.statusBanner, { backgroundColor: `${getStatusColor(booking.status)}15` }]}>
                    <Ionicons name="information-circle" size={20} color={getStatusColor(booking.status)} />
                    <Text style={[styles.statusText, { color: getStatusColor(booking.status) }]}>
                        {getStatusLabel(booking.status)}
                    </Text>
                </View>

                {/* Worker Card */}
                <View style={[styles.section, { backgroundColor: colors.card }]}>
                    <Text style={[styles.sectionTitle, { color: colors.text }]}>Assigned Professional</Text>
                    <View style={styles.workerCard}>
                        <View style={styles.workerInfo}>
                            <View style={[styles.workerAvatar, { backgroundColor: isDark ? '#374151' : '#EFF6FF' }]}>
                                <Ionicons name="person" size={24} color={colors.primary} />
                            </View>
                            <View>
                                <Text style={[styles.workerName, { color: colors.text }]}>
                                    {booking.worker ? `${booking.worker.firstName} ${booking.worker.lastName}` : (booking.workerName || 'Waiting for assignment...')}
                                </Text>
                                <Text style={[styles.workerRole, { color: colors.textSecondary }]}>{booking.category}</Text>
                            </View>
                        </View>

                        {booking.worker && (
                            <TouchableOpacity
                                style={[styles.chatBtn, { backgroundColor: colors.primary }, !isChatEnabled && styles.disabledBtn]}
                                onPress={() => {
                                    if (isChatEnabled) {
                                        navigation.navigate('Chat', {
                                            bookingId: booking._id,
                                            workerName: `${booking.worker.firstName} ${booking.worker.lastName}`,
                                            workerId: booking.worker._id
                                        });
                                    } else {
                                        Toast.show({ type: 'info', text1: 'Chat Unavailable', text2: 'Chat is only available for confirmed bookings.' });
                                    }
                                }}
                                activeOpacity={isChatEnabled ? 0.7 : 1}
                            >
                                <Ionicons name="chatbubble-ellipses" size={20} color="#FFF" />
                                <Text style={styles.chatBtnText}>Chat</Text>
                            </TouchableOpacity>
                        )}
                    </View>
                </View>

                {/* Service Details */}
                <View style={[styles.section, { backgroundColor: colors.card }]}>
                    <Text style={[styles.sectionTitle, { color: colors.text }]}>Service Details</Text>
                    <View style={styles.detailRow}>
                        <View style={[styles.detailIcon, { backgroundColor: isDark ? '#374151' : '#F1F5F9' }]}>
                            <Ionicons name="briefcase-outline" size={20} color={colors.textSecondary} />
                        </View>
                        <View>
                            <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>Service</Text>
                            <Text style={[styles.detailValue, { color: colors.text }]}>{booking.service}</Text>
                        </View>
                    </View>
                    <View style={styles.detailRow}>
                        <View style={[styles.detailIcon, { backgroundColor: isDark ? '#374151' : '#F1F5F9' }]}>
                            <Ionicons name="calendar-outline" size={20} color={colors.textSecondary} />
                        </View>
                        <View>
                            <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>Date & Time</Text>
                            <Text style={[styles.detailValue, { color: colors.text }]}>
                                {new Date(booking.bookingDate).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })} • {booking.bookingTime}
                            </Text>
                        </View>
                    </View>
                    <View style={styles.detailRow}>
                        <View style={[styles.detailIcon, { backgroundColor: isDark ? '#374151' : '#F1F5F9' }]}>
                            <Ionicons name="location-outline" size={20} color={colors.textSecondary} />
                        </View>
                        <View style={{ flex: 1 }}>
                            <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>Address</Text>
                            <Text style={[styles.detailValue, { color: colors.text }]}>
                                {booking.address?.street}, {booking.address?.city}, {booking.address?.zipCode}
                            </Text>
                        </View>
                    </View>
                </View>

                {/* Payment Summary */}
                <View style={[styles.section, { backgroundColor: colors.card }]}>
                    <Text style={[styles.sectionTitle, { color: colors.text }]}>Payment Summary</Text>
                    <View style={styles.billRow}>
                        <Text style={[styles.billLabel, { color: colors.textSecondary }]}>Service Price</Text>
                        <Text style={[styles.billValue, { color: colors.text }]}>₹{booking.price}</Text>
                    </View>

                    {booking.platformFee > 0 && (
                        <View style={styles.billRow}>
                            <Text style={[styles.billLabel, { color: colors.textSecondary }]}>Platform Fee</Text>
                            <Text style={[styles.billValue, { color: colors.text }]}>+₹{booking.platformFee}</Text>
                        </View>
                    )}
                    
                    {booking.gstAmount > 0 && (
                        <View style={styles.billRow}>
                            <Text style={[styles.billLabel, { color: colors.textSecondary }]}>GST (18%)</Text>
                            <Text style={[styles.billValue, { color: colors.text }]}>+₹{booking.gstAmount}</Text>
                        </View>
                    )}

                    {booking.couponDiscount > 0 && (
                        <View style={styles.billRow}>
                            <Text style={[styles.billLabel, { color: '#10B981' }]}>Coupon Discount</Text>
                            <Text style={[styles.billValue, { color: '#10B981' }]}>-₹{booking.couponDiscount}</Text>
                        </View>
                    )}

                    {booking.membershipDiscount > 0 && (
                        <View style={styles.billRow}>
                            <Text style={[styles.billLabel, { color: '#F59E0B' }]}>Membership Discount</Text>
                            <Text style={[styles.billValue, { color: '#F59E0B' }]}>-₹{booking.membershipDiscount}</Text>
                        </View>
                    )}

                    {booking.coinDiscount > 0 && (
                        <View style={styles.billRow}>
                            <Text style={[styles.billLabel, { color: '#F59E0B' }]}>Coin Discount</Text>
                            <Text style={[styles.billValue, { color: '#F59E0B' }]}>-₹{booking.coinDiscount}</Text>
                        </View>
                    )}

                    {booking.walletAmountUsed > 0 && (
                        <View style={styles.billRow}>
                            <Text style={[styles.billLabel, { color: colors.primary }]}>Wallet Used</Text>
                            <Text style={[styles.billValue, { color: colors.primary }]}>-₹{booking.walletAmountUsed}</Text>
                        </View>
                    )}

                    <View style={[styles.divider, { backgroundColor: colors.border }]} />

                    <View style={styles.billRow}>
                        <Text style={[styles.billLabel, { color: colors.text, fontWeight: '600' }]}>Total Booking Amount</Text>
                        <Text style={[styles.billValue, { color: colors.text }]}>₹{booking.finalPrice}</Text>
                    </View>

                    <View style={styles.billRow}>
                        <Text style={[styles.billLabel, { color: colors.primary, fontWeight: '600' }]}>Advance Paid (15%)</Text>
                        <Text style={[styles.billValue, { color: colors.primary }]}>₹{booking.amountPaid}</Text>
                    </View>

                    <View style={styles.billRow}>
                        <Text style={[styles.totalLabel, { color: colors.text }]}>Remaining Balance (85%)</Text>
                        <Text style={[styles.totalValue, { color: colors.text }]}>₹{Math.max(0, (booking.finalPrice || 0) - (booking.amountPaid || 0))}</Text>
                    </View>

                    <View style={[styles.paymentStatusBadge, {
                        backgroundColor: 
                            booking.paymentStatus === 'paid' ? (isDark ? 'rgba(16, 185, 129, 0.2)' : '#ECFDF5') : 
                            booking.paymentStatus === 'partial' ? (isDark ? 'rgba(245, 158, 11, 0.2)' : '#FFFBEB') :
                            (isDark ? 'rgba(239, 68, 68, 0.2)' : '#FEF2F2'),
                        borderColor: 
                            booking.paymentStatus === 'paid' ? '#10B981' : 
                            booking.paymentStatus === 'partial' ? '#F59E0B' : 
                            '#EF4444'
                    }]}>
                        <Text style={[styles.paymentStatusText, {
                            color: 
                                booking.paymentStatus === 'paid' ? '#10B981' : 
                                booking.paymentStatus === 'partial' ? '#F59E0B' : 
                                '#EF4444'
                        }]}>
                            Payment Status: {booking.paymentStatus === 'partial' ? 'PARTIALLY PAID (ADVANCE)' : booking.paymentStatus?.toUpperCase()}
                        </Text>
                    </View>
                </View>

                {/* Review Section */}
                {booking.status === 'completed' && (
                    <View style={[styles.section, { backgroundColor: colors.card }]}>
                        <Text style={[styles.sectionTitle, { color: colors.text }]}>Your Review</Text>
                        {userReview ? (
                            <ReviewCard
                                userName="You"
                                rating={userReview.rating}
                                comment={userReview.comment}
                                date={userReview.createdAt}
                            />
                        ) : (
                            <View style={[styles.reviewPrompt, { backgroundColor: isDark ? '#374151' : '#F8FAFC' }]}>
                                <Ionicons name="star-outline" size={32} color={colors.textLight} />
                                <Text style={[styles.reviewPromptText, { color: colors.textSecondary }]}>
                                    Share your experience with this service
                                </Text>
                                <TouchableOpacity
                                    style={[styles.reviewBtn, { backgroundColor: colors.primary }]}
                                    onPress={() => setShowReviewModal(true)}
                                >
                                    <Ionicons name="star" size={18} color="#FFF" />
                                    <Text style={styles.reviewBtnText}>Write Review</Text>
                                </TouchableOpacity>
                            </View>
                        )}
                    </View>
                )}

                {/* Actions */}
                <View style={styles.actionsContainer}>
                    {booking.paymentStatus !== 'paid' && booking.status !== 'cancelled' && (
                        <TouchableOpacity
                            style={[styles.primaryBtn, { backgroundColor: colors.primary }]}
                            onPress={handleOnlinePayment}
                            disabled={actionLoading}
                        >
                            {actionLoading ? (
                                <ActivityIndicator color="#FFF" />
                            ) : (
                                <Text style={styles.primaryBtnText}>Pay Now (Razorpay)</Text>
                            )}
                        </TouchableOpacity>
                    )}

                    {booking.status === 'completed' && (
                        <TouchableOpacity
                            style={[styles.secondaryBtn, { borderColor: colors.primary, backgroundColor: isDark ? 'rgba(59, 130, 246, 0.1)' : '#F0F7FF' }]}
                            onPress={() => generateInvoice(booking)}
                            disabled={actionLoading}
                        >
                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                                <Ionicons name="download-outline" size={20} color={colors.primary} />
                                <Text style={[styles.secondaryBtnText, { color: colors.primary }]}>Download Invoice</Text>
                            </View>
                        </TouchableOpacity>
                    )}

                    {booking.status === 'pending' && (
                        <TouchableOpacity
                            style={[styles.cancelBtn, { backgroundColor: isDark ? 'rgba(239, 68, 68, 0.1)' : '#FEF2F2', borderColor: '#FECACA' }]}
                            onPress={handleCancelBooking}
                            disabled={actionLoading}
                        >
                            {actionLoading ? <ActivityIndicator color="#EF4444" /> : <Text style={styles.cancelBtnText}>Cancel Booking</Text>}
                        </TouchableOpacity>
                    )}
                </View>

                <View style={{ height: 40 }} />
            </ScrollView>

            {/* Review Modal */}
            {booking && (
                <ReviewModal
                    visible={showReviewModal}
                    onClose={() => setShowReviewModal(false)}
                    bookingId={booking._id}
                    workerId={booking.worker?._id}
                    workerName={booking.worker ? `${booking.worker.firstName} ${booking.worker.lastName}` : 'Worker'}
                    onReviewSubmitted={() => {
                        fetchUserReview();
                    }}
                />
            )}
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1 },
    loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    header: { flexDirection: 'row', alignItems: 'center', padding: 16, borderBottomWidth: 1 },
    backBtn: { padding: 4 },
    headerTitle: { fontSize: 18, fontWeight: '700', marginLeft: 12 },
    content: { padding: 16 },
    statusBanner: { flexDirection: 'row', alignItems: 'center', gap: 8, padding: 12, borderRadius: 12, marginBottom: 16 },
    statusText: { fontSize: 14, fontWeight: '600' },
    section: { borderRadius: 16, padding: 16, marginBottom: 16, ...SHADOWS.light },
    sectionTitle: { fontSize: 16, fontWeight: '700', marginBottom: 12 },
    workerCard: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
    workerInfo: { flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 },
    workerAvatar: { width: 48, height: 48, borderRadius: 24, justifyContent: 'center', alignItems: 'center' },
    workerName: { fontSize: 16, fontWeight: '600' },
    workerRole: { fontSize: 13 },
    chatBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 16, paddingVertical: 10, borderRadius: 20 },
    chatBtnText: { color: '#FFF', fontSize: 13, fontWeight: '600' },
    disabledBtn: { backgroundColor: '#94A3B8', opacity: 0.7 },
    detailRow: { flexDirection: 'row', gap: 12, marginBottom: 16 },
    detailIcon: { width: 32, height: 32, borderRadius: 8, justifyContent: 'center', alignItems: 'center' },
    detailLabel: { fontSize: 12, marginBottom: 2 },
    detailValue: { fontSize: 14, fontWeight: '500' },
    billRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
    billLabel: { fontSize: 14 },
    billValue: { fontSize: 14, fontWeight: '600' },
    divider: { height: 1, marginVertical: 12 },
    totalLabel: { fontSize: 16, fontWeight: '700' },
    totalValue: { fontSize: 18, fontWeight: '700' },
    paymentStatusBadge: { marginTop: 16, padding: 10, borderRadius: 8, borderWidth: 1, alignItems: 'center' },
    paymentStatusText: { fontSize: 13, fontWeight: '600' },
    actionsContainer: { gap: 12 },
    primaryBtn: { padding: 16, borderRadius: 12, alignItems: 'center' },
    primaryBtnText: { color: '#FFF', fontSize: 16, fontWeight: '700' },
    secondaryBtn: { borderWidth: 1, padding: 16, borderRadius: 12, alignItems: 'center' },
    secondaryBtnText: { fontSize: 16, fontWeight: '700' },
    cancelBtn: { padding: 16, borderRadius: 12, alignItems: 'center', borderWidth: 1 },
    cancelBtnText: { color: '#EF4444', fontSize: 16, fontWeight: '700' },
    reviewPrompt: { alignItems: 'center', padding: 24, borderRadius: 12 },
    reviewPromptText: { fontSize: 14, marginTop: 12, marginBottom: 16, textAlign: 'center' },
    reviewBtn: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 20, paddingVertical: 12, borderRadius: 10 },
    reviewBtnText: { color: '#FFF', fontSize: 15, fontWeight: '600' },
});

export default BookingDetailScreen;
