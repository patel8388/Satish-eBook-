# GitHub CI/CD Setup Guide - Satish eBook

## Overview

This guide explains how to set up GitHub Actions for automatic APK building, signing, and deployment to Google Play Store.

## What's Included

Two GitHub Actions workflows are configured:

1. **build-apk.yml** - Builds debug and release APKs on every push
2. **deploy-playstore.yml** - Deploys to Google Play Store on version tags

## Prerequisites

1. **GitHub Repository** - Your code on GitHub
2. **Android Keystore** - For signing APKs
3. **Google Play Service Account** (optional) - For Play Store deployment

## Step 1: Create Android Keystore

### Generate Keystore Locally

```bash
keytool -genkey -v -keystore satish-ebook.keystore \
  -keyalg RSA -keysize 2048 -validity 10000 \
  -alias satish-ebook \
  -storepass YOUR_STORE_PASSWORD \
  -keypass YOUR_KEY_PASSWORD \
  -dname "CN=Satish eBook, O=Your Company, L=Your City, ST=Your State, C=Your Country"
```

**Keep this file safe!** You'll need it for future updates.

### Convert Keystore to Base64

```bash
# macOS/Linux
base64 satish-ebook.keystore | pbcopy

# Linux (without pbcopy)
base64 satish-ebook.keystore > keystore.txt
cat keystore.txt
```

**Windows (PowerShell):**
```powershell
$keystore = [Convert]::ToBase64String([IO.File]::ReadAllBytes("satish-ebook.keystore"))
$keystore | Set-Clipboard
```

## Step 2: Add GitHub Secrets

1. Go to your GitHub repository
2. Click **Settings** → **Secrets and variables** → **Actions**
3. Click **New repository secret**

Add these secrets:

| Secret Name | Value | Example |
|---|---|---|
| `KEYSTORE_BASE64` | Base64 encoded keystore file | (paste from above) |
| `KEYSTORE_ALIAS` | Alias used in keystore | `satish-ebook` |
| `KEYSTORE_PASSWORD` | Keystore password | `your_store_password` |
| `KEY_PASSWORD` | Key password | `your_key_password` |

### Optional: For Google Play Store Deployment

| Secret Name | Value |
|---|---|
| `PLAY_STORE_SERVICE_ACCOUNT_JSON` | Service account JSON (see below) |

## Step 3: Set Up Google Play Service Account (Optional)

### Create Service Account

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable Google Play Android Developer API
4. Go to **Service Accounts** → **Create Service Account**
5. Fill in service account details
6. Grant these roles:
   - Editor
   - Service Account User
7. Create JSON key
8. Download the JSON file

### Convert Service Account JSON to Secret

```bash
# macOS/Linux
base64 service-account.json | pbcopy

# Linux
base64 service-account.json > sa.txt
cat sa.txt
```

Add as `PLAY_STORE_SERVICE_ACCOUNT_JSON` secret in GitHub.

## Step 4: Push to GitHub

```bash
git init
git add .
git commit -m "Initial commit: Satish eBook with CI/CD"
git branch -M main
git remote add origin https://github.com/yourusername/satish-ebook.git
git push -u origin main
```

## Workflows

### Build APK Workflow

**Triggers:**
- Push to `main` or `develop` branch
- Pull requests to `main`
- Manual trigger via GitHub Actions UI

**What it does:**
1. Installs Node.js and Android SDK
2. Runs tests
3. Builds web assets
4. Builds debug APK
5. Builds release APK
6. Signs release APK (if secrets configured)
7. Uploads artifacts
8. Comments on PRs with build status

**Artifacts:**
- `satish-ebook-debug` - Debug APK
- `satish-ebook-release` - Signed release APK

### Deploy to Play Store Workflow

**Triggers:**
- Push with version tag (e.g., `v1.0.0`)
- Manual trigger with track selection

**What it does:**
1. Builds release bundle (.aab)
2. Signs bundle
3. Uploads to Google Play Store
4. Creates deployment record

**Supported Tracks:**
- `internal` - Internal testing
- `alpha` - Alpha testing
- `beta` - Beta testing
- `production` - Production release

## Usage

### Automatic Builds

Every push to `main` or `develop` automatically builds APKs:

```bash
git push origin main
```

Check **Actions** tab to see build progress.

### Download APKs

1. Go to **Actions** tab
2. Click the latest workflow run
3. Scroll to **Artifacts** section
4. Download APK files

### Create Release

Tag a commit to trigger Play Store deployment:

```bash
# Create version tag
git tag -a v1.0.0 -m "Release version 1.0.0"
git push origin v1.0.0
```

