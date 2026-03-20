import { Router } from 'express';
import {
  createFunctionality,
  deleteFunctionality,
  getFunctionalityById,
  listFunctionalities,
  updateFunctionality,
} from '../controllers/functionalities.controller';

export const functionalitiesRouter = Router();

functionalitiesRouter.get('/', listFunctionalities);
functionalitiesRouter.get('/:id', getFunctionalityById);
functionalitiesRouter.post('/', createFunctionality);
functionalitiesRouter.patch('/:id', updateFunctionality);
functionalitiesRouter.delete('/:id', deleteFunctionality);

