import { Router } from 'express';
import * as userController from '../controllers/userController';
import { isAuthenticated } from '../middlewares/authMiddleware';

const sheetRoutes = Router();

sheetRoutes.get('/user/photo/:userId', isAuthenticated, userController.getUserPhoto);

export default sheetRoutes;
