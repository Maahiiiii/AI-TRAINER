# AI Fitness Trainer

An AI-powered mobile fitness application that provides real-time workout analysis using pose detection, form correction feedback, and progress tracking with an evolving avatar system.

## Features

- 📹 **Real-time Pose Detection** - Uses TensorFlow.js and MoveNet for accurate body tracking
- ✅ **Form Validation** - Instant feedback on exercise form and technique
- 🎯 **Rep Counting** - Automatic counting with form quality scoring
- 🔊 **Audio Feedback** - Voice guidance and corrections during workouts
- 📊 **Progress Tracking** - Detailed analytics and workout history
- 👤 **Transformation Avatar** - Visual representation of your fitness journey
- 🔥 **Multiple Exercises** - Push-ups, squats, planks, bicep curls, and more

## Tech Stack

- **Frontend**: React Native (Expo)
- **Language**: TypeScript
- **Backend**: Firebase (Auth, Firestore, Storage)
- **ML**: TensorFlow.js with MoveNet
- **State Management**: Redux Toolkit
- **Navigation**: React Navigation

## Current Setup Status

✅ **Project is configured and ready to run!**

- ✅ All dependencies installed (with legacy peer deps support)
- ✅ expo-dev-client configured for native development
- ✅ Native Android project files generated (`android/` directory)
- ✅ Development server can run on web and mobile (Expo Go)
- ⏳ Full pose detection requires native build (see "Enabling Real-Time Pose Detection" section)

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- Expo CLI
- Firebase account

### Installation

1. Clone the repository
```bash
cd AI-TRAINER-main
```

2. Install dependencies
```bash
npm install --legacy-peer-deps
```
**Note:** Use `--legacy-peer-deps` flag to resolve peer dependency conflicts with TensorFlow.js and Firebase packages.

3. Configure Firebase
   - Follow instructions in `FIREBASE_SETUP.md`
   - Update `src/services/firebaseConfig.ts` with your credentials

4. Start the development server
```bash
npm start
# Or with specific port if 8081 is in use:
npx expo start --port 8082
# Or with LAN mode for better mobile connectivity:
npx expo start --lan
```

5. Run on your device
   - **Option A: Expo Go (Quick Start - Limited Features)**
     - Download Expo Go app on your phone ([Android](https://play.google.com/store/apps/details?id=host.exp.exponent) | [iOS](https://apps.apple.com/app/expo-go/id982107779))
     - Scan the QR code from the terminal, or manually enter the `exp://` URL shown in terminal
     - **Note:** Pose detection features may be limited in Expo Go
   
   - **Option B: Development Build (Full Features)**
     - Follow the "Enabling Real-Time Pose Detection" section below
     - Build and install the native app on your device

## Project Structure

```
ai-fitness-trainer/
├── src/
│   ├── components/      # Reusable UI components (PoseOverlay)
│   ├── config/          # App configuration and feature flags
│   ├── screens/         # Screen components
│   ├── store/           # Redux store and slices
│   ├── services/        # Firebase, pose detection, workout services
│   ├── utils/           # Helper functions (angle calculation, etc.)
│   ├── hooks/           # Custom React hooks
│   ├── models/          # Exercise definitions
│   └── types/           # TypeScript type definitions
├── assets/              # Images, fonts, icons
├── App.tsx              # Root component
└── package.json
```

## Available Scripts

- `npm start` - Start Expo development server (default port 8081)
- `npx expo start --lan` - Start with LAN mode for better mobile connectivity
- `npx expo start --tunnel` - Start with tunnel mode (works across networks)
- `npx expo start --port 8082` - Start on alternative port if 8081 is in use
- `npm run android` - Run on Android emulator/device
- `npm run ios` - Run on iOS simulator/device (Mac only)
- `npm run web` - Run in web browser

### Troubleshooting

**Port Already in Use:**
If port 8081 is already in use, Expo will prompt you to use another port. You can also specify it manually:
```bash
npx expo start --port 8082
```

**QR Code Not Showing:**
- Ensure your phone and computer are on the same Wi-Fi network (for LAN mode)
- Use `--tunnel` mode if networks are different: `npx expo start --tunnel`
- Manually enter the `exp://` URL shown in terminal into Expo Go app

## Development Roadmap

See [implementation_plan.md](./implementation_plan.md) for detailed sprint planning.

### Sprint Progress

- [x] Sprint 0: Project Setup & Infrastructure
- [x] Sprint 1: Authentication & User Profile
- [x] Sprint 2: Camera & Pose Detection Foundation
- [x] Sprint 3: Workout Analysis Engine (logic ready)
- [x] Sprint 4: Real-Time Feedback System
- [x] Sprint 5: Performance Tracking & Analytics
- [x] Sprint 6: Transformation Avatar Feature
- [x] Sprint 7: UI/UX Enhancement
- [ ] Sprint 8: Testing & Optimization
- [ ] Sprint 9: Deployment & Launch

## Enabling Real-Time Pose Detection

The app uses TensorFlow.js with MoveNet for pose detection. This requires a **native development build** (Expo Go is not supported).

## Running with Expo Go (Quick Start)

If you just want to check the UI or work on non-native features, you can run the app with Expo Go on your mobile device.

1. **Install Expo Go App**: Download "Expo Go" from Google Play Store or Apple App Store.
2. **Start the Project**:
   ```bash
   npm start
   ```
   Or explicitly for LAN:
   ```bash
   npx expo start --lan
   ```
3. **Connect**:
   - Ensure your phone and computer are on the **same Wi-Fi network**.
   - Scan the **QR Code** displayed in the terminal using the Expo Go app (Android) or Camera app (iOS).
   - The app will load on your device.

**Note on Docker**: You can also run the project using Docker.
1. Update `docker-compose.yml` with your local IP address in `REACT_NATIVE_PACKAGER_HOSTNAME`.
2. Run `docker-compose up`.

### Steps to Enable Native Build (For Full Pose Detection):

1. ✅ Install dev client dependencies:
```bash
npm install expo-dev-client --legacy-peer-deps
```

2. ✅ Generate native project files:
```bash
npx expo prebuild
```
This creates the `android/` directory with native Android project files.

3. Build for your platform:
```bash
# Android (requires Android Studio and emulator/device)
npx expo run:android

# iOS (Mac only)
npx expo run:ios
```

4. Enable pose detection in `src/config/appConfig.ts`:
```typescript
features: {
    enablePoseDetection: true,  // Change from false to true
    enableMockPoseOverlay: false,
}
```

5. Run the app on your device with the development build

### Current Setup Status:
- ✅ Dependencies installed (with --legacy-peer-deps)
- ✅ expo-dev-client installed
- ✅ Native project files generated (android/ directory created)
- ⏳ Ready for Android build when emulator/device is available

## Firebase Setup

1. Create a Firebase project
2. Enable Authentication, Firestore, and Storage
3. Add your web app configuration
4. Update security rules (see FIREBASE_SETUP.md)

## License

MIT

## Contributing

Contributions are welcome! Please open an issue or submit a pull request.

## Support

For questions or issues, please open an issue on GitHub.
