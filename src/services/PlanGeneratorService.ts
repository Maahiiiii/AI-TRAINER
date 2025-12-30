import {
    UserProfile,
    WorkoutPlan,
    WorkoutSession,
    PlannedExercise,
    Exercise,
    PlanMetrics,
    MuscleGroup
} from '../types';
import { exercises, getExercisesByCategory } from '../models/exercises';
import RECOVERY_EXERCISES from '../models/recovery_exercises';
import RecoveryService from './RecoveryService';

type SessionFocus = 'upper' | 'lower' | 'fullbody' | 'cardio' | 'recovery';

export class PlanGeneratorService {
    /**
     * Generates a personalized workout plan based on the user's profile
     */
    static generatePlan(userId: string, profile: UserProfile): WorkoutPlan {
        // Robustness: Ensure profile has necessary nested objects
        const safeProfile: UserProfile = {
            ...profile,
            progressSystem: profile.progressSystem || {
                currentLevel: profile.level || 1,
                currentXP: profile.xp || 0,
                levelProgress: ((profile.xp || 0) % 1000) / 10,
                totalWorkouts: profile.totalWorkouts || 0,
                achievements: []
            },
            fitnessProfile: profile.fitnessProfile || {
                equipmentAccess: 'bodyweight',
                availableEquipment: [],
                experienceLevel: 'beginner',
                fitnessGoals: ['Weight Loss'],
                healthIssues: [],
                availableDays: 6
            }
        };

        // Enforce 6 days for beginners to ensure the new split is applied
        if (safeProfile.fitnessProfile.experienceLevel === 'beginner') {
            safeProfile.fitnessProfile.availableDays = 6;
        }

        const availableExercises = this.filterExercises(safeProfile);
        const sessions = this.createSessions(safeProfile, availableExercises);
        const metrics = this.calculateMetrics(sessions, safeProfile);

        return {
            id: `plan_${Date.now()}`,
            userId,
            name: `${profile.fitnessProfile.fitnessGoals[0] || 'Fitness'} Plan`,
            description: `A customized ${profile.fitnessProfile.experienceLevel} plan focusing on ${profile.fitnessProfile.fitnessGoals.join(', ')}.`,
            sessions,
            metrics,
            difficulty: profile.fitnessProfile.experienceLevel,
            frequency: profile.fitnessProfile.availableDays,
            duration: 4, // 4 weeks
            startDate: new Date(),
            endDate: new Date(Date.now() + 28 * 24 * 60 * 60 * 1000), // 4 weeks
            status: 'active',
            isActive: true,
            levelRequirement: profile.progressSystem.currentLevel
        };
    }

    /**
     * Filters exercises based on user's equipment and level
     */
    private static filterExercises(profile: UserProfile): Exercise[] {
        const { equipmentAccess } = profile.fitnessProfile;
        const availableEquipment = profile.fitnessProfile.availableEquipment || [];
        const { currentLevel } = profile.progressSystem;

        const filtered = exercises.filter(ex => {
            // 1. Level check
            const isUnlocked = ex.unlockLevel <= currentLevel;
            if (!isUnlocked) return false;

            // 2. Granular Equipment check
            if (equipmentAccess === 'gym') return true;

            const hasRequiredItems = ex.requiredEquipment.length === 0 ||
                ex.requiredEquipment.every(req => availableEquipment.includes(req));

            if (!hasRequiredItems) return false;

            // 3. High-level category fallback
            return this.checkEquipmentMatch(equipmentAccess, ex.equipmentRequired);
        });

        // Safety Fallback: If no exercises found (e.g. data mismatch), 
        // return at least basic bodyweight exercises
        if (filtered.length === 0) {
            console.warn('[PlanGenerator] No exercises matched filters. Using bodyweight fallback.');
            return exercises.filter(ex => ex.equipmentRequired === 'bodyweight' && ex.unlockLevel <= currentLevel);
        }

        return filtered;
    }

    private static checkEquipmentMatch(userAccess: 'bodyweight' | 'home' | 'gym', exerciseReq: 'bodyweight' | 'home' | 'gym'): boolean {
        if (userAccess === 'gym') return true; // Gym access includes everything
        if (userAccess === 'home') return exerciseReq !== 'gym'; // Home access includes bodyweight and home
        return exerciseReq === 'bodyweight'; // Bodyweight only
    }

