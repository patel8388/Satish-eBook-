# Satish eBook - Complete Setup & Usage Guide

## Overview

Satish eBook is a full-featured web-based ebook reading application with support for multiple file formats, user authentication, cloud storage integration, and comprehensive reading features.

## Features

### Supported File Formats

The application supports reading the following file formats:

- **PDF** - Portable Document Format with full rendering support
- **EPUB** - Electronic Publication format with chapter navigation
- **TXT** - Plain text files with word wrapping
- **DOCX** - Microsoft Word documents (preview mode)
- **HTML** - Web pages and HTML documents
- **MOBI** - Amazon Kindle format (via universal viewer)
- **AZW3** - Amazon KF8 format (via universal viewer)
- **FB2** - FictionBook format (via universal viewer)

### Core Features

**Authentication & User Management**
- Google OAuth login integration
- Secure session management
- User profiles and preferences
- Logout functionality

**File Management**
- Upload ebooks up to 100MB
- Organize books in personal library
- Download books for offline use
- File format detection and validation
- Metadata storage (title, author, file size, format)

**Reading Experience**
- Multi-format universal file viewer
- Adjustable font sizes (12-24px)
- Theme options (Light, Dark, Sepia)
- Page navigation controls
- Reading progress tracking
- Bookmarks and annotations
- Reading history

**Cloud Integration**
- S3 storage for file persistence
- Secure file URLs with access control
- Automatic file organization by user

## Installation & Setup

### Prerequisites

- Node.js 22.x or higher
- pnpm package manager
- MySQL/TiDB database
- AWS S3 bucket (for file storage)

### Installation Steps

1. **Clone or access the project**
   ```bash
   cd /home/ubuntu/satish_ebook
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   ```

3. **Set up database**
   ```bash
   pnpm db:push
   ```
   This command generates and applies database migrations.

4. **Configure environment variables**
   
   The following environment variables are automatically configured by Manus:
   - `DATABASE_URL` - MySQL/TiDB connection string
   - `JWT_SECRET` - Session cookie signing secret
   - `VITE_APP_ID` - OAuth application ID
   - `OAUTH_SERVER_URL` - OAuth backend URL
   - `BUILT_IN_FORGE_API_URL` - Manus API endpoint
   - `BUILT_IN_FORGE_API_KEY` - API authentication key

5. **Start development server**
   ```bash
   pnpm dev
   ```
   The server will start on `http://localhost:3000`

6. **Build for production**
   ```bash
   pnpm build
   ```

7. **Start production server**
   ```bash
   pnpm start
   ```

## Usage Guide

### For Users

**Getting Started**
1. Visit the application homepage
2. Click "Login with Google" to authenticate
3. You'll be redirected to your library

**Uploading Books**
1. Navigate to "My Library"
2. Click the upload area or drag and drop files
3. Select supported ebook files (PDF, EPUB, TXT, DOCX, HTML, MOBI, AZW3, FB2)
4. Files up to 100MB are supported
5. Wait for upload to complete

**Reading Books**
1. Click "Read" on any book in your library
2. Use navigation controls to move between pages
3. Click the settings icon to adjust:
   - Font size (12-24px)
   - Theme (Light, Dark, Sepia)
4. Use the bookmark icon to save your position
5. Download button allows offline access

**Managing Your Library**
- View all uploaded books with metadata
- See file format and size information
- Download books for backup
- Delete books to free up space
- Track reading progress

### For Developers

**Project Structure**

```
satish_ebook/
├── client/                 # React frontend
│   ├── src/
│   │   ├── pages/         # Page components
│   │   ├── components/    # Reusable UI components
│   │   ├── lib/           # Utilities and helpers
│   │   └── App.tsx        # Main app router
│   └── public/            # Static assets
├── server/                # Express backend
│   ├── routers.ts         # tRPC procedure definitions
│   ├── db.ts              # Database queries
│   ├── upload.ts          # File upload logic
│   └── _core/             # Framework internals
├── drizzle/               # Database schema
│   └── schema.ts          # Table definitions
└── storage/               # S3 storage helpers
```

**Adding New Features**

1. **Update Database Schema**
   ```typescript
   // drizzle/schema.ts
   export const newTable = mysqlTable('new_table', {
     id: int('id').autoincrement().primaryKey(),
     // ... columns
   });
   ```

2. **Add Database Queries**
   ```typescript
   // server/db.ts
   export async function getNewData() {
     const db = await getDb();
     return db.select().from(newTable);
   }
   ```

3. **Create tRPC Procedures**
   ```typescript
   // server/routers.ts
   newFeature: router({
     getData: protectedProcedure.query(({ ctx }) => {
       return getNewData();
     }),
   }),
   ```

4. **Build Frontend UI**
   ```typescript
   // client/src/pages/NewFeature.tsx
   const { data } = trpc.newFeature.getData.useQuery();
   ```

