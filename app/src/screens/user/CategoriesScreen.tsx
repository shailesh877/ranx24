import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    Image,
    TextInput,
    RefreshControl,
    StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import api, { API_URL } from '../../services/api';
import { useTheme } from '../../context/ThemeContext';

import { useLocation } from '../../context/LocationContext';

const CategoriesScreen = ({ navigation, route }: any) => {
    const { colors, isDark } = useTheme();
    const { location } = useLocation();
    const [categories, setCategories] = useState<any[]>([]);
    const [filteredCategories, setFilteredCategories] = useState<any[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    useEffect(() => {
        fetchCategories();
    }, [location.city]);

    useEffect(() => {
        if (searchTerm) {
            const filtered = categories.filter((cat) =>
                cat.name.toLowerCase().includes(searchTerm.toLowerCase())
            );
            setFilteredCategories(filtered);
        } else {
            setFilteredCategories(categories);
        }
    }, [searchTerm, categories]);

    const fetchCategories = async () => {
        try {
            const params = new URLSearchParams();
            if (location.latitude && location.longitude) {
                params.append('latitude', location.latitude.toString());
                params.append('longitude', location.longitude.toString());
                if (location.city) params.append('city', location.city);
            }

            const response = await api.get(`/categories?${params.toString()}`);
            setCategories(response.data);
            setFilteredCategories(response.data);
        } catch (error) {
            console.error('Error fetching categories:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const onRefresh = () => {
        setRefreshing(true);
        fetchCategories();
    };

    const handleCategoryPress = (category: any) => {
        navigation.navigate('CategoryDetail', {
            categoryId: category._id,
            categoryName: category.name,
        });
    };

    const CategoryItem = React.memo(({ item }: { item: any }) => {
        // Robust image URL construction
        const getImageUrl = (imagePath: string) => {
            if (!imagePath) return null;
            const baseUrl = API_URL.replace('/api', '');
            // Normalize path separators
            const normalizedPath = imagePath.replace(/\\/g, '/');
            // Ensure no double slashes (except http://)
            const cleanPath = normalizedPath.startsWith('/') ? normalizedPath.substring(1) : normalizedPath;
            return `${baseUrl}/${cleanPath}`;
        };

        return (
            <TouchableOpacity
                style={[styles.categoryCard, { backgroundColor: colors.card }]}
                onPress={() => handleCategoryPress(item)}
                activeOpacity={0.9}
            >
                <View style={styles.imageContainer}>
                    {item.image ? (
                        <Image
                            source={{ uri: getImageUrl(item.image) || 'https://via.placeholder.com/150' }}
                            style={styles.categoryImage}
                            resizeMode="cover"
                        />
                    ) : (
                        <View style={[styles.placeholderContainer, { backgroundColor: isDark ? '#374151' : '#F3F4F6' }]}>
                            <Ionicons name="image-outline" size={32} color={colors.textLight} />
                        </View>
                    )}
                    <View style={styles.gradientOverlay} />
                </View>
                <View style={styles.cardContent}>
                    <Text style={[styles.categoryName, { color: colors.text }]} numberOfLines={1}>
                        {item.name}
                    </Text>
                    <Text style={[styles.serviceCount, { color: colors.textSecondary }]}>
                        {item.subCategories?.length || 0} Services
                    </Text>
                </View>
            </TouchableOpacity>
        );
    });

    const renderCategory = ({ item }: any) => <CategoryItem item={item} />;

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top', 'left', 'right']}>
            <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} backgroundColor={colors.background} />

            <View style={[styles.header, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
                <Text style={[styles.headerTitle, { color: colors.text }]}>All Categories</Text>
            </View>

            <View style={styles.searchContainer}>
                <View style={[styles.searchBox, { backgroundColor: colors.card }]}>
                    <Ionicons name="search-outline" size={20} color={colors.textSecondary} />
                    <TextInput
                        style={[styles.searchInput, { color: colors.text }]}
                        placeholder="Search categories..."
                        placeholderTextColor={colors.textSecondary}
                        value={searchTerm}
                        onChangeText={setSearchTerm}
                    />
                    {searchTerm.length > 0 && (
                        <TouchableOpacity onPress={() => setSearchTerm('')}>
                            <Ionicons name="close-circle" size={20} color={colors.textSecondary} />
                        </TouchableOpacity>
                    )}
                </View>
            </View>

            <FlatList
                data={filteredCategories}
                renderItem={renderCategory}
                keyExtractor={(item) => item._id}
                numColumns={2}
                contentContainerStyle={styles.listContainer}
                columnWrapperStyle={styles.columnWrapper}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.primary]} tintColor={colors.primary} />
                }
                initialNumToRender={10}
                maxToRenderPerBatch={10}
                windowSize={5}
                removeClippedSubviews={true}
                ListEmptyComponent={
                    loading ? (
                        <View style={styles.center}>
                            <Text style={{ color: colors.textSecondary }}>Loading...</Text>
                        </View>
                    ) : (
                        <View style={styles.center}>
                            <Text style={{ color: colors.textSecondary }}>No categories found</Text>
                        </View>
                    )
                }
            />
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        padding: 16,
        borderBottomWidth: 1,
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    searchContainer: {
        padding: 16,
        paddingBottom: 8,
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
        shadowOpacity: 0.05,
        shadowRadius: 2,
    },
    searchInput: {
        flex: 1,
        fontSize: 16,
        marginLeft: 8,
        height: '100%',
    },
    listContainer: {
        padding: 12,
    },
    columnWrapper: {
        justifyContent: 'space-between',
    },
    categoryCard: {
        width: '48%',
        borderRadius: 16,
        marginBottom: 16,
        overflow: 'hidden',
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    imageContainer: {
        height: 120,
        width: '100%',
        position: 'relative',
    },
    categoryImage: {
        width: '100%',
        height: '100%',
    },
    placeholderContainer: {
        width: '100%',
        height: '100%',
        justifyContent: 'center',
        alignItems: 'center',
    },
    gradientOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.05)',
    },
    cardContent: {
        padding: 12,
        alignItems: 'center',
    },
    categoryName: {
        fontSize: 15,
        fontWeight: '700',
        textAlign: 'center',
        marginBottom: 4,
    },
    serviceCount: {
        fontSize: 12,
    },
    center: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
});

export default CategoriesScreen;