    /**
     * Creates sessions based on available days and goals with intelligent periodization
     */
    private static createSessions(profile: UserProfile, availableExercises: Exercise[]): WorkoutSession[] {
        const sessions: WorkoutSession[] = [];
        const { availableDays } = profile.fitnessProfile;

        // Determine session split pattern based on frequency
        const splitPattern = this.determineSplitPattern(availableDays, profile.fitnessProfile.experienceLevel);
        let patternIndex = 0;

        // Simple 28-day schedule based on frequency
        for (let i = 0; i < 28; i++) {
            const dayOfWeek = i % 7;
            const weekNumber = Math.floor(i / 7);
            const isDeloadWeek = weekNumber === 3; // Week 4 is deload

            // Distribute workouts across the week
            const isWorkoutDay = this.isWorkoutDay(dayOfWeek, availableDays);

            if (isWorkoutDay) {
                const focus = splitPattern[patternIndex % splitPattern.length];
                const sessionType = this.getSessionType(focus);

                sessions.push({
                    id: `session_${i}`,
                    day: i + 1,
                    dayOfWeek: i % 7,
                    title: this.getSessionTitle(focus, i + 1),
                    focus: this.getFocusDescription(focus),
                    exercises: this.selectExercisesForSession(
                        profile,
                        availableExercises,
                        focus,
                        isDeloadWeek
                    ),
                    status: 'scheduled',
                    type: sessionType,
                    duration: this.estimateSessionDuration(focus, isDeloadWeek),
                    isRestDay: false,
                    intensity: isDeloadWeek ? 'low' : this.getIntensity(profile.fitnessProfile.experienceLevel),
                    warmup: this.getWarmupRecommendation(focus),
                    cooldown: this.getCooldownRecommendation(focus)
                });

                patternIndex++;
            } else {
                // Determine if should be active recovery or complete rest
                const consecutiveWorkoutDays = this.getConsecutiveWorkoutDays(sessions, i);
                const isActiveRecovery = consecutiveWorkoutDays >= 3 || (i > 0 && sessions[i - 1]?.intensity === 'high');

                if (isActiveRecovery) {
                    // Active Recovery Session
                    const restGuidance = RecoveryService.getRestDayGuidance(profile.weight || 70);

                    sessions.push({
                        id: `recovery_${i}`,
                        day: i + 1,
                        dayOfWeek: i % 7,
                        title: 'Active Recovery',
                        focus: 'Active Recovery & Mobility',
                        exercises: this.selectActiveRecoveryExercises(profile),
                        status: 'scheduled',
                        type: 'flexibility',
                        duration: 25,
                        isRestDay: false,
                        intensity: 'low',
                        warmup: 'Light movement and breathing',
                        cooldown: 'Deep breathing and relaxation',
                        notes: `Active recovery helps blood flow and speeds up recovery.\n\n**Benefits:**\n- Reduces muscle soreness\n- Improves mobility\n- Promotes mental relaxation\n\n**Today's Focus:**\n${restGuidance.recoveryActivities.slice(0, 3).map(a => `• ${a}`).join('\n')}`
                    });
                } else {
                    // Complete Rest Day
                    const restGuidance = RecoveryService.getRestDayGuidance(profile.weight || 70);

                    sessions.push({
                        id: `rest_${i}`,
                        day: i + 1,
                        dayOfWeek: i % 7,
                        title: 'Complete Rest & Recovery',
                        focus: 'Rest & Recovery',
                        exercises: [],
                        status: 'completed',
                        type: 'rest',
                        duration: 0,
                        isRestDay: true,
                        notes: this.generateRestDayNotes(restGuidance)
                    });
                }
            }
        }

        return sessions;
    }

    /**
     * Determine optimal split pattern based on weekly frequency
     */
    private static determineSplitPattern(frequency: number, experienceLevel: string = 'intermediate'): SessionFocus[] {
        if (frequency >= 6) {
            if (experienceLevel === 'beginner') {
                // Beginner 6-day split: Full Body + Cardio/Recovery focus to prevent burnout
                return ['fullbody', 'cardio', 'fullbody', 'cardio', 'fullbody', 'recovery'];
            }
            // Push/Pull/Legs/Upper/Lower/Cardio
            return ['upper', 'lower', 'upper', 'lower', 'fullbody', 'cardio'];
        } else if (frequency === 5) {
            // Upper/Lower/Upper/Lower/Fullbody
            return ['upper', 'lower', 'upper', 'lower', 'fullbody'];
        } else if (frequency === 4) {
            // Upper/Lower/Upper/Lower
            return ['upper', 'lower', 'upper', 'lower'];
        } else if (frequency === 3) {
            // Full Body 3x
            return ['fullbody', 'fullbody', 'fullbody'];
        } else if (frequency === 2) {
            // Full Body 2x
            return ['fullbody', 'fullbody'];
        } else {
            // Full Body 1x
            return ['fullbody'];
        }
    }

