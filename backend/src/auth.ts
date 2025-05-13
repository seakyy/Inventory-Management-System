import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import { Request, Response, NextFunction } from 'express';

dotenv.config();

const SECRET = process.env.SECRET_KEY || 'fallback';

export const generateToken = (payload: object) => {
    return jwt.sign(payload, SECRET, { expiresIn: '1h' });
};

export const verifyToken = (req: Request, res: Response, next: NextFunction): void => {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        res.status(401).json({ message: 'Kein Token vorhanden' });
        return;
    }

    const token = authHeader.split(' ')[1];

    try {
        const decoded = jwt.verify(token, SECRET);
        (req as any).user = decoded;
        next();
    } catch {
        res.status(403).json({ message: 'Ungültiger Token' });
    }
};

export const requireRole = (role: string) => {
    return (req: Request, res: Response, next: NextFunction): void => {
        const user = (req as any).user;
        if (user.role !== role) {
            res.status(403).json({ message: 'Zugriff verweigert' });
            return;
        }
        next();
    };
};