/**
 * Workout Slice
 * 
 * Redux slice for managing workout state and history.
 */

import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { workoutService, WorkoutSessionData } from '../../services/WorkoutService';

interface WorkoutStats {
    totalWorkouts: number;
    totalReps: number;
    totalDuration: number;
    totalCalories: number;
    averageFormScore: number;
    exerciseBreakdown: Record<string, { count: number; reps: number }>;
}

interface PersonalBests {
    maxReps: { value: number; exercise: string; date: Date } | null;
    longestWorkout: { value: number; exercise: string; date: Date } | null;
    bestFormScore: { value: number; exercise: string; date: Date } | null;
}

interface WorkoutState {
    history: WorkoutSessionData[];
    stats: WorkoutStats;
    personalBests: PersonalBests;
    loading: boolean;
    error: string | null;
}

const initialState: WorkoutState = {
    history: [],
    stats: {
        totalWorkouts: 0,
        totalReps: 0,
        totalDuration: 0,
        totalCalories: 0,
        averageFormScore: 0,
        exerciseBreakdown: {},
    },
    personalBests: {
        maxReps: null,
        longestWorkout: null,
        bestFormScore: null,
    },
    loading: false,
    error: null,
};

// Async thunks
export const saveWorkout = createAsyncThunk(
    'workout/saveWorkout',
    async (session: {
        exerciseId: string;
        exerciseName: string;
        duration: number;
        reps: number;
        averageFormScore: number;
        caloriesBurned: number;
    }, { rejectWithValue }) => {
        try {
            const workoutId = await workoutService.saveWorkoutSession(session);
            if (!workoutId) {
                throw new Error('Failed to save workout');
            }
            return { ...session, id: workoutId, createdAt: new Date() };
        } catch (error: any) {
            return rejectWithValue(error.message);
        }
    }
);

export const fetchWorkoutHistory = createAsyncThunk(
    'workout/fetchHistory',
    async (limit: number = 20, { rejectWithValue }) => {
        try {
            const history = await workoutService.getWorkoutHistory(limit);
            return history;
        } catch (error: any) {
            return rejectWithValue(error.message);
        }
    }
);

export const fetchWorkoutStats = createAsyncThunk(
    'workout/fetchStats',
    async (period: 'week' | 'month' | 'all' = 'week', { rejectWithValue }) => {
        try {
            const stats = await workoutService.getStats(period);
            return stats;
        } catch (error: any) {
            return rejectWithValue(error.message);
        }
    }
);

export const fetchPersonalBests = createAsyncThunk(
    'workout/fetchPersonalBests',
    async (_, { rejectWithValue }) => {
        try {
            const bests = await workoutService.getPersonalBests();
            return bests;
        } catch (error: any) {
            return rejectWithValue(error.message);
        }
    }
);

const workoutSlice = createSlice({
    name: 'workout',
    initialState,
    reducers: {
        clearWorkoutError: (state) => {
            state.error = null;
        },
        resetWorkoutState: () => initialState,
    },
    extraReducers: (builder) => {
        // Save Workout
        builder
            .addCase(saveWorkout.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(saveWorkout.fulfilled, (state, action) => {
                state.loading = false;
                // Add to history at the beginning
                state.history.unshift(action.payload as WorkoutSessionData);
            })
            .addCase(saveWorkout.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            });

        // Fetch History
        builder
            .addCase(fetchWorkoutHistory.pending, (state) => {
                state.loading = true;
            })
            .addCase(fetchWorkoutHistory.fulfilled, (state, action) => {
                state.loading = false;
                state.history = action.payload;
            })
            .addCase(fetchWorkoutHistory.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            });

        // Fetch Stats
        builder
            .addCase(fetchWorkoutStats.pending, (state) => {
                state.loading = true;
            })
            .addCase(fetchWorkoutStats.fulfilled, (state, action) => {
                state.loading = false;
                state.stats = action.payload;
            })
            .addCase(fetchWorkoutStats.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            });

        // Fetch Personal Bests
        builder
            .addCase(fetchPersonalBests.fulfilled, (state, action) => {
                state.personalBests = action.payload;
            });
    },
});

export const { clearWorkoutError, resetWorkoutState } = workoutSlice.actions;
export default workoutSlice.reducer;
