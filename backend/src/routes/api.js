import { Router } from 'express';
import { asyncHandler } from '../middleware/errorHandler.js';
import * as controller from '../controllers/graphController.js';

const router = Router();

router.get('/health', asyncHandler(controller.healthCheck));
router.get('/dashboard', asyncHandler(controller.getDashboard));
router.get('/developers', asyncHandler(controller.listDevelopers));
router.get('/developers/:id', asyncHandler(controller.getDeveloper));
router.get('/developers/:id/network', asyncHandler(controller.getDeveloperNetwork));
router.get('/technologies', asyncHandler(controller.listTechnologies));
router.get('/technologies/:id', asyncHandler(controller.getTechnology));
router.get('/technologies/:id/developers', asyncHandler(controller.getDevelopersByTechnology));
router.get('/projects', asyncHandler(controller.listProjects));
router.get('/projects/top', asyncHandler(controller.getTopProjects));
router.get('/projects/:id', asyncHandler(controller.getProject));
router.get('/projects/:id/technologies', asyncHandler(controller.getProjectTechnologies));
router.get('/search', asyncHandler(controller.search));
router.get('/collaborators/:developerId', asyncHandler(controller.getCollaborators));
router.get('/collaboration-path', asyncHandler(controller.getCollaborationPath));
router.get('/graph/:id', asyncHandler(controller.getGraph));

export default router;
