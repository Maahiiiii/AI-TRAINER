import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, Spacing, Shadows, Layout } from '../theme/Theme';
import { PlannedExercise } from '../types';

interface ExerciseCardProps {
    exercise: PlannedExercise & { requiredLevel?: number };
    userLevel: number;
    onPress?: () => void;
}

export default function ExerciseCard({ exercise, userLevel, onPress }: ExerciseCardProps) {
    const isLocked = (exercise.requiredLevel || 1) > userLevel;
    const difficultyColors: Record<string, readonly [string, string]> = {
        beginner: ['#4A90E2', '#50C9F2'] as const,
        intermediate: ['#F5A623', '#F76B1C'] as const,
        advanced: ['#D0021B', '#9013FE'] as const,
    };

    const gradient = difficultyColors[exercise.difficulty || 'beginner'];
    const gradientWithAlpha = [...gradient, 'rgba(0,0,0,0.3)'] as const;

    if (isLocked) {
        return (
            <View style={[styles.container, styles.lockedContainer]}>
                <View style={styles.lockedOverlay}>
                    <MaterialCommunityIcons
                        name="lock"
                        size={32}
                        color={Colors.textSecondary}
                    />
                    <Text style={styles.lockedText}>
                        Unlock at Level {exercise.requiredLevel}
                    </Text>
                </View>
                <View style={[styles.content, styles.lockedContent]}>
                    <Text style={[styles.name, styles.lockedName]}>{exercise.name}</Text>
                    <Text style={[styles.details, styles.lockedDetails]}>
                        {exercise.sets} sets × {exercise.reps} reps
                    </Text>
                    {exercise.targetMuscle && (
                        <Text style={[styles.muscle, styles.lockedDetails]}>
                            {exercise.targetMuscle}
                        </Text>
                    )}
                </View>
            </View>
        );
    }

    return (
        <TouchableOpacity
            style={styles.container}
            onPress={onPress}
            activeOpacity={0.7}
        >
            <LinearGradient
                colors={gradientWithAlpha}
                style={styles.gradientCard}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
            >
                <View style={styles.content}>
                    <View style={styles.header}>
                        <MaterialCommunityIcons
                            name="check-circle"
                            size={20}
                            color={Colors.accentSuccess}
                        />
                        <Text style={styles.name}>{exercise.name}</Text>
                    </View>

                    <View style={styles.detailsRow}>
                        <View style={styles.detailItem}>
                            <MaterialCommunityIcons
                                name="repeat"
                                size={16}
                                color={Colors.textPrimary}
                            />
                            <Text style={styles.details}>
                                {exercise.sets} × {exercise.reps}
                            </Text>
                        </View>

                        <View style={styles.detailItem}>
                            <MaterialCommunityIcons
                                name="timer-outline"
                                size={16}
                                color={Colors.textPrimary}
                            />
                            <Text style={styles.details}>{exercise.rest}s rest</Text>
                        </View>
                    </View>

                    {exercise.targetMuscle && (
                        <View style={styles.muscleBadge}>
                            <Text style={styles.muscle}>{exercise.targetMuscle}</Text>
                        </View>
                    )}

                    {exercise.difficulty && (
                        <View style={styles.difficultyBadge}>
                            <Text style={styles.difficultyText}>
                                {exercise.difficulty.toUpperCase()}
                            </Text>
                        </View>
                    )}
                </View>
            </LinearGradient>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    container: {
        marginVertical: Spacing.s,
        borderRadius: Layout.borderRadius.m,
        overflow: 'hidden',
        ...Shadows.medium,
    },
    gradientCard: {
        padding: Spacing.m,
    },
    content: {
        gap: Spacing.s,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: Spacing.s,
    },
    name: {
        fontSize: 16,
        fontWeight: '700',
        color: Colors.textPrimary,
        flex: 1,
    },
    detailsRow: {
        flexDirection: 'row',
        gap: Spacing.l,
    },
    detailItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: Spacing.xs,
    },
    details: {
        fontSize: 13,
        fontWeight: '600',
        color: Colors.textPrimary,
        opacity: 0.9,
    },
    muscleBadge: {
        alignSelf: 'flex-start',
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        paddingHorizontal: Spacing.m,
        paddingVertical: Spacing.xs,
        borderRadius: 8,
    },
    muscle: {
        fontSize: 11,
        fontWeight: '600',
        color: Colors.textPrimary,
        textTransform: 'capitalize',
    },
    difficultyBadge: {
        position: 'absolute',
        top: 0,
        right: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.3)',
        paddingHorizontal: Spacing.s,
        paddingVertical: Spacing.xs,
        borderBottomLeftRadius: 8,
    },
    difficultyText: {
        fontSize: 10,
        fontWeight: 'bold',
        color: Colors.textPrimary,
        letterSpacing: 0.5,
    },
    lockedContainer: {
        backgroundColor: Colors.glassSurface,
        borderWidth: 1,
        borderColor: Colors.glassBorder,
    },
    lockedOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        zIndex: 1,
        gap: Spacing.s,
    },
    lockedText: {
        fontSize: 13,
        fontWeight: 'bold',
        color: Colors.textPrimary,
    },
    lockedContent: {
        padding: Spacing.m,
        opacity: 0.4,
    },
    lockedName: {
        color: Colors.textSecondary,
    },
    lockedDetails: {
        color: Colors.textSecondary,
    },
});
