import type { Request, Response } from 'express';
import * as sheetService from '../services/sheetService';
import type { Sheet as PrismaSheet } from '@prisma/client';

export const getSheet = async (req: Request, res: Response) => {
    try {
        const spreadsheetId = parseInt(req.params.spreadsheetId, 10);
        const index = parseInt(req.query.index as string, 10);
        const userId = (req as any).user.uid;

        const sheet = await sheetService.getSheet(spreadsheetId, index, userId);
        res.status(200).json(sheet);
    } catch (error: any) {
        res.status(400).json({ message: error.message });
    }
};

export const createSheet = async (req: Request, res: Response) => {
    try {
        const sheet = req.body as PrismaSheet;
        const newSheet = await sheetService.createSheet(sheet);
        res.status(201).json(newSheet);
    } catch (error: any) {
        res.status(400).json({ message: error.message });
    }
};

export const deleteSheet = async (req: Request, res: Response) => {
    try {
        const sheetId = parseInt(req.params.sheetId, 10);
        const userId = (req as any).user.uid;

        await sheetService.deleteSheet(sheetId, userId);
        res.status(200).json({ message: 'Sheet deleted successfully' });
    } catch (error: any) {
        res.status(400).json({ message: error.message });
    }
};

export const setName = async (req: Request, res: Response) => {
    try {
        const sheetId = parseInt(req.params.sheetId, 10);
        const { name } = req.body;
        const userId = (req as any).user.uid;

        const updatedSheet = await sheetService.setName(sheetId, name, userId);
        res.status(200).json(updatedSheet);
    } catch (error: any) {
        res.status(400).json({ message: error.message });
    }
};

export const setIndex = async (req: Request, res: Response) => {
    try {
        const sheetId = parseInt(req.params.sheetId, 10);
        const { newIndex } = req.body;
        const userId = (req as any).user.uid;

        const updatedSheet = await sheetService.setIndex(sheetId, newIndex, userId);
        res.status(200).json(updatedSheet);
    } catch (error: any) {
        res.status(400).json({ message: error.message });
    }
};

export const addRows = async (req: Request, res: Response) => {
    try {
        const sheetId = parseInt(req.params.sheetId, 10);
        const { startIndex, rowsNumber } = req.body;
        const userId = (req as any).user.uid;

        const updatedSheet = await sheetService.addRows(sheetId, startIndex, rowsNumber, userId);
        res.status(200).json(updatedSheet);
    } catch (error: any) {
        res.status(400).json({ message: error.message });
    }
};

export const addCols = async (req: Request, res: Response) => {
    try {
        const sheetId = parseInt(req.params.sheetId, 10);
        const { startIndex, colsNumber } = req.body;
        const userId = (req as any).user.uid;

        const updatedSheet = await sheetService.addCols(sheetId, startIndex, colsNumber, userId);
        res.status(200).json(updatedSheet);
    } catch (error: any) {
        res.status(400).json({ message: error.message });
    }
};

export const deleteRows = async (req: Request, res: Response) => {
    try {
        const sheetId = parseInt(req.params.sheetId, 10);
        const { startIndex, rowsNumber } = req.body;
        const userId = (req as any).user.uid;

        const updatedSheet = await sheetService.deleteRows(sheetId, startIndex, rowsNumber, userId);
        res.status(200).json(updatedSheet);
    } catch (error: any) {
        res.status(400).json({ message: error.message });
    }
};

export const deleteCols = async (req: Request, res: Response) => {
    try {
        const sheetId = parseInt(req.params.sheetId, 10);
        const { startIndex, colsNumber } = req.body;
        const userId = (req as any).user.uid;

        const updatedSheet = await sheetService.deleteCols(sheetId, startIndex, colsNumber, userId);
        res.status(200).json(updatedSheet);
    } catch (error: any) {
        res.status(400).json({ message: error.message });
    }
};

export const updateRowsHeight = async (req: Request, res: Response) => {
    try {
        const sheetId = parseInt(req.params.sheetId, 10);
        const { index, height } = req.body;
        const userId = (req as any).user.uid;

        const updatedSheet = await sheetService.updateRowsHeight(sheetId, index, height, userId);
        res.status(200).json(updatedSheet);
    } catch (error: any) {
        res.status(400).json({ message: error.message });
    }
};

export const updateColsWidth = async (req: Request, res: Response) => {
    try {
        const sheetId = parseInt(req.params.sheetId, 10);
        const { index, height } = req.body;
        const userId = (req as any).user.uid;

        const updatedSheet = await sheetService.updateColsWidth(sheetId, index, height, userId);
        res.status(200).json(updatedSheet);
    } catch (error: any) {
        res.status(400).json({ message: error.message });
    }
};

export const updateHiddenRows = async (req: Request, res: Response) => {
    try {
        const sheetId = parseInt(req.params.sheetId, 10);
        const { index, hidden } = req.body;
        const userId = (req as any).user.uid;

        const updatedSheet = await sheetService.updateHiddenRows(sheetId, index, hidden, userId);
        res.status(200).json(updatedSheet);
    } catch (error: any) {
        res.status(400).json({ message: error.message });
    }
};

export const updateHiddenCols = async (req: Request, res: Response) => {
    try {
        const sheetId = parseInt(req.params.sheetId, 10);
        const { index, hidden } = req.body;
        const userId = (req as any).user.uid;

        const updatedSheet = await sheetService.updateHiddenCols(sheetId, index, hidden, userId);
        res.status(200).json(updatedSheet);
    } catch (error: any) {
        res.status(400).json({ message: error.message });
    }
};