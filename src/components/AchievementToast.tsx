/**
 * AchievementToast
 * 
 * Animated celebration toast for new achievements.
 */

import React, { useEffect, useRef } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Animated,
    Dimensions,
} from 'react-native';

interface AchievementToastProps {
    icon: string;
    title: string;
    description: string;
    onDismiss: () => void;
    duration?: number;
}

const { width } = Dimensions.get('window');

export default function AchievementToast({
    icon,
    title,
    description,
    onDismiss,
    duration = 4000,
}: AchievementToastProps) {
    const translateY = useRef(new Animated.Value(-100)).current;
    const scale = useRef(new Animated.Value(0.8)).current;
    const opacity = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        // Slide in and scale up
        Animated.parallel([
            Animated.spring(translateY, {
                toValue: 0,
                friction: 6,
                tension: 40,
                useNativeDriver: true,
            }),
            Animated.spring(scale, {
                toValue: 1,
                friction: 6,
                tension: 40,
                useNativeDriver: true,
            }),
            Animated.timing(opacity, {
                toValue: 1,
                duration: 200,
                useNativeDriver: true,
            }),
        ]).start();

        // Auto dismiss
        const timer = setTimeout(() => {
            Animated.parallel([
                Animated.timing(translateY, {
                    toValue: -100,
                    duration: 300,
                    useNativeDriver: true,
                }),
                Animated.timing(opacity, {
                    toValue: 0,
                    duration: 300,
                    useNativeDriver: true,
                }),
            ]).start(() => onDismiss());
        }, duration);

        return () => clearTimeout(timer);
    }, []);

    return (
        <Animated.View
            style={[
                styles.container,
                {
                    transform: [
                        { translateY },
                        { scale },
                    ],
                    opacity,
                },
            ]}
        >
            <View style={styles.iconContainer}>
                <Text style={styles.icon}>{icon}</Text>
            </View>
            <View style={styles.content}>
                <Text style={styles.title}>🎉 {title}</Text>
                <Text style={styles.description}>{description}</Text>
            </View>
            <View style={styles.sparkles}>
                <Text style={styles.sparkle}>✨</Text>
            </View>
        </Animated.View>
    );
}

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        top: 50,
        left: 20,
        right: 20,
        backgroundColor: 'rgba(255, 215, 0, 0.95)',
        borderRadius: 16,
        padding: 16,
        flexDirection: 'row',
        alignItems: 'center',
        zIndex: 1000,
        shadowColor: '#FFD700',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 12,
        elevation: 10,
    },
    iconContainer: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: 'rgba(0, 0, 0, 0.1)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    icon: {
        fontSize: 28,
    },
    content: {
        flex: 1,
        marginLeft: 12,
    },
    title: {
        color: '#1A1F3D',
        fontSize: 16,
        fontWeight: 'bold',
    },
    description: {
        color: '#1A1F3D',
        fontSize: 12,
        opacity: 0.8,
        marginTop: 2,
    },
    sparkles: {
        position: 'absolute',
        right: 16,
        top: 8,
    },
    sparkle: {
        fontSize: 20,
    },
});
