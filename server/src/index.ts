import express, { Express, Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { generateWord, generateMoreExamples } from './lib/openai';

dotenv.config();

const app: Express = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/', (req: Request, res: Response) => {
  res.json({ message: 'Eloquox API Server', status: 'running' });
});

app.get('/health', (req: Request, res: Response) => {
  res.json({ status: 'healthy', timestamp: new Date().toISOString() });
});

// Generate a new word with examples
app.post('/api/word/generate', async (req: Request, res: Response) => {
  try {
    const { category } = req.body;
    
    if (!category) {
      return res.status(400).json({ error: 'Category is required' });
    }

    const wordData = await generateWord(category);
    res.json(wordData);
  } catch (error) {
    console.error('Error generating word:', error);
    res.status(500).json({ 
      error: 'Failed to generate word',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Generate more examples for a word
app.post('/api/examples/generate', async (req: Request, res: Response) => {
  try {
    const { word, category, count = 3 } = req.body;
    
    if (!word || !category) {
      return res.status(400).json({ error: 'Word and category are required' });
    }

    const examples = await generateMoreExamples(word, category, count);
    res.json({ examples });
  } catch (error) {
    console.error('Error generating examples:', error);
    res.status(500).json({ 
      error: 'Failed to generate examples',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Server is running on http://localhost:${PORT}`);
});


