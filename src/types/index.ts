export interface UserProfile {
    uid: string;
    email: string;
    displayName: string;
    photoURL?: string;
    age: number;
    weight: number; // kg
    height: number; // cm
    fitnessGoal: 'weight_loss' | 'muscle_gain' | 'endurance' | 'flexibility';
    createdAt: Date;
    updatedAt: Date;
    bodyMetrics?: {
        chest?: number;
        waist?: number;
        arms?: number;
        legs?: number;
    };
    transformationPhotos: string[]; // Storage URLs
}

export interface WorkoutSession {
    id: string;
    userId: string;
    exercise: string;
    startTime: Date;
    endTime: Date;
    duration: number; // seconds

    performance: {
        totalReps: number;
        validReps: number; // Good form
        invalidReps: number; // Poor form
        averageFormScore: number; // 0-100
        caloriesBurned: number;
    };

    formErrors: {
        type: string;
        count: number;
        timestamps: number[];
    }[];

    videoURL?: string; // Storage URL for recorded session
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

export interface Exercise {
    id: string;
    name: string;
    category: 'strength' | 'cardio' | 'flexibility';
    muscleGroups: string[];
    keypoints: number[]; // Relevant body landmarks
    stages: ExerciseStage[];
    formChecks: FormCheck[];
}

export interface ExerciseStage {
    name: 'up' | 'down' | 'hold' | 'rest';
    angleRanges: {
        joint: string;
        min: number;
        max: number;
        optimal: number;
    }[];
    duration?: number;
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
