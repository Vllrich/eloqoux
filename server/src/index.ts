import express, { Express, Request, Response } from 'express';
import dotenv from 'dotenv';

dotenv.config();

const app: Express = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/', (req: Request, res: Response) => {
  res.json({ message: 'Eloqoux API Server', status: 'running' });
});

app.get('/health', (req: Request, res: Response) => {
  res.json({ status: 'healthy', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`🚀 Server is running on http://localhost:${PORT}`);
});

