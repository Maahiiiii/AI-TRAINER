import React, { useEffect, useState, useRef } from 'react';
import { StatusBar } from 'expo-status-bar';
import { Provider, useSelector } from 'react-redux';
import { onAuthStateChanged } from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { store, RootState } from './src/store';
import { auth } from './src/services/firebaseConfig';
import { authService } from './src/services/authService';
import { setUser } from './src/store/slices/authSlice';
import { View, Text } from 'react-native';

// Import screens
import LoginScreen from './src/screens/LoginScreen';
import SignupScreen from './src/screens/SignupScreen';
import ProfileSetupScreen from './src/screens/ProfileSetupScreen';
import HomeScreen from './src/screens/HomeScreen';
import CameraScreen from './src/screens/CameraScreen';
import HistoryScreen from './src/screens/HistoryScreen';
import AvatarScreen from './src/screens/AvatarScreen';
import OnboardingScreen from './src/screens/OnboardingScreen';
import ExerciseInstructionsScreen from './src/screens/ExerciseInstructionsScreen';
import LevelProgressScreen from './src/screens/LevelProgressScreen';
import ExerciseLibraryScreen from './src/screens/ExerciseLibraryScreen';

import PrivacyPolicyScreen from './src/screens/PrivacyPolicyScreen';

import TermsOfServiceScreen from './src/screens/TermsOfServiceScreen';
import DataUsageScreen from './src/screens/DataUsageScreen';

export type ScreenType = 'Login' | 'Signup' | 'ProfileSetup' | 'Home' | 'Camera' | 'History' | 'Avatar' | 'Onboarding' | 'ExerciseInstructions' | 'LevelProgress' | 'ExerciseLibrary' | 'PrivacyPolicy' | 'TermsOfService' | 'AboutUs' | 'DataUsage';

export interface CameraScreenParams {
  exerciseId?: string;
  exerciseName?: string;
  targetSets?: number;
  targetReps?: string;
  fromPlan?: boolean;
}

export interface NavigationParams {
  Camera?: CameraScreenParams;
  ExerciseInstructions?: CameraScreenParams;
}


