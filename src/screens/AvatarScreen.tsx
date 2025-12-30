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
    Image,
    Platform,
    Linking
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { useAppDispatch, useAppSelector } from '../hooks/reduxHooks';
import { uploadPhoto, signOut } from '../store/slices/authSlice';
import {
    avatarService,
    AvatarState,
    AVATAR_LEVELS,
    ACHIEVEMENTS
} from '../services/AvatarService';
import { exercises } from '../models/exercises'; // Import exercises data
import { Colors, Gradients, Spacing, Layout, Shadows } from '../theme/Theme';
import { MaterialCommunityIcons } from '@expo/vector-icons';

interface AvatarScreenProps {
    navigation: any;
}

export default function AvatarScreen({ navigation }: AvatarScreenProps) {
    const dispatch = useAppDispatch();
    const { user, loading: authLoading } = useAppSelector((state) => state.auth);
    const [avatarState, setAvatarState] = useState<AvatarState | null>(null);
    const [loading, setLoading] = useState(true);
    const [showMetricsModal, setShowMetricsModal] = useState(false);
    const [currentWeight, setCurrentWeight] = useState('');
    const [goalWeight, setGoalWeight] = useState('');
    const [showAllLevels, setShowAllLevels] = useState(false);

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

    const handlePickImage = async () => {
        try {
            const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
            if (!permission.granted) {
                Alert.alert('Permission Required', 'Please allow access to your photos to upload a profile picture.');
                return;
            }

            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                aspect: [1, 1],
                quality: 0.8,
            });

            if (!result.canceled && result.assets && result.assets.length > 0) {
                const uri = result.assets[0].uri;
                await dispatch(uploadPhoto(uri)).unwrap();
                Alert.alert('Success', 'Profile photo updated!');
            }
        } catch (error: any) {
            Alert.alert('Error', error.message || 'Failed to update photo');
        }
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

    const handleSignOut = () => {
        Alert.alert(
            'Sign Out',
            'Are you sure you want to sign out?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Sign Out',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await dispatch(signOut()).unwrap();
                            // Navigation to Auth stack is handled automatically
                        } catch (error: any) {
                            Alert.alert('Error', error.message || 'Failed to sign out');
                        }
                    }
                }
            ]
        );
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
                    <TouchableOpacity onPress={handlePickImage} activeOpacity={0.8}>
                        <LinearGradient
                            colors={Gradients.primary}
                            style={styles.avatarCircle}
                        >
                            {user?.photoURL ? (
                                <Image source={{ uri: user.photoURL }} style={styles.avatarImage} />
                            ) : (
                                <View style={styles.defaultAvatarContainer}>
                                    <MaterialCommunityIcons
                                        name="account-circle"
                                        size={140}
                                        color="rgba(255, 255, 255, 0.9)"
                                    />
                                </View>
                            )}
                            {authLoading && (
                                <View style={styles.uploadingOverlay}>
                                    <ActivityIndicator color="#FFF" />
                                </View>
                            )}
                            <View style={styles.editIconBadge}>
                                <MaterialCommunityIcons name="camera" size={20} color="white" />
                            </View>
                        </LinearGradient>
                    </TouchableOpacity>

                    <Text style={styles.userName}>{user?.displayName || 'Champion'}</Text>
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
                                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                    <View style={styles.metricArrow}>
                                        <Text style={styles.arrowText}>→</Text>
                                    </View>
                                    <View style={styles.metricItem}>
                                        <Text style={styles.metricLabel}>Goal</Text>
                                        <Text style={[styles.metricValue, styles.goalValue]}>
                                            {avatarState.bodyMetrics.goalWeight} <Text style={[styles.unit, styles.goalValue]}>kg</Text>
                                        </Text>
                                    </View>
                                </View>
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
                    <Text style={styles.sectionTitle}>Level Map & Unlocks</Text>
                    {AVATAR_LEVELS.slice(0, showAllLevels ? undefined : 1).map((level) => {
                        // Find exercises that unlock at this level
                        const levelExercises = exercises.filter(ex => ex.unlockLevel === level.level);

                        return (
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

                                    {/* Unlocked Exercises List */}
                                    {levelExercises.length > 0 && (
                                        <View style={styles.unlockedExercisesContainer}>
                                            <Text style={styles.unlockedLabel}>Unlocks:</Text>
                                            <View style={styles.unlockedList}>
                                                {levelExercises.map(ex => (
                                                    <Text key={ex.id} style={styles.unlockedItem}>• {ex.displayName}</Text>
                                                ))}
                                            </View>
                                        </View>
                                    )}
                                </View>
                                {avatarState.level >= level.level && (
                                    <Text style={styles.roadmapCheck}>✓</Text>
                                )}
                            </View>
                        );
                    })}

                    <TouchableOpacity
                        style={styles.showMoreButton}
                        onPress={() => setShowAllLevels(!showAllLevels)}
                    >
                        <Text style={styles.showMoreText}>
                            {showAllLevels ? 'Show Less' : `Show More (${AVATAR_LEVELS.length - 1})`}
                        </Text>
                        <MaterialCommunityIcons
                            name={showAllLevels ? 'chevron-up' : 'chevron-down'}
                            size={16}
                            color={Colors.primaryStart}
                        />
                    </TouchableOpacity>
                </BlurView>

                {/* Sign Out Button */}
                <TouchableOpacity style={styles.signOutButton} onPress={handleSignOut}>
                    <MaterialCommunityIcons name="logout" size={20} color={Colors.textPrimary} />
                    <Text style={styles.signOutButtonText}>Sign Out</Text>
                </TouchableOpacity>

                {/* Premium Settings & Support Section */}
                <BlurView intensity={25} tint="dark" style={styles.premiumSettingsSection}>
                    <LinearGradient
                        colors={['rgba(255, 255, 255, 0.05)', 'transparent']}
                        style={styles.premiumSettingsGradient}
                    >
                        <View style={styles.legalHeader}>
                            <View style={styles.premiumIconBadge}>
                                <MaterialCommunityIcons name="shield-crown-outline" size={18} color={Colors.accentCyan} />
                            </View>
                            <Text style={styles.legalTitle}>Settings & Support</Text>
                        </View>

                        <View style={styles.premiumDivider} />

                        <View style={styles.legalList}>
                            {[
                                { title: 'About Us', icon: 'information-variant', route: 'AboutUs' },
                                { title: 'Privacy Policy', icon: 'shield-lock-outline', route: 'PrivacyPolicy' },
                                { title: 'Terms of Service', icon: 'text-box-check-outline', route: 'TermsOfService' },
                                { title: 'Camera & Data Usage', icon: 'eye-outline', route: 'DataUsage' },
                            ].map((item, index) => (
                                <TouchableOpacity
                                    key={item.route}
                                    style={styles.premiumLevelItem}
                                    onPress={() => navigation.navigate(item.route)}
                                    activeOpacity={0.7}
                                >
                                    <View style={styles.legalItemLeft}>
                                        <View style={styles.premiumIconContainer}>
                                            <MaterialCommunityIcons name={item.icon as any} size={20} color={Colors.textSecondary} />
                                        </View>
                                        <Text style={styles.premiumItemText}>{item.title}</Text>
                                    </View>
                                    <MaterialCommunityIcons name="chevron-right" size={20} color="rgba(255, 255, 255, 0.2)" />
                                </TouchableOpacity>
                            ))}

                            <TouchableOpacity
                                style={styles.premiumLevelItem}
                                onPress={() => Linking.openURL('mailto:fizi.fitnessgenie@gmail.com')}
                                activeOpacity={0.7}
                            >
                                <View style={styles.legalItemLeft}>
                                    <View style={[styles.premiumIconContainer, { backgroundColor: 'rgba(34, 211, 238, 0.1)' }]}>
                                        <MaterialCommunityIcons name="help-circle-outline" size={20} color={Colors.accentCyan} />
                                    </View>
                                    <Text style={[styles.premiumItemText, { color: Colors.accentCyan }]}>Contact Support</Text>
                                </View>
                                <MaterialCommunityIcons name="email-fast-outline" size={18} color={Colors.accentCyan} />
                            </TouchableOpacity>

                            {/* Integrated Danger Action */}
                            <View style={styles.premiumDivider} />

                            <TouchableOpacity
                                style={[styles.premiumLevelItem, { borderBottomWidth: 0 }]}
                                onPress={() => Linking.openURL('mailto:fizi.fitnessgenie@gmail.com?subject=Delete Account Request&body=Please delete my account and all associated data.')}
                                activeOpacity={0.7}
                            >
                                <View style={styles.legalItemLeft}>
                                    <View style={[styles.premiumIconContainer, { backgroundColor: 'rgba(248, 113, 113, 0.1)' }]}>
                                        <MaterialCommunityIcons name="account-remove-outline" size={20} color={Colors.accentError} />
                                    </View>
                                    <View>
                                        <Text style={[styles.premiumItemText, { color: Colors.accentError }]}>Delete Account</Text>
                                        <Text style={styles.deleteSubtext}>Request data deletion</Text>
                                    </View>
                                </View>
                                <MaterialCommunityIcons name="chevron-right" size={20} color="rgba(248, 113, 113, 0.3)" />
                            </TouchableOpacity>
                        </View>
                    </LinearGradient>
                </BlurView>

                {/* Health Disclaimer */}
                <View style={styles.disclaimerContainer}>
                    <Text style={styles.disclaimerText}>
                        Disclaimer: This app provides general fitness guidance only. It is not a medical application. Consult a qualified professional before starting any workout program.
                    </Text>
                </View>

                <View style={{ height: 40 }} />
            </ScrollView>

            {/* Metrics Modal */}
            {
                showMetricsModal && (
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
                )
            }
        </LinearGradient >
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
        color: Colors.accentCyan,
        fontSize: 16,
        fontWeight: '600',
    },
    title: {
        fontSize: 32,
        fontWeight: '900',
        color: Colors.textPrimary,
        letterSpacing: 0.5,
        textShadowColor: 'rgba(79, 70, 229, 0.5)',
        textShadowOffset: { width: 0, height: 4 },
        textShadowRadius: 15,
    },
    content: {
        flex: 1,
        paddingHorizontal: Spacing.l,
    },
    sectionTitle: {
        fontSize: 19,
        fontWeight: '800',
        color: Colors.textPrimary,
        marginBottom: Spacing.m,
        letterSpacing: 0.3,
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
        backgroundColor: 'rgba(79, 70, 229, 0.05)',
    },
    avatarCircle: {
        width: 160,
        height: 160,
        borderRadius: 80,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: Spacing.m,
        ...Shadows.glow,
        borderWidth: 4,
        borderColor: 'rgba(255, 255, 255, 0.1)',
    },
    avatarEmoji: {
        fontSize: 80,
    },
    defaultAvatarContainer: {
        width: 160,
        height: 160,
        borderRadius: 80,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
    },
    avatarImage: {
        width: 152,
        height: 152,
        borderRadius: 76,
        borderWidth: 2,
        borderColor: 'rgba(255, 255, 255, 0.4)',
    },
    uploadingOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 80,
    },
    editIconBadge: {
        position: 'absolute',
        bottom: 4,
        right: 4,
        backgroundColor: Colors.accentCyan,
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 3,
        borderColor: Colors.backgroundDark,
        ...Shadows.small,
    },
    editIconText: {
        fontSize: 18,
    },
    userName: {
        fontSize: 24, // Main name size
        fontWeight: '800',
        color: Colors.textPrimary,
        marginTop: Spacing.m,
        marginBottom: 4,
        textAlign: 'center',
        textShadowColor: 'rgba(0,0,0,0.5)',
        textShadowOffset: { width: 0, height: 1 },
        textShadowRadius: 4,
    },
    levelName: {
        fontSize: 16, // Reduced slightly to be secondary to name
        fontWeight: '600',
        color: Colors.accentCyan,
        marginBottom: Spacing.xs,
        textAlign: 'center',
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    levelBadge: {
        fontSize: 15,
        color: Colors.accentCyan,
        marginTop: 6,
        fontWeight: '700',
        letterSpacing: 1,
        textTransform: 'uppercase',
    },
    streakContainer: {
        marginTop: Spacing.m,
        overflow: 'hidden',
        borderRadius: Layout.borderRadius.round,
        ...Shadows.small,
    },
    streakGradient: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 10,
        paddingHorizontal: 20,
    },
    streakIcon: {
        fontSize: 18,
        marginRight: 8,
    },
    streakText: {
        color: Colors.textPrimary,
        fontSize: 15,
        fontWeight: '800',
    },

    // Progress Card
    progressCard: {
        borderRadius: Layout.borderRadius.l,
        padding: Spacing.l,
        marginBottom: Spacing.l,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: Colors.glassBorder,
        backgroundColor: 'rgba(0, 0, 0, 0.2)',
    },
    progressItem: {
        marginBottom: Spacing.m,
    },
    progressHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 10,
        alignItems: 'center',
    },
    progressLabel: {
        color: Colors.textPrimary,
        fontSize: 15,
        fontWeight: '700',
    },
    progressValue: {
        color: Colors.accentCyan,
        fontSize: 15,
        fontWeight: '800',
    },
    progressBarBg: {
        height: 14,
        backgroundColor: 'rgba(255, 255, 255, 0.08)',
        borderRadius: 7,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.1)',
    },
    progressFill: {
        height: '100%',
        borderRadius: 7,
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
        padding: Spacing.s, // Reduced padding
        marginBottom: Spacing.l,
        overflow: 'hidden',
    },
    achievementsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8, // Reduced gap
    },
    achievementItem: {
        width: '22%', // Fit 4 per row
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        borderRadius: 8,
        padding: 8, // Reduced padding
        alignItems: 'center',
    },
    achievementLocked: {
        opacity: 0.5,
    },
    achievementIcon: {
        fontSize: 24, // Reduced icon size
        marginBottom: 2,
    },
    achievementName: {
        color: Colors.textPrimary,
        fontSize: 9, // Reduced font size
        textAlign: 'center',
    },
    achievementNameLocked: {
        color: Colors.textTertiary,
    },

    // Roadmap Card
    roadmapCard: {
        borderRadius: Layout.borderRadius.m,
        padding: Spacing.s, // Reduced padding
        marginBottom: Spacing.l,
        overflow: 'hidden',
    },
    roadmapItem: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        paddingVertical: 8, // Reduced vertical padding
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
        fontSize: 24, // Increased back for readability
        marginRight: 10,
        marginTop: 2,
    },
    roadmapInfo: {
        flex: 1,
    },
    roadmapName: {
        color: Colors.textSecondary,
        fontSize: 16, // Increased back
        fontWeight: '600',
    },
    roadmapNameActive: {
        color: Colors.textPrimary,
    },
    roadmapReq: {
        color: Colors.textTertiary,
        fontSize: 12, // Increased back
        marginTop: 2,
    },
    roadmapCheck: {
        color: Colors.accentSuccess,
        fontSize: 18, // Increased back
        fontWeight: 'bold',
        marginLeft: 8,
    },

    // Sign Out Button
    signOutButton: {
        marginTop: 16,
        padding: 12,
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        borderRadius: 12,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: Colors.glassBorder,
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 8,
    },
    signOutButtonText: {
        color: Colors.textPrimary,
        fontSize: 16, // Increased back
        fontWeight: '600',
    },



    // Unlocked Exercises Styles
    unlockedExercisesContainer: {
        marginTop: 4, // Reduced margin
        backgroundColor: 'rgba(255,255,255,0.05)',
        borderRadius: 6,
        padding: 6, // Reduced padding
    },
    unlockedLabel: {
        color: Colors.accentCyan,
        fontSize: 12, // Increased back
        fontWeight: 'bold',
        marginBottom: 2,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    unlockedList: {
        flexDirection: 'column',
    },
    unlockedItem: {
        color: Colors.textSecondary,
        fontSize: 12, // Increased back
        marginBottom: 1,
    },

    showMoreButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingTop: 12,
        paddingBottom: 4,
        gap: 4,
    },
    showMoreText: {
        color: Colors.primaryStart,
        fontSize: 12,
        fontWeight: '600',
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
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        borderRadius: 12,
        alignItems: 'center',
    },
    cancelButtonText: {
        color: Colors.textPrimary,
        fontWeight: '600',
        fontSize: 16,
    },

    // Disclaimer
    disclaimerContainer: {
        marginTop: 20,
        paddingHorizontal: 16,
        marginBottom: 10,
    },
    disclaimerText: {
        color: Colors.textTertiary,
        fontSize: 11,
        textAlign: 'center',
        fontStyle: 'italic',
        lineHeight: 16,
    },

    saveButton: {
        padding: 16,
        borderRadius: 12,
        alignItems: 'center',
    },
    saveButtonText: {
        color: 'white',
        fontSize: 16,
        ...Shadows.glow,
        fontWeight: 'bold',
    },

    legalText: {
        fontSize: 16,
        color: Colors.textPrimary,
        fontWeight: '500',
    },

    // Premium Settings Section
    premiumSettingsSection: {
        marginTop: 24,
        borderRadius: Layout.borderRadius.xl,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.08)',
        backgroundColor: 'rgba(0, 0, 0, 0.25)',
    },
    premiumSettingsGradient: {
        paddingTop: 4,
    },
    premiumIconBadge: {
        width: 36,
        height: 36,
        borderRadius: 12,
        backgroundColor: 'rgba(34, 211, 238, 0.12)',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(34, 211, 238, 0.25)',
    },
    premiumDivider: {
        height: 1,
        backgroundColor: 'rgba(255, 255, 255, 0.06)',
        marginHorizontal: 20,
    },
    legalHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 18,
        gap: 14,
    },
    legalTitle: {
        fontSize: 19,
        fontWeight: '800',
        color: Colors.textPrimary,
        letterSpacing: 0.5,
    },
    legalList: {
        paddingBottom: 4,
    },
    legalItemLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 16,
    },
    premiumLevelItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 16,
        paddingHorizontal: 20,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255, 255, 255, 0.04)',
    },
    premiumIconContainer: {
        width: 42,
        height: 42,
        borderRadius: 13,
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.08)',
    },
    premiumItemText: {
        fontSize: 16,
        color: Colors.textPrimary,
        fontWeight: '700',
        letterSpacing: 0.4,
    },
    deleteSubtext: {
        fontSize: 12,
        color: 'rgba(248, 113, 113, 0.5)',
        marginTop: 2,
    },
});
