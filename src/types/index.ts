export interface PlanMetrics {
    totalVolume: number; // Total sets x reps
    averageSessionDuration: number;
    weeklyIntensity: number; // 1-10 scale
    targetCalorieBurn?: number;
    expectedProgressPerWeek?: string;
    totalWorkouts?: number;
    estimatedCalories?: number;
    focusMuscles?: string[];
    weeklyFrequency?: number;
}

export interface UserProgress {
    week: number;
    exerciseId: string;
    completedReps: number;
    targetReps: number;
    weight: number;
    difficulty: 'easy' | 'moderate' | 'hard';
}

export interface PerformancePrediction {
    predictedMaxStrength: number;
    estimatedFatLoss: number; // kg
    estimatedMuscleGain: number; // kg
    injuryRiskScore: number; // 0-100
    recommendedDeloadWeek: number;
}

export interface Point {
    x: number;
    y: number;
    z?: number;
}

export interface Keypoint {
    name: string;
    x: number;
    y: number;
    z?: number;
    score: number;
}

export interface Pose {
    keypoints: Keypoint[];
    score: number;
}

export interface FormCheck {
    name: string;
    description: string;
    severity: 'error' | 'warning' | 'tip';
    checkFunction: (pose: Pose) => boolean;
    feedback: {
        visual: string;
        audio: string;
    };
}

export interface FormValidation {
    isValid: boolean;
    score: number; // 0-100
    errors: {
        severity: 'error' | 'warning' | 'tip';
        message: string;
        visualCue: string;
        audioCue: string;
    }[];
}

export interface Feedback {
    visual: string;
    audio: string;
    haptic?: 'light' | 'medium' | 'heavy';
}

export interface ExerciseStage {
    name: string;
    angleRanges: {
        joint: string;
        min: number;
        max: number;
        optimal: number;
    }[];
    duration?: number;
}

export interface FormCriteria {
    primaryAngles: {
        joint: string;
        min: number;
        max: number;
        optimal: number;
    }[];
    maxAllowedErrors?: number;
}

/**
 * Exercise Definition (Database Model)
 */
export interface Exercise {
    id: string;
    name: string;
    displayName?: string; // Human-friendly name
    category: 'strength' | 'cardio' | 'flexibility' | 'plyometric';
    muscleGroups: MuscleGroup[] | string[];

    // Core Logic (Functional)
    keypoints: number[];
    stages: ExerciseStage[];
    formChecks: FormCheck[];

    // Equipment Requirements
    equipmentRequired: 'bodyweight' | 'home' | 'gym'; // High-level category
    requiredEquipment: EquipmentItem[]; // Granular requirements
    optionalEquipment?: EquipmentItem[];

    // Level System
    unlockLevel: number;
    difficulty: 'beginner' | 'intermediate' | 'advanced';

    // Progression Data
    baseReps: number;
    baseSets: number;
    repIncrement: number;
    setIncrement: number;

    // Media & UI
    thumbnailUrl: string;
    demonstrationVideo?: string;
    videoUrl?: string; // Alias for demonstrationVideo
    description: string;
    instructions: string[]; // Replaces steps
    steps?: string[];      // Legacy field for compatibility
    commonMistakes?: string[];
    tips: string[];

    // Extended Data
    caloriesPerRep?: number;
    alternatives?: string[];
    progressionPath?: string[];
    formThresholds?: {
        minAngle?: number;
        maxAngle?: number;
        targetAngle?: number;
    };
}

/**
 * Exercise Instance in a Workout (Refined)
 */
export interface PlannedExercise {
    exerciseId: string; // Internal system ID
    id?: string;        // Compatibility with Exercise object
    name: string;      // Display name
    displayName?: string; // Human-friendly name
    exerciseName?: string; // Legacy field for compatibility
    sets: number;
    reps: string | number;      // e.g., "8-12", "5", "max"
    rest: number;      // seconds
    notes?: string;
    modifications?: string[];
    completed?: boolean;
    targetMuscle?: string;
    difficulty?: 'beginner' | 'intermediate' | 'advanced';

    // Extended fields for plan generation
    category?: 'strength' | 'cardio' | 'flexibility' | 'plyometric';
    muscleGroups?: MuscleGroup[] | string[];
    caloriesPerRep?: number;
}

export type EquipmentItem =
    | 'none'
    | 'dumbbells'
    | 'resistance_bands'
    | 'pull_up_bar'
    | 'yoga_mat'
    | 'bench'
    | 'kettlebells'
    | 'barbell'
    | 'squat_rack'
    | 'cable_machine'
    | 'leg_press_machine'
    | 'lat_pulldown_machine'
    | 'smith_machine'
    | 'ez_bar';

export type MuscleGroup = 'chest' | 'back' | 'shoulders' | 'arms' | 'legs' | 'core' | 'fullbody' | 'cardio';

export interface FitnessProfile {
    equipmentAccess: 'bodyweight' | 'home' | 'gym';
    availableEquipment: EquipmentItem[];
    experienceLevel: 'beginner' | 'intermediate' | 'advanced';
    fitnessGoals: string[];
    availableDays: number;
    healthIssues: string[];
}

export interface ProgressSystem {
    currentLevel: number;
    currentXP: number;
    xpToNextLevel: number;
    totalWorkoutsCompleted: number;
    unlockedExercises: string[];
}

export interface WorkoutCapacity {
    bodyweight: {
        sets: number;
        reps: number;
    };
    weighted: {
        sets: number;
        reps: number;
    };
}

export interface UserProfile {
    uid: string;
    email: string;
    displayName: string;
    photoURL?: string;
    age: number;
    weight: number; // kg
    height: number; // cm

