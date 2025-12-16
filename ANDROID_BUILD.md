# Satish eBook - Android APK Build Guide

## Overview

This guide provides comprehensive instructions for building and deploying the Satish eBook application as a native Android APK that can be distributed through app stores or directly to users.

## Prerequisites

### Required Software

1. **Node.js & npm/pnpm**
   - Version 22.x or higher
   - Already installed in development environment

2. **Java Development Kit (JDK)**
   - Version 11 or higher
   - Required for Android build tools
   - Download: https://www.oracle.com/java/technologies/downloads/

3. **Android SDK**
   - Android SDK Tools
   - Android SDK Platform (API level 31+)
   - Android Build Tools
   - Download: https://developer.android.com/studio

4. **Gradle**
   - Version 7.0 or higher
   - Usually included with Android SDK

5. **Capacitor CLI**
   - For converting web app to native Android
   - Install: `npm install -g @capacitor/cli`

### System Requirements

- **OS**: Windows, macOS, or Linux
- **RAM**: Minimum 8GB (16GB recommended)
- **Disk Space**: 20GB for Android SDK and build tools
- **Internet**: Required for downloading dependencies

## Setup Instructions

### Step 1: Install Android Development Tools

#### On macOS (using Homebrew)
```bash
brew install java
brew install android-sdk
brew install gradle
```

#### On Linux (Ubuntu/Debian)
```bash
sudo apt-get update
sudo apt-get install default-jdk
sudo apt-get install android-sdk
sudo apt-get install gradle
```

#### On Windows
1. Download and install JDK from Oracle
2. Download Android Studio from https://developer.android.com/studio
3. Run Android Studio and install required SDK components
4. Download and install Gradle from https://gradle.org/releases/

### Step 2: Configure Environment Variables

#### On macOS/Linux
Add to `~/.bashrc` or `~/.zshrc`:
```bash
export JAVA_HOME=/path/to/jdk
export ANDROID_SDK_ROOT=/path/to/android/sdk
export ANDROID_HOME=$ANDROID_SDK_ROOT
export PATH=$PATH:$ANDROID_SDK_ROOT/tools:$ANDROID_SDK_ROOT/platform-tools
export GRADLE_HOME=/path/to/gradle
export PATH=$PATH:$GRADLE_HOME/bin
```

#### On Windows
1. Right-click "This PC" → Properties
2. Click "Advanced system settings"
3. Click "Environment Variables"
4. Add new variables:
   - `JAVA_HOME`: Path to JDK installation
   - `ANDROID_SDK_ROOT`: Path to Android SDK
   - `GRADLE_HOME`: Path to Gradle installation
5. Add to PATH: `%ANDROID_SDK_ROOT%\tools;%ANDROID_SDK_ROOT%\platform-tools;%GRADLE_HOME%\bin`

### Step 3: Install Capacitor

```bash
cd /home/ubuntu/satish_ebook
npm install -g @capacitor/cli
npm install @capacitor/core @capacitor/android
```

### Step 4: Initialize Capacitor Project

```bash
npx cap init satish-ebook "Satish eBook" --web-dir=dist
```

This creates a `capacitor.config.ts` file with your app configuration.

## Building the APK

### Step 1: Build Web Assets

```bash
cd /home/ubuntu/satish_ebook
pnpm build
```

This creates optimized production builds in the `dist/` directory.

### Step 2: Add Android Platform

```bash
npx cap add android
```

This creates an `android/` directory with the native Android project.

### Step 3: Sync Web Assets

```bash
npx cap sync android
```

This copies the built web assets to the Android project.

### Step 4: Build APK

#### Debug APK (for testing)
```bash
cd android
./gradlew assembleDebug
```

The debug APK will be located at:
```
android/app/build/outputs/apk/debug/app-debug.apk
```

#### Release APK (for production)

First, create a keystore file for signing:
```bash
keytool -genkey -v -keystore satish-ebook.keystore -keyalg RSA -keysize 2048 -validity 10000 -alias satish-ebook
```

Then build the release APK:
```bash
cd android
./gradlew assembleRelease \
  -Pandroid.injected.signing.store.file=../satish-ebook.keystore \
  -Pandroid.injected.signing.store.password=YOUR_PASSWORD \
  -Pandroid.injected.signing.key.alias=satish-ebook \
  -Pandroid.injected.signing.key.password=YOUR_PASSWORD
```

The release APK will be located at:
```
android/app/build/outputs/apk/release/app-release.apk
```

### Step 5: Verify APK

Test the APK on an Android device or emulator:

```bash
# Install on connected device
adb install android/app/build/outputs/apk/debug/app-debug.apk

# Or launch emulator first
emulator -avd YourAVDName
adb install android/app/build/outputs/apk/debug/app-debug.apk
```

## APK Configuration

### Update App Icon

1. Prepare icon images:
   - ldpi: 36x36 px
   - mdpi: 48x48 px
   - hdpi: 72x72 px
   - xhdpi: 96x96 px
   - xxhdpi: 144x144 px
   - xxxhdpi: 192x192 px

2. Place icons in: `android/app/src/main/res/mipmap-*/ic_launcher.png`

### Update App Name & Description

Edit `android/app/src/main/AndroidManifest.xml`:
```xml
<application
    android:label="@string/app_name"
    android:icon="@mipmap/ic_launcher"
    android:debuggable="false">
```

Edit `android/app/src/main/res/values/strings.xml`:
```xml
<string name="app_name">Satish eBook</string>
<string name="app_description">Read ebooks in multiple formats</string>
```

### Configure Permissions

