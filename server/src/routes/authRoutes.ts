import { Router } from 'express';
import * as authController from '../controllers/authController';

const authRoutes = Router();

authRoutes.post('/auth/signup', authController.signUp);
authRoutes.post('/auth/login', authController.logIn);
authRoutes.post('/auth/forgot-pwd', authController.forgotPass);
authRoutes.post('/auth/reset-pwd', authController.resetPass);

export default authRoutes;