This automatically:
1. Builds release APK
2. Creates GitHub Release
3. Uploads to Play Store (if configured)

### Manual Deployment

1. Go to **Actions** tab
2. Click **Deploy to Google Play Store**
3. Click **Run workflow**
4. Select track (internal/alpha/beta/production)
5. Click **Run workflow**

## Monitoring Builds

### View Build Logs

1. Go to **Actions** tab
2. Click workflow name
3. Click job name to see detailed logs
4. Check for errors or warnings

### Build Status Badge

Add to README.md:

```markdown
[![Build APK](https://github.com/yourusername/satish-ebook/actions/workflows/build-apk.yml/badge.svg)](https://github.com/yourusername/satish-ebook/actions/workflows/build-apk.yml)
```

### Notifications

GitHub sends notifications for:
- Build failures
- Deployment completions
- PR comments with build status

## Troubleshooting

### Build Fails: "Keystore not found"

**Solution:** Ensure `KEYSTORE_BASE64` secret is set correctly:
```bash
# Verify base64 encoding
base64 satish-ebook.keystore | head -c 50
```

### Build Fails: "Invalid keystore format"

**Solution:** Keystore might be corrupted. Regenerate:
```bash
keytool -genkey -v -keystore satish-ebook.keystore ...
```

### APK won't install

**Solution:** Check minimum API level in `build.gradle`:
```gradle
minSdk 24  // Android 7.0+
```

### Play Store upload fails

**Solution:** 
1. Verify service account has Play Store access
2. Check package name matches: `com.satisebook.app`
3. Ensure version code is higher than previous release

### Tests fail in CI

**Solution:** Run tests locally first:
```bash
pnpm test
```

## Best Practices

1. **Always test locally** before pushing
2. **Use semantic versioning** for tags (v1.0.0, v1.0.1)
3. **Keep secrets secure** - never commit keystore files
4. **Monitor build logs** for warnings
5. **Test on multiple devices** before production release
6. **Use internal track first** for Play Store testing

## Security

### Protect Secrets

- Never commit keystore files
- Never share passwords
- Rotate keys periodically
- Use GitHub's secret masking
- Limit secret access to necessary workflows

### Keystore Backup

```bash
# Backup keystore securely
cp satish-ebook.keystore ~/secure-backup/
chmod 600 ~/secure-backup/satish-ebook.keystore
```

## Advanced Configuration

### Custom Build Variants

Edit `android/app/build.gradle`:

```gradle
buildTypes {
    debug {
        debuggable true
        minifyEnabled false
    }
    release {
        debuggable false
        minifyEnabled true
        proguardFiles getDefaultProguardFile('proguard-android-optimize.txt'), 'proguard-rules.pro'
    }
}
```

### Conditional Deployment

Modify `deploy-playstore.yml` to deploy only on main branch:

```yaml
if: github.ref == 'refs/heads/main' && startsWith(github.ref, 'refs/tags/')
```

### Custom Notifications

Add Slack notifications:

```yaml
- name: Slack Notification
  uses: slackapi/slack-github-action@v1
  with:
    payload: |
      {
        "text": "APK Build Completed",
        "blocks": [
          {
            "type": "section",
            "text": {
              "type": "mrkdwn",
              "text": "✅ Build ${{ job.status }}\n${{ github.repository }}"
            }
          }
        ]
      }
```

## Reference

### Workflow Syntax

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Workflow Syntax](https://docs.github.com/en/actions/using-workflows/workflow-syntax-for-github-actions)

### Android Gradle

- [Android Gradle Plugin](https://developer.android.com/studio/releases/gradle-plugin)
- [Build Configuration](https://developer.android.com/studio/build)

### Google Play

- [Play Console Help](https://support.google.com/googleplay/android-developer)
- [App Signing](https://support.google.com/googleplay/android-developer/answer/7384423)

## Checklist

- [ ] GitHub repository created
- [ ] Keystore generated locally
- [ ] Keystore converted to Base64
- [ ] GitHub secrets added
- [ ] Workflows file committed
- [ ] First build triggered
- [ ] APK downloaded and tested
- [ ] Version tag created
- [ ] Release created
- [ ] Play Store service account configured (optional)
- [ ] Play Store deployment tested (optional)

## Support

For issues:
1. Check workflow logs in GitHub Actions
2. Review error messages
3. Verify secrets are set correctly
4. Test build locally
5. Check Android documentation

## Next Steps

1. **Monitor first build** - Go to Actions tab
2. **Download and test APK** - Install on device
3. **Create releases** - Tag commits for Play Store
4. **Set up notifications** - Add Slack/email alerts
5. **Optimize builds** - Reduce APK size, improve speed
