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
import { useAppDispatch, useAppSelector } from '../hooks/reduxHooks';
import {
    fetchWorkoutHistory,
    fetchWorkoutStats,
    fetchPersonalBests
} from '../store/slices/workoutSlice';

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

    const formatDate = (date: Date): string => {
        const now = new Date();
        const diff = now.getTime() - date.getTime();
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));

        if (days === 0) return 'Today';
        if (days === 1) return 'Yesterday';
        if (days < 7) return `${days} days ago`;
        return date.toLocaleDateString();
    };

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.navigate('Home')}>
                    <Text style={styles.backButton}>← Back</Text>
                </TouchableOpacity>
                <Text style={styles.title}>Workout History</Text>
            </View>

            <ScrollView
                style={styles.content}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                }
            >
                {/* Stats Overview */}
                <View style={styles.statsCard}>
                    <Text style={styles.sectionTitle}>Your Stats</Text>

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
                            <Text style={styles.statLabel}>Workouts</Text>
                        </View>
                        <View style={styles.statItem}>
                            <Text style={styles.statValue}>{stats.totalReps}</Text>
                            <Text style={styles.statLabel}>Total Reps</Text>
                        </View>
                        <View style={styles.statItem}>
                            <Text style={styles.statValue}>{formatDuration(stats.totalDuration)}</Text>
                            <Text style={styles.statLabel}>Time</Text>
                        </View>
                        <View style={styles.statItem}>
                            <Text style={styles.statValue}>{stats.totalCalories}</Text>
                            <Text style={styles.statLabel}>Calories</Text>
                        </View>
                    </View>

                    <View style={styles.avgScoreContainer}>
                        <Text style={styles.avgScoreLabel}>Average Form Score</Text>
                        <Text style={[
                            styles.avgScoreValue,
                            stats.averageFormScore >= 80 ? styles.scoreGood :
                                stats.averageFormScore >= 60 ? styles.scoreWarning : styles.scoreBad
                        ]}>
                            {stats.averageFormScore}%
                        </Text>
                    </View>
                </View>

                {/* Personal Bests */}
                {(personalBests.maxReps || personalBests.longestWorkout || personalBests.bestFormScore) && (
                    <View style={styles.bestsCard}>
                        <Text style={styles.sectionTitle}>🏆 Personal Bests</Text>

                        {personalBests.maxReps && (
                            <View style={styles.bestItem}>
                                <Text style={styles.bestIcon}>💪</Text>
                                <View style={styles.bestInfo}>
                                    <Text style={styles.bestValue}>{personalBests.maxReps.value} reps</Text>
                                    <Text style={styles.bestLabel}>{personalBests.maxReps.exercise}</Text>
                                </View>
                            </View>
                        )}

                        {personalBests.longestWorkout && (
                            <View style={styles.bestItem}>
                                <Text style={styles.bestIcon}>⏱️</Text>
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
                                <Text style={styles.bestIcon}>⭐</Text>
                                <View style={styles.bestInfo}>
                                    <Text style={styles.bestValue}>{personalBests.bestFormScore.value}%</Text>
                                    <Text style={styles.bestLabel}>Best Form Score</Text>
                                </View>
                            </View>
                        )}
                    </View>
                )}

                {/* Workout History */}
                <View style={styles.historyCard}>
                    <Text style={styles.sectionTitle}>Recent Workouts</Text>

                    {loading && history.length === 0 ? (
                        <ActivityIndicator color="#6C63FF" size="large" />
                    ) : history.length === 0 ? (
                        <View style={styles.emptyState}>
                            <Text style={styles.emptyIcon}>🏋️</Text>
                            <Text style={styles.emptyText}>No workouts yet</Text>
                            <Text style={styles.emptySubtext}>Complete a workout to see it here</Text>
                        </View>
                    ) : (
                        history.map((workout) => (
                            <View key={workout.id} style={styles.workoutItem}>
                                <View style={styles.workoutHeader}>
                                    <Text style={styles.workoutExercise}>{workout.exerciseName}</Text>
                                    <Text style={styles.workoutDate}>{formatDate(workout.createdAt)}</Text>
                                </View>
                                <View style={styles.workoutDetails}>
                                    <Text style={styles.workoutStat}>{workout.reps} reps</Text>
                                    <Text style={styles.workoutStat}>{formatDuration(workout.duration)}</Text>
                                    <Text style={[
                                        styles.workoutScore,
                                        workout.averageFormScore >= 80 ? styles.scoreGood :
                                            workout.averageFormScore >= 60 ? styles.scoreWarning : styles.scoreBad
                                    ]}>
                                        {workout.averageFormScore}%
                                    </Text>
                                </View>
                            </View>
                        ))
                    )}
                </View>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#0A0E27',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingTop: 50,
        paddingHorizontal: 20,
        paddingBottom: 20,
    },
    backButton: {
        color: '#6C63FF',
        fontSize: 16,
        marginRight: 20,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#FFFFFF',
    },
    content: {
        flex: 1,
        paddingHorizontal: 20,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#FFFFFF',
        marginBottom: 16,
    },

    // Stats Card
    statsCard: {
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        borderRadius: 16,
        padding: 20,
        marginBottom: 20,
    },
    periodSelector: {
        flexDirection: 'row',
        marginBottom: 20,
        gap: 8,
    },
    periodButton: {
        flex: 1,
        paddingVertical: 8,
        borderRadius: 8,
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        alignItems: 'center',
    },
    periodButtonActive: {
        backgroundColor: '#6C63FF',
    },
    periodButtonText: {
        color: '#B0B3C1',
        fontSize: 14,
    },
    periodButtonTextActive: {
        color: '#FFFFFF',
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
        borderRadius: 12,
        padding: 16,
        alignItems: 'center',
    },
    statValue: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#FFFFFF',
    },
    statLabel: {
        fontSize: 12,
        color: '#B0B3C1',
        marginTop: 4,
    },
    avgScoreContainer: {
        marginTop: 16,
        alignItems: 'center',
    },
    avgScoreLabel: {
        color: '#B0B3C1',
        fontSize: 14,
    },
    avgScoreValue: {
        fontSize: 32,
        fontWeight: 'bold',
    },
    scoreGood: {
        color: '#00C853',
    },
    scoreWarning: {
        color: '#FFB800',
    },
    scoreBad: {
        color: '#FF4444',
    },

    // Personal Bests Card
    bestsCard: {
        backgroundColor: 'rgba(255, 215, 0, 0.1)',
        borderRadius: 16,
        padding: 20,
        marginBottom: 20,
        borderWidth: 1,
        borderColor: 'rgba(255, 215, 0, 0.3)',
    },
    bestItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    bestIcon: {
        fontSize: 24,
        marginRight: 12,
    },
    bestInfo: {
        flex: 1,
    },
    bestValue: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#FFFFFF',
    },
    bestLabel: {
        fontSize: 12,
        color: '#B0B3C1',
    },

    // History Card
    historyCard: {
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        borderRadius: 16,
        padding: 20,
        marginBottom: 40,
    },
    workoutItem: {
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
    },
    workoutHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 8,
    },
    workoutExercise: {
        fontSize: 16,
        fontWeight: '600',
        color: '#FFFFFF',
    },
    workoutDate: {
        fontSize: 12,
        color: '#B0B3C1',
    },
    workoutDetails: {
        flexDirection: 'row',
        gap: 16,
    },
    workoutStat: {
        fontSize: 14,
        color: '#B0B3C1',
    },
    workoutScore: {
        fontSize: 14,
        fontWeight: 'bold',
    },

    // Empty State
    emptyState: {
        alignItems: 'center',
        paddingVertical: 40,
    },
    emptyIcon: {
        fontSize: 48,
        marginBottom: 16,
    },
    emptyText: {
        fontSize: 18,
        fontWeight: '600',
        color: '#FFFFFF',
    },
    emptySubtext: {
        fontSize: 14,
        color: '#B0B3C1',
        marginTop: 8,
    },
});
