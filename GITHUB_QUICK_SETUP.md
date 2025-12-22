# GitHub CI/CD Quick Setup - 5 Minutes

## TL;DR - Fast Setup

### 1. Generate Keystore (1 minute)

```bash
keytool -genkey -v -keystore satish-ebook.keystore \
  -keyalg RSA -keysize 2048 -validity 10000 \
  -alias satish-ebook \
  -storepass MyPassword123 \
  -keypass MyPassword123 \
  -dname "CN=Satish eBook"
```

**Save the passwords!** You'll need them.

### 2. Convert to Base64 (30 seconds)

**macOS/Linux:**
```bash
base64 satish-ebook.keystore | pbcopy
```

**Windows PowerShell:**
```powershell
$keystore = [Convert]::ToBase64String([IO.File]::ReadAllBytes("satish-ebook.keystore"))
$keystore | Set-Clipboard
```

### 3. Add GitHub Secrets (2 minutes)

1. Go to GitHub repo → **Settings** → **Secrets and variables** → **Actions**
2. Click **New repository secret**
3. Add these 4 secrets:

```
Name: KEYSTORE_BASE64
Value: (paste from clipboard)

Name: KEYSTORE_ALIAS
Value: satish-ebook

Name: KEYSTORE_PASSWORD
Value: MyPassword123

Name: KEY_PASSWORD
Value: MyPassword123
```

### 4. Push to GitHub (1 minute)

```bash
git add .
git commit -m "Add GitHub CI/CD"
git push origin main
```

### 5. Watch Build (1 minute)

1. Go to GitHub repo → **Actions** tab
2. See build running
3. Wait for completion
4. Download APK from Artifacts

## That's It! 🎉

Your APKs now build automatically on every push.

## Create Release

To create a release:

```bash
git tag v1.0.0
git push origin v1.0.0
```

This automatically:
- Builds release APK
- Creates GitHub Release
- Uploads to Play Store (if configured)

## Download APKs

1. Go to **Actions** tab
2. Click latest workflow
3. Scroll to **Artifacts**
4. Download APK

## Common Issues

| Issue | Solution |
|-------|----------|
| Build fails | Check secrets are set correctly |
| APK won't install | Ensure Android 7.0+ on device |
| Secrets not working | Verify no extra spaces in secret values |
| Can't find base64 output | Use `base64 file.keystore > output.txt` then `cat output.txt` |

## Full Documentation

See `GITHUB_CI_CD_SETUP.md` for detailed guide.

## Need Help?

1. Check GitHub Actions logs
2. Verify secrets in Settings
3. Test build locally: `cd android && ./gradlew assembleDebug`
4. Review detailed guide: `GITHUB_CI_CD_SETUP.md`
