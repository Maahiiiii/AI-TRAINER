import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { ProgressionService } from '../services/ProgressionService';
import { Colors, Spacing, Shadows } from '../theme/Theme';

interface LevelXPCardProps {
    level: number;
    xp: number;
    totalWorkouts: number;
}

export default function LevelXPCard({ level, xp, totalWorkouts }: LevelXPCardProps) {
    const progressAnim = useRef(new Animated.Value(0)).current;

    // Calculate XP thresholds
    const currentLevelXP = ProgressionService.getXPThresholdForLevel(level);
    const nextLevelXP = ProgressionService.getXPThresholdForLevel(level + 1);
    const xpInCurrentLevel = xp - currentLevelXP;
    const xpNeededForNextLevel = nextLevelXP - currentLevelXP;
    const progressPercent = Math.min((xpInCurrentLevel / xpNeededForNextLevel) * 100, 100);

    // Get difficulty tier
    const tier = ProgressionService.getDifficultyTier(level);

    // Tier colors
    const tierGradients: Record<string, readonly [string, string]> = {
        beginner: ['#4A90E2', '#50C9F2'] as const,
        intermediate: ['#F5A623', '#F76B1C'] as const,
        advanced: ['#D0021B', '#9013FE'] as const
    };

    const tierIcons = {
        beginner: 'baby-face-outline',
        intermediate: 'fire',
        advanced: 'trophy'
    };

    useEffect(() => {
        Animated.timing(progressAnim, {
            toValue: progressPercent,
            duration: 1000,
            useNativeDriver: false,
        }).start();
    }, [xp, level]);

    const progressWidth = progressAnim.interpolate({
        inputRange: [0, 100],
        outputRange: ['0%', '100%'],
    });

    return (
        <LinearGradient
            colors={tierGradients[tier]}
            style={styles.container}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
        >
            <View style={styles.content}>
                {/* Level Badge */}
                <View style={styles.levelSection}>
                    <MaterialCommunityIcons
                        name={tierIcons[tier] as any}
                        size={32}
                        color={Colors.textPrimary}
                    />
                    <View style={styles.levelText}>
                        <Text style={styles.levelLabel}>LEVEL</Text>
                        <Text style={styles.levelNumber}>{level}</Text>
                    </View>
                </View>

                {/* Tier Label */}
                <View style={styles.tierBadge}>
                    <Text style={styles.tierText}>{tier.toUpperCase()}</Text>
                </View>
            </View>

            {/* XP Progress Bar */}
            <View style={styles.progressSection}>
                <View style={styles.progressBar}>
                    <Animated.View
                        style={[
                            styles.progressFill,
                            { width: progressWidth }
                        ]}
                    />
                </View>
                <View style={styles.xpTextRow}>
                    <Text style={styles.xpText}>
                        {xpInCurrentLevel.toLocaleString()} / {xpNeededForNextLevel.toLocaleString()} XP
                    </Text>
                    <Text style={styles.xpPercent}>{Math.round(progressPercent)}%</Text>
                </View>
            </View>

            {/* Stats Row */}
            <View style={styles.statsRow}>
                <View style={styles.statItem}>
                    <MaterialCommunityIcons name="dumbbell" size={16} color={Colors.textPrimary} />
                    <Text style={styles.statText}>{totalWorkouts} Workouts</Text>
                </View>
                <View style={styles.statItem}>
                    <MaterialCommunityIcons name="star" size={16} color={Colors.textPrimary} />
                    <Text style={styles.statText}>{xp.toLocaleString()} Total XP</Text>
                </View>
            </View>
        </LinearGradient>
    );
}

const styles = StyleSheet.create({
    container: {
        borderRadius: 16,
        padding: Spacing.l,
        marginHorizontal: Spacing.m,
        marginVertical: Spacing.m,
        ...Shadows.large,
    },
    content: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: Spacing.m,
    },
    levelSection: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: Spacing.m,
    },
    levelText: {
        alignItems: 'flex-start',
    },
    levelLabel: {
        color: Colors.textPrimary,
        fontSize: 12,
        fontWeight: '600',
        letterSpacing: 1,
        opacity: 0.9,
    },
    levelNumber: {
        color: Colors.textPrimary,
        fontSize: 36,
        fontWeight: 'bold',
        lineHeight: 40,
    },
    tierBadge: {
        backgroundColor: 'rgba(255, 255, 255, 0.25)',
        paddingHorizontal: Spacing.m,
        paddingVertical: Spacing.s,
        borderRadius: 12,
    },
    tierText: {
        color: Colors.textPrimary,
        fontSize: 11,
        fontWeight: 'bold',
        letterSpacing: 1,
    },
    progressSection: {
        marginBottom: Spacing.m,
    },
    progressBar: {
        height: 8,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        borderRadius: 4,
        overflow: 'hidden',
        marginBottom: Spacing.s,
    },
    progressFill: {
        height: '100%',
        backgroundColor: Colors.textPrimary,
        borderRadius: 4,
    },
    xpTextRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    xpText: {
        color: Colors.textPrimary,
        fontSize: 13,
        fontWeight: '600',
        opacity: 0.95,
    },
    xpPercent: {
        color: Colors.textPrimary,
        fontSize: 13,
        fontWeight: 'bold',
    },
    statsRow: {
        flexDirection: 'row',
        gap: Spacing.l,
    },
    statItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: Spacing.s,
    },
    statText: {
        color: Colors.textPrimary,
        fontSize: 12,
        fontWeight: '500',
        opacity: 0.9,
    },
});
