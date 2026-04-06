import React, { useState, useCallback, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    TextInput,
    ActivityIndicator,
    Alert,
    Switch,
    Image,
    StatusBar
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import Toast from 'react-native-toast-message';
import * as Location from 'expo-location';
import RazorpayCheckout from 'react-native-razorpay';
import api from '../../services/api';
import { useCart } from '../../context/CartContext';
import { useTheme } from '../../context/ThemeContext';
import { SHADOWS } from '../../constants/theme';
import { getRazorpayKey } from '../../services/razorpayService';

const CheckoutScreen = ({ navigation, route }: any) => {
    const { colors, isDark } = useTheme();
    const { cartItems, clearCart } = useCart();
    const { directBooking } = route.params || {};

    // Use either direct booking or cart items
    const bookingItems = directBooking ? [directBooking] : (cartItems || []);

    // Address State
    const [street, setStreet] = useState('');
    const [city, setCity] = useState('');
    const [state, setState] = useState('');
    const [zipCode, setZipCode] = useState('');
    const [phone, setPhone] = useState('');
    const [notes, setNotes] = useState('');

    // Coupon State
    const [couponCode, setCouponCode] = useState('');
    const [couponDiscount, setCouponDiscount] = useState(0);
    const [couponId, setCouponId] = useState(null);
    const [couponLoading, setCouponLoading] = useState(false);

    // Payment State
    const [paymentMethod, setPaymentMethod] = useState<'online'>('online');
    const [loading, setLoading] = useState(false);
    const [locationLoading, setLocationLoading] = useState(false);

    // Wallet & Coins State
    const [walletBalance, setWalletBalance] = useState(0);
    const [ycCoins, setYcCoins] = useState(0);
    const [coinConfig, setCoinConfig] = useState<any>(null);

    // Fee State
    const [feeConfig, setFeeConfig] = useState<any>(null);
    const [platformFee, setPlatformFee] = useState(0);
    const [percentageFee, setPercentageFee] = useState(0);
    const [distance, setDistance] = useState(0);

    const [useWallet, setUseWallet] = useState(false);
    const [useCoins, setUseCoins] = useState(false);

    // Membership State
    const [activeMembership, setActiveMembership] = useState<any>(null);
    const [membershipDiscount, setMembershipDiscount] = useState(0);

    const fetchActiveMembership = async () => {
        try {
            const response = await api.get('/membership-plans/my-membership');
            if (response.data.success) {
                setActiveMembership(response.data.data);
            }
        } catch (error) {
            console.error('Error fetching active membership:', error);
        }
    };

    const fetchFeeConfig = async () => {
        try {
            const response = await api.get('/admin/fees');
            setFeeConfig(response.data);
            if (response.data.isActive) {
                setPlatformFee(response.data.platformFee || 0);
            }
        } catch (error) {
            console.error('Error fetching fee config:', error);
            // Set fallback config - no fees if can't load
            setFeeConfig({ platformFee: 0, percentageCharge: 0, isActive: false });
            setPlatformFee(0);
            setPercentageFee(0);
        }
    };

    const fetchUserProfile = async () => {
        try {
            const userStr = await import('@react-native-async-storage/async-storage').then(m => m.default.getItem('user'));
            if (userStr) {
                const user = JSON.parse(userStr);
                if (user.phone) setPhone(user.phone);
                if (user.address && typeof user.address === 'object') {
                    setStreet(user.address.street || '');
                    setCity(user.address.city || '');
                    setState(user.address.state || '');
                    setZipCode(user.address.zipCode || '');
                }
            }
        } catch (error) {
            console.error('Error fetching user profile:', error);
        }
    };

    const fetchWalletData = async () => {
        try {
            const [walletRes, configRes] = await Promise.all([
                api.get('/wallet/'),
                api.get('/coins/config')
            ]);

            setWalletBalance(walletRes.data.balance || 0);
            setYcCoins(walletRes.data.ycCoins || 0);
            setCoinConfig(configRes.data);
        } catch (error) {
            console.error('Error fetching wallet data:', error);
            setCoinConfig({ coinToRupeeRate: 1, maxUsagePercentage: 50 });
        }
    };

    useFocusEffect(
        useCallback(() => {
            fetchUserProfile();
            fetchWalletData();
            fetchFeeConfig();
            fetchActiveMembership();
        }, [])
    );



    // Calculate fees and membership discount when items change
    useEffect(() => {
        calculatePercentageFee();
        calculateMembershipDiscount();
    }, [feeConfig, bookingItems, activeMembership]);

    const calculateMembershipDiscount = () => {
        if (!activeMembership || !activeMembership.plan_id) {
            setMembershipDiscount(0);
            return;
        }

        const itemsTotal = bookingItems.reduce((sum: number, item: any) => sum + (item.price * (item.days || 1)), 0);
        const tiers = activeMembership.plan_id.discount_tiers || [];
        
        // Find the best tier applicable for this amount
        let applicablePercentage = 0;
        tiers.forEach((tier: any) => {
            const minAmount = parseFloat(tier.min_amount || 0);
            const discountPercent = parseFloat(tier.discount_percentage || 0);
            if (itemsTotal >= minAmount && discountPercent > applicablePercentage) {
                applicablePercentage = discountPercent;
            }
        });

        if (applicablePercentage > 0) {
            const discount = Math.round((itemsTotal * applicablePercentage) / 100);
            setMembershipDiscount(discount);
        } else {
            setMembershipDiscount(0);
        }
    };

    const calculatePercentageFee = () => {
        if (!feeConfig?.isActive || !feeConfig?.percentageCharge) {
            setPercentageFee(0);
            return;
        }

        const itemsTotal = bookingItems.reduce((sum: number, item: any) => sum + (item.price * (item.days || 1)), 0);
        const fee = Math.round((itemsTotal * feeConfig.percentageCharge) / 100);
        setPercentageFee(fee);
    };

    const getDistanceFromLatLonInKm = (lat1: number, lon1: number, lat2: number, lon2: number) => {
        var R = 6371; // Radius of the earth in km
        var dLat = deg2rad(lat2 - lat1);  // deg2rad below
        var dLon = deg2rad(lon2 - lon1);
        var a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2)
            ;
        var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        var d = R * c; // Distance in km
        return d;
    }

    const deg2rad = (deg: number) => {
        return deg * (Math.PI / 180)
    }

    const handleUseCurrentLocation = async () => {
        setLocationLoading(true);
        try {
            let { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
                Alert.alert('Permission to access location was denied');
                return;
            }

            let location = await Location.getCurrentPositionAsync({});
            let addressResponse = await Location.reverseGeocodeAsync({
                latitude: location.coords.latitude,
                longitude: location.coords.longitude,
            });

            if (addressResponse.length > 0) {
                const addr = addressResponse[0];
                setStreet(`${addr.name || ''} ${addr.street || ''}`.trim());
                setCity(addr.city || '');
                setState(addr.region || '');
                setZipCode(addr.postalCode || '');
                Toast.show({ type: 'success', text1: 'Location Found' });
            }
        } catch (error) {
            console.error('Error getting location:', error);
            Toast.show({ type: 'error', text1: 'Location Error' });
        } finally {
            setLocationLoading(false);
        }
    };

    const handleApplyCoupon = async () => {
        if (!couponCode.trim()) {
            Toast.show({ type: 'error', text1: 'Please enter a coupon code' });
            return;
        }

        setCouponLoading(true);
        try {
            const response = await api.post('/coupons/validate', {
                code: couponCode,
                orderAmount: subtotal
            });

            if (response.data.valid) {
                setCouponDiscount(response.data.discountAmount);
                setCouponId(response.data.coupon._id);
                Toast.show({
                    type: 'success',
                    text1: 'Coupon Applied!',
                    text2: `You saved ₹${response.data.discountAmount}`
                });
            } else {
                setCouponDiscount(0);
                setCouponId(null);
                Toast.show({ type: 'error', text1: 'Invalid Coupon', text2: response.data.message });
            }
        } catch (error: any) {
            console.error('Coupon error:', error);
            setCouponDiscount(0);
            setCouponId(null);
            Toast.show({
                type: 'error',
                text1: 'Coupon Failed',
                text2: error.response?.data?.message || 'Could not validate coupon'
            });
        } finally {
            setCouponLoading(false);
        }
    };

    const handleRemoveCoupon = () => {
        setCouponCode('');
        setCouponDiscount(0);
        setCouponId(null);
    };

    // Calculations
    const subtotal = bookingItems.reduce((sum: number, item: any) => sum + (item.price * (item.days || 1)), 0);

    // Coin Calculation
    const coinRate = coinConfig?.coinToRupeeRate || 1;
    const maxCoinPercent = coinConfig?.maxUsagePercentage || 50;

    // Calculate max discount after membership and coupon
    const priceAfterMembership = Math.max(0, subtotal - membershipDiscount);
    const priceAfterCoupon = Math.max(0, priceAfterMembership - couponDiscount);
    const maxCoinDiscount = Math.floor((priceAfterCoupon * maxCoinPercent) / 100);
    const maxCoinsAllowed = Math.floor(maxCoinDiscount / coinRate);
    const coinsToUse = useCoins ? Math.min(ycCoins, maxCoinsAllowed) : 0;
    const coinDiscount = coinsToUse * coinRate;

    // GST Calculation
    const subtotalAfterDiscounts = priceAfterCoupon - coinDiscount + platformFee + percentageFee;
    const gstAmount = Math.round(Math.max(0, subtotalAfterDiscounts) * 0.18);

    // Total Calculation
    const totalToPay = subtotalAfterDiscounts + gstAmount;
    const advanceRequired = Math.ceil(totalToPay * 0.15);
    const remainingBalance = totalToPay - advanceRequired;

    // How much of the advance is covered by wallet?
    const walletAmountToUse = useWallet ? Math.min(walletBalance, advanceRequired) : 0;
    const finalPayable = Math.max(0, advanceRequired - walletAmountToUse);

    const handlePlaceOrder = async () => {
        if (!street || !city || !state || !zipCode || !phone) {
            Toast.show({
                type: 'error',
                text1: 'Missing Information',
                text2: 'Please provide complete address and phone number',
            });
            return;
        }

        setLoading(true);

        // Construct Payload
        const bookings = bookingItems.map((item: any) => {
            // Use provided date or default to tomorrow
            const dateStr = item.startDate || item.bookingDate || new Date(Date.now() + 86400000).toISOString();
            const startDate = new Date(dateStr);
            const endDate = new Date(startDate);
            endDate.setDate(startDate.getDate() + ((item.days || 1) - 1)); // -1 because start date is day 1

            return {
                workerId: item.worker?._id || item.workerId || undefined,
                serviceId: item.serviceId,
                category: item.category,
                service: item.service,
                description: '',
                price: item.price,
                bookingDate: startDate.toISOString(),
                bookingTime: item.bookingTime || "09:00 AM",
                bookingType: item.bookingType || 'full-day',
                days: item.days || 1,
                startDate: startDate.toISOString(),
                endDate: endDate.toISOString()
            };
        });

        const bookingPayload = {
            bookings,
            address: { street, city, state, zipCode },
            phone,
            notes,
            paymentStatus: (walletAmountToUse >= advanceRequired && advanceRequired > 0) ? 'partial' : 'pending',
            coinsUsed: coinsToUse,
            walletAmountUsed: walletAmountToUse,
            couponCode: couponId ? couponCode : undefined,
            paymentId: undefined,
            platformFee,
            percentageFee,
            gstAmount,
            isAdvancePayment: true,
            advanceAmount: walletAmountToUse + (finalPayable === 0 ? 0 : 0) // Will be updated after payment
        };

        if (finalPayable === 0 && walletAmountToUse >= advanceRequired) {
            // Fully paid advance via wallet
            await placeBooking({
                ...bookingPayload,
                amountPaid: walletAmountToUse
            });
            return;
        }

        try {
            if (finalPayable > 0 && paymentMethod === 'online') {
                await handleOnlinePayment(bookingPayload, finalPayable);
            } else {
                await placeBooking(bookingPayload);
            }
        } catch (error) {
            console.error('Order placement error:', error);
            setLoading(false);
        }
    };

    const handleOnlinePayment = async (bookingPayload: any, amount: number) => {
        try {
            // Fetch Razorpay key from backend
            const razorpayKey = await getRazorpayKey();

            const orderResponse = await api.post('/payment/order', { amount });
            const { id: order_id, currency, amount: razorpayAmount } = orderResponse.data;

            const options = {
                description: 'Service Booking',
                image: 'https://cdn-icons-png.flaticon.com/512/12145/12145443.png',
                currency: currency,
                key: razorpayKey,
                amount: razorpayAmount,
                name: 'RanX24',
                order_id: order_id,
                prefill: { contact: phone, email: 'user@example.com' },
                theme: { color: colors.primary }
            };

            RazorpayCheckout.open(options).then(async (data: any) => {
                const verifyResponse = await api.post('/payment/verify', {
                    razorpay_order_id: data.razorpay_order_id,
                    razorpay_payment_id: data.razorpay_payment_id,
                    razorpay_signature: data.razorpay_signature
                });

                if (verifyResponse.data.success) {
                    await placeBooking({
                        ...bookingPayload,
                        paymentStatus: 'partial',
                        paymentId: data.razorpay_payment_id,
                        amountPaid: walletAmountToUse + finalPayable
                    });
                } else {
                    Toast.show({ type: 'error', text1: 'Payment Verification Failed' });
                    setLoading(false);
                }
            }).catch((error: any) => {
                console.log('Payment Error:', error);
                Toast.show({ type: 'error', text1: 'Payment Cancelled/Failed' });
                setLoading(false);
            });
        } catch (error) {
            console.error('Online payment init error:', error);
            Toast.show({ type: 'error', text1: 'Failed to initiate payment' });
            setLoading(false);
        }
    };

    const placeBooking = async (payload: any) => {
        console.log('🚀 Booking Payload:', JSON.stringify(payload, null, 2));
        try {
            const response = await api.post('/bookings/bulk', payload);

            if (!directBooking) {
                await clearCart();
            }

            // Navigate to Success Screen with booking ID (from first booking)
            const bookingId = response.data[0]?._id;
            navigation.replace('OrderSuccess', { bookingId });
        } catch (error: any) {
            console.error('❌ Error placing order:', error);
            console.error('❌ Server Error Message:', error.response?.data);
            Toast.show({
                type: 'error',
                text1: 'Booking Failed',
                text2: error.response?.data?.message || 'Please try again',
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
            <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} backgroundColor={colors.background} />
            <View style={[styles.header, { backgroundColor: colors.background, borderBottomColor: colors.border }]}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                    <Ionicons name="arrow-back" size={24} color={colors.text} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: colors.text }]}>Checkout</Text>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                {/* Items */}
                <View style={[styles.section, { backgroundColor: colors.card }]}>
                    <Text style={[styles.sectionTitle, { color: colors.text }]}>Order Summary</Text>
                    {bookingItems.map((item: any, index: number) => (
                        <View key={index} style={[styles.itemCard, { borderBottomColor: colors.border }]}>
                            <View style={[styles.itemIcon, { backgroundColor: isDark ? '#374151' : '#EFF6FF' }]}>
                                <Ionicons name="briefcase" size={20} color={colors.primary} />
                            </View>
                            <View style={styles.itemInfo}>
                                <Text style={[styles.itemService, { color: colors.text }]}>{item.service}</Text>
                                {item.worker || item.workerName ? (
                                    <TouchableOpacity onPress={() => item.workerId && navigation.navigate('WorkerProfile', { workerId: item.worker?._id || item.workerId })}>
                                        <Text style={[styles.itemWorker, { color: colors.textSecondary }]}>
                                            {item.worker?.firstName || item.workerName} {item.worker?.lastName || ''}
                                        </Text>
                                    </TouchableOpacity>
                                ) : (
                                    <Text style={[styles.itemWorker, { color: colors.textSecondary, fontStyle: 'italic' }]}>
                                        Professional will be assigned later
                                    </Text>
                                )}
                                <Text style={[styles.itemMeta, { color: colors.textLight }]}>
                                    {item.bookingType} • {item.days} day(s)
                                </Text>
                            </View>
                            <Text style={[styles.itemPrice, { color: colors.primary }]}>₹{item.price * (item.days || 1)}</Text>
                        </View>
                    ))}
                </View>

                {/* Address */}
                <View style={[styles.section, { backgroundColor: colors.card }]}>
                    <View style={styles.sectionHeader}>
                        <Text style={[styles.sectionTitle, { color: colors.text }]}>Service Address</Text>
                        <TouchableOpacity onPress={handleUseCurrentLocation} style={styles.locationBtn}>
                            {locationLoading ? (
                                <ActivityIndicator size="small" color={colors.primary} />
                            ) : (
                                <>
                                    <Ionicons name="locate" size={16} color={colors.primary} />
                                    <Text style={[styles.locationBtnText, { color: colors.primary }]}>Use Current</Text>
                                </>
                            )}
                        </TouchableOpacity>
                    </View>
                    <TextInput
                        style={[styles.input, { backgroundColor: isDark ? '#374151' : '#F8FAFC', borderColor: colors.border, color: colors.text }]}
                        placeholder="Street Address / Landmark"
                        placeholderTextColor={colors.textLight}
                        value={street}
                        onChangeText={setStreet}
                    />
                    <View style={styles.row}>
                        <TextInput style={[styles.input, { flex: 1, backgroundColor: isDark ? '#374151' : '#F8FAFC', borderColor: colors.border, color: colors.text }]} placeholder="City" placeholderTextColor={colors.textLight} value={city} onChangeText={setCity} />
                        <TextInput style={[styles.input, { flex: 1, backgroundColor: isDark ? '#374151' : '#F8FAFC', borderColor: colors.border, color: colors.text }]} placeholder="State" placeholderTextColor={colors.textLight} value={state} onChangeText={setState} />
                    </View>
                    <TextInput style={[styles.input, { backgroundColor: isDark ? '#374151' : '#F8FAFC', borderColor: colors.border, color: colors.text }]} placeholder="Zip Code" placeholderTextColor={colors.textLight} value={zipCode} onChangeText={setZipCode} keyboardType="numeric" />
                    <TextInput style={[styles.input, { backgroundColor: isDark ? '#374151' : '#F8FAFC', borderColor: colors.border, color: colors.text }]} placeholder="Phone Number" placeholderTextColor={colors.textLight} value={phone} onChangeText={setPhone} keyboardType="phone-pad" />
                </View>

                {/* Coupon Section */}
                <View style={[styles.section, { backgroundColor: colors.card }]}>
                    <Text style={[styles.sectionTitle, { color: colors.text }]}>Offers & Coupons</Text>
                    <View style={styles.couponContainer}>
                        <View style={[styles.couponInputWrapper, { backgroundColor: isDark ? '#374151' : '#F8FAFC', borderColor: colors.border }]}>
                            <Ionicons name="pricetag-outline" size={20} color={colors.primary} style={styles.couponIcon} />
                            <TextInput
                                style={[styles.couponInput, { color: colors.text }]}
                                placeholder="Enter Coupon Code"
                                placeholderTextColor={colors.textLight}
                                value={couponCode}
                                onChangeText={setCouponCode}
                                autoCapitalize="characters"
                                editable={!couponId}
                            />
                        </View>
                        {couponId ? (
                            <TouchableOpacity style={styles.removeCouponBtn} onPress={handleRemoveCoupon}>
                                <Text style={styles.removeCouponText}>Remove</Text>
                            </TouchableOpacity>
                        ) : (
                            <TouchableOpacity
                                style={[styles.applyBtn, { backgroundColor: colors.primary }, couponLoading && styles.disabledBtn]}
                                onPress={handleApplyCoupon}
                                disabled={couponLoading || !couponCode.trim()}
                            >
                                {couponLoading ? (
                                    <ActivityIndicator size="small" color="#FFF" />
                                ) : (
                                    <Text style={styles.applyBtnText}>Apply</Text>
                                )}
                            </TouchableOpacity>
                        )}
                    </View>
                    {couponId && (
                        <View style={[styles.couponSuccess, { backgroundColor: isDark ? 'rgba(16, 185, 129, 0.1)' : '#ECFDF5' }]}>
                            <Ionicons name="checkmark-circle" size={16} color="#10B981" />
                            <Text style={styles.couponSuccessText}>
                                Coupon applied! You saved ₹{couponDiscount}
                            </Text>
                        </View>
                    )}
                </View>

                {/* Wallet & Coins */}
                <View style={[styles.section, { backgroundColor: colors.card }]}>
                    <Text style={[styles.sectionTitle, { color: colors.text }]}>Credits & Discounts</Text>

                    {/* YC Coins */}
                    <View style={styles.walletRow}>
                        <View style={styles.walletInfo}>
                            <View style={[styles.walletIconBg, { backgroundColor: isDark ? 'rgba(245, 158, 11, 0.2)' : '#FEF3C7' }]}>
                                <Ionicons name="star" size={18} color="#F59E0B" />
                            </View>
                            <View>
                                <Text style={[styles.walletLabel, { color: colors.text }]}>Use YC Coins</Text>
                                <Text style={[styles.walletSub, { color: colors.textSecondary }]}>Available: {ycCoins}</Text>
                            </View>
                        </View>
                        <Switch
                            value={useCoins}
                            onValueChange={setUseCoins}
                            trackColor={{ false: isDark ? '#4B5563' : '#E5E7EB', true: '#FCD34D' }}
                            thumbColor={useCoins ? '#F59E0B' : '#F4F3F4'}
                            disabled={ycCoins === 0}
                        />
                    </View>
                    {useCoins && coinsToUse > 0 && (
                        <Text style={styles.discountText}>
                            Using {coinsToUse} coins to save ₹{coinDiscount}
                        </Text>
                    )}

                    <View style={[styles.divider, { backgroundColor: colors.border }]} />

                    {/* Wallet Balance */}
                    <View style={styles.walletRow}>
                        <View style={styles.walletInfo}>
                            <View style={[styles.walletIconBg, { backgroundColor: isDark ? 'rgba(59, 130, 246, 0.2)' : '#DBEAFE' }]}>
                                <Ionicons name="wallet" size={18} color={colors.primary} />
                            </View>
                            <View>
                                <Text style={[styles.walletLabel, { color: colors.text }]}>Use Wallet Balance</Text>
                                <Text style={[styles.walletSub, { color: colors.textSecondary }]}>Available: ₹{walletBalance}</Text>
                            </View>
                        </View>
                        <Switch
                            value={useWallet}
                            onValueChange={(val) => {
                                setUseWallet(val);
                                if (val) setPaymentMethod('online');
                            }}
                            trackColor={{ false: isDark ? '#4B5563' : '#E5E7EB', true: '#93C5FD' }}
                            thumbColor={useWallet ? colors.primary : '#F4F3F4'}
                            disabled={walletBalance === 0}
                        />
                    </View>
                    {useWallet && walletAmountToUse > 0 && (
                        <Text style={styles.discountText}>
                            Using ₹{walletAmountToUse} from wallet
                        </Text>
                    )}
                </View>

                {/* Payment Method */}
                {finalPayable > 0 && (
                    <View style={[styles.section, { backgroundColor: colors.card }]}>
                        <Text style={[styles.sectionTitle, { color: colors.text }]}>Payment Method (Advance 15%)</Text>
                        <View
                            style={[
                                styles.paymentOption,
                                { borderColor: colors.primary, backgroundColor: isDark ? 'rgba(59, 130, 246, 0.1)' : '#EFF6FF' }
                            ]}
                        >
                            <View style={styles.paymentLeft}>
                                <Ionicons name="card-outline" size={22} color={colors.primary} />
                                <Text style={[styles.paymentText, { color: colors.primary, fontWeight: '600' }]}>Online Payment</Text>
                            </View>
                            <View style={[styles.radio, { borderColor: colors.primary }]}>
                                <View style={[styles.radioInner, { backgroundColor: colors.primary }]} />
                            </View>
                        </View>
                        <Text style={[styles.walletSub, { color: colors.textSecondary, marginTop: 8, fontStyle: 'italic' }]}>
                            Note: Cash on Delivery is not available for advance payment.
                        </Text>
                    </View>
                )}

                {/* Bill Details */}
                <View style={[styles.section, { backgroundColor: colors.card }]}>
                    <Text style={[styles.sectionTitle, { color: colors.text }]}>Bill Details</Text>
                    <View style={styles.billRow}>
                        <Text style={[styles.billLabel, { color: colors.textSecondary }]}>Subtotal</Text>
                        <Text style={[styles.billValue, { color: colors.text }]}>₹{subtotal}</Text>
                    </View>
                    {platformFee > 0 && (
                        <View style={styles.billRow}>
                            <Text style={[styles.billLabel, { color: colors.textSecondary }]}>Platform Fee</Text>
                            <Text style={[styles.billValue, { color: colors.text }]}>₹{platformFee}</Text>
                        </View>
                    )}
                    {percentageFee > 0 && (
                        <View style={styles.billRow}>
                            <Text style={[styles.billLabel, { color: colors.textSecondary }]}>Service Charge ({feeConfig?.percentageCharge}%)</Text>
                            <Text style={[styles.billValue, { color: colors.text }]}>₹{percentageFee}</Text>
                        </View>
                    )}
                    <View style={styles.billRow}>
                        <Text style={[styles.billLabel, { color: colors.textSecondary }]}>GST (18%)</Text>
                        <Text style={[styles.billValue, { color: colors.text }]}>₹{gstAmount}</Text>
                    </View>
                    {membershipDiscount > 0 && (
                        <View style={styles.billRow}>
                            <Text style={[styles.billLabel, { color: '#F59E0B' }]}>Membership Discount ({activeMembership?.plan_id?.name})</Text>
                            <Text style={[styles.billValue, { color: '#F59E0B' }]}>-₹{membershipDiscount}</Text>
                        </View>
                    )}
                    {couponDiscount > 0 && (
                        <View style={styles.billRow}>
                            <Text style={[styles.billLabel, { color: '#10B981' }]}>Coupon Discount</Text>
                            <Text style={[styles.billValue, { color: '#10B981' }]}>-₹{couponDiscount}</Text>
                        </View>
                    )}
                    {coinDiscount > 0 && (
                        <View style={styles.billRow}>
                            <Text style={[styles.billLabel, { color: '#F59E0B' }]}>Coin Discount</Text>
                            <Text style={[styles.billValue, { color: '#F59E0B' }]}>-₹{coinDiscount}</Text>
                        </View>
                    )}
                    {walletAmountToUse > 0 && (
                        <View style={styles.billRow}>
                            <Text style={[styles.billLabel, { color: colors.primary }]}>Wallet Used</Text>
                            <Text style={[styles.billValue, { color: colors.primary }]}>-₹{walletAmountToUse}</Text>
                        </View>
                    )}
                    <View style={[styles.divider, { backgroundColor: colors.border }]} />
                    <View style={styles.billRow}>
                        <Text style={[styles.billLabel, { color: colors.text, fontWeight: '600' }]}>Total Booking Amount</Text>
                        <Text style={[styles.billValue, { color: colors.text }]}>₹{totalToPay}</Text>
                    </View>
                    <View style={styles.billRow}>
                        <Text style={[styles.totalLabel, { color: colors.primary }]}>Advance to Pay (15%)</Text>
                        <Text style={[styles.totalValue, { color: colors.primary }]}>₹{advanceRequired}</Text>
                    </View>
                    <View style={styles.billRow}>
                        <Text style={[styles.billLabel, { color: colors.textSecondary }]}>Balance to pay later (85%)</Text>
                        <Text style={[styles.billValue, { color: colors.textSecondary }]}>₹{remainingBalance}</Text>
                    </View>
                </View>

                <View style={{ height: 100 }} />
            </ScrollView>

            {/* Footer */}
            <View style={[styles.footer, { backgroundColor: colors.card, borderTopColor: colors.border }]}>
                <View>
                    <Text style={[styles.footerLabel, { color: colors.textSecondary }]}>Amount to Pay Now</Text>
                    <Text style={[styles.footerAmount, { color: colors.primary }]}>₹{finalPayable}</Text>
                </View>
                <TouchableOpacity
                    style={[styles.payBtn, { backgroundColor: colors.primary }, loading && styles.disabledBtn]}
                    onPress={handlePlaceOrder}
                    disabled={loading}
                >
                    {loading ? (
                        <ActivityIndicator color="#FFF" />
                    ) : (
                        <Text style={styles.payBtnText}>
                            {finalPayable === 0 ? 'Confirm Booking' : `Pay ₹${finalPayable}`}
                        </Text>
                    )}
                    {!loading && <Ionicons name="arrow-forward" size={18} color="#FFF" />}
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1 },
    header: { flexDirection: 'row', alignItems: 'center', padding: 16, borderBottomWidth: 1 },
    backBtn: { padding: 4 },
    headerTitle: { fontSize: 18, fontWeight: '700', marginLeft: 12 },
    content: { flex: 1, padding: 16 },
    section: { borderRadius: 16, padding: 16, marginBottom: 16, ...SHADOWS.light },
    sectionTitle: { fontSize: 16, fontWeight: '700', marginBottom: 12 },
    sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
    itemCard: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1 },
    itemIcon: { width: 40, height: 40, borderRadius: 10, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
    itemInfo: { flex: 1 },
    itemService: { fontSize: 15, fontWeight: '600' },
    itemWorker: { fontSize: 13, marginTop: 2 },
    itemMeta: { fontSize: 12, marginTop: 2 },
    itemPrice: { fontSize: 16, fontWeight: '700' },
    locationBtn: { flexDirection: 'row', alignItems: 'center', gap: 4 },
    locationBtnText: { fontSize: 13, fontWeight: '600' },
    input: { borderWidth: 1, borderRadius: 10, padding: 12, fontSize: 14, marginBottom: 12 },
    row: { flexDirection: 'row', gap: 12 },
    walletRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 8 },
    walletInfo: { flexDirection: 'row', alignItems: 'center', gap: 12 },
    walletIconBg: { width: 36, height: 36, borderRadius: 18, justifyContent: 'center', alignItems: 'center' },
    walletLabel: { fontSize: 14, fontWeight: '600' },
    walletSub: { fontSize: 12 },
    discountText: { fontSize: 12, color: '#10B981', marginLeft: 48, marginBottom: 8 },
    divider: { height: 1, marginVertical: 12 },
    paymentOption: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 14, borderWidth: 1, borderRadius: 12, marginBottom: 10 },
    paymentLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
    paymentText: { fontSize: 14, fontWeight: '500' },
    radio: { width: 20, height: 20, borderRadius: 10, borderWidth: 2, justifyContent: 'center', alignItems: 'center' },
    radioInner: { width: 10, height: 10, borderRadius: 5 },
    billRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
    billLabel: { fontSize: 14 },
    billValue: { fontSize: 14, fontWeight: '600' },
    totalLabel: { fontSize: 16, fontWeight: '700' },
    totalValue: { fontSize: 18, fontWeight: '700' },
    footer: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: 16, borderTopWidth: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
    footerLabel: { fontSize: 12 },
    footerAmount: { fontSize: 20, fontWeight: '700' },
    payBtn: { paddingHorizontal: 24, paddingVertical: 14, borderRadius: 12, flexDirection: 'row', alignItems: 'center', gap: 8 },
    payBtnText: { color: '#FFF', fontSize: 16, fontWeight: '700' },
    disabledBtn: { opacity: 0.7 },
    couponContainer: { flexDirection: 'row', gap: 12, alignItems: 'center' },
    couponInputWrapper: { flex: 1, flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderRadius: 12, paddingHorizontal: 12 },
    couponIcon: { marginRight: 8 },
    couponInput: { flex: 1, paddingVertical: 12, fontSize: 14, textTransform: 'uppercase' },
    applyBtn: { paddingHorizontal: 20, paddingVertical: 12, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
    applyBtnText: { color: '#FFF', fontSize: 14, fontWeight: '600' },
    removeCouponBtn: { paddingHorizontal: 16, paddingVertical: 12 },
    removeCouponText: { color: '#EF4444', fontSize: 14, fontWeight: '600' },
    couponSuccess: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 12, padding: 10, borderRadius: 8 },
    couponSuccessText: { color: '#10B981', fontSize: 13, fontWeight: '500' },
});

export default CheckoutScreen;
