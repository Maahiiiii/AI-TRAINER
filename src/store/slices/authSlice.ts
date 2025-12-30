import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { UserProfile } from '../../types';
import { authService } from '../../services/authService';

interface AuthState {
    user: UserProfile | null;
    loading: boolean;
    error: string | null;
    isAuthenticated: boolean;
}

const initialState: AuthState = {
    user: null,
    loading: false,
    error: null,
    isAuthenticated: false,
};

// Async thunks
export const signUp = createAsyncThunk(
    'auth/signUp',
    async (credentials: { email: string; password: string; displayName: string }, { rejectWithValue }) => {
        try {
            const user = await authService.signUp(credentials.email, credentials.password, credentials.displayName);
            return user;
        } catch (error: any) {
            return rejectWithValue(error.message);
        }
    }
);

export const signIn = createAsyncThunk(
    'auth/signIn',
    async (credentials: { email: string; password: string }, { rejectWithValue }) => {
        try {
            const user = await authService.signIn(credentials.email, credentials.password);
            return user;
        } catch (error: any) {
            return rejectWithValue(error.message);
        }
    }
);

export const signOut = createAsyncThunk(
    'auth/signOut',
    async (_, { rejectWithValue }) => {
        try {
            await authService.signOut();
        } catch (error: any) {
            return rejectWithValue(error.message);
        }
    }
);

export const updateProfile = createAsyncThunk(
    'auth/updateProfile',
    async (profile: Partial<UserProfile>, { rejectWithValue }) => {
        try {
            const updatedUser = await authService.updateUserProfile(profile);
            return updatedUser;
        } catch (error: any) {
            return rejectWithValue(error.message);
        }
    }
);

export const uploadPhoto = createAsyncThunk(
    'auth/uploadPhoto',
    async (uri: string, { rejectWithValue }) => {
        try {
            const photoURL = await authService.uploadProfilePhoto(uri);
            return photoURL;
        } catch (error: any) {
            return rejectWithValue(error.message);
        }
    }
);

const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        setUser: (state, action: PayloadAction<UserProfile | null>) => {
            state.user = action.payload;
            state.isAuthenticated = !!action.payload;
        },
        clearError: (state) => {
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        // Sign Up
        builder
            .addCase(signUp.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(signUp.fulfilled, (state, action) => {
                state.loading = false;
                state.user = action.payload;
                state.isAuthenticated = true;
            })
            .addCase(signUp.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            });

        // Sign In
        builder
            .addCase(signIn.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(signIn.fulfilled, (state, action) => {
                state.loading = false;
                state.user = action.payload;
                state.isAuthenticated = true;
            })
            .addCase(signIn.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            });

        // Sign Out
        builder
            .addCase(signOut.pending, (state) => {
                state.loading = true;
            })
            .addCase(signOut.fulfilled, (state) => {
                state.loading = false;
                state.user = null;
                state.isAuthenticated = false;
            })
            .addCase(signOut.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            });

        // Update Profile
        builder
            .addCase(updateProfile.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(updateProfile.fulfilled, (state, action) => {
                state.loading = false;
                state.user = action.payload;
            })
            .addCase(updateProfile.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            });

        // Upload Photo
        builder
            .addCase(uploadPhoto.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(uploadPhoto.fulfilled, (state, action) => {
                state.loading = false;
                if (state.user) {
                    state.user.photoURL = action.payload;
                }
            })
            .addCase(uploadPhoto.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            });
    },
});

export const { setUser, clearError } = authSlice.actions;
export default authSlice.reducer;
