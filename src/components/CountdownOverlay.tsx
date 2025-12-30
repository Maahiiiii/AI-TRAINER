/**
 * CountdownOverlay
 * 
 * Animated countdown overlay before workout starts.
 */

import React, { useEffect, useState, useRef } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Animated,
    Dimensions,
} from 'react-native';

interface CountdownOverlayProps {
    onComplete: () => void;
    duration?: number; // seconds
}

const { width, height } = Dimensions.get('window');

export default function CountdownOverlay({
    onComplete,
    duration = 3
}: CountdownOverlayProps) {
    const [count, setCount] = useState(duration);
    const scaleAnim = useRef(new Animated.Value(0.5)).current;
    const opacityAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        // Animation for each count
        const animateCount = () => {
            scaleAnim.setValue(0.5);
            opacityAnim.setValue(0);

            Animated.parallel([
                Animated.spring(scaleAnim, {
                    toValue: 1,
                    friction: 4,
                    tension: 50,
                    useNativeDriver: true,
                }),
                Animated.timing(opacityAnim, {
                    toValue: 1,
                    duration: 200,
                    useNativeDriver: true,
                }),
            ]).start();

            // Fade out at end
            setTimeout(() => {
                Animated.timing(opacityAnim, {
                    toValue: 0.3,
                    duration: 300,
                    useNativeDriver: true,
                }).start();
            }, 600);
        };

        animateCount();

        if (count > 0) {
            const timer = setTimeout(() => {
                setCount(count - 1);
            }, 1000);
            return () => clearTimeout(timer);
        } else {
            // Show "GO!" then complete
            setTimeout(() => {
                onComplete();
            }, 800);
        }
    }, [count]);

    const getCountColor = () => {
        if (count === 0) return '#00C853';
        if (count === 1) return '#FFB800';
        if (count === 2) return '#FF9800';
        return '#FF5722';
    };

    return (
        <View style={styles.container}>
            <View style={styles.backdrop} />

            <Animated.View
                style={[
                    styles.countContainer,
                    {
                        transform: [{ scale: scaleAnim }],
                        opacity: opacityAnim,
                    },
                ]}
            >
                <Text style={[styles.countText, { color: getCountColor() }]}>
                    {count === 0 ? 'GO!' : count}
                </Text>
            </Animated.View>

            <Text style={styles.message}>
                {count === 0 ? 'Start now!' : 'Get ready...'}
            </Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 100,
    },
    backdrop: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
    },
    countContainer: {
        width: 180,
        height: 180,
        borderRadius: 90,
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 4,
        borderColor: 'rgba(255, 255, 255, 0.2)',
    },
    countText: {
        fontSize: 100,
        fontWeight: 'bold',
    },
    message: {
        color: '#FFFFFF',
        fontSize: 20,
        marginTop: 30,
        opacity: 0.8,
    },
});
