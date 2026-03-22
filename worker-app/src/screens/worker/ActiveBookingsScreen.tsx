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
import { handleApiError } from '../../utils/errorHandler';

const ActiveBookingsScreen = ({ navigation }: any) => {
    const { worker } = useAuth();
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    useEffect(() => {
        fetchActiveBookings();
    }, []);

    const fetchActiveBookings = async () => {
        try {
            // Fetch bookings with status 'accepted' or 'in-progress'
            const response = await api.get(`/bookings?worker=${worker?._id}&limit=100`);
            const allBookings = response.data.data || response.data.bookings || [];

            // Filter for active bookings only (including assigned)
            const activeOnly = allBookings.filter((booking: Booking) =>
                booking.status === 'accepted' ||
                booking.status === 'in-progress' ||
                booking.status === 'assigned'
            );

            setBookings(activeOnly);
        } catch (error) {
            console.error('Error fetching active bookings:', error);
            handleApiError(error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const onRefresh = () => {
        setRefreshing(true);
        fetchActiveBookings();
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'accepted':
                return '#10B981'; // Green
            case 'in-progress':
                return '#F59E0B'; // Orange
            case 'assigned':
                return '#3B82F6'; // Blue
            default:
                return '#6B7280';
        }
    };

    const getStatusText = (status: string) => {
        switch (status) {
            case 'accepted':
                return 'Accepted';
            case 'in-progress':
                return 'In Progress';
            case 'assigned':
                return 'New Job';
            default:
                return status;
        }
    };

    const renderBookingCard = ({ item }: { item: Booking }) => {
        return (
            <TouchableOpacity
                style={styles.card}
                onPress={() => navigation.navigate('BookingDetails', { bookingId: item._id })}
                activeOpacity={0.7}
            >
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
                    <View style={[styles.statusBadge, { backgroundColor: `${getStatusColor(item.status)}20` }]}>
                        <View style={[styles.statusDot, { backgroundColor: getStatusColor(item.status) }]} />
                        <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>
                            {getStatusText(item.status)}
                        </Text>
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
                    <View style={styles.detailRow}>
                        <Ionicons name="cash-outline" size={18} color="#64748B" />
                        <Text style={styles.priceText}>₹{item.finalPrice || item.price}</Text>
                    </View>
                </View>

                <View style={styles.actionRow}>
                    <TouchableOpacity
                        style={styles.viewButton}
                        onPress={() => navigation.navigate('BookingDetails', { bookingId: item._id })}
                    >
                        <Text style={styles.viewButtonText}>View Details</Text>
                        <Ionicons name="arrow-forward" size={16} color="#8B5CF6" />
                    </TouchableOpacity>
                </View>
            </TouchableOpacity>
        );
    };

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#8B5CF6" />
                <Text style={styles.loadingText}>Loading active bookings...</Text>
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
                <Text style={styles.headerTitle}>Active Jobs</Text>
                <View style={styles.placeholder} />
            </View>

            {bookings.length === 0 ? (
                <View style={styles.emptyState}>
                    <Ionicons name="briefcase-outline" size={80} color="#CBD5E1" />
                    <Text style={styles.emptyTitle}>No Active Jobs</Text>
                    <Text style={styles.emptySubtitle}>
                        You don't have any active bookings at the moment
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
    statusBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 12,
        gap: 6,
    },
    statusDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
    },
    statusText: {
        fontSize: 12,
        fontWeight: '700',
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
    priceText: {
        fontSize: 16,
        fontWeight: '700',
        color: '#8B5CF6',
    },
    actionRow: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
    },
    viewButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 8,
        backgroundColor: '#EDE9FE',
    },
    viewButtonText: {
        fontSize: 14,
        fontWeight: '700',
        color: '#8B5CF6',
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

export default ActiveBookingsScreen;
