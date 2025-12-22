import React, { useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { useAppDispatch, useAppSelector } from '../hooks/reduxHooks';
import { signOut } from '../store/slices/authSlice';
import { fetchWorkoutStats } from '../store/slices/workoutSlice';
import MotivationalTip from '../components/MotivationalTip';
import { Colors, Gradients, Spacing, Shadows, Layout } from '../theme/Theme';

interface HomeScreenProps {
    navigation: any;
}

const { width } = Dimensions.get('window');

export default function HomeScreen({ navigation }: HomeScreenProps) {
    const dispatch = useAppDispatch();
    const { user } = useAppSelector((state) => state.auth);
    const { stats } = useAppSelector((state) => state.workout);

    useEffect(() => {
        dispatch(fetchWorkoutStats('week'));
    }, [dispatch]);

    const handleSignOut = async () => {
        await dispatch(signOut());
    };

    return (
        <LinearGradient
            colors={Gradients.background}
            style={styles.container}
        >
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
                {/* Header Section */}
                <View style={styles.header}>
                    <View>
                        <Text style={styles.greeting}>Hello,</Text>
                        <Text style={styles.title}>{user?.displayName || 'Champion'}! 👋</Text>
                    </View>
                    <TouchableOpacity style={styles.avatarCircle} onPress={() => navigation.navigate('Avatar')}>
                        <Text style={styles.avatarText}>{user?.displayName?.[0] || 'U'}</Text>
                    </TouchableOpacity>
                </View>

                {/* Motivational Tip */}
                <View style={styles.section}>
                    <MotivationalTip />
                </View>

                {/* Quick Stats Glass Card */}
                <BlurView intensity={20} tint="light" style={styles.statsCard}>
                    <View style={styles.statsHeader}>
                        <Text style={styles.statsTitle}>This Week's Activity</Text>
                        <Text style={styles.statsSubtitle}>Keep pushing!</Text>
                    </View>

                    <View style={styles.statsRow}>
                        <View style={styles.statItem}>
                            <Text style={styles.statValue}>{stats.totalWorkouts}</Text>
                            <Text style={styles.statLabel}>Workouts</Text>
                        </View>
                        <View style={styles.statDivider} />
                        <View style={styles.statItem}>
                            <Text style={styles.statValue}>{stats.totalReps}</Text>
                            <Text style={styles.statLabel}>Reps</Text>
                        </View>
                        <View style={styles.statDivider} />
                        <View style={styles.statItem}>
                            <Text style={[
                                styles.statValue,
                                { color: stats.averageFormScore >= 80 ? Colors.accentSuccess : Colors.accentError }
                            ]}>
                                {stats.averageFormScore || '--'}%
                            </Text>
                            <Text style={styles.statLabel}>Avg Form</Text>
                        </View>
                    </View>
                </BlurView>

                {/* Main Action - Start Workout */}
                <TouchableOpacity
                    activeOpacity={0.9}
                    onPress={() => navigation.navigate('Camera')}
                    style={styles.startButtonContainer}
                >
                    <LinearGradient
                        colors={Gradients.primary}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={styles.startButton}
                    >
                        <View style={styles.startButtonContent}>
                            <Text style={styles.startButtonIcon}>🏋️</Text>
                            <View>
                                <Text style={styles.startButtonText}>Start Workout</Text>
                                <Text style={styles.startButtonSubtext}>AI-Powered Form Correction</Text>
                            </View>
                        </View>
                    </LinearGradient>
                </TouchableOpacity>

                {/* Secondary Actions */}
                <View style={styles.actionsGrid}>
                    <TouchableOpacity
                        style={styles.actionCard}
                        onPress={() => navigation.navigate('History')}
                    >
                        <BlurView intensity={10} tint="light" style={styles.actionCardBlur}>
                            <Text style={styles.actionIcon}>📊</Text>
                            <Text style={styles.actionTitle}>History</Text>
                        </BlurView>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.actionCard}
                        onPress={() => navigation.navigate('Avatar')}
                    >
                        <BlurView intensity={10} tint="light" style={styles.actionCardBlur}>
                            <Text style={styles.actionIcon}>🏆</Text>
                            <Text style={styles.actionTitle}>Avatar</Text>
                        </BlurView>
                    </TouchableOpacity>
                </View>

                {/* Logout */}
                <TouchableOpacity style={styles.logoutButton} onPress={handleSignOut}>
                    <Text style={styles.logoutText}>Sign Out</Text>
                </TouchableOpacity>

                <View style={{ height: 40 }} />
            </ScrollView>
        </LinearGradient>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    scrollContent: {
        padding: Spacing.l,
        paddingTop: 60,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: Spacing.l,
    },
    greeting: {
        fontSize: 16,
        color: Colors.textSecondary,
        marginBottom: 4,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: Colors.textPrimary,
    },
    avatarCircle: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: Colors.glassSurface,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: Colors.glassBorder,
    },
    avatarText: {
        fontSize: 20,
        fontWeight: 'bold',
        color: Colors.primaryStart,
    },
    section: {
        marginBottom: Spacing.l,
    },

    // Stats Card
    statsCard: {
        borderRadius: Layout.borderRadius.l,
        padding: Spacing.l,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: Colors.glassBorder,
        marginBottom: Spacing.xl,
    },
    statsHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: Spacing.m,
    },
    statsTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: Colors.textPrimary,
    },
    statsSubtitle: {
        fontSize: 12,
        color: Colors.accentCyan,
    },
    statsRow: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
    },
    statItem: {
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
    statDivider: {
        width: 1,
        height: 30,
        backgroundColor: Colors.glassBorder,
    },

    // Start Button
    startButtonContainer: {
        ...Shadows.glow,
        marginBottom: Spacing.l,
    },
    startButton: {
        borderRadius: Layout.borderRadius.l,
        padding: Spacing.l,
    },
    startButtonContent: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: Spacing.m,
    },
    startButtonIcon: {
        fontSize: 32,
    },
    startButtonText: {
        fontSize: 20,
        fontWeight: 'bold',
        color: Colors.textPrimary,
    },
    startButtonSubtext: {
        fontSize: 12,
        color: 'rgba(255, 255, 255, 0.8)',
    },

    // Actions Grid
    actionsGrid: {
        flexDirection: 'row',
        gap: Spacing.m,
        marginBottom: Spacing.xl,
    },
    actionCard: {
        flex: 1,
        borderRadius: Layout.borderRadius.m,
        overflow: 'hidden',
        height: 100,
    },
    actionCardBlur: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: Colors.glassSurface,
    },
    actionIcon: {
        fontSize: 28,
        marginBottom: 8,
    },
    actionTitle: {
        fontSize: 14,
        fontWeight: '600',
        color: Colors.textPrimary,
    },

    logoutButton: {
        alignItems: 'center',
        padding: Spacing.m,
    },
    logoutText: {
        color: Colors.textTertiary,
        fontSize: 14,
    },
});
