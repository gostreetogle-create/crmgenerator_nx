// Eve-BE: API-MOUNT-001 — `/api/organizations`
import { Router } from 'express';
import {
  createOrganization,
  deleteOrganization,
  getOrganizationById,
  listOrganizations,
  updateOrganization,
} from '../controllers/organizations.controller';

export const organizationsRouter = Router();

organizationsRouter.get('/', listOrganizations);
organizationsRouter.get('/:id', getOrganizationById);
organizationsRouter.post('/', createOrganization);
organizationsRouter.patch('/:id', updateOrganization);
organizationsRouter.delete('/:id', deleteOrganization);

