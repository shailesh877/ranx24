import React from 'react';
import { View, StyleSheet, Animated } from 'react-native';

interface SkeletonLoaderProps {
    width?: number | string;
    height?: number;
    borderRadius?: number;
    style?: any;
}

export const SkeletonLoader: React.FC<SkeletonLoaderProps> = ({
    width = '100%',
    height = 100,
    borderRadius = 8,
    style,
}) => {
    const animatedValue = React.useRef(new Animated.Value(0)).current;

    React.useEffect(() => {
        Animated.loop(
            Animated.sequence([
                Animated.timing(animatedValue, {
                    toValue: 1,
                    duration: 1000,
                    useNativeDriver: true,
                }),
                Animated.timing(animatedValue, {
                    toValue: 0,
                    duration: 1000,
                    useNativeDriver: true,
                }),
            ])
        ).start();
    }, []);

    const opacity = animatedValue.interpolate({
        inputRange: [0, 1],
        outputRange: [0.3, 0.7],
    });

    return (
        <Animated.View
            style={[
                styles.skeleton,
                {
                    width,
                    height,
                    borderRadius,
                    opacity,
                },
                style,
            ]}
        />
    );
};

export const ImageSkeleton: React.FC<{ size?: number; style?: any }> = ({ size = 100, style }) => (
    <SkeletonLoader width={size} height={size} borderRadius={size / 2} style={style} />
);

export const TextSkeleton: React.FC<{ width?: number | string; style?: any }> = ({ width = '80%', style }) => (
    <SkeletonLoader width={width} height={16} borderRadius={4} style={style} />
);

export const CardSkeleton: React.FC = () => (
    <View style={styles.cardSkeleton}>
        <View style={styles.cardHeader}>
            <ImageSkeleton size={48} />
            <View style={styles.cardText}>
                <TextSkeleton width="60%" />
                <TextSkeleton width="40%" style={{ marginTop: 8 }} />
            </View>
        </View>
        <TextSkeleton width="100%" style={{ marginTop: 16 }} />
        <TextSkeleton width="90%" style={{ marginTop: 8 }} />
    </View>
);

const styles = StyleSheet.create({
    skeleton: {
        backgroundColor: '#E2E8F0',
    },
    cardSkeleton: {
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
    },
    cardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    cardText: {
        flex: 1,
        marginLeft: 12,
    },
});
