import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    ScrollView,
    KeyboardAvoidingView,
    Platform,
    ActivityIndicator,
    Alert,
} from 'react-native';
import Slider from '@react-native-community/slider';
const TypedSlider = Slider as any;
import { useAppDispatch, useAppSelector } from '../hooks/reduxHooks';
import { updateProfile } from '../store/slices/authSlice';
import { UserProfile } from '../types';
import { workoutPlanService } from '../services/WorkoutPlanService';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../services/firebaseConfig';
import { Colors, Layout, Spacing, Gradients } from '../theme/Theme';
import { LinearGradient } from 'expo-linear-gradient';

interface ProfileSetupScreenProps {
    navigation: any;
}

const COMMON_HEALTH_ISSUES = [
    'knee_pain', 'lower_back_pain', 'shoulder_injury', 'wrist_pain',
    'ankle_injury', 'hip_injury', 'neck_pain', 'heart_condition'
];

const EQUIPMENT_OPTIONS = [
    { id: 'dumbbells', label: 'Dumbbells' },
    { id: 'resistance_bands', label: 'Resistance Bands' },
    { id: 'pull_up_bar', label: 'Pull-up Bar' },
    { id: 'yoga_mat', label: 'Yoga Mat' },
    { id: 'bench', label: 'Bench' },
    { id: 'kettlebells', label: 'Kettlebells' },
];

