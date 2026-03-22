import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    RefreshControl,
    Image,
    StatusBar
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import api from '../../services/api';
import { useTheme } from '../../context/ThemeContext';
import { SHADOWS, SPACING, SIZES } from '../../constants/theme';

const MyBookingsScreen = ({ navigation }) => {
    const { colors, isDark } = useTheme();
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [activeTab, setActiveTab] = useState('all'); // all, pending, active, completed

    useEffect(() => {
        fetchBookings();
    }, []);

    const fetchBookings = async () => {
        try {
            const response = await api.get('/bookings/my');
            setBookings(response.data.data || []);
        } catch (error) {
            console.error('Error fetching bookings:', error);
            setBookings([]);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const onRefresh = () => {
        setRefreshing(true);
        fetchBookings();
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'pending': return '#F59E0B';
            case 'confirmed': return '#3B82F6';
            case 'in-progress': return '#8B5CF6';
            case 'completed': return '#10B981';
            case 'cancelled': return '#EF4444';
            default: return '#6B7280';
        }
    };

    const getStatusLabel = (status) => {
        switch (status) {
            case 'pending': return 'Pending';
            case 'confirmed': return 'Confirmed';
            case 'in-progress': return 'In Progress';
            case 'completed': return 'Completed';
            case 'cancelled': return 'Cancelled';
            default: return status;
        }
    };

    const filteredBookings = bookings.filter((booking) => {
        if (activeTab === 'all') return true;
        if (activeTab === 'pending') return booking.status === 'pending';
        if (activeTab === 'active') return ['confirmed', 'in-progress'].includes(booking.status);
        if (activeTab === 'completed') return ['completed', 'cancelled'].includes(booking.status);
        return true;
    });

    const renderBooking = ({ item }) => (
        <TouchableOpacity
            style={[styles.bookingCard, { backgroundColor: colors.card, borderColor: colors.border }]}
            onPress={() => navigation.navigate('BookingDetail', { bookingId: item._id })}
            activeOpacity={0.9}
        >
            {/* Header: Date & Status */}
            <View style={[styles.cardHeader, { borderBottomColor: colors.border }]}>
                <View style={styles.dateContainer}>
                    <Ionicons name="calendar" size={14} color={colors.textSecondary} />
                    <Text style={[styles.dateText, { color: colors.textSecondary }]}>
                        {new Date(item.bookingDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </Text>
                </View>
                <View style={[styles.statusBadge, { backgroundColor: `${getStatusColor(item.status)}15` }]}>
                    <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>
                        {getStatusLabel(item.status)}
                    </Text>
                </View>
            </View>

            {/* Content: Service & Worker */}
            <View style={styles.cardContent}>
                <View style={[styles.serviceIcon, { backgroundColor: isDark ? '#374151' : '#EFF6FF' }]}>
                    <Ionicons name="briefcase" size={24} color={colors.primary} />
                </View>
                <View style={styles.cardInfo}>
                    <Text style={[styles.serviceName, { color: colors.text }]}>
                        {item.worker ? `${item.worker.firstName} ${item.worker.lastName}` : (item.workerName || 'Assigned Worker')}
                    </Text>
                    <Text style={[styles.workerName, { color: colors.textSecondary }]}>
                        {item.category} • {item.service}
                    </Text>
                </View>
                <View style={styles.priceContainer}>
                    <Text style={[styles.priceLabel, { color: colors.textSecondary }]}>Total</Text>
                    <Text style={[styles.priceValue, { color: colors.primary }]}>₹{item.finalPrice}</Text>
                </View>
            </View>

            {/* Footer: ID & Arrow */}
            <View style={[styles.cardFooter, { backgroundColor: isDark ? '#374151' : '#F9FAFB', borderTopColor: colors.border }]}>
                <Text style={[styles.bookingId, { color: colors.textSecondary }]}>ID: #{item._id.slice(-8).toUpperCase()}</Text>
                <View style={styles.viewDetails}>
                    <Text style={[styles.viewDetailsText, { color: colors.primary }]}>View Details</Text>
                    <Ionicons name="arrow-forward" size={14} color={colors.primary} />
                </View>
            </View>
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
            <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} backgroundColor={colors.background} />

            {/* Header */}
            <View style={[styles.header, { backgroundColor: colors.background }]}>
                <Text style={[styles.headerTitle, { color: colors.text }]}>My Bookings</Text>
                <TouchableOpacity style={[styles.historyBtn, { backgroundColor: colors.card }]}>
                    <Ionicons name="time-outline" size={24} color={colors.text} />
                </TouchableOpacity>
            </View>

            {/* Tabs */}
            <View style={styles.tabsContainer}>
                {['all', 'pending', 'active', 'completed'].map((tab) => (
                    <TouchableOpacity
                        key={tab}
                        style={[
                            styles.tab,
                            { backgroundColor: colors.card, borderColor: colors.border },
                            activeTab === tab && { backgroundColor: colors.primary, borderColor: colors.primary }
                        ]}
                        onPress={() => setActiveTab(tab)}
                    >
                        <Text style={[
                            styles.tabText,
                            { color: colors.textSecondary },
                            activeTab === tab && { color: '#FFFFFF' }
                        ]}>
                            {tab.charAt(0).toUpperCase() + tab.slice(1)}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>

            {/* List */}
            <FlatList
                data={filteredBookings}
                renderItem={renderBooking}
                keyExtractor={(item) => item._id}
                contentContainerStyle={styles.listContent}
                showsVerticalScrollIndicator={false}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.primary]} tintColor={colors.primary} />}
                ListEmptyComponent={
                    !loading && (
                        <View style={styles.emptyContainer}>
                            <Image
                                source={{ uri: 'https://cdn-icons-png.flaticon.com/512/7486/7486744.png' }}
                                style={[styles.emptyImage, { opacity: isDark ? 0.6 : 0.8 }]}
                            />
                            <Text style={[styles.emptyTitle, { color: colors.text }]}>No Bookings Found</Text>
                            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                                Looks like you haven't made any bookings in this category yet.
                            </Text>
                            <TouchableOpacity
                                style={[styles.browseButton, { backgroundColor: colors.primary }]}
                                onPress={() => navigation.navigate('Home')}
                            >
                                <Text style={[styles.browseButtonText, { color: '#FFFFFF' }]}>Browse Services</Text>
                            </TouchableOpacity>
                        </View>
                    )
                }
            />
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
        paddingHorizontal: SPACING.l,
        paddingVertical: SPACING.m,
    },
    headerTitle: {
        fontSize: 28,
        fontWeight: 'bold',
    },
    historyBtn: {
        padding: 8,
        borderRadius: 12,
        ...SHADOWS.light,
    },
    tabsContainer: {
        flexDirection: 'row',
        paddingHorizontal: SPACING.l,
        marginBottom: SPACING.m,
        gap: 12,
    },
    tab: {
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 20,
        borderWidth: 1,
    },
    tabText: {
        fontSize: 14,
        fontWeight: '600',
    },
    listContent: {
        padding: SPACING.l,
        paddingTop: 0,
    },
    bookingCard: {
        borderRadius: 16,
        marginBottom: SPACING.m,
        padding: SPACING.m,
        ...SHADOWS.medium,
        borderWidth: 1,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
        paddingBottom: 12,
        borderBottomWidth: 1,
    },
    dateContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    dateText: {
        fontSize: 13,
        fontWeight: '500',
    },
    statusBadge: {
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 8,
    },
    statusText: {
        fontSize: 12,
        fontWeight: '700',
    },
    cardContent: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
    },
    serviceIcon: {
        width: 48,
        height: 48,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    cardInfo: {
        flex: 1,
    },
    serviceName: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 4,
    },
    workerName: {
        fontSize: 13,
    },
    priceContainer: {
        alignItems: 'flex-end',
    },
    priceLabel: {
        fontSize: 11,
    },
    priceValue: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    cardFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginHorizontal: -SPACING.m,
        marginBottom: -SPACING.m,
        paddingHorizontal: SPACING.m,
        paddingVertical: 10,
        borderBottomLeftRadius: 16,
        borderBottomRightRadius: 16,
        borderTopWidth: 1,
    },
    bookingId: {
        fontSize: 12,
        fontFamily: 'monospace',
    },
    viewDetails: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    viewDetailsText: {
        fontSize: 12,
        fontWeight: '600',
    },
    emptyContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingTop: 60,
    },
    emptyImage: {
        width: 150,
        height: 150,
        marginBottom: 24,
    },
    emptyTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 8,
    },
    emptyText: {
        fontSize: 14,
        textAlign: 'center',
        maxWidth: '80%',
        marginBottom: 24,
        lineHeight: 20,
    },
    browseButton: {
        paddingHorizontal: 32,
        paddingVertical: 14,
        borderRadius: 12,
        ...SHADOWS.medium,
    },
    browseButtonText: {
        fontSize: 16,
        fontWeight: 'bold',
    },
});

export default MyBookingsScreen;

