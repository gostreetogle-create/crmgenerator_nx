// Eve-BE: API-MOUNT-001 — `/api/materials`
import { Router } from 'express';
import {
  createMaterial,
  deleteMaterial,
  getMaterialById,
  listMaterials,
  updateMaterial,
} from '../controllers/materials.controller';

export const materialsRouter = Router();

materialsRouter.get('/', listMaterials);
materialsRouter.get('/:id', getMaterialById);
materialsRouter.post('/', createMaterial);
materialsRouter.patch('/:id', updateMaterial);
materialsRouter.delete('/:id', deleteMaterial);

