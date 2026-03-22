import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, Image, ActivityIndicator, Modal, ScrollView, Alert, TextInput, StatusBar } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import axios from 'axios';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import { useCart } from '../../context/CartContext';
import config from '../../config/config';

const { API_URL } = config;

const SubCategoryScreen = () => {
    const { colors, isDark } = useTheme();
    const navigation = useNavigation();
    const route = useRoute();
    const { addToCart } = useCart();

    // @ts-ignore
    const { subCategoryId, subCategoryName, categoryId } = route.params || {};

    const [services, setServices] = useState<any[]>([]);
    const [filteredServices, setFilteredServices] = useState<any[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [loading, setLoading] = useState(true);

    // Booking Modal State
    const [modalVisible, setModalVisible] = useState(false);
    const [selectedService, setSelectedService] = useState<any>(null);
    const [selectedDate, setSelectedDate] = useState<Date>(new Date());
    const [selectedTime, setSelectedTime] = useState<string>('10:00 AM');

    // Description Modal State
    const [descriptionModalVisible, setDescriptionModalVisible] = useState(false);
    const [selectedDescService, setSelectedDescService] = useState<any>(null);

    useEffect(() => {
        if (subCategoryId) {
            fetchServices();
        }
        navigation.setOptions({ title: subCategoryName || 'Services' });
    }, [subCategoryId]);

    const fetchServices = async () => {
        try {
            const response = await axios.get(`${API_URL}/services?subCategory=${subCategoryId}`);
            setServices(response.data);
            setFilteredServices(response.data);
        } catch (error) {
            console.error('Error fetching services:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (query: string) => {
        setSearchQuery(query);
        if (query.trim() === '') {
            setFilteredServices(services);
        } else {
            const filtered = services.filter(service =>
                service.name.toLowerCase().includes(query.toLowerCase())
            );
            setFilteredServices(filtered);
        }
    };

    const handleAddToCart = async (item: any) => {
        try {
            await addToCart({
                serviceId: item._id,
                service: item.name,
                category: item.category?.name || 'Service',
                price: item.basePrice,
                quantity: 1,
                image: item.image
            });
        } catch (error) {
            console.error('Add to cart error', error);
        }
    };

    const openBookingModal = (item: any) => {
        setSelectedService(item);
        setModalVisible(true);
    };

    const handleConfirmBooking = () => {
        setModalVisible(false);
        // @ts-ignore
        navigation.navigate('Checkout', {
            directBooking: {
                serviceId: selectedService._id,
                service: selectedService.name,
                category: selectedService.category?.name || 'Service',
                price: selectedService.basePrice,
                bookingDate: selectedDate.toISOString(),
                bookingTime: selectedTime,
                days: 1,
                bookingType: 'full-day', // Defaulting to full-day as per backend requirement, but UI hides it
                image: selectedService.image
            }
        });
    };

    // Generate next 7 days
    const getNextDays = () => {
        const days = [];
        for (let i = 0; i < 7; i++) {
            const d = new Date();
            d.setDate(d.getDate() + i);
            days.push(d);
        }
        return days;
    };

    const timeSlots = [
        '09:00 AM', '10:00 AM', '11:00 AM', '12:00 PM',
        '01:00 PM', '02:00 PM', '03:00 PM', '04:00 PM',
        '05:00 PM', '06:00 PM', '07:00 PM', '08:00 PM'
    ];

    const renderServiceItem = ({ item }: any) => (
        <View style={[styles.card, { backgroundColor: colors.card }]}>
            <TouchableOpacity
                style={styles.cardContent}
                onPress={() => openBookingModal(item)}
            >
                <Image
                    source={{ uri: item.image ? `${API_URL.replace('/api', '')}/${item.image.replace(/\\/g, '/')}` : 'https://via.placeholder.com/150' }}
                    style={styles.image}
                />
                <View style={styles.infoContainer}>
                    <Text style={[styles.name, { color: colors.text }]}>{item.name}</Text>
                    <Text style={[styles.price, { color: colors.primary }]}>₹{item.basePrice} / {item.priceUnit}</Text>
                    <Text style={[styles.description, { color: colors.textSecondary }]}>
                        {item.description?.length > 80 ? (
                            <>
                                {item.description.substring(0, 80)}...
                                <Text
                                    style={{ color: colors.primary, fontWeight: 'bold' }}
                                    onPress={() => {
                                        setSelectedDescService(item);
                                        setDescriptionModalVisible(true);
                                    }}
                                >
                                    See More
                                </Text>
                            </>
                        ) : item.description}
                    </Text>
                </View>
            </TouchableOpacity>

            {/* Action Buttons */}
            <View style={[styles.actionContainer, { borderTopColor: colors.border }]}>
                <TouchableOpacity
                    style={[styles.actionBtn, styles.cartBtn, { borderColor: colors.primary }]}
                    onPress={() => handleAddToCart(item)}
                >
                    <Ionicons name="cart-outline" size={18} color={colors.primary} />
                    <Text style={[styles.actionBtnText, { color: colors.primary }]}>Add to Cart</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.actionBtn, styles.bookBtn, { backgroundColor: colors.primary }]}
                    onPress={() => openBookingModal(item)}
                >
                    <Text style={[styles.actionBtnText, { color: '#FFF' }]}>Book Now</Text>
                </TouchableOpacity>
            </View>
        </View>
    );

    if (loading) {
        return (
            <View style={[styles.container, styles.center, { backgroundColor: colors.background }]}>
                <ActivityIndicator size="large" color={colors.primary} />
            </View>
        );
    }

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top', 'left', 'right']}>
            <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} backgroundColor={colors.background} />
            {/* Custom Header */}
            <View style={[styles.header, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color={colors.text} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: colors.text }]}>{subCategoryName || 'Services'}</Text>
                <View style={{ width: 40 }} />
            </View>

            {/* Search Bar */}
            <View style={styles.searchContainer}>
                <View style={[styles.searchBox, { backgroundColor: colors.card }]}>
                    <Ionicons name="search-outline" size={20} color={colors.textSecondary} />
                    <TextInput
                        placeholder="Search services..."
                        placeholderTextColor={colors.textSecondary}
                        style={[styles.searchInput, { color: colors.text }]}
                        value={searchQuery}
                        onChangeText={handleSearch}
                    />
                    {searchQuery.length > 0 && (
                        <TouchableOpacity onPress={() => handleSearch('')}>
                            <Ionicons name="close-circle" size={20} color={colors.textSecondary} />
                        </TouchableOpacity>
                    )}
                </View>
            </View>

            <FlatList
                data={filteredServices}
                renderItem={renderServiceItem}
                keyExtractor={(item) => item._id}
                contentContainerStyle={styles.listContainer}
                initialNumToRender={10}
                maxToRenderPerBatch={10}
                windowSize={5}
                removeClippedSubviews={true}
                ListEmptyComponent={
                    <View style={styles.center}>
                        <Text style={{ color: colors.textSecondary }}>No services found.</Text>
                    </View>
                }
            />

            {/* Booking Modal */}
            <Modal
                animationType="slide"
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => setModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
                        <View style={styles.modalHeader}>
                            <Text style={[styles.modalTitle, { color: colors.text }]}>Select Date & Time</Text>
                            <TouchableOpacity onPress={() => setModalVisible(false)}>
                                <Ionicons name="close" size={24} color={colors.textSecondary} />
                            </TouchableOpacity>
                        </View>

                        <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>Preferred Date</Text>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.dateScroll}>
                            {getNextDays().map((date, index) => {
                                const isSelected = date.toDateString() === selectedDate.toDateString();
                                return (
                                    <TouchableOpacity
                                        key={index}
                                        style={[
                                            styles.dateChip,
                                            { backgroundColor: isSelected ? colors.primary : (isDark ? '#374151' : '#F3F4F6') }
                                        ]}
                                        onPress={() => setSelectedDate(date)}
                                    >
                                        <Text style={[styles.dayText, { color: isSelected ? '#FFF' : colors.textSecondary }]}>
                                            {date.toLocaleDateString('en-US', { weekday: 'short' })}
                                        </Text>
                                        <Text style={[styles.dateText, { color: isSelected ? '#FFF' : colors.text }]}>
                                            {date.getDate()}
                                        </Text>
                                    </TouchableOpacity>
                                );
                            })}
                        </ScrollView>

                        <Text style={[styles.sectionLabel, { color: colors.textSecondary, marginTop: 16 }]}>Preferred Time</Text>
                        <View style={styles.timeGrid}>
                            {timeSlots.map((time, index) => {
                                const isSelected = time === selectedTime;
                                return (
                                    <TouchableOpacity
                                        key={index}
                                        style={[
                                            styles.timeChip,
                                            { backgroundColor: isSelected ? colors.primary : (isDark ? '#374151' : '#F3F4F6') }
                                        ]}
                                        onPress={() => setSelectedTime(time)}
                                    >
                                        <Text style={[styles.timeText, { color: isSelected ? '#FFF' : colors.text }]}>
                                            {time}
                                        </Text>
                                    </TouchableOpacity>
                                );
                            })}
                        </View>

                        <TouchableOpacity
                            style={[styles.confirmBtn, { backgroundColor: colors.primary }]}
                            onPress={handleConfirmBooking}
                        >
                            <Text style={styles.confirmBtnText}>Proceed to Checkout</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
            {/* Description Modal */}
            <Modal
                animationType="fade"
                transparent={true}
                visible={descriptionModalVisible}
                onRequestClose={() => setDescriptionModalVisible(false)}
            >
                <View style={[styles.modalOverlay, { justifyContent: 'center', padding: 20 }]}>
                    <View style={[styles.modalContent, { backgroundColor: colors.card, borderRadius: 20, maxHeight: '70%', padding: 0 }]}>
                        {selectedDescService && (
                            <>
                                <View style={{ height: 200, width: '100%' }}>
                                    <Image
                                        source={{
                                            uri: selectedDescService.image
                                                ? `${API_URL.replace('/api', '')}/${selectedDescService.image.replace(/\\/g, '/')}`
                                                : 'https://via.placeholder.com/150'
                                        }}
                                        style={{ width: '100%', height: '100%' }}
                                        resizeMode="cover"
                                    />
                                    <TouchableOpacity
                                        style={{ position: 'absolute', top: 15, right: 15, backgroundColor: 'rgba(0,0,0,0.5)', borderRadius: 20, padding: 5 }}
                                        onPress={() => setDescriptionModalVisible(false)}
                                    >
                                        <Ionicons name="close" size={24} color="#FFF" />
                                    </TouchableOpacity>
                                </View>

                                <ScrollView style={{ padding: 20 }}>
                                    <Text style={[styles.modalTitle, { color: colors.text, marginBottom: 8 }]}>{selectedDescService.name}</Text>
                                    <View style={{ flexDirection: 'row', marginBottom: 16 }}>
                                        <View style={{ backgroundColor: colors.primary + '20', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 }}>
                                            <Text style={{ color: colors.primary, fontWeight: '700', fontSize: 12 }}>
                                                ₹{selectedDescService.basePrice} / {selectedDescService.priceUnit}
                                            </Text>
                                        </View>
                                    </View>

                                    <Text style={{ fontSize: 12, fontWeight: '700', color: colors.textSecondary, textTransform: 'uppercase', marginBottom: 8 }}>
                                        Description
                                    </Text>
                                    <Text style={{ fontSize: 16, lineHeight: 24, color: colors.text, marginBottom: 30 }}>
                                        {selectedDescService.description}
                                    </Text>

                                    <TouchableOpacity
                                        style={[styles.bookBtn, { backgroundColor: colors.primary, padding: 16, borderRadius: 12, alignItems: 'center', marginBottom: 20 }]}
                                        onPress={() => {
                                            setDescriptionModalVisible(false);
                                            openBookingModal(selectedDescService);
                                        }}
                                    >
                                        <Text style={{ color: '#FFF', fontWeight: 'bold', fontSize: 16 }}>Book Now</Text>
                                    </TouchableOpacity>
                                </ScrollView>
                            </>
                        )}
                    </View>
                </View>
            </Modal>
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
        padding: 16,
        borderBottomWidth: 1,
    },
    backButton: {
        padding: 4,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    center: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    listContainer: {
        padding: 16,
    },
    card: {
        borderRadius: 12,
        marginBottom: 16,
        overflow: 'hidden',
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    cardContent: {
        flexDirection: 'row',
    },
    image: {
        width: 100,
        height: 100,
    },
    infoContainer: {
        flex: 1,
        padding: 12,
        justifyContent: 'center',
    },
    name: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 4,
    },
    price: {
        fontSize: 14,
        fontWeight: '600',
        marginBottom: 4,
    },
    description: {
        fontSize: 12,
    },
    actionContainer: {
        flexDirection: 'row',
        padding: 12,
        borderTopWidth: 1,
        gap: 12,
    },
    actionBtn: {
        flex: 1,
        paddingVertical: 10,
        borderRadius: 8,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 6,
    },
    cartBtn: {
        borderWidth: 1,
        backgroundColor: 'transparent',
    },
    bookBtn: {
        // backgroundColor set inline
    },
    actionBtnText: {
        fontSize: 14,
        fontWeight: '600',
    },
    // Modal Styles
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        padding: 20,
        paddingBottom: 40,
        maxHeight: '80%',
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    sectionLabel: {
        fontSize: 14,
        fontWeight: '600',
        marginBottom: 12,
    },
    dateScroll: {
        marginBottom: 20,
    },
    dateChip: {
        width: 60,
        height: 70,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 10,
    },
    dayText: {
        fontSize: 12,
        marginBottom: 4,
    },
    dateText: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    timeGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 10,
        marginBottom: 24,
    },
    timeChip: {
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 8,
        minWidth: '30%',
        alignItems: 'center',
    },
    timeText: {
        fontSize: 13,
        fontWeight: '500',
    },
    confirmBtn: {
        paddingVertical: 16,
        borderRadius: 12,
        alignItems: 'center',
    },
    confirmBtnText: {
        color: '#FFF',
        fontSize: 16,
        fontWeight: 'bold',
    },
    searchContainer: {
        padding: 16,
        paddingBottom: 0,
    },
    searchBox: {
        flexDirection: 'row',
        alignItems: 'center',
        borderRadius: 12,
        paddingHorizontal: 12,
        height: 48,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
    },
    searchInput: {
        flex: 1,
        fontSize: 16,
        height: '100%',
        marginLeft: 8,
    },
});

export default SubCategoryScreen;
