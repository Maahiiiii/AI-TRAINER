import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, setPersistence, browserLocalPersistence } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getAnalytics } from 'firebase/analytics';

// TODO: Replace with your Firebase config
// Get this from Firebase Console > Project Settings > General > Your apps
const firebaseConfig = {
    apiKey: "AIzaSyDCquX8QEQbXd5_bn7K221BMSdeLn0SrGA",
    authDomain: "advi-fc220.firebaseapp.com",
    projectId: "advi-fc220",
    storageBucket: "advi-fc220.firebasestorage.app",
    messagingSenderId: "1057242418550",
    appId: "1:1057242418550:web:37b5a9f27d68c07469be57",
    measurementId: "G-69V53L1LJF"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Auth
export const auth = getAuth(app);

// Enable persistence (works with AsyncStorage polyfill in React Native)
setPersistence(auth, browserLocalPersistence).catch((error) => {
    console.warn('Firebase persistence error:', error);
});
export const googleProvider = new GoogleAuthProvider();
export const db = getFirestore(app);
export const storage = getStorage(app);

// Analytics (optional, only available on web)
let analytics;
if (typeof window !== 'undefined') {
    try {
        analytics = getAnalytics(app);
    } catch (error) {
        console.log('Analytics not available on this platform');
    }
}

export { analytics };
export default app;
