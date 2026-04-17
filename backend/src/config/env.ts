import dotenv from 'dotenv';

dotenv.config();

export const env = {
  port: Number(process.env.PORT || 4000),
  jwtSecret: process.env.JWT_SECRET || 'super_secret_demo',
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:5173'
};
