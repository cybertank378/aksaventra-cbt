import { jwtVerify, SignJWT } from "jose";
import type { AuthJwtPayload } from "@/proxy";

export class JwtProvider {
  private readonly encodedSecret: Uint8Array;

  constructor(
    secretKey = process.env.CBT_JWT_SECRET ||
      "aksaventra_default_jwt_secret_dev_key_32_chars_long",
  ) {
    this.encodedSecret = new TextEncoder().encode(secretKey);
  }

  /**
   * Generates a signed JWT session token with HS256 algorithm.
   */
  public async signToken(
    payload: AuthJwtPayload,
    expiration = "12h",
  ): Promise<string> {
    return await new SignJWT({ ...payload })
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .setExpirationTime(expiration)
      .sign(this.encodedSecret);
  }

  /**
   * Verifies and decodes a signed JWT session token.
   */
  public async verifyToken(token: string): Promise<AuthJwtPayload | null> {
    try {
      const { payload } = await jwtVerify(token, this.encodedSecret);
      return payload as unknown as AuthJwtPayload;
    } catch (_err) {
      return null;
    }
  }
}

export const jwtProvider = new JwtProvider();
