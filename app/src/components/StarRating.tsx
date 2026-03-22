import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface StarRatingProps {
    rating: number;
    maxRating?: number;
    size?: number;
    onRatingChange?: (rating: number) => void;
    readonly?: boolean;
    color?: string;
}

const StarRating: React.FC<StarRatingProps> = ({
    rating,
    maxRating = 5,
    size = 24,
    onRatingChange,
    readonly = false,
    color = '#F59E0B',
}) => {
    const handlePress = (selectedRating: number) => {
        if (!readonly && onRatingChange) {
            onRatingChange(selectedRating);
        }
    };

    return (
        <View style={styles.container}>
            {[...Array(maxRating)].map((_, index) => {
                const starNumber = index + 1;
                const isFilled = starNumber <= rating;
                const isHalfFilled = starNumber - 0.5 === rating;

                return (
                    <TouchableOpacity
                        key={index}
                        onPress={() => handlePress(starNumber)}
                        disabled={readonly}
                        activeOpacity={readonly ? 1 : 0.7}
                    >
                        <Ionicons
                            name={
                                isFilled
                                    ? 'star'
                                    : isHalfFilled
                                        ? 'star-half'
                                        : 'star-outline'
                            }
                            size={size}
                            color={isFilled || isHalfFilled ? color : '#D1D5DB'}
                        />
                    </TouchableOpacity>
                );
            })}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
});

export default StarRating;
