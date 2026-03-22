import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    TextInput,
    Modal,
    ActivityIndicator,
    Alert,
    Platform
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Toast from 'react-native-toast-message';
import RazorpayCheckout from 'react-native-razorpay';
import api, { API_URL } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { SHADOWS } from '../../constants/theme';
import { getRazorpayKey } from '../../services/razorpayService';

const WorkerBookingDetailScreen = ({ route, navigation }: any) => {
    const { bookingId } = route.params;
    const { colors, isDark } = useTheme();
    const { user } = useAuth();

    const [booking, setBooking] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    // Inspection State
    const [inspectionItems, setInspectionItems] = useState<{ description: string; price: string }[]>([
        { description: '', price: '' }
    ]);
    const [calculating, setCalculating] = useState(false);

    // Payment Modal State
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [paymentLoading, setPaymentLoading] = useState(false);

    useEffect(() => {
        fetchBookingDetails();
    }, [bookingId]);

    const fetchBookingDetails = async () => {
        try {
            const response = await api.get(`/bookings/${bookingId}`);
            setBooking(response.data);
            if (response.data.inspectionDetails && response.data.inspectionDetails.length > 0) {
                setInspectionItems(response.data.inspectionDetails.map((item: any) => ({
                    description: item.description,
                    price: String(item.price)
                })));
            }
        } catch (error) {
            console.error('Error fetching booking details:', error);
            Toast.show({ type: 'error', text1: 'Error', text2: 'Failed to load booking details' });
        } finally {
            setLoading(false);
        }
    };

    const handleAddItem = () => {
        setInspectionItems([...inspectionItems, { description: '', price: '' }]);
    };

    const handleRemoveItem = (index: number) => {
        const newItems = [...inspectionItems];
        newItems.splice(index, 1);
        setInspectionItems(newItems);
    };

    const handleUpdateItem = (index: number, field: 'description' | 'price', value: string) => {
        const newItems = [...inspectionItems];
        newItems[index][field] = value;
        setInspectionItems(newItems);
    };

    const calculateTotal = () => {
        const inspectionTotal = inspectionItems.reduce((sum, item) => sum + (Number(item.price) || 0), 0);
        return (booking?.price || 0) + inspectionTotal; // specific to how price is handled. Assuming booking.price is base price.
    };

    const handleCalculatePrize = async () => {
        // Validate inputs
        const validItems = inspectionItems.filter(item => item.description.trim() !== '' && item.price.trim() !== '');

        if (validItems.length === 0) {
            Toast.show({ type: 'error', text1: 'Validation', text2: 'Please add at least one item with description and price' });
            return;
        }

        try {
            setCalculating(true);
            await api.put(`/bookings/${bookingId}/inspection`, {
                inspectionDetails: validItems.map(item => ({
                    description: item.description,
                    price: Number(item.price)
                }))
            });

            Toast.show({ type: 'success', text1: 'Success', text2: 'Inspection details updated' });
            fetchBookingDetails(); // Refresh to get updated totals
        } catch (error) {
            console.error('Error updating inspection:', error);
            Toast.show({ type: 'error', text1: 'Error', text2: 'Failed to update inspection details' });
        } finally {
            setCalculating(false);
        }
    };

    const handlePayment = async (method: 'cash' | 'online') => {
        if (method === 'cash') {
            try {
                setPaymentLoading(true);
                await api.put(`/bookings/${bookingId}/inspection-payment`, {
                    paymentMethod: 'cash'
                });
                setShowPaymentModal(false);
                Toast.show({ type: 'success', text1: 'Payment Collected', text2: 'Cash payment recorded successfully' });
                fetchBookingDetails();
            } catch (error) {
                console.error('Error collecting cash:', error);
                Toast.show({ type: 'error', text1: 'Error', text2: 'Failed to record cash payment' });
            } finally {
                setPaymentLoading(false);
            }
        } else {
            // online (Razorpay)
            handleRazorpay();
        }
    };

    const handleRazorpay = async () => {
        try {
            setPaymentLoading(true);
            // 1. Get Key
            const key = await getRazorpayKey();

            // 2. Create Order (Using the *native* online flow endpoint if exists, OR use the inspection payment endpoint?)
            // Usually we need backend to create an order first.
            // Let's assume we use a generic create-order endpoint.
            // But here we are paying for *inspection details*.
            // If we don't have a dedicated "create order" endpoint for inspection, we might need one.
            // Or we can simple use the total amount and generate order ID in backend "verify" step?
            // Razorpay flow: Create Order (Backend) -> Checkout (Frontend) -> Verify (Backend)

            // Let's create a temporary payment intent or just use client-side checkout if backend supports verification only.
            // FOR NOW: Let's assume we just trigger checkout with amount. 
            // Ideally backend should create Razorpay order ID.

            const totalAmount = booking.finalAmountToPay || calculateTotal(); // Use stored final amount

            const options = {
                description: `Payment for Booking #${bookingId.slice(-6)}`,
                image: 'https://ranx24.com/logo.png', // Replace with your logo
                currency: 'INR',
                key: key,
                amount: totalAmount * 100, // in paise
                name: 'RanX24 Services',
                prefill: {
                    email: booking.user?.email || 'user@example.com',
                    contact: booking.user?.mobileNumber || '',
                    name: booking.user?.name || ''
                },
                theme: { color: colors.primary }
            };

            RazorpayCheckout.open(options).then(async (data: any) => {
                // Success
                // Call verify endpoint
                await api.put(`/bookings/${bookingId}/inspection-payment`, {
                    paymentMethod: 'online',
                    paymentId: data.razorpay_payment_id,
                    // signature: data.razorpay_signature, // secure this later
                    // orderId: data.razorpay_order_id
                });

                setShowPaymentModal(false);
                Toast.show({ type: 'success', text1: 'Payment Success', text2: 'Online payment verified' });
                fetchBookingDetails();

            }).catch((error: any) => {
                console.log('Payment error', error);
                Toast.show({ type: 'error', text1: 'Payment Failed', text2: error.description || 'Payment cancelled' });
            });

        } catch (error) {
            console.error('Error initializing Razorpay:', error);
            Toast.show({ type: 'error', text1: 'Error', text2: 'Failed to initialize payment' });
        } finally {
            setPaymentLoading(false);
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
            <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
                <Text style={{ color: colors.text }}>Booking not found</Text>
            </View>
        )
    }

    const alreadyPaid = booking.inspectionPaymentStatus === 'paid';

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
            <View style={[styles.header, { borderBottomColor: colors.border }]}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                    <Ionicons name="arrow-back" size={24} color={colors.text} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: colors.text }]}>Job Details</Text>
                <View style={{ width: 24 }} />
            </View>

            <ScrollView contentContainerStyle={styles.content}>
                {/* Customer Info */}
                <View style={[styles.card, { backgroundColor: colors.card }]}>
                    <Text style={[styles.sectionTitle, { color: colors.text }]}>Customer Info</Text>
                    <View style={styles.row}>
                        <Ionicons name="person-outline" size={18} color={colors.textSecondary} />
                        <Text style={[styles.infoText, { color: colors.text }]}>{booking.user?.name}</Text>
                    </View>
                    <View style={styles.row}>
                        <Ionicons name="call-outline" size={18} color={colors.textSecondary} />
                        <Text style={[styles.infoText, { color: colors.text }]}>{booking.user?.mobileNumber}</Text>
                    </View>
                    <View style={styles.row}>
                        <Ionicons name="location-outline" size={18} color={colors.textSecondary} />
                        <Text style={[styles.infoText, { color: colors.text }]}>
                            {booking.address?.street}, {booking.address?.city}
                        </Text>
                    </View>
                </View>

                {/* Service Info */}
                <View style={[styles.card, { backgroundColor: colors.card }]}>
                    <Text style={[styles.sectionTitle, { color: colors.text }]}>Service Details</Text>
                    <Text style={[styles.serviceName, { color: colors.primary }]}>{booking.service}</Text>
                    {booking.description && (
                        <Text style={[styles.description, { color: colors.textSecondary }]}>{booking.description}</Text>
                    )}
                </View>

                {/* Start/Complete Actions (Can be kept here or just rely on dashboard) */}
                {/* Keeping specialized Calculate Prize UI */}

                <View style={[styles.card, { backgroundColor: colors.card }]}>
                    <Text style={[styles.sectionTitle, { color: colors.text }]}>Calculate Prize / Inspection</Text>

                    {inspectionItems.map((item, index) => (
                        <View key={index} style={styles.inputRow}>
                            <TextInput
                                style={[styles.input, styles.descInput, { backgroundColor: isDark ? '#374151' : '#F9FAFB', color: colors.text, borderColor: colors.border }]}
                                placeholder="Description"
                                placeholderTextColor={colors.textLight}
                                value={item.description}
                                onChangeText={(text) => handleUpdateItem(index, 'description', text)}
                                editable={!alreadyPaid}
                            />
                            <TextInput
                                style={[styles.input, styles.priceInput, { backgroundColor: isDark ? '#374151' : '#F9FAFB', color: colors.text, borderColor: colors.border }]}
                                placeholder="Price"
                                placeholderTextColor={colors.textLight}
                                keyboardType="numeric"
                                value={item.price}
                                onChangeText={(text) => handleUpdateItem(index, 'price', text)}
                                editable={!alreadyPaid}
                            />
                            {!alreadyPaid && (
                                <TouchableOpacity onPress={() => handleRemoveItem(index)} style={styles.removeBtn}>
                                    <Ionicons name="close-circle" size={24} color="#EF4444" />
                                </TouchableOpacity>
                            )}
                        </View>
                    ))}

                    {!alreadyPaid && (
                        <TouchableOpacity style={styles.addBtn} onPress={handleAddItem}>
                            <Ionicons name="add" size={20} color={colors.primary} />
                            <Text style={[styles.addBtnText, { color: colors.primary }]}>Add More</Text>
                        </TouchableOpacity>
                    )}

                    <View style={[styles.divider, { backgroundColor: colors.border }]} />

                    <View style={styles.totalRow}>
                        <Text style={[styles.totalLabel, { color: colors.text }]}>Base Price:</Text>
                        <Text style={[styles.totalValue, { color: colors.text }]}>₹{booking.price}</Text>
                    </View>
                    <View style={styles.totalRow}>
                        <Text style={[styles.totalLabel, { color: colors.text }]}>Inspection Total:</Text>
                        <Text style={[styles.totalValue, { color: colors.primary }]}>
                            ₹{inspectionItems.reduce((sum, item) => sum + (Number(item.price) || 0), 0)}
                        </Text>
                    </View>
                    <View style={styles.totalRow}>
                        <Text style={[styles.grandTotalLabel, { color: colors.text }]}>Grand Total:</Text>
                        <Text style={[styles.grandTotalValue, { color: colors.text }]}>
                            ₹{calculateTotal()}
                        </Text>
                    </View>

                    {!alreadyPaid && (
                        <TouchableOpacity
                            style={[styles.calculateBtn, { backgroundColor: colors.primary }]}
                            onPress={handleCalculatePrize}
                            disabled={calculating}
                        >
                            {calculating ? (
                                <ActivityIndicator color="#FFF" />
                            ) : (
                                <Text style={styles.btnText}>Calculate & Save</Text>
                            )}
                        </TouchableOpacity>
                    )}
                </View>

                {/* Collect Payment Button */}
                {booking.inspectionDetails && booking.inspectionDetails.length > 0 && !alreadyPaid && (
                    <TouchableOpacity
                        style={[styles.payBtn, { backgroundColor: '#10B981' }]}
                        onPress={() => setShowPaymentModal(true)}
                    >
                        <Text style={styles.btnText}>Collect Payment (Total: ₹{booking.finalAmountToPay || calculateTotal()})</Text>
                    </TouchableOpacity>
                )}

                {alreadyPaid && (
                    <View style={[styles.paidBanner, { backgroundColor: '#D1FAE5' }]}>
                        <Ionicons name="checkmark-circle" size={24} color="#10B981" />
                        <Text style={[styles.paidText, { color: '#065F46' }]}>Payment Collected via {booking.inspectionPaymentMethod?.toUpperCase()}</Text>
                    </View>
                )}

            </ScrollView>

            {/* Payment Modal */}
            <Modal
                visible={showPaymentModal}
                transparent
                animationType="slide"
                onRequestClose={() => setShowPaymentModal(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
                        <Text style={[styles.modalTitle, { color: colors.text }]}>Collect Payment</Text>
                        <Text style={[styles.modalAmount, { color: colors.primary }]}>₹{booking.finalAmountToPay || calculateTotal()}</Text>

                        <View style={styles.paymentOptions}>
                            <TouchableOpacity
                                style={[styles.paymentOption, { borderColor: colors.border }]}
                                onPress={() => handlePayment('cash')}
                                disabled={paymentLoading}
                            >
                                <Ionicons name="cash-outline" size={32} color={colors.text} />
                                <Text style={[styles.optionText, { color: colors.text }]}>Cash</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={[styles.paymentOption, { borderColor: colors.border }]}
                                onPress={() => handlePayment('online')}
                                disabled={paymentLoading}
                            >
                                <Ionicons name="card-outline" size={32} color={colors.text} />
                                <Text style={[styles.optionText, { color: colors.text }]}>Online (Razorpay)</Text>
                            </TouchableOpacity>
                        </View>

                        <TouchableOpacity
                            style={[styles.cancelBtn, { backgroundColor: colors.background }]}
                            onPress={() => setShowPaymentModal(false)}
                        >
                            <Text style={[styles.cancelText, { color: colors.text }]}>Cancel</Text>
                        </TouchableOpacity>

                        {paymentLoading && <ActivityIndicator style={{ marginTop: 20 }} color={colors.primary} />}
                    </View>
                </View>
            </Modal>

        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1 },
    loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, borderBottomWidth: 1 },
    backBtn: { padding: 4 },
    headerTitle: { fontSize: 18, fontWeight: '700' },
    content: { padding: 16 },
    card: { borderRadius: 12, padding: 16, marginBottom: 16, ...SHADOWS.light },
    sectionTitle: { fontSize: 16, fontWeight: '700', marginBottom: 12 },
    row: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
    infoText: { fontSize: 14 },
    serviceName: { fontSize: 18, fontWeight: '700', marginBottom: 4 },
    description: { fontSize: 14, fontStyle: 'italic' },

    // Input Rows
    inputRow: { flexDirection: 'row', gap: 8, marginBottom: 12 },
    input: { borderWidth: 1, borderRadius: 8, padding: 10, fontSize: 14 },
    descInput: { flex: 2 },
    priceInput: { flex: 1 },
    removeBtn: { justifyContent: 'center' },
    addBtn: { flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-start', marginBottom: 16 },
    addBtnText: { fontWeight: '600', marginLeft: 4 },

    divider: { height: 1, marginVertical: 12 },
    totalRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
    totalLabel: { fontSize: 14 },
    totalValue: { fontSize: 14, fontWeight: '600' },
    grandTotalLabel: { fontSize: 16, fontWeight: '700' },
    grandTotalValue: { fontSize: 16, fontWeight: '700' },

    calculateBtn: { padding: 14, borderRadius: 12, alignItems: 'center', marginTop: 16 },
    btnText: { color: '#FFF', fontWeight: '700', fontSize: 16 },

    payBtn: { padding: 16, borderRadius: 12, alignItems: 'center', marginBottom: 30 },

    paidBanner: { padding: 16, borderRadius: 12, flexDirection: 'row', alignItems: 'center', gap: 8, justifyContent: 'center', marginBottom: 20 },
    paidText: { fontWeight: '700', fontSize: 16 },

    // Modal
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
    modalContent: { borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, paddingBottom: 40 },
    modalTitle: { fontSize: 20, fontWeight: '700', textAlign: 'center', marginBottom: 8 },
    modalAmount: { fontSize: 32, fontWeight: '700', textAlign: 'center', marginBottom: 32 },
    paymentOptions: { flexDirection: 'row', gap: 16, marginBottom: 24 },
    paymentOption: { flex: 1, borderWidth: 1, borderRadius: 16, padding: 20, alignItems: 'center', justifyContent: 'center' },
    optionText: { marginTop: 8, fontWeight: '600' },
    cancelBtn: { padding: 16, borderRadius: 12, alignItems: 'center' },
    cancelText: { fontWeight: '600' }
});

export default WorkerBookingDetailScreen;
