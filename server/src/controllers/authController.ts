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

export const forgotPass = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;
    await authService.forgotPass(email);
    res.status(200).json({ "status": "ok", "message": "Reset password email sent" });
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

export const resetPass = async (req: Request, res: Response) => {
  try {
    const { pwd, repeatedPwd, email, token } = req.body;
    await authService.resetPass(pwd, repeatedPwd, email, token);
    res.status(200).json({ "status": "ok", "message": "Password reset successfully" });
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};