import express, { Express, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { rateLimit } from 'express-rate-limit';
import dotenv from 'dotenv';
import { generateWord, generateMoreExamples } from './lib/openai';

dotenv.config();

const app: Express = express();
const PORT = process.env.PORT || 3000;
const API_SECRET = process.env.API_SECRET;

app.use(helmet());
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') || '*',
}));
app.use(express.json());

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 60,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests, please try again later.' },
});
app.use('/api/', apiLimiter);

function authMiddleware(req: Request, res: Response, next: NextFunction) {
  if (!API_SECRET) return next();
  const token = req.headers['x-api-key'] || req.headers.authorization?.replace('Bearer ', '');
  if (token !== API_SECRET) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }
  next();
}
app.use('/api/', authMiddleware);

app.get('/', (_req: Request, res: Response) => {
  res.json({ message: 'Eloquox API Server', status: 'running' });
});

app.get('/health', (_req: Request, res: Response) => {
  res.json({ status: 'healthy', timestamp: new Date().toISOString() });
});

app.post('/api/word/generate', async (req: Request, res: Response) => {
  try {
    const { category } = req.body;
    if (!category) {
      res.status(400).json({ error: 'Category is required' });
      return;
    }
    const wordData = await generateWord(category);
    res.json(wordData);
  } catch (error) {
    console.error('Error generating word:', error);
    res.status(500).json({ error: 'Failed to generate word' });
  }
});

app.post('/api/examples/generate', async (req: Request, res: Response) => {
  try {
    const { word, category, count = 3 } = req.body;
    if (!word || !category) {
      res.status(400).json({ error: 'Word and category are required' });
      return;
    }
    const examples = await generateMoreExamples(word, category, count);
    res.json({ examples });
  } catch (error) {
    console.error('Error generating examples:', error);
    res.status(500).json({ error: 'Failed to generate examples' });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});


