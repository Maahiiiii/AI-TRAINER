/**
 * LoadingSkeleton
 * 
 * Animated placeholder component for loading states.
 */

import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, ViewStyle, DimensionValue } from 'react-native';

interface LoadingSkeletonProps {
    width?: DimensionValue;
    height?: number;
    borderRadius?: number;
    style?: ViewStyle;
}

export default function LoadingSkeleton({
    width = '100%',
    height = 20,
    borderRadius = 8,
    style,
}: LoadingSkeletonProps) {
    const shimmerAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        const shimmer = Animated.loop(
            Animated.sequence([
                Animated.timing(shimmerAnim, {
                    toValue: 1,
                    duration: 1000,
                    useNativeDriver: true,
                }),
                Animated.timing(shimmerAnim, {
                    toValue: 0,
                    duration: 1000,
                    useNativeDriver: true,
                }),
            ])
        );
        shimmer.start();
        return () => shimmer.stop();
    }, [shimmerAnim]);

    const opacity = shimmerAnim.interpolate({
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
}

// Preset loading skeletons
export function CardSkeleton() {
    return (
        <View style={styles.cardContainer}>
            <LoadingSkeleton height={120} borderRadius={16} />
            <View style={styles.cardContent}>
                <LoadingSkeleton width="60%" height={20} />
                <LoadingSkeleton width="80%" height={14} style={{ marginTop: 8 }} />
                <LoadingSkeleton width="40%" height={14} style={{ marginTop: 8 }} />
            </View>
        </View>
    );
}

export function ListItemSkeleton() {
    return (
        <View style={styles.listItem}>
            <LoadingSkeleton width={50} height={50} borderRadius={25} />
            <View style={styles.listItemContent}>
                <LoadingSkeleton width="70%" height={16} />
                <LoadingSkeleton width="50%" height={12} style={{ marginTop: 6 }} />
            </View>
        </View>
    );
}

export function StatsSkeleton() {
    return (
        <View style={styles.statsContainer}>
            {[1, 2, 3, 4].map((i) => (
                <View key={i} style={styles.statItem}>
                    <LoadingSkeleton width={60} height={30} />
                    <LoadingSkeleton width={40} height={12} style={{ marginTop: 6 }} />
                </View>
            ))}
        </View>
    );
}

const styles = StyleSheet.create({
    skeleton: {
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
    },
    cardContainer: {
        marginBottom: 16,
    },
    cardContent: {
        marginTop: 12,
    },
    listItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        borderRadius: 12,
        marginBottom: 12,
    },
    listItemContent: {
        flex: 1,
        marginLeft: 16,
    },
    statsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        padding: 16,
    },
    statItem: {
        alignItems: 'center',
    },
});
