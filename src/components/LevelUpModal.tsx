import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Modal, Animated, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { Colors, Spacing, Shadows } from '../theme/Theme';

interface LevelUpModalProps {
    visible: boolean;
    newLevel: number;
    unlockedExercises?: string[];
    onClose: () => void;
}

export default function LevelUpModal({
    visible,
    newLevel,
    unlockedExercises = [],
    onClose
}: LevelUpModalProps) {
    const scaleAnim = useRef(new Animated.Value(0)).current;
    const rotateAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        if (visible) {
            Animated.parallel([
                Animated.spring(scaleAnim, {
                    toValue: 1,
                    tension: 50,
                    friction: 7,
                    useNativeDriver: true,
                }),
                Animated.loop(
                    Animated.sequence([
                        Animated.timing(rotateAnim, {
                            toValue: 1,
                            duration: 2000,
                            useNativeDriver: true,
                        }),
                        Animated.timing(rotateAnim, {
                            toValue: 0,
                            duration: 0,
                            useNativeDriver: true,
                        }),
                    ])
                ),
            ]).start();
        } else {
            scaleAnim.setValue(0);
        }
    }, [visible]);

    const spin = rotateAnim.interpolate({
        inputRange: [0, 1],
        outputRange: ['0deg', '360deg'],
    });

    return (
        <Modal
            visible={visible}
            transparent
            animationType="fade"
            onRequestClose={onClose}
        >
            <BlurView intensity={80} style={styles.backdrop}>
                <Animated.View
                    style={[
                        styles.container,
                        { transform: [{ scale: scaleAnim }] }
                    ]}
                >
                    <LinearGradient
                        colors={['#9013FE', '#D0021B']}
                        style={styles.gradient}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                    >
                        {/* Trophy Animation */}
                        <Animated.View style={[styles.trophy, { transform: [{ rotate: spin }] }]}>
                            <MaterialCommunityIcons
                                name="trophy"
                                size={64}
                                color={Colors.textPrimary}
                            />
                        </Animated.View>

                        {/* Level Up Text */}
                        <Text style={styles.title}>🎉 LEVEL UP! 🎉</Text>
                        <Text style={styles.levelText}>You reached LEVEL {newLevel}!</Text>

                        {/* Unlocked Exercises */}
                        {unlockedExercises.length > 0 && (
                            <View style={styles.unlockedSection}>
                                <Text style={styles.unlockedTitle}>🔓 Newly Unlocked:</Text>
                                {unlockedExercises.map((exercise, index) => (
                                    <View key={index} style={styles.exerciseItem}>
                                        <MaterialCommunityIcons
                                            name="chevron-right"
                                            size={16}
                                            color={Colors.textPrimary}
                                        />
                                        <Text style={styles.exerciseName}>{exercise}</Text>
                                    </View>
                                ))}
                            </View>
                        )}

                        {/* Encouragement */}
                        <Text style={styles.encouragement}>
                            Your next plan will be harder!
                        </Text>

                        {/* Continue Button */}
                        <TouchableOpacity
                            style={styles.button}
                            onPress={onClose}
                            activeOpacity={0.8}
                        >
                            <Text style={styles.buttonText}>CONTINUE</Text>
                        </TouchableOpacity>
                    </LinearGradient>
                </Animated.View>
            </BlurView>
        </Modal>
    );
}

const styles = StyleSheet.create({
    backdrop: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    container: {
        width: '85%',
        maxWidth: 400,
        borderRadius: 24,
        overflow: 'hidden',
        ...Shadows.large,
    },
    gradient: {
        padding: Spacing.xxl,
        alignItems: 'center',
    },
    trophy: {
        marginBottom: Spacing.l,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: Colors.textPrimary,
        marginBottom: Spacing.s,
        textAlign: 'center',
    },
    levelText: {
        fontSize: 18,
        fontWeight: '600',
        color: Colors.textPrimary,
        marginBottom: Spacing.xl,
        textAlign: 'center',
    },
    unlockedSection: {
        width: '100%',
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        borderRadius: 12,
        padding: Spacing.m,
        marginBottom: Spacing.l,
    },
    unlockedTitle: {
        fontSize: 14,
        fontWeight: 'bold',
        color: Colors.textPrimary,
        marginBottom: Spacing.s,
    },
    exerciseItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: Spacing.xs,
    },
    exerciseName: {
        fontSize: 14,
        color: Colors.textPrimary,
        marginLeft: Spacing.xs,
    },
    encouragement: {
        fontSize: 14,
        color: Colors.textPrimary,
        textAlign: 'center',
        marginBottom: Spacing.xl,
        opacity: 0.9,
    },
    button: {
        backgroundColor: 'rgba(255, 255, 255, 0.25)',
        paddingHorizontal: Spacing.xxl,
        paddingVertical: Spacing.m,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: Colors.textPrimary,
    },
    buttonText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: Colors.textPrimary,
        letterSpacing: 1,
    },
});
