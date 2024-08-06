import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { db } from '../db';

const SECRET_KEY = process.env.JWT_SECRET!;

if (!SECRET_KEY) {
    throw new Error("JWT_SECRET not found");
}

export const signUp = async (username: string, email: string, password: string): Promise<string> => {
    const passwordRegex = /^(?=.*\d).{8,}$/;
    if (!passwordRegex.test(password)) {
        throw new Error('Password must be at least 8 characters long and include at least one digit');
    }

    const existingUser = await db.user.findUnique({ where: { email } });
    if (existingUser) {
        throw new Error('User already exists');
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await db.user.create({
        data: { username, email, password: hashedPassword },
    });

    return jwt.sign({ username: user.username }, SECRET_KEY, { expiresIn: '1h' });
};

export const logIn = async (email: string, password: string): Promise<string> => {
    const user = await db.user.findUnique({ where: { email } });
    if (!user) {
        throw new Error('Invalid credentials');
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
        throw new Error('Invalid credentials');
    }

    return jwt.sign({ username: user.username }, SECRET_KEY, { expiresIn: '1h' });
};