Edit `android/app/src/main/AndroidManifest.xml`:
```xml
<uses-permission android:name="android.permission.INTERNET" />
<uses-permission android:name="android.permission.READ_EXTERNAL_STORAGE" />
<uses-permission android:name="android.permission.WRITE_EXTERNAL_STORAGE" />
<uses-permission android:name="android.permission.CAMERA" />
```

## Signing & Distribution

### Create Signed APK

1. Generate keystore (if not already done):
```bash
keytool -genkey -v -keystore satish-ebook.keystore \
  -keyalg RSA -keysize 2048 -validity 10000 \
  -alias satish-ebook
```

2. Sign the APK:
```bash
jarsigner -verbose -sigalg SHA1withRSA -digestalg SHA1 \
  -keystore satish-ebook.keystore \
  android/app/build/outputs/apk/release/app-release.apk \
  satish-ebook
```

3. Verify signature:
```bash
jarsigner -verify -verbose -certs \
  android/app/build/outputs/apk/release/app-release.apk
```

### Upload to Google Play Store

1. Create Google Play Developer account (one-time fee: $25)
2. Create new app in Google Play Console
3. Fill in app details:
   - Title: "Satish eBook"
   - Description
   - Screenshots (minimum 2)
   - Icon (512x512 px)
   - Feature graphic (1024x500 px)
4. Upload signed APK
5. Set pricing and distribution
6. Submit for review (typically 2-4 hours)

### Direct Distribution

To distribute APK directly:

1. Host APK on a web server
2. Create download link
3. Users can download and install:
   ```bash
   adb install satish-ebook.apk
   ```

Or provide QR code linking to download URL.

## Testing

### Test on Emulator

1. Create Android Virtual Device (AVD):
```bash
avdmanager create avd -n "Satish eBook" -k "system-images;android-31;google_apis;x86_64"
```

2. Launch emulator:
```bash
emulator -avd "Satish eBook"
```

3. Install APK:
```bash
adb install app-debug.apk
```

### Test on Physical Device

1. Enable Developer Mode:
   - Go to Settings → About Phone
   - Tap "Build Number" 7 times
   - Go to Settings → Developer Options
   - Enable "USB Debugging"

2. Connect device via USB

3. Install APK:
```bash
adb install app-release.apk
```

### Test Checklist

- [ ] App launches without crashes
- [ ] Login works correctly
- [ ] File upload functions properly
- [ ] PDF rendering works
- [ ] EPUB rendering works
- [ ] TXT file display works
- [ ] Navigation between pages works
- [ ] Font size adjustment works
- [ ] Theme switching works
- [ ] Bookmarks save correctly
- [ ] Reading progress tracks
- [ ] Download functionality works
- [ ] Logout functions properly
- [ ] App handles network errors gracefully

## Troubleshooting

### Build Errors

**Error: "JAVA_HOME not set"**
- Solution: Set JAVA_HOME environment variable to JDK installation path

**Error: "Android SDK not found"**
- Solution: Set ANDROID_SDK_ROOT environment variable

**Error: "Gradle build failed"**
- Solution: Run `./gradlew clean` then rebuild

### Runtime Errors

**App crashes on startup**
- Check logcat: `adb logcat | grep satish`
- Verify all permissions are set in AndroidManifest.xml
- Check that web assets are properly built

**File upload not working**
- Verify WRITE_EXTERNAL_STORAGE permission
- Check S3 bucket configuration
- Verify network connectivity

**PDF not rendering**
- Ensure pdfjs-dist is properly bundled
- Check browser console for errors: `adb logcat`
- Verify PDF file is not corrupted

## Performance Optimization

### Reduce APK Size

1. Enable ProGuard/R8:
```gradle
buildTypes {
    release {
        minifyEnabled true
        proguardFiles getDefaultProguardFile('proguard-android-optimize.txt'), 'proguard-rules.pro'
    }
}
```

2. Remove unused resources:
```gradle
android {
    packagingOptions {
        exclude 'META-INF/proguard/androidx-*.pro'
    }
}
```

### Improve Performance

1. Enable multi-dex if needed:
```gradle
android {
    defaultConfig {
        multiDexEnabled true
    }
}
```

2. Optimize images and assets
3. Use lazy loading for large files
4. Implement caching strategies

## Continuous Integration

### GitHub Actions Example

Create `.github/workflows/android-build.yml`:
```yaml
name: Build Android APK

on: [push, pull_request]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-java@v2
        with:
          java-version: '11'
      - uses: actions/setup-node@v2
        with:
          node-version: '22'
      - run: pnpm install
      - run: pnpm build
      - run: npx cap sync android
      - run: cd android && ./gradlew assembleRelease
      - uses: actions/upload-artifact@v2
        with:
          name: app-release.apk
          path: android/app/build/outputs/apk/release/app-release.apk
```

## Maintenance

### Update Dependencies

```bash
npm update @capacitor/core @capacitor/android
npx cap update android
```

### Monitor Crashes

Use Firebase Crashlytics or similar service to monitor production crashes:

```bash
npm install @capacitor/firebase-crashlytics
npx cap sync android
```

## Support & Resources

- Capacitor Documentation: https://capacitorjs.com/docs
- Android Developer Guide: https://developer.android.com/guide
- Google Play Console: https://play.google.com/console
- Android Studio: https://developer.android.com/studio

## Checklist for Release

- [ ] All tests passing
- [ ] Code reviewed
- [ ] Version number updated
- [ ] Changelog updated
- [ ] APK built and tested
- [ ] Signed APK created
- [ ] Privacy policy prepared
- [ ] Screenshots prepared
- [ ] App description written
- [ ] Permissions reviewed
- [ ] Performance optimized
- [ ] Crash testing completed
- [ ] Ready for submission
