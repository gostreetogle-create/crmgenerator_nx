// Eve-BE: API-MOUNT-001 — `/api/products/:productId/specifications`
import { Router } from 'express';
import {
  createProductSpecification,
  deleteProductSpecification,
  getProductSpecificationById,
  listProductSpecifications,
  updateProductSpecification,
} from '../controllers/product-specifications.controller';

export const productSpecificationsRouter = Router({ mergeParams: true });

productSpecificationsRouter.get('/:productId/specifications', listProductSpecifications);
productSpecificationsRouter.get('/:productId/specifications/:id', getProductSpecificationById);
productSpecificationsRouter.post('/:productId/specifications', createProductSpecification);
productSpecificationsRouter.patch('/:productId/specifications/:id', updateProductSpecification);
productSpecificationsRouter.delete('/:productId/specifications/:id', deleteProductSpecification);
