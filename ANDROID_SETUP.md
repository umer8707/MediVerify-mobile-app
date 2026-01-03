# Android Setup Guide

## ✅ Android SDK Found!

Your Android SDK is installed at: `~/Android/Sdk`

## Quick Start

### Option 1: Set environment variables for current session

```bash
export ANDROID_HOME=$HOME/Android/Sdk
export PATH=$PATH:$ANDROID_HOME/platform-tools:$ANDROID_HOME/tools:$ANDROID_HOME/emulator
npx expo start --android
```

### Option 2: Use the setup script

```bash
source setup-android.sh
npx expo start --android
```

### Option 3: Permanent setup (already done)

The environment variables have been added to your `~/.bashrc` file. 

**To apply in current terminal:**
```bash
source ~/.bashrc
```

**Or open a new terminal window**, then run:
```bash
npx expo start --android
```

## Verify Setup

Check if everything is configured:
```bash
echo $ANDROID_HOME
which adb
adb version
```

## Start Android Emulator

1. **Open Android Studio**
2. **Go to Tools → Device Manager**
3. **Click the Play button** next to your virtual device
4. **Wait for emulator to boot**
5. **Run:** `npx expo start` then press `a`

## Troubleshooting

### If you still get "Failed to resolve Android SDK":
1. Make sure Android Studio is installed
2. Verify SDK location: `ls ~/Android/Sdk`
3. Check environment: `echo $ANDROID_HOME`
4. Restart your terminal or run: `source ~/.bashrc`

### If emulator doesn't start:
1. Make sure you have an AVD (Android Virtual Device) created
2. Check: `$ANDROID_HOME/emulator/emulator -list-avds`
3. Start manually: `$ANDROID_HOME/emulator/emulator -avd <AVD_NAME>`

## Alternative: Use Web Version

If Android setup is too complex, you can use the web version:
```bash
npx expo start --web
```

Then open `http://localhost:19006` in your browser.