export default function ProfileSetupScreen({ navigation }: ProfileSetupScreenProps) {
    const dispatch = useAppDispatch();
    const { user, loading } = useAppSelector((state) => state.auth);

    // Multi-step state
    const [currentStep, setCurrentStep] = useState(1);
    const totalSteps = 7;

    // Step 1: Basic Info
    const [age, setAge] = useState('');
    const [weight, setWeight] = useState('');
    const [height, setHeight] = useState('');

    // Step 2: Goals
    const [fitnessGoal, setFitnessGoal] = useState<UserProfile['fitnessGoal']>('muscle_gain');

    // Step 3: Experience
    const [workoutExperience, setWorkoutExperience] = useState<'beginner' | 'intermediate' | 'advanced'>('beginner');

    // Step 4: Fitness Assessment (Sliders)
    const [pushups, setPushups] = useState(10);
    const [squats, setSquats] = useState(20);
    const [plankMinutes, setPlankMinutes] = useState(0.5);

    // Step 5: Health Issues
    const [selectedHealthIssues, setSelectedHealthIssues] = useState<string[]>([]);
    const [customHealthIssue, setCustomHealthIssue] = useState('');

    // Step 6: Equipment & Location
    const [equipmentAccess, setEquipmentAccess] = useState<'bodyweight' | 'home' | 'gym'>('bodyweight');
    const [selectedEquipment, setSelectedEquipment] = useState<string[]>([]);

    // Step 7: Plan preview
    const [generatingPlan, setGeneratingPlan] = useState(false);

    const toggleHealthIssue = (issue: string) => {
        setSelectedHealthIssues(prev =>
            prev.includes(issue) ? prev.filter(i => i !== issue) : [...prev, issue]
        );
    };

    const toggleEquipment = (equipment: string) => {
        setSelectedEquipment(prev =>
            prev.includes(equipment) ? prev.filter(e => e !== equipment) : [...prev, equipment]
        );
    };

    const handleNext = () => {
        // Validation for each step
        if (currentStep === 1) {
            if (!age || !weight || !height) {
                Alert.alert('Error', 'Please fill in all fields');
                return;
            }
            const ageNum = parseInt(age);
            const weightNum = parseFloat(weight);
            const heightNum = parseFloat(height);
            if (ageNum <= 0 || weightNum <= 0 || heightNum <= 0) {
                Alert.alert('Error', 'Please enter valid numbers');
                return;
            }
        }

        if (currentStep < totalSteps) {
            setCurrentStep(currentStep + 1);
        }
    };

    const handleBack = () => {
        if (currentStep > 1) {
            setCurrentStep(currentStep - 1);
        }
    };

    const handleComplete = async () => {
        if (!user) return;

        try {
            setGeneratingPlan(true);

            // Compile all health issues
            const allHealthIssues = [...selectedHealthIssues];
            if (customHealthIssue.trim()) {
                allHealthIssues.push(customHealthIssue.trim());
            }

            // Create updated profile data
            const profileUpdate: Partial<UserProfile> = {
                age: parseInt(age),
                weight: parseFloat(weight),
                height: parseFloat(height),
                fitnessGoal,
                workoutExperience,
                fitnessProfile: {
                    equipmentAccess,
                    availableEquipment: selectedEquipment as any[],
                    experienceLevel: workoutExperience,
                    fitnessGoals: [fitnessGoal],
                    healthIssues: allHealthIssues,
                    availableDays: workoutExperience === 'beginner' ? 3 : workoutExperience === 'intermediate' ? 4 : 5
                },
                progressSystem: {
                    currentLevel: 1,
                    currentXP: 0,
                    xpToNextLevel: 1000,
                    totalWorkoutsCompleted: 0,
                    unlockedExercises: []
                },
                workoutCapacity: {
                    bodyweight: { sets: 3, reps: 10 },
                    weighted: { sets: 3, reps: 8 }
                }
            };

            console.log('[ProfileSetup] Profile update:', JSON.stringify(profileUpdate));

            // Update profile in auth slice (updates Local state and Firestore via authService)
            await dispatch(updateProfile(profileUpdate)).unwrap();

            // Generate workout plan
            const fullProfile: UserProfile = {
                ...user,
                ...profileUpdate,
                createdAt: user.createdAt || new Date(),
                updatedAt: new Date(),
                transformationPhotos: user.transformationPhotos || [],
            };

            const workoutPlan = workoutPlanService.generateWorkoutPlan(fullProfile);
            const planId = await workoutPlanService.saveWorkoutPlan(workoutPlan);

            // Update user profile with plan ID in Firestore
            if (planId && user.uid) {
                const userRef = doc(db, 'users', user.uid);
                await updateDoc(userRef, { workoutPlanId: planId });
            }

            setGeneratingPlan(false);
            Alert.alert(
                'Success!',
                'Your personalized workout plan is ready!',
                [{ text: 'Start Training', onPress: () => navigation.navigate('Home') }]
            );
        } catch (error: any) {
            setGeneratingPlan(false);
            console.error('[ProfileSetup] Completion error:', error);
            Alert.alert('Error', error.message || 'Failed to complete setup');
        }
    };

    const renderProgressBar = () => (
        <View style={styles.progressContainer}>
            {Array.from({ length: totalSteps }).map((_, index) => (
                <View
                    key={index}
                    style={[
                        styles.progressDot,
                        index + 1 === currentStep && styles.progressDotActive,
                        index + 1 < currentStep && styles.progressDotCompleted,
                    ]}
                />
            ))}
        </View>
    );

    const renderStep = () => {
        switch (currentStep) {
            case 1:
                return (
                    <View style={styles.stepContainer}>
                        <Text style={styles.stepTitle}>Basic Information</Text>
                        <Text style={styles.stepSubtitle}>Let's start with your basics</Text>

                        <View style={styles.inputContainer}>
                            <Text style={styles.label}>Age</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="Enter your age"
                                placeholderTextColor={Colors.textTertiary}
                                value={age}
                                onChangeText={setAge}
                                keyboardType="number-pad"
                                editable={!loading}
                            />
                        </View>

                        <View style={styles.inputContainer}>
                            <Text style={styles.label}>Weight (kg)</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="Enter your weight"
                                placeholderTextColor={Colors.textTertiary}
                                value={weight}
                                onChangeText={setWeight}
                                keyboardType="decimal-pad"
                                editable={!loading}
                            />
                        </View>

                        <View style={styles.inputContainer}>
                            <Text style={styles.label}>Height (cm)</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="Enter your height"
                                placeholderTextColor={Colors.textTertiary}
                                value={height}
                                onChangeText={setHeight}
                                keyboardType="decimal-pad"
                                editable={!loading}
                            />
                        </View>
                    </View>
                );

            case 2:
                return (
                    <View style={styles.stepContainer}>
                        <Text style={styles.stepTitle}>Fitness Goals</Text>
                        <Text style={styles.stepSubtitle}>What are you working towards?</Text>

                        <View style={styles.optionsContainer}>
                            {[
                                { value: 'weight_loss', label: 'Weight Loss (Cutting)', emoji: '🔥' },
                                { value: 'muscle_gain', label: 'Muscle Gain (Bulking)', emoji: '💪' },
                                { value: 'endurance', label: 'Stamina & Endurance', emoji: '🏃' },
                                { value: 'flexibility', label: 'Flexibility', emoji: '🧘' },
                            ].map((goal) => (
                                <TouchableOpacity
                                    key={goal.value}
                                    style={[
                                        styles.optionButton,
                                        fitnessGoal === goal.value && styles.optionButtonActive,
                                    ]}
                                    onPress={() => setFitnessGoal(goal.value as UserProfile['fitnessGoal'])}
                                >
                                    <Text style={styles.optionEmoji}>{goal.emoji}</Text>
                                    <Text
                                        style={[
                                            styles.optionButtonText,
                                            fitnessGoal === goal.value && styles.optionButtonTextActive,
                                        ]}
                                    >
                                        {goal.label}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>
                );

            case 3:
                return (
                    <View style={styles.stepContainer}>
                        <Text style={styles.stepTitle}>Workout Experience</Text>
                        <Text style={styles.stepSubtitle}>How long have you been training?</Text>

                        <View style={styles.optionsContainer}>
                            {[
                                { value: 'beginner', label: 'Beginner', desc: '0-1 year' },
                                { value: 'intermediate', label: 'Intermediate', desc: '1-3 years' },
                                { value: 'advanced', label: 'Advanced', desc: '3+ years' },
                            ].map((exp) => (
                                <TouchableOpacity
                                    key={exp.value}
                                    style={[
                                        styles.optionButton,
                                        workoutExperience === exp.value && styles.optionButtonActive,
                                    ]}
                                    onPress={() => setWorkoutExperience(exp.value as typeof workoutExperience)}
                                >
                                    <View>
                                        <Text
                                            style={[
                                                styles.optionButtonText,
                                                workoutExperience === exp.value && styles.optionButtonTextActive,
                                            ]}
                                        >
                                            {exp.label}
                                        </Text>
                                        <Text style={styles.optionDesc}>{exp.desc}</Text>
                                    </View>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>
                );

            case 4:
                return (
                    <View style={styles.stepContainer}>
                        <Text style={styles.stepTitle}>Fitness Assessment</Text>
                        <Text style={styles.stepSubtitle}>Use the sliders to indicate your current strength</Text>

                        <View style={styles.sliderSection}>
                            <View style={styles.sliderHeader}>
                                <Text style={styles.label}>Max Push-ups</Text>
                                <Text style={styles.sliderValue}>{Math.round(pushups)}</Text>
                            </View>
                            <TypedSlider
                                style={styles.slider}
                                minimumValue={0}
                                maximumValue={100}
                                step={1}
                                value={pushups}
                                onValueChange={setPushups}
                                minimumTrackTintColor={Colors.primaryStart}
                                maximumTrackTintColor={Colors.glassBorder}
                                thumbTintColor={Colors.primaryStart}
                            />
                        </View>

                        <View style={styles.sliderSection}>
                            <View style={styles.sliderHeader}>
                                <Text style={styles.label}>Max Squats</Text>
                                <Text style={styles.sliderValue}>{Math.round(squats)}</Text>
                            </View>
                            <TypedSlider
                                style={styles.slider}
                                minimumValue={0}
                                maximumValue={100}
                                step={1}
                                value={squats}
                                onValueChange={setSquats}
                                minimumTrackTintColor={Colors.primaryStart}
                                maximumTrackTintColor={Colors.glassBorder}
                                thumbTintColor={Colors.primaryStart}
                            />
                        </View>

                        <View style={styles.sliderSection}>
                            <View style={styles.sliderHeader}>
                                <Text style={styles.label}>Plank Duration (min)</Text>
                                <Text style={styles.sliderValue}>{plankMinutes.toFixed(1)} min</Text>
                            </View>
                            <TypedSlider
                                style={styles.slider}
                                minimumValue={0}
                                maximumValue={5}
                                step={0.1}
                                value={plankMinutes}
                                onValueChange={setPlankMinutes}
                                minimumTrackTintColor={Colors.primaryStart}
                                maximumTrackTintColor={Colors.glassBorder}
                                thumbTintColor={Colors.primaryStart}
                            />
                        </View>
                    </View>
                );

            case 5:
                return (
                    <View style={styles.stepContainer}>
                        <Text style={styles.stepTitle}>Health & Limitations</Text>
                        <Text style={styles.stepSubtitle}>Any injuries or conditions we should know about?</Text>

                        <View style={styles.inputContainer}>
                            <Text style={styles.label}>Common Issues (Select all that apply)</Text>
                            <View style={styles.healthIssuesGrid}>
                                {COMMON_HEALTH_ISSUES.map((issue) => (
                                    <TouchableOpacity
                                        key={issue}
                                        style={[
                                            styles.healthIssueChip,
                                            selectedHealthIssues.includes(issue) && styles.healthIssueChipActive,
                                        ]}
                                        onPress={() => toggleHealthIssue(issue)}
                                    >
                                        <Text
                                            style={[
                                                styles.healthIssueText,
                                                selectedHealthIssues.includes(issue) && styles.healthIssueTextActive,
                                            ]}
                                        >
                                            {issue.replace('_', ' ')}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </View>

                        <View style={styles.inputContainer}>
                            <Text style={styles.label}>Other Health Issues (Optional)</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="e.g., asthma, diabetes, etc."
                                placeholderTextColor={Colors.textTertiary}
                                value={customHealthIssue}
                                onChangeText={setCustomHealthIssue}
                                multiline
                                editable={!loading}
                            />
                        </View>
                    </View>
                );

            case 6:
                return (
                    <View style={styles.stepContainer}>
                        <Text style={styles.stepTitle}>Equipment & Location</Text>
                        <Text style={styles.stepSubtitle}>Where will you be working out?</Text>

                        <View style={styles.inputContainer}>
                            <Text style={styles.label}>Workout Location</Text>
                            <View style={styles.optionsContainer}>
                                {[
                                    { value: 'bodyweight', label: 'Home (Bodyweight Only)', emoji: '🏠' },
                                    { value: 'home', label: 'Home (With Equipment)', emoji: '🏋️' },
                                    { value: 'gym', label: 'Gym Access', emoji: '🏢' },
                                ].map((location) => (
                                    <TouchableOpacity
                                        key={location.value}
                                        style={[
                                            styles.optionButton,
                                            equipmentAccess === location.value && styles.optionButtonActive,
                                        ]}
                                        onPress={() => setEquipmentAccess(location.value as any)}
                                    >
                                        <Text style={styles.optionEmoji}>{location.emoji}</Text>
                                        <Text
                                            style={[
                                                styles.optionButtonText,
                                                equipmentAccess === location.value && styles.optionButtonTextActive,
                                            ]}
                                        >
                                            {location.label}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </View>

                        {equipmentAccess === 'home' && (
                            <View style={styles.inputContainer}>
                                <Text style={styles.label}>Available Equipment</Text>
                                <View style={styles.healthIssuesGrid}>
                                    {EQUIPMENT_OPTIONS.map((eq) => (
                                        <TouchableOpacity
                                            key={eq.id}
                                            style={[
                                                styles.healthIssueChip,
                                                selectedEquipment.includes(eq.id) && styles.healthIssueChipActive,
                                            ]}
                                            onPress={() => toggleEquipment(eq.id)}
                                        >
                                            <Text
                                                style={[
                                                    styles.healthIssueText,
                                                    selectedEquipment.includes(eq.id) && styles.healthIssueTextActive,
                                                ]}
                                            >
                                                {eq.label}
                                            </Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>
                            </View>
                        )}
                    </View>
                );

            case 7:
                return (
                    <View style={styles.stepContainer}>
                        <Text style={styles.stepTitle}>Ready to Start! 🎉</Text>
                        <Text style={styles.stepSubtitle}>Your personalized plan is being generated...</Text>

                        <View style={styles.summaryCard}>
                            <Text style={styles.summaryTitle}>Your Profile Summary</Text>

                            <View style={styles.summaryRow}>
                                <Text style={styles.summaryLabel}>Age:</Text>
                                <Text style={styles.summaryValue}>{age} years</Text>
                            </View>
                            <View style={styles.summaryRow}>
                                <Text style={styles.summaryLabel}>Weight / Height:</Text>
                                <Text style={styles.summaryValue}>{weight}kg / {height}cm</Text>
                            </View>
                            <View style={styles.summaryRow}>
                                <Text style={styles.summaryLabel}>Goal:</Text>
                                <Text style={styles.summaryValue}>
                                    {fitnessGoal.replace('_', ' ').toUpperCase()}
                                </Text>
                            </View>
                            <View style={styles.summaryRow}>
                                <Text style={styles.summaryLabel}>Experience:</Text>
                                <Text style={styles.summaryValue}>{workoutExperience.toUpperCase()}</Text>
                            </View>
                            <View style={styles.summaryRow}>
                                <Text style={styles.summaryLabel}>Location:</Text>
                                <Text style={styles.summaryValue}>
                                    {equipmentAccess === 'bodyweight' ? 'Home (Bodyweight)' :
                                        equipmentAccess === 'home' ? 'Home (Equipment)' : 'Gym'}
                                </Text>
                            </View>
                            <View style={styles.summaryRow}>
                                <Text style={styles.summaryLabel}>Strength Test:</Text>
                                <Text style={styles.summaryValue}>{Math.round(pushups)} Pushups, {Math.round(squats)} Squats</Text>
                            </View>
                        </View>

                        <Text style={styles.planInfo}>
                            Based on your profile, we'll create a{' '}
                            {workoutExperience === 'beginner' ? '3-day' :
                                workoutExperience === 'intermediate' ? '4-day' : '5-6 day'}{' '}
                            per week workout plan tailored to your goals!
                        </Text>
                    </View>
                );

            default:
                return null;
        }
    };

    return (
        <View style={styles.container}>
            <ScrollView
                contentContainerStyle={styles.scrollContent}
                keyboardShouldPersistTaps="handled"
            >
                <View style={styles.content}>
                    <View style={styles.header}>
                        <Text style={styles.title}>Complete Your Profile</Text>
                        <Text style={styles.subtitle}>
                            Step {currentStep} of {totalSteps}
                        </Text>
                    </View>

                    {renderProgressBar()}
                    {renderStep()}

                    {/* Navigation Buttons */}
                    <View style={styles.buttonContainer}>
                        {currentStep > 1 && (
                            <TouchableOpacity
                                style={styles.backButton}
                                onPress={handleBack}
                                disabled={loading || generatingPlan}
                            >
                                <Text style={styles.backButtonText}>Back</Text>
                            </TouchableOpacity>
                        )}

                        <TouchableOpacity
                            style={[styles.nextButtonContainer, (loading || generatingPlan) && styles.buttonDisabled]}
                            onPress={currentStep < totalSteps ? handleNext : handleComplete}
                            disabled={loading || generatingPlan}
                        >
                            <LinearGradient
                                colors={Gradients.primary}
                                style={styles.nextButton}
                            >
                                {generatingPlan ? (
                                    <ActivityIndicator color="#FFFFFF" />
                                ) : (
                                    <Text style={styles.nextButtonText}>
                                        {currentStep < totalSteps ? 'Next' : 'Complete Setup'}
                                    </Text>
                                )}
                            </LinearGradient>
                        </TouchableOpacity>
                    </View>
                </View>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.backgroundDark,
    },
    scrollContent: {
        flexGrow: 1,
    },
    content: {
        flex: 1,
        paddingHorizontal: Spacing.l,
        paddingVertical: Spacing.xxl,
    },
    header: {
        marginBottom: Spacing.l,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: Colors.textPrimary,
        marginBottom: Spacing.s,
    },
    subtitle: {
        fontSize: 16,
        color: Colors.textSecondary,
    },
    progressContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        gap: Spacing.s,
        marginBottom: Spacing.xl,
    },
    progressDot: {
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
    },
    progressDotActive: {
        backgroundColor: Colors.primaryStart,
        width: 24,
    },
    progressDotCompleted: {
        backgroundColor: Colors.accentSuccess,
    },
    stepContainer: {
        marginBottom: Spacing.xl,
    },
    stepTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: Colors.textPrimary,
        marginBottom: Spacing.s,
    },
    stepSubtitle: {
        fontSize: 14,
        color: Colors.textSecondary,
        marginBottom: Spacing.l,
    },
    inputContainer: {
        marginBottom: 20,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        color: Colors.textPrimary,
        marginBottom: Spacing.s,
    },
    input: {
        backgroundColor: Colors.glassSurface,
        borderWidth: 1,
        borderColor: Colors.glassBorder,
        borderRadius: Layout.borderRadius.m,
        padding: Spacing.m,
        fontSize: 16,
        color: Colors.textPrimary,
    },
    optionsContainer: {
        gap: Spacing.s,
    },
    optionButton: {
        backgroundColor: Colors.glassSurface,
        borderWidth: 1,
        borderColor: Colors.glassBorder,
        borderRadius: Layout.borderRadius.m,
        padding: Spacing.m,
        flexDirection: 'row',
        alignItems: 'center',
    },
    optionButtonActive: {
        backgroundColor: Colors.primaryStart,
        borderColor: Colors.primaryStart,
    },
    optionEmoji: {
        fontSize: 24,
        marginRight: Spacing.s,
    },
    optionButtonText: {
        color: Colors.textSecondary,
        fontSize: 16,
        fontWeight: '600',
        flex: 1,
    },
    optionButtonTextActive: {
        color: Colors.textPrimary,
    },
    optionDesc: {
        color: Colors.textTertiary,
        fontSize: 12,
    },
    sliderSection: {
        marginBottom: Spacing.l,
    },
    sliderHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: Spacing.s,
    },
    sliderValue: {
        fontSize: 18,
        fontWeight: 'bold',
        color: Colors.primaryStart,
    },
    slider: {
        width: '100%',
        height: 40,
    },
    healthIssuesGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: Spacing.s,
    },
    healthIssueChip: {
        backgroundColor: Colors.glassSurface,
        borderWidth: 1,
        borderColor: Colors.glassBorder,
        borderRadius: Layout.borderRadius.round,
        paddingVertical: Spacing.s,
        paddingHorizontal: Spacing.m,
    },
    healthIssueChipActive: {
        backgroundColor: Colors.primaryStart,
        borderColor: Colors.primaryStart,
    },
    healthIssueText: {
        color: Colors.textSecondary,
        fontSize: 14,
        textTransform: 'capitalize',
    },
    healthIssueTextActive: {
        color: Colors.textPrimary,
    },
    summaryCard: {
        backgroundColor: Colors.glassSurface,
        borderWidth: 1,
        borderColor: Colors.glassBorder,
        borderRadius: Layout.borderRadius.m,
        padding: Spacing.m,
        marginBottom: Spacing.m,
    },
    summaryTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: Colors.textPrimary,
        marginBottom: Spacing.m,
    },
    summaryRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: Spacing.s,
    },
    summaryLabel: {
        color: Colors.textSecondary,
        fontSize: 14,
    },
    summaryValue: {
        color: Colors.textPrimary,
        fontSize: 14,
        fontWeight: '600',
    },
    planInfo: {
        color: Colors.textSecondary,
        fontSize: 14,
        textAlign: 'center',
        lineHeight: 20,
    },
    buttonContainer: {
        flexDirection: 'row',
        gap: Spacing.s,
        marginTop: 'auto',
    },
    backButton: {
        flex: 1,
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        borderRadius: Layout.borderRadius.m,
        padding: Spacing.m,
        alignItems: 'center',
    },
    backButtonText: {
        color: Colors.textPrimary,
        fontSize: 16,
        fontWeight: '600',
    },
    nextButtonContainer: {
        flex: 2,
    },
    nextButton: {
        borderRadius: Layout.borderRadius.m,
        padding: Spacing.m,
        alignItems: 'center',
    },
    nextButtonText: {
        color: Colors.textPrimary,
        fontSize: 16,
        fontWeight: 'bold',
    },
    buttonDisabled: {
        opacity: 0.6,
    },
});
