import React, { useState, useEffect, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    Image,
    ActivityIndicator,
    RefreshControl,
    Modal,
    TextInput,
    Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Toast from 'react-native-toast-message';
import api, { API_URL } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { SHADOWS } from '../../constants/theme';

const WorkerDashboardScreen = ({ navigation }: any) => {
    const { colors, isDark } = useTheme();
    const { user } = useAuth();
    const [bookings, setBookings] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    // OTP Modal State
    const [otpModalVisible, setOtpModalVisible] = useState(false);
    const [otp, setOtp] = useState('');
    const [selectedBooking, setSelectedBooking] = useState<any>(null);
    const [otpAction, setOtpAction] = useState<'start' | 'complete'>('start');
    const [otpLoading, setOtpLoading] = useState(false);

    useEffect(() => {
        fetchBookings();
    }, []);

    const fetchBookings = async () => {
        try {
            const response = await api.get('/bookings/worker/my');
            setBookings(response.data);
        } catch (error) {
            console.error('Error fetching bookings:', error);
            Toast.show({
                type: 'error',
                text1: 'Error',
                text2: 'Failed to load bookings'
            });
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const onRefresh = useCallback(() => {
        setRefreshing(true);
        fetchBookings();
    }, []);

    const handleStartJob = async (booking: any) => {
        try {
            setOtpLoading(true);
            await api.put(`/bookings/${booking._id}/request-start-otp`);
            setSelectedBooking(booking);
            setOtpAction('start');
            setOtpModalVisible(true);
            setOtp('');
            Toast.show({
                type: 'success',
                text1: 'OTP Sent',
                text2: 'Ask customer for the OTP to start job'
            });
        } catch (error: any) {
            console.error('Error requesting start OTP:', error);
            Toast.show({
                type: 'error',
                text1: 'Failed to send OTP',
                text2: error.response?.data?.message || 'Please try again'
            });
        } finally {
            setOtpLoading(false);
        }
    };

    const handleCompleteJob = async (booking: any) => {
        try {
            setOtpLoading(true);
            await api.put(`/bookings/${booking._id}/request-completion-otp`);
            setSelectedBooking(booking);
            setOtpAction('complete');
            setOtpModalVisible(true);
            setOtp('');
            Toast.show({
                type: 'success',
                text1: 'OTP Sent',
                text2: 'Ask customer for the OTP to complete job'
            });
        } catch (error: any) {
            console.error('Error requesting completion OTP:', error);
            Toast.show({
                type: 'error',
                text1: 'Failed to send OTP',
                text2: error.response?.data?.message || 'Please try again'
            });
        } finally {
            setOtpLoading(false);
        }
    };

    const submitOtp = async () => {
        if (!otp || otp.length !== 4) {
            Toast.show({ type: 'error', text1: 'Invalid OTP', text2: 'Please enter 4-digit OTP' });
            return;
        }

        try {
            setOtpLoading(true);
            const endpoint = otpAction === 'start'
                ? `/bookings/${selectedBooking._id}/start`
                : `/bookings/${selectedBooking._id}/complete`;

            await api.put(endpoint, { otp });

            setOtpModalVisible(false);
            fetchBookings(); // Refresh list
            Toast.show({
                type: 'success',
                text1: otpAction === 'start' ? 'Job Started' : 'Job Completed',
                text2: otpAction === 'start' ? 'Good luck!' : 'Great job!'
            });
        } catch (error: any) {
            console.error('Error verifying OTP:', error);
            Toast.show({
                type: 'error',
                text1: 'Verification Failed',
                text2: error.response?.data?.message || 'Invalid OTP'
            });
        } finally {
            setOtpLoading(false);
        }
    };

    const renderBookingItem = ({ item }: { item: any }) => {
        const isAssigned = item.status === 'assigned';
        const isInProgress = item.status === 'in-progress';
        const isCompleted = item.status === 'completed';

        return (
            <View style={[styles.card, { backgroundColor: colors.card }]}>
                <View style={styles.cardHeader}>
                    <View style={styles.serviceInfo}>
                        <Text style={[styles.serviceName, { color: colors.text }]}>{item.service}</Text>
                        <Text style={[styles.bookingId, { color: colors.textSecondary }]}>#{item._id.slice(-6)}</Text>
                    </View>
                    <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
                        <Text style={styles.statusText}>{item.status.toUpperCase()}</Text>
                    </View>
                </View>

                <View style={[styles.divider, { backgroundColor: colors.border }]} />

                <View style={styles.customerInfo}>
                    <View style={styles.row}>
                        <Ionicons name="person-outline" size={16} color={colors.textSecondary} />
                        <Text style={[styles.customerText, { color: colors.text }]}>{item.user?.name || 'Customer'}</Text>
                    </View>
                    <View style={styles.row}>
                        <Ionicons name="location-outline" size={16} color={colors.textSecondary} />
                        <Text style={[styles.customerText, { color: colors.text }]} numberOfLines={2}>
                            {item.address?.street}, {item.address?.city}
                        </Text>
                    </View>
                    <View style={styles.row}>
                        <Ionicons name="calendar-outline" size={16} color={colors.textSecondary} />
                        <Text style={[styles.customerText, { color: colors.text }]}>
                            {new Date(item.bookingDate).toLocaleDateString()} • {item.bookingTime}
                        </Text>
                    </View>
                </View>

                <View style={styles.actionContainer}>
                    {isAssigned && (
                        <TouchableOpacity
                            style={[styles.actionBtn, { backgroundColor: colors.primary }]}
                            onPress={() => handleStartJob(item)}
                        >
                            <Text style={styles.actionBtnText}>Start Job</Text>
                        </TouchableOpacity>
                    )}

                    {isInProgress && (
                        <TouchableOpacity
                            style={[styles.actionBtn, { backgroundColor: '#10B981' }]}
                            onPress={() => handleCompleteJob(item)}
                        >
                            <Text style={styles.actionBtnText}>Complete Job</Text>
                        </TouchableOpacity>
                    )}

                    {isCompleted && (
                        <View style={styles.completedInfo}>
                            <Ionicons name="checkmark-circle" size={20} color="#10B981" />
                            <Text style={[styles.completedText, { color: '#10B981' }]}>Job Completed</Text>
                        </View>
                    )}

                    <TouchableOpacity
                        style={[styles.detailsBtn, { borderColor: colors.border }]}
                        onPress={() => navigation.navigate('WorkerBookingDetail', { bookingId: item._id })}
                    >
                        <Text style={[styles.detailsBtnText, { color: colors.text }]}>View Details</Text>
                    </TouchableOpacity>
                </View>
            </View>
        );
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'pending': return '#F59E0B';
            case 'assigned': return '#3B82F6';
            case 'in-progress': return '#8B5CF6';
            case 'completed': return '#10B981';
            case 'cancelled': return '#EF4444';
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

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
            <View style={[styles.header, { borderBottomColor: colors.border }]}>
                <Text style={[styles.headerTitle, { color: colors.text }]}>My Jobs</Text>
                <TouchableOpacity onPress={fetchBookings}>
                    <Ionicons name="refresh" size={24} color={colors.primary} />
                </TouchableOpacity>
            </View>

            <FlatList
                data={bookings}
                renderItem={renderBookingItem}
                keyExtractor={(item) => item._id}
                contentContainerStyle={styles.listContent}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.primary]} />
                }
                ListEmptyComponent={
                    <View style={styles.emptyState}>
                        <Ionicons name="briefcase-outline" size={48} color={colors.textLight} />
                        <Text style={[styles.emptyText, { color: colors.textSecondary }]}>No jobs assigned yet</Text>
                    </View>
                }
            />

            {/* OTP Modal */}
            <Modal
                visible={otpModalVisible}
                transparent
                animationType="fade"
                onRequestClose={() => setOtpModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
                        <Text style={[styles.modalTitle, { color: colors.text }]}>
                            {otpAction === 'start' ? 'Start Job' : 'Complete Job'}
                        </Text>
                        <Text style={[styles.modalSubtitle, { color: colors.textSecondary }]}>
                            Ask customer for the OTP to {otpAction} the job.
                        </Text>

                        <TextInput
                            style={[styles.otpInput, { color: colors.text, borderColor: colors.border, backgroundColor: isDark ? '#374151' : '#F9FAFB' }]}
                            placeholder="Enter 4-digit OTP"
                            placeholderTextColor={colors.textLight}
                            keyboardType="number-pad"
                            maxLength={4}
                            value={otp}
                            onChangeText={setOtp}
                            autoFocus
                        />

                        <View style={styles.modalActions}>
                            <TouchableOpacity
                                style={[styles.modalBtn, { borderColor: colors.border }]}
                                onPress={() => setOtpModalVisible(false)}
                            >
                                <Text style={[styles.modalBtnText, { color: colors.text }]}>Cancel</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={[styles.modalBtn, { backgroundColor: colors.primary, borderColor: colors.primary }]}
                                onPress={submitOtp}
                                disabled={otpLoading}
                            >
                                {otpLoading ? (
                                    <ActivityIndicator color="#FFF" size="small" />
                                ) : (
                                    <Text style={[styles.modalBtnText, { color: '#FFF' }]}>Verify & {otpAction === 'start' ? 'Start' : 'Complete'}</Text>
                                )}
                            </TouchableOpacity>
                        </View>
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
    headerTitle: { fontSize: 20, fontWeight: '700' },
    listContent: { padding: 16 },
    card: { borderRadius: 12, padding: 16, marginBottom: 16, ...SHADOWS.light },
    cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
    serviceInfo: { flex: 1 },
    serviceName: { fontSize: 16, fontWeight: '700', marginBottom: 4 },
    bookingId: { fontSize: 12 },
    statusBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
    statusText: { color: '#FFF', fontSize: 10, fontWeight: '700' },
    divider: { height: 1, marginVertical: 12 },
    customerInfo: { gap: 8, marginBottom: 16 },
    row: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    customerText: { fontSize: 14 },
    actionContainer: { flexDirection: 'row', gap: 12, alignItems: 'center' },
    actionBtn: { flex: 1, paddingVertical: 10, borderRadius: 8, alignItems: 'center' },
    actionBtnText: { color: '#FFF', fontWeight: '600', fontSize: 14 },
    detailsBtn: { paddingHorizontal: 16, paddingVertical: 9, borderRadius: 8, borderWidth: 1 },
    detailsBtnText: { fontSize: 14, fontWeight: '500' },
    completedInfo: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 6 },
    completedText: { fontWeight: '600', fontSize: 14 },
    emptyState: { alignItems: 'center', marginTop: 60 },
    emptyText: { marginTop: 12, fontSize: 16 },
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 20 },
    modalContent: { borderRadius: 16, padding: 24 },
    modalTitle: { fontSize: 18, fontWeight: '700', marginBottom: 8, textAlign: 'center' },
    modalSubtitle: { fontSize: 14, textAlign: 'center', marginBottom: 20 },
    otpInput: { borderWidth: 1, borderRadius: 8, padding: 12, fontSize: 24, textAlign: 'center', letterSpacing: 8, marginBottom: 24 },
    modalActions: { flexDirection: 'row', gap: 12 },
    modalBtn: { flex: 1, paddingVertical: 12, borderRadius: 8, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
    modalBtnText: { fontWeight: '600', fontSize: 14 }
});

export default WorkerDashboardScreen;

