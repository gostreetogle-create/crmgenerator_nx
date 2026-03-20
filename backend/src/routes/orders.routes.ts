// Eve-BE: API-MOUNT-001 — `/api/orders`
import { Router } from 'express';
import { getOrderById, listOrders } from '../controllers/orders.controller';

export const ordersRouter = Router();

ordersRouter.get('/', listOrders);
ordersRouter.get('/:id', getOrderById);