    private static getSessionType(focus: SessionFocus): WorkoutSession['type'] {
        if (focus === 'cardio') return 'cardio';
        if (focus === 'recovery') return 'flexibility';
        return 'strength';
    }

    private static getSessionTitle(focus: SessionFocus, day: number): string {
        const titles: Record<SessionFocus, string> = {
            upper: 'Upper Body Strength',
            lower: 'Lower Body Strength',
            fullbody: 'Full Body Workout',
            cardio: 'Cardio & Conditioning',
            recovery: 'Active Recovery & Flexibility'
        };
        return `${titles[focus]} - Day ${day}`;
    }

    private static getFocusDescription(focus: SessionFocus): string {
        const descriptions: Record<SessionFocus, string> = {
            upper: 'Chest, Back, Shoulders, Arms',
            lower: 'Legs, Glutes, Core',
            fullbody: 'Total Body Strength',
            cardio: 'Cardiovascular Conditioning',
            recovery: 'Flexibility & Mobility'
        };
        return descriptions[focus];
    }

    private static getWarmupRecommendation(focus: SessionFocus): string {
        if (focus === 'cardio') {
            return '5 min light cardio: Running in place, jumping jacks';
        } else if (focus === 'recovery') {
            return 'Gentle breathing and light stretching';
        } else if (focus === 'upper') {
            return 'Arm circles, shoulder rolls, 5 min light cardio';
        } else if (focus === 'lower') {
            return 'Leg swings, bodyweight squats, light cardio';
        } else {
            return '5-10 min dynamic stretching and light cardio';
        }
    }

    private static getCooldownRecommendation(focus: SessionFocus): string {
        if (focus === 'cardio' || focus === 'recovery') {
            return 'Light stretching, deep breathing (5-10 min)';
        }
        return 'Static stretching of worked muscles (10-15 min)';
    }

    private static estimateSessionDuration(focus: SessionFocus, isDeload: boolean): number {
        const baseDurations: Record<SessionFocus, number> = {
            upper: 50,
            lower: 50,
            fullbody: 60,
            cardio: 30,
            recovery: 25
        };
        return isDeload ? Math.floor(baseDurations[focus] * 0.7) : baseDurations[focus];
    }

    private static getIntensity(level: string): 'low' | 'moderate' | 'high' {
        if (level === 'beginner') return 'moderate';
        if (level === 'intermediate') return 'moderate';
        return 'high';
    }

    private static isWorkoutDay(day: number, frequency: number): boolean {
        // Distribute workouts evenly based on frequency
        // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
        if (frequency >= 6) return day !== 0; // 6-7 days: only rest on Sunday
        if (frequency === 5) return day !== 0 && day !== 6; // 5 days: rest Sun, Sat
        if (frequency === 4) return day !== 0 && day !== 6 && day !== 3; // 4 days: rest Sun, Sat, Wed
        if (frequency === 3) return day === 2 || day === 4 || day === 6; // 3 days: Tue, Thu, Sat
        if (frequency === 2) return day === 2 || day === 5; // 2 days: Tue, Fri
        return day === 3; // 1 day: Wed
    }

    /**
     * Intelligently selects exercises for a session with muscle group balancing
     */
    private static selectExercisesForSession(
        profile: UserProfile,
        pool: Exercise[],
        focus: SessionFocus,
        isDeload: boolean
    ): PlannedExercise[] {
        const { currentLevel } = profile.progressSystem;
        const selected: Exercise[] = [];

        // Always start with warmup exercises
        const warmupExercises = this.selectWarmupExercises(pool, 1);
        selected.push(...warmupExercises);

        // Select main exercises based on focus
        const mainExercises = this.selectMainExercises(pool, focus, 5);
        selected.push(...mainExercises);

        // Add cooldown exercises
        const cooldownExercises = this.selectCooldownExercises(pool, 1);
        selected.push(...cooldownExercises);

        // Convert to PlannedExercise with progressive overload
        return selected.map(ex => {
            const levelBonus = currentLevel - ex.unlockLevel;
            const baseReps = ex.baseReps;
            const baseSets = ex.baseSets;

            // Apply deload reduction (70% volume)
            const deloadFactor = isDeload ? 0.7 : 1.0;

            const reps = Math.max(1, Math.floor((baseReps + (levelBonus * ex.repIncrement)) * deloadFactor));
            const sets = Math.max(1, Math.floor((baseSets + Math.floor(levelBonus / 5) * ex.setIncrement) * deloadFactor));

            return {
                ...ex,
                exerciseId: ex.id,
                reps,
                sets,
                rest: this.calculateRestTime(ex.category, profile.fitnessProfile.experienceLevel),
                completed: false
            };
        });
    }

