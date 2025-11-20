import express, { Express } from 'express';
import cors from 'cors';
import path from 'path';
import { uploadRouter } from './routes/upload';
import { filesRouter } from './routes/files';

const app: Express = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Create storage directories if they don't exist
import fs from 'fs';
const storageDirs = [
  path.join(__dirname, '../storage/images'),
  path.join(__dirname, '../storage/files'),
  path.join(__dirname, '../storage/optimized')
];

storageDirs.forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// Routes
app.use('/api/upload', uploadRouter);
app.use('/files', filesRouter);

// Serve static frontend
app.use(express.static(path.join(__dirname, '../public')));

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`CDN Server running on http://localhost:${PORT}`);
  console.log(`Storage: ${path.join(__dirname, '../storage')}`);
});

