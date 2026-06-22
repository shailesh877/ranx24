import React, { useState, useEffect } from 'react';
import {
    View, Text, StyleSheet, ScrollView, TouchableOpacity,
    TextInput, ActivityIndicator, StatusBar,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import RazorpayCheckout from 'react-native-razorpay';
import Toast from 'react-native-toast-message';
import api from '../../services/api';
import { useTheme } from '../../context/ThemeContext';
import { getRazorpayKey } from '../../services/razorpayService';

const ADVANCE_PERCENT = 0.15;

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
];

const toDateStr = (y: number, m: number, d: number) =>
    `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;

const todayDateStr = () => {
    const t = new Date();
    return toDateStr(t.getFullYear(), t.getMonth(), t.getDate());
};

// ─── Custom Calendar Component ───────────────────────────────────────────────
const CustomCalendar = ({
    selectedDate,
    onSelect,
    bookedDates,
    colors,
    isDark,
}: {
    selectedDate: string;
    onSelect: (d: string) => void;
    bookedDates: string[];
    colors: any;
    isDark: boolean;
}) => {
    const today = new Date();
    const [viewYear, setViewYear] = useState(today.getFullYear());
    const [viewMonth, setViewMonth] = useState(today.getMonth());

    const todayStr = toDateStr(today.getFullYear(), today.getMonth(), today.getDate());

    const prevMonth = () => {
        if (viewMonth === 0) { setViewYear(y => y - 1); setViewMonth(11); }
        else setViewMonth(m => m - 1);
    };
    const nextMonth = () => {
        if (viewMonth === 11) { setViewYear(y => y + 1); setViewMonth(0); }
        else setViewMonth(m => m + 1);
    };

    // Build grid
    const firstDay = new Date(viewYear, viewMonth, 1).getDay();
    const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();

    const cells: (number | null)[] = [];
    for (let i = 0; i < firstDay; i++) cells.push(null);
    for (let d = 1; d <= daysInMonth; d++) cells.push(d);
    // pad to complete last row
    while (cells.length % 7 !== 0) cells.push(null);

    const isPast = (d: number) => toDateStr(viewYear, viewMonth, d) <= todayStr;
    const isBooked = (d: number) => bookedDates.includes(toDateStr(viewYear, viewMonth, d));
    const isSelected = (d: number) => toDateStr(viewYear, viewMonth, d) === selectedDate;
    const isToday = (d: number) => toDateStr(viewYear, viewMonth, d) === todayStr;

    // Disable prev arrow if current month is today's month
    const canGoPrev =
        viewYear > today.getFullYear() ||
        (viewYear === today.getFullYear() && viewMonth > today.getMonth());

    return (
        <View style={[calStyles.wrapper, { backgroundColor: isDark ? '#0f172a' : '#f8fafc', borderColor: colors.border }]}>
            {/* Month navigation */}
            <View style={calStyles.navRow}>
                <TouchableOpacity
                    onPress={prevMonth}
                    disabled={!canGoPrev}
                    style={[calStyles.navBtn, !canGoPrev && { opacity: 0.3 }]}
                >
                    <Ionicons name="chevron-back" size={22} color={colors.primary} />
                </TouchableOpacity>
                <Text style={[calStyles.monthTitle, { color: colors.text }]}>
                    {MONTHS[viewMonth]} {viewYear}
                </Text>
                <TouchableOpacity onPress={nextMonth} style={calStyles.navBtn}>
                    <Ionicons name="chevron-forward" size={22} color={colors.primary} />
                </TouchableOpacity>
            </View>

            {/* Day headers */}
            <View style={calStyles.dayHeaderRow}>
                {DAYS.map(d => (
                    <Text key={d} style={[calStyles.dayHeader, { color: colors.textSecondary }]}>{d}</Text>
                ))}
            </View>

            {/* Grid */}
            <View style={calStyles.grid}>
                {cells.map((day, idx) => {
                    if (!day) return <View key={`e-${idx}`} style={calStyles.cell} />;

                    const past = isPast(day);
                    const booked = isBooked(day);
                    const selected = isSelected(day);
                    const todayDay = isToday(day);
                    const disabled = past || booked;

                    let bgColor = 'transparent';
                    let textColor = colors.text;
                    let borderColor = 'transparent';

                    if (selected) { bgColor = colors.primary; textColor = '#fff'; }
                    else if (booked) { bgColor = isDark ? '#3b1515' : '#fee2e2'; textColor = '#ef4444'; }
                    else if (past) { textColor = isDark ? '#374151' : '#d1d5db'; }
                    else if (todayDay) { borderColor = colors.primary; textColor = colors.primary; }

                    return (
                        <TouchableOpacity
                            key={`d-${idx}`}
                            style={[calStyles.cell]}
                            disabled={disabled}
                            onPress={() => onSelect(toDateStr(viewYear, viewMonth, day))}
                            activeOpacity={0.7}
                        >
                            <View style={[
                                calStyles.dayCircle,
                                { backgroundColor: bgColor, borderColor, borderWidth: todayDay && !selected ? 1.5 : 0 }
                            ]}>
                                <Text style={[calStyles.dayNum, { color: textColor }]}>{day}</Text>
                                {booked && <View style={calStyles.bookedDot} />}
                            </View>
                        </TouchableOpacity>
                    );
                })}
            </View>

            {/* Legend */}
            <View style={calStyles.legend}>
                <View style={calStyles.legendItem}>
                    <View style={[calStyles.legendDot, { backgroundColor: colors.primary }]} />
                    <Text style={[calStyles.legendText, { color: colors.textSecondary }]}>Selected</Text>
                </View>
                <View style={calStyles.legendItem}>
                    <View style={[calStyles.legendDot, { backgroundColor: '#ef4444' }]} />
                    <Text style={[calStyles.legendText, { color: colors.textSecondary }]}>Booked</Text>
                </View>
                <View style={calStyles.legendItem}>
                    <View style={[calStyles.legendDot, { backgroundColor: isDark ? '#374151' : '#e5e7eb' }]} />
                    <Text style={[calStyles.legendText, { color: colors.textSecondary }]}>Unavailable</Text>
                </View>
            </View>
        </View>
    );
};

const calStyles = StyleSheet.create({
    wrapper: {
        borderRadius: 16, borderWidth: 1,
        overflow: 'hidden', paddingBottom: 8,
    },
    navRow: {
        flexDirection: 'row', alignItems: 'center',
        justifyContent: 'space-between', paddingVertical: 14, paddingHorizontal: 12,
    },
    navBtn: { padding: 6 },
    monthTitle: { fontSize: 17, fontWeight: '700' },
    dayHeaderRow: { flexDirection: 'row', paddingHorizontal: 8, marginBottom: 4 },
    dayHeader: { flex: 1, textAlign: 'center', fontSize: 12, fontWeight: '600' },
    grid: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 8 },
    cell: { width: '14.28%', alignItems: 'center', paddingVertical: 4 },
    dayCircle: {
        width: 36, height: 36, borderRadius: 18,
        alignItems: 'center', justifyContent: 'center',
    },
    dayNum: { fontSize: 14, fontWeight: '500' },
    bookedDot: {
        position: 'absolute', bottom: 3, width: 4, height: 4,
        borderRadius: 2, backgroundColor: '#ef4444',
    },
    legend: {
        flexDirection: 'row', justifyContent: 'center', gap: 16,
        paddingTop: 10, paddingBottom: 4,
    },
    legendItem: { flexDirection: 'row', alignItems: 'center', gap: 5 },
    legendDot: { width: 10, height: 10, borderRadius: 5 },
    legendText: { fontSize: 11 },
});

// ─── Main Screen ─────────────────────────────────────────────────────────────
const MarriageEventBookingScreen = () => {
    const { colors, isDark } = useTheme();
    const navigation = useNavigation();
    const route = useRoute();
    // @ts-ignore
    const { packageId, packageName, totalPrice } = route.params || {};

    const [selectedDate, setSelectedDate] = useState('');
    const [notes, setNotes] = useState('');
    const [bookedDates, setBookedDates] = useState<string[]>([]);
    const [loading, setLoading] = useState(false);
    const [checkingDate, setCheckingDate] = useState(false);
    const [dateAvailable, setDateAvailable] = useState<boolean | null>(null);

    const advanceAmount = Math.ceil((totalPrice || 0) * ADVANCE_PERCENT);
    const remainingAmount = (totalPrice || 0) - advanceAmount;

    const handleDateSelect = async (date: string) => {
        if (bookedDates.includes(date)) {
            Toast.show({ type: 'error', text1: 'Date Not Available', text2: 'Already booked.' });
            return;
        }
        setSelectedDate(date);
        setDateAvailable(null);
        setCheckingDate(true);
        try {
            const res = await api.get(`/marriage-event-bookings/check-date?date=${date}`);
            setDateAvailable(res.data.available);
            if (!res.data.available) {
                setBookedDates(prev => [...new Set([...prev, date])]);
                Toast.show({ type: 'error', text1: 'Date Not Available', text2: `${date} is already booked.` });
            }
        } catch {
            setDateAvailable(true);
        } finally {
            setCheckingDate(false);
        }
    };

    const handleBookNow = async () => {
        if (!selectedDate) { Toast.show({ type: 'error', text1: 'Please select an event date' }); return; }
        if (dateAvailable === false) { Toast.show({ type: 'error', text1: 'Date not available' }); return; }

        setLoading(true);
        try {
            const bookingRes = await api.post('/marriage-event-bookings', {
                package_id: packageId, event_date: selectedDate, notes,
            });
            const booking = bookingRes.data.booking;
            const advance = bookingRes.data.advance_amount;

            const razorpayKey = await getRazorpayKey();
            const orderRes = await api.post('/payment/order', { amount: advance });
            const { id: order_id, currency, amount: rzpAmount } = orderRes.data;

            const options = {
                description: `Advance for ${packageName || 'Marriage & Event Package'}`,
                image: 'https://cdn-icons-png.flaticon.com/512/12145/12145443.png',
                currency, key: razorpayKey, amount: rzpAmount,
                name: 'RanX24 Events', order_id,
                prefill: { contact: '', email: '' },
                theme: { color: colors.primary },
            };

            RazorpayCheckout.open(options)
                .then(async (data: any) => {
                    const verifyRes = await api.post('/payment/verify', {
                        razorpay_order_id: data.razorpay_order_id,
                        razorpay_payment_id: data.razorpay_payment_id,
                        razorpay_signature: data.razorpay_signature,
                    });
                    if (verifyRes.data.success) {
                        await api.post(`/marriage-event-bookings/${booking._id}/pay-advance`, {
                            razorpay_payment_id: data.razorpay_payment_id,
                            amount_paid: advance,
                        });
                        setLoading(false);
                        // @ts-ignore
                        navigation.replace('MarriageEventBookingSuccess', {
                            booking: { ...booking, advance_paid: advance, payment_status: 'Partial Payment Paid' },
                            packageName,
                        });
                    } else {
                        setLoading(false);
                        Toast.show({ type: 'error', text1: 'Payment verification failed' });
                    }
                })
                .catch(() => {
                    setLoading(false);
                    Toast.show({ type: 'error', text1: 'Payment cancelled or failed' });
                });
        } catch (error: any) {
            setLoading(false);
            Toast.show({ type: 'error', text1: 'Booking Failed', text2: error.response?.data?.message || 'Try again' });
        }
    };

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top', 'left', 'right']}>
            <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} backgroundColor={colors.background} />

            {/* Header */}
            <View style={[styles.header, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                    <Ionicons name="arrow-back" size={24} color={colors.text} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: colors.text }]}>Book Event</Text>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
                {/* Package Info */}
                <View style={[styles.card, { backgroundColor: colors.card }]}>
                    <View style={styles.pkgRow}>
                        <View style={[styles.pkgIcon, { backgroundColor: colors.primary + '20' }]}>
                            <Ionicons name="ribbon" size={26} color={colors.primary} />
                        </View>
                        <View style={{ flex: 1 }}>
                            <Text style={[styles.pkgName, { color: colors.text }]} numberOfLines={2}>
                                {packageName || 'Marriage & Event Package'}
                            </Text>
                            <Text style={[styles.pkgPrice, { color: colors.primary }]}>
                                Total: ₹{(totalPrice || 0).toLocaleString('en-IN')}
                            </Text>
                        </View>
                    </View>
                </View>

                {/* Payment Breakdown */}
                <View style={[styles.card, { backgroundColor: isDark ? '#1a2e1a' : '#f0fdf4' }]}>
                    <Text style={[styles.cardTitle, { color: isDark ? '#4ade80' : '#166534' }]}>💰 Payment Breakdown</Text>
                    <View style={styles.billRow}>
                        <Text style={[styles.billLabel, { color: isDark ? '#86efac' : '#166534' }]}>Advance now (15%)</Text>
                        <Text style={[styles.billVal, { color: isDark ? '#4ade80' : '#16a34a' }]}>₹{advanceAmount.toLocaleString('en-IN')}</Text>
                    </View>
                    <View style={styles.billRow}>
                        <Text style={[styles.billLabel, { color: isDark ? '#86efac' : '#166534' }]}>Balance at event (85%)</Text>
                        <Text style={[styles.billVal, { color: isDark ? '#86efac' : '#166534' }]}>₹{remainingAmount.toLocaleString('en-IN')}</Text>
                    </View>
                </View>

                {/* Calendar */}
                <View style={[styles.card, { backgroundColor: colors.card }]}>
                    <Text style={[styles.cardTitle, { color: colors.text }]}>📅 Select Event Date</Text>
                    <Text style={[styles.cardSub, { color: colors.textSecondary }]}>
                        Past dates & today are disabled. Red = already booked.
                    </Text>
                    <CustomCalendar
                        selectedDate={selectedDate}
                        onSelect={handleDateSelect}
                        bookedDates={bookedDates}
                        colors={colors}
                        isDark={isDark}
                    />

                    {/* Status */}
                    {selectedDate ? (
                        checkingDate ? (
                            <View style={styles.statusRow}>
                                <ActivityIndicator size="small" color={colors.primary} />
                                <Text style={[styles.statusText, { color: colors.textSecondary }]}>Checking availability...</Text>
                            </View>
                        ) : dateAvailable === true ? (
                            <View style={styles.statusRow}>
                                <Ionicons name="checkmark-circle" size={18} color="#16a34a" />
                                <Text style={[styles.statusText, { color: '#16a34a' }]}>{selectedDate} is available!</Text>
                            </View>
                        ) : dateAvailable === false ? (
                            <View style={styles.statusRow}>
                                <Ionicons name="close-circle" size={18} color="#ef4444" />
                                <Text style={[styles.statusText, { color: '#ef4444' }]}>{selectedDate} is already booked!</Text>
                            </View>
                        ) : null
                    ) : null}
                </View>

                {/* Notes */}
                <View style={[styles.card, { backgroundColor: colors.card }]}>
                    <Text style={[styles.cardTitle, { color: colors.text }]}>📝 Special Notes (Optional)</Text>
                    <TextInput
                        style={[styles.notesInput, { backgroundColor: isDark ? '#1e293b' : '#f8fafc', borderColor: colors.border, color: colors.text }]}
                        placeholder="Guest count, special requirements..."
                        placeholderTextColor={colors.textSecondary}
                        value={notes}
                        onChangeText={setNotes}
                        multiline
                        numberOfLines={4}
                        textAlignVertical="top"
                    />
                </View>
                <View style={{ height: 120 }} />
            </ScrollView>

            {/* Bottom Bar */}
            <View style={[styles.bottomBar, { backgroundColor: colors.card, borderTopColor: colors.border }]}>
                <View>
                    <Text style={[styles.bottomLabel, { color: colors.textSecondary }]}>Advance to Pay (15%)</Text>
                    <Text style={[styles.bottomAmount, { color: colors.primary }]}>₹{advanceAmount.toLocaleString('en-IN')}</Text>
                </View>
                <TouchableOpacity
                    style={[styles.bookBtn, { backgroundColor: colors.primary },
                        (loading || !selectedDate || dateAvailable === false || checkingDate) && styles.disabledBtn]}
                    onPress={handleBookNow}
                    disabled={loading || !selectedDate || dateAvailable === false || checkingDate}
                >
                    {loading ? <ActivityIndicator color="#fff" /> : (
                        <>
                            <Ionicons name="card-outline" size={18} color="#fff" />
                            <Text style={styles.bookBtnText}>Pay & Book</Text>
                        </>
                    )}
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1 },
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16, borderBottomWidth: 1 },
    backBtn: { padding: 4 },
    headerTitle: { fontSize: 18, fontWeight: 'bold' },
    card: { margin: 16, marginBottom: 0, borderRadius: 16, padding: 16, elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 4 },
    pkgRow: { flexDirection: 'row', alignItems: 'center', gap: 14 },
    pkgIcon: { width: 52, height: 52, borderRadius: 14, justifyContent: 'center', alignItems: 'center' },
    pkgName: { fontSize: 16, fontWeight: '700', marginBottom: 4 },
    pkgPrice: { fontSize: 15, fontWeight: '600' },
    cardTitle: { fontSize: 16, fontWeight: '700', marginBottom: 6 },
    cardSub: { fontSize: 12, marginBottom: 12, lineHeight: 17 },
    billRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
    billLabel: { fontSize: 14 },
    billVal: { fontSize: 15, fontWeight: '800' },
    statusRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 12 },
    statusText: { fontSize: 13, fontWeight: '600' },
    notesInput: { borderWidth: 1, borderRadius: 12, padding: 12, fontSize: 14, minHeight: 100 },
    bottomBar: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: 16, paddingBottom: 24, borderTopWidth: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
    bottomLabel: { fontSize: 12 },
    bottomAmount: { fontSize: 22, fontWeight: '800' },
    bookBtn: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 28, paddingVertical: 14, borderRadius: 12 },
    bookBtnText: { color: '#fff', fontWeight: '700', fontSize: 16 },
    disabledBtn: { opacity: 0.5 },
});

export default MarriageEventBookingScreen;
