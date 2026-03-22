import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    ActivityIndicator,
    StatusBar,
    FlatList,
    Dimensions
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { SIZES, SPACING, SHADOWS } from '../../constants/theme';
import api from '../../services/api';
import Toast from 'react-native-toast-message';
import { LinearGradient } from 'expo-linear-gradient';
import RazorpayCheckout from 'react-native-razorpay';
import { getRazorpayKey } from '../../services/razorpayService';

const { width } = Dimensions.get('window');

const AMCScreen = ({ navigation }: any) => {
    const { colors, isDark } = useTheme();
    const { isAuthenticated, user } = useAuth();
    const [plans, setPlans] = useState([]);
    const [selectedPlans, setSelectedPlans] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);
    const [purchasing, setPurchasing] = useState(false);

    useEffect(() => {
        fetchPlans();
    }, []);

    const fetchPlans = async () => {
        try {
            const response = await api.get('/amc-plans');
            setPlans(response.data);
        } catch (error) {
            console.error('Error fetching AMC plans:', error);
            Toast.show({
                type: 'error',
                text1: 'Error',
                text2: 'Failed to load AMC plans'
            });
        } finally {
            setLoading(false);
        }
    };

    const togglePlan = (planId: string) => {
        setSelectedPlans(prev => 
            prev.includes(planId) 
                ? prev.filter(id => id !== planId)
                : [...prev, planId]
        );
    };

    const totalPrice = selectedPlans.reduce((sum, id) => {
        const plan: any = plans.find((p: any) => p._id === id);
        return sum + (plan ? parseFloat(plan.total_price) : 0);
    }, 0);

    const handlePurchase = async () => {
        if (!isAuthenticated) {
            Toast.show({
                type: 'error',
                text1: 'Authentication',
                text2: 'Please login to purchase an AMC package'
            });
            navigation.navigate('Login');
            return;
        }

        if (selectedPlans.length === 0) {
            Toast.show({
                type: 'error',
                text1: 'Selection',
                text2: 'Please select at least one plan'
            });
            return;
        }

        try {
            setPurchasing(true);
            
            // 1. Fetch Razorpay Key
            const razorpayKey = await getRazorpayKey();

            // 2. Create Order on Backend
            const orderResponse = await api.post('/payment/order', {
                amount: totalPrice
            });

            const orderData = orderResponse.data;

            // 3. Open Razorpay Checkout
            const options = {
                description: `AMC Package Purchase (${selectedPlans.length} plans)`,
                image: 'https://ranx24.com/logo.png',
                currency: orderData.currency,
                key: razorpayKey,
                amount: orderData.amount,
                name: 'RanX24',
                order_id: orderData.id,
                prefill: {
                    email: user?.email || '',
                    contact: user?.phone || '',
                    name: user?.name || ''
                },
                theme: { color: '#4F46E5' }
            };

            const data = await RazorpayCheckout.open(options);

            // 4. Verify Payment on Backend
            const verifyResponse = await api.post('/payment/verify', {
                razorpay_order_id: data.razorpay_order_id,
                razorpay_payment_id: data.razorpay_payment_id,
                razorpay_signature: data.razorpay_signature,
                isAMCPurchase: true,
                planIds: selectedPlans
            });

            if (verifyResponse.data.success) {
                Toast.show({
                    type: 'success',
                    text1: 'Success',
                    text2: 'AMC Package activated successfully!'
                });
                navigation.navigate('Main', { screen: 'Profile' });
            } else {
                throw new Error('Payment verification failed');
            }

        } catch (error: any) {
            console.log('AMC Purchase flow error:', error);
            const errorMessage = error.description || error.response?.data?.message || error.message || 'Payment failed';
            
            Toast.show({
                type: 'error',
                text1: 'Payment Error',
                text2: errorMessage
            });
        } finally {
            setPurchasing(false);
        }
    };

    const renderPlan = ({ item }: { item: any }) => {
        const isSelected = selectedPlans.includes(item._id);

        return (
            <TouchableOpacity 
                activeOpacity={0.8}
                onPress={() => togglePlan(item._id)}
                style={[
                    styles.planCard, 
                    { 
                        backgroundColor: colors.card,
                        borderColor: isSelected ? colors.primary : colors.border,
                        borderWidth: isSelected ? 2 : 1
                    }
                ]}
            >
                <View style={styles.planContent}>
                    <View style={[styles.iconBox, { backgroundColor: isSelected ? colors.primary : colors.input }]}>
                        <Ionicons name="construct" size={24} color={isSelected ? '#FFF' : colors.primary} />
                    </View>
                    
                    <View style={styles.planInfo}>
                        <Text style={[styles.planName, { color: colors.text }]}>{item.name}</Text>
                        <Text style={[styles.planCategory, { color: colors.textSecondary }]}>Category: {item.service_category}</Text>
                        
                        {item.description && (
                            <Text style={[styles.planDescription, { color: colors.textSecondary }]} numberOfLines={2}>
                                {item.description}
                            </Text>
                        )}
                        
                        <View style={styles.detailsRow}>
                            <View style={styles.detailItem}>
                                <Ionicons name="calendar-outline" size={14} color={colors.textSecondary} />
                                <Text style={[styles.detailText, { color: colors.textSecondary }]}>{item.duration_months} Months</Text>
                            </View>
                            <View style={styles.detailItem}>
                                <Ionicons name="walk-outline" size={14} color={colors.textSecondary} />
                                <Text style={[styles.detailText, { color: colors.textSecondary }]}>{item.number_of_visits} Visits</Text>
                            </View>
                        </View>

                        <Text style={[styles.planPrice, { color: colors.primary }]}>₹{item.total_price}</Text>
                    </View>

                    <View style={[styles.checkbox, { backgroundColor: isSelected ? colors.primary : 'transparent', borderColor: isSelected ? colors.primary : colors.border }]}>
                        {isSelected && <Ionicons name="checkmark" size={16} color="#FFF" />}
                    </View>
                </View>
            </TouchableOpacity>
        );
    };

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
            <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} backgroundColor={colors.background} />
            
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Ionicons name="chevron-back" size={24} color={colors.text} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: colors.text }]}>Annual Maintenance</Text>
                <View style={{ width: 40 }} />
            </View>

            <View style={styles.content}>
                <View style={styles.introSection}>
                    <Text style={[styles.introTitle, { color: colors.text }]}>Custom Package</Text>
                    <Text style={[styles.introSub, { color: colors.textSecondary }]}>Select one or more plans to build your custom annual contract.</Text>
                </View>

                {loading ? (
                    <View style={styles.loadingContainer}>
                        <ActivityIndicator size="large" color={colors.primary} />
                    </View>
                ) : (
                    <FlatList
                        data={plans}
                        renderItem={renderPlan}
                        keyExtractor={(item: any) => item._id}
                        contentContainerStyle={styles.listContent}
                        showsVerticalScrollIndicator={false}
                    />
                )}
            </View>

            {/* Bottom Summary Bar */}
            {selectedPlans.length > 0 && (
                <View style={[styles.bottomBar, { backgroundColor: colors.card, borderTopColor: colors.border }]}>
                    <View style={styles.summaryInfo}>
                        <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>{selectedPlans.length} plans selected</Text>
                        <Text style={[styles.summaryPrice, { color: colors.text }]}>Total: ₹{totalPrice}</Text>
                    </View>
                    <TouchableOpacity 
                        style={[styles.purchaseBtn, { backgroundColor: colors.primary }]}
                        onPress={handlePurchase}
                        disabled={purchasing}
                    >
                        {purchasing ? (
                            <ActivityIndicator color="#FFF" size="small" />
                        ) : (
                            <Text style={styles.purchaseBtnText}>Purchase</Text>
                        )}
                    </TouchableOpacity>
                </View>
            )}
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: SPACING.m,
        paddingVertical: SPACING.m,
    },
    backButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    content: {
        flex: 1,
        paddingHorizontal: SPACING.m,
    },
    introSection: {
        marginBottom: SPACING.l,
        marginTop: SPACING.m,
    },
    introTitle: {
        fontSize: 28,
        fontWeight: 'bold',
        marginBottom: 8,
    },
    introSub: {
        fontSize: 15,
        lineHeight: 20,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    listContent: {
        paddingBottom: 100,
    },
    planCard: {
        borderRadius: 20,
        marginBottom: SPACING.m,
        padding: SPACING.m,
        ...SHADOWS.light,
    },
    planContent: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    iconBox: {
        width: 50,
        height: 50,
        borderRadius: 15,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: SPACING.m,
    },
    planInfo: {
        flex: 1,
    },
    planName: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 2,
    },
    planCategory: {
        fontSize: 12,
        fontWeight: 'bold',
        textTransform: 'uppercase',
        marginBottom: 4,
    },
    planDescription: {
        fontSize: 13,
        lineHeight: 18,
        marginBottom: 8,
    },
    detailsRow: {
        flexDirection: 'row',
        gap: 12,
        marginBottom: 6,
    },
    detailItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    detailText: {
        fontSize: 12,
        fontWeight: '500',
    },
    planPrice: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    checkbox: {
        width: 24,
        height: 24,
        borderRadius: 12,
        borderWidth: 2,
        justifyContent: 'center',
        alignItems: 'center',
    },
    bottomBar: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        padding: SPACING.l,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderTopWidth: 1,
        ...SHADOWS.medium,
    },
    summaryInfo: {
        flex: 1,
    },
    summaryLabel: {
        fontSize: 13,
        fontWeight: '600',
        marginBottom: 2,
    },
    summaryPrice: {
        fontSize: 20,
        fontWeight: 'bold',
    },
    purchaseBtn: {
        paddingHorizontal: SPACING.xl,
        paddingVertical: SPACING.m,
        borderRadius: 15,
        ...SHADOWS.light,
    },
    purchaseBtnText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: 'bold',
    },
});

export default AMCScreen;
