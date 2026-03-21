// Eve-BE: API-MOUNT-001 — корневой роутер `/api/*`: подключение всех ресурсных routes
import { Router } from 'express';
import { organizationsRouter } from './organizations.routes';
import { clientsRouter } from './clients.routes';
import { categoriesRouter } from './categories.routes';
import { materialsRouter } from './materials.routes';
import { partTypesRouter } from './part-types.routes';
import { productsRouter } from './products.routes';
import { productSpecificationsRouter } from './product-specifications.routes';
import { mountTypesRouter } from './mount-types.routes';
import { functionalitiesRouter } from './functionalities.routes';
import { productAttachmentsRouter } from './product-attachments.routes';
import { proposalsRouter } from './proposals.routes';
import { pdfRouter } from './pdf.routes';
import { ordersRouter } from './orders.routes';

export const apiRouter = Router();

apiRouter.use('/organizations', organizationsRouter);
apiRouter.use('/clients', clientsRouter);
apiRouter.use('/categories', categoriesRouter);
apiRouter.use('/materials', materialsRouter);
apiRouter.use('/part-types', partTypesRouter);
apiRouter.use('/products', productsRouter);
apiRouter.use('/products', productSpecificationsRouter);
apiRouter.use('/products', productAttachmentsRouter);
apiRouter.use('/mount-types', mountTypesRouter);
apiRouter.use('/functionalities', functionalitiesRouter);
apiRouter.use('/proposals', proposalsRouter);
apiRouter.use('/orders', ordersRouter);
apiRouter.use('/', pdfRouter);

