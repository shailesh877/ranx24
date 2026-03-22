import React, { useState, useEffect } from 'react';
import {
    View, Text, StyleSheet, FlatList, TouchableOpacity, Modal,
    ScrollView, ActivityIndicator, Image, StatusBar, TextInput
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Toast from 'react-native-toast-message';
import api, { API_URL } from '../../services/api';
import { useCart } from '../../context/CartContext';
import { useTheme } from '../../context/ThemeContext';
import { useLocation } from '../../context/LocationContext';
import DatePicker from '../../components/DatePicker';

// Define SHADOWS locally if not available in theme context yet, or import if I knew where it was.
// Based on previous files, it seems SHADOWS was imported from '../../constants/theme'.
import { SHADOWS } from '../../constants/theme';

const BookingScreen = ({ navigation, route }: any) => {
    const { colors, isDark } = useTheme();
    const { location } = useLocation();
    const { addToCart } = useCart();

    // Get params
    const { categoryId, categoryName, serviceId, serviceName } = route.params || {};

    const [workers, setWorkers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedWorker, setSelectedWorker] = useState<any>(null);
    const [showBookingModal, setShowBookingModal] = useState(false);

    // Booking options
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const [selectedDate, setSelectedDate] = useState(tomorrow);
    const [bookingType, setBookingType] = useState<'half-day' | 'full-day' | 'multiple-days'>('full-day');
    const [days, setDays] = useState(1);
    const [bookingTime, setBookingTime] = useState("09:00 AM"); // New State

    useEffect(() => {
        fetchWorkers();
    }, [categoryId, serviceId, location]);

    const fetchWorkers = async () => {
        try {
            setLoading(true);
            const params = new URLSearchParams();
            if (categoryId) params.append('category', categoryId);
            // The backend filters workers by 'service' name usually, or we might need to update backend to filter by serviceId if needed.
            // For now, let's assume filtering by service name is supported or we filter client side if needed.
            // Based on previous context, backend supports 'service' param.
            if (serviceName) params.append('service', serviceName);

            if (location.latitude && location.longitude) {
                params.append('latitude', location.latitude.toString());
                params.append('longitude', location.longitude.toString());
            }

            const response = await api.get(`/workers?${params.toString()}`);
            setWorkers(response.data);
        } catch (error) {
            console.error('Error fetching workers:', error);
            Toast.show({
                type: 'error',
                text1: 'Error',
                text2: 'Failed to load professionals',
            });
        } finally {
            setLoading(false);
        }
    };

    const calculatePrice = () => {
        // If no worker selected, use fallback price from params or default
        if (!selectedWorker) {
            const fallbackPrice = route.params?.basePrice || 500;
            if (bookingType === 'half-day') return Math.round(fallbackPrice * 0.6);
            if (bookingType === 'full-day') return fallbackPrice;
            return fallbackPrice * days;
        }

        // Logic to find price for the specific service if available, else base price
        let basePrice = selectedWorker.basePrice || 500;

        // If worker has servicePricing, try to find the price for the selected service
        if (selectedWorker.servicePricing && serviceName) {
            const specificPrice = selectedWorker.servicePricing.find((p: any) => p.serviceName === serviceName);
            if (specificPrice) basePrice = specificPrice.price;
        }

        if (bookingType === 'half-day') return Math.round(basePrice * 0.6);
        if (bookingType === 'full-day') return basePrice;
        return basePrice * days;
    };

    const handleAddToCart = async () => {
        if (!selectedWorker) return;

        try {
            await addToCart({
                workerId: selectedWorker._id,
                workerName: selectedWorker.name,
                serviceId: serviceId, // Optional, but good to track
                service: serviceName || selectedWorker.services?.[0] || 'General Service',
                category: categoryName || selectedWorker.categories?.[0] || 'General',
                price: calculatePrice(),
                startDate: selectedDate.toISOString(),
                bookingType: bookingType,
                days: days,
                bookingDate: selectedDate.toISOString().split('T')[0],
                bookingTime: '09:00',
                image: selectedWorker.profileImage
            });

            setShowBookingModal(false);
            setSelectedWorker(null);

            Toast.show({
                type: 'success',
                text1: 'Added to Cart',
                text2: 'Proceed to checkout',
            });
            navigation.navigate('Cart');
        } catch (error) {
            console.error('Error adding to cart:', error);
            Toast.show({
                type: 'error',
                text1: 'Error',
                text2: 'Failed to add to cart',
            });
        }
    };

    const handleBookNow = () => {
        if (!selectedWorker) return;

        const bookingData = {
            workerId: selectedWorker._id,
            workerName: selectedWorker.name,
            serviceId: serviceId,
            service: serviceName || selectedWorker.services?.[0] || 'General Service',
            category: categoryName || selectedWorker.categories?.[0] || 'General',
            price: calculatePrice(),
            startDate: selectedDate.toISOString(),
            bookingType: bookingType,
            days: days,
            bookingDate: selectedDate.toISOString().split('T')[0],
            bookingTime: '09:00',
            image: selectedWorker.profileImage
        };

        setShowBookingModal(false);
        setSelectedWorker(null);
        navigation.navigate('Checkout', { directBooking: bookingData });
    };

    const renderWorker = ({ item }: any) => (
        <TouchableOpacity
            style={[styles.workerCard, { backgroundColor: colors.card }]}
            onPress={() => {
                setSelectedWorker(item);
                setShowBookingModal(true);
            }}
        >
            <Image
                source={{
                    uri: item.profileImage
                        ? `${API_URL.replace('/api', '')}/${item.profileImage.replace(/\\/g, '/')}`
                        : "https://cdn-icons-png.flaticon.com/512/1077/1077114.png"
                }}
                style={styles.workerImage}
            />
            <View style={styles.workerInfo}>
                <Text style={[styles.workerName, { color: colors.text }]}>
                    {item.name}
                </Text>
                <View style={styles.ratingRow}>
                    <Ionicons name="star" size={14} color="#FBBF24" />
                    <Text style={[styles.ratingText, { color: colors.textSecondary }]}>
                        {item.rating || 'New'} ({item.reviewCount || 0} reviews)
                    </Text>
                </View>
                <Text style={[styles.workerServices, { color: colors.textSecondary }]} numberOfLines={1}>
                    {item.services?.join(', ')}
                </Text>
                <Text style={[styles.price, { color: colors.primary }]}>
                    Starts at ₹{item.basePrice || 500}
                </Text>
            </View>
            <TouchableOpacity
                style={[styles.bookBtn, { backgroundColor: colors.primary }]}
                onPress={() => {
                    setSelectedWorker(item);
                    setShowBookingModal(true);
                }}
            >
                <Text style={styles.bookBtnText}>Book</Text>
            </TouchableOpacity>
        </TouchableOpacity>
    );

    // If service-booking mode, we don't need to fetch workers or show the list
    const isServiceMode = route.params?.mode === 'service-booking';

    // ... existing worker fetching logic ...
    useEffect(() => {
        if (!isServiceMode) {
            fetchWorkers();
        }
    }, [categoryId, serviceId, location, isServiceMode]);

    // Service Mode Render
    if (isServiceMode) {
        return (
            <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top', 'left', 'right']}>
                <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} backgroundColor={colors.background} />
                <View style={[styles.header, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
                    <TouchableOpacity onPress={() => navigation.goBack()}>
                        <Ionicons name="arrow-back" size={24} color={colors.text} />
                    </TouchableOpacity>
                    <View style={styles.headerCenter}>
                        <Text style={[styles.headerTitle, { color: colors.text }]}>Book Service</Text>
                        <Text style={[styles.headerSubtitle, { color: colors.textSecondary }]}>{serviceName}</Text>
                    </View>
                    <View style={{ width: 24 }} />
                </View>

                <ScrollView style={{ padding: 20 }}>
                    {/* Service Info Card */}
                    <View style={[styles.workerCard2, { backgroundColor: isDark ? '#374151' : '#F8FAFC' }]}>
                        <View style={[styles.workerImage2, { backgroundColor: colors.primary, justifyContent: 'center', alignItems: 'center' }]}>
                            <Ionicons name="briefcase-outline" size={24} color="#FFF" />
                        </View>
                        <View style={{ flex: 1 }}>
                            <Text style={[styles.workerName2, { color: colors.text }]}>
                                {serviceName || 'Selected Service'}
                            </Text>
                            <Text style={[styles.workerServices2, { color: colors.textSecondary }]}>
                                {categoryName}
                            </Text>
                        </View>
                    </View>

                    {/* Compact Date Selection */}
                    <View style={styles.section}>
                        <Text style={[styles.sectionTitle, { color: colors.text }]}>Select Date & Time</Text>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 10, paddingBottom: 4 }}>
                            {Array.from({ length: 14 }).map((_, i) => {
                                const date = new Date();
                                date.setDate(date.getDate() + 1 + i);
                                const isSelected = date.toDateString() === selectedDate.toDateString();
                                return (
                                    <TouchableOpacity
                                        key={i}
                                        style={[
                                            styles.dateCard,
                                            { backgroundColor: isSelected ? colors.primary : (isDark ? '#374151' : '#F8FAFC'), borderColor: isSelected ? colors.primary : colors.border }
                                        ]}
                                        onPress={() => setSelectedDate(date)}
                                    >
                                        <Text style={[styles.dateDay, { color: isSelected ? '#FFF' : colors.textSecondary }]}>{date.toLocaleDateString('en-US', { weekday: 'short' })}</Text>
                                        <Text style={[styles.dateNum, { color: isSelected ? '#FFF' : colors.text }]}>{date.getDate()}</Text>
                                    </TouchableOpacity>
                                );
                            })}
                        </ScrollView>
                    </View>

                    {/* Time Selection */}
                    <View style={styles.section}>
                        <Text style={[styles.sectionTitle, { color: colors.text }]}>Select Time</Text>
                        <View style={styles.timeGrid}>
                            {["09:00 AM", "10:00 AM", "11:00 AM", "12:00 PM", "01:00 PM", "02:00 PM", "03:00 PM", "04:00 PM", "05:00 PM", "06:00 PM", "07:00 PM"].map((time, index) => {
                                const isSelected = bookingTime === time;
                                return (
                                    <TouchableOpacity
                                        key={index}
                                        style={[
                                            styles.timeSlot,
                                            { backgroundColor: isSelected ? colors.primary : (isDark ? '#374151' : '#F8FAFC'), borderColor: isSelected ? colors.primary : colors.border }
                                        ]}
                                        onPress={() => setBookingTime(time)}
                                    >
                                        <Text style={[styles.timeText, { color: isSelected ? '#FFF' : colors.text }]}>{time}</Text>
                                    </TouchableOpacity>
                                );
                            })}
                        </View>
                    </View>

                    {/* Summary */}
                    <View style={[styles.summary, { backgroundColor: isDark ? '#374151' : '#F8FAFC', borderColor: colors.border }]}>
                        <View style={styles.summaryRow}>
                            <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>Service</Text>
                            <Text style={[styles.summaryValue, { color: colors.text }]}>{serviceName}</Text>
                        </View>
                        <View style={styles.summaryRow}>
                            <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>Date</Text>
                            <Text style={[styles.summaryValue, { color: colors.text }]}>
                                {selectedDate.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                            </Text>
                        </View>
                        <View style={styles.summaryRow}>
                            <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>Time</Text>
                            <Text style={[styles.summaryValue, { color: colors.text }]}>
                                {bookingTime}
                            </Text>
                        </View>
                        <View style={[styles.divider, { backgroundColor: colors.border }]} />
                        <View style={styles.summaryRow}>
                            <Text style={[styles.totalLabel, { color: colors.text }]}>Estimated Price</Text>
                            <Text style={[styles.totalAmount, { color: colors.primary }]}>₹{route.params?.basePrice || 500}</Text>
                        </View>
                    </View>
                    <View style={{ height: 100 }} />
                </ScrollView>

                <View style={[styles.footer, { backgroundColor: colors.card, borderTopColor: colors.border }]}>
                    <TouchableOpacity
                        style={[styles.bookNowBtn, { backgroundColor: colors.primary, flex: 1 }]}
                        onPress={() => {
                            const bookingData = {
                                workerId: undefined,
                                workerName: 'System Assigned',
                                serviceId: serviceId,
                                service: serviceName || 'General Service',
                                category: categoryName || 'General',
                                price: route.params?.basePrice || 500,
                                startDate: selectedDate.toISOString(),
                                bookingType: 'full-day',
                                days: 1,
                                bookingDate: selectedDate.toISOString().split('T')[0],
                                bookingTime: bookingTime,
                                image: null
                            };
                            navigation.navigate('Checkout', { directBooking: bookingData });
                        }}
                    >
                        <Text style={styles.bookNowBtnText}>Proceed to Checkout</Text>
                        <Ionicons name="arrow-forward" size={18} color="#FFF" />
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        );
    }

    // Main Render (Worker Selection)
    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top', 'left', 'right']}>
            <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} backgroundColor={colors.background} />
            <View style={[styles.header, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Ionicons name="arrow-back" size={24} color={colors.text} />
                </TouchableOpacity>
                <View style={styles.headerCenter}>
                    <Text style={[styles.headerTitle, { color: colors.text }]}>
                        {serviceName || 'Select Professional'}
                    </Text>
                    <Text style={[styles.headerSubtitle, { color: colors.textSecondary }]}>
                        {workers.length} professionals available
                    </Text>
                </View>
                <View style={{ width: 24 }} />
            </View>

            <FlatList
                data={workers}
                renderItem={renderWorker}
                keyExtractor={(item) => item._id}
                contentContainerStyle={styles.list}
                initialNumToRender={5}
                maxToRenderPerBatch={5}
                windowSize={3}
                removeClippedSubviews={true}
                ListEmptyComponent={
                    loading ? (
                        <View style={styles.empty}>
                            <ActivityIndicator size="large" color={colors.primary} />
                            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>Loading professionals...</Text>
                        </View>
                    ) : (
                        <View style={styles.empty}>
                            <Ionicons name="people-outline" size={60} color={colors.textLight} />
                            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>No professionals found for this service.</Text>
                        </View>
                    )
                }
            />

            <Modal
                visible={showBookingModal}
                animationType="slide"
                transparent
                onRequestClose={() => setShowBookingModal(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
                        <View style={[styles.modalHeader, { borderBottomColor: colors.border }]}>
                            <Text style={[styles.modalTitle, { color: colors.text }]}>Book Professional</Text>
                            <TouchableOpacity onPress={() => setShowBookingModal(false)}>
                                <Ionicons name="close" size={24} color={colors.text} />
                            </TouchableOpacity>
                        </View>

                        <ScrollView style={styles.modalScroll}>
                            {selectedWorker && (
                                <>
                                    <View style={[styles.workerCard2, { backgroundColor: isDark ? '#374151' : '#F8FAFC' }]}>
                                        <Image
                                            source={{
                                                uri: selectedWorker.profileImage
                                                    ? `${API_URL.replace('/api', '')}/${selectedWorker.profileImage.replace(/\\/g, '/')}`
                                                    : "https://cdn-icons-png.flaticon.com/512/1077/1077114.png"
                                            }}
                                            style={styles.workerImage2}
                                        />
                                        <View style={{ flex: 1 }}>
                                            <Text style={[styles.workerName2, { color: colors.text }]}>
                                                {selectedWorker.name}
                                            </Text>
                                            <Text style={[styles.workerServices2, { color: colors.textSecondary }]}>
                                                {selectedWorker.services?.join(', ')}
                                            </Text>
                                        </View>
                                    </View>

                                    <View style={styles.section}>
                                        <Text style={[styles.sectionTitle, { color: colors.text }]}>Select Date</Text>
                                        <DatePicker
                                            selectedDate={selectedDate}
                                            onDateChange={setSelectedDate}
                                        />
                                    </View>

                                    <View style={styles.section}>
                                        <Text style={[styles.sectionTitle, { color: colors.text }]}>Duration</Text>
                                        <View style={styles.durationRow}>
                                            <TouchableOpacity
                                                style={[
                                                    styles.durationBtn,
                                                    { backgroundColor: isDark ? '#374151' : '#F8FAFC' },
                                                    bookingType === 'half-day' && { backgroundColor: isDark ? '#78350F' : '#FEF3C7', borderColor: colors.primary }
                                                ]}
                                                onPress={() => { setBookingType('half-day'); setDays(1); }}
                                            >
                                                <Ionicons name="sunny-outline" size={20} color={bookingType === 'half-day' ? colors.primary : colors.textLight} />
                                                <Text style={[
                                                    styles.durationText,
                                                    { color: colors.textSecondary },
                                                    bookingType === 'half-day' && { color: colors.primary, fontWeight: '700' }
                                                ]}>
                                                    Half Day
                                                </Text>
                                                <Text style={[styles.durationSub, { color: colors.textLight }]}>4 hours</Text>
                                            </TouchableOpacity>

                                            <TouchableOpacity
                                                style={[
                                                    styles.durationBtn,
                                                    { backgroundColor: isDark ? '#374151' : '#F8FAFC' },
                                                    bookingType === 'full-day' && { backgroundColor: isDark ? '#78350F' : '#FEF3C7', borderColor: colors.primary }
                                                ]}
                                                onPress={() => { setBookingType('full-day'); setDays(1); }}
                                            >
                                                <Ionicons name="calendar-outline" size={20} color={bookingType === 'full-day' ? colors.primary : colors.textLight} />
                                                <Text style={[
                                                    styles.durationText,
                                                    { color: colors.textSecondary },
                                                    bookingType === 'full-day' && { color: colors.primary, fontWeight: '700' }
                                                ]}>
                                                    Full Day
                                                </Text>
                                                <Text style={[styles.durationSub, { color: colors.textLight }]}>8 hours</Text>
                                            </TouchableOpacity>

                                            <TouchableOpacity
                                                style={[
                                                    styles.durationBtn,
                                                    { backgroundColor: isDark ? '#374151' : '#F8FAFC' },
                                                    bookingType === 'multiple-days' && { backgroundColor: isDark ? '#78350F' : '#FEF3C7', borderColor: colors.primary }
                                                ]}
                                                onPress={() => { setBookingType('multiple-days'); if (days === 1) setDays(2); }}
                                            >
                                                <Ionicons name="calendar-number-outline" size={20} color={bookingType === 'multiple-days' ? colors.primary : colors.textLight} />
                                                <Text style={[
                                                    styles.durationText,
                                                    { color: colors.textSecondary },
                                                    bookingType === 'multiple-days' && { color: colors.primary, fontWeight: '700' }
                                                ]}>
                                                    Multiple
                                                </Text>
                                                <Text style={[styles.durationSub, { color: colors.textLight }]}>{days} days</Text>
                                            </TouchableOpacity>
                                        </View>
                                    </View>

                                    {bookingType === 'multiple-days' && (
                                        <View style={styles.section}>
                                            <Text style={[styles.sectionTitle, { color: colors.text }]}>Number of Days</Text>
                                            <View style={[styles.daysRow, { backgroundColor: isDark ? '#374151' : '#F8FAFC' }]}>
                                                <TouchableOpacity
                                                    style={[styles.daysBtn, { backgroundColor: colors.card }]}
                                                    onPress={() => setDays(Math.max(2, days - 1))}
                                                    disabled={days <= 2}
                                                >
                                                    <Ionicons name="remove" size={20} color={days <= 2 ? colors.textLight : colors.text} />
                                                </TouchableOpacity>
                                                <View style={styles.daysDisplay}>
                                                    <Text style={[styles.daysText, { color: colors.text }]}>{days}</Text>
                                                    <Text style={[styles.daysLabel, { color: colors.textSecondary }]}>Days</Text>
                                                </View>
                                                <TouchableOpacity
                                                    style={[styles.daysBtn, { backgroundColor: colors.card }]}
                                                    onPress={() => setDays(days + 1)}
                                                >
                                                    <Ionicons name="add" size={20} color={colors.text} />
                                                </TouchableOpacity>
                                            </View>
                                        </View>
                                    )}

                                    <View style={[styles.summary, { backgroundColor: isDark ? '#374151' : '#F8FAFC', borderColor: colors.border }]}>
                                        <View style={styles.summaryRow}>
                                            <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>Professional</Text>
                                            <Text style={[styles.summaryValue, { color: colors.text }]}>{selectedWorker.name}</Text>
                                        </View>
                                        <View style={styles.summaryRow}>
                                            <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>Service</Text>
                                            <Text style={[styles.summaryValue, { color: colors.text }]}>{serviceName || 'General Service'}</Text>
                                        </View>
                                        <View style={styles.summaryRow}>
                                            <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>Date</Text>
                                            <Text style={[styles.summaryValue, { color: colors.text }]}>
                                                {selectedDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                            </Text>
                                        </View>
                                        <View style={styles.summaryRow}>
                                            <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>Duration</Text>
                                            <Text style={[styles.summaryValue, { color: colors.text }]}>
                                                {bookingType === 'half-day' ? 'Half Day' : bookingType === 'full-day' ? 'Full Day' : `${days} Days`}
                                            </Text>
                                        </View>
                                        <View style={[styles.divider, { backgroundColor: colors.border }]} />
                                        <View style={styles.summaryRow}>
                                            <Text style={[styles.totalLabel, { color: colors.text }]}>Total</Text>
                                            <Text style={[styles.totalAmount, { color: colors.primary }]}>₹{calculatePrice()}</Text>
                                        </View>
                                    </View>
                                </>
                            )}
                        </ScrollView>

                        <View style={[styles.footer, { borderTopColor: colors.border }]}>
                            <TouchableOpacity
                                style={[styles.cartBtn, { backgroundColor: colors.card, borderColor: colors.primary }]}
                                onPress={handleAddToCart}
                            >
                                <Ionicons name="cart-outline" size={18} color={colors.primary} />
                                <Text style={[styles.cartBtnText, { color: colors.primary }]}>Add to Cart</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.bookNowBtn, { backgroundColor: colors.primary }]}
                                onPress={handleBookNow}
                            >
                                <Text style={styles.bookNowBtnText}>Book Now</Text>
                                <Ionicons name="arrow-forward" size={18} color="#FFF" />
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1 },
    header: { flexDirection: 'row', alignItems: 'center', padding: 16, borderBottomWidth: 1 },
    headerCenter: { flex: 1, alignItems: 'center' },
    headerTitle: { fontSize: 18, fontWeight: '700' },
    headerSubtitle: { fontSize: 12, marginTop: 2 },
    list: { padding: 16 },
    workerCard: { flexDirection: 'row', borderRadius: 16, padding: 12, marginBottom: 12, ...SHADOWS.medium },
    workerImage: { width: 70, height: 70, borderRadius: 12, marginRight: 12 },
    workerInfo: { flex: 1 },
    workerName: { fontSize: 16, fontWeight: '700', marginBottom: 4 },
    ratingRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 4 },
    ratingText: { fontSize: 12 },
    workerServices: { fontSize: 12, marginBottom: 6 },
    price: { fontSize: 14, fontWeight: '700' },
    bookBtn: { justifyContent: 'center', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 8, alignSelf: 'center' },
    bookBtnText: { color: '#FFF', fontSize: 12, fontWeight: '600' },
    empty: { alignItems: 'center', justifyContent: 'center', paddingVertical: 60 },
    emptyText: { fontSize: 16, marginTop: 12 },
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
    modalContent: { borderTopLeftRadius: 24, borderTopRightRadius: 24, maxHeight: '90%' },
    modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, borderBottomWidth: 1 },
    modalTitle: { fontSize: 20, fontWeight: '700' },
    modalScroll: { padding: 20 },
    workerCard2: { flexDirection: 'row', alignItems: 'center', marginBottom: 20, padding: 12, borderRadius: 12 },
    workerImage2: { width: 60, height: 60, borderRadius: 30, marginRight: 12 },
    workerName2: { fontSize: 18, fontWeight: '700', marginBottom: 4 },
    workerServices2: { fontSize: 14 },
    section: { marginBottom: 20 },
    sectionTitle: { fontSize: 16, fontWeight: '600', marginBottom: 12 },
    durationRow: { flexDirection: 'row', gap: 10 },
    durationBtn: { flex: 1, borderRadius: 12, padding: 12, alignItems: 'center', borderWidth: 2, borderColor: 'transparent', minHeight: 90 },
    durationText: { fontSize: 13, fontWeight: '600', marginTop: 6 },
    durationSub: { fontSize: 11, marginTop: 2 },
    daysRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderRadius: 12, padding: 8 },
    daysBtn: { width: 40, height: 40, borderRadius: 10, justifyContent: 'center', alignItems: 'center', ...SHADOWS.light },
    daysDisplay: { alignItems: 'center' },
    daysText: { fontSize: 20, fontWeight: 'bold' },
    daysLabel: { fontSize: 12 },
    summary: { borderRadius: 16, padding: 16, borderWidth: 1 },
    summaryRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
    summaryLabel: { fontSize: 14 },
    summaryValue: { fontWeight: '600', fontSize: 14 },
    divider: { height: 1, marginVertical: 8 },
    totalLabel: { fontSize: 16, fontWeight: '700' },
    totalAmount: { fontSize: 20, fontWeight: '700' },
    footer: { flexDirection: 'row', gap: 12, padding: 20, borderTopWidth: 1 },
    cartBtn: { flex: 1, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', padding: 14, borderRadius: 12, gap: 8, borderWidth: 2 },
    cartBtnText: { fontSize: 16, fontWeight: '700' },
    bookNowBtn: { flex: 1, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', padding: 14, borderRadius: 12, gap: 8, ...SHADOWS.medium },
    bookNowBtnText: { fontSize: 16, fontWeight: '700', color: '#FFF' },
    dateCard: { width: 60, height: 75, borderRadius: 12, justifyContent: 'center', alignItems: 'center', borderWidth: 1, marginRight: 8 },
    dateDay: { fontSize: 12, fontWeight: '600', marginBottom: 4 },
    dateNum: { fontSize: 18, fontWeight: '700' },
    timeGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
    timeSlot: { paddingVertical: 10, paddingHorizontal: 16, borderRadius: 10, borderWidth: 1, marginBottom: 8 },
    timeText: { fontSize: 13, fontWeight: '600' },
});

export default BookingScreen;
