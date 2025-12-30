
import { PlanGeneratorService } from './src/services/PlanGeneratorService';
import { UserProfile } from './src/types';

const mockProfileBase: UserProfile = {
    uid: 'test-user',
    email: 'test@example.com',
    displayName: 'Test User',
    age: 25,
    weight: 70,
    height: 175,
    fitnessGoal: 'muscle_gain',
    workoutExperience: 'beginner',
    fitnessProfile: {
        equipmentAccess: 'home',
        availableEquipment: ['dumbbells', 'resistance_bands'],
        experienceLevel: 'beginner',
        fitnessGoals: ['muscle_gain'],
        healthIssues: [],
        availableDays: 3
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
    },
    level: 1,
    xp: 0,
    totalWorkouts: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
    transformationPhotos: []
};

function calculateInitialLevel(profile: UserProfile): number {
    if (profile.progressSystem?.currentLevel) {
        return profile.progressSystem.currentLevel;
    }
    let baseLevel = 1;
    const experience = profile.fitnessProfile?.experienceLevel || profile.workoutExperience || 'beginner';
    switch (experience) {
        case 'beginner': baseLevel = 1; break;
        case 'intermediate': baseLevel = 3; break;
        case 'advanced': baseLevel = 5; break;
    }
    return baseLevel;
}

async function testGeneration() {
    try {
        console.log('--- TEST 1: Home Equipment / Beginner ---');
        const profile1: UserProfile = {
            ...mockProfileBase,
            fitnessProfile: {
                ...mockProfileBase.fitnessProfile,
                equipmentAccess: 'home',
                availableEquipment: ['dumbbells']
            }
        };
        const plan1 = PlanGeneratorService.generatePlan(profile1.uid, profile1);
        console.log(`Plan Name: ${plan1.name}`);
        console.log(`Plan Level: ${plan1.levelRequirement}`);

        if (plan1.sessions && plan1.sessions.length > 0) {
            const workoutSession = plan1.sessions.find(s => s.type !== 'rest');
            if (workoutSession && workoutSession.exercises && workoutSession.exercises.length > 0) {
                console.log(`First Exercise: ${workoutSession.exercises[0].name}`);
            } else {
                console.log('No exercises found in first workout session');
            }
        } else {
            console.log('No sessions generated');
        }

        console.log('\n--- TEST 2: Gym / Advanced ---');
        const profile2: UserProfile = {
            ...mockProfileBase,
            fitnessProfile: {
                ...mockProfileBase.fitnessProfile,
                equipmentAccess: 'gym',
                availableEquipment: ['barbell', 'squat_rack', 'bench', 'dumbbells', 'cable_machine', 'leg_press_machine'],
                experienceLevel: 'advanced'
            },
            workoutExperience: 'advanced',
            progressSystem: {
                ...mockProfileBase.progressSystem,
                currentLevel: 5
            }
        };

        const level2 = calculateInitialLevel(profile2);
        const plan2 = PlanGeneratorService.generatePlan(profile2.uid, profile2);
        console.log(`Calculated Level: ${level2}`);
        console.log(`Plan Name: ${plan2.name}`);

        if (plan2.sessions && plan2.sessions.length > 0) {
            const workoutSession = plan2.sessions.find(s => s.type !== 'rest');
            if (workoutSession && workoutSession.exercises && workoutSession.exercises.length > 0) {
                console.log(`First Exercise: ${workoutSession.exercises[0].name}`);
            }
        }

        console.log('\n--- TEST 3: Bodyweight Only ---');
        const profile3: UserProfile = {
            ...mockProfileBase,
            fitnessProfile: {
                ...mockProfileBase.fitnessProfile,
                equipmentAccess: 'bodyweight',
                availableEquipment: []
            }
        };
        const plan3 = PlanGeneratorService.generatePlan(profile3.uid, profile3);
        console.log(`Plan Name: ${plan3.name}`);

        if (plan3.sessions && plan3.sessions.length > 0) {
            const workoutSession = plan3.sessions.find(s => s.type !== 'rest');
            if (workoutSession && workoutSession.exercises && workoutSession.exercises.length > 0) {
                console.log(`First Exercise: ${workoutSession.exercises[0].name}`);
            }
        }
    } catch (error) {
        console.error('CRITICAL ERROR DURING TEST:');
        console.error(error);
    }
}

testGeneration();
