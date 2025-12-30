import { UserProfile, PlannedExercise, Exercise } from '../types';
import { exercises } from '../models/exercises';

export const PROGRESSION_CONFIG = {
    BASE_XP_PER_REP: 15, // Increased from 10
    FORM_SCORE_MULTIPLIER: 0.15, // Increased form bonus importance
    XP_SCALE_EXPONENT: 1.6, // Slightly steeper curve for long-term engagement
    BASE_LEVEL_UP_XP: 800, // Reduced base for quicker early wins
    VOLUME_SCALE_FACTOR: 0.05, // 5% increase per level (kept same)
    INTENSITY_SCALE_FACTOR: 0.02, // 2% intensity increase per level (kept same)
    REST_REDUCTION_FACTOR: 1.5, // 1.5 second reduction per level (min 30s)
};

export class ProgressionService {
    /**
     * Calculate XP earned for an exercise session
     */
    static calculateXPEarned(reps: number, averageFormScore: number, difficultyMultiplier: number = 1): number {
        const baseXP = reps * PROGRESSION_CONFIG.BASE_XP_PER_REP * difficultyMultiplier;
        const formBonus = (averageFormScore / 100) * baseXP;
        return Math.round(baseXP + formBonus);
    }

    /**
     * Calculate total XP required to reach a specific level
     */
    static getRequiredXPForLevel(level: number): number {
        if (level <= 1) return 0;
        return Math.round(PROGRESSION_CONFIG.BASE_LEVEL_UP_XP * Math.pow(level - 1, PROGRESSION_CONFIG.XP_SCALE_EXPONENT));
    }

    /**
     * Determine current level based on total XP
     */
    static calculateLevelFromXP(totalXP: number): number {
        let level = 1;
        while (this.getXPThresholdForLevel(level + 1) <= totalXP) {
            level++;
        }
        return level;
    }

    /**
     * Get XP threshold (cumulative XP needed to reach a level)
     */
    static getXPThresholdForLevel(level: number): number {
        let totalXP = 0;
        for (let i = 1; i < level; i++) {
            totalXP += Math.round(PROGRESSION_CONFIG.BASE_LEVEL_UP_XP * Math.pow(i, PROGRESSION_CONFIG.XP_SCALE_EXPONENT));
        }
        return totalXP;
    }

    /**
     * Process completed exercises and update user profile
     */
    static updateProgress(profile: UserProfile, xpEarned: number): UserProfile {
        const newXP = profile.progressSystem.currentXP + xpEarned;
        const newLevel = this.calculateLevelFromXP(newXP);
        const nextLevelThreshold = this.getXPThresholdForLevel(newLevel + 1);

        return {
            ...profile,
            progressSystem: {
                ...profile.progressSystem,
                currentXP: newXP,
                currentLevel: newLevel,
                xpToNextLevel: nextLevelThreshold - newXP,
                totalWorkoutsCompleted: profile.progressSystem.totalWorkoutsCompleted + 1
            },
            // Update legacy fields
            xp: newXP,
            level: newLevel,
            totalWorkouts: profile.totalWorkouts + 1
        };
    }

    /**
     * Scale exercise volume (sets/reps) based on user level
     */
    static scaleExerciseForLevel(exercise: PlannedExercise, level: number): PlannedExercise {
        const levelBonus = (level - 1) * PROGRESSION_CONFIG.VOLUME_SCALE_FACTOR;

        // Scale reps
        let scaledReps = exercise.reps;
        if (typeof exercise.reps === 'string' && exercise.reps.includes('-')) {
            const [min, max] = exercise.reps.split('-').map(Number);
            const newMin = Math.round(min * (1 + levelBonus));
            const newMax = Math.round(max * (1 + levelBonus));
            scaledReps = `${newMin}-${newMax}`;
        } else if (!isNaN(Number(exercise.reps))) {
            scaledReps = Math.round(Number(exercise.reps) * (1 + levelBonus));
        }

        // Scale rest period (reduce as user gets fitter)
        const restReduction = (level - 1) * PROGRESSION_CONFIG.REST_REDUCTION_FACTOR;
        const newRest = Math.max(30, Number(exercise.rest) - restReduction);

        return {
            ...exercise,
            reps: scaledReps,
            rest: newRest,
        };
    }

    /**
     * Get difficulty tier based on level
     */
    static getDifficultyTier(level: number): 'beginner' | 'intermediate' | 'advanced' {
        if (level <= 5) return 'beginner';
        if (level <= 15) return 'intermediate';
        return 'advanced';
    }

    /**
     * Get exercises that are unlocked at a specific level
     */
    static getExercisesUnlockedAtLevel(level: number): Exercise[] {
        return exercises.filter(ex => ex.unlockLevel === level);
    }

    /**
     * Get all exercises unlocked up to a specific level
     */
    static getAllUnlockedExercises(level: number): Exercise[] {
        return exercises.filter(ex => ex.unlockLevel <= level);
    }
}
