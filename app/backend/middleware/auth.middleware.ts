import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../utils/jwt';

export interface AuthenticatedUser {
  id: string;
  username: string;
  email: string;
  role: string;
}

// Extender el tipo Request para incluir user
declare global {
  namespace Express {
    interface Request {
      user?: AuthenticatedUser;
    }
  }
}

/**
 * Middleware để xác thực JWT token từ headers
 */
export class AuthMiddleware {
  /**
   * Xác thực token từ Authorization header
   * @param headers Headers object từ request
   * @returns User info nếu token hợp lệ, throw error nếu không
   */
  static async authenticate(headers: any): Promise<AuthenticatedUser> {
    const authHeader = headers['Authorization'] || headers['authorization'];
    
    if (!authHeader) {
      throw new Error('Authorization header is required');
    }

    if (!authHeader.startsWith('Bearer ')) {
      throw new Error('Invalid authorization format. Use Bearer <token>');
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    try {
      const decoded = verifyToken(token) as any;
      
      if (!decoded || !decoded.id) {
        throw new Error('Invalid token payload');
      }

      return {
        id: decoded.id,
        username: decoded.username,
        email: decoded.email,
        role: decoded.role
      };
    } catch (error) {
      throw new Error('Invalid or expired token');
    }
  }

  /**
   * Kiểm tra xem có token trong headers không (optional auth)
   * @param headers Headers object từ request
   * @returns User info nếu có token hợp lệ, null nếu không có token
   */
  static async optionalAuthenticate(headers: any): Promise<AuthenticatedUser | null> {
    try {
      return await this.authenticate(headers);
    } catch (error) {
      return null;
    }
  }

  /**
   * Kiểm tra quyền truy cập
   * @param user User info từ token
   * @param requiredRole Role cần thiết
   * @returns true nếu có quyền, false nếu không
   */
  static hasRole(user: AuthenticatedUser, requiredRole: string): boolean {
    if (requiredRole === 'admin' && user.role === 'admin') {
      return true;
    }
    
    if (requiredRole === 'user' && (user.role === 'user' || user.role === 'admin')) {
      return true;
    }
    
    return false;
  }
}

/**
 * Express middleware para autenticación JWT
 * Extrae el token del header Authorization y valida el usuario
 */
export const authenticateJWT = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const user = await AuthMiddleware.authenticate(req.headers);
    req.user = user;
    next();
  } catch (error: any) {
    res.status(401).json({
      success: false,
      message: error.message || 'Unauthorized',
      error: 'UNAUTHORIZED'
    });
  }
};