// Eve-BE: API-MOUNT-001 — `/api/products/:id/...` вложенные связи
import { Router } from 'express';
import {
  listProductFunctionalities,
  listProductMountTypes,
  setProductFunctionalities,
  setProductMountTypes,
} from '../controllers/product-attachments.controller';

export const productAttachmentsRouter = Router({ mergeParams: true });

// Вариант API: PUT задаёт полный набор привязок (удобно для UI мультивыбора)
productAttachmentsRouter.get('/:id/mounts', listProductMountTypes);
productAttachmentsRouter.put('/:id/mounts', setProductMountTypes);

productAttachmentsRouter.get('/:id/functionalities', listProductFunctionalities);
productAttachmentsRouter.put('/:id/functionalities', setProductFunctionalities);

