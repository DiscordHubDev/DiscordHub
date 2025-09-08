import { NextRequest } from 'next/server';
import { DcHubsJWT, JWTPayload } from '@/lib/jwt';

/**
 * 從請求中提取 Bearer Token
 */
export function extractBearerToken(req: NextRequest): string | null {
  const authorization = req.headers.get('Authorization');

  if (!authorization) return null;

  const parts = authorization.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    return null;
  }

  return parts[1];
}

/**
 * 驗證 JWT Token 並返回用戶信息
 */
export async function verifyJWTToken(
  token: string,
): Promise<JWTPayload | null> {
  return await DcHubsJWT.verify(token);
}

export async function verifyJWTRefreshToken(
  token: string,
): Promise<JWTPayload | null> {
  return await DcHubsJWT.refresh_verify(token);
}

/**
 * 創建認證用戶對象
 */
export function createAuthenticatedUser(payload: JWTPayload) {
  return {
    id: payload.id,
    sub: payload.id,
  };
}
