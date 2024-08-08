import crypto from 'crypto';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { db } from '../db';

import { sendMail } from '../utils/mailSender';

const SECRET_KEY = process.env.JWT_SECRET!;

if (!SECRET_KEY) {
    throw new Error("JWT_SECRET not found");
}

export const signUp = async (username: string, email: string, password: string): Promise<string> => {
    const passwordRegex = /^(?=.*\d).{8,}$/;
    if (!passwordRegex.test(password)) {
        throw new Error('Password must be at least 8 characters long and include at least one digit.');
    }

    const existingUser = await db.user.findUnique({ where: { email } });
    if (existingUser) {
        throw new Error('User already exists');
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await db.user.create({
        data: { username, email, password: hashedPassword },
    });

    return jwt.sign({ uid: user.uid, username: user.username, email: user.email, admin: user.admin }, SECRET_KEY, { expiresIn: '1d' });
};

export const logIn = async (email: string, password: string): Promise<string> => {
    const user = await db.user.findUnique({ where: { email } });
    if (!user) {
        throw new Error('Incorrect e-mail');
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
        throw new Error('Incorrect password');
    }

    return jwt.sign({ uid: user.uid, username: user.username, email: user.email, admin: user.admin }, SECRET_KEY, { expiresIn: '1d' });
};

export const forgotPass = async (email: string) => {
    const user = await db.user.findUnique({
        where: { email },
    });

    if (!user) {
        throw new Error('User not found');
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetPasswordExpires = new Date(Date.now() + 3600000); // 1 hour

    await db.user.update({
        where: { email },
        data: {
            resetPasswordToken: resetToken,
            resetPasswordExpires,
        },
    });

    const resetLink = `http://${process.env.CLIENT_IP}:${process.env.CLIENT_PORT}/reset-pwd?token=${resetToken}&email=${user.email}`;
    const emailContent = `
        <div style="background-color: #047500; padding: 20px; text-align: center; font-family: Arial, sans-serif; color: white;">
            <h2>Password Reset</h2>
            <br>
            <p>You requested a password reset. Kindly use the button below to reset your password:</p>
            <p><a href="${resetLink}" style="background-color: #ffffff; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">Reset Password</a></p>
            <p>If you did not request this, please ignore this email.</p>
        </div>
    `;

    await sendMail('IHMLegendAry: Password Reset', user.email, emailContent);
}

export const resetPass = async (newPwd: string, repeatedPwd: string, email: string, token: string) => {
    if(newPwd !== repeatedPwd) {
        throw new Error('Passwords do not match');
    }

    const passwordRegex = /^(?=.*\d).{8,}$/;
    if (!passwordRegex.test(newPwd)) {
        throw new Error('Password must be at least 8 characters long and include at least one digit.');
    }

    const user = await db.user.findUnique({
        where: { email },
    });

    if (!user || user.resetPasswordToken !== token || !user.resetPasswordExpires || user.resetPasswordExpires.getTime() < Date.now()) {
        throw new Error('Invalid or expired token');
    }

    const match = await bcrypt.compare(newPwd, user.password);
    if (match) {
        throw new Error('New password can not be the same as the old one.');
    }

    const hashedPassword = await bcrypt.hash(newPwd, 10);

    await db.user.update({
        where: { email },
        data: {
            password: hashedPassword,
            resetPasswordToken: null,
            resetPasswordExpires: null,
        },
    });
}