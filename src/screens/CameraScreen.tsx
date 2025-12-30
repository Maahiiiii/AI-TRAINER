import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
    StyleSheet,
    Text,
    View,
    TouchableOpacity,
    useWindowDimensions,
    Alert
} from 'react-native';
import { CameraView, CameraType, useCameraPermissions } from 'expo-camera';
import { ScreenType } from '../../App';
import PoseOverlay from '../components/PoseOverlay';
import FormFeedbackOverlay from '../components/FormFeedbackOverlay';
import ExerciseSelector from '../components/ExerciseSelector';
import CountdownOverlay from '../components/CountdownOverlay';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, Gradients, Spacing, Shadows, Layout } from '../theme/Theme';

import AppConfig from '../config/appConfig';
import { Pose, FormValidation } from '../types';
import { getExerciseById } from '../models/exercises';
import { workoutAnalysisService } from '../services/WorkoutAnalysisService';
import { feedbackService } from '../services/FeedbackService';
import { avatarService } from '../services/AvatarService';
import { useAppDispatch } from '../hooks/reduxHooks';
import { saveWorkout } from '../store/slices/workoutSlice';
import { useSmartCamera } from '../hooks/useSmartCamera';


import { CameraScreenParams } from '../../App';

interface CameraScreenProps {
    navigation: {
        navigate: (screen: ScreenType, params?: any) => void;
        params?: CameraScreenParams;
    };
}

// Available exercises for selection
const AVAILABLE_EXERCISES = [
    'push-ups', 'squats', 'plank', 'bicep-curls',
    'lunges', 'jumping-jacks', 'shoulder-press',
    'dumbbell-rows', 'mountain-climbers', 'burpees'
] as const;
type ExerciseId = typeof AVAILABLE_EXERCISES[number];

