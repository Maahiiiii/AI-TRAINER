/**
 * AvatarScreen
 * 
 * Displays user's fitness avatar with transformation progress,
 * achievements, and level progression.
 */

import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    ActivityIndicator,
    Alert,
    TextInput,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import {
    avatarService,
    AvatarState,
    AVATAR_LEVELS,
    ACHIEVEMENTS
} from '../services/AvatarService';
import { Colors, Gradients, Spacing, Layout, Shadows } from '../theme/Theme';

interface AvatarScreenProps {
    navigation: any;
}

export default function AvatarScreen({ navigation }: AvatarScreenProps) {
    const [avatarState, setAvatarState] = useState<AvatarState | null>(null);
    const [loading, setLoading] = useState(true);
    const [showMetricsModal, setShowMetricsModal] = useState(false);
    const [currentWeight, setCurrentWeight] = useState('');
    const [goalWeight, setGoalWeight] = useState('');

    useEffect(() => {
        loadAvatarState();
    }, []);

    const loadAvatarState = async () => {
        setLoading(true);
        const state = await avatarService.getAvatarState();
        setAvatarState(state);
        if (state?.bodyMetrics.currentWeight) {
            setCurrentWeight(state.bodyMetrics.currentWeight.toString());
        }
        if (state?.bodyMetrics.goalWeight) {
            setGoalWeight(state.bodyMetrics.goalWeight.toString());
        }
        setLoading(false);
    };

    const handleUpdateMetrics = async () => {
        const weight = parseFloat(currentWeight);
        const goal = parseFloat(goalWeight);

        if (isNaN(weight) || weight <= 0) {
            Alert.alert('Invalid Weight', 'Please enter a valid weight');
            return;
        }

        await avatarService.updateBodyMetrics({
            currentWeight: weight,
            goalWeight: isNaN(goal) ? undefined : goal,
        });

        setShowMetricsModal(false);
        loadAvatarState();
        Alert.alert('Success', 'Body metrics updated!');
    };

    const getAvatarEmoji = (level: number): string => {
        const levelData = AVATAR_LEVELS.find(l => l.level === level);
        return levelData?.icon || '🏃';
    };

    const getProgressToNextLevel = (): { workouts: number; reps: number } | null => {
        if (!avatarState) return null;
        return avatarService.getNextLevelRequirements(avatarState.level);
    };

    const calculateProgress = (current: number, required: number): number => {
        return Math.min(100, Math.round((current / required) * 100));
    };

    if (loading) {
        return (
            <LinearGradient colors={Gradients.background} style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={Colors.primaryStart} />
            </LinearGradient>
        );
    }

    if (!avatarState) {
        return (
            <LinearGradient colors={Gradients.background} style={styles.container}>
                <Text style={styles.errorText}>Failed to load avatar</Text>
                <TouchableOpacity onPress={() => navigation.navigate('Home')}>
                    <Text style={styles.backLink}>Go Back</Text>
                </TouchableOpacity>
            </LinearGradient>
        );
    }

    const nextLevel = getProgressToNextLevel();

    return (
        <LinearGradient colors={Gradients.background} style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.navigate('Home')} style={styles.backButtonGeneric}>
                    <Text style={styles.backButton}>← Back</Text>
                </TouchableOpacity>
                <Text style={styles.title}>Hero Journey</Text>
            </View>

            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                {/* Avatar Display */}
                <BlurView intensity={20} tint="light" style={styles.avatarCard}>
                    <LinearGradient
                        colors={Gradients.primary}
                        style={styles.avatarCircle}
                    >
                        <Text style={styles.avatarEmoji}>{getAvatarEmoji(avatarState.level)}</Text>
                    </LinearGradient>
                    <Text style={styles.levelName}>{avatarState.levelName}</Text>
                    <Text style={styles.levelBadge}>Level {avatarState.level}</Text>

                    {/* Streak */}
                    <View style={styles.streakContainer}>
                        <LinearGradient
                            colors={Gradients.fire}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                            style={styles.streakGradient}
                        >
                            <Text style={styles.streakIcon}>🔥</Text>
                            <Text style={styles.streakText}>{avatarState.currentStreak} Day Streak</Text>
                        </LinearGradient>
                    </View>
                </BlurView>

                {/* Progress to Next Level */}
                {nextLevel && (
                    <BlurView intensity={10} tint="default" style={styles.progressCard}>
                        <Text style={styles.sectionTitle}>Next Level Progress</Text>

                        <View style={styles.progressItem}>
                            <View style={styles.progressHeader}>
                                <Text style={styles.progressLabel}>Workouts</Text>
                                <Text style={styles.progressValue}>
                                    {avatarState.totalWorkouts} / {nextLevel.workouts}
                                </Text>
                            </View>
                            <View style={styles.progressBarBg}>
                                <LinearGradient
                                    colors={Gradients.primary}
                                    start={{ x: 0, y: 0 }}
                                    end={{ x: 1, y: 0 }}
                                    style={[
                                        styles.progressFill,
                                        { width: `${calculateProgress(avatarState.totalWorkouts, nextLevel.workouts)}%` }
                                    ]}
                                />
                            </View>
                        </View>

                        <View style={styles.progressItem}>
                            <View style={styles.progressHeader}>
                                <Text style={styles.progressLabel}>Total Reps</Text>
                                <Text style={styles.progressValue}>
                                    {avatarState.totalReps} / {nextLevel.reps}
                                </Text>
                            </View>
                            <View style={styles.progressBarBg}>
                                <LinearGradient
                                    colors={Gradients.ocean}
                                    start={{ x: 0, y: 0 }}
                                    end={{ x: 1, y: 0 }}
                                    style={[
                                        styles.progressFill,
                                        { width: `${calculateProgress(avatarState.totalReps, nextLevel.reps)}%` }
                                    ]}
                                />
                            </View>
                        </View>
                    </BlurView>
                )}

                {/* Stats Grid */}
                <BlurView intensity={10} tint="light" style={styles.statsCard}>
                    <Text style={styles.sectionTitle}>Lifetime Stats</Text>
                    <View style={styles.statsGrid}>
                        {[
                            { label: 'Workouts', value: avatarState.totalWorkouts },
                            { label: 'Total Reps', value: avatarState.totalReps },
                            { label: 'Minutes', value: `${avatarState.totalMinutes}m` },
                            { label: 'Best Streak', value: avatarState.longestStreak },
                        ].map((stat, i) => (
                            <View key={i} style={styles.statItem}>
                                <Text style={styles.statValue}>{stat.value}</Text>
                                <Text style={styles.statLabel}>{stat.label}</Text>
                            </View>
                        ))}
                    </View>
                </BlurView>

                {/* Body Metrics */}
                <BlurView intensity={15} tint="light" style={styles.metricsCard}>
                    <View style={styles.metricsHeader}>
                        <Text style={styles.sectionTitle}>Body Metrics</Text>
                        <TouchableOpacity onPress={() => setShowMetricsModal(true)}>
                            <Text style={styles.editButton}>Edit</Text>
                        </TouchableOpacity>
                    </View>

                    {avatarState.bodyMetrics.startWeight ? (
                        <View style={styles.metricsContent}>
                            <View style={styles.metricItem}>
                                <Text style={styles.metricLabel}>Start</Text>
                                <Text style={styles.metricValue}>
                                    {avatarState.bodyMetrics.startWeight} <Text style={styles.unit}>kg</Text>
                                </Text>
                            </View>
                            <View style={styles.metricArrow}>
                                <Text style={styles.arrowText}>→</Text>
                            </View>
                            <View style={styles.metricItem}>
                                <Text style={styles.metricLabel}>Current</Text>
                                <Text style={styles.metricValue}>
                                    {avatarState.bodyMetrics.currentWeight || '--'} <Text style={styles.unit}>kg</Text>
                                </Text>
                            </View>
                            {avatarState.bodyMetrics.goalWeight && (
                                <>
                                    <View style={styles.metricArrow}>
                                        <Text style={styles.arrowText}>→</Text>
                                    </View>
                                    <View style={styles.metricItem}>
                                        <Text style={styles.metricLabel}>Goal</Text>
                                        <Text style={[styles.metricValue, styles.goalValue]}>
                                            {avatarState.bodyMetrics.goalWeight} <Text style={[styles.unit, styles.goalValue]}>kg</Text>
                                        </Text>
                                    </View>
                                </>
                            )}
                        </View>
                    ) : (
                        <TouchableOpacity
                            style={styles.addMetricsButton}
                            onPress={() => setShowMetricsModal(true)}
                        >
                            <Text style={styles.addMetricsText}>+ Add your body metrics</Text>
                        </TouchableOpacity>
                    )}
                </BlurView>

                {/* Achievements */}
                <BlurView intensity={10} tint="light" style={styles.achievementsCard}>
                    <Text style={styles.sectionTitle}>
                        Achievements ({avatarState.achievements.length}/{ACHIEVEMENTS.length})
                    </Text>
                    <View style={styles.achievementsGrid}>
                        {ACHIEVEMENTS.map((achievement) => {
                            const isEarned = avatarState.achievements.includes(achievement.id);
                            return (
                                <View
                                    key={achievement.id}
                                    style={[
                                        styles.achievementItem,
                                        !isEarned && styles.achievementLocked
                                    ]}
                                >
                                    <Text style={[styles.achievementIcon, !isEarned && { opacity: 0.5 }]}>
                                        {isEarned ? achievement.icon : '🔒'}
                                    </Text>
                                    <Text style={[
                                        styles.achievementName,
                                        !isEarned && styles.achievementNameLocked
                                    ]}>
                                        {achievement.name}
                                    </Text>
                                </View>
                            );
                        })}
                    </View>
                </BlurView>

                {/* Level Roadmap */}
                <BlurView intensity={10} tint="light" style={styles.roadmapCard}>
                    <Text style={styles.sectionTitle}>Level Map</Text>
                    {AVATAR_LEVELS.map((level) => (
                        <View
                            key={level.level}
                            style={[
                                styles.roadmapItem,
                                avatarState.level > level.level && styles.roadmapItemActive, // Past
                                avatarState.level === level.level && styles.roadmapItemCurrent // Current
                            ]}
                        >
                            <Text style={styles.roadmapIcon}>{level.icon}</Text>
                            <View style={styles.roadmapInfo}>
                                <Text style={[
                                    styles.roadmapName,
                                    avatarState.level >= level.level && styles.roadmapNameActive
                                ]}>
                                    Lv.{level.level} - {level.name}
                                </Text>
                                <Text style={styles.roadmapReq}>
                                    {level.minWorkouts} workouts • {level.minReps} reps
                                </Text>
                            </View>
                            {avatarState.level >= level.level && (
                                <Text style={styles.roadmapCheck}>✓</Text>
                            )}
                        </View>
                    ))}
                </BlurView>

                <View style={{ height: 40 }} />
            </ScrollView>

            {/* Metrics Modal */}
            {showMetricsModal && (
                <BlurView intensity={50} tint="dark" style={styles.modalOverlay}>
                    <View style={styles.modal}>
                        <Text style={styles.modalTitle}>Update Body Metrics</Text>

                        <View style={styles.inputGroup}>
                            <Text style={styles.inputLabel}>Current Weight (kg)</Text>
                            <TextInput
                                style={styles.input}
                                value={currentWeight}
                                onChangeText={setCurrentWeight}
                                keyboardType="numeric"
                                placeholder="e.g., 75"
                                placeholderTextColor="#666"
                            />
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.inputLabel}>Goal Weight (kg) - Optional</Text>
                            <TextInput
                                style={styles.input}
                                value={goalWeight}
                                onChangeText={setGoalWeight}
                                keyboardType="numeric"
                                placeholder="e.g., 70"
                                placeholderTextColor="#666"
                            />
                        </View>

                        <View style={styles.modalButtons}>
                            <TouchableOpacity
                                style={styles.cancelButton}
                                onPress={() => setShowMetricsModal(false)}
                            >
                                <Text style={styles.cancelButtonText}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                activeOpacity={0.8}
                                onPress={handleUpdateMetrics}
                                style={{ flex: 1 }}
                            >
                                <LinearGradient
                                    colors={Gradients.primary}
                                    style={styles.saveButton}
                                >
                                    <Text style={styles.saveButtonText}>Save</Text>
                                </LinearGradient>
                            </TouchableOpacity>
                        </View>
                    </View>
                </BlurView>
            )}
        </LinearGradient>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    errorText: {
        color: Colors.accentError,
        fontSize: 16,
        textAlign: 'center',
        marginTop: 100,
    },
    backLink: {
        color: Colors.primaryStart,
        fontSize: 16,
        textAlign: 'center',
        marginTop: 20,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingTop: 60,
        paddingHorizontal: Spacing.l,
        paddingBottom: Spacing.m,
    },
    backButtonGeneric: {
        marginRight: Spacing.m,
    },
    backButton: {
        color: Colors.textSecondary,
        fontSize: 16,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: Colors.textPrimary,
    },
    content: {
        flex: 1,
        paddingHorizontal: Spacing.l,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: Colors.textPrimary,
        marginBottom: Spacing.m,
    },

    // Avatar Card
    avatarCard: {
        borderRadius: Layout.borderRadius.xl,
        padding: Spacing.xl,
        alignItems: 'center',
        marginBottom: Spacing.l,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: Colors.glassBorder,
    },
    avatarCircle: {
        width: 120,
        height: 120,
        borderRadius: 60,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: Spacing.m,
        ...Shadows.glow,
    },
    avatarEmoji: {
        fontSize: 64,
    },
    levelName: {
        fontSize: 28,
        fontWeight: 'bold',
        color: Colors.textPrimary,
    },
    levelBadge: {
        fontSize: 14,
        color: Colors.primaryStart,
        marginTop: 4,
        fontWeight: '600',
    },
    streakContainer: {
        marginTop: Spacing.m,
        overflow: 'hidden',
        borderRadius: Layout.borderRadius.round,
    },
    streakGradient: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 8,
        paddingHorizontal: 16,
    },
    streakIcon: {
        fontSize: 16,
        marginRight: 6,
    },
    streakText: {
        color: Colors.textPrimary,
        fontSize: 14,
        fontWeight: 'bold',
    },

    // Progress Card
    progressCard: {
        borderRadius: Layout.borderRadius.m,
        padding: Spacing.l,
        marginBottom: Spacing.l,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: Colors.glassBorder,
    },
    progressItem: {
        marginBottom: Spacing.m,
    },
    progressHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 8,
    },
    progressLabel: {
        color: Colors.textSecondary,
        fontSize: 14,
    },
    progressValue: {
        color: Colors.textPrimary,
        fontSize: 14,
        fontWeight: '600',
    },
    progressBarBg: {
        height: 10,
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        borderRadius: 5,
        overflow: 'hidden',
    },
    progressFill: {
        height: '100%',
        borderRadius: 5,
    },

    // Stats Card
    statsCard: {
        borderRadius: Layout.borderRadius.m,
        padding: Spacing.l,
        marginBottom: Spacing.l,
        overflow: 'hidden',
    },
    statsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
    },
    statItem: {
        width: '47%',
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        borderRadius: 12,
        padding: 16,
        alignItems: 'center',
    },
    statValue: {
        fontSize: 24,
        fontWeight: 'bold',
        color: Colors.textPrimary,
    },
    statLabel: {
        fontSize: 12,
        color: Colors.textSecondary,
        marginTop: 4,
    },

    // Metrics Card
    metricsCard: {
        borderRadius: Layout.borderRadius.m,
        padding: Spacing.l,
        marginBottom: Spacing.l,
        overflow: 'hidden',
    },
    metricsHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    editButton: {
        color: Colors.primaryStart,
        fontSize: 14,
        fontWeight: '600',
    },
    metricsContent: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    metricItem: {
        alignItems: 'center',
    },
    metricLabel: {
        color: Colors.textSecondary,
        fontSize: 12,
    },
    metricValue: {
        color: Colors.textPrimary,
        fontSize: 24,
        fontWeight: 'bold',
    },
    unit: {
        fontSize: 14,
        color: Colors.textTertiary,
        fontWeight: 'normal',
    },
    goalValue: {
        color: Colors.accentSuccess,
    },
    metricArrow: {
        marginHorizontal: 16,
    },
    arrowText: {
        color: Colors.glassBorder,
        fontSize: 24,
    },
    addMetricsButton: {
        padding: 16,
        borderWidth: 1,
        borderColor: Colors.glassBorder,
        borderRadius: 12,
        borderStyle: 'dashed',
        alignItems: 'center',
    },
    addMetricsText: {
        color: Colors.primaryStart,
        fontSize: 14,
    },

    // Achievements Card
    achievementsCard: {
        borderRadius: Layout.borderRadius.m,
        padding: Spacing.l,
        marginBottom: Spacing.l,
        overflow: 'hidden',
    },
    achievementsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
    },
    achievementItem: {
        width: '30%',
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        borderRadius: 12,
        padding: 12,
        alignItems: 'center',
    },
    achievementLocked: {
        opacity: 0.5,
    },
    achievementIcon: {
        fontSize: 28,
        marginBottom: 4,
    },
    achievementName: {
        color: Colors.textPrimary,
        fontSize: 10,
        textAlign: 'center',
    },
    achievementNameLocked: {
        color: Colors.textTertiary,
    },

    // Roadmap Card
    roadmapCard: {
        borderRadius: Layout.borderRadius.m,
        padding: Spacing.l,
        marginBottom: Spacing.l,
        overflow: 'hidden',
    },
    roadmapItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: Colors.glassBorder,
        opacity: 0.5,
    },
    roadmapItemActive: {
        opacity: 0.8,
    },
    roadmapItemCurrent: {
        opacity: 1,
        backgroundColor: 'rgba(108, 99, 255, 0.1)',
        borderRadius: 8,
        paddingHorizontal: 8,
        marginHorizontal: -8,
    },
    roadmapIcon: {
        fontSize: 28,
        marginRight: 12,
    },
    roadmapInfo: {
        flex: 1,
    },
    roadmapName: {
        color: Colors.textSecondary,
        fontSize: 16,
        fontWeight: '600',
    },
    roadmapNameActive: {
        color: Colors.textPrimary,
    },
    roadmapReq: {
        color: Colors.textTertiary,
        fontSize: 12,
        marginTop: 2,
    },
    roadmapCheck: {
        color: Colors.accentSuccess,
        fontSize: 18,
        fontWeight: 'bold',
    },

    // Modal
    modalOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    modal: {
        backgroundColor: Colors.backgroundLight,
        borderRadius: 20,
        padding: 24,
        width: '100%',
        borderWidth: 1,
        borderColor: Colors.glassBorder,
        ...Shadows.card,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: Colors.textPrimary,
        marginBottom: 20,
        textAlign: 'center',
    },
    inputGroup: {
        marginBottom: 16,
    },
    inputLabel: {
        color: Colors.textSecondary,
        fontSize: 14,
        marginBottom: 8,
    },
    input: {
        backgroundColor: 'rgba(0, 0, 0, 0.2)',
        borderRadius: 12,
        padding: 16,
        color: Colors.textPrimary,
        fontSize: 16,
        borderWidth: 1,
        borderColor: Colors.glassBorder,
    },
    modalButtons: {
        flexDirection: 'row',
        gap: 12,
        marginTop: 20,
    },
    cancelButton: {
        flex: 1,
        padding: 16,
        borderRadius: 12,
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        alignItems: 'center',
    },
    cancelButtonText: {
        color: Colors.textPrimary,
        fontSize: 16,
    },
    saveButton: {
        padding: 16,
        borderRadius: 12,
        alignItems: 'center',
        ...Shadows.glow,
    },
    saveButtonText: {
        color: Colors.textPrimary,
        fontSize: 16,
        fontWeight: 'bold',
    },
});
