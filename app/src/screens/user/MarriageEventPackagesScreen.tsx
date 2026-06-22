import React, { useEffect, useState, useCallback } from 'react';
import {
    View, Text, FlatList, StyleSheet, TouchableOpacity,
    Image, ActivityIndicator, TextInput, StatusBar, Dimensions,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import axios from 'axios';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import config from '../../config/config';

const { API_URL } = config;
const BASE_URL = API_URL.replace('/api', '');
const { width } = Dimensions.get('window');

const MarriageEventPackagesScreen = () => {
    const { colors, isDark } = useTheme();
    const navigation = useNavigation();
    const route = useRoute();
    // @ts-ignore
    const { categoryName } = route.params || {};

    const [packages, setPackages] = useState<any[]>([]);
    const [filtered, setFiltered] = useState<any[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchPackages();
    }, []);

    // Parse images — DB stores them as JSON string: '["path1","path2"]'
    const parseImages = (raw: any): string[] => {
        if (!raw) return [];
        if (Array.isArray(raw)) return raw;
        if (typeof raw === 'string') {
            try {
                const parsed = JSON.parse(raw);
                return Array.isArray(parsed) ? parsed : [];
            } catch {
                return raw.trim() ? [raw] : [];
            }
        }
        return [];
    };

    const fetchPackages = async () => {
        try {
            const res = await axios.get(`${API_URL}/marriage-event-packages`);
            // Normalize images field for every package
            const normalized = res.data.map((p: any) => ({
                ...p,
                images: parseImages(p.images),
            }));
            setPackages(normalized);
            setFiltered(normalized);
        } catch (err) {
            console.error('Error fetching marriage packages:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (q: string) => {
        setSearchQuery(q);
        if (q.trim() === '') {
            setFiltered(packages);
        } else {
            setFiltered(packages.filter(p =>
                p.name.toLowerCase().includes(q.toLowerCase()) ||
                (p.hall_name && p.hall_name.toLowerCase().includes(q.toLowerCase()))
            ));
        }
    };

    const getImageUrl = (imgPath: string) => {
        if (!imgPath) return null;
        const clean = imgPath.replace(/\\/g, '/');
        return clean.startsWith('http') ? clean : `${BASE_URL}/${clean.replace(/^\//, '')}`;
    };

    const renderPackageCard = useCallback(({ item }: any) => {
        const firstImage = item.images && item.images.length > 0 ? getImageUrl(item.images[0]) : null;
        const discount = item.discounted_price && item.price
            ? Math.round(((item.price - item.discounted_price) / item.price) * 100)
            : 0;

        return (
            <TouchableOpacity
                style={[styles.card, { backgroundColor: colors.card }]}
                activeOpacity={0.85}
                onPress={() => {
                    // @ts-ignore
                    navigation.navigate('MarriageEventPackageDetail', { packageId: item._id });
                }}
            >
                {/* Image */}
                <View style={styles.imageWrapper}>
                    {firstImage ? (
                        <Image source={{ uri: firstImage }} style={styles.cardImage} resizeMode="cover" />
                    ) : (
                        <View style={[styles.noImage, { backgroundColor: isDark ? '#1e293b' : '#f1f5f9' }]}>
                            <Ionicons name="home-outline" size={40} color={colors.textSecondary} />
                        </View>
                    )}
                    {discount > 0 && (
                        <View style={styles.discountBadge}>
                            <Text style={styles.discountText}>{discount}% OFF</Text>
                        </View>
                    )}
                    {item.images && item.images.length > 1 && (
                        <View style={styles.photoCountBadge}>
                            <Ionicons name="images-outline" size={12} color="#fff" />
                            <Text style={styles.photoCountText}>{item.images.length}</Text>
                        </View>
                    )}
                </View>

                {/* Content */}
                <View style={styles.cardBody}>
                    <Text style={[styles.pkgName, { color: colors.text }]} numberOfLines={2}>
                        {item.name}
                    </Text>
                    {item.hall_name ? (
                        <View style={styles.hallRow}>
                            <Ionicons name="location-outline" size={13} color={colors.primary} />
                            <Text style={[styles.hallText, { color: colors.primary }]} numberOfLines={1}>
                                {item.hall_name}
                            </Text>
                        </View>
                    ) : null}

                    <View style={styles.priceRow}>
                        <Text style={[styles.discountedPrice, { color: colors.primary }]}>
                            ₹{(item.discounted_price || item.price).toLocaleString('en-IN')}
                        </Text>
                        {item.discounted_price && item.discounted_price < item.price ? (
                            <Text style={[styles.originalPrice, { color: colors.textSecondary }]}>
                                ₹{item.price.toLocaleString('en-IN')}
                            </Text>
                        ) : null}
                    </View>

                    <TouchableOpacity
                        style={[styles.viewBtn, { backgroundColor: colors.primary }]}
                        onPress={() => {
                            // @ts-ignore
                            navigation.navigate('MarriageEventPackageDetail', { packageId: item._id });
                        }}
                    >
                        <Text style={styles.viewBtnText}>View Details</Text>
                        <Ionicons name="arrow-forward" size={14} color="#fff" />
                    </TouchableOpacity>
                </View>
            </TouchableOpacity>
        );
    }, [colors, isDark, navigation]);

    if (loading) {
        return (
            <View style={[styles.center, { backgroundColor: colors.background, flex: 1 }]}>
                <ActivityIndicator size="large" color={colors.primary} />
            </View>
        );
    }

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top', 'left', 'right']}>
            <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} backgroundColor={colors.background} />

            {/* Header */}
            <View style={[styles.header, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                    <Ionicons name="arrow-back" size={24} color={colors.text} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: colors.text }]}>
                    {categoryName || 'Marriage & Event'}
                </Text>
                <View style={{ width: 40 }} />
            </View>

            {/* Search */}
            <View style={styles.searchContainer}>
                <View style={[styles.searchBox, { backgroundColor: colors.card }]}>
                    <Ionicons name="search-outline" size={20} color={colors.textSecondary} />
                    <TextInput
                        placeholder="Search packages..."
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

            {/* Count */}
            {filtered.length > 0 && (
                <Text style={[styles.countText, { color: colors.textSecondary }]}>
                    {filtered.length} package{filtered.length !== 1 ? 's' : ''} available
                </Text>
            )}

            <FlatList
                data={filtered}
                renderItem={renderPackageCard}
                keyExtractor={(item) => item._id}
                contentContainerStyle={styles.listContainer}
                showsVerticalScrollIndicator={false}
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <Ionicons name="ribbon-outline" size={60} color={colors.textSecondary} />
                        <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                            No packages found
                        </Text>
                    </View>
                }
            />
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1 },
    center: { justifyContent: 'center', alignItems: 'center' },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 16,
        borderBottomWidth: 1,
    },
    backBtn: { padding: 4 },
    headerTitle: { fontSize: 18, fontWeight: 'bold' },
    searchContainer: { padding: 16, paddingBottom: 8 },
    searchBox: {
        flexDirection: 'row',
        alignItems: 'center',
        borderRadius: 12,
        paddingHorizontal: 12,
        height: 48,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.08,
        shadowRadius: 2,
    },
    searchInput: { flex: 1, fontSize: 15, marginLeft: 8, height: '100%' },
    countText: { fontSize: 13, paddingHorizontal: 16, paddingBottom: 4, fontWeight: '500' },
    listContainer: { padding: 16, paddingTop: 8 },
    card: {
        borderRadius: 16,
        marginBottom: 20,
        overflow: 'hidden',
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.1,
        shadowRadius: 6,
    },
    imageWrapper: {
        height: 200,
        width: '100%',
        position: 'relative',
    },
    cardImage: { width: '100%', height: '100%' },
    noImage: {
        width: '100%',
        height: '100%',
        justifyContent: 'center',
        alignItems: 'center',
    },
    discountBadge: {
        position: 'absolute',
        top: 12,
        left: 12,
        backgroundColor: '#ef4444',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 20,
    },
    discountText: { color: '#fff', fontWeight: 'bold', fontSize: 12 },
    photoCountBadge: {
        position: 'absolute',
        bottom: 10,
        right: 10,
        backgroundColor: 'rgba(0,0,0,0.55)',
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
    },
    photoCountText: { color: '#fff', fontSize: 12, fontWeight: '600' },
    cardBody: { padding: 16 },
    pkgName: { fontSize: 17, fontWeight: '700', marginBottom: 6, lineHeight: 22 },
    hallRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 10 },
    hallText: { fontSize: 13, fontWeight: '500', flex: 1 },
    priceRow: { flexDirection: 'row', alignItems: 'baseline', gap: 8, marginBottom: 14 },
    discountedPrice: { fontSize: 22, fontWeight: '800' },
    originalPrice: {
        fontSize: 15,
        textDecorationLine: 'line-through',
        fontWeight: '400',
    },
    viewBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
        paddingVertical: 12,
        borderRadius: 10,
    },
    viewBtnText: { color: '#fff', fontWeight: '700', fontSize: 15 },
    emptyContainer: { alignItems: 'center', paddingTop: 80, gap: 12 },
    emptyText: { fontSize: 16, fontWeight: '500' },
});

export default MarriageEventPackagesScreen;
