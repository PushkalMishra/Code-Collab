"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const auth = (req, res, next) => {
    try {
        const token = req.header('Authorization')?.replace('Bearer ', '');
        if (!token) {
            throw new Error('No token provided');
        }
        const secret = process.env.JWT_SECRET;
        if (!secret) {
            throw new Error('JWT_SECRET is not defined');
        }
        const decoded = jsonwebtoken_1.default.verify(token, secret);
        req.user = { _id: decoded.userId };
        console.log('Auth middleware: Real user ID assigned. req.user:', req.user);
        next();
    }
    catch (error) {
        console.error('Auth middleware error:', error);
        res.status(401).send('Please authenticate.');
    }
};
exports.default = auth;
