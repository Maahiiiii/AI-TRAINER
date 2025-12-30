import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Dimensions, ActivityIndicator, Image } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { useAppDispatch, useAppSelector } from '../hooks/reduxHooks';
import { fetchWorkoutStats } from '../store/slices/workoutSlice';
import { fetchWorkoutPlan } from '../store/slices/workoutPlanSlice';
import MotivationalTip from '../components/MotivationalTip';
import { Colors, Gradients, Spacing, Shadows, Layout } from '../theme/Theme';
import { seedAllInstructions } from '../store/slices/exerciseSlice';
import { ExerciseInstructions, WorkoutSession } from '../types';
import { setRecoveryStatus, updatePlanLevel } from '../store/slices/workoutPlanSlice';

interface HomeScreenProps {
    navigation: any;
}

const { width } = Dimensions.get('window');

export default function HomeScreen({ navigation }: HomeScreenProps) {
    const dispatch = useAppDispatch();
    const { user } = useAppSelector((state) => state.auth);
    const { stats } = useAppSelector((state) => state.workout);
    const { currentPlan, todaysWorkout, recoveryStatus, loading: planLoading } = useAppSelector((state) => state.workoutPlan);
    const [selectedDayIndex, setSelectedDayIndex] = useState<number | null>(null);
    const scrollViewRef = React.useRef<ScrollView>(null);
    const scheduleLayoutY = React.useRef<number>(0);

    useEffect(() => {
        dispatch(fetchWorkoutStats('week'));
        if (user?.uid) {
            dispatch(fetchWorkoutPlan(user.uid));
        }

        if (todaysWorkout) {
            console.log('[HomeScreen] Today\'s Workout:', todaysWorkout.title);
            console.log('[HomeScreen] Exercises count:', todaysWorkout.exercises?.length || 0);
            if (todaysWorkout.exercises?.length > 0) {
                console.log('[HomeScreen] First Exercise:', todaysWorkout.exercises[0].name);
            }
        }

        const today = new Date().getDay();
        if (today !== 0) {
            setSelectedDayIndex(today - 1);
        }
    }, [dispatch, user?.uid, todaysWorkout?.id]);




    const handleStartExercise = (exercise: any) => {
        // Handle multiple possible ID property names
        const exerciseId = exercise.exerciseId || exercise.id || exercise.name?.toLowerCase().replace(/\s+/g, '-');
        console.log('HomeScreen: Starting exercise with data:', JSON.stringify(exercise));
        console.log('HomeScreen: Extracted exerciseId:', exerciseId);

        navigation.navigate('ExerciseInstructions', {
            exerciseId: exerciseId,
            exerciseName: exercise.name || exercise.exerciseName,
            targetSets: exercise.sets,
            targetReps: exercise.reps,
            fromPlan: true
        });
    };

    const getRecoveryTips = () => {
        const tips = {
            good: [
                '✓ Sleep 8-9 hours tonight',
                '✓ Hydrate well (3-4L water)',
                '✓ Eat protein + carbs within 1 hr',
                '✓ Light stretching or mobility'
            ],
            moderate: [
                '⚠ Get adequate sleep (8+ hrs)',
                '⚠ Increase water intake (4L+)',
                '⚠ Active recovery: 15 min walk',
                '⚠ Foam rolling for sore muscles'
            ],
            poor: [
                '🔴 MANDATORY REST - No training',
                '🔴 Focus on sleep (9-10 hrs)',
                '🔴 Ice/heat therapy for sore areas',
                '🔴 Extra protein + carbs today'
            ]
        };
        return tips[recoveryStatus] || tips.good;
    };

    const isRestDay = todaysWorkout?.isRestDay || !todaysWorkout;

    const getNextWorkout = () => {
        if (!currentPlan) return null;
        const today = new Date().getDay();
        // Look for the next workout day in the next 7 days
        for (let i = 1; i <= 7; i++) {
            const checkDay = (today + i) % 7;
            const session = currentPlan.sessions.find(s => s.dayOfWeek === checkDay && !s.isRestDay && s.type !== 'rest');
            if (session && session.exercises.length > 0) return session;
        }
        return null;
    };

    const nextWorkout = isRestDay ? getNextWorkout() : null;

    const handleRecoveryChange = (status: 'good' | 'moderate' | 'poor') => {
        dispatch(setRecoveryStatus(status));
    };

    const handleSeedData = () => {
        // 1. Seed Instructions (Fix Images)
        const initialInstructions: ExerciseInstructions[] = [
            {
                exerciseId: 'push-ups',
                exerciseName: 'Push-ups',
                description: 'A fundamental upper body exercise targeting chest, shoulders, and triceps.',
                imageUri: 'asset://push-ups.png',
                steps: [
                    'Start in a high plank position with hands slightly wider than shoulders',
                    'Keep your body in a straight line from head to heels',
                    'Lower your body until chest nearly touches the ground',
                    'Push back up to starting position'
                ],
                tips: [
                    'Keep core engaged throughout',
                    'Don\'t let hips sag or pike up',
                    'Breathe in on the way down, out on the way up'
                ]
            },
            {
                exerciseId: 'squats',
                exerciseName: 'Squats',
                description: 'A compound lower body exercise that builds leg and glute strength.',
                imageUri: 'asset://squats.png',
                steps: [
                    'Stand with feet shoulder-width apart, toes slightly out',
                    'Keep chest up and core engaged',
                    'Lower down by bending knees and pushing hips back',
                    'Go until thighs are parallel to ground',
                    'Push through heels to return to standing'
                ],
                tips: [
                    'Keep knees tracking over toes',
                    'Don\'t let knees cave inward',
                    'Weight should be on your heels'
                ]
            },
            {
                exerciseId: 'plank',
                exerciseName: 'Plank',
                description: 'An isometric core exercise that builds overall stability.',
                imageUri: 'asset://plank.png',
                steps: [
                    'Start in a forearm plank position',
                    'Keep elbows directly under shoulders',
                    'Body should form a straight line',
                    'Hold the position'
                ],
                tips: [
                    'Don\'t let hips sag or pike up',
                    'Squeeze glutes and core',
                    'Breathe steadily throughout'
                ]
            },
            {
                exerciseId: 'bicep-curls',
                exerciseName: 'Bicep Curls',
                description: 'An isolation exercise targeting the biceps.',
                imageUri: 'asset://bicep-curls.png',
                steps: [
                    'Stand with feet hip-width apart',
                    'Hold weights with arms fully extended',
                    'Curl weights up toward shoulders',
                    'Lower back down with control'
                ],
                tips: [
                    'Keep elbows close to body',
                    'Don\'t swing or use momentum',
                    'Control the weight on the way down'
                ]
            },
            {
                exerciseId: 'burpees',
                exerciseName: 'Burpees',
                description: 'A full-body explosive exercise that builds strength and cardio endurance.',
                imageUri: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?q=80&w=500&auto=format&fit=crop',
                steps: [
                    'Stand with feet shoulder-width apart',
                    'Lower into a squat position and place hands on floor',
                    'Kick feet back into a plank position',
                    'Perform a push-up (optional but recommended)',
                    'Jump feet back toward hands',
                    'Explode up into a jump with arms overhead'
                ],
                tips: [
                    'Maintain a strong core during the plank',
                    'Land softly on your feet',
                    'Move at a steady, rhythmic pace'
                ]
            },
            {
                exerciseId: 'mountain-climbers',
                exerciseName: 'Mountain Climbers',
                description: 'A dynamic core exercise that mimics the motion of climbing a mountain.',
                imageUri: 'https://images.unsplash.com/photo-1434608519344-49d77a699e1d?q=80&w=500&auto=format&fit=crop',
                steps: [
                    'Start in a high plank position',
                    'Drive your right knee toward your chest',
                    'Quickly switch legs, driving the left knee forward',
                    'Keep your hips low and back flat',
                    'Continue alternating legs at a fast pace'
                ],
                tips: [
                    'Keep shoulders directly over wrists',
                    'Don\'t let your butt pike up in the air',
                    'Breathe rhythmically'
                ]
            }
        ];

        dispatch(seedAllInstructions(initialInstructions));

        // 2. Fix Schedule (Force Regenerate Plan)
        if (user?.uid) {
            console.log('[HomeScreen] Manual Fix: Regenerating plan to enforce Sunday-only rest...');
            dispatch(updatePlanLevel({
                userId: user.uid,
                level: user.progressSystem?.currentLevel || 1
            }));
        }

        alert('Fixing Schedule & Images... Wait 5 seconds for update! 🛠️');
    };

    return (
        <LinearGradient
            colors={Gradients.background}
            style={styles.container}
        >
            <ScrollView
                ref={scrollViewRef}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
            >
                {/* Header Section */}
                <View style={styles.header}>
                    <View>
                        <Text style={styles.greeting}>Hello,</Text>
                        <Text style={styles.title}>{user?.displayName || 'Champion'}! 👋</Text>
                    </View>
                    <TouchableOpacity style={styles.avatarCircle} onPress={() => navigation.navigate('Avatar')}>
                        {user?.photoURL ? (
                            <Image
                                source={{ uri: user.photoURL }}
                                style={{ width: 56, height: 56, borderRadius: 28 }}
                            />
                        ) : (
                            <Text style={styles.avatarText}>{user?.displayName?.[0] || 'U'}</Text>
                        )}
                    </TouchableOpacity>
                </View>

                {/* Level & XP Progress Card */}
                <TouchableOpacity
                    style={styles.xpCard}
                    onPress={() => navigation.navigate('LevelProgress')}
                >
                    <BlurView intensity={20} tint="dark" style={styles.xpCardContent}>
                        <View style={styles.xpHeader}>
                            <View>
                                <Text style={styles.xpLabel}>Current Level</Text>
                                <Text style={styles.levelValue}>{user?.progressSystem?.currentLevel || 1}</Text>
                            </View>
                            <View style={styles.xpCircle}>
                                <Text style={styles.xpEmoji}>✨</Text>
                            </View>
                        </View>
                        <View style={styles.xpBarContainer}>
                            <View style={styles.xpBarBg}>
                                <LinearGradient
                                    colors={Gradients.primary}
                                    start={{ x: 0, y: 0 }}
                                    end={{ x: 1, y: 0 }}
                                    style={[
                                        styles.xpBarFill,
                                        { width: `${Math.min(100, (user?.progressSystem?.currentXP || 0) % 1000 / 10)}%` }
                                    ]}
                                />
                            </View>
                            <Text style={styles.xpPercentage}>
                                {Math.round((user?.progressSystem?.currentXP || 0) % 1000 / 10)}%
                            </Text>
                        </View>
                    </BlurView>
                </TouchableOpacity>

                {/* Motivational Tip */}
                <View style={styles.section}>
                    <MotivationalTip />
                </View>


                {/* Dynamic Status Card */}
                <BlurView intensity={30} tint="dark" style={styles.todayStatusCard}>
                    <View style={styles.statusRow}>
                        <View>
                            <Text style={styles.statusLabel}>Today's Status</Text>
                            <Text style={styles.statusDate}>
                                {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
                            </Text>
                        </View>
                        <View style={styles.statusBadgeContainer}>
                            {isRestDay ? (
                                <View style={styles.statusBadgeRest}>
                                    <Text style={styles.statusEmoji}>😌</Text>
                                    <Text style={styles.statusBadgeText}>REST DAY</Text>
                                </View>
                            ) : (
                                <View style={styles.statusBadgeWorkout}>
                                    <Text style={styles.statusEmoji}>💪</Text>
                                    <Text style={styles.statusBadgeText}>WORKOUT</Text>
                                </View>
                            )}
                        </View>
                    </View>
                </BlurView>

                {/* Today's Workout Header */}
                {todaysWorkout && !todaysWorkout.isRestDay && (
                    <BlurView intensity={20} tint="dark" style={styles.todayWorkoutCard}>
                        <View style={styles.workoutHeader}>
                            <View>
                                <Text style={styles.workoutTitle}>Today's Workout 🎯</Text>
                                <Text style={styles.workoutFocus}>{todaysWorkout.focus}</Text>
                            </View>
                        </View>

                        <Text style={styles.workoutDuration}>
                            ⏱️ {todaysWorkout.duration} min  •  {todaysWorkout.exercises.length} exercises
                        </Text>
                    </BlurView>
                )}

                {/* Exercise List */}
                {todaysWorkout && !todaysWorkout.isRestDay && (
                    <View style={styles.exercisesList}>
                        {todaysWorkout.exercises.length > 0 ? (
                            todaysWorkout.exercises.map((exercise, index) => (
                                <BlurView key={`${exercise.exerciseId}-${index}`} intensity={20} tint="dark" style={styles.exerciseCard}>
                                    <View style={styles.exerciseCardHeader}>
                                        <View style={styles.exerciseInfo}>
                                            <View style={styles.exerciseNumberBadge}>
                                                <Text style={styles.exerciseNumber}>{index + 1}</Text>
                                            </View>
                                            <View>
                                                <Text style={styles.exerciseCardName}>{exercise.displayName || exercise.name || exercise.exerciseName}</Text>
                                                <Text style={styles.exerciseCardTarget}>
                                                    {exercise.sets} sets × {exercise.reps} reps
                                                </Text>
                                            </View>
                                        </View>
                                        {exercise.completed && (
                                            <View style={styles.completedBadge}>
                                                <Text style={styles.completedIcon}>✓</Text>
                                            </View>
                                        )}
                                    </View>

                                    <TouchableOpacity
                                        style={[
                                            styles.startExerciseButton,
                                            exercise.completed && styles.startExerciseButtonCompleted
                                        ]}
                                        onPress={() => handleStartExercise(exercise)}
                                    >
                                        <Text style={styles.startExerciseButtonText}>
                                            {exercise.completed ? 'Repeat Exercise' : 'Start Exercise'} →
                                        </Text>
                                    </TouchableOpacity>
                                </BlurView>
                            ))
                        ) : (
                            <BlurView intensity={20} tint="dark" style={styles.emptyExercisesCard}>
                                <Text style={styles.emptyExercisesText}>No exercises found for this session. Try adjusting your profile!</Text>
                            </BlurView>
                        )}
                    </View>
                )}

                {/* Rest Day Card */}
                {todaysWorkout && (todaysWorkout.isRestDay || todaysWorkout.type === 'rest') && (
                    <View>
                        <BlurView intensity={20} tint="dark" style={styles.todayWorkoutCard}>
                            <View style={styles.workoutHeader}>
                                <Text style={styles.workoutTitle}>Rest Day 😌</Text>
                                <Text style={styles.workoutFocus}>{todaysWorkout.focus || 'Recovery is important!'}</Text>
                            </View>
                            <Text style={styles.restDayMessage}>
                                {todaysWorkout.notes || 'Take today to recover and prepare for your next workout.'}
                            </Text>
                        </BlurView>


                        {nextWorkout && (
                            <View style={styles.nextWorkoutContainer}>
                                <Text style={styles.nextWorkoutLabel}>Preview: Next Workout 🔜</Text>
                                <BlurView intensity={15} tint="dark" style={styles.nextWorkoutCard}>
                                    <View style={styles.nextWorkoutHeader}>
                                        <Text style={styles.nextWorkoutTitle}>{nextWorkout.focus}</Text>
                                        <Text style={styles.nextWorkoutDay}>
                                            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][nextWorkout.dayOfWeek || 0]}
                                        </Text>
                                    </View>
                                    <View style={styles.nextExercisesPreview}>
                                        {nextWorkout.exercises.slice(0, 3).map((ex, idx) => (
                                            <View key={idx} style={styles.nextExerciseItem}>
                                                <Text style={styles.nextExerciseBullet}>•</Text>
                                                <Text style={styles.nextExerciseName}>{ex.displayName || ex.name}</Text>
                                            </View>
                                        ))}
                                        {nextWorkout.exercises.length > 3 && (
                                            <Text style={styles.moreExercisesText}>+ {nextWorkout.exercises.length - 3} more exercises</Text>
                                        )}
                                    </View>
                                    <TouchableOpacity
                                        style={styles.viewPlanButton}
                                        onPress={() => {
                                            const targetDayIndex = nextWorkout.dayOfWeek === 0 ? 6 : (nextWorkout.dayOfWeek || 0) - 1;
                                            setSelectedDayIndex(targetDayIndex);
                                            // Scroll to schedule section
                                            scrollViewRef.current?.scrollTo({ x: 0, y: scheduleLayoutY.current, animated: true });
                                        }}
                                    >
                                        <Text style={styles.viewPlanButtonText}>View Full Plan</Text>
                                    </TouchableOpacity>
                                </BlurView>
                            </View>
                        )}
                    </View>
                )}

                {/* Main Action - Start Workout */}


                {/* Recovery Status Selection */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Recovery Status ❤️</Text>
                    <View style={styles.recoveryGrid}>
                        {(['good', 'moderate', 'poor'] as const).map((status) => (
                            <TouchableOpacity
                                key={status}
                                style={[
                                    styles.recoveryButton,
                                    recoveryStatus === status && (styles[`recoveryButton${status.charAt(0).toUpperCase() + status.slice(1)}` as keyof typeof styles] as any),
                                ]}
                                onPress={() => handleRecoveryChange(status)}
                            >
                                <Text style={[
                                    styles.recoveryButtonText,
                                    recoveryStatus === status && styles.recoveryButtonTextActive
                                ]}>
                                    {status === 'good' ? '🟢 Good' : status === 'moderate' ? '🟡 Moderate' : '🔴 Poor'}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>

                {/* Recovery Tips */}
                <View style={styles.section}>
                    <BlurView intensity={10} tint="dark" style={styles.tipsCard}>
                        <Text style={styles.tipsTitle}>{isRestDay ? '🌙 Rest Day Tips' : '💪 Post-Workout Tips'}</Text>
                        <View style={styles.tipsList}>
                            {getRecoveryTips().map((tip, idx) => (
                                <View key={idx} style={styles.tipItem}>
                                    <Text style={styles.tipText}>{tip}</Text>
                                </View>
                            ))}
                        </View>
                    </BlurView>
                </View>

                {/* Weekly Schedule Grid */}
                {currentPlan && (
                    <View
                        style={styles.section}
                        onLayout={(event) => {
                            const layout = event.nativeEvent.layout;
                            scheduleLayoutY.current = layout.y;
                        }}
                    >
                        <Text style={styles.sectionTitle}>📅 Weekly Schedule</Text>
                        <View style={styles.weeklyGrid}>
                            {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, idx) => {
                                const dayOfWeek = (idx + 1) % 7;
                                const session = currentPlan.sessions.find(s => s.dayOfWeek === dayOfWeek);
                                const isToday = new Date().getDay() === dayOfWeek;
                                const isSelected = selectedDayIndex === idx;
                                const isSunday = idx === 6;

                                return (
                                    <TouchableOpacity
                                        key={day}
                                        onPress={() => setSelectedDayIndex(idx)}
                                        style={[
                                            styles.gridDayCard,
                                            isToday && styles.gridDayToday,
                                            isSelected && styles.gridDaySelected,
                                            isSunday && styles.gridDayRest
                                        ]}
                                    >
                                        <Text style={[
                                            styles.gridDayLabel,
                                            isToday && styles.gridDayLabelToday,
                                            isSelected && styles.gridDayLabelSelected,
                                            isSunday && styles.gridDayLabelRest
                                        ]}>{day}</Text>
                                        <Text style={styles.gridDayIcon}>{isSunday ? '🧘' : '💪'}</Text>
                                        <Text style={[
                                            styles.gridDayFocus,
                                            isToday && styles.gridDayFocusToday,
                                            isSelected && styles.gridDayFocusSelected,
                                            isSunday && styles.gridDayFocusRest
                                        ]} numberOfLines={1}>
                                            {isSunday ? 'Rest' : (session?.focus?.split('(')[0].trim() || 'Workout')}
                                        </Text>
                                    </TouchableOpacity>
                                );
                            })}
                        </View>
                        <Text style={styles.gridHint}>💜 = Today | Select any day to see details</Text>
                    </View>
                )}

                {/* Selected Day Details */}
                {selectedDayIndex !== null && currentPlan && (
                    <View style={styles.section}>
                        <BlurView intensity={30} tint="dark" style={styles.detailsCard}>
                            {(() => {
                                const session = currentPlan.sessions.find(s => s.dayOfWeek === (selectedDayIndex + 1) % 7);
                                const isRest = session?.isRestDay || session?.type === 'rest';
                                return isRest;
                            })() ? (
                                // Rest Day View
                                <View style={styles.restDayDetailContainer}>
                                    <View style={styles.detailsHeader}>
                                        <View style={styles.detailsTitleContainer}>
                                            <MaterialCommunityIcons name="tea" size={24} color={Colors.accentSuccess} />
                                            <Text style={styles.detailsTitle}>{['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][selectedDayIndex]} - Rest & Recovery</Text>
                                        </View>
                                    </View>
                                    <View style={styles.detailsNotes}>
                                        <Text style={styles.detailsNotesText}>
                                            Recovery is just as important as the workout itself. Use today to let your muscles repair, hydrate well, and get extra sleep.
                                        </Text>
                                    </View>
                                    <Text style={styles.exercisesTitle}>Recovery Tips:</Text>
                                    <View style={styles.detailsExercises}>
                                        {['8-9 hours of sleep', 'Light stretching/yoga', 'Hydrate (3-4L)', 'Meal Prep for the week'].map((tip, idx) => (
                                            <View key={idx} style={styles.detailExerciseItem}>
                                                <Text style={styles.detailExerciseNumber}>{idx + 1}.</Text>
                                                <Text style={styles.detailExerciseText}>{tip}</Text>
                                            </View>
                                        ))}
                                    </View>
                                </View>
                            ) : (
                                // Regular Workout View
                                <>
                                    <View style={styles.detailsHeader}>
                                        <View style={styles.detailsTitleContainer}>
                                            <MaterialCommunityIcons name="flash" size={24} color={Colors.accentCyan} />
                                            <Text style={styles.detailsTitle}>
                                                {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][selectedDayIndex]} - {currentPlan.sessions.find(s => s.dayOfWeek === (selectedDayIndex + 1) % 7)?.focus || 'Workout'}
                                            </Text>
                                        </View>
                                        <View style={styles.detailsDurationBadge}>
                                            <MaterialCommunityIcons name="clock-outline" size={16} color={Colors.textPrimary} />
                                            <Text style={styles.detailsDurationText}>
                                                {currentPlan.sessions.find(s => s.dayOfWeek === (selectedDayIndex + 1) % 7)?.duration} min
                                            </Text>
                                        </View>
                                    </View>

                                    {currentPlan.sessions.find(s => s.dayOfWeek === (selectedDayIndex + 1) % 7)?.notes && (
                                        <View style={styles.detailsNotes}>
                                            <Text style={styles.detailsNotesText}>
                                                {currentPlan.sessions.find(s => s.dayOfWeek === (selectedDayIndex + 1) % 7)?.notes}
                                            </Text>
                                        </View>
                                    )}

                                    <Text style={styles.exercisesTitle}>Exercises:</Text>
                                    <View style={styles.detailsExercises}>
                                        {currentPlan.sessions.find(s => s.dayOfWeek === (selectedDayIndex + 1) % 7)?.exercises.map((exercise, idx) => (
                                            <View key={idx} style={styles.detailExerciseItem}>
                                                <Text style={styles.detailExerciseNumber}>{idx + 1}.</Text>
                                                <Text style={styles.detailExerciseText}>{exercise.name}: {exercise.sets}x{exercise.reps}</Text>
                                            </View>
                                        ))}
                                    </View>
                                </>
                            )}
                        </BlurView>
                    </View>
                )}

                {/* Level Training Split Breakdown - REMOVED */}

                {/* Secondary Actions */}
                <View style={styles.actionsGrid}>
                    <TouchableOpacity
                        style={styles.actionCard}
                        onPress={() => navigation.navigate('History')}
                    >
                        <BlurView intensity={10} tint="dark" style={styles.actionCardBlur}>
                            <Text style={styles.actionIcon}>📊</Text>
                            <Text style={styles.actionTitle}>History</Text>
                        </BlurView>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.actionCard}
                        onPress={() => navigation.navigate('Avatar')}
                    >
                        <BlurView intensity={10} tint="dark" style={styles.actionCardBlur}>
                            <Text style={styles.actionIcon}>🏆</Text>
                            <Text style={styles.actionTitle}>Avatar</Text>
                        </BlurView>
                    </TouchableOpacity>
                </View>



                {/* DB Sync Button
                {__DEV__ && (
                    <TouchableOpacity
                        style={[styles.logoutButton, { marginTop: 20, borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.1)' }]}
                        onPress={handleSeedData}
                    >
                        <Text style={[styles.logoutText, { color: Colors.accentCyan }]}>🧪 Fix Schedule & AI Images</Text>
                    </TouchableOpacity>
                )} */}



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
        padding: Spacing.m,
        paddingTop: 80,
        paddingBottom: 100,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: Spacing.l,
    },
    greeting: {
        fontSize: 16,
        color: Colors.accentCyan,
        fontWeight: '600',
        letterSpacing: 1,
        marginBottom: 4,
        textTransform: 'uppercase',
    },
    title: {
        fontSize: 32,
        fontWeight: '800',
        color: Colors.textPrimary,
        letterSpacing: 0.5,
    },
    avatarCircle: {
        width: 56,
        height: 56,
        borderRadius: Layout.borderRadius.round,
        backgroundColor: Colors.glassSurface,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: Colors.accentCyan,
        ...Shadows.glow,
    },
    avatarText: {
        fontSize: 24,
        fontWeight: 'bold',
        color: Colors.textPrimary,
    },
    section: {
        marginBottom: Spacing.l,
    },

    // XP Card
    xpCard: {
        borderRadius: Layout.borderRadius.l,
        overflow: 'hidden',
        marginBottom: Spacing.l,
        borderWidth: 1,
        borderColor: Colors.glassBorder,
        ...Shadows.card,
    },
    xpCardContent: {
        padding: Spacing.m,
        backgroundColor: 'rgba(0,0,0,0.3)',
    },
    xpHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: Spacing.s,
    },
    xpLabel: {
        fontSize: 14,
        color: Colors.textSecondary,
        textTransform: 'uppercase',
        letterSpacing: 1,
        fontWeight: '600',
    },
    levelValue: {
        fontSize: 36,
        fontWeight: '900',
        color: Colors.textPrimary,
        textShadowColor: Colors.primaryStart,
        textShadowOffset: { width: 0, height: 0 },
        textShadowRadius: 10,
    },
    xpCircle: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: Colors.glassHighlight,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: Colors.glassBorder,
    },
    xpEmoji: {
        fontSize: 24,
    },
    xpBarContainer: {
        marginTop: Spacing.s,
        flexDirection: 'row',
        alignItems: 'center',
        gap: Spacing.s,
    },
    xpBarBg: {
        flex: 1,
        height: 8,
        backgroundColor: Colors.glassSurface,
        borderRadius: 4,
        overflow: 'hidden',
    },
    xpBarFill: {
        height: '100%',
        borderRadius: 4,
    },
    xpPercentage: {
        fontSize: 14,
        fontWeight: 'bold',
        color: Colors.accentCyan,
        width: 40,
        textAlign: 'right',
    },

    // Today Status Grid
    todayStatusCard: {
        borderRadius: Layout.borderRadius.m,
        padding: Spacing.m,
        overflow: 'hidden',
        marginBottom: Spacing.l,
        borderWidth: 1,
        borderColor: Colors.glassBorder,
        backgroundColor: 'rgba(0,0,0,0.2)',
    },
    statusRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    statusLabel: {
        fontSize: 12,
        color: Colors.textTertiary,
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    statusDate: {
        fontSize: 18,
        fontWeight: '700',
        color: Colors.textPrimary,
        marginTop: 4,
    },
    statusBadgeContainer: {},
    statusBadgeWorkout: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(34, 211, 238, 0.15)', // Cyan tint
        paddingVertical: 6,
        paddingHorizontal: 12,
        borderRadius: Layout.borderRadius.s,
        borderWidth: 1,
        borderColor: Colors.accentCyan,
    },
    statusBadgeRest: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        paddingVertical: 6,
        paddingHorizontal: 12,
        borderRadius: Layout.borderRadius.s,
        borderWidth: 1,
        borderColor: Colors.textSecondary,
    },
    statusEmoji: {
        marginRight: 6,
        fontSize: 14,
    },
    statusBadgeText: {
        color: Colors.textPrimary,
        fontWeight: '700',
        fontSize: 12,
        letterSpacing: 0.5,
    },

    // Workout Card
    todayWorkoutCard: {
        borderRadius: Layout.borderRadius.l,
        padding: Spacing.m,
        overflow: 'hidden',
        marginBottom: Spacing.l,
        borderWidth: 1,
        borderColor: Colors.glassBorder,
        backgroundColor: 'rgba(0,0,0,0.4)',
    },
    workoutHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: Spacing.m,
    },
    workoutTitle: {
        fontSize: 14,
        color: Colors.accentPink,
        fontWeight: '700',
        textTransform: 'uppercase',
        letterSpacing: 1,
        marginBottom: 4,
    },
    workoutFocus: {
        fontSize: 28,
        fontWeight: '800',
        color: Colors.textPrimary,
    },
    viewLibraryLink: {
        backgroundColor: Colors.glassSurface,
        paddingVertical: 6,
        paddingHorizontal: 12,
        borderRadius: Layout.borderRadius.s,
    },
    viewLibraryText: {
        fontSize: 12,
        color: Colors.textSecondary,
        fontWeight: '600',
    },
    workoutDuration: {
        fontSize: 14,
        color: Colors.textSecondary,
        fontWeight: '500',
    },

    // Exercise List
    exercisesList: {
        gap: Spacing.m,
        marginBottom: Spacing.l,
    },
    exerciseCard: {
        borderRadius: Layout.borderRadius.m,
        padding: Spacing.m,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: Colors.glassBorder,
        backgroundColor: 'rgba(255,255,255,0.03)',
    },
    exerciseCardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: Spacing.m,
    },
    exerciseInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: Spacing.m,
    },
    exerciseNumberBadge: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: Colors.glassSurface,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: Colors.glassBorder,
    },
    exerciseNumber: {
        color: Colors.textSecondary,
        fontWeight: '700',
        fontSize: 14,
    },
    exerciseCardName: {
        fontSize: 18,
        fontWeight: '700',
        color: Colors.textPrimary,
        marginBottom: 2,
    },
    exerciseCardTarget: {
        fontSize: 13,
        color: Colors.accentCyan,
        fontWeight: '600',
    },
    completedBadge: {
        width: 28,
        height: 28,
        borderRadius: 14,
        backgroundColor: Colors.accentSuccess,
        justifyContent: 'center',
        alignItems: 'center',
        ...Shadows.glow,
    },
    completedIcon: {
        color: '#000',
        fontWeight: 'bold',
        fontSize: 14,
    },
    startExerciseButton: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 12,
        borderRadius: Layout.borderRadius.s,
        backgroundColor: Colors.glassSurface,
        borderWidth: 1,
        borderColor: Colors.glassBorder,
    },
    startExerciseButtonCompleted: {
        backgroundColor: 'rgba(74, 222, 128, 0.1)',
        borderColor: Colors.accentSuccess,
    },
    startExerciseButtonText: {
        color: Colors.textPrimary,
        fontWeight: '600',
        fontSize: 14,
    },
    emptyExercisesCard: {
        padding: Spacing.l,
        borderRadius: Layout.borderRadius.m,
        alignItems: 'center',
        backgroundColor: Colors.glassSurface,
    },
    emptyExercisesText: {
        color: Colors.textSecondary,
        textAlign: 'center',
    },

    // Next Workout Preview
    nextWorkoutContainer: {
        marginTop: Spacing.l,
    },
    nextWorkoutLabel: {
        fontSize: 14,
        color: Colors.textTertiary,
        marginBottom: Spacing.s,
        textTransform: 'uppercase',
        letterSpacing: 1,
        fontWeight: 'bold',
    },
    nextWorkoutCard: {
        padding: Spacing.m,
        borderRadius: Layout.borderRadius.m,
        backgroundColor: 'rgba(255,255,255,0.03)',
        borderWidth: 1,
        borderColor: Colors.glassBorder,
        overflow: 'hidden',
    },
    nextWorkoutHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: Spacing.s,
    },
    nextWorkoutTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: Colors.textPrimary,
    },
    nextWorkoutDay: {
        fontSize: 14,
        color: Colors.textSecondary,
        fontWeight: '600',
    },
    nextExercisesPreview: {
        marginBottom: Spacing.m,
    },
    nextExerciseItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 4,
    },
    nextExerciseBullet: {
        color: Colors.accentCyan,
        marginRight: 8,
        fontSize: 16,
    },
    nextExerciseName: {
        color: Colors.textSecondary,
        fontSize: 14,
    },
    moreExercisesText: {
        color: Colors.textTertiary,
        fontSize: 12,
        fontStyle: 'italic',
        marginTop: 4,
    },
    viewPlanButton: {
        alignItems: 'center',
        paddingVertical: 8,
        borderTopWidth: 1,
        borderTopColor: Colors.glassBorder,
    },
    viewPlanButtonText: {
        color: Colors.accentCyan,
        fontWeight: '600',
        fontSize: 13,
    },

    // Start Button (Main)
    startButtonContainer: {
        marginBottom: Spacing.l,
        ...Shadows.glow,
    },
    startButton: {
        borderRadius: Layout.borderRadius.l,
        padding: Spacing.l,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.2)',
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
        fontSize: 22,
        fontWeight: '900',
        color: Colors.textPrimary,
        letterSpacing: 0.5,
        textTransform: 'uppercase',
    },
    startButtonSubtext: {
        fontSize: 12,
        color: 'rgba(255, 255, 255, 0.8)',
        fontWeight: '500',
        letterSpacing: 1,
    },

    // Section Titles
    sectionTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: Colors.textPrimary,
        marginBottom: Spacing.m,
        paddingLeft: Spacing.xs,
        borderLeftWidth: 3,
        borderLeftColor: Colors.accentCyan,
    },

    // Weekly Grid
    weeklyGrid: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: Spacing.s,
    },
    gridDayCard: {
        width: (Dimensions.get('window').width - Spacing.l * 2 - Spacing.xs * 6) / 7,
        aspectRatio: 0.6,
        borderRadius: Layout.borderRadius.s,
        backgroundColor: Colors.glassSurface,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: 'transparent',
    },
    gridDayToday: {
        borderColor: Colors.accentPink,
        backgroundColor: 'rgba(244, 114, 182, 0.1)',
        ...Shadows.glow,
    },
    gridDaySelected: {
        borderColor: Colors.accentCyan,
        backgroundColor: 'rgba(34, 211, 238, 0.1)',
    },
    gridDayRest: {
        opacity: 0.5,
    },
    gridDayLabel: {
        fontSize: 10,
        color: Colors.textSecondary,
        marginBottom: 4,
        fontWeight: '600',
    },
    gridDayLabelToday: {
        color: Colors.accentPink,
        fontWeight: 'bold',
    },
    gridDayLabelSelected: {
        color: Colors.accentCyan,
        fontWeight: 'bold',
    },
    gridDayLabelRest: {
        color: Colors.textTertiary,
    },
    gridDayIcon: {
        fontSize: 14,
        marginBottom: 4,
    },
    gridDayFocus: {
        fontSize: 8,
        color: Colors.textSecondary,
        textAlign: 'center',
    },
    gridDayFocusToday: {
        color: Colors.accentPink,
    },
    gridDayFocusSelected: {
        color: Colors.accentCyan,
    },
    gridDayFocusRest: {
        color: Colors.textTertiary,
    },
    gridHint: {
        textAlign: 'center',
        color: Colors.textTertiary,
        fontSize: 10,
        marginTop: Spacing.s,
    },

    // Recovery Grid
    recoveryGrid: {
        flexDirection: 'row',
        gap: Spacing.s,
    },
    recoveryButton: {
        flex: 1,
        paddingVertical: 12,
        borderRadius: Layout.borderRadius.m,
        backgroundColor: Colors.glassSurface,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: Colors.glassBorder,
    },
    recoveryButtonGood: {
        backgroundColor: 'rgba(74, 222, 128, 0.1)',
        borderColor: Colors.accentSuccess,
    },
    recoveryButtonModerate: {
        backgroundColor: 'rgba(250, 204, 21, 0.1)',
        borderColor: Colors.accentYellow,
    },
    recoveryButtonPoor: {
        backgroundColor: 'rgba(248, 113, 113, 0.1)',
        borderColor: Colors.accentError,
    },
    recoveryButtonText: {
        fontSize: 14,
        fontWeight: '600',
        color: Colors.textSecondary,
    },
    recoveryButtonTextActive: {
        color: Colors.textPrimary,
        fontWeight: '800',
    },

    // Details Card
    detailsCard: {
        padding: Spacing.m,
        borderRadius: Layout.borderRadius.l,
        backgroundColor: 'rgba(0,0,0,0.3)',
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: Colors.glassBorder,
    },
    detailsHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: Spacing.m,
    },
    detailsTitleContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: Spacing.s,
        flex: 1,
    },
    detailsTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: Colors.textPrimary,
    },
    detailsDurationBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        backgroundColor: Colors.glassSurface,
        paddingVertical: 4,
        paddingHorizontal: 8,
        borderRadius: Layout.borderRadius.s,
    },
    detailsDurationText: {
        color: Colors.textPrimary,
        fontSize: 12,
        fontWeight: '600',
    },
    detailsNotes: {
        backgroundColor: 'rgba(255,255,255,0.05)',
        padding: Spacing.m,
        borderRadius: Layout.borderRadius.s,
        marginBottom: Spacing.m,
    },
    detailsNotesText: {
        color: Colors.textSecondary,
        fontStyle: 'italic',
        fontSize: 14,
        lineHeight: 20,
    },
    restDayDetailContainer: {
        width: '100%',
    },
    exercisesTitle: {
        fontSize: 14,
        color: Colors.textTertiary,
        textTransform: 'uppercase',
        letterSpacing: 1,
        marginBottom: Spacing.s,
        fontWeight: '600',
    },
    detailsExercises: {
        width: '100%',
        gap: 8,
    },
    detailExerciseItem: {
        flexDirection: 'row',
        gap: Spacing.s,
        paddingVertical: 8,
        borderBottomWidth: 1,
        borderBottomColor: Colors.glassBorder,
    },
    detailExerciseNumber: {
        color: Colors.accentCyan,
        fontWeight: 'bold',
        width: 24,
    },
    detailExerciseText: {
        color: Colors.textPrimary,
        fontSize: 14,
        flex: 1,
    },

    // Tips Card
    tipsCard: {
        padding: Spacing.m,
        borderRadius: Layout.borderRadius.l,
        overflow: 'hidden',
        backgroundColor: 'rgba(0,0,0,0.2)',
        borderWidth: 1,
        borderColor: Colors.glassBorder,
    },
    tipsTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: Colors.textPrimary,
        marginBottom: Spacing.m,
    },
    tipsList: {
        gap: 8,
    },
    tipItem: {
        flexDirection: 'row',
        gap: 12,
        alignItems: 'center',
    },
    tipText: {
        color: Colors.textSecondary,
        fontSize: 14,
        lineHeight: 20,
    },

    // Rest Day Details (Specific to Sunday view text etc)
    restDayMessage: {
        color: Colors.textSecondary,
        fontSize: 16,
        lineHeight: 24,
        marginBottom: Spacing.m,
    },

    // Action Grid
    actionsGrid: {
        flexDirection: 'row',
        gap: Spacing.m,
        marginBottom: Spacing.l,
    },
    actionCard: {
        flex: 1,
        height: 110,
        borderRadius: Layout.borderRadius.m,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: Colors.glassBorder,
        ...Shadows.card,
    },
    actionCardBlur: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: Colors.glassSurface,
    },
    actionIcon: {
        fontSize: 32,
        marginBottom: 8,
    },
    actionTitle: {
        fontSize: 14,
        color: Colors.textPrimary,
        fontWeight: '600',
        letterSpacing: 0.5,
    },

    // Logout
    logoutButton: {
        alignItems: 'center',
        paddingVertical: Spacing.m,
    },
    logoutText: {
        color: Colors.textTertiary,
        fontSize: 14,
        fontWeight: '600',
    },

    // Training Split (Legacy support or new style)
    splitList: {
        gap: 8,
    },
    splitItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: Colors.glassBorder,
    },
    splitDay: {
        color: Colors.accentCyan,
        fontWeight: '600',
        width: 80,
    },
    splitFocus: {
        color: Colors.textSecondary,
        flex: 1,
    },
    splitItemRest: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: Colors.glassBorder,
        opacity: 0.7,
    },
    splitDayRest: {
        color: Colors.accentPink,
        fontWeight: '600',
        width: 80,
    },
    splitFocusRest: {
        color: Colors.textTertiary,
        flex: 1,
        fontStyle: 'italic',
    },




});
