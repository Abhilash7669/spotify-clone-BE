import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { JWT_SECRET } from "../config/env.config.js";

export namespace LILLY_AUTH {
  export async function signJWT(userId: string): Promise<string> {
    let token = jwt.sign({ userId }, JWT_SECRET as string, { expiresIn: "1h" });

    return token;
  }

  export async function verifyJWT<T>(token: string) {
    const decoded = jwt.verify(token, JWT_SECRET as string);
    return decoded as T;
  }

  export async function verifyPassword(
    password: string,
    hashedPassword: string
  ): Promise<boolean> {
    const result = await bcrypt.compare(password, hashedPassword);
    return result;
  }

  export async function hashPassword(
    password: string,
    options?: { saltRound?: number }
  ): Promise<string> {
    const salt = await bcrypt.genSalt(options?.saltRound || 10);
    const hashedPassword = await bcrypt.hash(password, salt);

    return hashedPassword;
  }
}
