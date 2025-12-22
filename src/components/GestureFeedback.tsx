import React from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { BlurView } from 'expo-blur';
import { GestureType } from '../types';

interface GestureFeedbackProps {
    gesture: GestureType | null;
    confidence: number;
    visible: boolean;
}

export const GestureFeedback: React.FC<GestureFeedbackProps> = ({ gesture, confidence, visible }) => {
    if (!visible || !gesture || gesture.name === 'None') return null;

    // Only show if confidence is high enough
    if (confidence < 0.6) return null;

    return (
        <View style={styles.container}>
            <BlurView intensity={30} tint="dark" style={styles.badge}>
                <Text style={styles.emoji}>{gesture.emoji}</Text>
                <View>
                    <Text style={styles.name}>{gesture.name}</Text>
                    <View style={styles.confidenceBar}>
                        <View style={[styles.confidenceFill, { width: `${confidence * 100}%` }]} />
                    </View>
                </View>
            </BlurView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        top: 60,
        right: 20,
        zIndex: 100,
    },
    badge: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
        borderRadius: 20,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.2)',
        gap: 12,
    },
    emoji: {
        fontSize: 32,
    },
    name: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: 'bold',
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    confidenceBar: {
        height: 4,
        width: 60,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        borderRadius: 2,
        marginTop: 4,
    },
    confidenceFill: {
        height: '100%',
        backgroundColor: '#6C63FF',
        borderRadius: 2,
    },
});

export default GestureFeedback;
