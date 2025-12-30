/**
 * HistoryScreen
 * 
 * Displays workout history and performance stats.
 */

import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    ActivityIndicator,
    RefreshControl,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAppDispatch, useAppSelector } from '../hooks/reduxHooks';
import {
    fetchWorkoutHistory,
    fetchWorkoutStats,
    fetchPersonalBests
} from '../store/slices/workoutSlice';
import { Colors, Gradients, Spacing, Layout, Shadows } from '../theme/Theme';

interface HistoryScreenProps {
    navigation: any;
}

export default function HistoryScreen({ navigation }: HistoryScreenProps) {
    const dispatch = useAppDispatch();
    const { history, stats, personalBests, loading } = useAppSelector(
        (state) => state.workout
    );
    const [refreshing, setRefreshing] = useState(false);
    const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month' | 'all'>('week');

    useEffect(() => {
        loadData();
    }, [selectedPeriod]);

    const loadData = async () => {
        dispatch(fetchWorkoutHistory(20));
        dispatch(fetchWorkoutStats(selectedPeriod));
        dispatch(fetchPersonalBests());
    };

    const onRefresh = async () => {
        setRefreshing(true);
        await loadData();
        setRefreshing(false);
    };

    const formatDuration = (seconds: number): string => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return mins > 0 ? `${mins}m ${secs}s` : `${secs}s`;
    };

    const formatDate = (date: any): string => {
        const d = date?.toDate ? date.toDate() : new Date(date);
        const now = new Date();
        const diff = now.getTime() - d.getTime();
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));

        if (days === 0) return 'Today';
        if (days === 1) return 'Yesterday';
        if (days < 7) return `${days} days ago`;
        return d.toLocaleDateString();
    };

    return (
        <LinearGradient colors={Gradients.background} style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.navigate('Home')} style={styles.backButton}>
                    <MaterialCommunityIcons name="chevron-left" size={32} color={Colors.primaryStart} />
                </TouchableOpacity>
                <Text style={styles.title}>History & Stats</Text>
            </View>

            <ScrollView
                style={styles.content}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primaryStart} />
                }
            >
                {/* Stats Overview */}
                <BlurView intensity={20} tint="dark" style={styles.statsCard}>
                    <Text style={styles.sectionTitle}>Performance Overview</Text>

                    {/* Period Selector */}
                    <View style={styles.periodSelector}>
                        {(['week', 'month', 'all'] as const).map((period) => (
                            <TouchableOpacity
                                key={period}
                                style={[
                                    styles.periodButton,
                                    selectedPeriod === period && styles.periodButtonActive,
                                ]}
                                onPress={() => setSelectedPeriod(period)}
                            >
                                <Text
                                    style={[
                                        styles.periodButtonText,
                                        selectedPeriod === period && styles.periodButtonTextActive,
                                    ]}
                                >
                                    {period === 'all' ? 'All Time' : period.charAt(0).toUpperCase() + period.slice(1)}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>

                    <View style={styles.statsGrid}>
                        <View style={styles.statItem}>
                            <Text style={styles.statValue}>{stats.totalWorkouts}</Text>
                            <Text style={styles.statLabel}>Sessions</Text>
                        </View>
                        <View style={styles.statItem}>
                            <Text style={styles.statValue}>{stats.totalReps}</Text>
                            <Text style={styles.statLabel}>Total Reps</Text>
                        </View>
                        <View style={styles.statItem}>
                            <Text style={styles.statValue}>{formatDuration(stats.totalDuration)}</Text>
                            <Text style={styles.statLabel}>Training Time</Text>
                        </View>
                        <View style={styles.statItem}>
                            <Text style={styles.statValue}>{stats.totalCalories}</Text>
                            <Text style={styles.statLabel}>Calories</Text>
                        </View>
                    </View>

                    <View style={styles.avgScoreContainer}>
                        <Text style={styles.avgScoreLabel}>Average Form Accuracy</Text>
                        <Text style={[
                            styles.avgScoreValue,
                            stats.averageFormScore >= 80 ? styles.scoreGood :
                                stats.averageFormScore >= 60 ? styles.scoreWarning : styles.scoreBad
                        ]}>
                            {stats.averageFormScore}%
                        </Text>
                    </View>
                </BlurView>

                {/* Personal Bests */}
                {(personalBests.maxReps || personalBests.longestWorkout || personalBests.bestFormScore) && (
                    <BlurView intensity={20} tint="dark" style={styles.bestsCard}>
                        <Text style={styles.sectionTitle}>🏆 Personal Bests</Text>

                        {personalBests.maxReps && (
                            <View style={styles.bestItem}>
                                <View style={styles.bestIconContainer}>
                                    <Text style={styles.bestIcon}>💪</Text>
                                </View>
                                <View style={styles.bestInfo}>
                                    <Text style={styles.bestValue}>{personalBests.maxReps.value} reps</Text>
                                    <Text style={styles.bestLabel}>{personalBests.maxReps.exercise}</Text>
                                </View>
                            </View>
                        )}

                        {personalBests.longestWorkout && (
                            <View style={styles.bestItem}>
                                <View style={styles.bestIconContainer}>
                                    <Text style={styles.bestIcon}>⏱️</Text>
                                </View>
                                <View style={styles.bestInfo}>
                                    <Text style={styles.bestValue}>
                                        {formatDuration(personalBests.longestWorkout.value)}
                                    </Text>
                                    <Text style={styles.bestLabel}>Longest Session</Text>
                                </View>
                            </View>
                        )}

                        {personalBests.bestFormScore && (
                            <View style={styles.bestItem}>
                                <View style={styles.bestIconContainer}>
                                    <Text style={styles.bestIcon}>⭐</Text>
                                </View>
                                <View style={styles.bestInfo}>
                                    <Text style={styles.bestValue}>{personalBests.bestFormScore.value}%</Text>
                                    <Text style={styles.bestLabel}>Highest Form Score</Text>
                                </View>
                            </View>
                        )}
                    </BlurView>
                )}

                {/* Workout History */}
                <View style={styles.historySection}>
                    <Text style={styles.sectionTitle}>Recent Activities</Text>

                    {loading && history.length === 0 ? (
                        <ActivityIndicator color={Colors.primaryStart} size="large" style={{ marginTop: 20 }} />
                    ) : history.length === 0 ? (
                        <BlurView intensity={10} tint="dark" style={styles.emptyState}>
                            <Text style={styles.emptyIcon}>🏋️</Text>
                            <Text style={styles.emptyText}>No workouts yet</Text>
                            <Text style={styles.emptySubtext}>Complete a workout to see it here</Text>
                        </BlurView>
                    ) : (
                        history.map((workout) => (
                            <BlurView key={workout.id} intensity={15} tint="dark" style={styles.workoutItem}>
                                <View style={styles.workoutHeaderRow}>
                                    <View>
                                        <Text style={styles.workoutExercise}>{workout.exerciseName}</Text>
                                        <Text style={styles.workoutDate}>{formatDate(workout.createdAt)}</Text>
                                    </View>
                                    <View style={[
                                        styles.scoreBadge,
                                        workout.averageFormScore >= 80 ? styles.scoreBadgeGood :
                                            workout.averageFormScore >= 60 ? styles.scoreBadgeWarning : styles.scoreBadgeBad
                                    ]}>
                                        <Text style={styles.scoreBadgeText}>{workout.averageFormScore}%</Text>
                                    </View>
                                </View>
                                <View style={styles.workoutDetails}>
                                    <View style={styles.detailPill}>
                                        <MaterialCommunityIcons name="repeat" size={14} color={Colors.textSecondary} />
                                        <Text style={styles.workoutStat}>{workout.reps} reps</Text>
                                    </View>
                                    <View style={styles.detailPill}>
                                        <MaterialCommunityIcons name="clock-outline" size={14} color={Colors.textSecondary} />
                                        <Text style={styles.workoutStat}>{formatDuration(workout.duration)}</Text>
                                    </View>
                                    <View style={styles.detailPill}>
                                        <MaterialCommunityIcons name="fire" size={14} color={Colors.textSecondary} />
                                        <Text style={styles.workoutStat}>{workout.caloriesBurned || 0} kcal</Text>
                                    </View>
                                </View>
                            </BlurView>
                        ))
                    )}
                </View>
                <View style={{ height: 40 }} />
            </ScrollView>
        </LinearGradient>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingTop: 60,
        paddingHorizontal: Spacing.l,
        paddingBottom: 20,
    },
    backButton: {
        marginRight: 12,
        marginLeft: -10,
    },
    title: {
        fontSize: 28,
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
        marginBottom: 16,
    },

    // Stats Card
    statsCard: {
        backgroundColor: Colors.glassSurface,
        borderRadius: Layout.borderRadius.m,
        padding: 20,
        marginBottom: 20,
        borderWidth: 1,
        borderColor: Colors.glassBorder,
        overflow: 'hidden',
    },
    periodSelector: {
        flexDirection: 'row',
        marginBottom: 20,
        gap: 8,
    },
    periodButton: {
        flex: 1,
        paddingVertical: 10,
        borderRadius: Layout.borderRadius.s,
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        alignItems: 'center',
    },
    periodButtonActive: {
        backgroundColor: Colors.primaryStart,
    },
    periodButtonText: {
        color: Colors.textSecondary,
        fontSize: 14,
    },
    periodButtonTextActive: {
        color: Colors.textPrimary,
        fontWeight: 'bold',
    },
    statsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
    },
    statItem: {
        width: '47%',
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        borderRadius: Layout.borderRadius.s,
        padding: 16,
        alignItems: 'center',
    },
    statValue: {
        fontSize: 22,
        fontWeight: 'bold',
        color: Colors.textPrimary,
    },
    statLabel: {
        fontSize: 12,
        color: Colors.textTertiary,
        marginTop: 4,
    },
    avgScoreContainer: {
        marginTop: 20,
        alignItems: 'center',
        paddingTop: 16,
        borderTopWidth: 1,
        borderTopColor: Colors.glassBorder,
    },
    avgScoreLabel: {
        color: Colors.textSecondary,
        fontSize: 14,
        marginBottom: 4,
    },
    avgScoreValue: {
        fontSize: 36,
        fontWeight: 'bold',
    },
    scoreGood: {
        color: Colors.accentSuccess,
    },
    scoreWarning: {
        color: Colors.accentYellow,
    },
    scoreBad: {
        color: Colors.accentError,
    },

    // Personal Bests Card
    bestsCard: {
        backgroundColor: 'rgba(250, 204, 21, 0.05)',
        borderRadius: Layout.borderRadius.m,
        padding: 20,
        marginBottom: 20,
        borderWidth: 1,
        borderColor: 'rgba(250, 204, 21, 0.2)',
        overflow: 'hidden',
    },
    bestItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
        backgroundColor: 'rgba(255, 255, 255, 0.03)',
        padding: 12,
        borderRadius: Layout.borderRadius.s,
    },
    bestIconContainer: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: 'rgba(250, 204, 21, 0.1)',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    bestIcon: {
        fontSize: 22,
    },
    bestInfo: {
        flex: 1,
    },
    bestValue: {
        fontSize: 18,
        fontWeight: 'bold',
        color: Colors.textPrimary,
    },
    bestLabel: {
        fontSize: 12,
        color: Colors.textSecondary,
    },

    // History Card
    historySection: {
        marginBottom: 20,
    },
    workoutItem: {
        borderRadius: Layout.borderRadius.m,
        padding: 16,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: Colors.glassBorder,
        overflow: 'hidden',
    },
    workoutHeaderRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 12,
    },
    workoutExercise: {
        fontSize: 18,
        fontWeight: 'bold',
        color: Colors.textPrimary,
    },
    workoutDate: {
        fontSize: 13,
        color: Colors.textTertiary,
        marginTop: 2,
    },
    scoreBadge: {
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 8,
    },
    scoreBadgeGood: { backgroundColor: 'rgba(74, 222, 128, 0.2)' },
    scoreBadgeWarning: { backgroundColor: 'rgba(250, 204, 21, 0.2)' },
    scoreBadgeBad: { backgroundColor: 'rgba(248, 113, 113, 0.2)' },
    scoreBadgeText: {
        fontSize: 14,
        fontWeight: 'bold',
        color: Colors.textPrimary,
    },
    workoutDetails: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    detailPill: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 6,
        gap: 4,
    },
    workoutStat: {
        fontSize: 13,
        color: Colors.textSecondary,
    },

    // Empty State
    emptyState: {
        alignItems: 'center',
        paddingVertical: 60,
        borderRadius: Layout.borderRadius.m,
        borderWidth: 1,
        borderColor: Colors.glassBorder,
        borderStyle: 'dashed',
    },
    emptyIcon: {
        fontSize: 64,
        marginBottom: 16,
        opacity: 0.5,
    },
    emptyText: {
        fontSize: 20,
        fontWeight: 'bold',
        color: Colors.textPrimary,
    },
    emptySubtext: {
        fontSize: 14,
        color: Colors.textSecondary,
        marginTop: 8,
        textAlign: 'center',
        paddingHorizontal: 40,
    },
});
