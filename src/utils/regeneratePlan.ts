/**
 * Quick utility script to regenerate workout plan with updated session focus labels
 * Run this from Firebase Console or as a one-time migration
 */

import { workoutPlanService } from '../services/WorkoutPlanService';
import { authService } from '../services/authService';

export async function regenerateUserPlan(userId: string) {
    try {
        console.log('Fetching user profile...');
        const userProfile = await authService.getUserProfile(userId);

        if (!userProfile) {
            throw new Error('User profile not found');
        }

        console.log('Generating new workout plan...');
        const newPlan = workoutPlanService.generateWorkoutPlan(userProfile);

        console.log('Saving updated plan...');
        const planId = await workoutPlanService.saveWorkoutPlan(newPlan);

        console.log('✅ Plan regenerated successfully!');
        console.log('Plan ID:', planId);
        console.log('New session focuses:', newPlan.sessions.map(s => s.focus));

        return newPlan;
    } catch (error) {
        console.error('❌ Error regenerating plan:', error);
        throw error;
    }
}
