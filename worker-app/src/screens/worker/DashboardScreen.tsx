import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    RefreshControl,
    ActivityIndicator,
    Switch,
    StatusBar,
    Image,
    FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import socketService from '../../services/socketService';
import { theme } from '../../theme/theme';
import { DashboardScreenProps } from '../../types/navigation';
import { handleApiError, showSuccessToast } from '../../utils/errorHandler';
import { useAppState } from '../../hooks/useAppState';

interface Stats {
    totalBookings: number;
    completedBookings: number;
    earnings: number;
    rating: number;
    previousEarnings?: number;
}

interface Banner {
    _id: string;
    image: string;
    title: string;
    link?: string;
}

const DashboardScreen = ({ navigation }: DashboardScreenProps) => {
    const { worker } = useAuth();
    const [stats, setStats] = useState<Stats>({
        totalBookings: 0,
        completedBookings: 0,
        earnings: 0,
        rating: 0,
    });
    const [banners, setBanners] = useState<Banner[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [isOnline, setIsOnline] = useState(worker?.status === 'approved');
    const [unreadNotifications, setUnreadNotifications] = useState(0);

    useEffect(() => {
        fetchData();

        // Listen for real-time updates
        socketService.onNewBooking(() => {
            console.log('Dashboard: New booking received, refreshing...');
            fetchData();
        });

        socketService.onBookingRemoved(() => {
            console.log('Dashboard: Booking removed, refreshing...');
            fetchData();
        });

        return () => {
            // Cleanup listeners if needed (socketService doesn't have specific off methods exposed easily for these specific callbacks without refactoring, 
            // but for now it's okay as Dashboard is main screen)
            // Ideally we should use socketService.removeListener('new_booking') etc.
        };
    }, []);

    // Refresh data when app comes to foreground
    useAppState(
        () => {
            console.log('App came to foreground, refreshing data...');
            fetchData();
        },
        () => {
            console.log('App went to background');
        }
    );

    const fetchData = async () => {
        try {
            const [statsRes, notificationsRes] = await Promise.all([
                api.get(`/workers/${worker?._id}/stats`),
                api.get(`/notifications/unread-count`),
            ]);

            setStats(statsRes.data || stats);
            setUnreadNotifications(notificationsRes.data.count || 0);

            try {
                const bannersRes = await api.get('/banners/active/worker-dashboard?platform=worker-app');
                setBanners(bannersRes.data || []);
            } catch (bannerErr) {
                console.log('Banner fetch error:', bannerErr);
            }
        } catch (error) {
            console.error('Error fetching data:', error);
            handleApiError(error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const onRefresh = () => {
        setRefreshing(true);
        fetchData();
    };

    const toggleStatus = async () => {
        try {
            const newStatus = isOnline ? 'unavailable' : 'approved';
            await api.put(`/workers/${worker?._id}`, { status: newStatus });
            setIsOnline(!isOnline);
            showSuccessToast(`You are now ${!isOnline ? 'Online' : 'Offline'}`);

            if (!isOnline) {
                updateLocation();
            }
        } catch (error) {
            console.error('Error toggling status:', error);
            handleApiError(error, 'Failed to update status');
        }
    };

    const updateLocation = async () => {
        try {
            const { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
                console.log('Permission to access location was denied');
                return;
            }

            const location = await Location.getCurrentPositionAsync({});
            const { latitude, longitude } = location.coords;

            await api.put(`/workers/${worker?._id}`, {
                latitude: latitude.toString(),
                longitude: longitude.toString()
            });
            console.log('Location updated:', latitude, longitude);
        } catch (error) {
            console.error('Error updating location:', error);
        }
    };

    useEffect(() => {
        if (isOnline) {
            updateLocation();
        }
    }, [isOnline]);

    const calculateGrowth = (): string => {
        if (!stats.previousEarnings || stats.previousEarnings === 0) return '0';
        return ((stats.earnings - stats.previousEarnings) / stats.previousEarnings * 100).toFixed(1);
    };

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={theme.colors.primary} />
                <Text style={styles.loadingText}>Loading dashboard...</Text>
            </View>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

            {/* Modern Header */}
            <View style={styles.header}>
                <View style={styles.headerLeft}>
                    <Text style={styles.greeting}>Hello, {worker?.firstName}! 👋</Text>
                    <View style={styles.statusRow}>
                        <View style={[styles.statusDot, { backgroundColor: isOnline ? '#10B981' : '#94A3B8' }]} />
                        <Text style={styles.statusText}>
                            {isOnline ? 'Active & Online' : 'Offline'}
                        </Text>
                        <Switch
                            value={isOnline}
                            onValueChange={toggleStatus}
                            trackColor={{ false: '#E2E8F0', true: '#86EFAC' }}
                            thumbColor={isOnline ? '#10B981' : '#CBD5E1'}
                            style={styles.switch}
                        />
                    </View>
                </View>
                <View style={styles.headerRight}>
                    <TouchableOpacity
                        style={styles.iconButton}
                        onPress={() => navigation.navigate('Notifications')}
                    >
                        <Ionicons name="notifications-outline" size={24} color="#1E293B" />
                        {unreadNotifications > 0 && (
                            <View style={styles.notificationBadge}>
                                <Text style={styles.badgeText}>{unreadNotifications}</Text>
                            </View>
                        )}
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={styles.iconButton}
                        onPress={() => navigation.navigate('ChatList')}
                    >
                        <Ionicons name="chatbubble-ellipses-outline" size={22} color="#1E293B" />
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={styles.iconButton}
                        onPress={() => navigation.navigate('Profile')}
                    >
                        <Ionicons name="person-circle-outline" size={24} color="#1E293B" />
                    </TouchableOpacity>
                </View>
            </View>



            {/* Active Jobs Button */}
            <TouchableOpacity
                style={[styles.pendingAlert, { backgroundColor: '#DCFCE7', borderColor: '#10B981' }]}
                onPress={() => navigation.navigate('ActiveBookings')}
                activeOpacity={0.8}
            >
                <View style={[styles.pendingIconContainer, { backgroundColor: '#10B981' }]}>
                    <Ionicons name="briefcase" size={24} color="#FFFFFF" />
                </View>
                <View style={styles.pendingContent}>
                    <Text style={[styles.pendingTitle, { color: '#047857' }]}>Active Jobs</Text>
                    <Text style={[styles.pendingSubtitle, { color: '#059669' }]}>View your ongoing bookings</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#059669" />
            </TouchableOpacity>

            <ScrollView
                style={styles.content}
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        colors={[theme.colors.primary]}
                    />
                }
            >
                {/* Banners */}
                {banners.length > 0 && (
                    <View style={styles.bannerContainer}>
                        <FlatList
                            data={banners}
                            horizontal
                            showsHorizontalScrollIndicator={false}
                            keyExtractor={(item) => item._id}
                            renderItem={({ item }) => (
                                <Image
                                    source={{ uri: `${api.defaults.baseURL?.replace('/api', '')}/${item.image}` }}
                                    style={styles.bannerImage}
                                    resizeMode="cover"
                                />
                            )}
                            contentContainerStyle={styles.bannerList}
                        />
                    </View>
                )}

                {/* Modern Earnings Card */}
                <TouchableOpacity
                    style={styles.earningsCard}
                    onPress={() => navigation.navigate('Wallet')}
                    activeOpacity={0.9}
                >
                    <View style={styles.earningsHeader}>
                        <View>
                            <Text style={styles.earningsLabel}>Total Earnings</Text>
                            <Text style={styles.earningsValue}>
                                ₹{stats.earnings.toLocaleString('en-IN')}
                            </Text>
                            {stats.previousEarnings && (
                                <View style={styles.growthBadge}>
                                    <Ionicons
                                        name={parseFloat(calculateGrowth()) >= 0 ? "trending-up" : "trending-down"}
                                        size={14}
                                        color="#FFFFFF"
                                    />
                                    <Text style={styles.growthText}>
                                        {calculateGrowth()}% this week
                                    </Text>
                                </View>
                            )}
                        </View>
                        <View style={styles.earningsIcon}>
                            <Ionicons name="wallet" size={28} color="#FFFFFF" />
                        </View>
                    </View>
                    <View style={styles.circle1} />
                    <View style={styles.circle2} />
                </TouchableOpacity>

                {/* Stats Grid */}
                <View style={styles.statsGrid}>
                    <View style={styles.statCard}>
                        <View style={[styles.statIcon, { backgroundColor: '#DBEAFE' }]}>
                            <Ionicons name="briefcase" size={20} color="#2563EB" />
                        </View>
                        <Text style={styles.statValue}>{stats.totalBookings}</Text>
                        <Text style={styles.statLabel}>Total Jobs</Text>
                    </View>

                    <View style={styles.statCard}>
                        <View style={[styles.statIcon, { backgroundColor: '#D1FAE5' }]}>
                            <Ionicons name="checkmark-circle" size={20} color="#10B981" />
                        </View>
                        <Text style={styles.statValue}>{stats.completedBookings}</Text>
                        <Text style={styles.statLabel}>Completed</Text>
                    </View>

                    <View style={styles.statCard}>
                        <View style={[styles.statIcon, { backgroundColor: '#FEF3C7' }]}>
                            <Ionicons name="star" size={20} color="#F59E0B" />
                        </View>
                        <Text style={styles.statValue}>{stats.rating.toFixed(1)}</Text>
                        <Text style={styles.statLabel}>Rating</Text>
                    </View>
                </View>

                {/* Quick Actions Grid */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Quick Actions</Text>
                    <View style={styles.actionsGrid}>
                        <TouchableOpacity
                            style={styles.actionCard}
                            onPress={() => navigation.navigate('Wallet')}
                            activeOpacity={0.7}
                        >
                            <View style={[styles.actionIcon, { backgroundColor: '#EDE9FE' }]}>
                                <Ionicons name="wallet" size={24} color="#8B5CF6" />
                            </View>
                            <Text style={styles.actionText}>My Wallet</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.actionCard}
                            onPress={() => navigation.navigate('EarningsAnalytics')}
                            activeOpacity={0.7}
                        >
                            <View style={[styles.actionIcon, { backgroundColor: '#DBEAFE' }]}>
                                <Ionicons name="bar-chart" size={24} color="#3B82F6" />
                            </View>
                            <Text style={styles.actionText}>Analytics</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.actionCard}
                            onPress={() => navigation.navigate('Support')}
                            activeOpacity={0.7}
                        >
                            <View style={[styles.actionIcon, { backgroundColor: '#FEE2E2' }]}>
                                <Ionicons name="headset" size={24} color="#EF4444" />
                            </View>
                            <Text style={styles.actionText}>Support</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.actionCard}
                            onPress={() => navigation.navigate('Profile')}
                            activeOpacity={0.7}
                        >
                            <View style={[styles.actionIcon, { backgroundColor: '#D1FAE5' }]}>
                                <Ionicons name="person" size={24} color="#10B981" />
                            </View>
                            <Text style={styles.actionText}>Profile</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                <View style={{ height: 20 }} />
            </ScrollView>
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
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 16,
        backgroundColor: '#FFFFFF',
        borderBottomWidth: 1,
        borderBottomColor: '#F1F5F9',
    },
    headerLeft: {
        flex: 1,
    },
    headerRight: {
        flexDirection: 'row',
        gap: 12,
    },
    greeting: {
        fontSize: 20,
        fontWeight: '700',
        color: '#1E293B',
        marginBottom: 6,
    },
    statusRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    statusDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
    },
    statusText: {
        fontSize: 13,
        color: '#64748B',
        fontWeight: '500',
    },
    switch: {
        transform: [{ scaleX: 0.9 }, { scaleY: 0.9 }],
        marginLeft: 4,
    },
    iconButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#F8FAFC',
        justifyContent: 'center',
        alignItems: 'center',
    },
    notificationBadge: {
        position: 'absolute',
        top: 6,
        right: 6,
        backgroundColor: '#EF4444',
        borderRadius: 10,
        minWidth: 18,
        height: 18,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: '#FFFFFF',
    },
    badgeText: {
        color: '#FFFFFF',
        fontSize: 10,
        fontWeight: '700',
    },
    pendingAlert: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FEF3C7',
        marginHorizontal: 20,
        marginTop: 12,
        marginBottom: 8,
        padding: 16,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: '#FDE68A',
    },
    pendingIconContainer: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: '#FFFFFF',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    pendingContent: {
        flex: 1,
    },
    pendingTitle: {
        fontSize: 15,
        fontWeight: '700',
        color: '#92400E',
        marginBottom: 2,
    },
    pendingSubtitle: {
        fontSize: 12,
        color: '#B45309',
        fontWeight: '500',
    },
    content: {
        flex: 1,
        padding: 20,
    },
    earningsCard: {
        backgroundColor: '#8B5CF6',
        borderRadius: 20,
        padding: 24,
        marginBottom: 20,
        overflow: 'hidden',
        position: 'relative',
        shadowColor: '#8B5CF6',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.3,
        shadowRadius: 16,
        elevation: 8,
    },
    earningsHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        zIndex: 1,
    },
    earningsLabel: {
        color: 'rgba(255, 255, 255, 0.9)',
        fontSize: 14,
        fontWeight: '500',
        marginBottom: 8,
    },
    earningsValue: {
        color: '#FFFFFF',
        fontSize: 36,
        fontWeight: '800',
        marginBottom: 12,
        letterSpacing: -1,
    },
    growthBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 20,
        alignSelf: 'flex-start',
        gap: 4,
    },
    growthText: {
        color: '#FFFFFF',
        fontSize: 12,
        fontWeight: '600',
    },
    earningsIcon: {
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    circle1: {
        position: 'absolute',
        top: -30,
        right: -30,
        width: 140,
        height: 140,
        borderRadius: 70,
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
    },
    circle2: {
        position: 'absolute',
        bottom: -50,
        left: -30,
        width: 180,
        height: 180,
        borderRadius: 90,
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
    },
    statsGrid: {
        flexDirection: 'row',
        gap: 12,
        marginBottom: 24,
    },
    statCard: {
        flex: 1,
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        padding: 16,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    statIcon: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 8,
    },
    statValue: {
        fontSize: 20,
        fontWeight: '800',
        color: '#1E293B',
        marginBottom: 4,
    },
    statLabel: {
        fontSize: 12,
        color: '#64748B',
        fontWeight: '500',
    },
    section: {
        marginBottom: 24,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#1E293B',
        marginBottom: 16,
    },
    actionsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
    },
    actionCard: {
        width: '48%',
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        padding: 20,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    actionIcon: {
        width: 56,
        height: 56,
        borderRadius: 28,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 12,
    },
    actionText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#1E293B',
        textAlign: 'center',
    },
    bannerContainer: {
        marginBottom: 20,
    },
    bannerList: {
        paddingRight: 20,
    },
    bannerImage: {
        width: 300,
        height: 150,
        borderRadius: 16,
        marginRight: 12,
    },
});

export default DashboardScreen;
