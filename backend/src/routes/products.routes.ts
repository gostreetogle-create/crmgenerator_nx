// Eve-BE: API-MOUNT-001 — `/api/products` (товары)
import { Router } from 'express';
import {
  createProduct,
  cloneProduct,
  deleteProduct,
  getProductById,
  listProducts,
  searchProducts,
  updateProduct,
} from '../controllers/products.controller';

export const productsRouter = Router();

productsRouter.get('/', listProducts);
productsRouter.get('/search', searchProducts);
productsRouter.get('/:id', getProductById);
productsRouter.post('/:id/clone', cloneProduct);
productsRouter.post('/', createProduct);
productsRouter.patch('/:id', updateProduct);
productsRouter.delete('/:id', deleteProduct);

