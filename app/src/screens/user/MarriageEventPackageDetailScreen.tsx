import React, { useEffect, useState, useRef } from 'react';
import {
    View, Text, ScrollView, StyleSheet, TouchableOpacity,
    Image, ActivityIndicator, Dimensions, StatusBar, FlatList,
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

interface PackageDetail {
    _id: string;
    name: string;
    description?: string;
    price: number;
    discounted_price?: number;
    hall_name?: string;
    hall_description?: string;
    images?: string[];
    catering_details?: string;
    decoration_details?: string;
    sound_dj_details?: string;
    photography_videography_details?: string;
    makeup_details?: string;
    lighting_details?: string;
    tent_details?: string;
    mehandi_artist_details?: string;
    band_details?: string;
}

const DETAIL_ITEMS = [
    { key: 'hall_name', icon: 'business-outline', label: 'Hall / Venue' },
    { key: 'hall_description', icon: 'people-outline', label: 'Hall Capacity' },
    { key: 'catering_details', icon: 'restaurant-outline', label: 'Catering' },
    { key: 'decoration_details', icon: 'flower-outline', label: 'Decoration' },
    { key: 'sound_dj_details', icon: 'musical-notes-outline', label: 'Sound & DJ' },
    { key: 'photography_videography_details', icon: 'camera-outline', label: 'Photography & Video' },
    { key: 'makeup_details', icon: 'sparkles-outline', label: 'Makeup' },
    { key: 'lighting_details', icon: 'bulb-outline', label: 'Lighting' },
    { key: 'tent_details', icon: 'umbrella-outline', label: 'Tent' },
    { key: 'mehandi_artist_details', icon: 'color-palette-outline', label: 'Mehandi Artist' },
    { key: 'band_details', icon: 'volume-high-outline', label: 'Band / Dhol' },
] as const;

const MarriageEventPackageDetailScreen = () => {
    const { colors, isDark } = useTheme();
    const navigation = useNavigation();
    const route = useRoute();
    // @ts-ignore
    const { packageId } = route.params || {};

    const [pkg, setPkg] = useState<PackageDetail | null>(null);
    const [loading, setLoading] = useState(true);
    const [activeImageIndex, setActiveImageIndex] = useState(0);

    useEffect(() => {
        if (packageId) fetchPackage();
    }, [packageId]);

    // Parse images — DB stores them as JSON string: '["path1","path2"]'
    const parseImages = (raw: any): string[] => {
        if (!raw) return [];
        if (Array.isArray(raw)) return raw;
        if (typeof raw === 'string') {
            try {
                const parsed = JSON.parse(raw);
                return Array.isArray(parsed) ? parsed : [];
            } catch {
                // Single path string
                return raw.trim() ? [raw] : [];
            }
        }
        return [];
    };

    const fetchPackage = async () => {
        try {
            const res = await axios.get(`${API_URL}/marriage-event-packages/${packageId}`);
            const data = res.data;
            // Normalize images to array
            data.images = parseImages(data.images);
            setPkg(data);
        } catch (err) {
            console.error('Error fetching package detail:', err);
        } finally {
            setLoading(false);
        }
    };

    const getImageUrl = (imgPath: string) => {
        if (!imgPath) return null;
        const clean = imgPath.replace(/\\/g, '/');
        return clean.startsWith('http') ? clean : `${BASE_URL}/${clean.replace(/^\//, '')}`;
    };

    if (loading) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background }}>
                <ActivityIndicator size="large" color={colors.primary} />
            </View>
        );
    }

    if (!pkg) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background }}>
                <Text style={{ color: colors.textSecondary }}>Package not found</Text>
            </View>
        );
    }

    const images = pkg.images || [];
    const discount = pkg.discounted_price && pkg.price
        ? Math.round(((pkg.price - pkg.discounted_price) / pkg.price) * 100)
        : 0;

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top', 'left', 'right']}>
            <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />

            <ScrollView showsVerticalScrollIndicator={false} bounces={false}>
                {/* Image Gallery */}
                <View style={styles.galleryContainer}>
                    {images.length > 0 ? (
                        <>
                            <FlatList
                                data={images}
                                horizontal
                                pagingEnabled
                                showsHorizontalScrollIndicator={false}
                                keyExtractor={(_, i) => String(i)}
                                onMomentumScrollEnd={(e) => {
                                    const idx = Math.round(e.nativeEvent.contentOffset.x / width);
                                    setActiveImageIndex(idx);
                                }}
                                renderItem={({ item }) => (
                                    <Image
                                        source={{ uri: getImageUrl(item) || '' }}
                                        style={styles.galleryImage}
                                        resizeMode="cover"
                                    />
                                )}
                            />
                            {/* Dots */}
                            {images.length > 1 && (
                                <View style={styles.dotsRow}>
                                    {images.map((_, i) => (
                                        <View
                                            key={i}
                                            style={[
                                                styles.dot,
                                                {
                                                    backgroundColor: i === activeImageIndex ? '#fff' : 'rgba(255,255,255,0.4)',
                                                    width: i === activeImageIndex ? 20 : 8,
                                                }
                                            ]}
                                        />
                                    ))}
                                </View>
                            )}
                            {/* Photo Count */}
                            <View style={styles.imgCountBadge}>
                                <Ionicons name="images-outline" size={14} color="#fff" />
                                <Text style={styles.imgCountText}>{activeImageIndex + 1}/{images.length}</Text>
                            </View>
                        </>
                    ) : (
                        <View style={[styles.noImage, { backgroundColor: isDark ? '#1e293b' : '#f1f5f9' }]}>
                            <Ionicons name="home-outline" size={60} color={colors.textSecondary} />
                        </View>
                    )}

                    {/* Back Button */}
                    <TouchableOpacity
                        style={styles.backBtn}
                        onPress={() => navigation.goBack()}
                    >
                        <Ionicons name="arrow-back" size={22} color="#fff" />
                    </TouchableOpacity>

                    {/* Discount Badge */}
                    {discount > 0 && (
                        <View style={styles.discountBadge}>
                            <Text style={styles.discountText}>{discount}% OFF</Text>
                        </View>
                    )}
                </View>

                {/* Content */}
                <View style={[styles.contentCard, { backgroundColor: colors.card }]}>
                    {/* Name & Price */}
                    <Text style={[styles.pkgName, { color: colors.text }]}>{pkg.name}</Text>

                    <View style={styles.priceRow}>
                        <View>
                            <Text style={[styles.finalPrice, { color: colors.primary }]}>
                                ₹{(pkg.discounted_price || pkg.price).toLocaleString('en-IN')}
                            </Text>
                            {pkg.discounted_price && pkg.discounted_price < pkg.price && (
                                <Text style={[styles.origPrice, { color: colors.textSecondary }]}>
                                    ₹{pkg.price.toLocaleString('en-IN')} MRP
                                </Text>
                            )}
                        </View>
                        {discount > 0 && (
                            <View style={styles.savingsBadge}>
                                <Text style={styles.savingsText}>
                                    Save ₹{(pkg.price - (pkg.discounted_price || pkg.price)).toLocaleString('en-IN')}
                                </Text>
                            </View>
                        )}
                    </View>

                    {/* Description */}
                    {pkg.description ? (
                        <View style={styles.section}>
                            <Text style={[styles.sectionTitle, { color: colors.text }]}>About this Package</Text>
                            <Text style={[styles.descText, { color: colors.textSecondary }]}>{pkg.description}</Text>
                        </View>
                    ) : null}

                    {/* Divider */}
                    <View style={[styles.divider, { backgroundColor: colors.border }]} />

                    {/* What's Included */}
                    <Text style={[styles.sectionTitle, { color: colors.text, marginBottom: 12 }]}>
                        What's Included
                    </Text>

                    {DETAIL_ITEMS.map(({ key, icon, label }) => {
                        const value = pkg[key as keyof PackageDetail];
                        if (!value) return null;
                        return (
                            <View key={key} style={[styles.detailItem, { borderColor: colors.border }]}>
                                <View style={[styles.iconBox, { backgroundColor: colors.primary + '18' }]}>
                                    <Ionicons name={icon as any} size={20} color={colors.primary} />
                                </View>
                                <View style={styles.detailContent}>
                                    <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>{label}</Text>
                                    <Text style={[styles.detailValue, { color: colors.text }]}>{String(value)}</Text>
                                </View>
                            </View>
                        );
                    })}

                    <View style={{ height: 20 }} />
                </View>
            </ScrollView>

            {/* Bottom CTA */}
            <View style={[styles.bottomBar, { backgroundColor: colors.card, borderTopColor: colors.border }]}>
                <View>
                    <Text style={[styles.bottomPrice, { color: colors.primary }]}>
                        ₹{(pkg.discounted_price || pkg.price).toLocaleString('en-IN')}
                    </Text>
                    {pkg.discounted_price && pkg.discounted_price < pkg.price && (
                        <Text style={[styles.bottomOrigPrice, { color: colors.textSecondary }]}>
                            MRP ₹{pkg.price.toLocaleString('en-IN')}
                        </Text>
                    )}
                    <Text style={{ fontSize: 11, color: colors.textSecondary, marginTop: 2 }}>
                        15% advance at booking
                    </Text>
                </View>
                <TouchableOpacity
                    style={[styles.enquireBtn, { backgroundColor: colors.primary }]}
                    onPress={() => {
                        // @ts-ignore
                        navigation.navigate('MarriageEventBooking', {
                            packageId: pkg._id,
                            packageName: pkg.name,
                            totalPrice: pkg.discounted_price || pkg.price,
                        });
                    }}
                >
                    <Ionicons name="card-outline" size={18} color="#fff" />
                    <Text style={styles.enquireBtnText}>Book Now</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1 },
    galleryContainer: { height: 300, position: 'relative', backgroundColor: '#0f172a' },
    galleryImage: { width, height: 300 },
    noImage: { width: '100%', height: '100%', justifyContent: 'center', alignItems: 'center' },
    dotsRow: {
        position: 'absolute',
        bottom: 14,
        alignSelf: 'center',
        flexDirection: 'row',
        gap: 6,
        alignItems: 'center',
    },
    dot: {
        height: 8,
        borderRadius: 4,
        backgroundColor: '#fff',
    },
    imgCountBadge: {
        position: 'absolute',
        top: 52,
        right: 16,
        backgroundColor: 'rgba(0,0,0,0.5)',
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 20,
    },
    imgCountText: { color: '#fff', fontSize: 12, fontWeight: '600' },
    backBtn: {
        position: 'absolute',
        top: 48,
        left: 16,
        backgroundColor: 'rgba(0,0,0,0.45)',
        borderRadius: 22,
        padding: 8,
    },
    discountBadge: {
        position: 'absolute',
        bottom: 14,
        left: 16,
        backgroundColor: '#ef4444',
        paddingHorizontal: 12,
        paddingVertical: 5,
        borderRadius: 20,
    },
    discountText: { color: '#fff', fontWeight: 'bold', fontSize: 13 },
    contentCard: {
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        marginTop: -20,
        padding: 20,
        paddingTop: 24,
    },
    pkgName: { fontSize: 22, fontWeight: '800', lineHeight: 28, marginBottom: 12 },
    priceRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 },
    finalPrice: { fontSize: 26, fontWeight: '800' },
    origPrice: { fontSize: 14, textDecorationLine: 'line-through', marginTop: 2 },
    savingsBadge: {
        backgroundColor: '#dcfce7',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
    },
    savingsText: { color: '#16a34a', fontWeight: '700', fontSize: 13 },
    section: { marginBottom: 16 },
    sectionTitle: { fontSize: 17, fontWeight: '700', marginBottom: 8 },
    descText: { fontSize: 15, lineHeight: 23 },
    divider: { height: 1, marginVertical: 20 },
    detailItem: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: 14,
        paddingVertical: 12,
        borderBottomWidth: 1,
    },
    iconBox: {
        width: 44,
        height: 44,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    detailContent: { flex: 1 },
    detailLabel: { fontSize: 12, fontWeight: '600', textTransform: 'uppercase', marginBottom: 3 },
    detailValue: { fontSize: 15, fontWeight: '500', lineHeight: 21 },
    bottomBar: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 16,
        paddingBottom: 24,
        borderTopWidth: 1,
    },
    bottomPrice: { fontSize: 20, fontWeight: '800' },
    bottomOrigPrice: { fontSize: 13, textDecorationLine: 'line-through' },
    enquireBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        paddingHorizontal: 24,
        paddingVertical: 14,
        borderRadius: 12,
    },
    enquireBtnText: { color: '#fff', fontWeight: '700', fontSize: 16 },
});

export default MarriageEventPackageDetailScreen;
