# Development Build Setup (Alternative to Expo Go)

## Option 1: EAS Build (Cloud Build - Recommended)

### Prerequisites
1. Install EAS CLI:
```bash
npm install -g eas-cli
```

2. Login to Expo:
```bash
eas login
```

### Build for iOS (requires Apple Developer account):
```bash
eas build --profile development --platform ios
```

### Build for Android:
```bash
eas build --profile development --platform android
```

### After build completes:
1. Download the `.ipa` (iOS) or `.apk` (Android) file
2. Install on your device:
   - **iOS**: Use TestFlight or install via Xcode
   - **Android**: Transfer APK to device and install

### Run development server:
```bash
npx expo start --dev-client
```

---

## Option 2: Local Development Build

### For Android (Linux/Windows/macOS):

1. **Install Android Studio** and set up Android SDK

2. **Create local build:**
```bash
npx expo install expo-dev-client
npx expo prebuild
```

3. **Run on Android Emulator:**
```bash
# Start emulator first from Android Studio
npx expo run:android
```

4. **Or build APK:**
```bash
cd android
./gradlew assembleDebug
# APK will be in android/app/build/outputs/apk/debug/
```

---

## Option 3: Use Android Emulator (Linux)

### Setup:
1. Install Android Studio
2. Create an Android Virtual Device (AVD)
3. Start the emulator

### Run:
```bash
npx expo start
# Then press 'a' to open on Android emulator
```

---

## Option 4: Web Browser (Quick Testing)

Test your app in a web browser:
```bash
npx expo start --web
```

Then open `http://localhost:19006` in your browser.

---

## Quick Comparison

| Method | Speed | Device Required | Setup Complexity |
|--------|-------|------------------|------------------|
| Expo Go | ⚡⚡⚡ | Physical device | ⭐ Easy |
| iOS Simulator | ⚡⚡⚡ | macOS only | ⭐⭐ Medium |
| Android Emulator | ⚡⚡ | None | ⭐⭐⭐ Complex |
| EAS Build | ⚡⚡ | Physical device | ⭐⭐ Medium |
| Local Build | ⚡ | None | ⭐⭐⭐ Complex |
| Web | ⚡⚡⚡ | None | ⭐ Easy |

