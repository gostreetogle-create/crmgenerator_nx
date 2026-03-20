// Eve-BE: API-MOUNT-001 — `/api/part-types`
import { Router } from 'express';
import {
  createPartType,
  deletePartType,
  getPartTypeById,
  listPartTypes,
  updatePartType,
} from '../controllers/part-types.controller';

export const partTypesRouter = Router();

partTypesRouter.get('/', listPartTypes);
partTypesRouter.get('/:id', getPartTypeById);
partTypesRouter.post('/', createPartType);
partTypesRouter.patch('/:id', updatePartType);
partTypesRouter.delete('/:id', deletePartType);

