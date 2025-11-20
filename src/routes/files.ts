import { Router, Request, Response } from 'express';
import path from 'path';
import fs from 'fs';

export const filesRouter = Router();

// Serve files with cache headers
filesRouter.get('/:filename', (req: Request, res: Response) => {
  try {
    const filename = req.params.filename;
    const filePath = path.join(__dirname, '../../storage/files', filename);
    const imagePath = path.join(__dirname, '../../storage/images', filename);

    let actualPath: string | null = null;

    // Check in files directory first, then images
    if (fs.existsSync(filePath)) {
      actualPath = filePath;
    } else if (fs.existsSync(imagePath)) {
      actualPath = imagePath;
    } else {
      return res.status(404).json({ error: 'File not found' });
    }

    // Set cache headers (1 year for CDN behavior)
    res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
    res.setHeader('ETag', `"${filename}"`);
    
    // Set content type
    const ext = path.extname(filename).toLowerCase();
    const contentTypes: { [key: string]: string } = {
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.png': 'image/png',
      '.gif': 'image/gif',
      '.webp': 'image/webp',
      '.svg': 'image/svg+xml',
      '.pdf': 'application/pdf',
      '.txt': 'text/plain',
      '.json': 'application/json',
      '.zip': 'application/zip'
    };

    const contentType = contentTypes[ext] || 'application/octet-stream';
    res.setHeader('Content-Type', contentType);

    // Stream the file
    const fileStream = fs.createReadStream(actualPath);
    fileStream.pipe(res);
  } catch (error: any) {
    console.error('File serving error:', error);
    res.status(500).json({ error: error.message || 'Failed to serve file' });
  }
});

// Serve optimized images
filesRouter.get('/optimized/:filename', (req: Request, res: Response) => {
  try {
    const filename = req.params.filename;
    const filePath = path.join(__dirname, '../../storage/optimized', filename);

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: 'Optimized file not found' });
    }

    // Set cache headers
    res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
    res.setHeader('ETag', `"${filename}"`);
    res.setHeader('Content-Type', 'image/webp');

    // Stream the file
    const fileStream = fs.createReadStream(filePath);
    fileStream.pipe(res);
  } catch (error: any) {
    console.error('Optimized file serving error:', error);
    res.status(500).json({ error: error.message || 'Failed to serve optimized file' });
  }
});

// Delete file
filesRouter.delete('/:filename', (req: Request, res: Response) => {
  try {
    const filename = req.params.filename;
    const filePath = path.join(__dirname, '../../storage/files', filename);
    const imagePath = path.join(__dirname, '../../storage/images', filename);
    const optimizedPath = path.join(__dirname, '../../storage/optimized', `optimized-${filename.replace(/\.[^.]+$/, '.webp')}`);

    let deleted = false;

    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      deleted = true;
    }

    if (fs.existsSync(imagePath)) {
      fs.unlinkSync(imagePath);
      deleted = true;
    }

    // Also delete optimized version if exists
    if (fs.existsSync(optimizedPath)) {
      fs.unlinkSync(optimizedPath);
    }

    if (!deleted) {
      return res.status(404).json({ error: 'File not found' });
    }

    res.json({ success: true, message: 'File deleted' });
  } catch (error: any) {
    console.error('File deletion error:', error);
    res.status(500).json({ error: error.message || 'Failed to delete file' });
  }
});