    /**
     * Select warmup exercises (cardio or flexibility)
     */
    private static selectWarmupExercises(pool: Exercise[], count: number): Exercise[] {
        const warmupPool = pool.filter(ex =>
            ex.category === 'cardio' &&
            (ex.id === 'running-in-place' || ex.id === 'jumping-jacks' || ex.id === 'high-knees')
        );
        return this.randomSelect(warmupPool, Math.min(count, warmupPool.length));
    }

    /**
     * Select cooldown exercises (flexibility)
     */
    private static selectCooldownExercises(pool: Exercise[], count: number): Exercise[] {
        const cooldownPool = pool.filter(ex => ex.category === 'flexibility');
        return this.randomSelect(cooldownPool, Math.min(count, cooldownPool.length));
    }

    /**
     * Select main exercises based on session focus with muscle group balancing
     */
    private static selectMainExercises(pool: Exercise[], focus: SessionFocus, count: number): Exercise[] {
        let targetMuscles: string[] = [];
        let targetCategories: Exercise['category'][] = ['strength'];

        if (focus === 'upper') {
            targetMuscles = ['chest', 'back', 'shoulders', 'arms'];
        } else if (focus === 'lower') {
            targetMuscles = ['legs', 'core'];
        } else if (focus === 'fullbody') {
            targetMuscles = ['chest', 'back', 'legs', 'shoulders', 'arms', 'core'];
        } else if (focus === 'cardio') {
            targetCategories = ['cardio', 'plyometric'];
        } else if (focus === 'recovery') {
            targetCategories = ['flexibility'];
        }

        // Filter pool by focus
        const focusedPool = pool.filter(ex => {
            const matchesCategory = targetCategories.includes(ex.category);
            const matchesMuscle = targetMuscles.length === 0 ||
                (ex.muscleGroups as string[]).some(mg => targetMuscles.includes(mg));

            // Exclude warmup/cooldown specific exercises from main workout
            const isWarmupCooldown = ex.id === 'running-in-place' || ex.id === 'jumping-jacks' ||
                ex.id === 'high-knees' || ex.category === 'flexibility';

            return (matchesCategory || matchesMuscle) && !isWarmupCooldown;
        });

        // Balance muscle groups
        const balanced = this.balanceMuscleGroups(focusedPool, targetMuscles, count);
        return balanced;
    }

    /**
     * Balance exercises to cover different muscle groups
     */
    private static balanceMuscleGroups(pool: Exercise[], targetMuscles: string[], count: number): Exercise[] {
        if (pool.length === 0) return [];

        const selected: Exercise[] = [];
        const usedMuscles = new Set<string>();

        // First pass: try to get one exercise per muscle group
        for (const muscle of targetMuscles) {
            if (selected.length >= count) break;

            const candidates = pool.filter(ex =>
                (ex.muscleGroups as string[]).includes(muscle) &&
                !selected.includes(ex)
            );

            if (candidates.length > 0) {
                const exercise = candidates[Math.floor(Math.random() * candidates.length)];
                selected.push(exercise);
                (exercise.muscleGroups as string[]).forEach(mg => usedMuscles.add(mg));
            }
        }

        // Second pass: fill remaining slots with variety
        const remaining = pool.filter(ex => !selected.includes(ex));
        const additionalCount = count - selected.length;
        const additional = this.randomSelect(remaining, Math.min(additionalCount, remaining.length));

        return [...selected, ...additional];
    }

    /**
     * Randomly select exercises from pool
     */
    private static randomSelect(pool: Exercise[], count: number): Exercise[] {
        const shuffled = [...pool].sort(() => 0.5 - Math.random());
        return shuffled.slice(0, count);
    }

