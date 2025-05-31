"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireRole = exports.verifyToken = exports.generateToken = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const SECRET = process.env.SECRET_KEY || 'fallback';
const generateToken = (payload) => {
    return jsonwebtoken_1.default.sign(payload, SECRET, { expiresIn: '1h' });
};
exports.generateToken = generateToken;
const verifyToken = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        res.status(401).json({ message: 'Kein Token vorhanden' });
        return;
    }
    const token = authHeader.split(' ')[1];
    try {
        const decoded = jsonwebtoken_1.default.verify(token, SECRET);
        req.user = decoded;
        next();
    }
    catch {
        res.status(403).json({ message: 'Ungültiger Token' });
    }
};
exports.verifyToken = verifyToken;
const requireRole = (role) => {
    return (req, res, next) => {
        const user = req.user;
        if (user.role !== role) {
            res.status(403).json({ message: 'Zugriff verweigert' });
            return;
        }
        next();
    };
};
exports.requireRole = requireRole;
