import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    Image,
    TouchableOpacity,
    ActivityIndicator,
    Linking,
    StatusBar
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import api, { API_URL } from '../../services/api';
import { SPACING, SHADOWS, SIZES } from '../../constants/theme';
import { useTheme } from '../../context/ThemeContext';
import ReviewCard from '../../components/ReviewCard';
import StarRating from '../../components/StarRating';

const WorkerProfileScreen = ({ navigation, route }) => {
    const { colors, isDark } = useTheme();
    const { workerId } = route.params;
    const [worker, setWorker] = useState(null);
    const [loading, setLoading] = useState(true);
    const [reviews, setReviews] = useState([]);
    const [reviewsLoading, setReviewsLoading] = useState(false);

    useEffect(() => {
        fetchWorkerDetails();
        fetchWorkerReviews();
    }, [workerId]);

    const fetchWorkerDetails = async () => {
        try {
            const response = await api.get(`/workers/${workerId}`);
            setWorker(response.data);
        } catch (error) {
            console.error('Error fetching worker details:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchWorkerReviews = async () => {
        setReviewsLoading(true);
        try {
            const response = await api.get(`/reviews/worker/${workerId}`);
            setReviews(response.data);
        } catch (error) {
            console.error('Error fetching reviews:', error);
        } finally {
            setReviewsLoading(false);
        }
    };

    if (loading) {
        return (
            <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
                <ActivityIndicator size="large" color={colors.primary} />
            </View>
        );
    }

    if (!worker) {
        return (
            <View style={[styles.errorContainer, { backgroundColor: colors.background }]}>
                <Text style={{ color: colors.text }}>Worker not found</Text>
            </View>
        );
    }

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
            <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} backgroundColor={colors.background} />
            <ScrollView contentContainerStyle={styles.scrollContent}>
                {/* Header Image & Profile */}
                <View style={[styles.headerProfile, { backgroundColor: colors.card }]}>
                    <Image
                        source={{
                            uri: worker.profileImage
                                ? `${API_URL.replace('/api', '')}/${worker.profileImage}`
                                : "https://cdn-icons-png.flaticon.com/512/4333/4333609.png"
                        }}
                        style={[styles.profileImage, { borderColor: colors.border }]}
                    />
                    <Text style={[styles.name, { color: colors.text }]}>{worker.firstName} {worker.lastName}</Text>
                    <Text style={[styles.role, { color: colors.textSecondary }]}>Professional Worker</Text>

                    <View style={[styles.ratingContainer, { backgroundColor: isDark ? '#374151' : '#FFFBEB' }]}>
                        <Ionicons name="star" size={18} color="#F59E0B" />
                        <Text style={[styles.ratingText, { color: isDark ? '#F59E0B' : '#B45309' }]}>{worker.averageRating || 'New'}</Text>
                        <Text style={[styles.reviewCount, { color: isDark ? '#F59E0B' : '#B45309' }]}>({worker.totalReviews || 0} reviews)</Text>
                    </View>
                </View>

                {/* Stats */}
                <View style={[styles.statsContainer, { backgroundColor: colors.card }]}>
                    <View style={styles.statItem}>
                        <Text style={[styles.statValue, { color: colors.primary }]}>{worker.experience || '1+'}</Text>
                        <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Years Exp.</Text>
                    </View>
                    <View style={[styles.divider, { backgroundColor: colors.border }]} />
                    <View style={styles.statItem}>
                        <Text style={[styles.statValue, { color: colors.primary }]}>{worker.completedJobs || 0}</Text>
                        <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Jobs Done</Text>
                    </View>
                    <View style={[styles.divider, { backgroundColor: colors.border }]} />
                    <View style={styles.statItem}>
                        <Text style={[styles.statValue, { color: colors.primary }]}>{worker.city || 'N/A'}</Text>
                        <Text style={[styles.statLabel, { color: colors.textSecondary }]}>City</Text>
                    </View>
                </View>

                {/* About */}
                <View style={[styles.section, { backgroundColor: colors.card }]}>
                    <Text style={[styles.sectionTitle, { color: colors.text }]}>About</Text>
                    <Text style={[styles.aboutText, { color: colors.textSecondary }]}>
                        {worker.bio || `Hi, I am ${worker.firstName}. I am a professional worker providing high-quality services. I am dedicated to my work and ensure customer satisfaction.`}
                    </Text>
                </View>

                {/* Services */}
                <View style={[styles.section, { backgroundColor: colors.card }]}>
                    <Text style={[styles.sectionTitle, { color: colors.text }]}>Services Offered</Text>
                    <View style={styles.servicesGrid}>
                        {worker.services?.map((service, index) => (
                            <View key={index} style={[styles.serviceBadge, { backgroundColor: isDark ? 'rgba(59, 130, 246, 0.1)' : '#EFF6FF' }]}>
                                <Ionicons name="checkmark-circle" size={16} color={colors.primary} />
                                <Text style={[styles.serviceText, { color: colors.primary }]}>{service.name || service}</Text>
                            </View>
                        ))}
                    </View>
                </View>

                {/* Contact Info (If needed, or hide for privacy) */}
                {/* 
                <View style={[styles.section, { backgroundColor: colors.card }]}>
                    <Text style={[styles.sectionTitle, { color: colors.text }]}>Contact</Text>
                    <TouchableOpacity onPress={() => Linking.openURL(`tel:${worker.mobileNumber}`)} style={styles.contactRow}>
                        <Ionicons name="call" size={20} color={colors.primary} />
                        <Text style={[styles.contactText, { color: colors.text }]}>{worker.mobileNumber}</Text>
                    </TouchableOpacity>
                </View> 
                */}

                {/* Reviews Section */}
                <View style={[styles.section, { backgroundColor: colors.card }]}>
                    <View style={styles.reviewsHeader}>
                        <Text style={[styles.sectionTitle, { color: colors.text }]}>Reviews</Text>
                        {worker.averageRating > 0 && (
                            <View style={styles.avgRatingBadge}>
                                <StarRating rating={worker.averageRating} size={16} readonly />
                                <Text style={[styles.avgRatingText, { color: colors.textSecondary }]}>
                                    {worker.averageRating.toFixed(1)}
                                </Text>
                            </View>
                        )}
                    </View>

                    {reviewsLoading ? (
                        <ActivityIndicator size="small" color={colors.primary} style={{ marginVertical: 20 }} />
                    ) : reviews.length > 0 ? (
                        <View>
                            {reviews.slice(0, 5).map((review, index) => (
                                <ReviewCard
                                    key={review._id || index}
                                    userName={review.user?.name || 'Anonymous'}
                                    rating={review.rating}
                                    comment={review.comment}
                                    date={review.createdAt}
                                />
                            ))}
                            {reviews.length > 5 && (
                                <Text style={[styles.moreReviews, { color: colors.textSecondary }]}>
                                    + {reviews.length - 5} more reviews
                                </Text>
                            )}
                        </View>
                    ) : (
                        <View style={[styles.noReviews, { backgroundColor: isDark ? '#374151' : '#F8FAFC' }]}>
                            <Ionicons name="star-outline" size={32} color={colors.textLight} />
                            <Text style={[styles.noReviewsText, { color: colors.textSecondary }]}>
                                No reviews yet
                            </Text>
                        </View>
                    )}
                </View>

            </ScrollView>

            {/* Bottom Action */}
            <View style={[styles.footer, { backgroundColor: colors.card, borderTopColor: colors.border }]}>
                <TouchableOpacity
                    style={[styles.backButton, { backgroundColor: isDark ? '#374151' : '#F3F4F6' }]}
                    onPress={() => navigation.goBack()}
                >
                    <Text style={[styles.backButtonText, { color: colors.text }]}>Close</Text>
                </TouchableOpacity>
            </View>
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
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    scrollContent: {
        paddingBottom: 100,
    },
    headerProfile: {
        alignItems: 'center',
        padding: SPACING.xl,
        borderBottomLeftRadius: 30,
        borderBottomRightRadius: 30,
        ...SHADOWS.medium,
    },
    profileImage: {
        width: 120,
        height: 120,
        borderRadius: 60,
        marginBottom: SPACING.m,
        borderWidth: 4,
    },
    name: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 4,
    },
    role: {
        fontSize: 16,
        marginBottom: SPACING.m,
    },
    ratingContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
        gap: 4,
    },
    ratingText: {
        fontWeight: 'bold',
    },
    reviewCount: {
        fontSize: 12,
    },
    statsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        padding: SPACING.l,
        marginTop: SPACING.m,
        marginHorizontal: SPACING.m,
        borderRadius: 16,
        ...SHADOWS.light,
    },
    statItem: {
        alignItems: 'center',
    },
    statValue: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    statLabel: {
        fontSize: 12,
        marginTop: 4,
    },
    divider: {
        width: 1,
    },
    section: {
        padding: SPACING.l,
        marginTop: SPACING.m,
        marginHorizontal: SPACING.m,
        borderRadius: 16,
        ...SHADOWS.light,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: SPACING.m,
    },
    aboutText: {
        fontSize: 14,
        lineHeight: 22,
    },
    servicesGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    serviceBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 8,
        gap: 6,
    },
    serviceText: {
        fontWeight: '500',
        fontSize: 14,
    },
    contactRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    contactText: {
        fontSize: 16,
    },
    footer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        padding: SPACING.m,
        borderTopWidth: 1,
    },
    backButton: {
        padding: 16,
        borderRadius: 12,
        alignItems: 'center',
    },
    backButtonText: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    reviewsHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: SPACING.m,
    },
    avgRatingBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    avgRatingText: {
        fontSize: 14,
        fontWeight: '600',
    },
    noReviews: {
        alignItems: 'center',
        padding: 32,
        borderRadius: 12,
    },
    noReviewsText: {
        fontSize: 14,
        marginTop: 8,
    },
    moreReviews: {
        fontSize: 13,
        textAlign: 'center',
        marginTop: 12,
        fontStyle: 'italic',
    },
});

export default WorkerProfileScreen;
