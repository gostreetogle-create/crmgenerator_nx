// Eve-BE: API-MOUNT-001 — `/api/categories`
import { Router } from 'express';
import multer from 'multer';
import {
  createCategory,
  deleteCategory,
  getCategoryById,
  importCategoriesFromExcel,
  listCategories,
  updateCategory,
} from '../controllers/categories.controller';

export const categoriesRouter = Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 5 * 1024 * 1024 } });

categoriesRouter.get('/', listCategories);
categoriesRouter.get('/:id', getCategoryById);
categoriesRouter.post('/import-excel', upload.single('file'), importCategoriesFromExcel);
categoriesRouter.post('/', createCategory);
categoriesRouter.patch('/:id', updateCategory);
categoriesRouter.delete('/:id', deleteCategory);