    // Enhanced fields
    fitnessProfile: FitnessProfile;
    progressSystem: ProgressSystem;
    workoutCapacity: WorkoutCapacity;

    // Legacy fields (maintained for compatibility)
    fitnessGoal: 'weight_loss' | 'muscle_gain' | 'endurance' | 'flexibility';
    workoutExperience?: 'beginner' | 'intermediate' | 'advanced';
    level: number;
    xp: number;
    totalWorkouts: number;
    workoutPlanId?: string;
    createdAt: Date;
    updatedAt: Date;
    transformationPhotos: string[];
}

export interface WorkoutSession {
    id: string;
    day: number | string; // Day 1, Day 2 or "Monday"
    dayOfWeek?: number;
    title?: string;
    focus?: string;
    exercises: PlannedExercise[];
    duration: number;
    status: 'scheduled' | 'completed' | 'skipped' | 'in_progress';
    type: 'strength' | 'cardio' | 'flexibility' | 'rest';
    intensity?: 'low' | 'moderate' | 'high';
    warmup?: string;
    cooldown?: string;
    notes?: string;
    isRestDay?: boolean;
}

export interface WorkoutPlan {
    id: string;
    userId: string;
    name: string;
    description?: string;
    planLevel?: number;
    userProfile?: UserProfile;
    planName?: string; // Legacy
    frequency: number;
    duration: number;
    sessions: WorkoutSession[];
    metrics: PlanMetrics;
    difficulty: 'beginner' | 'intermediate' | 'advanced';
    startDate: Date;
    endDate: Date;
    status: 'active' | 'completed' | 'archived';
    levelRequirement?: number;
    progressionStrategy?: string;
    predictions?: PerformancePrediction;
    nutritionGuidelines?: string;
    createdAt?: Date;
    updatedAt?: Date;
    isActive?: boolean;
}

// Legacy aliases for backward compatibility where possible
export type DailyWorkout = WorkoutSession;

export interface WorkoutSessionHistory {
    id: string;
    userId: string;
    exercise: string;
    startTime: Date;
    endTime: Date;
    duration: number; // seconds

    performance: {
        totalReps: number;
        validReps: number;
        invalidReps: number;
        averageFormScore: number;
        caloriesBurned: number;
    };

    formErrors: {
        type: string;
        count: number;
        timestamps: number[];
    }[];

    videoURL?: string;
}

export interface ProgressStats {
    userId: string;
    period: 'daily' | 'weekly' | 'monthly';
    date: string; // YYYY-MM-DD

    totalWorkouts: number;
    totalDuration: number;
    totalReps: number;
    averageFormScore: number;
    caloriesBurned: number;

    exerciseBreakdown: {
        [exerciseId: string]: {
            count: number;
            reps: number;
            duration: number;
        };
    };

    personalRecords?: {
        maxReps?: { exercise: string; count: number; date: string; };
        longestSession?: { duration: number; date: string; };
        bestFormScore?: { score: number; exercise: string; date: string; };
    };
}

export interface TransformationPhoto {
    id: string;
    userId: string;
    photoURL: string;
    uploadDate: Date;
    bodyMetrics: {
        weight: number;
        measurements?: {
            chest?: number;
            waist?: number;
            arms?: number;
            legs?: number;
        };
    };
    workoutsSinceLastPhoto: number;
}

export interface AvatarParameters {
    bodyFat: number; // 0-1
    muscleSize: number; // 0-1
    height: number; // meters
    muscles: {
        chest: number;
        arms: number;
        legs: number;
        core: number;
        back: number;
    };
}

export interface GestureType {
    name: string;
    emoji: string;
}

export interface HandLandmark {
    x: number;
    y: number;
    z: number;
}

export interface DetectionResult {
    gesture: GestureType;
    confidence: number;
    landmarks?: HandLandmark[];
}

export interface ExerciseInstructions {
    exerciseId: string;
    exerciseName: string;
    description: string;
    imageUri: string;
    steps: string[];
    tips: string[];
    lastUpdated?: any;
}

// =================================================================
// RECOVERY & REST SYSTEM TYPES
// =================================================================

export interface RecoveryMetrics {
    userId: string;
    date: Date;
    recoveryScore: number; // 0-100
    sleepHours?: number;
    sleepQuality?: 1 | 2 | 3 | 4 | 5; // 1=poor, 5=excellent
    muscleSoreness?: {
        level: 1 | 2 | 3 | 4 | 5; // 1=none, 5=severe
        affectedAreas: MuscleGroup[];
    };
    stressLevel?: 1 | 2 | 3 | 4 | 5; // 1=low, 5=high
    energyLevel?: 1 | 2 | 3 | 4 | 5; // 1=exhausted, 5=energized
    hydrationLevel?: 1 | 2 | 3 | 4 | 5; // 1=poor, 5=excellent
    nutritionQuality?: 1 | 2 | 3 | 4 | 5; // 1=poor, 5=excellent
    notes?: string;
}

export interface RecoveryRecommendation {
    type: 'complete_rest' | 'active_recovery' | 'light_workout' | 'normal_workout' | 'high_intensity';
    confidence: number; // 0-1
    reasoning: string;
    suggestions: string[];
    nutritionTips?: string[];
    sleepRecommendations?: string[];
}

export interface RestDayGuidance {
    nutritionFocus: string[];
    sleepRecommendations: string[];
    recoveryActivities: string[];
    mentalRecovery: string[];
    hydrationGoal: string;
}

export interface ActiveRecoverySession {
    id: string;
    type: 'active_recovery';
    exercises: PlannedExercise[];
    duration: number; // minutes
    intensity: 'very_low' | 'low';
    focus: string;
    benefits: string[];
}
