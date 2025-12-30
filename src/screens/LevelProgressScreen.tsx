import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Dimensions,
} from 'react-native';
import { useSelector } from 'react-redux';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { RootState } from '../store';
import { ProgressionService } from '../services/ProgressionService';
import { Colors, Gradients, Spacing, Layout, Shadows } from '../theme/Theme';
import { MaterialCommunityIcons } from '@expo/vector-icons';

interface LevelProgressScreenProps {
    navigation: any;
}

const { width } = Dimensions.get('window');
const CIRCLE_SIZE = 180;

export default function LevelProgressScreen({ navigation }: LevelProgressScreenProps) {
    const { user } = useSelector((state: RootState) => state.auth);

    const progress = user?.progressSystem || {
        currentLevel: 1,
        currentXP: 0,
        xpToNextLevel: 1000,
        totalWorkoutsCompleted: 0,
        unlockedExercises: []
    };

    const currentLevel = progress.currentLevel;
    const currentXP = progress.currentXP;

    const levelThreshold = ProgressionService.getXPThresholdForLevel(currentLevel);
    const nextLevelThreshold = ProgressionService.getXPThresholdForLevel(currentLevel + 1);
    const xpInCurrentLevel = currentXP - levelThreshold;
    const xpRequiredForLevel = nextLevelThreshold - levelThreshold;
    const progressPercent = Math.min(100, Math.round((xpInCurrentLevel / xpRequiredForLevel) * 100));

    const unlockedExercises = ProgressionService.getExercisesUnlockedAtLevel(currentLevel);
    const upNext = ProgressionService.getExercisesUnlockedAtLevel(currentLevel + 1);

    return (
        <LinearGradient colors={Gradients.background} style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.navigate('Home')} style={styles.backButton}>
                    <MaterialCommunityIcons name="arrow-left" size={24} color={Colors.accentCyan} />
                    <Text style={styles.backButtonText}>Back</Text>
                </TouchableOpacity>
                <Text style={styles.title}>Level Progress</Text>
            </View>

            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                {/* Premium Level Card */}
                <View style={styles.levelCardContainer}>
                    <BlurView intensity={30} tint="dark" style={styles.levelCard}>
                        {/* Decorative gradient background */}
                        <LinearGradient
                            colors={['rgba(139, 92, 246, 0.15)', 'rgba(59, 130, 246, 0.15)']}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                            style={styles.levelCardGradient}
                        />

                        {/* Progress Circle */}
                        <View style={styles.circleContainer}>
                            {/* Outer glow ring */}
                            <View style={[styles.glowRing, { opacity: 0.3 }]}>
                                <LinearGradient
                                    colors={Gradients.primary}
                                    style={styles.glowRingGradient}
                                />
                            </View>

                            {/* Progress track */}
                            <LinearGradient
                                colors={['rgba(139, 92, 246, 0.2)', 'rgba(59, 130, 246, 0.2)']}
                                style={styles.progressCircle}
                            />

                            {/* Center content */}
                            <LinearGradient
                                colors={Gradients.primary}
                                style={styles.levelCircleInner}
                            >
                                <Text style={styles.levelNumber}>{currentLevel}</Text>
                                <Text style={styles.levelLabel}>LEVEL</Text>
                                <View style={styles.levelBadge}>
                                    <Text style={styles.levelBadgeText}>Warrior</Text>
                                </View>
                            </LinearGradient>
                        </View>

                        {/* XP Progress Info */}
                        <View style={styles.xpContainer}>
                            <View style={styles.xpRow}>
                                <View style={styles.xpBadge}>
                                    <MaterialCommunityIcons name="star" size={16} color={Colors.accentYellow} />
                                    <Text style={styles.xpBadgeText}>{xpInCurrentLevel.toLocaleString()}</Text>
                                </View>
                                <Text style={styles.xpDivider}>/</Text>
                                <Text style={styles.xpTarget}>{xpRequiredForLevel.toLocaleString()} XP</Text>
                            </View>

                            {/* Premium Progress Bar */}
                            <View style={styles.progressBarContainer}>
                                <View style={styles.progressBarBg}>
                                    <LinearGradient
                                        colors={Gradients.primary}
                                        start={{ x: 0, y: 0 }}
                                        end={{ x: 1, y: 0 }}
                                        style={[styles.progressBarFill, { width: `${progressPercent}%` }]}
                                    >
                                        <BlurView intensity={20} tint="light" style={styles.progressShine} />
                                    </LinearGradient>
                                </View>
                                <Text style={styles.progressPercentBadge}>{progressPercent}%</Text>
                            </View>

                            <View style={styles.totalXPContainer}>
                                <MaterialCommunityIcons name="trophy" size={14} color={Colors.accentYellow} />
                                <Text style={styles.totalXPText}>Total: {currentXP.toLocaleString()} XP</Text>
                            </View>
                        </View>
                    </BlurView>
                </View>

                {/* Stats Row */}
                <View style={styles.statsRow}>
                    <BlurView intensity={20} tint="dark" style={styles.statCard}>
                        <View style={styles.statIcon}>
                            <MaterialCommunityIcons name="dumbbell" size={24} color={Colors.primaryStart} />
                        </View>
                        <Text style={styles.statValue}>{progress.totalWorkoutsCompleted}</Text>
                        <Text style={styles.statLabel}>Workouts</Text>
                    </BlurView>

                    <BlurView intensity={20} tint="dark" style={styles.statCard}>
                        <View style={styles.statIcon}>
                            <MaterialCommunityIcons name="fire" size={24} color={Colors.accentPink} />
                        </View>
                        <Text style={styles.statValue}>{currentLevel * 5}%</Text>
                        <Text style={styles.statLabel}>Strength</Text>
                    </BlurView>

                    <BlurView intensity={20} tint="dark" style={styles.statCard}>
                        <View style={styles.statIcon}>
                            <MaterialCommunityIcons name="flash" size={24} color={Colors.accentYellow} />
                        </View>
                        <Text style={styles.statValue}>{unlockedExercises.length}</Text>
                        <Text style={styles.statLabel}>Unlocked</Text>
                    </BlurView>
                </View>

                {/* Unlocked This Level */}
                {unlockedExercises.length > 0 && (
                    <View style={styles.section}>
                        <View style={styles.sectionHeader}>
                            <MaterialCommunityIcons name="trophy-award" size={20} color={Colors.accentYellow} />
                            <Text style={styles.sectionTitle}>Unlocked at Level {currentLevel}</Text>
                        </View>
                        <View style={styles.exerciseGrid}>
                            {unlockedExercises.map(ex => (
                                <BlurView key={ex.id} intensity={15} tint="dark" style={styles.exerciseBadge}>
                                    <View style={styles.exerciseBadgeIcon}>
                                        <MaterialCommunityIcons name="check-circle" size={16} color={Colors.accentSuccess} />
                                    </View>
                                    <Text style={styles.exerciseBadgeName}>{ex.name}</Text>
                                </BlurView>
                            ))}
                        </View>
                    </View>
                )}

                {/* Coming Soon */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <MaterialCommunityIcons name="lock-clock" size={20} color={Colors.accentCyan} />
                        <Text style={styles.sectionTitle}>Next at Level {currentLevel + 1}</Text>
                    </View>
                    {upNext.length > 0 ? (
                        <View style={styles.exerciseGrid}>
                            {upNext.map(ex => (
                                <BlurView key={ex.id} intensity={10} tint="dark" style={styles.lockedBadge}>
                                    <View style={styles.lockedBadgeIcon}>
                                        <MaterialCommunityIcons name="lock" size={16} color={Colors.textSecondary} />
                                    </View>
                                    <Text style={styles.lockedBadgeName}>{ex.name}</Text>
                                </BlurView>
                            ))}
                        </View>
                    ) : (
                        <BlurView intensity={15} tint="dark" style={styles.emptyCard}>
                            <MaterialCommunityIcons name="rocket" size={32} color={Colors.primaryStart} />
                            <Text style={styles.emptyText}>All exercises unlocked!</Text>
                            <Text style={styles.emptySubtext}>Keep training to master them all!</Text>
                        </BlurView>
                    )}
                </View>

                <TouchableOpacity
                    style={styles.actionButton}
                    activeOpacity={0.9}
                    onPress={() => navigation.navigate('ExerciseLibrary')}
                >
                    <LinearGradient
                        colors={Gradients.primary}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={styles.actionGradient}
                    >
                        <MaterialCommunityIcons name="library" size={20} color={Colors.textPrimary} />
                        <Text style={styles.actionText}>Browse Exercise Library</Text>
                        <MaterialCommunityIcons name="arrow-right" size={20} color={Colors.textPrimary} />
                    </LinearGradient>
                </TouchableOpacity>

                <View style={{ height: 100 }} />
            </ScrollView>
        </LinearGradient>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        paddingTop: 60,
        paddingHorizontal: Spacing.l,
        paddingBottom: Spacing.m,
        flexDirection: 'row',
        alignItems: 'center',
        gap: Spacing.m,
    },
    backButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    backButtonText: {
        color: Colors.accentCyan,
        fontSize: 16,
        fontWeight: '600',
    },
    title: {
        fontSize: 28,
        fontWeight: '800',
        color: Colors.textPrimary,
        letterSpacing: 0.5,
    },
    content: {
        flex: 1,
        paddingHorizontal: Spacing.l,
    },

    // Premium Level Card
    levelCardContainer: {
        marginBottom: Spacing.l,
        ...Shadows.glow,
    },
    levelCard: {
        borderRadius: Layout.borderRadius.xl,
        padding: Spacing.xl,
        alignItems: 'center',
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: Colors.glassBorder,
    },
    levelCardGradient: {
        ...StyleSheet.absoluteFillObject,
    },
    circleContainer: {
        width: CIRCLE_SIZE,
        height: CIRCLE_SIZE,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: Spacing.l,
    },
    glowRing: {
        position: 'absolute',
        width: CIRCLE_SIZE + 20,
        height: CIRCLE_SIZE + 20,
        borderRadius: (CIRCLE_SIZE + 20) / 2,
        overflow: 'hidden',
    },
    glowRingGradient: {
        flex: 1,
    },
    progressCircle: {
        position: 'absolute',
        width: CIRCLE_SIZE,
        height: CIRCLE_SIZE,
        borderRadius: CIRCLE_SIZE / 2,
        borderWidth: 8,
        borderColor: 'rgba(255,255,255,0.1)',
    },
    levelCircleInner: {
        width: CIRCLE_SIZE - 20,
        height: CIRCLE_SIZE - 20,
        borderRadius: (CIRCLE_SIZE - 20) / 2,
        justifyContent: 'center',
        alignItems: 'center',
        ...Shadows.card,
    },
    levelNumber: {
        fontSize: 64,
        fontWeight: '900',
        color: Colors.textPrimary,
        textShadowColor: 'rgba(0, 0, 0, 0.3)',
        textShadowOffset: { width: 0, height: 2 },
        textShadowRadius: 4,
    },
    levelLabel: {
        fontSize: 12,
        fontWeight: '700',
        color: Colors.textPrimary,
        opacity: 0.9,
        letterSpacing: 2,
        marginTop: -8,
    },
    levelBadge: {
        marginTop: 8,
        paddingHorizontal: 12,
        paddingVertical: 4,
        backgroundColor: 'rgba(255,255,255,0.2)',
        borderRadius: 12,
    },
    levelBadgeText: {
        fontSize: 10,
        fontWeight: '700',
        color: Colors.textPrimary,
        textTransform: 'uppercase',
        letterSpacing: 1,
    },

    // XP Section
    xpContainer: {
        width: '100%',
    },
    xpRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: Spacing.m,
    },
    xpBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255, 215, 0, 0.15)',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
        gap: 6,
        borderWidth: 1,
        borderColor: 'rgba(255, 215, 0, 0.3)',
    },
    xpBadgeText: {
        fontSize: 16,
        fontWeight: '800',
        color: Colors.accentYellow,
    },
    xpDivider: {
        fontSize: 14,
        color: Colors.textSecondary,
        marginHorizontal: 8,
    },
    xpTarget: {
        fontSize: 15,
        fontWeight: '600',
        color: Colors.textSecondary,
    },
    progressBarContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: Spacing.s,
        marginBottom: Spacing.s,
    },
    progressBarBg: {
        flex: 1,
        height: 16,
        backgroundColor: 'rgba(255, 255, 255, 0.08)',
        borderRadius: 8,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
    },
    progressBarFill: {
        height: '100%',
        justifyContent: 'center',
        position: 'relative',
    },
    progressShine: {
        ...StyleSheet.absoluteFillObject,
        opacity: 0.3,
    },
    progressPercentBadge: {
        fontSize: 12,
        fontWeight: '800',
        color: Colors.primaryStart,
        minWidth: 40,
        textAlign: 'right',
    },
    totalXPContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
    },
    totalXPText: {
        color: Colors.textSecondary,
        fontSize: 13,
        fontWeight: '600',
    },

    // Stats Row
    statsRow: {
        flexDirection: 'row',
        gap: Spacing.m,
        marginBottom: Spacing.xl,
    },
    statCard: {
        flex: 1,
        borderRadius: Layout.borderRadius.l,
        padding: Spacing.m,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: Colors.glassBorder,
        overflow: 'hidden',
    },
    statIcon: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: 'rgba(255,255,255,0.1)',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: Spacing.s,
    },
    statValue: {
        fontSize: 22,
        fontWeight: '900',
        color: Colors.textPrimary,
    },
    statLabel: {
        fontSize: 11,
        color: Colors.textSecondary,
        fontWeight: '600',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },

    // Sections
    section: {
        marginBottom: Spacing.xl,
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: Spacing.s,
        marginBottom: Spacing.m,
    },
    sectionTitle: {
        fontSize: 17,
        fontWeight: '700',
        color: Colors.textPrimary,
    },
    exerciseGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: Spacing.s,
    },
    exerciseBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 10,
        paddingHorizontal: 14,
        borderRadius: 12,
        gap: 8,
        borderWidth: 1,
        borderColor: 'rgba(0, 200, 83, 0.3)',
        overflow: 'hidden',
    },
    exerciseBadgeIcon: {
        width: 22,
        height: 22,
        borderRadius: 11,
        backgroundColor: 'rgba(0, 200, 83, 0.2)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    exerciseBadgeName: {
        color: Colors.textPrimary,
        fontWeight: '600',
        fontSize: 13,
    },
    lockedBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 10,
        paddingHorizontal: 14,
        borderRadius: 12,
        gap: 8,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
        opacity: 0.6,
        overflow: 'hidden',
    },
    lockedBadgeIcon: {
        width: 22,
        height: 22,
        borderRadius: 11,
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    lockedBadgeName: {
        color: Colors.textSecondary,
        fontWeight: '600',
        fontSize: 13,
    },
    emptyCard: {
        padding: Spacing.xl,
        borderRadius: Layout.borderRadius.l,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: Colors.glassBorder,
        overflow: 'hidden',
    },
    emptyText: {
        color: Colors.textPrimary,
        fontSize: 16,
        fontWeight: '700',
        marginTop: Spacing.s,
    },
    emptySubtext: {
        color: Colors.textSecondary,
        fontSize: 13,
        marginTop: 4,
    },

    // Action Button
    actionButton: {
        marginTop: Spacing.m,
        marginBottom: Spacing.m,
        borderRadius: Layout.borderRadius.l,
        overflow: 'hidden',
        ...Shadows.card,
    },
    actionGradient: {
        paddingVertical: 16,
        paddingHorizontal: Spacing.l,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: Spacing.s,
    },
    actionText: {
        color: Colors.textPrimary,
        fontSize: 16,
        fontWeight: '700',
    },
});
