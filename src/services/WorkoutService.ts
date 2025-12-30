/**
 * WorkoutService
 * 
 * Service for managing workout sessions in Firestore.
 * Handles saving, retrieving, and analyzing workout history.
 */

import {
    collection,
    doc,
    setDoc,
    getDoc,
    getDocs,
    query,
    where,
    orderBy,
    limit,
    serverTimestamp,
    Timestamp
} from 'firebase/firestore';
import { db, auth } from './firebaseConfig';
import { WorkoutSession, ProgressStats } from '../types';

// Collection names
const WORKOUTS_COLLECTION = 'workouts';
const STATS_COLLECTION = 'stats';

export interface WorkoutSessionData {
    id: string;
    exerciseId: string;
    exerciseName: string;
    duration: number; // seconds
    reps: number;
    averageFormScore: number;
    caloriesBurned: number;
    createdAt: Date;
}

class WorkoutService {
    /**
     * Save a completed workout session
     */
    async saveWorkoutSession(session: {
        exerciseId: string;
        exerciseName: string;
        duration: number;
        reps: number;
        averageFormScore: number;
        caloriesBurned: number;
    }): Promise<string | null> {
        const user = auth.currentUser;
        if (!user) {
            console.error('[WorkoutService] No authenticated user');
            return null;
        }

        try {
            const workoutId = `${user.uid}_${Date.now()}`;
            const workoutRef = doc(db, WORKOUTS_COLLECTION, workoutId);

            await setDoc(workoutRef, {
                userId: user.uid,
                ...session,
                createdAt: serverTimestamp(),
            });

            console.log('[WorkoutService] Workout saved:', workoutId);

            // Update daily stats
            await this.updateDailyStats(session);

            return workoutId;
        } catch (error) {
            console.error('[WorkoutService] Failed to save workout:', error);
            return null;
        }
    }

    /**
     * Get user's workout history
     */
    async getWorkoutHistory(limitCount: number = 20): Promise<WorkoutSessionData[]> {
        const user = auth.currentUser;
        if (!user) return [];

        try {
            const workoutsQuery = query(
                collection(db, WORKOUTS_COLLECTION),
                where('userId', '==', user.uid),
                orderBy('createdAt', 'desc'),
                limit(limitCount)
            );

            const snapshot = await getDocs(workoutsQuery);
            const workouts: WorkoutSessionData[] = [];

            snapshot.forEach((doc) => {
                const data = doc.data();
                workouts.push({
                    id: doc.id,
                    exerciseId: data.exerciseId,
                    exerciseName: data.exerciseName,
                    duration: data.duration,
                    reps: data.reps,
                    averageFormScore: data.averageFormScore,
                    caloriesBurned: data.caloriesBurned,
                    createdAt: data.createdAt?.toDate() || new Date(),
                });
            });

            return workouts;
        } catch (error) {
            console.error('[WorkoutService] Failed to get history:', error);
            return [];
        }
    }

    /**
     * Get workout statistics for a period
     */
    async getStats(period: 'week' | 'month' | 'all' = 'week'): Promise<{
        totalWorkouts: number;
        totalReps: number;
        totalDuration: number;
        totalCalories: number;
        averageFormScore: number;
        exerciseBreakdown: Record<string, { count: number; reps: number }>;
    }> {
        const user = auth.currentUser;
        if (!user) {
            return {
                totalWorkouts: 0,
                totalReps: 0,
                totalDuration: 0,
                totalCalories: 0,
                averageFormScore: 0,
                exerciseBreakdown: {},
            };
        }

        try {
            // Calculate date range
            const now = new Date();
            let startDate = new Date();

            if (period === 'week') {
                startDate.setDate(now.getDate() - 7);
            } else if (period === 'month') {
                startDate.setMonth(now.getMonth() - 1);
            } else {
                startDate = new Date(0); // All time
            }

            const workoutsQuery = query(
                collection(db, WORKOUTS_COLLECTION),
                where('userId', '==', user.uid),
                where('createdAt', '>=', Timestamp.fromDate(startDate)),
                orderBy('createdAt', 'desc')
            );

            const snapshot = await getDocs(workoutsQuery);

            let totalWorkouts = 0;
            let totalReps = 0;
            let totalDuration = 0;
            let totalCalories = 0;
            let totalFormScore = 0;
            const exerciseBreakdown: Record<string, { count: number; reps: number }> = {};

            snapshot.forEach((doc) => {
                const data = doc.data();
                totalWorkouts++;
                totalReps += data.reps || 0;
                totalDuration += data.duration || 0;
                totalCalories += data.caloriesBurned || 0;
                totalFormScore += data.averageFormScore || 0;

                // Track by exercise
                const exId = data.exerciseId;
                if (!exerciseBreakdown[exId]) {
                    exerciseBreakdown[exId] = { count: 0, reps: 0 };
                }
                exerciseBreakdown[exId].count++;
                exerciseBreakdown[exId].reps += data.reps || 0;
            });

            return {
                totalWorkouts,
                totalReps,
                totalDuration,
                totalCalories,
                averageFormScore: totalWorkouts > 0
                    ? Math.round(totalFormScore / totalWorkouts)
                    : 0,
                exerciseBreakdown,
            };
        } catch (error) {
            console.error('[WorkoutService] Failed to get stats:', error);
            return {
                totalWorkouts: 0,
                totalReps: 0,
                totalDuration: 0,
                totalCalories: 0,
                averageFormScore: 0,
                exerciseBreakdown: {},
            };
        }
    }

