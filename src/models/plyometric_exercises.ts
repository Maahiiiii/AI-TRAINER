import { Exercise } from '../types';

// =================================================================
// PLYOMETRIC EXERCISES (Explosive Power Training)
// =================================================================

export const PLYOMETRIC_EXERCISES: Exercise[] = [
    {
        id: 'jump-squats',
        name: 'jump_squat',
        displayName: 'Jump Squats',
        category: 'plyometric',
        muscleGroups: ['legs', 'cardio'],
        equipmentRequired: 'bodyweight',
        requiredEquipment: [],
        unlockLevel: 3,
        difficulty: 'intermediate',
        baseReps: 12,
        baseSets: 3,
        repIncrement: 3,
        setIncrement: 1,
        keypoints: [11, 12, 23, 24, 25, 26],
        formThresholds: { minAngle: 80, maxAngle: 100 },
        description: 'Explosive squat variation that builds power and elevates heart rate.',
        instructions: [
            'Start in squat position',
            'Explode upward, jumping as high as possible',
            'Land softly with bent knees',
            'Immediately descend into next squat',
            'Maintain controlled form throughout'
        ],
        tips: [
            'Land softly on balls of feet',
            'Use arms for momentum',
            'Keep chest up during landing'
        ],
        commonMistakes: ['Landing with locked knees', 'Not squatting deep enough', 'Poor landing mechanics'],
        caloriesPerRep: 0.8,
        thumbnailUrl: 'https://images.fizi.ai/exercises/jump-squats-thumb.jpg',
        stages: [
            { name: 'squat', angleRanges: [{ joint: 'left_knee', min: 60, max: 100, optimal: 80 }] },
            { name: 'jump', angleRanges: [{ joint: 'left_knee', min: 160, max: 200, optimal: 175 }] }
        ],
        formChecks: []
    },
    {
        id: 'box-jumps',
        name: 'box_jump',
        displayName: 'Box Jumps',
        category: 'plyometric',
        muscleGroups: ['legs', 'core'],
        equipmentRequired: 'gym',
        requiredEquipment: ['bench'],
        unlockLevel: 4,
        difficulty: 'intermediate',
        baseReps: 10,
        baseSets: 3,
        repIncrement: 2,
        setIncrement: 1,
        keypoints: [11, 12, 23, 24, 25, 26],
        formThresholds: {},
        description: 'Explosive jump onto elevated surface for power development.',
        instructions: [
            'Stand facing box or bench',
            'Bend knees and swing arms back',
            'Explosively jump onto box',
            'Land softly with bent knees',
            'Step down carefully'
        ],
        tips: [
            'Start with lower height',
            'Land with full foot on box',
            'Focus on soft landing'
        ],
        commonMistakes: ['Jumping too close to box', 'Landing with straight legs', 'Not using arms'],
        caloriesPerRep: 1.0,
        thumbnailUrl: 'https://images.fizi.ai/exercises/box-jumps-thumb.jpg',
        stages: [
            { name: 'ground', angleRanges: [{ joint: 'left_knee', min: 70, max: 110, optimal: 90 }] },
            { name: 'landed', angleRanges: [{ joint: 'left_knee', min: 80, max: 120, optimal: 100 }] }
        ],
        formChecks: []
    },
    {
        id: 'plyo-pushups',
        name: 'plyo_pushup',
        displayName: 'Plyometric Push-ups',
        category: 'plyometric',
        muscleGroups: ['chest', 'shoulders', 'arms'],
        equipmentRequired: 'bodyweight',
        requiredEquipment: [],
        optionalEquipment: ['yoga_mat'],
        unlockLevel: 5,
        difficulty: 'advanced',
        baseReps: 8,
        baseSets: 3,
        repIncrement: 2,
        setIncrement: 1,
        keypoints: [5, 6, 7, 8, 11, 12, 13, 14, 15, 16],
        formThresholds: { minAngle: 70, maxAngle: 90 },
        description: 'Explosive push-up where hands leave the ground, building upper body power.',
        instructions: [
            'Start in push-up position',
            'Lower down as in regular push-up',
            'Explosively push up so hands leave ground',
            'Land softly with bent elbows',
            'Immediately lower into next rep'
        ],
        tips: [
            'Master regular push-ups first',
            'Land with control',
            'Keep core tight throughout'
        ],
        commonMistakes: ['Not pushing hard enough', 'Landing with straight arms', 'Losing core tension'],
        caloriesPerRep: 0.7,
        thumbnailUrl: 'https://images.fizi.ai/exercises/plyo-pushups-thumb.jpg',
        stages: [
            { name: 'down', angleRanges: [{ joint: 'left_elbow', min: 60, max: 90, optimal: 75 }] },
            { name: 'explosive', angleRanges: [{ joint: 'left_elbow', min: 160, max: 200, optimal: 170 }] }
        ],
        formChecks: []
    },
    {
        id: 'tuck-jumps',
        name: 'tuck_jump',
        displayName: 'Tuck Jumps',
        category: 'plyometric',
        muscleGroups: ['legs', 'core', 'cardio'],
        equipmentRequired: 'bodyweight',
        requiredEquipment: [],
        unlockLevel: 4,
        difficulty: 'advanced',
        baseReps: 10,
        baseSets: 3,
        repIncrement: 2,
        setIncrement: 1,
        keypoints: [11, 12, 23, 24, 25, 26],
        formThresholds: {},
        description: 'High-intensity jump bringing knees toward chest for explosive power.',
        instructions: [
            'Stand with feet hip-width apart',
            'Jump vertically as high as possible',
            'Pull knees up toward chest mid-air',
            'Land softly with bent knees',
            'Reset and repeat'
        ],
        tips: [
            'Jump high, not forward',
            'Pull knees up quickly',
            'Land with control'
        ],
        commonMistakes: ['Not jumping high enough', 'Landing too stiffly', 'Leaning forward'],
        caloriesPerRep: 1.1,
        thumbnailUrl: 'https://images.fizi.ai/exercises/tuck-jumps-thumb.jpg',
        stages: [
            { name: 'ground', angleRanges: [{ joint: 'left_knee', min: 140, max: 200, optimal: 170 }] },
            { name: 'tucked', angleRanges: [{ joint: 'left_knee', min: 30, max: 70, optimal: 50 }] }
        ],
        formChecks: []
    },
    {
        id: 'lateral-bounds',
        name: 'lateral_bound',
        displayName: 'Lateral Bounds',
        category: 'plyometric',
        muscleGroups: ['legs', 'core'],
        equipmentRequired: 'bodyweight',
        requiredEquipment: [],
        unlockLevel: 3,
        difficulty: 'intermediate',
        baseReps: 12,
        baseSets: 3,
        repIncrement: 3,
        setIncrement: 1,
        keypoints: [11, 12, 23, 24, 25, 26],
        formThresholds: {},
        description: 'Side-to-side explosive jumps for lateral power and agility.',
        instructions: [
            'Stand on one leg',
            'Push off explosively to the side',
            'Land on opposite leg',
            'Stabilize, then bound back',
            'Continue alternating sides'
        ],
        tips: [
            'Land with control',
            'Keep chest up',
            'Use arms for balance'
        ],
        commonMistakes: ['Not pushing off hard enough', 'Poor landing balance', 'Too short of bounds'],
        caloriesPerRep: 0.6,
        thumbnailUrl: 'https://images.fizi.ai/exercises/lateral-bounds-thumb.jpg',
        stages: [
            { name: 'left', angleRanges: [{ joint: 'left_knee', min: 80, max: 120, optimal: 100 }] },
            { name: 'right', angleRanges: [{ joint: 'right_knee', min: 80, max: 120, optimal: 100 }] }
        ],
        formChecks: []
    }
];

export default PLYOMETRIC_EXERCISES;
