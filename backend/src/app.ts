import cors from 'cors';
import express from 'express';
import { env } from './config/env';
import router from './routes';
import { errorHandler } from './middleware/error.middleware';

const app = express();

app.use(
  cors({
    origin: env.frontendUrl
  })
);
app.use(express.json());

app.use('/api', router);
app.use(errorHandler);

export default app;
