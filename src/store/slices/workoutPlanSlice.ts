import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { WorkoutPlan, DailyWorkout } from '../../types';
import { workoutPlanService } from '../../services/WorkoutPlanService';

interface WorkoutPlanState {
    currentPlan: WorkoutPlan | null;
    todaysWorkout: DailyWorkout | null;
    recoveryStatus: 'good' | 'moderate' | 'poor';
    loading: boolean;
    error: string | null;
}

const initialState: WorkoutPlanState = {
    currentPlan: null,
    todaysWorkout: null,
    recoveryStatus: 'good',
    loading: false,
    error: null,
};

/**
 * Fetch user's workout plan from Firestore
 */
export const fetchWorkoutPlan = createAsyncThunk(
    'workoutPlan/fetch',
    async (userId: string, { rejectWithValue }) => {
        try {
            const plan = await workoutPlanService.getUserWorkoutPlan(userId);
            if (!plan) {
                return rejectWithValue('No workout plan found');
            }
            return plan;
        } catch (error: any) {
            return rejectWithValue(error.message || 'Failed to fetch workout plan');
        }
    }
);

/**
 * Update exercise completion status
 */
export const updateExerciseCompletion = createAsyncThunk(
    'workoutPlan/updateExercise',
    async (
        {
            planId,
            dayOfWeek,
            exerciseId,
            completed,
        }: {
            planId: string;
            dayOfWeek: number;
            exerciseId: string;
            completed: boolean;
        },
        { rejectWithValue }
    ) => {
        try {
            const success = await workoutPlanService.updateExerciseCompletion(
                planId,
                dayOfWeek,
                exerciseId,
                completed
            );
            if (!success) {
                return rejectWithValue('Failed to update exercise');
            }
            return { dayOfWeek, exerciseId, completed };
        } catch (error: any) {
            return rejectWithValue(error.message || 'Failed to update exercise');
        }
    }
);

/**
 * Update plan level and regenerate
 */
export const updatePlanLevel = createAsyncThunk(
    'workoutPlan/updateLevel',
    async (
        { userId, level }: { userId: string; level: number },
        { getState, rejectWithValue }
    ) => {
        try {
            const state = getState() as { workoutPlan: WorkoutPlanState };
            const profile = state.workoutPlan.currentPlan?.userProfile;
            if (!profile) return rejectWithValue('No user profile found');

            const newPlan = workoutPlanService.generateWorkoutPlan(profile, level);
            await workoutPlanService.saveWorkoutPlan(newPlan);
            return newPlan;
        } catch (error: any) {
            return rejectWithValue(error.message || 'Failed to update plan level');
        }
    }
);

const workoutPlanSlice = createSlice({
    name: 'workoutPlan',
    initialState,
    reducers: {
        setTodaysWorkout: (state, action: PayloadAction<DailyWorkout | null>) => {
            state.todaysWorkout = action.payload;
        },
        setRecoveryStatus: (state, action: PayloadAction<'good' | 'moderate' | 'poor'>) => {
            state.recoveryStatus = action.payload;
        },
        clearWorkoutPlan: (state) => {
            state.currentPlan = null;
            state.todaysWorkout = null;
            state.error = null;
        },
        clearError: (state) => {
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        builder
            // Fetch workout plan
            .addCase(fetchWorkoutPlan.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchWorkoutPlan.fulfilled, (state, action) => {
                state.loading = false;
                state.currentPlan = action.payload;

                // Set today's workout
                const today = new Date().getDay(); // 0 = Sunday, 1 = Monday, etc.

                // For multi-week plans, we want to find a session that matches the current day of the week
                // and ideally the current week. For now, we'll find any session with matching dayOfWeek.
                const todaysWorkout = action.payload.sessions.find(
                    (s) => s.dayOfWeek === today
                );

                if (todaysWorkout) {
                    // Ensure isRestDay is set based on type if missing
                    state.todaysWorkout = {
                        ...todaysWorkout,
                        isRestDay: todaysWorkout.isRestDay ?? todaysWorkout.type === 'rest'
                    };
                } else {
                    // Create a rest day object
                    state.todaysWorkout = {
                        id: `rest_fallback_${today}`,
                        day: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][today],
                        dayOfWeek: today,
                        focus: 'Rest & Recovery',
                        exercises: [],
                        duration: 0,
                        status: 'completed',
                        type: 'rest',
                        intensity: 'low',
                        isRestDay: true,
                        notes: 'Take today to recover and prepare for your next workout.'
                    } as any;
                }
            })
            .addCase(fetchWorkoutPlan.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            })

            // Update exercise completion
            .addCase(updateExerciseCompletion.pending, (state) => {
                state.loading = true;
            })
            .addCase(updateExerciseCompletion.fulfilled, (state, action) => {
                state.loading = false;
                const { dayOfWeek, exerciseId, completed } = action.payload;

                // Update in current plan
                if (state.currentPlan) {
                    const session = state.currentPlan.sessions.find(
                        (s) => s.dayOfWeek === dayOfWeek
                    );
                    if (session) {
                        const exercise = session.exercises.find(
                            (e) => e.exerciseId === exerciseId
                        );
                        if (exercise) {
                            exercise.completed = completed;
                        }
                    }
                }

                // Update in today's workout
                if (state.todaysWorkout && state.todaysWorkout.dayOfWeek === dayOfWeek) {
                    const exercise = state.todaysWorkout.exercises.find(
                        (e) => e.exerciseId === exerciseId
                    );
                    if (exercise) {
                        exercise.completed = completed;
                    }
                }
            })
            .addCase(updateExerciseCompletion.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            })

            // Update plan level
            .addCase(updatePlanLevel.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(updatePlanLevel.fulfilled, (state, action) => {
                state.loading = false;
                state.currentPlan = action.payload;

                // Set today's workout
                const today = new Date().getDay();
                const todaysWorkout = (action.payload.sessions as any[]).find(
                    (s) => s.dayOfWeek === today
                );

                if (todaysWorkout) {
                    state.todaysWorkout = {
                        ...todaysWorkout,
                        isRestDay: todaysWorkout.isRestDay ?? todaysWorkout.type === 'rest'
                    };
                } else {
                    state.todaysWorkout = {
                        id: `rest_level_fallback_${today}`,
                        day: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][today],
                        dayOfWeek: today,
                        focus: 'Rest & Recovery',
                        exercises: [],
                        duration: 0,
                        status: 'completed',
                        type: 'rest',
                        intensity: 'low',
                        isRestDay: true,
                        notes: 'Take today to recover and prepare for your next workout.'
                    } as any;
                }
            })
            .addCase(updatePlanLevel.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            });
    },
});

export const { setTodaysWorkout, setRecoveryStatus, clearWorkoutPlan, clearError } = workoutPlanSlice.actions;
export default workoutPlanSlice.reducer;
