// Eve-BE: API-MOUNT-001 — `/api/mount-types`
import { Router } from 'express';
import {
  createMountType,
  deleteMountType,
  getMountTypeById,
  listMountTypes,
  updateMountType,
} from '../controllers/mount-types.controller';

export const mountTypesRouter = Router();

mountTypesRouter.get('/', listMountTypes);
mountTypesRouter.get('/:id', getMountTypeById);
mountTypesRouter.post('/', createMountType);
mountTypesRouter.patch('/:id', updateMountType);
mountTypesRouter.delete('/:id', deleteMountType);

