#!/bin/bash
# Android SDK Setup Script

export ANDROID_HOME=$HOME/Android/Sdk
export PATH=$PATH:$ANDROID_HOME/platform-tools:$ANDROID_HOME/tools:$ANDROID_HOME/emulator

echo "✅ Android SDK configured:"
echo "   ANDROID_HOME: $ANDROID_HOME"
echo "   ADB location: $(which adb)"

# Verify adb is accessible
if command -v adb &> /dev/null; then
    echo "✅ ADB is accessible"
    adb version
else
    echo "❌ ADB not found. Make sure Android SDK is installed."
fi




