import { Router } from 'express';
import * as spreadsheetController from '../controllers/spreadsheetController';
import { isAuthenticated } from '../middlewares/authMiddleware';

const spreadsheetRoutes = Router();

spreadsheetRoutes.post('/spreadsheet', isAuthenticated, spreadsheetController.createSpreadsheet);
spreadsheetRoutes.delete('/spreadhseet', isAuthenticated, spreadsheetController.deleteSpreadsheet);
spreadsheetRoutes.put('/spreadsheet/:spreadsheetId/name', isAuthenticated, spreadsheetController.setName);


export default spreadsheetRoutes;
