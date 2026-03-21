// Eve-BE: API-MOUNT-001 — `/api/part-types`
import { Router } from 'express';
import multer from 'multer';
import {
  createPartType,
  deletePartType,
  getPartTypeById,
  importPartTypesFromExcel,
  listPartTypes,
  updatePartType,
} from '../controllers/part-types.controller';

export const partTypesRouter = Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 5 * 1024 * 1024 } });

partTypesRouter.get('/', listPartTypes);
partTypesRouter.get('/:id', getPartTypeById);
partTypesRouter.post('/import-excel', upload.single('file'), importPartTypesFromExcel);
partTypesRouter.post('/', createPartType);
partTypesRouter.patch('/:id', updatePartType);
partTypesRouter.delete('/:id', deletePartType);

