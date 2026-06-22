import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    Image,
    StatusBar,
    Alert,
    ActivityIndicator
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { SIZES, SPACING, SHADOWS } from '../../constants/theme';
import api from '../../services/api';
import MembershipCard from '../../components/MembershipCard';
import RazorpayCheckout from 'react-native-razorpay';
import { getRazorpayKey } from '../../services/razorpayService';
import Toast from 'react-native-toast-message';

const ProfileScreen = ({ navigation }: any) => {
    const { user, logout } = useAuth();
    const { colors, isDark } = useTheme();
    const [memberships, setMemberships] = React.useState<any[]>([]);
    const [amcs, setAmcs] = React.useState<any[]>([]);
    const [loading, setLoading] = React.useState(false);

    React.useEffect(() => {
        fetchActivePlans();
    }, []);

    const fetchActivePlans = async () => {
        try {
            setLoading(true);
            const { data } = await api.get('/users/profile');
            
            if (data) {
                setMemberships(data.memberships || []);
                setAmcs(data.amcs || []);
            }
        } catch (error) {
            console.error('Error fetching profile data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handlePayInstallment = async (installment: any) => {
        try {
            const razorpayKey = await getRazorpayKey();
            
            // 1. Create Order
            const { data: orderData } = await api.post('/payment/order', {
                amount: Math.round(installment.amount_due)
            });

            // 2. Open Razorpay
            const options = {
                description: `AMC Package EMI Installment #${installment.installment_number}`,
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

            const paymentData = await RazorpayCheckout.open(options);

            // 3. Verify Payment
            const verifyRes = await api.post('/payment/verify', {
                razorpay_order_id: paymentData.razorpay_order_id,
                razorpay_payment_id: paymentData.razorpay_payment_id,
                razorpay_signature: paymentData.razorpay_signature,
                isInstallmentPayment: true,
                installmentId: installment._id
            });

            if (verifyRes.data.success) {
                Toast.show({
                    type: 'success',
                    text1: 'Payment Successful',
                    text2: `Installment #${installment.installment_number} Paid!`
                });
                fetchActivePlans();
            } else {
                Toast.show({
                    type: 'error',
                    text1: 'Verification Failed',
                    text2: 'Please contact support'
                });
            }
        } catch (error: any) {
            console.log('EMI Payment Error:', error);
            Toast.show({
                type: 'error',
                text1: 'Payment Failed',
                text2: error.description || 'Action cancelled'
            });
        }
    };

    const menuItems = [
        { icon: 'scan-outline', label: 'Verify Professional (QR)', screen: 'QRScanner', color: '#EF4444' },
        { icon: 'person-outline', label: 'Edit Profile', screen: 'EditProfile', color: '#3B82F6' },
        { icon: 'ribbon-outline', label: 'Membership Plans', screen: 'Membership', color: '#F59E0B' },
        { icon: 'shield-checkmark-outline', label: 'AMC', screen: 'AMC', color: '#10B981' },
        { icon: 'location-outline', label: 'My Addresses', screen: 'MyAddresses', color: '#10B981' },
        { icon: 'calendar-outline', label: 'My Bookings', screen: 'MyBookings', color: '#8B5CF6' },
        { icon: 'notifications-outline', label: 'Notifications', screen: 'Notifications', color: '#F59E0B' },
        { icon: 'help-circle-outline', label: 'Help & Support', screen: 'Help', color: '#6B7280' },
        { icon: 'information-circle-outline', label: 'About Us', screen: 'About', color: '#6366F1' },
        { icon: 'settings-outline', label: 'Settings', screen: 'Settings', color: '#4B5563' },
    ];

    const handleLogout = () => {
        Alert.alert(
            "Logout",
            "Are you sure you want to logout?",
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Logout",
                    style: "destructive",
                    onPress: async () => await logout()
                }
            ]
        );
    };

    const renderMenuItem = (item: any, index: number) => (
        <TouchableOpacity
            key={index}
            style={styles.menuItem}
            onPress={() => item.screen ? navigation.navigate(item.screen) : Alert.alert("Coming Soon", "This feature is under development.")}
        >
            <View style={[styles.menuIconBox, { backgroundColor: `${item.color}15` }]}>
                <Ionicons name={item.icon as any} size={22} color={item.color} />
            </View>
            <Text style={[styles.menuItemText, { color: colors.text }]}>{item.label}</Text>
            <Ionicons name="chevron-forward" size={20} color={colors.textLight} />
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
            <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} backgroundColor={colors.background} />

            <ScrollView showsVerticalScrollIndicator={false}>
                {/* Header */}
                <View style={styles.header}>
                    <Text style={[styles.headerTitle, { color: colors.text }]}>My Profile</Text>
                    <TouchableOpacity style={[styles.editBtn, { backgroundColor: colors.input }]} onPress={() => navigation.navigate('EditProfile')}>
                        <Text style={[styles.editBtnText, { color: colors.primary }]}>Edit</Text>
                    </TouchableOpacity>
                </View>

                {/* Profile Card */}
                <View style={styles.profileCard}>
                    <Image
                        source={{ uri: "https://cdn-icons-png.flaticon.com/512/3135/3135715.png" }}
                        style={[styles.avatar, { borderColor: colors.card }]}
                    />
                    <View style={styles.profileInfo}>
                        <Text style={[styles.name, { color: colors.text }]}>{user?.name || 'User'}</Text>
                        <Text style={[styles.email, { color: colors.textSecondary }]}>{user?.email || 'user@example.com'}</Text>
                        <Text style={[styles.phone, { color: colors.textSecondary }]}>+91 {user?.phone || '9876543210'}</Text>
                    </View>
                </View>

                {/* Active Plans Section */}
                {loading ? (
                    <View style={{ padding: 20 }}>
                        <ActivityIndicator color={colors.primary} />
                    </View>
                ) : (memberships.length > 0 || amcs.length > 0) && (
                    <View style={styles.activePlansContainer}>
                        {memberships.map((mem: any, index: number) => (
                            <View key={mem._id || index} style={{ marginBottom: 16 }}>
                                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, paddingHorizontal: 4 }}>
                                    <Text style={{ fontSize: 16, fontWeight: 'bold', color: colors.text }}>
                                        {mem.planName} Exclusive
                                    </Text>
                                    <View style={{ backgroundColor: '#D1FAE5', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 }}>
                                        <Text style={{ color: '#047857', fontSize: 10, fontWeight: '900', textTransform: 'uppercase' }}>Active</Text>
                                    </View>
                                </View>
                                <MembershipCard 
                                    userName={user?.name || mem.userName || 'Member'}
                                    cardNumber={mem.card_number}
                                    expiryDate={mem.expiry || mem.expiry_date}
                                    planName={mem.planName || mem.plan_id?.name}
                                />

                                {/* Membership Benefits */}
                                {mem.planDetails?.discount_tiers && mem.planDetails.discount_tiers.length > 0 && (
                                    <View style={styles.benefitsContainer}>
                                        <Text style={[styles.sectionTitle, { color: colors.textSecondary, marginLeft: 0, marginBottom: 8, fontSize: 12 }]}>Your Member Benefits</Text>
                                        <View style={styles.benefitsGrid}>
                                            {mem.planDetails.discount_tiers.map((tier: any, idx: number) => (
                                                <View key={idx} style={[styles.benefitItem, { backgroundColor: colors.card, borderColor: colors.border }]}>
                                                    <View style={[styles.checkCircle, { backgroundColor: '#10B981' }]}>
                                                        <Ionicons name="checkmark" size={12} color="#FFF" />
                                                    </View>
                                                    <Text style={[styles.benefitText, { color: colors.text }]}>
                                                        {tier.discount || tier.discount_percentage}% OFF {tier.min_amount ? `above ₹${tier.min_amount}` : 'on all bookings'}
                                                    </Text>
                                                </View>
                                            ))}
                                        </View>
                                    </View>
                                )}
                            </View>
                        ))}

                        {amcs.map((amcData: any, index: number) => (
                            <LinearGradient
                                key={amcData._id || index}
                                colors={['#10B981', '#059669']}
                                style={[styles.activeCard, { marginBottom: 16 }]}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 1 }}
                            >
                                <View style={styles.activeCardHeader}>
                                    <View style={styles.activeCardTitleBox}>
                                        <Ionicons name="shield-checkmark" size={24} color="#D1FAE5" />
                                        <View>
                                            <Text style={styles.activeCardTitle}>{amcData.planName.toLowerCase().includes('package') ? amcData.planName : `${amcData.planName} Package`}</Text>
                                            <Text style={{ color: '#D1FAE5', fontSize: 12, marginLeft: 8 }}>#{amcData.contract_number}</Text>
                                        </View>
                                    </View>
                                    <View style={{ alignItems: 'flex-end' }}>
                                        <Text style={{ fontSize: 10, color: '#D1FAE5', fontWeight: 'bold', textTransform: 'uppercase' }}>Valid Till</Text>
                                        <Text style={{ fontSize: 16, color: '#FFF', fontWeight: '900' }}>{amcData.expiry || amcData.end_date}</Text>
                                    </View>
                                </View>

                                {/* AMC Benefits Summary */}
                                <View style={styles.amcBenefitsRow}>
                                    <View style={styles.amcBenefitBadge}>
                                        <Ionicons name="flash-outline" size={12} color="#FFF" />
                                        <Text style={styles.amcBenefitText}>Priority Coordination</Text>
                                    </View>
                                    <View style={styles.amcBenefitBadge}>
                                        <Ionicons name="construct-outline" size={12} color="#FFF" />
                                        <Text style={styles.amcBenefitText}>Event Experts</Text>
                                    </View>
                                    <View style={styles.amcBenefitBadge}>
                                        <Ionicons name="time-outline" size={12} color="#FFF" />
                                        <Text style={styles.amcBenefitText}>Quick Response</Text>
                                    </View>
                                    {(amcData.total_visits > 0 || amcData.remaining_visits > 0) && (
                                        <View style={styles.amcBenefitBadge}>
                                            <Ionicons name="walk-outline" size={12} color="#FFF" />
                                            <Text style={styles.amcBenefitText}>Visits: {amcData.remaining_visits || 0}/{amcData.total_visits || 0}</Text>
                                        </View>
                                    )}
                                </View>

                                {(amcData.plans_data || amcData.plans) && (amcData.plans_data || amcData.plans).length > 0 && (
                                    <View style={styles.amcPlansContainer}>
                                        <Text style={styles.amcPlansHeader}>Included Services</Text>
                                        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 4 }}>
                                            {(amcData.plans_data || amcData.plans).map((p: any, idx: number) => (
                                                <View key={idx} style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.15)', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 12 }}>
                                                    <View style={{ width: 16, height: 16, borderRadius: 8, backgroundColor: '#34D399', alignItems: 'center', justifyContent: 'center', marginRight: 6 }}>
                                                        <Ionicons name="checkmark" size={12} color="#FFF" />
                                                    </View>
                                                    <Text style={{ color: '#FFF', fontSize: 12, fontWeight: 'bold' }}>{p.name}</Text>
                                                </View>
                                            ))}
                                        </View>
                                    </View>
                                )}

                                <View style={{ marginTop: 16, paddingTop: 12, borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.2)', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                        <View style={{ width: 28, height: 28, borderRadius: 14, backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center' }}>
                                            <Ionicons name="person" size={14} color="#FFF" />
                                        </View>
                                        <Text style={{ color: '#D1FAE5', fontSize: 11, marginLeft: 8, fontWeight: 'bold' }}>
                                            Coordinator: <Text style={{ color: '#FFF' }}>{amcData.technician_name || 'Assigned Soon'}</Text>
                                        </Text>
                                    </View>
                                    <View style={{ backgroundColor: '#10B981', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 }}>
                                        <Text style={{ color: '#FFF', fontSize: 10, fontWeight: '900', textTransform: 'uppercase' }}>Status: {amcData.status}</Text>
                                    </View>
                                </View>

                                {/* EMI Installments Section */}
                                {amcData.payment_mode === 'EMI' && amcData.installments && amcData.installments.length > 0 && (
                                    <View style={styles.installmentContainer}>
                                        <Text style={styles.installmentHeader}>Installment Schedule</Text>
                                        {amcData.installments.map((inst: any, idx: number) => {
                                            const isPaid = inst.status === 'Paid';
                                            const isOverdue = new Date(inst.due_date) < new Date() && !isPaid;
                                            
                                            return (
                                                <View key={idx} style={styles.installmentItem}>
                                                    <View>
                                                        <Text style={styles.instNumber}>Installment #{inst.installment_number}</Text>
                                                        <Text style={styles.instDate}>Due: {new Date(inst.due_date).toLocaleDateString()}</Text>
                                                    </View>
                                                    
                                                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                                                        <Text style={styles.instAmount}>₹{Math.round(inst.amount_due)}</Text>
                                                        {isPaid ? (
                                                            <View style={styles.paidBadge}>
                                                                <Ionicons name="checkmark-done" size={14} color="#FFF" />
                                                                <Text style={styles.paidText}>Paid</Text>
                                                            </View>
                                                        ) : (
                                                            <TouchableOpacity 
                                                                style={[styles.payNowBtn, isOverdue && { backgroundColor: '#EF4444' }]} 
                                                                onPress={() => handlePayInstallment(inst)}
                                                            >
                                                                {isOverdue && <Ionicons name="alert-circle" size={14} color="#FFF" />}
                                                                <Text style={styles.payNowText}>{isOverdue ? 'Overdue' : 'Pay Now'}</Text>
                                                            </TouchableOpacity>
                                                        )}
                                                    </View>
                                                </View>
                                            );
                                        })}
                                    </View>
                                )}
                            </LinearGradient>
                        ))}
                    </View>
                )}

                <View style={styles.section}>
                    <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>General</Text>
                    <View style={[styles.menuContainer, { backgroundColor: colors.card }]}>
                        {menuItems.slice(0, 4).map(renderMenuItem)}
                    </View>
                </View>

                <View style={styles.section}>
                    <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>Preferences</Text>
                    <View style={[styles.menuContainer, { backgroundColor: colors.card }]}>
                        {menuItems.slice(4).map(renderMenuItem)}
                    </View>
                </View>


                <View style={{ height: 100 }} />
            </ScrollView>
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
        fontSize: SIZES.h2,
        fontWeight: 'bold',
    },
    editBtn: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
    },
    editBtnText: {
        fontSize: 14,
        fontWeight: '600',
    },
    profileCard: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: SPACING.l,
        marginBottom: SPACING.l,
    },
    avatar: {
        width: 80,
        height: 80,
        borderRadius: 40,
        borderWidth: 3,
    },
    profileInfo: {
        marginLeft: SPACING.m,
        flex: 1,
    },
    name: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 4,
    },
    email: {
        fontSize: 14,
        marginBottom: 2,
    },
    phone: {
        fontSize: 14,
    },
    walletCard: {
        marginHorizontal: SPACING.m,
        borderRadius: 20,
        padding: SPACING.l,
        marginBottom: SPACING.l,
        ...SHADOWS.medium,
    },
    walletHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: SPACING.l,
    },
    walletLabel: {
        color: 'rgba(255,255,255,0.8)',
        fontSize: 14,
        marginBottom: 4,
    },
    walletAmount: {
        color: '#FFFFFF',
        fontSize: 32,
        fontWeight: 'bold',
    },
    walletIcon: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(255,255,255,0.2)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    walletActions: {
        flexDirection: 'row',
        gap: SPACING.m,
    },
    walletBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.2)',
        paddingHorizontal: SPACING.m,
        paddingVertical: 8,
        borderRadius: 12,
        gap: 6,
    },
    walletBtnText: {
        color: '#FFFFFF',
        fontWeight: '600',
        fontSize: 14,
    },
    section: {
        paddingHorizontal: SPACING.m,
        marginBottom: SPACING.l,
    },
    sectionTitle: {
        fontSize: 14,
        fontWeight: '600',
        marginBottom: SPACING.s,
        marginLeft: SPACING.s,
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    menuContainer: {
        borderRadius: 16,
        padding: SPACING.s,
        ...SHADOWS.light,
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: SPACING.m,
    },
    menuIconBox: {
        width: 36,
        height: 36,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: SPACING.m,
    },
    menuItemText: {
        flex: 1,
        fontSize: 16,
        fontWeight: '500',
    },
    logoutButton: {
        marginHorizontal: SPACING.m,
        padding: SPACING.m,
        borderRadius: 16,
        alignItems: 'center',
        marginBottom: SPACING.m,
    },
    logoutText: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    version: {
        textAlign: 'center',
        fontSize: 12,
        marginBottom: SPACING.l,
    },
    activePlansContainer: {
        paddingHorizontal: SPACING.m,
        marginBottom: SPACING.l,
        gap: 12,
    },
    activeCard: {
        borderRadius: 20,
        padding: 16,
        ...SHADOWS.medium,
    },
    activeCardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    activeCardTitleBox: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    activeCardTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#FFF',
        marginLeft: 8,
    },
    activeCardExpiry: {
        fontSize: 12,
        color: 'rgba(255,255,255,0.8)',
    },
    activeCardBody: {
        marginTop: 12,
    },
    activeCardBenefit: {
        fontSize: 14,
        color: '#FFF',
        marginBottom: 4,
        fontWeight: '500',
    },
    amcDetailsGrid: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 8,
    },
    amcDetailItem: {
        flex: 1,
    },
    amcDetailLabel: {
        fontSize: 10,
        color: 'rgba(255,255,255,0.8)',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    amcDetailValue: {
        fontSize: 15,
        color: '#FFF',
        fontWeight: 'bold',
    },
    amcPlansContainer: {
        marginTop: 8,
        paddingTop: 8,
        borderTopWidth: 1,
        borderTopColor: 'rgba(255,255,255,0.2)',
    },
    amcPlansHeader: {
        fontSize: 10,
        color: 'rgba(255,255,255,0.7)',
        fontWeight: 'bold',
        textTransform: 'uppercase',
        marginBottom: 4,
    },
    amcPlanDetailItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        marginBottom: 2,
    },
    amcPlanDetailText: {
        fontSize: 13,
        color: '#FFF',
        fontWeight: '500',
    },
    installmentContainer: {
        marginTop: 16,
        paddingTop: 12,
        borderTopWidth: 1,
        borderTopColor: 'rgba(255,255,255,0.2)',
    },
    installmentHeader: {
        fontSize: 10,
        color: 'rgba(255,255,255,0.7)',
        fontWeight: 'bold',
        textTransform: 'uppercase',
        marginBottom: 10,
        letterSpacing: 1,
    },
    installmentItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 8,
        borderBottomWidth: 0.5,
        borderBottomColor: 'rgba(255,255,255,0.1)',
    },
    instNumber: {
        color: '#FFF',
        fontSize: 13,
        fontWeight: 'bold',
    },
    instDate: {
        color: '#D1FAE5',
        fontSize: 10,
        fontWeight: '500',
    },
    instAmount: {
        color: '#FFF',
        fontSize: 16,
        fontWeight: '900',
    },
    paidBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.2)',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 8,
        gap: 4,
    },
    paidText: {
        color: '#FFF',
        fontSize: 10,
        fontWeight: 'bold',
        textTransform: 'uppercase',
    },
    payNowBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFF',
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 8,
        gap: 4,
    },
    payNowText: {
        color: '#059669',
        fontSize: 10,
        fontWeight: 'bold',
        textTransform: 'uppercase',
    },
    benefitsContainer: {
        marginTop: 16,
        paddingHorizontal: 4,
    },
    benefitsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 10,
    },
    benefitItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingVertical: 10,
        borderRadius: 15,
        borderWidth: 1,
        width: '100%',
        gap: 10,
        ...SHADOWS.light,
    },
    checkCircle: {
        width: 20,
        height: 20,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
    },
    benefitText: {
        fontSize: 14,
        fontWeight: 'bold',
    },
    amcBenefitsRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 10,
        marginTop: 12,
        marginBottom: 4,
    },
    amcBenefitBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.15)',
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 10,
        gap: 6,
    },
    amcBenefitText: {
        color: '#FFF',
        fontSize: 11,
        fontWeight: 'bold',
    },
});

export default ProfileScreen;
