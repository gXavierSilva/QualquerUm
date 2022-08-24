import { compare } from "bcryptjs";
import { Request, Response } from "express";
import { getCustomRepository } from "typeorm";
import UserRespository from "../repositories/UserRepository";
import { sign } from "jsonwebtoken";

class SessionController {
  async create(request: Request, response: Response) {
    const { username, password } = request.body;

    const userRespository = getCustomRepository(UserRespository);

    const user = await userRespository.findOne(
      { username },
      { relations: ["role"] },
    );

    if (!user) {
      return response.status(400).json({ error: "User not found!" });
    }

    const matchPassword = await compare(password, user.password);

    if (!matchPassword) {
      return response
        .status(400)
        .json({ error: "Incorrect password or username!" });
    }

    // const roles = user.role.map((role: string) => role);

    const token = sign(
      { role: user.role },
      "3103bf0db954932698f60d370d2000ad",
      {
        subject: user.id,
        expiresIn: "1d",
      },
    );

    return response.json({
      token,
      user,
    });
  }
}

export default new SessionController();
