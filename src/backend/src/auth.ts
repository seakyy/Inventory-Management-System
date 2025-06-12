import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import { Request, Response, NextFunction } from 'express';

dotenv.config();
const SECRET = process.env.SECRET_KEY || 'fallback';

export interface RequestWithUser extends Request {
    user?: {
        username: string;
        role: string;
    };
}

export const generateToken = (payload: { username: string; role: string }) => {
    return jwt.sign(payload, SECRET, { expiresIn: '1h' });
};

export const verifyToken = (req: RequestWithUser, res: Response, next: NextFunction): void => {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        res.status(401).json({ message: 'Kein Token vorhanden' });
        return;
    }

    const token = authHeader.split(' ')[1];
    try {
        const decoded = jwt.verify(token, SECRET) as { username: string; role: string };
        req.user = decoded;
        next();
    } catch {
        res.status(403).json({ message: 'Ungültiger Token' });
    }
};

export const requireRole = (role: string) => {
    return (req: RequestWithUser, res: Response, next: NextFunction): void => {
        if (!req.user || req.user.role !== role) {
            res.status(403).json({ message: 'Zugriff verweigert' });
            return;
        }
        next();
    };
};
