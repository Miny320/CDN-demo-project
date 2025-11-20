# Simple CDN - Image and File Storage

A lightweight Content Delivery Network (CDN) built with TypeScript, Express, and Sharp for efficient image and file storage with automatic optimization.

## Features

- **Fast File Upload** - Single or multiple file uploads
- **Image Optimization** - Automatic resizing and format conversion (WebP)
- **File Storage** - Organized storage for images and files
- **CDN Headers** - Proper cache headers for CDN behavior
- **Modern UI** - Beautiful web interface for testing
- **Statistics** - Track storage usage and file counts
- **Type Safety** - Full TypeScript support

## Tech Stack

- **TypeScript** - Type-safe development
- **Express** - Web server framework
- **Multer** - File upload handling
- **Sharp** - High-performance image processing
- **UUID** - Unique filename generation

## Installation

1. Install dependencies:
```bash
npm install
```

2. Build the project:
```bash
npm run build
```

3. Start the server:
```bash
npm start
```

For development with auto-reload:
```bash
npm run dev
```

## API Endpoints

### Upload Files

**Single File Upload**
```
POST /api/upload/single
Content-Type: multipart/form-data
Body: { file: File }
```

**Multiple Files Upload**
```
POST /api/upload/multiple
Content-Type: multipart/form-data
Body: { files: File[] }
```

**Get Statistics**
```
GET /api/upload/stats
```

### File Serving

**Get File**
```
GET /files/:filename
```

**Get Optimized Image**
```
GET /files/optimized/:filename
```

**Delete File**
```
DELETE /files/:filename
```

## Storage Structure

```
storage/
├── images/      # Original uploaded images
├── files/       # Other uploaded files
└── optimized/   # Optimized WebP images
```

## Configuration

- **Port**: Set via `PORT` environment variable (default: 3000)
- **File Size Limit**: 50MB (configurable in `src/middleware/upload.ts`)
- **Image Optimization**: 
  - Max dimensions: 1920x1920
  - Quality: 85%
  - Format: WebP

## Development

```bash
# Watch mode with auto-reload
npm run dev

# Build for production
npm run build

# Clean build directory
npm run clean
```

## License

MIT

