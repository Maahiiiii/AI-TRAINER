# Firebase Configuration

## Setup Instructions

1. Create a Firebase project at https://console.firebase.google.com/
2. Enable the following services:
   - Authentication (Email/Password, Google Sign-In)
   - Cloud Firestore
   - Firebase Storage
   - Firebase Analytics

3. Get your Firebase configuration:
   - Go to Project Settings > General
   - Under "Your apps", click "Add app" and choose Web
   - Copy the configuration object

4. Create a `.env` file in the root directory with your Firebase credentials:
   ```
   FIREBASE_API_KEY=your_api_key
   FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
   FIREBASE_PROJECT_ID=your_project_id
   FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
   FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   FIREBASE_APP_ID=your_app_id
   FIREBASE_MEASUREMENT_ID=your_measurement_id
   ```

5. Update the `firebaseConfig.ts` file with your configuration

## Security Rules

### Firestore Rules
```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users collection
    match /users/{userId} {
      allow read: if request.auth != null && request.auth.uid == userId;
      allow write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Workout sessions
    match /workoutSessions/{sessionId} {
      allow read, write: if request.auth != null && request.auth.uid == resource.data.userId;
    }
    
    // Progress stats
    match /progressStats/{statId} {
      allow read, write: if request.auth != null && request.auth.uid == resource.data.userId;
    }
  }
}
```

### Storage Rules
```
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    // User profile photos
    match /users/{userId}/profile/{fileName} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Transformation photos
    match /users/{userId}/transformations/{fileName} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Workout videos
    match /users/{userId}/workouts/{fileName} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

## Next Steps

After configuring Firebase:
1. Update `.env` with your credentials
2. Run the app to test Firebase connection
3. Enable authentication providers in Firebase Console
