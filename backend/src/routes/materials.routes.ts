// Eve-BE: API-MOUNT-001 — `/api/materials`
import { Router } from 'express';
import multer from 'multer';
import {
  createMaterial,
  deleteMaterial,
  getMaterialById,
  importMaterialsFromExcel,
  listMaterials,
  updateMaterial,
} from '../controllers/materials.controller';

export const materialsRouter = Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 5 * 1024 * 1024 } });

materialsRouter.get('/', listMaterials);
materialsRouter.get('/:id', getMaterialById);
materialsRouter.post('/import-excel', upload.single('file'), importMaterialsFromExcel);
materialsRouter.post('/', createMaterial);
materialsRouter.patch('/:id', updateMaterial);
materialsRouter.delete('/:id', deleteMaterial);

