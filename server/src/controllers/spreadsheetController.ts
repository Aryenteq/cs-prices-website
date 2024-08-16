import type { Request, Response } from 'express';
import * as spreadsheetService from "../services/spreadsheetService";
import type { Spreadsheet as PrismaSpreadsheet } from '@prisma/client';

export const getAllSpreadsheets = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user.uid;
        const spreadsheets = await spreadsheetService.getAllSpreadsheets(userId);
        res.status(200).json(spreadsheets);
    } catch (error: any) {
        res.status(400).json({ message: error.message });
    }
};

export const getSpreadsheet = async (req: Request, res: Response) => {
    try {
        const spreadsheetId = parseInt(req.params.spreadsheetId, 10);
        const index = parseInt(req.query.index as string, 10);
        const userId = (req as any).user.uid;

        const result = await spreadsheetService.getSpreadsheet(spreadsheetId, index, userId);
        res.status(200).json(result);
    } catch (error: any) {
        res.status(400).json({ message: error.message });
    }
};

export const createSpreadsheet = async (req: Request, res: Response) => {
    try {
        const { name, type } = req.body as PrismaSpreadsheet;
        const userId = (req as any).user.uid;

        const spreadsheet = await spreadsheetService.createSpreadsheet(name, type, userId);
        res.status(201).json(spreadsheet);
    } catch (error: any) {
        res.status(400).json({ message: error.message });
    }
};

export const deleteSpreadsheet = async (req: Request, res: Response) => {
    try {
        const spreadsheetId = parseInt(req.params.spreadsheetId, 10);
        const userId = (req as any).user.uid;

        await spreadsheetService.deleteSpreadsheet(spreadsheetId, userId);
        res.status(200).json({ message: 'Spreadsheet deleted successfully' });
    } catch (error: any) {
        res.status(400).json({ message: error.message });
    }
};

export const setName = async (req: Request, res: Response) => {
    try {
        const spreadsheetId = parseInt(req.params.spreadsheetId, 10);
        const { name } = req.body;
        const userId = (req as any).user.uid;

        const updatedSpreadsheet = await spreadsheetService.setName(spreadsheetId, name, userId);
        res.status(200).json(updatedSpreadsheet);
    } catch (error: any) {
        res.status(400).json({ message: error.message });
    }
};

export const setLastOpened = async (req: Request, res: Response) => {
    try {
        const spreadsheetId = parseInt(req.params.spreadsheetId, 10);
        const userId = (req as any).user.uid;

        const updatedSpreadsheet = await spreadsheetService.setLastOpened(spreadsheetId, userId);
        res.status(200).json(updatedSpreadsheet);
    } catch (error: any) {
        res.status(400).json({ message: error.message });
    }
};

export const updateSharedUsersIds = async (req: Request, res: Response) => {
    try {
        const spreadsheetId = parseInt(req.params.spreadsheetId, 10);
        const { email, permission } = req.body;
        const userId = (req as any).user.uid;

        const updatedSheet = await spreadsheetService.updateSharedUsersIds(spreadsheetId, email, permission, userId);
        res.status(200).json(updatedSheet);
    } catch (error: any) {
        res.status(400).json({ message: error.message });
    }
};
