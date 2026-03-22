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

const ProfileScreen = ({ navigation }: any) => {
    const { user, logout } = useAuth();
    const { colors, isDark } = useTheme();
    const [membership, setMembership] = React.useState<any>(null);
    const [amc, setAmc] = React.useState<any>(null);
    const [loading, setLoading] = React.useState(false);

    React.useEffect(() => {
        fetchActivePlans();
    }, []);

    const fetchActivePlans = async () => {
        try {
            setLoading(true);
            const [memRes, amcRes] = await Promise.all([
                api.get('/membership-plans/my-membership'),
                api.get('/amc-plans/my-amc')
            ]);
            
            if (memRes.data.success) setMembership(memRes.data.data);
            if (amcRes.data.success) setAmc(amcRes.data.data);
        } catch (error) {
            console.error('Error fetching active plans:', error);
        } finally {
            setLoading(false);
        }
    };

    const menuItems = [
        { icon: 'person-outline', label: 'Edit Profile', screen: 'EditProfile', color: '#3B82F6' },
        { icon: 'ribbon-outline', label: 'Membership Plans', screen: 'Membership', color: '#F59E0B' },
        { icon: 'shield-checkmark-outline', label: 'Annual Maintenance (AMC)', screen: 'AMC', color: '#10B981' },
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
                ) : (membership || amc) && (
                    <View style={styles.activePlansContainer}>
                        {membership && (
                            <LinearGradient
                                colors={['#F59E0B', '#D97706']}
                                style={styles.activeCard}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 1 }}
                            >
                                <View style={styles.activeCardHeader}>
                                    <View style={styles.activeCardTitleBox}>
                                        <Ionicons name="ribbon" size={20} color="#FFF" />
                                        <Text style={styles.activeCardTitle}>{membership.plan_id?.name || 'Active Membership'}</Text>
                                    </View>
                                    <Text style={styles.activeCardExpiry}>Ends: {membership.expiry_date}</Text>
                                </View>
                                <View style={styles.activeCardBody}>
                                    <Text style={styles.activeCardBenefit}>
                                        <Ionicons name="checkmark-circle" size={14} color="#FFF" /> {membership.plan_id?.discount_tiers?.[membership.plan_id?.discount_tiers?.length - 1]?.discount_percentage}% Max Discount on all services
                                    </Text>
                                    <Text style={styles.activeCardBenefit}>
                                        <Ionicons name="time" size={14} color="#FFF" /> Valid for {membership.plan_id?.duration_months} Months
                                    </Text>
                                </View>
                            </LinearGradient>
                        )}

                        {amc && (
                            <LinearGradient
                                colors={['#10B981', '#059669']}
                                style={styles.activeCard}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 1 }}
                            >
                                <View style={styles.activeCardHeader}>
                                    <View style={styles.activeCardTitleBox}>
                                        <Ionicons name="construct" size={20} color="#FFF" />
                                        <Text style={styles.activeCardTitle}>Active AMC</Text>
                                    </View>
                                    <Text style={styles.activeCardExpiry}>Ends: {amc.end_date}</Text>
                                </View>
                                <View style={styles.activeCardBody}>
                                    <View style={styles.amcDetailsGrid}>
                                        <View style={styles.amcDetailItem}>
                                            <Text style={styles.amcDetailLabel}>Contract</Text>
                                            <Text style={styles.amcDetailValue}>#{amc.contract_number}</Text>
                                        </View>
                                        <View style={styles.amcDetailItem}>
                                            <Text style={styles.amcDetailLabel}>Total Visits</Text>
                                            <Text style={styles.amcDetailValue}>
                                                {amc.plans?.reduce((acc: number, p: any) => acc + parseInt(p.number_of_visits || 0), 0)} Visits
                                            </Text>
                                        </View>
                                    </View>
                                    <View style={styles.amcPlansContainer}>
                                        <Text style={styles.amcPlansHeader}>Included Services:</Text>
                                        {amc.plans?.map((p: any, idx: number) => (
                                            <View key={idx} style={styles.amcPlanDetailItem}>
                                                <Ionicons name="shield-checkmark" size={12} color="rgba(255,255,255,0.9)" />
                                                <Text style={styles.amcPlanDetailText}>
                                                    {p.name} • {p.service_category} ({p.number_of_visits} {parseInt(p.number_of_visits) > 1 ? 'Visits' : 'Visit'})
                                                </Text>
                                            </View>
                                        ))}
                                    </View>
                                </View>
                            </LinearGradient>
                        )}
                    </View>
                )}

                {/* Menu */}
                <View style={styles.section}>
                    <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>General</Text>
                    <View style={[styles.menuContainer, { backgroundColor: colors.card }]}>
                        {menuItems.slice(0, 3).map(renderMenuItem)}
                    </View>
                </View>

                <View style={styles.section}>
                    <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>Preferences</Text>
                    <View style={[styles.menuContainer, { backgroundColor: colors.card }]}>
                        {menuItems.slice(3).map(renderMenuItem)}
                    </View>
                </View>

                <TouchableOpacity style={[styles.logoutButton, { backgroundColor: isDark ? '#7F1D1D' : '#FEE2E2' }]} onPress={handleLogout}>
                    <Text style={[styles.logoutText, { color: isDark ? '#FCA5A5' : '#EF4444' }]}>Log Out</Text>
                </TouchableOpacity>

                <Text style={[styles.version, { color: colors.textLight }]}>App Version 1.0.0</Text>
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
});

export default ProfileScreen;
