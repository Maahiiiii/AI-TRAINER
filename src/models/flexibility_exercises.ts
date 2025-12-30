import { Exercise } from '../types';

// =================================================================
// FLEXIBILITY & STRETCHING EXERCISES
// =================================================================

export const FLEXIBILITY_EXERCISES: Exercise[] = [
    {
        id: 'forward-fold',
        name: 'forward_fold',
        displayName: 'Standing Forward Fold',
        category: 'flexibility',
        muscleGroups: ['back', 'legs'],
        equipmentRequired: 'bodyweight',
        requiredEquipment: [],
        optionalEquipment: ['yoga_mat'],
        unlockLevel: 1,
        difficulty: 'beginner',
        baseReps: 30,
        baseSets: 2,
        repIncrement: 10,
        setIncrement: 1,
        keypoints: [11, 12, 23, 24, 25, 26],
        formThresholds: {},
        description: 'Hamstring and lower back stretch for flexibility and recovery.',
        instructions: [
            'Stand with feet hip-width apart',
            'Hinge at hips, folding forward',
            'Let arms hang or grab opposite elbows',
            'Keep knees soft, not locked',
            'Hold and breathe deeply'
        ],
        tips: [
            'Focus on lengthening spine',
            'Don\'t force the stretch',
            'Breathe into tight areas'
        ],
        commonMistakes: ['Locking knees', 'Rounding back too much', 'Holding breath'],
        caloriesPerRep: 0.05,
        thumbnailUrl: 'https://images.fizi.ai/exercises/forward-fold-thumb.jpg',
        stages: [
            { name: 'hold', angleRanges: [{ joint: 'left_hip', min: 30, max: 90, optimal: 60 }], duration: 30 }
        ],
        formChecks: []
    },
    {
        id: 'cat-cow',
        name: 'cat_cow',
        displayName: 'Cat-Cow Stretch',
        category: 'flexibility',
        muscleGroups: ['back', 'core'],
        equipmentRequired: 'bodyweight',
        requiredEquipment: [],
        optionalEquipment: ['yoga_mat'],
        unlockLevel: 1,
        difficulty: 'beginner',
        baseReps: 10,
        baseSets: 2,
        repIncrement: 3,
        setIncrement: 1,
        keypoints: [11, 12, 5, 6, 23, 24],
        formThresholds: {},
        description: 'Spinal mobility exercise alternating between flexion and extension.',
        instructions: [
            'Start on hands and knees in tabletop position',
            'Arch back, lifting head and tailbone (Cow)',
            'Round spine, tucking chin and tailbone (Cat)',
            'Flow smoothly between positions',
            'Synchronize with breath'
        ],
        tips: [
            'Move slowly and mindfully',
            'Inhale on Cow, exhale on Cat',
            'Keep shoulders relaxed'
        ],
        commonMistakes: ['Moving too fast', 'Not engaging core', 'Holding positions too long'],
        caloriesPerRep: 0.1,
        thumbnailUrl: 'https://images.fizi.ai/exercises/cat-cow-thumb.jpg',
        stages: [
            { name: 'cat', angleRanges: [{ joint: 'torso', min: 80, max: 120, optimal: 100 }] },
            { name: 'cow', angleRanges: [{ joint: 'torso', min: 140, max: 180, optimal: 160 }] }
        ],
        formChecks: []
    },
    {
        id: 'childs-pose',
        name: 'childs_pose',
        displayName: 'Child\'s Pose',
        category: 'flexibility',
        muscleGroups: ['back', 'shoulders'],
        equipmentRequired: 'bodyweight',
        requiredEquipment: [],
        optionalEquipment: ['yoga_mat'],
        unlockLevel: 1,
        difficulty: 'beginner',
        baseReps: 45,
        baseSets: 2,
        repIncrement: 15,
        setIncrement: 1,
        keypoints: [11, 12, 23, 24, 5, 6],
        formThresholds: {},
        description: 'Relaxing rest pose that stretches back, hips, and shoulders.',
        instructions: [
            'Kneel on floor with big toes touching',
            'Sit back on heels',
            'Fold forward, extending arms in front',
            'Rest forehead on floor',
            'Breathe deeply and relax'
        ],
        tips: [
            'Widen knees if needed for comfort',
            'Let shoulders soften',
            'Focus on deep breathing'
        ],
        commonMistakes: ['Tensing shoulders', 'Forcing hips down', 'Shallow breathing'],
        caloriesPerRep: 0.03,
        thumbnailUrl: 'https://images.fizi.ai/exercises/childs-pose-thumb.jpg',
        stages: [
            { name: 'hold', angleRanges: [{ joint: 'left_hip', min: 30, max: 70, optimal: 50 }], duration: 45 }
        ],
        formChecks: []
    },
    {
        id: 'downward-dog',
        name: 'downward_dog',
        displayName: 'Downward Facing Dog',
        category: 'flexibility',
        muscleGroups: ['back', 'legs', 'shoulders'],
        equipmentRequired: 'bodyweight',
        requiredEquipment: [],
        optionalEquipment: ['yoga_mat'],
        unlockLevel: 2,
        difficulty: 'beginner',
        baseReps: 30,
        baseSets: 2,
        repIncrement: 10,
        setIncrement: 1,
        keypoints: [5, 6, 11, 12, 15, 16, 23, 24, 25, 26],
        formThresholds: {},
        description: 'All-over stretch and strengthening pose from yoga.',
        instructions: [
            'Start on hands and knees',
            'Tuck toes and lift hips up and back',
            'Create inverted V shape with body',
            'Press hands into floor, heels toward ground',
            'Hold and breathe'
        ],
        tips: [
            'Keep slight bend in knees if needed',
            'Lengthen spine',
            'Relax neck and shoulders'
        ],
        commonMistakes: ['Rounding back', 'Locking elbows', 'Tensing shoulders'],
        caloriesPerRep: 0.15,
        thumbnailUrl: 'https://images.fizi.ai/exercises/downward-dog-thumb.jpg',
        stages: [
            { name: 'hold', angleRanges: [{ joint: 'left_hip', min: 60, max: 100, optimal: 80 }], duration: 30 }
        ],
        formChecks: []
    },
    {
        id: 'quad-stretch',
        name: 'quad_stretch',
        displayName: 'Standing Quad Stretch',
        category: 'flexibility',
        muscleGroups: ['legs'],
        equipmentRequired: 'bodyweight',
        requiredEquipment: [],
        unlockLevel: 1,
        difficulty: 'beginner',
        baseReps: 30,
        baseSets: 2,
        repIncrement: 10,
        setIncrement: 1,
        keypoints: [23, 24, 25, 26],
        formThresholds: {},
        description: 'Quadriceps stretch performed standing for better flexibility.',
        instructions: [
            'Stand on one leg',
            'Bend other knee, bringing heel toward glute',
            'Grab ankle or foot with hand',
            'Keep knees together',
            'Hold for duration, then switch sides'
        ],
        tips: [
            'Keep standing knee soft',
            'Pull heel gently toward glute',
            'Hold onto wall if needed for balance'
        ],
        commonMistakes: ['Arching lower back', 'Letting knee flare out', 'Pulling too hard'],
        caloriesPerRep: 0.04,
        thumbnailUrl: 'https://images.fizi.ai/exercises/quad-stretch-thumb.jpg',
        stages: [
            { name: 'hold', angleRanges: [{ joint: 'left_knee', min: 30, max: 70, optimal: 50 }], duration: 30 }
        ],
        formChecks: []
    },
    {
        id: 'shoulder-stretch',
        name: 'shoulder_stretch',
        displayName: 'Cross-Body Shoulder Stretch',
        category: 'flexibility',
        muscleGroups: ['shoulders', 'back'],
        equipmentRequired: 'bodyweight',
        requiredEquipment: [],
        unlockLevel: 1,
        difficulty: 'beginner',
        baseReps: 30,
        baseSets: 2,
        repIncrement: 10,
        setIncrement: 1,
        keypoints: [5, 6, 11, 12, 13, 14],
        formThresholds: {},
        description: 'Shoulder and upper back stretch for improved mobility.',
        instructions: [
            'Stand or sit with good posture',
            'Bring one arm across body at chest height',
            'Use other arm to gently pull it closer',
            'Keep shoulders relaxed',
            'Hold, then switch sides'
        ],
        tips: [
            'Don\'t rotate torso',
            'Keep arm straight',
            'Breathe deeply'
        ],
        commonMistakes: ['Hunching shoulders', 'Rotating body', 'Pulling too hard'],
        caloriesPerRep: 0.03,
        thumbnailUrl: 'https://images.fizi.ai/exercises/shoulder-stretch-thumb.jpg',
        stages: [
            { name: 'hold', angleRanges: [{ joint: 'left_shoulder', min: 60, max: 120, optimal: 90 }], duration: 30 }
        ],
        formChecks: []
    }
];

export default FLEXIBILITY_EXERCISES;
