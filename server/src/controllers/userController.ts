import type { Request, Response } from 'express';
import * as userService from '../services/userService';

export const getUserPhoto = async (req: Request, res: Response) => {
    try {
        const userId = parseInt(req.params.userId, 10);

        const photoURL = await userService.getUserPhoto(userId);
        res.status(200).json(photoURL);
    } catch (error: any) {
        res.status(400).json({ message: error.message });
    }
};