export default function CameraScreen({ navigation }: CameraScreenProps) {
    const dispatch = useAppDispatch();

    // Camera state
    const [facing, setFacing] = useState<CameraType>('front');
    const [permission, requestPermission] = useCameraPermissions();
    const cameraRef = useRef<CameraView>(null);

    // Pose detection state
    // const [poses, setPoses] = useState<Pose[]>([]); // Replaced by hook
    const [mockPoses, setMockPoses] = useState<Pose[]>([]);
    // const [isPoseModelReady, setIsPoseModelReady] = useState(false); // Replaced by hook
    const [poseError, setPoseError] = useState<string | null>(null);

    // UI state
    const [showOverlay, setShowOverlay] = useState(false);
    const [isWorkoutActive, setIsWorkoutActive] = useState(false);
    const [showCountdown, setShowCountdown] = useState(false);
    const [showExerciseSelector, setShowExerciseSelector] = useState(false);

    // Workout state
    const [exerciseId, setExerciseId] = useState<ExerciseId>((navigation.params?.exerciseId as ExerciseId) || 'push-ups');

    // Update exercise when params change
    useEffect(() => {
        if (navigation.params?.exerciseId) {
            setExerciseId(navigation.params.exerciseId as ExerciseId);
            workoutAnalysisService.reset(navigation.params.exerciseId);
        }
    }, [navigation.params?.exerciseId]);
    const [repCount, setRepCount] = useState(0);
    const [currentStage, setCurrentStage] = useState('');
    const [formScore, setFormScore] = useState(100);
    const [formValidation, setFormValidation] = useState<FormValidation>({
        isValid: true,
        score: 100,
        errors: []
    });

    // Timer state
    const [elapsedTime, setElapsedTime] = useState(0);
    const timerRef = useRef<NodeJS.Timeout | null>(null);

    // Workout mode state (plan mode vs free mode)
    const planMode = navigation.params?.fromPlan || false;
    const targetSetsParam = navigation.params?.targetSets || 3;
    const targetRepsParam = navigation.params?.targetReps || '10-12';
    const [currentSet, setCurrentSet] = useState(1);
    const [totalSets] = useState(targetSetsParam);
    const [showSetComplete, setShowSetComplete] = useState(false);

    // Stats tracking
    const [totalFormScore, setTotalFormScore] = useState(0);
    const [formScoreCount, setFormScoreCount] = useState(0);
    const prevRepCount = useRef(0);

    const { width, height } = useWindowDimensions();

    // Initialize pose detection logic removed (handled by hook)

    /**
     * Generate mock pose data for UI testing
     */
    /**
     * Generate mock pose data for UI testing
     * animate: 0 (down) to 1 (up)
     */
    const generateMockPose = useCallback((animationValue: number = 0): Pose => {
        const cx = width / 2;
        const cy = height / 2;

        const kp = (x: number, y: number, name: string = '') => ({
            x, y, score: 0.9, name
        });

        // Interpolate between down (bent elbows) and up (straight arms)
        // Pushup: Down = elbows bent ~90deg, Up = elbows straight ~180deg

        // Elbow Y position (relative to shoulder)
        // Shoulder at cy - 20
        // Down: Elbow at cy + 30 (checking original code) -> Angle ~90
        // Up: Elbow at cy - 20 (aligned with shoulder) -> Angle ~180 (actually straight arm)

        // Let's make it simple:
        // Shoulder: (cx +/- 50, cy - 100)
        // Elbow: 
        //   Down: (cx +/- 80, cy) -> ~90 deg bend
        //   Up: (cx +/- 60, cy - 50) -> extended
        // Wrist:
        //   Down: (cx +/- 50, cy + 50)
        //   Up: (cx +/- 50, cy + 50) (hands fixed)

        const shoulderY = cy - 100;
        const wristY = cy + 50;

        // Elbow interpolation
        // Down state (0)
        const elbowX_down = 90;
        const elbowY_down = cy;

        // Up state (1)
        const elbowX_up = 60; // Closer to body
        const elbowY_up = cy - 40; // Higher up

        const t = animationValue;
        const elbowX = elbowX_down * (1 - t) + elbowX_up * t;
        const elbowY = elbowY_down * (1 - t) + elbowY_up * t;

        return {
            keypoints: [
                kp(cx, cy - 150, 'nose'),
                kp(cx - 20, cy - 160, 'left_eye'),
                kp(cx + 20, cy - 160, 'right_eye'),
                kp(cx - 40, cy - 150, 'left_ear'),
                kp(cx + 40, cy - 150, 'right_ear'),
                kp(cx - 50, shoulderY, 'left_shoulder'),
                kp(cx + 50, shoulderY, 'right_shoulder'),
                kp(cx - elbowX, elbowY, 'left_elbow'),
                kp(cx + elbowX, elbowY, 'right_elbow'),
                kp(cx - 50, wristY, 'left_wrist'),
                kp(cx + 50, wristY, 'right_wrist'),
                kp(cx - 30, cy + 60, 'left_hip'),
                kp(cx + 30, cy + 60, 'right_hip'),
                kp(cx - 35, cy + 140, 'left_knee'),
                kp(cx + 35, cy + 140, 'right_knee'),
                kp(cx - 40, cy + 220, 'left_ankle'),
                kp(cx + 40, cy + 220, 'right_ankle'),
            ],
            score: 0.9,
        } as Pose;
    }, [width, height]);


    /**
     * Body Pose Detection (Python Backend)
     */
    /**
     * Unified Vision System (Gestures + Body Pose)
     */
    const {
        poses: rawPoses,
        isDetecting: isVisionActive,
        repCount: backendRepCount,
        stage: backendStage,
        feedback: backendFeedback,
        formScore: backendFormScore,
        resetStats
    } = useSmartCamera(
        AppConfig.features.enablePoseDetection,
        cameraRef,
        exerciseId
    );

    // Scale normalized poses to screen dimensions for DISPLAY
    const poses = React.useMemo(() => {
        // Priority to real poses
        if (rawPoses && rawPoses.length > 0) {
            const isMirrored = facing === 'front';
            return rawPoses.map(pose => ({
                ...pose,
                keypoints: pose.keypoints.map(kp => ({
                    ...kp,
                    // Mirroring logic (assuming backend sends normalized 0-1)
                    // If backend sends normalized x,y (0-1), we scale by width/height
                    x: isMirrored ? (1 - kp.x) * width : kp.x * width,
                    y: kp.y * height
                }))
            }));
        }

        // Fallback to mock poses if enabled and no real poses
        if (AppConfig.features.enableMockPoseOverlay && mockPoses.length > 0) {
            return mockPoses;
        }

        return [];
    }, [rawPoses, mockPoses, width, height, facing]);

    const isPoseModelReady = true; // Always considered ready with backend approach

    /**
     * Workout timer
     */
    useEffect(() => {
        if (isWorkoutActive) {
            timerRef.current = setInterval(() => {
                setElapsedTime(prev => prev + 1);
            }, 1000);
        } else {
            if (timerRef.current) {
                clearInterval(timerRef.current);
                timerRef.current = null;
            }
        }

        return () => {
            if (timerRef.current) {
                clearInterval(timerRef.current);
            }
        };
    }, [isWorkoutActive]);


    /**
     * Handle pose updates and analyze workout
     * Replaced local workoutAnalysisService with Backend Data
     */
    useEffect(() => {
        if (!isWorkoutActive) return;

        // Use backend data directly
        setRepCount(backendRepCount);
        setCurrentStage(backendStage || '');
        setFormScore(backendFormScore);

        // Convert string feedback to FormValidation format
        const validation: FormValidation = {
            isValid: backendFeedback.length === 0,
            score: backendFormScore,
            errors: backendFeedback.map(msg => ({
                severity: 'warning',
                message: msg,
                visualCue: 'Fix Form',
                audioCue: msg
            }))
        };
        setFormValidation(validation);

        // Track stats locally for summary
        if (backendRepCount > 0) {
            setTotalFormScore(prev => prev + backendFormScore); // This might over-sample, but simpler for now
            setFormScoreCount(prev => prev + 1);
        }

        // Process feedback (audio)
        // Debounce or check for new feedback only? 
        // FeedbackService handles debouncing usually
        if (validation.errors.length > 0) {
            feedbackService.processFormValidation(validation);
        }

        // Announce rep completion
        if (backendRepCount > prevRepCount.current) {
            feedbackService.announceRep(backendRepCount, backendFormScore);
            prevRepCount.current = backendRepCount;
        }
    }, [backendRepCount, backendStage, backendFeedback, backendFormScore, isWorkoutActive]);



    /**
     * Toggle workout session
     */
    const toggleWorkout = () => {
        if (isWorkoutActive) {
            // End workout
            setIsWorkoutActive(false);
            setShowOverlay(false);
            setMockPoses([]); // Clear mock poses

            // Calculate average form score
            const avgScore = formScoreCount > 0
                ? Math.round(totalFormScore / formScoreCount)
                : 100;

            // Announce completion
            feedbackService.announceWorkoutEnd(repCount, avgScore);

            // Show workout summary
            Alert.alert(
                '🎉 Workout Complete!',
                `Exercise: ${exerciseId}\n` +
                `Time: ${formatTime(elapsedTime)}\n` +
                `Reps: ${repCount}\n` +
                `Average Form: ${avgScore}%`,
                [{ text: 'OK' }]
            );

            // Save workout to Firestore
            const exercise = getExerciseById(exerciseId);
            const caloriesBurned = Math.round(repCount * 3 + elapsedTime * 0.1); // Simple estimate
            dispatch(saveWorkout({
                exerciseId,
                exerciseName: exercise?.name || exerciseId,
                duration: elapsedTime,
                reps: repCount,
                averageFormScore: avgScore,
                caloriesBurned,
            }));

            // Update avatar progress
            avatarService.updateAfterWorkout({
                exerciseId,
                reps: repCount,
                duration: elapsedTime,
                formScore: avgScore,
            });

            // Reset for next workout
            workoutAnalysisService.reset(exerciseId);
            setRepCount(0);
            setCurrentStage('');
            setElapsedTime(0);
            setTotalFormScore(0);
            setFormScoreCount(0);
            prevRepCount.current = 0;
        } else {
            // Start countdown first
            setShowCountdown(true);
        }
    };

    const handleCountdownComplete = () => {
        setShowCountdown(false);
        resetStats(); // Reset backend stats
        setIsWorkoutActive(true);
        setShowOverlay(true);

        // Announce start
        const exercise = getExerciseById(exerciseId);
        feedbackService.announceWorkoutStart(exercise?.name || exerciseId);

        // Mock Animation Loop
        if (AppConfig.features.enableMockPoseOverlay && !AppConfig.features.enablePoseDetection) {
            console.log("Starting debug animation loop");
            let frame = 0;
            // Clear any existing mock timer
            if ((window as any).mockTimer) clearInterval((window as any).mockTimer);

            (window as any).mockTimer = setInterval(() => {
                // Cycle: Up -> Down -> Up every 4 seconds (approx)
                // 30fps simulation
                frame++;
                const t = (Math.sin(frame / 20) + 1) / 2; // 0 to 1 smooth
                setMockPoses([generateMockPose(t)]);
            }, 50);
        }
    };


    /**
     * Toggle camera facing
     */
    const toggleCameraFacing = () => {
        setFacing(current => (current === 'back' ? 'front' : 'back'));
    };

    /**
     * Cycle through available exercises (legacy, still works during workout)
     */
    const cycleExercise = () => {
        const currentIndex = AVAILABLE_EXERCISES.indexOf(exerciseId);
        const nextIndex = (currentIndex + 1) % AVAILABLE_EXERCISES.length;
        const newExercise = AVAILABLE_EXERCISES[nextIndex];

        setExerciseId(newExercise);
        resetStats(); // Reset backend stats for new exercise
        setRepCount(0);
        prevRepCount.current = 0;
    };

    /**
     * Handle exercise selection from modal
     */
    const handleExerciseSelect = (id: string) => {
        setExerciseId(id as ExerciseId);
        resetStats(); // Reset backend stats
        setRepCount(0);
        prevRepCount.current = 0;
    };

    /**
     * Format seconds to MM:SS
     */
    const formatTime = (seconds: number): string => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    // Handle permission states
    if (!permission) {
        return <View style={styles.container} />;
    }

    if (!permission.granted) {
        return (
            <View style={styles.permissionContainer}>
                <Text style={styles.permissionTitle}>📸 Camera Access Required</Text>
                <Text style={styles.permissionText}>
                    We need camera access to analyze your workout form in real-time.
                </Text>
                <TouchableOpacity style={styles.permissionButton} onPress={requestPermission}>
                    <Text style={styles.permissionButtonText}>Grant Permission</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={styles.backButton}
                    onPress={() => navigation.navigate('Home')}
                >
                    <Text style={styles.backButtonText}>Go Back</Text>
                </TouchableOpacity>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <CameraView
                style={styles.camera}
                facing={facing}
                ref={cameraRef}
            >
                {/* Pose Skeleton Overlay - DISABLED per user request */}
                {/* {poses.length > 0 && (
                    <PoseOverlay
                        poses={poses}
                        width={width}
                        height={height}
                        formScore={formScore}
                    />
                )} */}

                {/* Form Feedback Overlay */}
                <FormFeedbackOverlay
                    validation={formValidation}
                    currentStage={currentStage}
                    isVisible={isWorkoutActive}
                />

                {/* HUD - Exercise Info */}
                {isWorkoutActive && (
                    <View style={styles.hud}>
                        <BlurView intensity={30} tint="dark" style={styles.hudBlur}>
                            <TouchableOpacity onPress={cycleExercise} activeOpacity={0.7}>
                                <Text style={styles.hudExercise}>
                                    {navigation.params?.exerciseName || getExerciseById(exerciseId)?.name || exerciseId}
                                </Text>
                            </TouchableOpacity>

                            {planMode && (
                                <Text style={styles.hudSetProgress}>
                                    Set {currentSet}/{totalSets}
                                </Text>
                            )}

                            <View style={styles.hudRow}>
                                <Text style={styles.hudIcon}>⏱</Text>
                                <Text style={styles.hudTimer}>{formatTime(elapsedTime)}</Text>
                            </View>

                            <View style={styles.hudDivider} />

                            <Text style={styles.hudLabel}>REPS</Text>
                            <Text style={styles.hudReps}>{repCount}</Text>

                            {planMode && (
                                <Text style={styles.hudTarget}>Target: {targetRepsParam}</Text>
                            )}
                        </BlurView>
                    </View>
                )}

                {/* Status Indicators */}
                {AppConfig.features.enablePoseDetection && !isPoseModelReady && (
                    <View style={styles.statusBanner}>
                        <Text style={styles.statusText}>
                            {poseError ? `⚠️ ${poseError}` : '⏳ Loading AI...'}
                        </Text>
                    </View>
                )}

                {AppConfig.features.enableMockPoseOverlay &&
                    !AppConfig.features.enablePoseDetection && isWorkoutActive && (
                        <View style={styles.mockBanner}>
                            <Text style={styles.mockText}>📍 Demo Mode (Animating)</Text>
                        </View>
                    )}

                {/* Control Buttons */}
                <View style={styles.controlBar}>
                    <TouchableOpacity style={styles.controlButton} onPress={toggleCameraFacing}>
                        <Text style={styles.controlIcon}>🔄</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.mainButton, isWorkoutActive && styles.stopButton]}
                        onPress={toggleWorkout}
                        activeOpacity={0.8}
                    >
                        <Text style={[styles.mainButtonIcon, isWorkoutActive && styles.stopIconAdjustment]}>
                            {isWorkoutActive ? '⏹' : '▶'}
                        </Text>
                        <Text style={styles.mainButtonText}>
                            {isWorkoutActive ? 'STOP' : 'START'}
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.controlButton}
                        onPress={() => navigation.navigate('Home')}
                    >
                        <Text style={styles.controlIcon}>✕</Text>
                    </TouchableOpacity>
                </View>
            </CameraView>

            {/* Exercise Selector Modal */}
            <ExerciseSelector
                visible={showExerciseSelector}
                selectedExerciseId={exerciseId}
                onSelect={handleExerciseSelect}
                onClose={() => setShowExerciseSelector(false)}
            />

            {/* Exercise Selection Button (when not in workout) */}
            {!isWorkoutActive && (
                <View style={styles.exerciseSelectContainer}>
                    <TouchableOpacity
                        style={styles.exerciseSelectButton}
                        onPress={() => setShowExerciseSelector(true)}
                        activeOpacity={0.8}
                    >
                        <BlurView intensity={20} tint="dark" style={styles.exerciseSelectBlur}>
                            <Text style={styles.exerciseSelectLabel}>Selected Exercise</Text>
                            <Text style={styles.exerciseSelectName}>
                                {getExerciseById(exerciseId)?.name || exerciseId}
                            </Text>
                            <Text style={styles.exerciseSelectHint}>Tap to change ▼</Text>
                        </BlurView>
                    </TouchableOpacity>
                </View>
            )}

            {showCountdown && (
                <CountdownOverlay onComplete={handleCountdownComplete} />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.backgroundDark,
    },
    camera: {
        flex: 1,
    },

    // Permission Screen
    permissionContainer: {
        flex: 1,
        backgroundColor: Colors.backgroundDark,
        justifyContent: 'center',
        alignItems: 'center',
        padding: Spacing.xl,
    },
    permissionTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: Colors.textPrimary,
        marginBottom: Spacing.m,
        textAlign: 'center',
    },
    permissionText: {
        fontSize: 16,
        color: Colors.textSecondary,
        textAlign: 'center',
        marginBottom: Spacing.xl,
        lineHeight: 24,
    },
    permissionButton: {
        backgroundColor: Colors.primaryStart,
        paddingVertical: Spacing.m,
        paddingHorizontal: Spacing.xl,
        borderRadius: Layout.borderRadius.l,
        marginBottom: Spacing.m,
        ...Shadows.glow,
    },
    permissionButtonText: {
        color: Colors.textPrimary,
        fontSize: 16,
        fontWeight: 'bold',
    },
    backButton: {
        padding: Spacing.m,
    },
    backButtonText: {
        color: Colors.primaryStart,
        fontSize: 16,
    },

    // HUD
    hud: {
        position: 'absolute',
        top: 60,
        left: 20,
        borderRadius: Layout.borderRadius.l,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: Colors.glassBorder,
        width: 140, // Fixed width
        backgroundColor: 'transparent',
    },
    hudBlur: {
        padding: Spacing.m,
        backgroundColor: Colors.glassSurface,
    },
    hudExercise: {
        color: Colors.accentCyan,
        fontSize: 14,
        fontWeight: 'bold',
        textTransform: 'uppercase',
        marginBottom: 8,
    },
    hudRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 8,
        gap: 6,
    },
    hudIcon: {
        fontSize: 16,
        color: Colors.textSecondary,
    },
    hudTimer: {
        color: Colors.textPrimary,
        fontSize: 20,
        fontWeight: '600',
        fontVariant: ['tabular-nums'],
    },
    hudDivider: {
        height: 1,
        backgroundColor: Colors.glassBorder,
        marginVertical: 12,
    },
    hudLabel: {
        color: Colors.textTertiary,
        fontSize: 10,
        letterSpacing: 2,
        textTransform: 'uppercase',
        marginBottom: 4,
    },
    hudReps: {
        color: Colors.textPrimary,
        fontSize: 48,
        fontWeight: 'bold',
        marginTop: -4,
        textShadowColor: Colors.primaryStart,
        textShadowOffset: { width: 0, height: 0 },
        textShadowRadius: 10,
    },
    hudSetProgress: {
        color: Colors.primaryStart,
        fontSize: 12,
        fontWeight: '600',
        marginTop: 4,
        textAlign: 'center',
    },
    hudTarget: {
        color: Colors.textTertiary,
        fontSize: 11,
        marginTop: 4,
        textAlign: 'center',
    },

    // Status Banners
    statusBanner: {
        position: 'absolute',
        top: 60,
        right: 100, // Adjusted to not overlap exercise selector
        backgroundColor: 'rgba(250, 204, 21, 0.9)',
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: Layout.borderRadius.m,
        borderWidth: 1,
        borderColor: 'rgba(250, 204, 21, 0.3)',
    },
    statusText: {
        color: '#000',
        fontSize: 12,
        fontWeight: 'bold',
    },
    mockBanner: {
        position: 'absolute',
        top: 150, // Moved up slightly
        right: 20,
        backgroundColor: 'rgba(108, 99, 255, 0.8)',
        paddingVertical: 6,
        paddingHorizontal: 12,
        borderRadius: Layout.borderRadius.m,
        borderWidth: 1,
        borderColor: Colors.glassBorder,
    },
    mockText: {
        color: '#FFF',
        fontSize: 11,
        fontWeight: '600',
    },

    // Control Bar
    controlBar: {
        position: 'absolute',
        bottom: 50,
        left: 0,
        right: 0,
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
        paddingHorizontal: Spacing.xl,
    },
    controlButton: {
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: Colors.glassSurface,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: Colors.glassBorder,
    },
    controlIcon: {
        fontSize: 24,
        color: Colors.textPrimary,
    },
    controlText: {
        display: 'none',
    },
    mainButton: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: Colors.primaryStart,
        justifyContent: 'center',
        alignItems: 'center',
        ...Shadows.glow,
        borderWidth: 4,
        borderColor: 'rgba(255, 255, 255, 0.2)',
    },
    stopButton: {
        backgroundColor: Colors.accentError,
        shadowColor: Colors.accentError,
        borderColor: 'rgba(255, 68, 68, 0.3)',
    },
    mainButtonIcon: {
        fontSize: 32,
        color: Colors.textPrimary,
        marginLeft: 4,
    },
    stopIconAdjustment: { // Used in render logic
        marginLeft: 0,
    },
    mainButtonText: {
        position: 'absolute',
        bottom: -25,
        color: Colors.textSecondary,
        fontSize: 12,
        fontWeight: '600',
        letterSpacing: 1,
    },

    // Exercise Selector Button (Floating)
    exerciseSelectContainer: {
        position: 'absolute',
        top: 60,
        right: 20,
        left: undefined,
        width: 160,
    },
    exerciseSelectButton: {
        borderRadius: Layout.borderRadius.l,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: Colors.glassBorder,
        backgroundColor: 'transparent',
    },
    exerciseSelectBlur: {
        padding: Spacing.m,
        backgroundColor: Colors.glassSurface,
        alignItems: 'center',
    },
    exerciseSelectLabel: {
        color: Colors.textTertiary,
        fontSize: 10,
        marginBottom: 4,
        textTransform: 'uppercase',
    },
    exerciseSelectName: {
        color: Colors.textPrimary,
        fontSize: 14,
        fontWeight: 'bold',
        textAlign: 'center',
    },
    exerciseSelectHint: {
        color: Colors.accentCyan,
        fontSize: 10,
        marginTop: 4,
    },
});

