import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    ActivityIndicator,
    RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import { Booking } from '../../types';
import { formatDate, formatTime } from '../../utils/dateFormatter';
import { handleApiError, showSuccessToast } from '../../utils/errorHandler';

const PendingBookingsScreen = ({ navigation }: any) => {
    const { worker } = useAuth();
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [processingIds, setProcessingIds] = useState<Set<string>>(new Set());

    useEffect(() => {
        fetchPendingBookings();
    }, []);

    const fetchPendingBookings = async () => {
        try {
            const response = await api.get(`/bookings?worker=${worker?._id}&status=pending`);
            const allBookings = response.data.data || response.data.bookings || [];

            // Client-side filter to ensure only truly pending bookings are shown
            const pendingOnly = allBookings.filter((booking: Booking) =>
                booking.status === 'pending'
            );

            setBookings(pendingOnly);
        } catch (error) {
            console.error('Error fetching pending bookings:', error);
            handleApiError(error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const onRefresh = () => {
        setRefreshing(true);
        fetchPendingBookings();
    };

    const handleAccept = async (bookingId: string) => {
        if (processingIds.has(bookingId)) return; // Prevent duplicate calls

        setProcessingIds(prev => new Set(prev).add(bookingId));
        try {
            await api.put(`/bookings/${bookingId}/accept`);
            showSuccessToast('Booking accepted successfully!');

            // Immediately remove from list for better UX
            setBookings(prev => prev.filter(b => b._id !== bookingId));
        } catch (error: any) {
            // Check if booking was already accepted
            if (error.response?.status === 400 && error.response?.data?.message?.includes('already accepted')) {
                // Silently remove from list - it's already accepted
                setBookings(prev => prev.filter(b => b._id !== bookingId));
            } else {
                handleApiError(error, 'Failed to accept booking');
            }
            // Refresh list to show correct state
            fetchPendingBookings();
        } finally {
            setProcessingIds(prev => {
                const newSet = new Set(prev);
                newSet.delete(bookingId);
                return newSet;
            });
        }
    };

    const handleReject = async (bookingId: string) => {
        if (processingIds.has(bookingId)) return; // Prevent duplicate calls

        setProcessingIds(prev => new Set(prev).add(bookingId));
        try {
            await api.put(`/bookings/${bookingId}/reject`, {
                reason: 'Not available'
            });
            showSuccessToast('Booking rejected');

            // Immediately remove from list for better UX
            setBookings(prev => prev.filter(b => b._id !== bookingId));
        } catch (error) {
            handleApiError(error, 'Failed to reject booking');
            // Refresh list on error to show correct state
            fetchPendingBookings();
        } finally {
            setProcessingIds(prev => {
                const newSet = new Set(prev);
                newSet.delete(bookingId);
                return newSet;
            });
        }
    };

    const renderBookingCard = ({ item }: { item: Booking }) => {
        const isProcessing = processingIds.has(item._id);

        return (
            <View style={styles.card}>
                <View style={styles.cardHeader}>
                    <View style={styles.userInfo}>
                        <View style={styles.avatar}>
                            <Ionicons name="person" size={24} color="#8B5CF6" />
                        </View>
                        <View style={styles.userDetails}>
                            <Text style={styles.userName}>{item.user?.name || 'Customer'}</Text>
                            <Text style={styles.serviceName}>
                                {typeof item.service === 'string' ? item.service : item.service?.name}
                            </Text>
                        </View>
                    </View>
                    <View style={styles.priceBadge}>
                        <Text style={styles.priceText}>₹{item.finalPrice || item.price}</Text>
                    </View>
                </View>

                <View style={styles.divider} />

                <View style={styles.detailsSection}>
                    <View style={styles.detailRow}>
                        <Ionicons name="calendar-outline" size={18} color="#64748B" />
                        <Text style={styles.detailText}>{formatDate(item.bookingDate)}</Text>
                    </View>
                    <View style={styles.detailRow}>
                        <Ionicons name="time-outline" size={18} color="#64748B" />
                        <Text style={styles.detailText}>{formatTime(item.bookingTime)}</Text>
                    </View>
                    <View style={styles.detailRow}>
                        <Ionicons name="location-outline" size={18} color="#64748B" />
                        <Text style={styles.detailText} numberOfLines={1}>
                            {typeof item.address === 'string'
                                ? item.address
                                : `${item.address?.street}, ${item.address?.city}`
                            }
                        </Text>
                    </View>
                </View>

                <View style={styles.actionButtons}>
                    <TouchableOpacity
                        style={[styles.rejectButton, isProcessing && styles.disabledButton]}
                        onPress={() => handleReject(item._id)}
                        disabled={isProcessing}
                        activeOpacity={isProcessing ? 1 : 0.7}
                    >
                        {isProcessing ? (
                            <ActivityIndicator size="small" color="#EF4444" />
                        ) : (
                            <>
                                <Ionicons name="close-circle" size={20} color="#EF4444" />
                                <Text style={styles.rejectText}>Reject</Text>
                            </>
                        )}
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.acceptButton, isProcessing && styles.disabledButton]}
                        onPress={() => handleAccept(item._id)}
                        disabled={isProcessing}
                        activeOpacity={isProcessing ? 1 : 0.7}
                    >
                        {isProcessing ? (
                            <ActivityIndicator size="small" color="#FFFFFF" />
                        ) : (
                            <>
                                <Ionicons name="checkmark-circle" size={20} color="#FFFFFF" />
                                <Text style={styles.acceptText}>Accept</Text>
                            </>
                        )}
                    </TouchableOpacity>
                </View>
            </View>
        );
    };

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#8B5CF6" />
                <Text style={styles.loadingText}>Loading pending requests...</Text>
            </View>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity
                    style={styles.backButton}
                    onPress={() => navigation.goBack()}
                >
                    <Ionicons name="arrow-back" size={24} color="#1E293B" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Pending Requests</Text>
                <View style={styles.placeholder} />
            </View>

            {bookings.length === 0 ? (
                <View style={styles.emptyState}>
                    <Ionicons name="checkmark-done-circle-outline" size={80} color="#CBD5E1" />
                    <Text style={styles.emptyTitle}>All Caught Up!</Text>
                    <Text style={styles.emptySubtitle}>
                        No pending booking requests at the moment
                    </Text>
                </View>
            ) : (
                <FlatList
                    data={bookings}
                    renderItem={renderBookingCard}
                    keyExtractor={(item) => item._id}
                    contentContainerStyle={styles.listContent}
                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={onRefresh}
                            colors={['#8B5CF6']}
                        />
                    }
                />
            )}
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F8FAFC',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#F8FAFC',
    },
    loadingText: {
        marginTop: 12,
        fontSize: 14,
        color: '#64748B',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingVertical: 16,
        backgroundColor: '#FFFFFF',
        borderBottomWidth: 1,
        borderBottomColor: '#F1F5F9',
    },
    backButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#F8FAFC',
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#1E293B',
    },
    placeholder: {
        width: 40,
    },
    listContent: {
        padding: 20,
    },
    card: {
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        padding: 16,
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 12,
        elevation: 3,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    userInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    avatar: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: '#EDE9FE',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    userDetails: {
        flex: 1,
    },
    userName: {
        fontSize: 16,
        fontWeight: '700',
        color: '#1E293B',
        marginBottom: 4,
    },
    serviceName: {
        fontSize: 14,
        color: '#64748B',
        fontWeight: '500',
    },
    priceBadge: {
        backgroundColor: '#EDE9FE',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 12,
    },
    priceText: {
        fontSize: 16,
        fontWeight: '700',
        color: '#8B5CF6',
    },
    divider: {
        height: 1,
        backgroundColor: '#F1F5F9',
        marginBottom: 16,
    },
    detailsSection: {
        gap: 12,
        marginBottom: 16,
    },
    detailRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    detailText: {
        fontSize: 14,
        color: '#64748B',
        fontWeight: '500',
        flex: 1,
    },
    actionButtons: {
        flexDirection: 'row',
        gap: 12,
    },
    rejectButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 12,
        borderRadius: 12,
        backgroundColor: '#FEE2E2',
        gap: 6,
    },
    rejectText: {
        fontSize: 15,
        fontWeight: '700',
        color: '#EF4444',
    },
    acceptButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 12,
        borderRadius: 12,
        backgroundColor: '#8B5CF6',
        gap: 6,
    },
    acceptText: {
        fontSize: 15,
        fontWeight: '700',
        color: '#FFFFFF',
    },
    disabledButton: {
        opacity: 0.6,
    },
    emptyState: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 40,
    },
    emptyTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: '#1E293B',
        marginTop: 24,
        marginBottom: 8,
    },
    emptySubtitle: {
        fontSize: 14,
        color: '#94A3B8',
        textAlign: 'center',
        lineHeight: 20,
    },
});

export default PendingBookingsScreen;
