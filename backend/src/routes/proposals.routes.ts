// Eve-BE: API-MOUNT-001 — `/api/proposals`
import { Router } from 'express';
import {
  changeProposalStatus,
  createProposal,
  createProposalVersion,
  deleteProposal,
  getProposalById,
  listProposals,
  updateProposal,
} from '../controllers/proposals.controller';

export const proposalsRouter = Router();

proposalsRouter.get('/', listProposals);
proposalsRouter.get('/:id', getProposalById);
proposalsRouter.post('/', createProposal);
proposalsRouter.patch('/:id', updateProposal);
proposalsRouter.delete('/:id', deleteProposal);

proposalsRouter.patch('/:id/status', changeProposalStatus);
proposalsRouter.post('/:id/versions', createProposalVersion);

