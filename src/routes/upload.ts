import { Router, Request, Response } from 'express';
import { upload } from '../middleware/upload';
import { optimizeImage, getImageMetadata } from '../utils/imageOptimizer';
import path from 'path';
import fs from 'fs';

export const uploadRouter = Router();

// Single file upload
uploadRouter.post('/single', upload.single('file'), async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const file = req.file;
    const isImage = file.mimetype.startsWith('image/');

    let optimizedPath: string | null = null;
    let metadata: any = null;

    // Optimize images
    if (isImage) {
      try {
        const optimizedDir = path.join(__dirname, '../../storage/optimized');
        const ext = path.extname(file.filename);
        const optimizedFilename = `optimized-${file.filename.replace(ext, '.webp')}`;
        optimizedPath = path.join(optimizedDir, optimizedFilename);

        await optimizeImage(file.path, optimizedPath, {
          width: 1920,
          height: 1920,
          quality: 85,
          format: 'webp'
        });

        metadata = await getImageMetadata(file.path);
      } catch (error) {
        console.error('Image optimization error:', error);
        // Continue even if optimization fails
      }
    }

    res.json({
      success: true,
      file: {
        id: file.filename,
        originalName: file.originalname,
        filename: file.filename,
        mimetype: file.mimetype,
        size: file.size,
        path: `/files/${file.filename}`,
        optimizedPath: optimizedPath ? `/files/optimized/${path.basename(optimizedPath)}` : null,
        metadata: metadata,
        uploadedAt: new Date().toISOString()
      }
    });
  } catch (error: any) {
    console.error('Upload error:', error);
    res.status(500).json({ error: error.message || 'Upload failed' });
  }
});

// Multiple files upload
uploadRouter.post('/multiple', upload.array('files', 10), async (req: Request, res: Response) => {
  try {
    if (!req.files || (req.files as Express.Multer.File[]).length === 0) {
      return res.status(400).json({ error: 'No files uploaded' });
    }

    const files = req.files as Express.Multer.File[];
    const results = await Promise.all(
      files.map(async (file) => {
        const isImage = file.mimetype.startsWith('image/');
        let optimizedPath: string | null = null;
        let metadata: any = null;

        if (isImage) {
          try {
            const optimizedDir = path.join(__dirname, '../../storage/optimized');
            const ext = path.extname(file.filename);
            const optimizedFilename = `optimized-${file.filename.replace(ext, '.webp')}`;
            optimizedPath = path.join(optimizedDir, optimizedFilename);

            await optimizeImage(file.path, optimizedPath, {
              width: 1920,
              height: 1920,
              quality: 85,
              format: 'webp'
            });

            metadata = await getImageMetadata(file.path);
          } catch (error) {
            console.error(`Image optimization error for ${file.filename}:`, error);
          }
        }

        return {
          id: file.filename,
          originalName: file.originalname,
          filename: file.filename,
          mimetype: file.mimetype,
          size: file.size,
          path: `/files/${file.filename}`,
          optimizedPath: optimizedPath ? `/files/optimized/${path.basename(optimizedPath)}` : null,
          metadata: metadata,
          uploadedAt: new Date().toISOString()
        };
      })
    );

    res.json({
      success: true,
      count: results.length,
      files: results
    });
  } catch (error: any) {
    console.error('Upload error:', error);
    res.status(500).json({ error: error.message || 'Upload failed' });
  }
});

// Get upload stats
uploadRouter.get('/stats', (req: Request, res: Response) => {
  try {
    const imagesDir = path.join(__dirname, '../../storage/images');
    const filesDir = path.join(__dirname, '../../storage/files');
    const optimizedDir = path.join(__dirname, '../../storage/optimized');

    const getDirStats = (dir: string) => {
      if (!fs.existsSync(dir)) return { count: 0, totalSize: 0 };
      
      const files = fs.readdirSync(dir);
      let totalSize = 0;
      
      files.forEach(file => {
        const filePath = path.join(dir, file);
        const stats = fs.statSync(filePath);
        if (stats.isFile()) {
          totalSize += stats.size;
        }
      });

      return { count: files.length, totalSize };
    };

    const images = getDirStats(imagesDir);
    const files = getDirStats(filesDir);
    const optimized = getDirStats(optimizedDir);

    res.json({
      images: {
        ...images,
        totalSizeMB: (images.totalSize / (1024 * 1024)).toFixed(2)
      },
      files: {
        ...files,
        totalSizeMB: (files.totalSize / (1024 * 1024)).toFixed(2)
      },
      optimized: {
        ...optimized,
        totalSizeMB: (optimized.totalSize / (1024 * 1024)).toFixed(2)
      }
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to get stats' });
  }
});

