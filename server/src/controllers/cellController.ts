import type { Request, Response } from 'express';
import * as cellService from "../services/cellService";

export const setBgColor = async (req: Request, res: Response) => {
    try {
        const { bgColors } = req.body;
        const userId = (req as any).user.uid;

        const updatedCells = await cellService.setBgColor(bgColors, userId);
        res.status(200).json(updatedCells);
    } catch (error: any) {
        res.status(400).json({ message: error.message });
    }
};

export const setColor = async (req: Request, res: Response) => {
    try {
        const { colors } = req.body;
        const userId = (req as any).user.uid;

        const updatedCell = await cellService.setColor(colors, userId);
        res.status(200).json(updatedCell);
    } catch (error: any) {
        res.status(400).json({ message: error.message });
    }
};

export const updateStyle = async (req: Request, res: Response) => {
    try {
        const { styles } = req.body;
        const userId = (req as any).user.uid;

        const updatedCell = await cellService.updateStyle(styles, userId);
        res.status(200).json(updatedCell);
    } catch (error: any) {
        res.status(400).json({ message: error.message });
    }
};

export const setHorizontalAlignment = async (req: Request, res: Response) => {
    try {
        const { hAlignments } = req.body;
        const userId = (req as any).user.uid;

        const updatedCell = await cellService.setHorizontalAlignment(hAlignments, userId);
        res.status(200).json(updatedCell);
    } catch (error: any) {
        res.status(400).json({ message: error.message });
    }
};

export const setVerticalAlignment = async (req: Request, res: Response) => {
    try {
        const { vAlignments } = req.body;
        const userId = (req as any).user.uid;

        const updatedCell = await cellService.setVerticalAlignment(vAlignments, userId);
        res.status(200).json(updatedCell);
    } catch (error: any) {
        res.status(400).json({ message: error.message });
    }
};

// this is the only one that RETURNS an actualized sheet, not just the updated cells
export const setContent = async (req: Request, res: Response) => {
    try {
        const { contents } = req.body;
        const userId = (req as any).user.uid;

        const updatedSheet = await cellService.setContent(contents, userId);
        res.status(200).json(updatedSheet);
    } catch (error: any) {
        res.status(400).json({ message: error.message });
    }
};

export const setPastedContent = async (req: Request, res: Response) => {
    try {
        const { firstCellId, contents } = req.body;
        const userId = (req as any).user.uid;

        const updatedSheet = await cellService.setPastedContent(firstCellId, contents, userId);
        res.status(200).json(updatedSheet);
    } catch (error: any) {
        res.status(400).json({ message: error.message });
    }
};