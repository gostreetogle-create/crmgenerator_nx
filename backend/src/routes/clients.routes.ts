import { Router } from 'express';
import {
  createClient,
  deleteClient,
  getClientById,
  listClients,
  updateClient,
} from '../controllers/clients.controller';

export const clientsRouter = Router();

clientsRouter.get('/', listClients);
clientsRouter.get('/:id', getClientById);
clientsRouter.post('/', createClient);
clientsRouter.patch('/:id', updateClient);
clientsRouter.delete('/:id', deleteClient);