    /**
     * Update daily stats (for quick access)
     */
    private async updateDailyStats(session: {
        reps: number;
        duration: number;
        averageFormScore: number;
        caloriesBurned: number;
    }): Promise<void> {
        const user = auth.currentUser;
        if (!user) return;

        try {
            const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
            const statsRef = doc(db, STATS_COLLECTION, `${user.uid}_${today}`);
            const statsDoc = await getDoc(statsRef);

            if (statsDoc.exists()) {
                const existing = statsDoc.data();
                await setDoc(statsRef, {
                    userId: user.uid,
                    date: today,
                    workoutCount: (existing.workoutCount || 0) + 1,
                    totalReps: (existing.totalReps || 0) + session.reps,
                    totalDuration: (existing.totalDuration || 0) + session.duration,
                    totalCalories: (existing.totalCalories || 0) + session.caloriesBurned,
                    averageFormScore: Math.round(
                        ((existing.averageFormScore || 0) * existing.workoutCount + session.averageFormScore) /
                        (existing.workoutCount + 1)
                    ),
                    updatedAt: serverTimestamp(),
                });
            } else {
                await setDoc(statsRef, {
                    userId: user.uid,
                    date: today,
                    workoutCount: 1,
                    totalReps: session.reps,
                    totalDuration: session.duration,
                    totalCalories: session.caloriesBurned,
                    averageFormScore: session.averageFormScore,
                    createdAt: serverTimestamp(),
                    updatedAt: serverTimestamp(),
                });
            }
        } catch (error) {
            console.error('[WorkoutService] Failed to update daily stats:', error);
        }
    }

    /**
     * Get personal bests
     */
    async getPersonalBests(): Promise<{
        maxReps: { value: number; exercise: string; date: Date } | null;
        longestWorkout: { value: number; exercise: string; date: Date } | null;
        bestFormScore: { value: number; exercise: string; date: Date } | null;
    }> {
        const user = auth.currentUser;
        if (!user) {
            return { maxReps: null, longestWorkout: null, bestFormScore: null };
        }

        try {
            const workouts = await this.getWorkoutHistory(100);

            let maxReps: { value: number; exercise: string; date: Date } | null = null;
            let longestWorkout: { value: number; exercise: string; date: Date } | null = null;
            let bestFormScore: { value: number; exercise: string; date: Date } | null = null;

            workouts.forEach((w) => {
                if (!maxReps || w.reps > maxReps.value) {
                    maxReps = { value: w.reps, exercise: w.exerciseName, date: w.createdAt };
                }
                if (!longestWorkout || w.duration > longestWorkout.value) {
                    longestWorkout = { value: w.duration, exercise: w.exerciseName, date: w.createdAt };
                }
                if (!bestFormScore || w.averageFormScore > bestFormScore.value) {
                    bestFormScore = { value: w.averageFormScore, exercise: w.exerciseName, date: w.createdAt };
                }
            });

            return { maxReps, longestWorkout, bestFormScore };
        } catch (error) {
            console.error('[WorkoutService] Failed to get personal bests:', error);
            return { maxReps: null, longestWorkout: null, bestFormScore: null };
        }
    }
}

// Export singleton
export const workoutService = new WorkoutService();
