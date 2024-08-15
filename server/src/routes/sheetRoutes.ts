import { Router } from 'express';
import * as sheetController from '../controllers/sheetController'
import { isAuthenticated } from '../middlewares/authMiddleware';

const sheetRoutes = Router();

sheetRoutes.get('/sheet/:spreadsheetId', isAuthenticated, sheetController.getSheet);
sheetRoutes.post('/sheet', isAuthenticated, sheetController.createSheet);
sheetRoutes.delete('/sheet/:sheetId', isAuthenticated, sheetController.deleteSheet);
sheetRoutes.put('/sheet/:sheetId/name', isAuthenticated, sheetController.setName);
sheetRoutes.put('/sheet/:sheetId/index', isAuthenticated, sheetController.setIndex);
sheetRoutes.put('/sheet/:sheetId/rows', isAuthenticated, sheetController.addRows);
sheetRoutes.put('/sheet/:sheetId/cols', isAuthenticated, sheetController.addCols);
sheetRoutes.delete('/sheet/:sheetId/rows', isAuthenticated, sheetController.deleteRows);
sheetRoutes.delete('/sheet/:sheetId/cols', isAuthenticated, sheetController.deleteCols);
sheetRoutes.patch('/sheet/:sheetId/row-height', isAuthenticated, sheetController.updateRowsHeight);
sheetRoutes.patch('/sheet/:sheetId/col-width', isAuthenticated, sheetController.updateColsWidth);
sheetRoutes.patch('/sheet/:sheetId/row-hidden', isAuthenticated, sheetController.updateHiddenRows);
sheetRoutes.patch('/sheet/:sheetId/col-hidden', isAuthenticated, sheetController.updateHiddenCols);


export default sheetRoutes;
