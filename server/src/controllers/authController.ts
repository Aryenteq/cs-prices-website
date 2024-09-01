import type { Request, Response } from 'express';
import * as authService from "../services/authService";
import type { User as PrismaUser } from '@prisma/client';

export const signUp = async (req: Request, res: Response) => {
  try {
    const user = req.body as PrismaUser;

    const tokens = user.registrationType === 'FORM' ? await authService.signUp(user) : await authService.GoogleSignUp(user);
    res.status(201).json(tokens);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

export const logIn = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    const tokens = password ? await authService.logIn(email, password) : await authService.GoogleLogIn(email);
    res.status(200).json(tokens);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

export const refreshToken = async (req: Request, res: Response) => {
  try {
    const { refreshToken } = req.body;
    const tokens = await authService.refreshToken(refreshToken);
    res.status(200).json(tokens);
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