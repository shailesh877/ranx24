import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, Image, ActivityIndicator, TextInput, StatusBar } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import axios from 'axios';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../../context/ThemeContext';
import config from '../../config/config';
import { Ionicons } from '@expo/vector-icons';

const { API_URL } = config;

const CategoryDetailScreen = () => {
    const { colors, isDark } = useTheme();
    const navigation = useNavigation();
    const route = useRoute();
    // @ts-ignore
    const { categoryId, categoryName } = route.params || {};

    const [subCategories, setSubCategories] = useState<any[]>([]);
    const [filteredSubCategories, setFilteredSubCategories] = useState<any[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (categoryId) {
            fetchSubCategories();
        }
        navigation.setOptions({ title: categoryName || 'Category' });
    }, [categoryId]);

    const fetchSubCategories = async () => {
        try {
            const response = await axios.get(`${API_URL}/categories/${categoryId}/subcategories`);
            setSubCategories(response.data);
            setFilteredSubCategories(response.data);
        } catch (error) {
            console.error('Error fetching subcategories:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (query: string) => {
        setSearchQuery(query);
        if (query.trim() === '') {
            setFilteredSubCategories(subCategories);
        } else {
            const filtered = subCategories.filter(sub =>
                sub.name.toLowerCase().includes(query.toLowerCase())
            );
            setFilteredSubCategories(filtered);
        }
    };

    const handleSubCategoryPress = (subCategory: any) => {
        // @ts-ignore
        navigation.navigate('SubCategory', {
            subCategoryId: subCategory._id,
            subCategoryName: subCategory.name,
            categoryId: categoryId
        });
    };

    const SubCategoryItem = React.memo(({ item }: { item: any }) => {
        // Robust image URL construction
        const getImageUrl = (imagePath: string) => {
            if (!imagePath) return null;
            const baseUrl = API_URL.replace('/api', '');
            const normalizedPath = imagePath.replace(/\\/g, '/');
            const cleanPath = normalizedPath.startsWith('/') ? normalizedPath.substring(1) : normalizedPath;
            return `${baseUrl}/${cleanPath}`;
        };

        return (
            <TouchableOpacity
                style={[styles.card, { backgroundColor: colors.card }]}
                onPress={() => handleSubCategoryPress(item)}
                activeOpacity={0.7}
            >
                <Image
                    source={{ uri: getImageUrl(item.image) || 'https://via.placeholder.com/150' }}
                    style={styles.image}
                    resizeMode="cover"
                />
                <View style={styles.infoContainer}>
                    <Text style={[styles.name, { color: colors.text }]}>{item.name}</Text>
                    <Text style={[styles.description, { color: colors.textSecondary }]}>
                        {item.description || 'Explore services in this category'}
                    </Text>
                    <View style={styles.arrowContainer}>
                        <Text style={[styles.exploreText, { color: colors.primary }]}>Explore</Text>
                        <Ionicons name="arrow-forward" size={16} color={colors.primary} />
                    </View>
                </View>
            </TouchableOpacity>
        );
    });

    const renderSubCategoryItem = ({ item }: any) => <SubCategoryItem item={item} />;

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
                <Text style={[styles.headerTitle, { color: colors.text }]}>{categoryName || 'Subcategories'}</Text>
                <View style={{ width: 40 }} />
            </View>

            {/* Search Bar */}
            <View style={styles.searchContainer}>
                <View style={[styles.searchBox, { backgroundColor: colors.card }]}>
                    <Ionicons name="search-outline" size={20} color={colors.textSecondary} />
                    <TextInput
                        placeholder="Search subcategories..."
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
                data={filteredSubCategories}
                renderItem={renderSubCategoryItem}
                keyExtractor={(item) => item._id}
                contentContainerStyle={styles.listContainer}
                initialNumToRender={10}
                maxToRenderPerBatch={10}
                windowSize={5}
                removeClippedSubviews={true}
                ListEmptyComponent={
                    <View style={styles.center}>
                        <Text style={{ color: colors.textSecondary }}>No subcategories found.</Text>
                    </View>
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
        flexDirection: 'row',
        borderRadius: 16,
        marginBottom: 16,
        overflow: 'hidden',
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 4,
        height: 100,
    },
    image: {
        width: 100,
        height: '100%',
    },
    infoContainer: {
        flex: 1,
        padding: 12,
        justifyContent: 'center',
    },
    name: {
        fontSize: 16,
        fontWeight: '700',
        marginBottom: 4,
    },
    description: {
        fontSize: 12,
        marginBottom: 8,
    },
    arrowContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    exploreText: {
        fontSize: 12,
        fontWeight: '600',
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

export default CategoryDetailScreen;
