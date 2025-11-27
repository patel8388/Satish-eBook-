# Satish eBook - Project TODO

## Core Features

### Authentication & Login
- [x] Google OAuth login integration
- [ ] Terabox OAuth login integration
- [x] User session management
- [x] Logout functionality

### File Management
- [ ] Upload PDF files to cloud storage
- [ ] Upload EPUB files to cloud storage
- [ ] List user's uploaded files
- [ ] Delete files
- [ ] File metadata storage (name, size, format, upload date)

### Reading Features
- [ ] PDF file rendering and reading
- [ ] EPUB file rendering and reading
- [ ] Reading progress tracking (current page/position)
- [ ] Bookmarks/favorites functionality
- [ ] Reading history

### User Interface
- [x] Landing page with login options
- [x] Dashboard showing user's library
- [x] File upload interface
- [x] Reader interface with controls
- [ ] Settings/profile page

### Cloud Integration
- [ ] Terabox file browser integration
- [ ] File sync with Terabox
- [ ] Google Drive integration (optional)

### APK Build & Deployment
- [ ] Configure React Native / Flutter for Android
- [ ] Build release APK
- [ ] Test on Android devices
- [ ] Prepare APK for distribution

## Technical Implementation

### Backend (Node.js/Express + tRPC)
- [x] User authentication routes
- [ ] File upload endpoint
- [x] File listing endpoint
- [x] Reading progress tracking API
- [x] Bookmarks API
- [ ] Terabox API integration

### Database Schema
- [x] Users table (already exists)
- [x] Books/Files table
- [x] Reading progress table
- [x] Bookmarks table
- [x] User preferences table

### Frontend (React)
- [ ] Authentication UI
- [ ] Dashboard/Library view
- [ ] File upload UI
- [ ] PDF/EPUB reader component
- [ ] Navigation and routing

## Testing & Quality
- [x] Unit tests for API endpoints
- [ ] Integration tests
- [ ] UI/UX testing
- [ ] Cross-browser compatibility
- [ ] Android device testing

## Deployment
- [ ] Create checkpoint before APK build
- [ ] Build and test release APK
- [ ] Prepare deployment documentation
- [ ] Create user guide

---

## Notes
- This is a web-based application that can be wrapped as an Android app using React Native or similar framework
- Terabox integration will use WebDAV or direct API access if available
- Google OAuth will be handled through Manus OAuth system
