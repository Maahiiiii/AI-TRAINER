import { Exercise } from '../types';

// =================================================================
// RECOVERY & ACTIVE RECOVERY EXERCISES
// =================================================================

export const RECOVERY_EXERCISES: Exercise[] = [
    {
        id: 'walking',
        name: 'walking',
        displayName: 'Light Walking',
        category: 'cardio',
        muscleGroups: ['cardio', 'legs'],
        equipmentRequired: 'bodyweight',
        requiredEquipment: [],
        unlockLevel: 1,
        difficulty: 'beginner',
        baseReps: 300, // steps or seconds
        baseSets: 1,
        repIncrement: 0,
        setIncrement: 0,
        keypoints: [23, 24, 25, 26],
        formThresholds: {},
        description: 'Gentle walking for active recovery and blood flow.',
        instructions: [
            'Walk at a comfortable, easy pace',
            'Focus on breathing and relaxation',
            'Maintain good posture',
            'Duration: 10-20 minutes'
        ],
        tips: [
            'Keep intensity very low',
            'Should feel easy and refreshing',
            'Great for mental recovery too'
        ],
        commonMistakes: ['Walking too fast', 'Not relaxing', 'Skipping this entirely'],
        caloriesPerRep: 0.05,
        thumbnailUrl: 'https://images.fizi.ai/exercises/walking-thumb.jpg',
        stages: [],
        formChecks: []
    },
    {
        id: 'gentle-yoga-flow',
        name: 'yoga_flow',
        displayName: 'Gentle Yoga Flow',
        category: 'flexibility',
        muscleGroups: ['fullbody'],
        equipmentRequired: 'bodyweight',
        requiredEquipment: [],
        optionalEquipment: ['yoga_mat'],
        unlockLevel: 1,
        difficulty: 'beginner',
        baseReps: 8,
        baseSets: 2,
        repIncrement: 2,
        setIncrement: 0,
        keypoints: [5, 6, 11, 12, 23, 24],
        formThresholds: {},
        description: 'Flowing sequence of gentle yoga poses for active recovery.',
        instructions: [
            'Move slowly through poses',
            'Hold each pose for 3-5 breaths',
            'Focus on breathing and relaxation',
            'Sequence: Cat-Cow, Child\'s Pose, Downward Dog, Forward Fold'
        ],
        tips: [
            'Never force or strain',
            'Focus on breath and relaxation',
            'Modify as needed for comfort'
        ],
        commonMistakes: ['Rushing through poses', 'Holding breath', 'Pushing too hard'],
        caloriesPerRep: 0.2,
        thumbnailUrl: 'https://images.fizi.ai/exercises/yoga-flow-thumb.jpg',
        stages: [],
        formChecks: []
    },
    {
        id: 'foam-rolling',
        name: 'foam_rolling',
        displayName: 'Foam Rolling Session',
        category: 'flexibility',
        muscleGroups: ['fullbody'],
        equipmentRequired: 'home',
        requiredEquipment: [],
        optionalEquipment: [],
        unlockLevel: 1,
        difficulty: 'beginner',
        baseReps: 10, // minutes
        baseSets: 1,
        repIncrement: 5,
        setIncrement: 0,
        keypoints: [],
        formThresholds: {},
        description: 'Self-myofascial release to reduce muscle tension and improve recovery.',
        instructions: [
            'Roll each major muscle group slowly',
            'Spend 30-60 seconds per area',
            'Focus on: quads, hamstrings, calves, back, glutes',
            'Breathe deeply and relax',
            'Pause on tender spots'
        ],
        tips: [
            'Don\'t roll over joints or bones',
            'Keep pressure tolerable',
            'Roll before and after workouts'
        ],
        commonMistakes: ['Rolling too fast', 'Rolling over bones', 'Holding breath'],
        caloriesPerRep: 0.1,
        thumbnailUrl: 'https://images.fizi.ai/exercises/foam-rolling-thumb.jpg',
        stages: [],
        formChecks: []
    },
    {
        id: 'deep-breathing',
        name: 'deep_breathing',
        displayName: 'Deep Breathing Exercise',
        category: 'flexibility',
        muscleGroups: ['core'],
        equipmentRequired: 'bodyweight',
        requiredEquipment: [],
        unlockLevel: 1,
        difficulty: 'beginner',
        baseReps: 10,
        baseSets: 2,
        repIncrement: 5,
        setIncrement: 1,
        keypoints: [],
        formThresholds: {},
        description: 'Diaphragmatic breathing for stress relief and recovery.',
        instructions: [
            'Sit or lie in comfortable position',
            'Breathe in deeply through nose (4 counts)',
            'Hold breath briefly (2 counts)',
            'Exhale slowly through mouth (6 counts)',
            'Repeat for 5-10 minutes'
        ],
        tips: [
            'Focus on belly expanding',
            'Keep shoulders relaxed',
            'Close eyes for better focus'
        ],
        commonMistakes: ['Shallow breathing', 'Raising shoulders', 'Rushing breaths'],
        caloriesPerRep: 0.02,
        thumbnailUrl: 'https://images.fizi.ai/exercises/breathing-thumb.jpg',
        stages: [],
        formChecks: []
    },
    {
        id: 'light-stretching-circuit',
        name: 'stretching_circuit',
        displayName: 'Light Stretching Circuit',
        category: 'flexibility',
        muscleGroups: ['fullbody'],
        equipmentRequired: 'bodyweight',
        requiredEquipment: [],
        optionalEquipment: ['yoga_mat'],
        unlockLevel: 1,
        difficulty: 'beginner',
        baseReps: 6,
        baseSets: 2,
        repIncrement: 2,
        setIncrement: 0,
        keypoints: [5, 6, 11, 12, 23, 24, 25, 26],
        formThresholds: {},
        description: 'Full-body stretching circuit for recovery and mobility.',
        instructions: [
            'Perform each stretch for 30 seconds',
            'Never bounce or force',
            'Breathe deeply throughout',
            'Include: neck, shoulders, back, hips, legs',
            'Focus on areas worked recently'
        ],
        tips: [
            'Warm up slightly before stretching',
            'Hold stretches steady',
            'Focus on tight areas'
        ],
        commonMistakes: ['Bouncing', 'Not breathing', 'Forcing stretches'],
        caloriesPerRep: 0.15,
        thumbnailUrl: 'https://images.fizi.ai/exercises/stretching-circuit-thumb.jpg',
        stages: [],
        formChecks: []
    },
    {
        id: 'easy-cycling',
        name: 'easy_cycling',
        displayName: 'Easy Cycling',
        category: 'cardio',
        muscleGroups: ['legs', 'cardio'],
        equipmentRequired: 'home',
        requiredEquipment: [],
        unlockLevel: 1,
        difficulty: 'beginner',
        baseReps: 600, // seconds (10 minutes)
        baseSets: 1,
        repIncrement: 300,
        setIncrement: 0,
        keypoints: [23, 24, 25, 26],
        formThresholds: {},
        description: 'Low-intensity cycling for active recovery.',
        instructions: [
            'Cycle at very easy pace',
            'Keep heart rate low (60-70% max)',
            'Focus on smooth, easy pedaling',
            'Duration: 10-20 minutes',
            'Can be stationary or outdoor bike'
        ],
        tips: [
            'Should feel refreshing, not tiring',
            'Keep resistance low',
            'Breathe easily throughout'
        ],
        commonMistakes: ['Going too hard', 'High resistance', 'Not hydrating'],
        caloriesPerRep: 0.08,
        thumbnailUrl: 'https://images.fizi.ai/exercises/cycling-thumb.jpg',
        stages: [],
        formChecks: []
    }
];

export default RECOVERY_EXERCISES;
