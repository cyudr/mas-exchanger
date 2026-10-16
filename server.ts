import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import healthHandler from './api/health.ts';
import exchangeRatesHandler from './api/exchangerates.ts';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;

  app.use(express.json());

  // Mount serverless API routes located at project root /api/
  app.all('/api/health', (req, res) => healthHandler(req, res));
  app.all('/api/exchangerates', (req, res) => exchangeRatesHandler(req, res));

  // Vite development middleware or static production serving
  if (process.env.NODE_ENV !== 'production') {
    const { createServer } = await import('vite');
    const vite = await createServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server listening on http://0.0.0.0:${PORT}`);
    console.log(`MAS API Health endpoint: http://localhost:${PORT}/api/health`);
    console.log(`MAS Exchange Rates endpoint: http://localhost:${PORT}/api/exchangerates`);
  });
}

startServer().catch(err => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
