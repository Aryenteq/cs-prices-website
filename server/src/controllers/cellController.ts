import type { Request, Response } from 'express';
import * as cellService from "../services/cellService";

export const setBgColor = async (req: Request, res: Response) => {
    try {
        const cellId = parseInt(req.params.cellId, 10);
        const { bgColor } = req.body;
        const userId = (req as any).user.uid;

        const updatedCell = await cellService.setBgColor(cellId, bgColor, userId);
        res.status(200).json(updatedCell);
    } catch (error: any) {
        res.status(400).json({ message: error.message });
    }
};

export const setColor = async (req: Request, res: Response) => {
    try {
        const cellId = parseInt(req.params.cellId, 10);
        const { color } = req.body;
        const userId = (req as any).user.uid;

        const updatedCell = await cellService.setColor(cellId, color, userId);
        res.status(200).json(updatedCell);
    } catch (error: any) {
        res.status(400).json({ message: error.message });
    }
};

export const updateStyle = async (req: Request, res: Response) => {
    try {
        const cellId = parseInt(req.params.cellId, 10);
        const { style } = req.body; // This should be a JSON object representing the style
        const userId = (req as any).user.uid;

        const updatedCell = await cellService.updateStyle(cellId, style, userId);
        res.status(200).json(updatedCell);
    } catch (error: any) {
        res.status(400).json({ message: error.message });
    }
};

export const setHorizontalAlignment = async (req: Request, res: Response) => {
    try {
        const cellId = parseInt(req.params.cellId, 10);
        const { hAlignment } = req.body;
        const userId = (req as any).user.uid;

        const updatedCell = await cellService.setHorizontalAlignment(cellId, hAlignment, userId);
        res.status(200).json(updatedCell);
    } catch (error: any) {
        res.status(400).json({ message: error.message });
    }
};

export const setVerticalAlignment = async (req: Request, res: Response) => {
    try {
        const cellId = parseInt(req.params.cellId, 10);
        const { vAlignment } = req.body;
        const userId = (req as any).user.uid;

        const updatedCell = await cellService.setVerticalAlignment(cellId, vAlignment, userId);
        res.status(200).json(updatedCell);
    } catch (error: any) {
        res.status(400).json({ message: error.message });
    }
};

export const setContent = async (req: Request, res: Response) => {
    try {
        const cellId = parseInt(req.params.cellId, 10);
        const { content } = req.body;
        const userId = (req as any).user.uid;

        const updatedCell = await cellService.setContent(cellId, content, userId);
        res.status(200).json(updatedCell);
    } catch (error: any) {
        res.status(400).json({ message: error.message });
    }
};