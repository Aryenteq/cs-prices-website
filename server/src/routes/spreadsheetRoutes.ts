import { Router } from 'express';
import * as spreadsheetController from '../controllers/spreadsheetController';
import { isAuthenticated } from '../middlewares/authMiddleware';

const spreadsheetRoutes = Router();

spreadsheetRoutes.get('/spreadsheet', isAuthenticated, spreadsheetController.getAllSpreadsheets);
spreadsheetRoutes.get('/spreadsheet/:spreadsheetId/name', isAuthenticated, spreadsheetController.getSpreadsheetName);
spreadsheetRoutes.get('/spreadsheet/:spreadsheetId/type', isAuthenticated, spreadsheetController.getSpreadsheetType);
spreadsheetRoutes.get('/spreadsheet/:spreadsheetId/shares', isAuthenticated, spreadsheetController.getSpreadsheetShares);
spreadsheetRoutes.get('/spreadsheet/:spreadsheetId/permission', isAuthenticated, spreadsheetController.getSpreadsheetPermission);
spreadsheetRoutes.get('/spreadsheet/:spreadsheetId', isAuthenticated, spreadsheetController.getSpreadsheet);
spreadsheetRoutes.post('/spreadsheet', isAuthenticated, spreadsheetController.createSpreadsheet);
spreadsheetRoutes.delete('/spreadsheet/:spreadsheetId', isAuthenticated, spreadsheetController.deleteSpreadsheet);
spreadsheetRoutes.put('/spreadsheet/:spreadsheetId/name', isAuthenticated, spreadsheetController.setName);
spreadsheetRoutes.put('/spreadsheet/:spreadsheetId/last-opened', isAuthenticated, spreadsheetController.setLastOpened);
spreadsheetRoutes.patch('/spreadsheet/:spreadsheetId/shared-users-ids', isAuthenticated, spreadsheetController.updateSharedUsersIds);

export default spreadsheetRoutes;