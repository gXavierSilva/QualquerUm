import { Request, Response, NextFunction } from "express";
import { decode } from "jsonwebtoken";
import { getCustomRepository } from "typeorm";
import { User } from "../models/User";
import UserRespository from "../repositories/UserRepository";

async function decoder(request: Request): Promise<User | undefined> {
  const authHeader = request.headers.authorization || "";
  const userRepository = getCustomRepository(UserRespository);

  const [, token] = authHeader?.split(" ");

  const payload = decode(token);

  const id = payload?.sub as string;

  const user = await userRepository.findOne(id, { relations: ["roles"] });

  return user;
}

export function is(role: string) {
  const roleAuthorized = async (
    request: Request,
    response: Response,
    next: NextFunction,
  ) => {
    const user = await decoder(request);

    const userRoles = user?.role.name;
    const existsRoles = userRoles?.includes(role);

    if (existsRoles) {
      return next();
    }

    return response.status(401).json({ message: "Not authorized!" });
  };

  return roleAuthorized;
}