function AppContent() {
  const { isAuthenticated, user } = useSelector((state: RootState) => state.auth);
  const [currentScreen, setCurrentScreen] = useState<ScreenType>('Login');
  const navigationParamsRef = useRef<NavigationParams>({});
  const [checkingOnboarding, setCheckingOnboarding] = useState(true);
  const [checkingAuth, setCheckingAuth] = useState(true);

  // Check onboarding status on mount
  useEffect(() => {
    checkOnboarding();
  }, []);

  const checkOnboarding = async () => {
    try {
      const value = await AsyncStorage.getItem('@onboarding_complete');
      if (value !== 'true') {
        setCurrentScreen('Onboarding');
      }
    } catch (e) {
      console.error('Error checking onboarding:', e);
    } finally {
      setCheckingOnboarding(false);
    }
  };

  const handleOnboardingComplete = async () => {
    try {
      await AsyncStorage.setItem('@onboarding_complete', 'true');
      setCurrentScreen('Login');
    } catch (e) {
      console.error('Error saving onboarding status:', e);
    }
  };

  // Auth state listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      try {
        if (firebaseUser) {
          const userProfile = await authService.getUserProfile(firebaseUser.uid);
          store.dispatch(setUser(userProfile));
        } else {
          store.dispatch(setUser(null));
        }
      } catch (error) {
        console.error('Error in auth state listener:', error);
      } finally {
        setCheckingAuth(false);
      }
    });
    return () => unsubscribe();
  }, []);

  // Navigation Logic - Only run for auth/onboarding, don't override other screens
  useEffect(() => {
    if (checkingOnboarding || checkingAuth) return;
    if (currentScreen === 'Onboarding') return;

    // Don't override these screens - user navigated there manually
    // Don't override these screens - user navigated there manually
    if (currentScreen === 'Camera' || currentScreen === 'History' || currentScreen === 'Avatar' || currentScreen === 'ExerciseInstructions' || currentScreen === 'LevelProgress' || currentScreen === 'ExerciseLibrary' || currentScreen === 'PrivacyPolicy' || currentScreen === 'TermsOfService' || currentScreen === 'AboutUs' || currentScreen === 'DataUsage') {
      return;
    }

    if (isAuthenticated && user) {
      // Check if profile is complete
      if (user.age > 0 && user.weight > 0 && user.height > 0 && user.workoutPlanId) {
        // Profile is complete - only auto-navigate from auth screens
        if (currentScreen === 'Login' || currentScreen === 'Signup' || currentScreen === 'ProfileSetup') {
          setCurrentScreen('Home');
        }
      } else {
        // Profile not complete
        if (currentScreen !== 'ProfileSetup') {
          setCurrentScreen('ProfileSetup');
        }
      }
    } else {
      // Not authenticated
      if (currentScreen !== 'Login' && currentScreen !== 'Signup') {
        setCurrentScreen('Login');
      }
    }
  }, [isAuthenticated, user, checkingOnboarding, checkingAuth]);

  const [history, setHistory] = useState<ScreenType[]>([]);

  // Navigation functions to pass to screens
  const navigation = {
    navigate: (screen: ScreenType, params?: any) => {
      if (params) {
        navigationParamsRef.current = { ...navigationParamsRef.current, [screen]: params };
      }
      setHistory(prev => [...prev, currentScreen]);
      setCurrentScreen(screen);
    },
    goBack: () => {
      if (history.length > 0) {
        const previousScreen = history[history.length - 1];
        setHistory(prev => prev.slice(0, -1));
        setCurrentScreen(previousScreen);
      } else {
        // Fallback if no history (e.g. direct deep link or reset)
        setCurrentScreen('Home');
      }
    },
    get params() {
      return navigationParamsRef.current[currentScreen as keyof NavigationParams];
    },
  };

  // Render current screen
  const renderScreen = () => {
    if (checkingOnboarding || checkingAuth) {
      return (
        <View style={{ flex: 1, backgroundColor: '#0A0A0A', justifyContent: 'center', alignItems: 'center' }}>
          <Text style={{ color: '#6C63FF', fontSize: 24, fontWeight: 'bold' }}>FIZI</Text>
          <Text style={{ color: '#999', marginTop: 10 }}>Loading your workout...</Text>
        </View>
      );
    }

    switch (currentScreen) {
      case 'Login':
        return <LoginScreen navigation={navigation} />;
      case 'Signup':
        return <SignupScreen navigation={navigation} />;
      case 'ProfileSetup':
        return <ProfileSetupScreen navigation={navigation} />;
      case 'Home':
        return <HomeScreen navigation={navigation} />;
      case 'Camera':
        return <CameraScreen navigation={navigation} />;
      case 'History':
        return <HistoryScreen navigation={navigation} />;
      case 'Avatar':
        return <AvatarScreen navigation={navigation} />;
      case 'Onboarding':
        return <OnboardingScreen onComplete={handleOnboardingComplete} />;
      case 'ExerciseInstructions':
        return <ExerciseInstructionsScreen navigation={navigation} />;
      case 'LevelProgress':
        return <LevelProgressScreen navigation={navigation} />;
      case 'ExerciseLibrary':
        return <ExerciseLibraryScreen navigation={navigation} />;
      case 'PrivacyPolicy':
        return <PrivacyPolicyScreen navigation={navigation} />;
      case 'TermsOfService':
        return <TermsOfServiceScreen navigation={navigation} />;
      case 'AboutUs':
        return <AboutUsScreen navigation={navigation} />;
      case 'DataUsage':
        return <DataUsageScreen navigation={navigation} />;
      default:
        return <LoginScreen navigation={navigation} />;
    }
  };

  return (
    <>
      <StatusBar style="light" />
      {renderScreen()}
    </>
  );
}

export default function App() {
  return (
    <Provider store={store}>
      <AppContent />
    </Provider>
  );
}
