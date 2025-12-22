/**
 * MotivationalTip
 * 
 * Rotating motivational quotes and fitness tips.
 */

import React, { useState, useEffect, useRef } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Animated,
} from 'react-native';

const TIPS = [
    { icon: '💪', text: 'Consistency beats intensity. Show up every day!' },
    { icon: '🎯', text: 'Focus on form, not speed. Quality over quantity.' },
    { icon: '🔥', text: 'Push yourself. No one else will do it for you.' },
    { icon: '⚡', text: 'Rest when you need to, but never quit.' },
    { icon: '🏆', text: 'Every rep brings you closer to your goals.' },
    { icon: '💯', text: 'Progress, not perfection. Keep moving forward.' },
    { icon: '🌟', text: 'Your only limit is your mind. Break through!' },
    { icon: '🚀', text: 'Start strong, finish stronger.' },
    { icon: '💎', text: 'Sweat today, shine tomorrow.' },
    { icon: '🎖️', text: 'Champions train when others rest.' },
];

interface MotivationalTipProps {
    autoRotate?: boolean;
    rotateInterval?: number; // milliseconds
}

export default function MotivationalTip({
    autoRotate = true,
    rotateInterval = 8000
}: MotivationalTipProps) {
    const [currentIndex, setCurrentIndex] = useState(
        Math.floor(Math.random() * TIPS.length)
    );
    const fadeAnim = useRef(new Animated.Value(1)).current;

    useEffect(() => {
        if (!autoRotate) return;

        const interval = setInterval(() => {
            // Fade out
            Animated.timing(fadeAnim, {
                toValue: 0,
                duration: 300,
                useNativeDriver: true,
            }).start(() => {
                // Change tip
                setCurrentIndex((prev) => (prev + 1) % TIPS.length);
                // Fade in
                Animated.timing(fadeAnim, {
                    toValue: 1,
                    duration: 300,
                    useNativeDriver: true,
                }).start();
            });
        }, rotateInterval);

        return () => clearInterval(interval);
    }, [autoRotate, rotateInterval, fadeAnim]);

    const currentTip = TIPS[currentIndex];

    return (
        <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
            <Text style={styles.icon}>{currentTip.icon}</Text>
            <Text style={styles.text}>{currentTip.text}</Text>
        </Animated.View>
    );
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: 'rgba(108, 99, 255, 0.1)',
        borderRadius: 16,
        padding: 16,
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(108, 99, 255, 0.2)',
    },
    icon: {
        fontSize: 28,
        marginRight: 12,
    },
    text: {
        flex: 1,
        color: '#FFFFFF',
        fontSize: 14,
        lineHeight: 20,
    },
});
