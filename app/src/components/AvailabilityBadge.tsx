import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface AvailabilityBadgeProps {
    available: boolean;
    nextAvailableDate?: string;
    compact?: boolean;
}

const AvailabilityBadge: React.FC<AvailabilityBadgeProps> = ({
    available,
    nextAvailableDate,
    compact = false
}) => {
    if (available) {
        return (
            <View style={[styles.badge, styles.availableBadge, compact && styles.compactBadge]}>
                <Ionicons name="checkmark-circle" size={compact ? 14 : 16} color="#10B981" />
                <Text style={[styles.badgeText, styles.availableText, compact && styles.compactText]}>
                    Available
                </Text>
            </View>
        );
    }

    return (
        <View style={[styles.badge, styles.bookedBadge, compact && styles.compactBadge]}>
            <Ionicons name="close-circle" size={compact ? 14 : 16} color="#EF4444" />
            <Text style={[styles.badgeText, styles.bookedText, compact && styles.compactText]}>
                {nextAvailableDate ? `Booked (Next: ${nextAvailableDate})` : 'Booked'}
            </Text>
        </View>
    );
};

const styles = StyleSheet.create({
    badge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
        gap: 6,
    },
    compactBadge: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        gap: 4,
    },
    availableBadge: {
        backgroundColor: '#D1FAE5',
    },
    bookedBadge: {
        backgroundColor: '#FEE2E2',
    },
    badgeText: {
        fontSize: 13,
        fontWeight: '600',
    },
    compactText: {
        fontSize: 11,
    },
    availableText: {
        color: '#059669',
    },
    bookedText: {
        color: '#DC2626',
    },
});

export default AvailabilityBadge;
