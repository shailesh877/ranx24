import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    Image,
    StatusBar,
    Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useCart } from '../../context/CartContext';
import { useTheme } from '../../context/ThemeContext';
import { SIZES, SPACING, SHADOWS } from '../../constants/theme';
import api, { API_URL } from '../../services/api';

const CartScreen = ({ navigation }) => {
    const { colors, isDark } = useTheme();
    const { cartItems, removeFromCart, loading } = useCart();

    const calculateSubtotal = () => {
        return cartItems.reduce((sum, item) => sum + (item.price * (item.days || 1)), 0);
    };

    const calculateTax = () => {
        return 0; // For now, 0 tax
    };

    const calculateTotal = () => {
        return calculateSubtotal() + calculateTax();
    };

    const handleRemove = (id) => {
        Alert.alert(
            "Remove Item",
            "Are you sure you want to remove this service?",
            [
                { text: "Cancel", style: "cancel" },
                { text: "Remove", style: "destructive", onPress: () => removeFromCart(id) }
            ]
        );
    };

    const renderCartItem = ({ item }) => (
        <View style={[styles.cartItem, { backgroundColor: colors.card }]}>
            <Image
                source={{
                    uri: item.worker?.profileImage
                        ? `${API_URL.replace('/api', '')}/${item.worker.profileImage}`
                        : "https://cdn-icons-png.flaticon.com/512/4333/4333609.png"
                }}
                style={[styles.itemImage, { backgroundColor: isDark ? '#374151' : '#F3F4F6' }]}
            />
            <View style={styles.itemInfo}>
                <View style={styles.itemHeader}>
                    <TouchableOpacity onPress={() => navigation.navigate('WorkerProfile', { workerId: item.worker?._id || item.worker })}>
                        <Text style={[styles.workerName, { color: colors.textSecondary }]}>
                            {item.worker?.firstName} {item.worker?.lastName}
                        </Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => handleRemove(item._id)}>
                        <Ionicons name="trash-outline" size={20} color={colors.error} />
                    </TouchableOpacity>
                </View>

                <Text style={[styles.serviceName, { color: colors.text }]}>{item.service}</Text>
                <View style={styles.itemDetails}>
                    <View style={[styles.detailBadge, { backgroundColor: isDark ? '#374151' : '#F3F4F6' }]}>
                        <Ionicons name="calendar-outline" size={12} color={colors.textSecondary} />
                        <Text style={[styles.detailText, { color: colors.textSecondary }]}>{item.days} Day{item.days > 1 ? 's' : ''}</Text>
                    </View>
                    <View style={[styles.detailBadge, { backgroundColor: isDark ? '#374151' : '#F3F4F6' }]}>
                        <Ionicons name="time-outline" size={12} color={colors.textSecondary} />
                        <Text style={[styles.detailText, { color: colors.textSecondary }]}>{item.bookingType === 'full-day' ? 'Full Day' : 'Half Day'}</Text>
                    </View>
                </View>
                <View style={styles.priceRow}>
                    <Text style={[styles.priceLabel, { color: colors.textLight }]}>₹{item.price} x {item.days}</Text>
                    <Text style={[styles.itemTotal, { color: colors.primary }]}>₹{item.price * (item.days || 1)}</Text>
                </View>
            </View>
        </View>
    );

    if (cartItems.length === 0) {
        return (
            <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
                <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} backgroundColor={colors.background} />
                <View style={[styles.header, { backgroundColor: colors.background }]}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                        <Ionicons name="arrow-back" size={24} color={colors.text} />
                    </TouchableOpacity>
                    <Text style={[styles.headerTitle, { color: colors.text }]}>My Cart</Text>
                    <View style={{ width: 40 }} />
                </View>
                <View style={styles.emptyContainer}>
                    <Image
                        source={{ uri: "https://cdn-icons-png.flaticon.com/512/11329/11329060.png" }}
                        style={[styles.emptyImage, { opacity: isDark ? 0.6 : 0.8 }]}
                    />
                    <Text style={[styles.emptyTitle, { color: colors.text }]}>Your Cart is Empty</Text>
                    <Text style={[styles.emptyText, { color: colors.textSecondary }]}>Looks like you haven't added any services yet.</Text>
                    <TouchableOpacity
                        style={[styles.browseButton, { backgroundColor: colors.primary }]}
                        onPress={() => navigation.navigate('Main', { screen: 'Home' })}
                    >
                        <Text style={[styles.browseButtonText, { color: '#000000' }]}>Explore Services</Text>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
            <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} backgroundColor={colors.background} />

            <View style={[styles.header, { backgroundColor: colors.background }]}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                    <Ionicons name="arrow-back" size={24} color={colors.text} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: colors.text }]}>My Cart</Text>
                <View style={{ width: 40 }} />
            </View>

            <FlatList
                data={cartItems}
                renderItem={renderCartItem}
                keyExtractor={(item) => item._id}
                contentContainerStyle={styles.listContent}
                showsVerticalScrollIndicator={false}
            />

            <View style={[styles.footer, { backgroundColor: colors.card, borderTopColor: colors.border }]}>
                <View style={[styles.billCard, { backgroundColor: isDark ? '#374151' : '#F3F4F6' }]}>
                    <Text style={[styles.billTitle, { color: colors.text }]}>Bill Details</Text>
                    <View style={styles.billRow}>
                        <Text style={[styles.billLabel, { color: colors.textSecondary }]}>Item Total</Text>
                        <Text style={[styles.billValue, { color: colors.text }]}>₹{calculateSubtotal()}</Text>
                    </View>
                    <View style={styles.billRow}>
                        <Text style={[styles.billLabel, { color: colors.textSecondary }]}>Taxes & Fees</Text>
                        <Text style={[styles.billValue, { color: colors.text }]}>₹{calculateTax()}</Text>
                    </View>
                    <View style={[styles.divider, { backgroundColor: colors.border }]} />
                    <View style={styles.billRow}>
                        <Text style={[styles.totalLabel, { color: colors.text }]}>To Pay</Text>
                        <Text style={[styles.totalValue, { color: colors.text }]}>₹{calculateTotal()}</Text>
                    </View>
                </View>

                <TouchableOpacity
                    style={[styles.checkoutButton, { backgroundColor: colors.primary }]}
                    onPress={() => navigation.navigate('Checkout')}
                >
                    <Text style={[styles.checkoutButtonText, { color: '#000000' }]}>Proceed to Checkout</Text>
                    <Ionicons name="arrow-forward" size={20} color="#000000" />
                </TouchableOpacity>
            </View>
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
        paddingVertical: SPACING.s,
    },
    backBtn: {
        padding: 8,
    },
    headerTitle: {
        fontSize: SIZES.h3,
        fontWeight: 'bold',
    },
    listContent: {
        padding: SPACING.m,
        paddingBottom: 200,
    },
    cartItem: {
        flexDirection: 'row',
        padding: SPACING.m,
        borderRadius: 16,
        marginBottom: SPACING.m,
        ...SHADOWS.light,
    },
    itemImage: {
        width: 70,
        height: 70,
        borderRadius: 12,
    },
    itemInfo: {
        flex: 1,
        marginLeft: SPACING.m,
    },
    itemHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 4,
    },
    serviceName: {
        fontSize: 16,
        fontWeight: 'bold',
        flex: 1,
        marginRight: 8,
    },
    workerName: {
        fontSize: 12,
        marginBottom: 8,
    },
    itemDetails: {
        flexDirection: 'row',
        gap: 8,
        marginBottom: 8,
    },
    detailBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 6,
        gap: 4,
    },
    detailText: {
        fontSize: 10,
        fontWeight: '500',
    },
    priceRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 4,
    },
    priceLabel: {
        fontSize: 12,
    },
    itemTotal: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: SPACING.xl,
    },
    emptyImage: {
        width: 150,
        height: 150,
        marginBottom: SPACING.l,
    },
    emptyTitle: {
        fontSize: SIZES.h2,
        fontWeight: 'bold',
        marginBottom: 8,
    },
    emptyText: {
        fontSize: 14,
        textAlign: 'center',
        marginBottom: SPACING.xl,
    },
    browseButton: {
        paddingHorizontal: SPACING.xl,
        paddingVertical: 12,
        borderRadius: 12,
        ...SHADOWS.medium,
    },
    browseButtonText: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    footer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        padding: SPACING.m,
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        ...SHADOWS.dark,
    },
    billCard: {
        padding: SPACING.m,
        borderRadius: 16,
        marginBottom: SPACING.m,
    },
    billTitle: {
        fontSize: 14,
        fontWeight: 'bold',
        marginBottom: SPACING.m,
    },
    billRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 8,
    },
    billLabel: {
        fontSize: 14,
    },
    billValue: {
        fontSize: 14,
        fontWeight: '600',
    },
    divider: {
        height: 1,
        marginVertical: 8,
    },
    totalLabel: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    totalValue: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    checkoutButton: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 16,
        borderRadius: 16,
        gap: 8,
        ...SHADOWS.medium,
    },
    checkoutButtonText: {
        fontSize: 16,
        fontWeight: 'bold',
    },
});

export default CartScreen;
