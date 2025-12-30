import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { ExerciseInstructions } from '../../types';
import { workoutPlanService } from '../../services/WorkoutPlanService';

interface ExerciseState {
    instructions: Record<string, ExerciseInstructions>; // Map of exerciseId -> instructions
    loading: boolean;
    error: string | null;
}

const initialState: ExerciseState = {
    instructions: {},
    loading: false,
    error: null,
};

/**
 * Fetch exercise instructions from Firestore
 */
export const fetchExerciseInstructions = createAsyncThunk(
    'exercise/fetchInstructions',
    async (exerciseId: string, { getState, rejectWithValue }) => {
        const state = getState() as { exercise: ExerciseState };

        // Return cached version if already exists
        if (state.exercise.instructions[exerciseId]) {
            return state.exercise.instructions[exerciseId];
        }

        try {
            const instructions = await workoutPlanService.getExerciseInstructions(exerciseId);
            if (!instructions) {
                return rejectWithValue(`No instructions found for ${exerciseId}`);
            }
            return instructions;
        } catch (error: any) {
            return rejectWithValue(error.message || 'Failed to fetch instructions');
        }
    }
);

/**
 * Seed initial instructions (One-time use)
 */
export const seedAllInstructions = createAsyncThunk(
    'exercise/seed',
    async (instructionsList: ExerciseInstructions[], { rejectWithValue }) => {
        try {
            await workoutPlanService.seedInstructions(instructionsList);
            return instructionsList;
        } catch (error: any) {
            return rejectWithValue(error.message || 'Seeding failed');
        }
    }
);

const exerciseSlice = createSlice({
    name: 'exercise',
    initialState,
    reducers: {
        clearExerciseError: (state) => {
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        builder
            // Fetch Instructions
            .addCase(fetchExerciseInstructions.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchExerciseInstructions.fulfilled, (state, action) => {
                state.loading = false;
                state.instructions[action.payload.exerciseId] = action.payload;
            })
            .addCase(fetchExerciseInstructions.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            })
            // Seeding
            .addCase(seedAllInstructions.pending, (state) => {
                state.loading = true;
            })
            .addCase(seedAllInstructions.fulfilled, (state, action) => {
                state.loading = false;
                action.payload.forEach(inst => {
                    state.instructions[inst.exerciseId] = inst;
                });
            })
            .addCase(seedAllInstructions.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            });
    },
});

export const { clearExerciseError } = exerciseSlice.actions;
export default exerciseSlice.reducer;
