import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import StarRating from './StarRating';

interface ReviewCardProps {
    userName: string;
    rating: number;
    comment: string;
    date: string;
}

const ReviewCard: React.FC<ReviewCardProps> = ({ userName, rating, comment, date }) => {
    const { colors, isDark } = useTheme();

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffTime = Math.abs(now.getTime() - date.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays === 0) return 'Today';
        if (diffDays === 1) return 'Yesterday';
        if (diffDays < 7) return `${diffDays} days ago`;
        if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
        if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
        return `${Math.floor(diffDays / 365)} years ago`;
    };

    return (
        <View style={[styles.container, { backgroundColor: colors.card, borderColor: colors.border }]}>
            {/* Header */}
            <View style={styles.header}>
                <View style={[styles.avatar, { backgroundColor: isDark ? '#374151' : '#EFF6FF' }]}>
                    <Ionicons name="person" size={20} color={colors.primary} />
                </View>
                <View style={styles.headerInfo}>
                    <Text style={[styles.userName, { color: colors.text }]}>{userName}</Text>
                    <Text style={[styles.date, { color: colors.textLight }]}>{formatDate(date)}</Text>
                </View>
            </View>

            {/* Rating */}
            <View style={styles.ratingContainer}>
                <StarRating rating={rating} size={16} readonly />
                <Text style={[styles.ratingText, { color: colors.textSecondary }]}>
                    {rating.toFixed(1)}
                </Text>
            </View>

            {/* Comment */}
            <Text style={[styles.comment, { color: colors.textSecondary }]}>{comment}</Text>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        padding: 16,
        borderRadius: 12,
        borderWidth: 1,
        marginBottom: 12,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    avatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    headerInfo: {
        flex: 1,
    },
    userName: {
        fontSize: 15,
        fontWeight: '600',
        marginBottom: 2,
    },
    date: {
        fontSize: 12,
    },
    ratingContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
        gap: 8,
    },
    ratingText: {
        fontSize: 14,
        fontWeight: '600',
    },
    comment: {
        fontSize: 14,
        lineHeight: 20,
    },
});

export default ReviewCard;
