import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    ActivityIndicator,
    Alert,
    RefreshControl,
    TextInput,
    Modal,
    StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import api from '../../services/api';
import Toast from 'react-native-toast-message';
import { theme } from '../../theme/theme';

interface Transaction {
    _id: string;
    type: 'credit' | 'debit' | 'payout';
    amount: number;
    description: string;
    createdAt: string;
}

interface Wallet {
    balance: number;
    transactions: Transaction[];
}

const WalletScreen = () => {
    const navigation = useNavigation();
    const [wallet, setWallet] = useState<Wallet | null>(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [payoutModalVisible, setPayoutModalVisible] = useState(false);
    const [payoutAmount, setPayoutAmount] = useState('');

    const fetchWallet = async () => {
        try {
            const response = await api.get('/worker-wallet');
            setWallet(response.data);
        } catch (error) {
            console.error('Error fetching wallet:', error);
            Toast.show({
                type: 'error',
                text1: 'Error',
                text2: 'Failed to load wallet details',
            });
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchWallet();
    }, []);

    const onRefresh = () => {
        setRefreshing(true);
        fetchWallet();
    };

    const handlePayout = async () => {
        if (!payoutAmount || isNaN(Number(payoutAmount)) || Number(payoutAmount) <= 0) {
            Alert.alert('Invalid Amount', 'Please enter a valid amount');
            return;
        }

        if (wallet && Number(payoutAmount) > wallet.balance) {
            Alert.alert('Insufficient Balance', 'You cannot withdraw more than your current balance');
            return;
        }

        try {
            await api.post('/worker-wallet/payout', { amount: Number(payoutAmount) });
            Toast.show({
                type: 'success',
                text1: 'Success',
                text2: 'Payout request submitted successfully',
            });
            setPayoutModalVisible(false);
            setPayoutAmount('');
            fetchWallet();
        } catch (error: any) {
            console.error('Payout error:', error);
            Toast.show({
                type: 'error',
                text1: 'Error',
                text2: error.response?.data?.message || 'Failed to request payout',
            });
        }
    };

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={theme.colors.primary} />
            </View>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor={theme.colors.background} />

            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color={theme.colors.text.primary} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>My Wallet</Text>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView
                contentContainerStyle={styles.content}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[theme.colors.primary]} />}
            >
                {/* Balance Card */}
                <View style={styles.balanceCard}>
                    <View style={styles.balanceInfo}>
                        <Text style={styles.balanceLabel}>Available Balance</Text>
                        <Text style={styles.balanceValue}>₹{wallet?.balance.toLocaleString() || '0'}</Text>
                    </View>
                    <TouchableOpacity
                        style={styles.withdrawButton}
                        onPress={() => setPayoutModalVisible(true)}
                    >
                        <Text style={styles.withdrawButtonText}>Withdraw</Text>
                        <Ionicons name="arrow-forward" size={16} color={theme.colors.primary} />
                    </TouchableOpacity>

                    {/* Decorative Circles */}
                    <View style={styles.circle1} />
                    <View style={styles.circle2} />
                </View>

                {/* View Analytics Button */}
                <TouchableOpacity
                    style={styles.analyticsButton}
                    onPress={() => (navigation as any).navigate('EarningsAnalytics')}
                >
                    <View style={styles.analyticsIconBox}>
                        <Ionicons name="bar-chart" size={24} color={theme.colors.primary} />
                    </View>
                    <View style={{ flex: 1 }}>
                        <Text style={styles.analyticsTitle}>Earnings Analytics</Text>
                        <Text style={styles.analyticsSubtitle}>View detailed earnings and incentives</Text>
                    </View>
                    <Ionicons name="chevron-forward" size={20} color={theme.colors.text.tertiary} />
                </TouchableOpacity>

                {/* Transaction History */}
                <Text style={styles.sectionTitle}>Transaction History</Text>
                {wallet?.transactions && wallet.transactions.length > 0 ? (
                    wallet.transactions.slice().reverse().map((transaction) => (
                        <View key={transaction._id} style={styles.transactionItem}>
                            <View style={[
                                styles.transactionIcon,
                                { backgroundColor: transaction.type === 'credit' ? '#ECFDF5' : '#FEF2F2' }
                            ]}>
                                <Ionicons
                                    name={transaction.type === 'credit' ? 'arrow-down' : 'arrow-up'}
                                    size={20}
                                    color={transaction.type === 'credit' ? theme.colors.success : theme.colors.error}
                                />
                            </View>
                            <View style={styles.transactionDetails}>
                                <Text style={styles.transactionNote}>{transaction.description}</Text>
                                <Text style={styles.transactionDate}>
                                    {new Date(transaction.createdAt).toLocaleDateString()} • {new Date(transaction.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </Text>
                            </View>
                            <Text
                                style={[
                                    styles.transactionAmount,
                                    { color: transaction.type === 'credit' ? theme.colors.success : theme.colors.error }
                                ]}
                            >
                                {transaction.type === 'credit' ? '+' : '-'}₹{Math.abs(transaction.amount)}
                            </Text>
                        </View>
                    ))
                ) : (
                    <View style={styles.emptyState}>
                        <Ionicons name="receipt-outline" size={48} color={theme.colors.text.tertiary} />
                        <Text style={styles.emptyText}>No transactions yet</Text>
                    </View>
                )}
            </ScrollView>

            {/* Payout Modal */}
            <Modal
                visible={payoutModalVisible}
                transparent={true}
                animationType="fade"
                onRequestClose={() => setPayoutModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Request Payout</Text>
                        <Text style={styles.modalSubtitle}>Enter amount to withdraw</Text>

                        <TextInput
                            style={styles.input}
                            placeholder="Amount (₹)"
                            placeholderTextColor={theme.colors.text.tertiary}
                            keyboardType="numeric"
                            value={payoutAmount}
                            onChangeText={setPayoutAmount}
                            autoFocus
                        />
                        <Text style={styles.deductionNotice}>
                            Note: 25% deduct hoke apne account me aayega
                        </Text>

                        <View style={styles.modalButtons}>
                            <TouchableOpacity
                                style={[styles.modalButton, styles.cancelButton]}
                                onPress={() => setPayoutModalVisible(false)}
                            >
                                <Text style={styles.cancelButtonText}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.modalButton, styles.confirmButton]}
                                onPress={handlePayout}
                            >
                                <Text style={styles.confirmButtonText}>Confirm</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.colors.background,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: theme.colors.background,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: theme.spacing.l,
        paddingVertical: theme.spacing.m,
        backgroundColor: theme.colors.background,
    },
    backButton: {
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 12,
        backgroundColor: theme.colors.surface,
        borderWidth: 1,
        borderColor: theme.colors.border,
    },
    headerTitle: {
        ...theme.typography.h2,
        color: theme.colors.text.primary,
    },
    content: {
        padding: theme.spacing.m,
    },
    balanceCard: {
        backgroundColor: theme.colors.primary,
        borderRadius: theme.borderRadius.xl,
        padding: theme.spacing.l,
        marginBottom: theme.spacing.xl,
        overflow: 'hidden',
        position: 'relative',
        ...theme.shadows.primary,
    },
    balanceInfo: {
        marginBottom: theme.spacing.l,
        zIndex: 1,
    },
    balanceLabel: {
        fontSize: 14,
        color: 'rgba(255, 255, 255, 0.9)',
        marginBottom: 8,
        fontWeight: '500',
    },
    balanceValue: {
        fontSize: 40,
        fontWeight: '800',
        color: 'white',
        letterSpacing: -1,
    },
    withdrawButton: {
        backgroundColor: 'white',
        paddingHorizontal: theme.spacing.l,
        paddingVertical: 12,
        borderRadius: theme.borderRadius.l,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        alignSelf: 'flex-start',
        zIndex: 1,
    },
    withdrawButtonText: {
        color: theme.colors.primary,
        fontWeight: '700',
        fontSize: 16,
    },
    circle1: {
        position: 'absolute',
        top: -30,
        right: -30,
        width: 150,
        height: 150,
        borderRadius: 75,
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
    },
    circle2: {
        position: 'absolute',
        bottom: -50,
        left: -20,
        width: 180,
        height: 180,
        borderRadius: 90,
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
    },
    sectionTitle: {
        ...theme.typography.h3,
        color: theme.colors.text.primary,
        marginBottom: theme.spacing.m,
    },
    transactionItem: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: theme.colors.surface,
        padding: theme.spacing.m,
        borderRadius: theme.borderRadius.l,
        marginBottom: theme.spacing.s,
        borderWidth: 1,
        borderColor: theme.colors.border,
        ...theme.shadows.small,
    },
    transactionIcon: {
        width: 44,
        height: 44,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: theme.spacing.m,
    },
    transactionDetails: {
        flex: 1,
    },
    transactionNote: {
        fontSize: 16,
        fontWeight: '600',
        color: theme.colors.text.primary,
        marginBottom: 4,
    },
    transactionDate: {
        fontSize: 12,
        color: theme.colors.text.tertiary,
        fontWeight: '500',
    },
    transactionAmount: {
        fontSize: 16,
        fontWeight: '700',
    },
    emptyState: {
        alignItems: 'center',
        padding: theme.spacing.xl,
        marginTop: theme.spacing.l,
    },
    emptyText: {
        textAlign: 'center',
        color: theme.colors.text.tertiary,
        marginTop: theme.spacing.m,
        fontSize: 16,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(15, 23, 42, 0.6)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContent: {
        backgroundColor: theme.colors.surface,
        width: '85%',
        borderRadius: theme.borderRadius.xl,
        padding: theme.spacing.xl,
        alignItems: 'center',
        ...theme.shadows.large,
    },
    modalTitle: {
        ...theme.typography.h2,
        color: theme.colors.text.primary,
        marginBottom: 8,
    },
    modalSubtitle: {
        fontSize: 14,
        color: theme.colors.text.secondary,
        marginBottom: theme.spacing.l,
    },
    input: {
        width: '100%',
        borderWidth: 1,
        borderColor: theme.colors.border,
        borderRadius: theme.borderRadius.m,
        padding: theme.spacing.m,
        fontSize: 18,
        marginBottom: theme.spacing.l,
        color: theme.colors.text.primary,
        backgroundColor: theme.colors.background,
    },
    modalButtons: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
        gap: theme.spacing.m,
    },
    modalButton: {
        flex: 1,
        paddingVertical: 14,
        borderRadius: theme.borderRadius.m,
        alignItems: 'center',
    },
    cancelButton: {
        backgroundColor: theme.colors.background,
        borderWidth: 1,
        borderColor: theme.colors.border,
    },
    confirmButton: {
        backgroundColor: theme.colors.primary,
    },
    cancelButtonText: {
        color: theme.colors.text.secondary,
        fontWeight: '600',
        fontSize: 16,
    },
    confirmButtonText: {
        color: 'white',
        fontWeight: '700',
        fontSize: 16,
    },
    analyticsButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: theme.spacing.m,
        backgroundColor: theme.colors.surface,
        borderRadius: theme.borderRadius.l,
        padding: theme.spacing.m,
        marginBottom: theme.spacing.l,
        borderWidth: 1,
        borderColor: theme.colors.border,
        ...theme.shadows.small,
    },
    analyticsIconBox: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: '#EFF6FF',
        justifyContent: 'center',
        alignItems: 'center',
    },
    analyticsTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: theme.colors.text.primary,
        marginBottom: 2,
    },
    analyticsSubtitle: {
        fontSize: 13,
        color: theme.colors.text.secondary,
    },
    deductionNotice: {
        fontSize: 12,
        color: theme.colors.error, // or theme.colors.text.tertiary
        marginBottom: theme.spacing.m,
        textAlign: 'center',
        marginTop: -8
    }
});

export default WalletScreen;
