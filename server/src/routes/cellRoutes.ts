import { Router } from 'express';
import * as cellController from '../controllers/cellController';
import { isAuthenticated } from '../middlewares/authMiddleware';

const cellRoutes = Router();

cellRoutes.put('/cell/:cellId/bg-color', isAuthenticated, cellController.setBgColor);
cellRoutes.put('/cell/:cellId/color', isAuthenticated, cellController.setColor);
cellRoutes.patch('/cell/:cellId/style', isAuthenticated, cellController.updateStyle);
cellRoutes.put('/cell/:cellId/h-alignment', isAuthenticated, cellController.setHorizontalAlignment);
cellRoutes.put('/cell/:cellId/v-alignment', isAuthenticated, cellController.setVerticalAlignment);
cellRoutes.put('/cell/:cellId/content', isAuthenticated, cellController.setContent);


export default cellRoutes;
