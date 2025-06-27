import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

declare global {
  namespace Express {
    interface Request {
      user?: { _id: string };
    }
  }
}

const auth = (req: Request, res: Response, next: NextFunction) => {
    try {
      const token = req.header('Authorization')?.replace('Bearer ', '');
      console.log('DEBUG AUTH: token =', token);
      if (!token) {
        throw new Error('No token provided');
      }
      const secret = process.env.JWT_SECRET;
      if (!secret) {
        throw new Error('JWT_SECRET is not defined');
      }
      const decoded: any = jwt.verify(token, secret);
      console.log('DEBUG AUTH: decoded =', decoded);
      req.user = { _id: decoded.userId };
      console.log('Auth middleware: Real user ID assigned. req.user:', req.user);
      next();
    } catch (error) {
      console.error('Auth middleware error:', error);
      res.status(401).send('Please authenticate.');
    }
  };
  
  export default auth;