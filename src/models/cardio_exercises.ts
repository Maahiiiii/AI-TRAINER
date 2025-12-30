import { Exercise } from '../types';

// =================================================================
// CARDIO & HIIT EXERCISES
// =================================================================

export const CARDIO_EXERCISES: Exercise[] = [
    {
        id: 'jumping-jacks',
        name: 'jumping_jacks',
        displayName: 'Jumping Jacks',
        category: 'cardio',
        muscleGroups: ['cardio', 'legs', 'shoulders'],
        equipmentRequired: 'bodyweight',
        requiredEquipment: [],
        optionalEquipment: [],
        unlockLevel: 1,
        difficulty: 'beginner',
        baseReps: 20,
        baseSets: 3,
        repIncrement: 5,
        setIncrement: 1,
        keypoints: [5, 6, 11, 12, 15, 16, 23, 24],
        formThresholds: {},
        description: 'Classic cardio exercise that elevates heart rate and warms up the entire body.',
        instructions: [
            'Start standing with feet together, arms at sides',
            'Jump feet out wide while raising arms overhead',
            'Jump back to starting position',
            'Maintain steady rhythm and breathing'
        ],
        tips: [
            'Land softly on balls of feet',
            'Keep core engaged',
            'Breathe rhythmically'
        ],
        commonMistakes: ['Landing too hard', 'Not reaching full extension', 'Holding breath'],
        caloriesPerRep: 0.3,
        thumbnailUrl: 'https://images.fizi.ai/exercises/jumping-jacks-thumb.jpg',
        stages: [
            { name: 'closed', angleRanges: [{ joint: 'left_shoulder', min: -20, max: 60, optimal: 20 }] },
            { name: 'open', angleRanges: [{ joint: 'left_shoulder', min: 120, max: 200, optimal: 160 }] }
        ],
        formChecks: []
    },
    {
        id: 'burpees',
        name: 'burpees',
        displayName: 'Burpees',
        category: 'cardio',
        muscleGroups: ['fullbody', 'cardio'],
        equipmentRequired: 'bodyweight',
        requiredEquipment: [],
        optionalEquipment: ['yoga_mat'],
        unlockLevel: 2,
        difficulty: 'intermediate',
        baseReps: 10,
        baseSets: 3,
        repIncrement: 2,
        setIncrement: 1,
        keypoints: [5, 6, 11, 12, 13, 14, 23, 24, 25, 26],
        formThresholds: {},
        description: 'Full-body explosive movement combining squat, plank, push-up, and jump.',
        instructions: [
            'Start standing, then squat down and place hands on floor',
            'Jump feet back into plank position',
            'Perform a push-up (optional)',
            'Jump feet back to hands',
            'Explode up into a jump with arms overhead'
        ],
        tips: [
            'Move fluidly between positions',
            'Keep core tight in plank',
            'Land softly from jump'
        ],
        commonMistakes: ['Sagging hips in plank', 'Not jumping high enough', 'Poor landing mechanics'],
        caloriesPerRep: 1.2,
        thumbnailUrl: 'https://images.fizi.ai/exercises/burpees-thumb.jpg',
        stages: [
            { name: 'stand', angleRanges: [{ joint: 'left_knee', min: 160, max: 200, optimal: 180 }] },
            { name: 'plank', angleRanges: [{ joint: 'left_elbow', min: 160, max: 200, optimal: 170 }] }
        ],
        formChecks: []
    },
    {
        id: 'mountain-climbers',
        name: 'mountain_climbers',
        displayName: 'Mountain Climbers',
        category: 'cardio',
        muscleGroups: ['core', 'cardio', 'legs'],
        equipmentRequired: 'bodyweight',
        requiredEquipment: [],
        optionalEquipment: ['yoga_mat'],
        unlockLevel: 1,
        difficulty: 'beginner',
        baseReps: 20,
        baseSets: 3,
        repIncrement: 5,
        setIncrement: 1,
        keypoints: [11, 12, 13, 14, 23, 24, 25, 26],
        formThresholds: {},
        description: 'Dynamic plank variation with alternating knee drives for cardio and core.',
        instructions: [
            'Start in high plank position',
            'Drive right knee toward chest',
            'Quickly switch legs, bringing left knee forward',
            'Continue alternating at a quick pace'
        ],
        tips: [
            'Keep hips level',
            'Maintain plank position',
            'Breathe steadily despite pace'
        ],
        commonMistakes: ['Hips too high', 'Not bringing knee far enough', 'Losing plank form'],
        caloriesPerRep: 0.4,
        thumbnailUrl: 'https://images.fizi.ai/exercises/mountain-climbers-thumb.jpg',
        stages: [
            { name: 'neutral', angleRanges: [{ joint: 'left_knee', min: 160, max: 200, optimal: 170 }] },
            { name: 'active', angleRanges: [{ joint: 'left_knee', min: 30, max: 90, optimal: 60 }] }
        ],
        formChecks: []
    },
    {
        id: 'high-knees',
        name: 'high_knees',
        displayName: 'High Knees',
        category: 'cardio',
        muscleGroups: ['cardio', 'legs', 'core'],
        equipmentRequired: 'bodyweight',
        requiredEquipment: [],
        unlockLevel: 1,
        difficulty: 'beginner',
        baseReps: 30,
        baseSets: 3,
        repIncrement: 10,
        setIncrement: 1,
        keypoints: [11, 12, 23, 24, 25, 26],
        formThresholds: {},
        description: 'Running in place with exaggerated knee lift for cardio conditioning.',
        instructions: [
            'Stand with feet hip-width apart',
            'Lift right knee to hip level or higher',
            'Quickly switch to left knee',
            'Pump arms in running motion',
            'Maintain fast pace'
        ],
        tips: [
            'Stay on balls of feet',
            'Drive knees high',
            'Keep chest up and core tight'
        ],
        commonMistakes: ['Not lifting knees high enough', 'Leaning back', 'Landing on heels'],
        caloriesPerRep: 0.25,
        thumbnailUrl: 'https://images.fizi.ai/exercises/high-knees-thumb.jpg',
        stages: [
            { name: 'down', angleRanges: [{ joint: 'left_knee', min: 160, max: 200, optimal: 175 }] },
            { name: 'up', angleRanges: [{ joint: 'left_knee', min: 40, max: 90, optimal: 70 }] }
        ],
        formChecks: []
    },
    {
        id: 'jump-rope',
        name: 'jump_rope',
        displayName: 'Jump Rope',
        category: 'cardio',
        muscleGroups: ['cardio', 'legs'],
        equipmentRequired: 'home',
        requiredEquipment: [],
        optionalEquipment: [],
        unlockLevel: 1,
        difficulty: 'beginner',
        baseReps: 50,
        baseSets: 3,
        repIncrement: 20,
        setIncrement: 1,
        keypoints: [15, 16, 25, 26],
        formThresholds: {},
        description: 'Classic cardio exercise with or without actual jump rope.',
        instructions: [
            'Hold imaginary rope handles or actual rope',
            'Jump with both feet together',
            'Land softly on balls of feet',
            'Rotate wrists in small circles',
            'Maintain steady rhythm'
        ],
        tips: [
            'Keep jumps low',
            'Stay relaxed',
            'Breathe through nose'
        ],
        commonMistakes: ['Jumping too high', 'Landing on heels', 'Tense shoulders'],
        caloriesPerRep: 0.2,
        thumbnailUrl: 'https://images.fizi.ai/exercises/jump-rope-thumb.jpg',
        stages: [
            { name: 'airborne', angleRanges: [{ joint: 'left_knee', min: 140, max: 180, optimal: 160 }] },
            { name: 'landed', angleRanges: [{ joint: 'left_knee', min: 160, max: 200, optimal: 175 }] }
        ],
        formChecks: []
    },
    {
        id: 'running-in-place',
        name: 'running_in_place',
        displayName: 'Running in Place',
        category: 'cardio',
        muscleGroups: ['cardio', 'legs'],
        equipmentRequired: 'bodyweight',
        requiredEquipment: [],
        unlockLevel: 1,
        difficulty: 'beginner',
        baseReps: 60,
        baseSets: 2,
        repIncrement: 30,
        setIncrement: 1,
        keypoints: [11, 12, 23, 24, 25, 26],
        formThresholds: {},
        description: 'Simple cardio warm-up simulating running motion without moving forward.',
        instructions: [
            'Stand with good posture',
            'Begin jogging without moving forward',
            'Lift knees moderately',
            'Pump arms naturally',
            'Maintain steady pace'
        ],
        tips: [
            'Start slow and build speed',
            'Breathe rhythmically',
            'Keep movements controlled'
        ],
        commonMistakes: ['Too much vertical bounce', 'Tense upper body', 'Irregular pace'],
        caloriesPerRep: 0.15,
        thumbnailUrl: 'https://images.fizi.ai/exercises/running-thumb.jpg',
        stages: [
            { name: 'ground', angleRanges: [{ joint: 'left_knee', min: 160, max: 200, optimal: 175 }] },
            { name: 'lifted', angleRanges: [{ joint: 'left_knee', min: 80, max: 120, optimal: 100 }] }
        ],
        formChecks: []
    }
];

export default CARDIO_EXERCISES;
