import 'server-only';
import {
  SignJWT,
  jwtVerify,
  decodeJwt,
  type JWTPayload as JoseJWTPayload,
} from 'jose';

export interface JWTPayload extends JoseJWTPayload {
  id: string;
}

function getEnv(name: string): string {
  const v = process.env[name];
  if (!v) throw new Error(`${name} is not defined`);
  return v;
}

function getKeyFromEnv(name: string): Uint8Array {
  return new TextEncoder().encode(getEnv(name));
}

export class DcHubsJWT {
  static async sign(payload: { id: string }): Promise<string> {
    const key = getKeyFromEnv('JWT_SECRET');
    return await new SignJWT({ id: payload.id })
      .setProtectedHeader({ alg: 'HS256', typ: 'JWT' })
      .setIssuedAt()
      .sign(key);
  }

  static async refreshSign(payload: { id: string }): Promise<string> {
    const key = getKeyFromEnv('REFRESH_JWT_SECRET');
    return await new SignJWT({ id: payload.id })
      .setProtectedHeader({ alg: 'HS256', typ: 'JWT' })
      .setIssuedAt()
      .sign(key);
  }

  static async signTokenPair(payload: { id: string }): Promise<{
    id: string;
    accessToken: string;
    refreshToken: string;
  }> {
    const id = payload.id;
    const [accessToken, refreshToken] = await Promise.all([
      this.sign({ id }),
      this.refreshSign({ id }),
    ]);
    return { id, accessToken, refreshToken };
  }

  /** 驗證並解析 JWT Token */
  static async verify(token: string): Promise<JWTPayload | null> {
    try {
      const key = getKeyFromEnv('JWT_SECRET');
      // ✅ 用泛型讓 jose 回傳你的 payload 形狀
      const { payload } = await jwtVerify(token, key, {
        algorithms: ['HS256'],
      });
      if (!payload || typeof payload.id !== 'string') return null;
      return payload as JWTPayload;
    } catch (err) {
      console.error('JWT verification failed:', err);
      return null;
    }
  }

  static async refresh_verify(token: string): Promise<JWTPayload | null> {
    try {
      const key = getKeyFromEnv('REFRESH_JWT_SECRET');
      const { payload } = await jwtVerify(token, key, {
        algorithms: ['HS256'],
      });
      if (!payload || typeof payload.id !== 'string') return null;
      return payload as JWTPayload;
    } catch (err) {
      console.error('Refresh JWT verification failed:', err);
      return null;
    }
  }

  /** 僅解析（不驗簽） */
  static decode(token: string): JWTPayload | null {
    try {
      const payload = decodeJwt(token);
      if (!payload || typeof payload.id !== 'string') return null;
      return payload as JWTPayload;
    } catch (error) {
      console.error('JWT decode failed:', error);
      return null;
    }
  }

  /** 距離過期 < 5 小時即將過期 */
  static isTokenExpiringSoon(token: string): boolean {
    const decoded = this.decode(token);
    if (!decoded || !decoded.exp) return true;
    const now = Math.floor(Date.now() / 1000);
    return decoded.exp - now < 5 * 60 * 60;
  }
}
