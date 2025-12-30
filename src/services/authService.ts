import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut as firebaseSignOut,
    updateProfile as firebaseUpdateProfile,
    User,
} from 'firebase/auth';
import { doc, setDoc, getDoc, updateDoc, deleteDoc, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { auth, db, storage } from './firebaseConfig';
import { UserProfile } from '../types';

class AuthService {
    /**
     * Sign up a new user with email and password
     */
    async signUp(email: string, password: string, displayName: string): Promise<UserProfile> {
        try {
            // Create Firebase Auth user
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;

            // Update display name
            await firebaseUpdateProfile(user, { displayName });

            // Create user profile in Firestore
            const userProfile: UserProfile = {
                uid: user.uid,
                email: email,
                displayName: displayName,
                age: 0,
                weight: 0,
                height: 0,
                fitnessGoal: 'weight_loss',
                fitnessProfile: {
                    equipmentAccess: 'bodyweight',
                    availableEquipment: [],
                    experienceLevel: 'beginner',
                    fitnessGoals: [],
                    healthIssues: [],
                    availableDays: 3
                },
                progressSystem: {
                    currentLevel: 1,
                    currentXP: 0,
                    xpToNextLevel: 1000,
                    totalWorkoutsCompleted: 0,
                    unlockedExercises: ['push-ups', 'squats', 'plank', 'jumping-jacks']
                },
                workoutCapacity: {
                    bodyweight: { sets: 3, reps: 10 },
                    weighted: { sets: 3, reps: 8 }
                },
                createdAt: new Date(),
                updatedAt: new Date(),
                transformationPhotos: [],
                level: 1,
                xp: 0,
                totalWorkouts: 0,
            };

            // Add photoURL only if it exists
            if (user.photoURL) {
                userProfile.photoURL = user.photoURL;
            }

            await setDoc(doc(db, 'users', user.uid), {
                ...userProfile,
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp(),
            });

            return userProfile;
        } catch (error: any) {
            throw new Error(this.handleAuthError(error.code));
        }
    }

    /**
     * Sign in existing user
     */
    async signIn(email: string, password: string): Promise<UserProfile> {
        try {
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;

            // Fetch user profile from Firestore
            const userProfile = await this.getUserProfile(user.uid);

            if (!userProfile) {
                throw new Error('User profile not found');
            }

            return userProfile;
        } catch (error: any) {
            throw new Error(this.handleAuthError(error.code));
        }
    }

    /**
     * Sign out current user
     */
    async signOut(): Promise<void> {
        try {
            await firebaseSignOut(auth);
        } catch (error: any) {
            throw new Error('Failed to sign out');
        }
    }

    /**
     * Get user profile from Firestore
     */
    async getUserProfile(uid: string): Promise<UserProfile | null> {
        try {
            const docRef = doc(db, 'users', uid);
            const docSnap = await getDoc(docRef);

            if (docSnap.exists()) {
                const data = docSnap.data();

                const profile: UserProfile = {
                    uid: data.uid,
                    email: data.email,
                    displayName: data.displayName,
                    age: data.age || 0,
                    weight: data.weight || 0,
                    height: data.height || 0,
                    fitnessGoal: data.fitnessGoal || 'weight_loss',
                    fitnessProfile: data.fitnessProfile || {
                        equipmentAccess: data.equipmentAccess || data.equipmentAvailable || 'bodyweight',
                        experienceLevel: data.workoutExperience || 'beginner',
                        fitnessGoals: data.fitnessGoals || [data.fitnessGoal] || [],
                        healthIssues: data.healthIssues || data.healthConstraints || [],
                        availableDays: data.availableDays || 3
                    },
                    progressSystem: data.progressSystem || {
                        currentLevel: data.level || 1,
                        currentXP: data.xp || 0,
                        xpToNextLevel: data.xpToNextLevel || 1000,
                        totalWorkoutsCompleted: data.totalWorkouts || 0,
                        unlockedExercises: data.unlockedExercises || []
                    },
                    workoutCapacity: data.workoutCapacity || {
                        bodyweight: { sets: 3, reps: 10 },
                        weighted: { sets: 3, reps: 8 }
                    },
                    workoutPlanId: data.workoutPlanId,
                    transformationPhotos: data.transformationPhotos || [],
                    level: data.level || 1,
                    xp: data.xp || 0,
                    totalWorkouts: data.totalWorkouts || 0,
                    createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : new Date(),
                    updatedAt: data.updatedAt?.toDate ? data.updatedAt.toDate() : new Date(),
                };

                // Add optional photoURL if it exists
                if (data.photoURL) {
                    profile.photoURL = data.photoURL;
                }

                return profile;
            }

            return null;
        } catch (error) {
            console.error('Error fetching user profile:', error);
            return null;
        }
    }

    /**
     * Update user profile
     */
    async updateUserProfile(updates: Partial<UserProfile>): Promise<UserProfile> {
        try {
            const user = auth.currentUser;
            if (!user) {
                throw new Error('No authenticated user');
            }

            // Update Firestore document
            const docRef = doc(db, 'users', user.uid);
            await updateDoc(docRef, {
                ...updates,
                updatedAt: serverTimestamp(),
            });

            // Fetch updated profile
            const updatedProfile = await this.getUserProfile(user.uid);

            if (!updatedProfile) {
                throw new Error('Failed to fetch updated profile');
            }

            return updatedProfile;
        } catch (error: any) {
            throw new Error('Failed to update profile');
        }
    }

    /**
     * Upload profile photo to Firebase Storage
     */
    async uploadProfilePhoto(uri: string): Promise<string> {
        try {
            const user = auth.currentUser;
            if (!user) throw new Error('No user logged in');

            // blob conversion
            const response = await fetch(uri);
            const blob = await response.blob();

            // Create reference: profile_photos/UID
            const storageRef = ref(storage, `profile_photos/${user.uid}`);

            // Upload
            await uploadBytes(storageRef, blob);

            // Get URL
            const downloadURL = await getDownloadURL(storageRef);

            // Update profile
            await this.updateUserProfile({ photoURL: downloadURL });
            await firebaseUpdateProfile(user, { photoURL: downloadURL });

            return downloadURL;
        } catch (error: any) {
            console.error('Upload Error:', error);
            throw new Error('Failed to upload photo: ' + error.message);
        }
    }


    /**
     * Get current Firebase user
     */
    getCurrentUser(): User | null {
        return auth.currentUser;
    }

    /**
     * Handle Firebase Auth errors
     */
    private handleAuthError(errorCode: string): string {
        switch (errorCode) {
            case 'auth/email-already-in-use':
                return 'This email is already registered';
            case 'auth/invalid-email':
                return 'Invalid email address';
            case 'auth/weak-password':
                return 'Password should be at least 6 characters';
            case 'auth/user-not-found':
                return 'No account found with this email';
            case 'auth/wrong-password':
                return 'Incorrect password';
            case 'auth/too-many-requests':
                return 'Too many attempts. Please try again later';
            case 'auth/network-request-failed':
                return 'Network error. Please check your connection';
            default:
                return 'An error occurred. Please try again';
        }
    }
}

export const authService = new AuthService();
