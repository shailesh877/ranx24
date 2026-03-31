import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    ActivityIndicator,
    StatusBar,
    FlatList
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

const MembershipScreen = ({ navigation }: any) => {
    const { colors, isDark } = useTheme();
    const { user } = useAuth();
    const [plans, setPlans] = useState([]);
    const [loading, setLoading] = useState(true);
    const [buying, setBuying] = useState<string | null>(null);

    useEffect(() => {
        fetchPlans();
    }, []);

    const fetchPlans = async () => {
        try {
            const response = await api.get('/membership-plans');
            setPlans(response.data);
        } catch (error) {
            console.error('Error fetching plans:', error);
            Toast.show({
                type: 'error',
                text1: 'Error',
                text2: 'Failed to load membership plans'
            });
        } finally {
            setLoading(false);
        }
    };

    const handleBuy = async (planId: string) => {
        const plan: any = plans.find((p: any) => p._id === planId);
        if (!plan) return;

        try {
            setBuying(planId);
            
            // 1. Fetch Razorpay Key
            const razorpayKey = await getRazorpayKey();

            // 2. Create Order on Backend
            const orderResponse = await api.post('/payment/order', {
                amount: plan.price
            });

            const orderData = orderResponse.data;

            // 3. Open Razorpay Checkout
            const options = {
                description: `Membership: ${plan.name}`,
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
                theme: { color: '#3B82F6' }
            };

            const data = await RazorpayCheckout.open(options);

            // 4. Verify Payment on Backend
            const verifyResponse = await api.post('/payment/verify', {
                razorpay_order_id: data.razorpay_order_id,
                razorpay_payment_id: data.razorpay_payment_id,
                razorpay_signature: data.razorpay_signature,
                isMembershipPurchase: true,
                planId: planId
            });

            if (verifyResponse.data.success) {
                Toast.show({
                    type: 'success',
                    text1: 'Success',
                    text2: 'Membership activated successfully!'
                });
                navigation.navigate('Main', { screen: 'Profile' });
            } else {
                throw new Error('Payment verification failed');
            }

        } catch (error: any) {
            console.log('Purchase flow error:', error);
            
            // If the error is from Razorpay cancellation, it's not a real "error" we want to show as "Initiation failed"
            const errorMessage = error.description || error.response?.data?.message || error.message || 'Payment failed';
            
            Toast.show({
                type: 'error',
                text1: 'Payment Error',
                text2: errorMessage
            });
        } finally {
            setBuying(null);
        }
    };

    const getPlanColors = (name: string): [string, string] => {
        const lowerName = name.toLowerCase();
        if (lowerName.includes('gold')) return ['#F59E0B', '#D97706'];
        if (lowerName.includes('silver')) return ['#94A3B8', '#64748B'];
        if (lowerName.includes('platinum')) return ['#6366F1', '#4F46E5'];
        return ['#3B82F6', '#2563EB'];
    };

    const renderPlan = ({ item }: { item: any }) => {
        const planColors = getPlanColors(item.name);
        const isBuying = buying === item._id;

        return (
            <View style={[styles.planCard, { backgroundColor: colors.card }]}>
                <LinearGradient
                    colors={planColors}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.planHeader}
                >
                    <View style={styles.planHeaderContent}>
                        <View style={{ flex: 1, paddingRight: 10 }}>
                            <Text style={styles.planName}>{item.name}</Text>
                            
                            {item.actual_price ? (
                                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
                                    <Text style={{ color: 'rgba(255,255,255,0.7)', fontSize: 10, fontWeight: 'bold', textTransform: 'uppercase', marginRight: 6 }}>Regular Price</Text>
                                    <Text style={{ color: 'rgba(255,255,255,0.6)', fontSize: 14, fontWeight: 'bold', textDecorationLine: 'line-through' }}>
                                        ₹{item.actual_price}
                                    </Text>
                                </View>
                            ) : null}

                            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
                                <View style={{ backgroundColor: 'rgba(255,255,255,0.2)', paddingHorizontal: 6, paddingVertical: 3, borderRadius: 6, marginRight: 8 }}>
                                    <Text style={{ color: '#FFFFFF', fontSize: 10, fontWeight: '900', textTransform: 'uppercase' }}>Offer Price</Text>
                                </View>
                                <Text style={styles.planPrice}>₹{item.price}<Text style={styles.planDuration}> / {item.duration_months} mo</Text></Text>
                            </View>

                            <View style={{ backgroundColor: '#EF4444', alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6, flexDirection: 'row', alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.2, shadowRadius: 3, elevation: 3 }}>
                                <Ionicons name="flash" size={12} color="#FFFFFF" style={{ marginRight: 4 }} />
                                <Text style={{ color: '#FFFFFF', fontSize: 9, fontWeight: '900', textTransform: 'uppercase', letterSpacing: 0.5 }}>OFFER VALID FOR FIRST 100 CUSTOMERS ONLY!</Text>
                            </View>
                        </View>
                        <Ionicons name="ribbon" size={60} color="rgba(255,255,255,0.2)" />
                    </View>
                </LinearGradient>

                <View style={styles.planBody}>
                    <Text style={[styles.description, { color: colors.textSecondary }]}>{item.description}</Text>
                    
                    <View style={styles.featuresList}>
                        {item.discount_tiers?.map((tier: any, index: number) => (
                            <View key={index} style={styles.featureItem}>
                                <Ionicons name="checkmark-circle" size={18} color="#10B981" />
                                <Text style={[styles.featureText, { color: colors.text }]}>
                                    {tier.discount_percentage}% Off {tier.min_amount > 0 ? `on orders > ₹${tier.min_amount}` : 'on all orders'}
                                </Text>
                            </View>
                        ))}
                    </View>

                    <TouchableOpacity
                        style={[styles.buyButton, { backgroundColor: planColors[0] }]}
                        onPress={() => handleBuy(item._id)}
                        disabled={!!buying}
                    >
                        {isBuying ? (
                            <ActivityIndicator color="#FFF" size="small" />
                        ) : (
                            <Text style={styles.buyButtonText}>Get {item.name} Now</Text>
                        )}
                    </TouchableOpacity>
                </View>
            </View>
        );
    };

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
            <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} backgroundColor={colors.background} />
            
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Ionicons name="chevron-back" size={24} color={colors.text} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: colors.text }]}>Membership Plans</Text>
                <View style={{ width: 40 }} />
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
                    ListHeaderComponent={() => (
                        <View style={styles.introSection}>
                            <Text style={[styles.introTitle, { color: colors.text }]}>Choose Your Plan</Text>
                            <Text style={[styles.introSub, { color: colors.textSecondary }]}>Unlock premium benefits and save more on every service.</Text>
                        </View>
                    )}
                />
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
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    listContent: {
        paddingHorizontal: SPACING.m,
        paddingBottom: SPACING.xl,
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
        fontSize: 16,
        lineHeight: 22,
    },
    planCard: {
        borderRadius: 24,
        marginBottom: SPACING.l,
        overflow: 'hidden',
        ...SHADOWS.medium,
    },
    planHeader: {
        padding: SPACING.l,
    },
    planHeaderContent: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    planName: {
        color: '#FFFFFF',
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 4,
    },
    planPrice: {
        color: '#FFFFFF',
        fontSize: 28,
        fontWeight: 'bold',
    },
    planDuration: {
        fontSize: 14,
        fontWeight: 'normal',
        opacity: 0.8,
    },
    planBody: {
        padding: SPACING.l,
    },
    description: {
        fontSize: 15,
        lineHeight: 22,
        marginBottom: SPACING.l,
    },
    featuresList: {
        marginBottom: SPACING.xl,
    },
    featureItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
        gap: 10,
    },
    featureText: {
        fontSize: 15,
        fontWeight: '500',
    },
    buyButton: {
        height: 56,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        ...SHADOWS.light,
    },
    buyButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: 'bold',
    },
});

export default MembershipScreen;
