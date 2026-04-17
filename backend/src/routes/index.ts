import { Router } from 'express';
import authRoutes from './auth.routes';
import categoryRoutes from './category.routes';
import ticketRoutes from './ticket.routes';

const router = Router();

router.get('/health', (_req, res) => {
  res.json({ message: 'API funcionando correctamente' });
});

router.use('/auth', authRoutes);
router.use('/categories', categoryRoutes);
router.use('/tickets', ticketRoutes);

export default router;
