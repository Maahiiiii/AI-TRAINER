import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import workoutReducer from './slices/workoutSlice';
import workoutPlanReducer from './slices/workoutPlanSlice';
import exerciseReducer from './slices/exerciseSlice';

export const store = configureStore({
    reducer: {
        auth: authReducer,
        workout: workoutReducer,
        workoutPlan: workoutPlanReducer,
        exercise: exerciseReducer,
    },
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
            serializableCheck: {
                // Ignore these action types
                ignoredActions: ['auth/setUser'],
                // Ignore these paths in the state
                ignoredPaths: ['auth.user.createdAt', 'auth.user.lastLoginAt'],
            },
        }),
});

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