5. **Write Tests**
   ```typescript
   // server/newfeature.test.ts
   describe('new feature', () => {
     it('works correctly', async () => {
       // test implementation
     });
   });
   ```

6. **Run Tests**
   ```bash
   pnpm test
   ```

**Testing**

Run all tests:
```bash
pnpm test
```

Run specific test file:
```bash
pnpm test server/books.test.ts
```

Watch mode:
```bash
pnpm test --watch
```

**Database Management**

Generate migrations:
```bash
drizzle-kit generate
```

Apply migrations:
```bash
drizzle-kit migrate
```

Push schema changes:
```bash
pnpm db:push
```

## API Reference

### Authentication

**Login**
- Route: `/api/oauth/callback`
- Method: GET
- Returns: Session cookie

**Logout**
- Procedure: `trpc.auth.logout`
- Method: Mutation
- Returns: `{ success: true }`

**Get Current User**
- Procedure: `trpc.auth.me`
- Method: Query
- Returns: User object

### Books

**List User's Books**
- Procedure: `trpc.books.list`
- Method: Query
- Returns: Array of books

**Get Book Details**
- Procedure: `trpc.books.getById`
- Input: `{ id: number }`
- Returns: Book object

**Upload Book**
- Procedure: `trpc.upload.uploadBook`
- Input: `{ fileName, fileSize, fileContent, title, author?, description? }`
- Returns: `{ success, url }`

### Reading Progress

**Get Reading Progress**
- Procedure: `trpc.readingProgress.get`
- Input: `{ bookId: number }`
- Returns: Progress object or undefined

### Bookmarks

**List Bookmarks**
- Procedure: `trpc.bookmarks.list`
- Input: `{ bookId: number }`
- Returns: Array of bookmarks

## File Format Support Details

### PDF
- Full page rendering with zoom support
- Text selection and copying
- Navigation between pages
- Optimized for large files

### EPUB
- Chapter-based navigation
- Reflowable text layout
- Metadata extraction
- Table of contents support

### TXT
- Plain text rendering
- Word wrapping
- Line number display
- Large file support

### DOCX
- Preview mode (download recommended)
- Metadata display
- Format preservation

### HTML
- Full HTML rendering
- CSS styling support
- Interactive elements
- Link navigation

### MOBI/AZW3/FB2
- Universal viewer fallback
- Basic text rendering
- Navigation support
- Format detection

## Troubleshooting

### File Upload Issues

**Problem**: Upload fails with "Unsupported format"
- **Solution**: Ensure file extension is one of: pdf, epub, txt, docx, html, mobi, azw3, fb2

**Problem**: File too large error
- **Solution**: Maximum file size is 100MB. Compress or split larger files.

**Problem**: Upload hangs
- **Solution**: Check internet connection and S3 bucket permissions

### Reader Issues

**Problem**: PDF not rendering
- **Solution**: Ensure PDF is not corrupted. Try downloading and re-uploading.

**Problem**: EPUB shows blank pages
- **Solution**: Some EPUB formats may not be fully compatible. Try converting to standard EPUB format.

**Problem**: Text appears too small/large
- **Solution**: Use the font size slider in settings (12-24px range)

### Authentication Issues

**Problem**: Login fails
- **Solution**: Clear browser cookies and try again. Check OAuth configuration.

**Problem**: Session expires quickly
- **Solution**: Check JWT_SECRET is properly configured

## Performance Optimization

- Large PDF files are rendered on-demand (page by page)
- EPUB chapters load progressively
- S3 URLs are cached for faster access
- Database queries are optimized with indexes
- Frontend assets are minified and gzipped

## Security Considerations

- All file uploads are validated for format and size
- Files are stored in S3 with secure access control
- User data is isolated by user ID
- Sessions are protected with JWT tokens
- HTTPS is enforced in production
- CORS is properly configured

## Deployment

### Build for Production
```bash
pnpm build
```

### Environment Setup
Ensure all required environment variables are set:
- DATABASE_URL
- JWT_SECRET
- VITE_APP_ID
- OAUTH_SERVER_URL
- BUILT_IN_FORGE_API_URL
- BUILT_IN_FORGE_API_KEY

### Deploy to Server
```bash
pnpm start
```

The application will start on the configured port (default: 3000).

## Support & Feedback

For issues, feature requests, or feedback:
1. Check the troubleshooting section
2. Review the API documentation
3. Check test files for usage examples
4. Review component implementations for patterns

## License

This project is part of the Manus platform ecosystem.

## Changelog

### Version 1.0.0
- Initial release
- Multi-format ebook support
- User authentication
- Cloud storage integration
- Reading progress tracking
- Bookmarks and annotations
- Responsive design
- Comprehensive test coverage
