// Eve-BE: API-MOUNT-001 — `/api/categories`
import { Router } from 'express';
import {
  createCategory,
  deleteCategory,
  getCategoryById,
  listCategories,
  updateCategory,
} from '../controllers/categories.controller';

export const categoriesRouter = Router();

categoriesRouter.get('/', listCategories);
categoriesRouter.get('/:id', getCategoryById);
categoriesRouter.post('/', createCategory);
categoriesRouter.patch('/:id', updateCategory);
categoriesRouter.delete('/:id', deleteCategory);

