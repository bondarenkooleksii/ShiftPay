import express, { type ErrorRequestHandler } from 'express';
import cors from 'cors';
import { config } from './config';
import { db } from './db';
import { HttpError } from './http';
import { authRouter } from './routes/auth';
import { dutyRouter, shiftsRouter } from './routes/shifts';
import { analyticsRouter, payoutsRouter, payslipsRouter } from './routes/payroll';
import { teamRouter, templatesRouter, venuesRouter } from './routes/organization';
import { profileRouter, settingsRouter, supportRouter } from './routes/settings';

const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
  if (err instanceof HttpError) {
    res.status(err.status).json({ message: err.message });
    return;
  }
  if (err?.type === 'entity.parse.failed') {
    res.status(400).json({ message: 'Некоректний JSON у тілі запиту' });
    return;
  }
  console.error(err);
  res.status(500).json({ message: 'Внутрішня помилка сервера' });
};

export function createApp() {
  const app = express();
  app.use(cors({ origin: config.corsOrigin.split(',') }));
  app.use(express.json());

  const api = express.Router();
  api.get('/health', (_req, res) => {
    res.json({ status: 'ok' });
  });
  api.use('/auth', authRouter);
  api.use('/shifts', shiftsRouter);
  api.use('/duty', dutyRouter);
  api.use('/payouts', payoutsRouter);
  api.use('/payslips', payslipsRouter);
  api.use('/analytics', analyticsRouter);
  api.use('/team', teamRouter);
  api.use('/venues', venuesRouter);
  api.use('/templates', templatesRouter);
  api.use('/settings', settingsRouter);
  api.use('/profile', profileRouter);
  api.use('/support', supportRouter);
  if (process.env.NODE_ENV !== 'production') {
    api.post('/dev/reset', (_req, res) => {
      db.reset();
      res.status(204).end();
    });
  }
  api.use((_req, res) => {
    res.status(404).json({ message: 'Ресурс не знайдено' });
  });

  app.use('/api', api);
  app.use(errorHandler);
  return app;
}
