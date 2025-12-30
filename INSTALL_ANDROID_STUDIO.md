# How to Install Android Studio on Linux

## Method 1: Using Snap (Easiest - Recommended)

```bash
sudo snap install android-studio --classic
```

After installation, launch Android Studio from the applications menu or run:
```bash
android-studio
```

---

## Method 2: Download and Install Manually

### Step 1: Download Android Studio

1. Go to: https://developer.android.com/studio
2. Click "Download Android Studio"
3. Accept the terms and download the Linux `.tar.gz` file

Or download directly:
```bash
cd ~/Downloads
wget https://redirector.gvt1.com/edgedl/android/studio/ide-zips/2023.3.1.20/android-studio-2023.3.1.20-linux.tar.gz
```

### Step 2: Extract and Install

```bash
# Extract to /opt (or your preferred location)
sudo tar -xzf ~/Downloads/android-studio-*.tar.gz -C /opt/

# Create a symlink (optional, for easier access)
sudo ln -s /opt/android-studio/bin/studio.sh /usr/local/bin/android-studio
```

### Step 3: Launch Android Studio

```bash
/opt/android-studio/bin/studio.sh
```

Or if you created the symlink:
```bash
android-studio
```

---

## Method 3: Using Package Manager (Ubuntu/Debian)

```bash
# Add repository
sudo add-apt-repository ppa:maarten-fonville/android-studio
sudo apt update

# Install
sudo apt install android-studio
```

---

## After Installation: First-Time Setup

1. **Launch Android Studio** (from applications menu or terminal)

2. **Setup Wizard will appear:**
   - Choose "Standard" installation
   - Accept license agreements
   - Wait for SDK components to download (this takes 10-20 minutes)

3. **Install Android SDK:**
   - Go to **Tools → SDK Manager**
   - In **SDK Platforms** tab, check:
     - ✅ Android 13.0 (Tiramisu) or latest
     - ✅ Android SDK Platform
   - In **SDK Tools** tab, check:
     - ✅ Android SDK Build-Tools
     - ✅ Android Emulator
     - ✅ Android SDK Platform-Tools
     - ✅ Intel x86 Emulator Accelerator (HAXM installer) - if available
   - Click **Apply** and wait for installation

4. **Create an Android Virtual Device (AVD):**
   - Go to **Tools → Device Manager**
   - Click **Create Device**
   - Select a device (e.g., Pixel 5)
   - Select a system image (e.g., Android 13.0)
   - Click **Finish**

5. **Verify Installation:**
   ```bash
   # Check if SDK is installed
   ls ~/Android/Sdk
   
   # Check if adb is available
   ~/Android/Sdk/platform-tools/adb version
   ```

---

## Set Environment Variables

After installation, add to your `~/.bashrc`:

```bash
export ANDROID_HOME=$HOME/Android/Sdk
export PATH=$PATH:$ANDROID_HOME/platform-tools:$ANDROID_HOME/tools:$ANDROID_HOME/emulator
```

Then reload:
```bash
source ~/.bashrc
```

---

## System Requirements

- **RAM:** At least 4GB (8GB recommended)
- **Disk Space:** ~3GB for Android Studio + ~2GB for Android SDK
- **OS:** Ubuntu 18.04+, Debian 10+, or similar Linux distribution

---

## Troubleshooting

### If Android Studio won't start:
```bash
# Check Java version (Android Studio requires Java 17+)
java -version

# Install OpenJDK 17 if needed
sudo apt install openjdk-17-jdk
```

### If emulator is slow:
- Enable hardware acceleration (KVM)
- Check: `egrep -c '(vmx|svm)' /proc/cpuinfo` (should be > 0)
- Install KVM: `sudo apt install qemu-kvm libvirt-daemon-system`

### If you get permission errors:
```bash
sudo chown -R $USER:$USER ~/Android
```

---

## Quick Start After Installation

1. **Start Android Studio**
2. **Open Device Manager** (Tools → Device Manager)
3. **Start an emulator** (click Play button)
4. **In your project terminal:**
   ```bash
   cd ~/Desktop/authenticate_app
   source ~/.bashrc  # If not already loaded
   npx expo start
   # Then press 'a' when prompted
   ```

---

## Alternative: Use Web Version Instead

If Android Studio setup is too complex, you can test your app in the browser:

```bash
npx expo start --web
```

Then open `http://localhost:19006` in your browser.


