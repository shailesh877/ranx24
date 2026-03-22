import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    ActivityIndicator,
    RefreshControl,
    Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { handleApiError } from '../../utils/errorHandler';

const { width } = Dimensions.get('window');

interface EarningsData {
    totalEarnings: number;
    weeklyEarnings: number;
    monthlyEarnings: number;
    completedJobs: number;
    avgPerJob: number;
    tips: number;
    dailyEarnings: { day: string; amount: number }[];
}

const EarningsAnalyticsScreen = ({ navigation }: any) => {
    const { worker } = useAuth();
    const [data, setData] = useState<EarningsData | null>(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [period, setPeriod] = useState<'week' | 'month' | 'year'>('week');

    useEffect(() => {
        fetchAnalytics();
    }, [period]);

    const fetchAnalytics = async () => {
        try {
            const response = await api.get(`/workers/${worker?._id}/analytics?period=${period}`);
            setData(response.data || {
                totalEarnings: 8920,
                weeklyEarnings: 2340,
                monthlyEarnings: 8920,
                completedJobs: 12,
                avgPerJob: 743,
                tips: 340,
                dailyEarnings: [
                    { day: 'Mon', amount: 1200 },
                    { day: 'Tue', amount: 800 },
                    { day: 'Wed', amount: 1500 },
                    { day: 'Thu', amount: 600 },
                    { day: 'Fri', amount: 2100 },
                    { day: 'Sat', amount: 1800 },
                    { day: 'Sun', amount: 920 },
                ],
            });
        } catch (error) {
            console.error('Error fetching analytics:', error);
            if (loading) handleApiError(error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const onRefresh = () => {
        setRefreshing(true);
        fetchAnalytics();
    };

    const renderBarChart = () => {
        if (!data?.dailyEarnings) return null;

        const maxAmount = Math.max(...data.dailyEarnings.map(d => d.amount));

        return (
            <View style={styles.chartContainer}>
                <View style={styles.chart}>
                    {data.dailyEarnings.map((item, index) => {
                        const height = (item.amount / maxAmount) * 150;
                        return (
                            <View key={index} style={styles.barContainer}>
                                <View style={styles.barWrapper}>
                                    <Text style={styles.barAmount}>₹{item.amount}</Text>
                                    <View
                                        style={[
                                            styles.bar,
                                            {
                                                height: height || 10,
                                                backgroundColor: item.amount > 1000 ? '#8B5CF6' : '#C4B5FD',
                                            },
                                        ]}
                                    />
                                </View>
                                <Text style={styles.barLabel}>{item.day}</Text>
                            </View>
                        );
                    })}
                </View>
            </View>
        );
    };

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#8B5CF6" />
                <Text style={styles.loadingText}>Loading analytics...</Text>
            </View>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity
                    style={styles.backButton}
                    onPress={() => navigation.goBack()}
                >
                    <Ionicons name="arrow-back" size={24} color="#1E293B" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Earnings Analytics</Text>
                <View style={styles.placeholder} />
            </View>

            <ScrollView
                contentContainerStyle={styles.content}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        colors={['#8B5CF6']}
                    />
                }
            >
                {/* Period Selector */}
                <View style={styles.periodSelector}>
                    {(['week', 'month', 'year'] as const).map((p) => (
                        <TouchableOpacity
                            key={p}
                            style={[styles.periodButton, period === p && styles.periodButtonActive]}
                            onPress={() => setPeriod(p)}
                        >
                            <Text
                                style={[
                                    styles.periodButtonText,
                                    period === p && styles.periodButtonTextActive,
                                ]}
                            >
                                {p.charAt(0).toUpperCase() + p.slice(1)}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>

                {/* Total Earnings Card */}
                <View style={styles.totalCard}>
                    <Text style={styles.totalLabel}>Total Earnings</Text>
                    <Text style={styles.totalAmount}>₹{data?.totalEarnings.toLocaleString()}</Text>
                    <View style={styles.growthBadge}>
                        <Ionicons name="trending-up" size={16} color="#10B981" />
                        <Text style={styles.growthText}>+12% from last {period}</Text>
                    </View>
                </View>

                {/* Chart */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Daily Earnings</Text>
                    {renderBarChart()}
                </View>

                {/* Stats Grid */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Breakdown</Text>
                    <View style={styles.statsGrid}>
                        <View style={styles.statCard}>
                            <View style={[styles.statIcon, { backgroundColor: '#DBEAFE' }]}>
                                <Ionicons name="checkmark-done" size={24} color="#3B82F6" />
                            </View>
                            <Text style={styles.statValue}>{data?.completedJobs}</Text>
                            <Text style={styles.statLabel}>Completed Jobs</Text>
                        </View>

                        <View style={styles.statCard}>
                            <View style={[styles.statIcon, { backgroundColor: '#D1FAE5' }]}>
                                <Ionicons name="cash" size={24} color="#10B981" />
                            </View>
                            <Text style={styles.statValue}>₹{data?.avgPerJob}</Text>
                            <Text style={styles.statLabel}>Avg per Job</Text>
                        </View>

                        <View style={styles.statCard}>
                            <View style={[styles.statIcon, { backgroundColor: '#FEF3C7' }]}>
                                <Ionicons name="star" size={24} color="#F59E0B" />
                            </View>
                            <Text style={styles.statValue}>₹{data?.tips}</Text>
                            <Text style={styles.statLabel}>Tips Received</Text>
                        </View>
                    </View>
                </View>

                {/* Export Button */}
                <TouchableOpacity style={styles.exportButton}>
                    <Ionicons name="download-outline" size={20} color="#8B5CF6" />
                    <Text style={styles.exportButtonText}>Export Report</Text>
                </TouchableOpacity>
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
    content: {
        padding: 20,
    },
    periodSelector: {
        flexDirection: 'row',
        backgroundColor: '#F1F5F9',
        borderRadius: 12,
        padding: 4,
        marginBottom: 20,
    },
    periodButton: {
        flex: 1,
        paddingVertical: 10,
        borderRadius: 8,
        alignItems: 'center',
    },
    periodButtonActive: {
        backgroundColor: '#FFFFFF',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    periodButtonText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#64748B',
    },
    periodButtonTextActive: {
        color: '#8B5CF6',
        fontWeight: '700',
    },
    totalCard: {
        backgroundColor: '#8B5CF6',
        borderRadius: 20,
        padding: 24,
        marginBottom: 24,
        alignItems: 'center',
    },
    totalLabel: {
        fontSize: 14,
        color: 'rgba(255, 255, 255, 0.9)',
        marginBottom: 8,
    },
    totalAmount: {
        fontSize: 40,
        fontWeight: '800',
        color: '#FFFFFF',
        marginBottom: 12,
    },
    growthBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
        gap: 6,
    },
    growthText: {
        fontSize: 13,
        fontWeight: '600',
        color: '#FFFFFF',
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
    chartContainer: {
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        padding: 16,
        borderWidth: 1,
        borderColor: '#F1F5F9',
    },
    chart: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'flex-end',
        height: 200,
    },
    barContainer: {
        alignItems: 'center',
        flex: 1,
    },
    barWrapper: {
        alignItems: 'center',
        justifyContent: 'flex-end',
        height: 170,
    },
    bar: {
        width: 32,
        borderRadius: 8,
        marginTop: 8,
    },
    barAmount: {
        fontSize: 10,
        fontWeight: '600',
        color: '#64748B',
        marginBottom: 4,
    },
    barLabel: {
        fontSize: 12,
        fontWeight: '600',
        color: '#64748B',
        marginTop: 8,
    },
    statsGrid: {
        flexDirection: 'row',
        gap: 12,
    },
    statCard: {
        flex: 1,
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        padding: 16,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#F1F5F9',
    },
    statIcon: {
        width: 48,
        height: 48,
        borderRadius: 24,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 12,
    },
    statValue: {
        fontSize: 18,
        fontWeight: '700',
        color: '#1E293B',
        marginBottom: 4,
    },
    statLabel: {
        fontSize: 11,
        color: '#64748B',
        textAlign: 'center',
        fontWeight: '500',
    },
    exportButton: {
        flexDirection: 'row',
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        padding: 16,
        justifyContent: 'center',
        alignItems: 'center',
        gap: 8,
        borderWidth: 2,
        borderColor: '#8B5CF6',
    },
    exportButtonText: {
        fontSize: 16,
        fontWeight: '700',
        color: '#8B5CF6',
    },
});

export default EarningsAnalyticsScreen;
