import { Router } from 'express';
import * as cellController from '../controllers/cellController';
import { isAuthenticated } from '../middlewares/authMiddleware';

const cellRoutes = Router();

cellRoutes.put('/cells/bg-color', isAuthenticated, cellController.setBgColor);
cellRoutes.put('/cells/color', isAuthenticated, cellController.setColor);
cellRoutes.patch('/cells/style', isAuthenticated, cellController.updateStyle);
cellRoutes.put('/cells/h-alignment', isAuthenticated, cellController.setHorizontalAlignment);
cellRoutes.put('/cells/v-alignment', isAuthenticated, cellController.setVerticalAlignment);
cellRoutes.put('/cells/content', isAuthenticated, cellController.setContent);


export default cellRoutes;
