import React, { useEffect, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { Provider, useSelector } from 'react-redux';
import { onAuthStateChanged } from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { store, RootState } from './src/store';
import { auth } from './src/services/firebaseConfig';
import { authService } from './src/services/authService';
import { setUser } from './src/store/slices/authSlice';

// Import screens
import LoginScreen from './src/screens/LoginScreen';
import SignupScreen from './src/screens/SignupScreen';
import ProfileSetupScreen from './src/screens/ProfileSetupScreen';
import HomeScreen from './src/screens/HomeScreen';
import CameraScreen from './src/screens/CameraScreen';
import HistoryScreen from './src/screens/HistoryScreen';
import AvatarScreen from './src/screens/AvatarScreen';
import OnboardingScreen from './src/screens/OnboardingScreen';

export type ScreenType = 'Login' | 'Signup' | 'ProfileSetup' | 'Home' | 'Camera' | 'History' | 'Avatar' | 'Onboarding';

function AppContent() {
  const { isAuthenticated, user } = useSelector((state: RootState) => state.auth);
  const [currentScreen, setCurrentScreen] = useState<ScreenType>('Login');
  const [checkingOnboarding, setCheckingOnboarding] = useState(true);

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
      if (firebaseUser) {
        const userProfile = await authService.getUserProfile(firebaseUser.uid);
        store.dispatch(setUser(userProfile));
      } else {
        store.dispatch(setUser(null));
      }
    });
    return () => unsubscribe();
  }, []);

  // Navigation Logic
  useEffect(() => {
    if (checkingOnboarding) return;
    if (currentScreen === 'Onboarding') return; // Stay on onboarding if not completed yet

    if (isAuthenticated && user) {
      if (user.age > 0 && user.weight > 0 && user.height > 0) {
        // Profile is complete
        if (currentScreen === 'Login' || currentScreen === 'Signup' || currentScreen === 'ProfileSetup') {
          setCurrentScreen('Home');
        }
      } else {
        // Profile not complete, navigate to setup
        setCurrentScreen('ProfileSetup');
      }
    } else {
      // Not authenticated
      if (currentScreen !== 'Login' && currentScreen !== 'Signup') {
        setCurrentScreen('Login');
      }
    }
  }, [isAuthenticated, user, checkingOnboarding, currentScreen]);

  // Navigation functions to pass to screens
  const navigation = {
    navigate: (screen: ScreenType) => setCurrentScreen(screen),
  };

  // Render current screen
  const renderScreen = () => {
    if (checkingOnboarding) {
      return null; // Or a loading spinner
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

