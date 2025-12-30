# Web Troubleshooting Guide

## Issue: Webpage doesn't load after bundling

### Quick Fix Steps:

1. **Stop the current server** (Ctrl+C in terminal)

2. **Clear all caches:**
```bash
rm -rf .expo node_modules/.cache .expo-shared
npx expo start --web --clear
```

3. **Check the browser console:**
   - Open browser DevTools (F12)
   - Go to Console tab
   - Look for any red error messages
   - Common errors:
     - `react-native-screens` not compatible with web
     - Missing dependencies
     - Module not found errors

4. **Try accessing different URLs:**
   - `http://localhost:19006` (default)
   - `http://localhost:8081` (alternative)
   - Check terminal output for the actual URL

5. **If react-native-screens is the issue:**
   The app should work on web, but if you see errors about screens, we can create a web-specific navigation setup.

### Alternative: Use Android Emulator Instead

Since you're on Linux, Android Emulator is a better option for mobile testing:

1. Install Android Studio
2. Create an AVD (Android Virtual Device)
3. Start emulator
4. Run: `npx expo start` then press `a`

### Check Current Status:

Run this to see what's happening:
```bash
npx expo start --web
```

Then:
- Check terminal for the exact URL
- Open that URL in browser
- Check browser console (F12) for errors
- Share any error messages you see

