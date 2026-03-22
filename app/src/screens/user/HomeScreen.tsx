import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Image,
    FlatList,
    RefreshControl,
    TextInput,
    ActivityIndicator,
    StatusBar,
    Alert,
    Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import api, { API_URL } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { HomeScreenProps } from '../../types/navigation';
import { Category, Worker, Banner } from '../../types/models';
import { handleApiError } from '../../utils/errorHandler';
import { useLocation } from '../../context/LocationContext';

const { width } = Dimensions.get('window');
const BANNER_WIDTH = width - 40;

const HomeScreen = ({ navigation }: HomeScreenProps) => {
    const { colors, isDark } = useTheme();
    const { location, detectLocation, availableCities, setCity } = useLocation();
    const [categories, setCategories] = useState<Category[]>([]);
    const [services, setServices] = useState<any[]>([]);
    const [banners, setBanners] = useState<Banner[]>([]);
    const [filteredCategories, setFilteredCategories] = useState<Category[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [refreshing, setRefreshing] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const { user } = useAuth();

    const [locationModalVisible, setLocationModalVisible] = useState(false);
    const [activeBannerIndex, setActiveBannerIndex] = useState(0);
    const bannerRef = React.useRef<FlatList>(null);

    useEffect(() => {
        fetchData();
    }, [location.city]); // Refetch when city changes

    // Auto-slide banners
    useEffect(() => {
        if (banners.length > 0) {
            const interval = setInterval(() => {
                const nextIndex = (activeBannerIndex + 1) % banners.length;
                setActiveBannerIndex(nextIndex);
                bannerRef.current?.scrollToIndex({
                    index: nextIndex,
                    animated: true,
                    viewPosition: 0.5
                });
            }, 4000);
            return () => clearInterval(interval);
        }
    }, [banners, activeBannerIndex]);

    const fetchData = async () => {
        try {
            setError(null);

            // Prepare query params
            const params = new URLSearchParams();
            if (location.city) {
                params.append('city', location.city);
            }

            const categoriesRes = await api.get(`/categories?${params.toString()}`);
            const categoriesData = categoriesRes.data as Category[];
            setCategories(categoriesData);
            setFilteredCategories(categoriesData);

            try {
                const bannersRes = await api.get('/banners/active/user-dashboard?platform=user-app');
                setBanners(bannersRes.data as Banner[]);
            } catch (bannerErr) {
                console.log('Banner fetch error:', bannerErr);
            }

            try {
                const servicesRes = await api.get(`/services?limit=5`);
                setServices(servicesRes.data || []);
            } catch (serviceErr) {
                // console.log('Services fetch error:', serviceErr);
            }
        } catch (err) {
            console.error('Data fetch error:', err);
            handleApiError(err);
            setError('Failed to load data');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const handleSearch = (query: string) => {
        setSearchQuery(query);
        if (query.trim() === '') {
            setFilteredCategories(categories);
        } else {
            const filtered = categories.filter(cat =>
                cat.name.toLowerCase().includes(query.toLowerCase())
            );
            setFilteredCategories(filtered);
        }
    };

    const onRefresh = () => {
        setRefreshing(true);
        // detectLocation(); // Don't auto-detect on simple refresh unless needed
        fetchData();
    };

    const renderCategory = ({ item }: { item: Category }) => (
        <TouchableOpacity
            style={[styles.categoryCard, { backgroundColor: colors.card, shadowColor: isDark ? '#000' : colors.primary }]}
            onPress={() => navigation.navigate('CategoryDetail', { categoryId: item._id, categoryName: item.name })}
            activeOpacity={0.7}
        >
            <View style={[styles.categoryIconContainer, { backgroundColor: isDark ? '#374151' : '#FDF4E3' }]}>
                <Image
                    source={{ uri: item.image ? `${API_URL.replace('/api', '')}/${item.image.replace(/\\/g, '/')}` : 'https://via.placeholder.com/150' }}
                    style={styles.categoryIcon}
                />
            </View>
            <Text style={[styles.categoryText, { color: colors.text }]} numberOfLines={1}>{item.name}</Text>
        </TouchableOpacity>
    );

    const renderService = ({ item }: { item: any }) => (
        <TouchableOpacity
            style={[styles.workerCard, { backgroundColor: colors.card }]}
            onPress={() => {
                navigation.navigate('Booking', {
                    serviceId: item._id,
                    serviceName: item.name,
                    categoryName: item.category?.name || 'Service',
                    singleWorkerId: item._id, // Keep for fallback or reference
                    basePrice: item.basePrice || 500, // <--- Added basePrice
                    mode: 'service-booking' // <--- New flag
                });
            }}
            activeOpacity={0.8}
        >
            <Image
                source={{ uri: item.image ? `${API_URL.replace('/api', '')}/${item.image.replace(/\\/g, '/')}` : 'https://via.placeholder.com/150' }}
                style={styles.workerImage}
            />
            <View style={styles.workerInfo}>
                <Text style={[styles.workerName, { color: colors.text }]} numberOfLines={1}>
                    {item.name}
                </Text>
                <Text style={[styles.workerRole, { color: colors.textSecondary }]} numberOfLines={1}>
                    {item.category?.name || "Service"}
                </Text>
                <View style={styles.ratingContainer}>
                    <Text style={[styles.ratingText, { color: colors.primary }]}>
                        ₹{item.basePrice}
                    </Text>
                </View>
            </View>
        </TouchableOpacity>
    );

    if (loading && !refreshing) {
        return (
            <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
                <ActivityIndicator size="large" color={colors.primary} />
                <Text style={[styles.loadingText, { color: colors.textSecondary }]}>Loading services...</Text>
            </View>
        );
    }

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top', 'left', 'right']}>
            <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} backgroundColor={colors.background} />

            {/* Modern Header */}
            <View style={[styles.header, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
                <View style={styles.headerLeft}>
                    <Text style={[styles.greeting, { color: colors.text }]}>Hello, {user?.name || 'Guest'}! 👋</Text>
                    <TouchableOpacity
                        style={styles.locationButton}
                        onPress={() => setLocationModalVisible(true)}
                        activeOpacity={0.7}
                    >
                        <Ionicons name="location" size={16} color={colors.primary} />
                        <Text style={[styles.locationText, { color: colors.textSecondary }]} numberOfLines={1}>
                            {location.city ? location.city : "Select Location"}
                        </Text>
                        <Ionicons name="chevron-down" size={14} color={colors.textLight} />
                    </TouchableOpacity>
                </View>
                <View style={styles.headerRight}>
                    <TouchableOpacity
                        style={[styles.iconButton, { backgroundColor: isDark ? '#374151' : '#F8FAFC' }]}
                        onPress={() => navigation.navigate('Notifications')}
                    >
                        <Ionicons name="notifications-outline" size={24} color={colors.text} />
                        <View style={styles.notificationBadge} />
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.iconButton, { backgroundColor: isDark ? '#374151' : '#F8FAFC' }]}
                        onPress={() => navigation.navigate('Cart')}
                    >
                        <Ionicons name="cart-outline" size={24} color={colors.text} />
                    </TouchableOpacity>
                </View>
            </View>

            <ScrollView
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        colors={[colors.primary]}
                        tintColor={colors.primary}
                    />
                }
                contentContainerStyle={styles.scrollContent}
            >
                {/* Modern Search Bar */}
                <View style={styles.searchContainer}>
                    <View style={[styles.searchBox, { backgroundColor: colors.card, borderColor: colors.border, borderWidth: isDark ? 0 : 1 }]}>
                        <Ionicons name="search-outline" size={20} color={colors.primary} />
                        <TextInput
                            placeholder="Search for 'Plumber' or 'AC Service'..."
                            placeholderTextColor={colors.textLight}
                            style={[styles.searchInput, { color: colors.text }]}
                            value={searchQuery}
                            onChangeText={handleSearch}
                        />
                        {searchQuery.length > 0 && (
                            <TouchableOpacity onPress={() => handleSearch('')}>
                                <Ionicons name="close-circle" size={20} color={colors.textLight} />
                            </TouchableOpacity>
                        )}
                    </View>
                </View>

                {/* Error Display */}
                {error && (
                    <View style={[styles.errorContainer, { backgroundColor: isDark ? '#78350F' : '#FEF2F2' }]}>
                        <Ionicons name="alert-circle" size={24} color={colors.error} />
                        <View style={styles.errorContent}>
                            <Text style={[styles.errorText, { color: colors.error }]}>{error}</Text>
                            <TouchableOpacity onPress={fetchData}>
                                <Text style={[styles.retryText, { color: colors.primary }]}>Tap to retry</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                )}

                {/* Banners */}
                {banners.length > 0 && (
                    <View>
                        <FlatList
                            ref={bannerRef}
                            data={banners}
                            horizontal
                            snapToInterval={BANNER_WIDTH + 20}
                            decelerationRate="fast"
                            showsHorizontalScrollIndicator={false}
                            keyExtractor={(item) => item._id}
                            onMomentumScrollEnd={(e) => {
                                const index = Math.round(e.nativeEvent.contentOffset.x / BANNER_WIDTH);
                                setActiveBannerIndex(index);
                            }}
                            renderItem={({ item }) => (
                                <View style={styles.bannerWrapper}>
                                    <Image
                                        source={{ uri: item.image ? `${API_URL.replace('/api', '')}/${item.image.replace(/\\/g, '/')}` : 'https://via.placeholder.com/150' }}
                                        style={styles.bannerImage}
                                        resizeMode="stretch"
                                    />
                                </View>
                            )}
                            contentContainerStyle={styles.bannerList}
                        />
                        {/* Pagination Dots */}
                        <View style={styles.dotContainer}>
                            {banners.map((_, index) => (
                                <View
                                    key={index}
                                    style={[
                                        styles.dot,
                                        { backgroundColor: index === activeBannerIndex ? colors.primary : colors.textLight },
                                        index === activeBannerIndex && styles.activeDot
                                    ]}
                                />
                            ))}
                        </View>
                    </View>
                )}

                {/* Categories Section */}
                <View style={styles.sectionHeader}>
                    <Text style={[styles.sectionTitle, { color: colors.text }]}>Services</Text>
                    <TouchableOpacity onPress={() => navigation.navigate('Categories')}>
                        <Text style={[styles.seeAllText, { color: colors.primary }]}>See All →</Text>
                    </TouchableOpacity>
                </View>

                {filteredCategories.length > 0 ? (
                    <View style={styles.categoryGrid}>
                        {filteredCategories.slice(0, 8).map((item) => (
                            <View key={item._id} style={styles.categoryWrapper}>
                                {renderCategory({ item })}
                            </View>
                        ))}
                    </View>
                ) : (
                    <View style={styles.emptyState}>
                        <Ionicons name="location-outline" size={48} color={colors.textLight} />
                        <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                            {location.city ? `No services in ${location.city}` : "Please select a city"}
                        </Text>
                        <Text style={[styles.emptySubtext, { color: colors.textLight, textAlign: 'center', marginHorizontal: 20 }]}>
                            {location.city ? "We are not available in your area yet." : "Select your city to see available services."}
                        </Text>
                    </View>
                )}

                {/* Popular Services */}
                {categories.length > 0 && services.length > 0 && (
                    <>
                        <View style={styles.sectionHeader}>
                            <Text style={[styles.sectionTitle, { color: colors.text }]}>Popular Services</Text>
                            <TouchableOpacity onPress={() => navigation.navigate('Categories')}>
                                <Text style={[styles.seeAllText, { color: colors.primary }]}>View All →</Text>
                            </TouchableOpacity>
                        </View>

                        <FlatList
                            data={services}
                            horizontal
                            showsHorizontalScrollIndicator={false}
                            keyExtractor={(item) => item._id}
                            renderItem={renderService}
                            contentContainerStyle={styles.workerList}
                        />
                    </>
                )}

                <View style={{ height: 20 }} />
            </ScrollView>

            {/* Location Selection Modal */}
            {locationModalVisible && (
                <View style={styles.modalOverlay}>
                    <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
                        <Text style={[styles.modalTitle, { color: colors.text }]}>Select Location</Text>

                        <TouchableOpacity
                            style={styles.modalOption}
                            onPress={() => {
                                detectLocation();
                                setLocationModalVisible(false);
                            }}
                        >
                            <View style={[styles.modalIcon, { backgroundColor: isDark ? '#1E3A8A' : '#EFF6FF' }]}>
                                <Ionicons name="locate" size={20} color={colors.primary} />
                            </View>
                            <Text style={[styles.modalOptionText, { color: colors.text }]}>Detect Current Location</Text>
                        </TouchableOpacity>

                        <View style={{ height: 1, backgroundColor: colors.border, marginVertical: 8 }} />
                        <Text style={{ marginLeft: 8, marginBottom: 8, color: colors.textSecondary, fontSize: 13 }}>Available Cities</Text>

                        <FlatList
                            data={availableCities}
                            keyExtractor={(item) => item._id}
                            renderItem={({ item }) => (
                                <TouchableOpacity
                                    style={styles.modalOption}
                                    onPress={() => {
                                        setCity(item.name);
                                        setLocationModalVisible(false);
                                    }}
                                >
                                    <View style={[styles.modalIcon, { backgroundColor: isDark ? '#064E3B' : '#ECFDF5' }]}>
                                        <Ionicons name="location-outline" size={20} color="#10B981" />
                                    </View>
                                    <View>
                                        <Text style={[styles.modalOptionText, { color: colors.text }]}>{item.name}</Text>
                                        {item.state && <Text style={{ fontSize: 12, color: colors.textSecondary }}>{item.state}</Text>}
                                    </View>
                                    {location.city === item.name && (
                                        <Ionicons name="checkmark-circle" size={20} color={colors.primary} style={{ marginLeft: 'auto' }} />
                                    )}
                                </TouchableOpacity>
                            )}
                            style={{ maxHeight: 300 }}
                        />

                        <TouchableOpacity
                            style={styles.closeButton}
                            onPress={() => setLocationModalVisible(false)}
                        >
                            <Text style={[styles.closeButtonText, { color: colors.textSecondary }]}>Cancel</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            )}
        </SafeAreaView>
    );
};
const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        marginTop: 12,
        fontSize: 14,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 16,
        borderBottomWidth: 1,
    },
    headerLeft: {
        flex: 1,
    },
    headerRight: {
        flexDirection: 'row',
        gap: 12,
    },
    greeting: {
        fontSize: 20,
        fontWeight: '700',
        marginBottom: 4,
    },
    locationButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    locationText: {
        fontSize: 13,
        maxWidth: 150,
    },
    iconButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        position: 'relative',
    },
    notificationBadge: {
        position: 'absolute',
        top: 8,
        right: 8,
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: '#EF4444',
    },
    scrollContent: {
        paddingBottom: 20,
    },
    searchContainer: {
        paddingHorizontal: 20,
        paddingVertical: 16,
    },
    searchBox: {
        flexDirection: 'row',
        alignItems: 'center',
        borderRadius: 12,
        paddingHorizontal: 16,
        height: 50,
        gap: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    searchInput: {
        flex: 1,
        fontSize: 15,
    },
    errorContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginHorizontal: 20,
        marginBottom: 16,
        padding: 16,
        borderRadius: 12,
        gap: 12,
    },
    errorContent: {
        flex: 1,
    },
    errorText: {
        fontSize: 14,
        fontWeight: '500',
        marginBottom: 4,
    },
    retryText: {
        fontSize: 13,
        fontWeight: '600',
    },
    bannerList: {
        paddingHorizontal: 20,
    },
    bannerWrapper: {
        width: BANNER_WIDTH,
        marginRight: 20,
    },
    bannerImage: {
        width: '100%',
        height: 160,
        borderRadius: 16,
    },
    dotContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 12,
        gap: 6,
    },
    dot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        opacity: 0.5,
    },
    activeDot: {
        width: 20,
        opacity: 1,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        marginTop: 24,
        marginBottom: 16,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '700',
    },
    seeAllText: {
        fontSize: 14,
        fontWeight: '600',
    },
    categoryGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        paddingHorizontal: 12,
    },
    categoryWrapper: {
        width: '25%',
        padding: 8,
    },
    categoryCard: {
        alignItems: 'center',
        borderRadius: 16,
        padding: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    categoryIconContainer: {
        width: 56,
        height: 56,
        borderRadius: 28,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 8,
    },
    categoryIcon: {
        width: 32,
        height: 32,
    },
    categoryText: {
        fontSize: 11,
        fontWeight: '600',
        textAlign: 'center',
    },
    emptyState: {
        alignItems: 'center',
        paddingVertical: 40,
    },
    emptyText: {
        fontSize: 16,
        fontWeight: '600',
        marginTop: 12,
    },
    emptySubtext: {
        fontSize: 13,
        marginTop: 4,
    },
    workerList: {
        paddingHorizontal: 20,
        gap: 12,
    },
    workerCard: {
        width: 160,
        borderRadius: 16,
        padding: 12,
        marginRight: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
        elevation: 3,
    },
    workerImage: {
        width: '100%',
        height: 120,
        borderRadius: 12,
        marginBottom: 12,
    },
    workerInfo: {
        gap: 4,
    },
    workerName: {
        fontSize: 14,
        fontWeight: '700',
    },
    workerRole: {
        fontSize: 12,
    },
    ratingContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        marginTop: 4,
    },
    ratingText: {
        fontSize: 12,
        fontWeight: '600',
    },
    reviewCount: {
        fontSize: 11,
    },
    quickActions: {
        flexDirection: 'row',
        paddingHorizontal: 20,
        gap: 12,
    },
    actionCard: {
        flex: 1,
        alignItems: 'center',
        borderRadius: 16,
        padding: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    actionIcon: {
        width: 48,
        height: 48,
        borderRadius: 24,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 8,
    },
    actionText: {
        fontSize: 12,
        fontWeight: '600',
    },
    modalOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        padding: 24,
        paddingBottom: 40,
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: '700',
        marginBottom: 20,
        textAlign: 'center',
    },
    modalOption: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(0,0,0,0.05)',
    },
    modalIcon: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    modalOptionText: {
        fontSize: 16,
        fontWeight: '500',
    },
    closeButton: {
        marginTop: 20,
        alignItems: 'center',
        paddingVertical: 12,
    },
    closeButtonText: {
        fontSize: 16,
        fontWeight: '600',
    },
});

export default HomeScreen;
