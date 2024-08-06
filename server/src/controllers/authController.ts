// src/controllers/authController.ts
import type { Request, Response } from 'express';
import * as authService from "../services/authService";

export const signUp = async (req: Request, res: Response) => {
  try {
    const { username, email, password } = req.body;
    const token = await authService.signUp(username, email, password);
    res.status(201).json({ token });
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

export const logIn = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    const token = await authService.logIn(email, password);
    res.status(200).json({ token });
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};