import { Router } from 'express';
import * as sheetController from '../controllers/sheetController'
import { isAuthenticated } from '../middlewares/authMiddleware';

const sheetRoutes = Router();

sheetRoutes.get('/sheet/:sheetId', isAuthenticated, sheetController.getSheet);
sheetRoutes.post('/sheet/:sheetId', isAuthenticated, sheetController.revertSheet);
sheetRoutes.post('/sheet', isAuthenticated, sheetController.createSheet);
sheetRoutes.delete('/sheet/:sheetId/rows', isAuthenticated, sheetController.deleteRows);
sheetRoutes.delete('/sheet/:sheetId/cols', isAuthenticated, sheetController.deleteCols);
sheetRoutes.delete('/sheet/:sheetId', isAuthenticated, sheetController.deleteSheet);
sheetRoutes.put('/sheet/:sheetId/name', isAuthenticated, sheetController.setName);
sheetRoutes.put('/sheet/:sheetId/index', isAuthenticated, sheetController.setIndex);
sheetRoutes.put('/sheet/:sheetId/color', isAuthenticated, sheetController.setColor);
sheetRoutes.put('/sheet/:sheetId/rows', isAuthenticated, sheetController.addRows);
sheetRoutes.put('/sheet/:sheetId/cols', isAuthenticated, sheetController.addCols);
sheetRoutes.put('/sheet/:sheetId/row-height', isAuthenticated, sheetController.updateRowsHeight); // ? PATCH doesn't work on Brave - CORS
sheetRoutes.put('/sheet/:sheetId/col-width', isAuthenticated, sheetController.updateColsWidth); // ? PATCH doesn't work on Brave - CORS
sheetRoutes.put('/sheet/:sheetId/row-hidden', isAuthenticated, sheetController.updateHiddenRows); // ? PATCH doesn't work on Brave - CORS
sheetRoutes.put('/sheet/:sheetId/col-hidden', isAuthenticated, sheetController.updateHiddenCols); // ? PATCH doesn't work on Brave - CORS


export default sheetRoutes;
