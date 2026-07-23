import express from 'express';
import cors from 'cors';
import financeRoutes from './routes/financeRoutes.js';
import { attachUser } from './middleware/auth.js';

/**
 * App factory — wires middleware and routes but does NOT start listening.
 * Keeping this separate from server.js makes the app importable in tests.
 */
export function createApp() {
  const app = express();

  app.use(cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "x-user-id"],
  }));
  
  app.options("*", cors());
  app.use(express.json());

  app.get('/health', (_req, res) => res.json({ status: 'ok' }));

  // Resolve acting user for every /api request (role checks depend on it).
  app.use('/api', attachUser);
  app.use('/api/finance', financeRoutes);

  // 404
  app.use((req, res) => {
    res.status(404).json({ success: false, message: `Not found: ${req.originalUrl}` });
  });

  // Centralised error handler.
  // eslint-disable-next-line no-unused-vars
  app.use((err, _req, res, _next) => {
    const status = err.status || 500;
    if (status >= 500) console.error(err);
    res.status(status).json({ success: false, message: err.message });
  });

  return app;
}