    /**
     * Calculate rest time based on exercise type and user level
     */
    private static calculateRestTime(category: Exercise['category'], level: string): number {
        const baseTimes: Record<Exercise['category'], number> = {
            strength: 90,
            cardio: 45,
            flexibility: 15,
            plyometric: 60
        };

        const levelMultipliers: Record<string, number> = {
            beginner: 1.2,
            intermediate: 1.0,
            advanced: 0.8
        };

        return Math.floor(baseTimes[category] * (levelMultipliers[level] || 1.0));
    }

    /**
     * Calculate accurate metrics based on actual workout data
     */
    private static calculateMetrics(sessions: WorkoutSession[], profile: UserProfile): PlanMetrics {
        const workoutSessions = sessions.filter(s => s.type !== 'rest');

        // Calculate total volume (sets × reps)
        let totalVolume = 0;
        const muscleGroupCoverage = new Set<string>();

        workoutSessions.forEach(session => {
            session.exercises.forEach(ex => {
                const reps = typeof ex.reps === 'number' ? ex.reps : 10;
                totalVolume += ex.sets * reps;

                if (ex.muscleGroups) {
                    (ex.muscleGroups as string[]).forEach(mg => muscleGroupCoverage.add(mg));
                }
            });
        });

        // Calculate estimated calories (using MET values)
        let estimatedCalories = 0;
        workoutSessions.forEach(session => {
            session.exercises.forEach(ex => {
                const reps = typeof ex.reps === 'number' ? ex.reps : 10;
                const totalReps = ex.sets * reps;
                const caloriesPerRep = ex.caloriesPerRep || 0.3;
                estimatedCalories += totalReps * caloriesPerRep;
            });
        });

        return {
            totalVolume,
            averageSessionDuration: workoutSessions.reduce((sum, s) => sum + s.duration, 0) / workoutSessions.length,
            weeklyIntensity: this.calculateIntensityScore(profile.fitnessProfile.experienceLevel),
            totalWorkouts: workoutSessions.length,
            estimatedCalories: Math.round(estimatedCalories),
            focusMuscles: Array.from(muscleGroupCoverage),
            weeklyFrequency: Math.round(workoutSessions.length / 4)
        };
    }

    private static calculateIntensityScore(level: string): number {
        const scores: Record<string, number> = {
            beginner: 4,
            intermediate: 6,
            advanced: 8
        };
        return scores[level] || 5;
    }

    /**
     * Get number of consecutive workout days before current day
     */
    private static getConsecutiveWorkoutDays(sessions: WorkoutSession[], currentDay: number): number {
        let count = 0;
        for (let i = currentDay - 1; i >= 0; i--) {
            if (sessions[i] && !sessions[i].isRestDay && sessions[i].type !== 'rest') {
                count++;
            } else {
                break;
            }
        }
        return count;
    }

    /**
     * Select exercises for active recovery session
     */
    private static selectActiveRecoveryExercises(profile: UserProfile): PlannedExercise[] {
        // Select 4-5 recovery exercises
        const recoveryPool = RECOVERY_EXERCISES.filter(ex => {
            // Filter by equipment availability
            if (profile.fitnessProfile.equipmentAccess === 'bodyweight') {
                return ex.equipmentRequired === 'bodyweight';
            }
            return true;
        });

        const selected = this.randomSelect(recoveryPool, Math.min(4, recoveryPool.length));

        return selected.map(ex => ({
            ...ex,
            exerciseId: ex.id,
            reps: ex.baseReps,
            sets: ex.baseSets,
            rest: 30, // Short rest for recovery
            completed: false
        }));
    }

    /**
     * Generate detailed rest day notes with guidance
     */
    private static generateRestDayNotes(guidance: any): string {
        return `**Complete Rest Day - Focus on Recovery**

Your body needs this rest to adapt and grow stronger. Use this day wisely!

**Nutrition Focus:**
${guidance.nutritionFocus.slice(0, 3).map((tip: string) => `• ${tip}`).join('\n')}

**Sleep Recommendations:**
${guidance.sleepRecommendations.slice(0, 2).map((tip: string) => `• ${tip}`).join('\n')}

**Optional Light Activities:**
${guidance.recoveryActivities.slice(0, 3).map((activity: string) => `• ${activity}`).join('\n')}

**Mental Recovery:**
${guidance.mentalRecovery.slice(0, 2).map((activity: string) => `• ${activity}`).join('\n')}

**Hydration Goal:** ${guidance.hydrationGoal}

Remember: Rest days are when your muscles actually grow and adapt. They're just as important as workout days!`;
    }
}

