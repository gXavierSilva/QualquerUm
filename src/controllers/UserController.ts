import { Request, Response } from "express";
import { getCustomRepository } from "typeorm";
import { hash } from "bcryptjs";
import UserRespository from "../repositories/UserRepository";
import RoleRepository from "../repositories/RoleRepository";

class UserController {
  async create(request: Request, response: Response) {
    const userRespository = getCustomRepository(UserRespository);
    const roleRespository = getCustomRepository(RoleRepository);

    const { name, username, password, role_id } = request.body;

    const existUser = await userRespository.findOne({ username });

    if (existUser) {
      return response.status(400).json({ message: "User already exists!" });
    }

    const passwordHashed = await hash(password, 8);

    const role = await roleRespository.findOne({ name: role_id });

    if (!role) {
      return response.status(400).json({ message: "Role not exists!" });
    }

    const user = userRespository.create({
      name,
      username,
      password: passwordHashed,
      role_id: role.id,
    });

    await userRespository.save(user);

    // @ts-ignore;
    delete user.password;

    // @ts-ignore;
    delete user.role_id;

    return response
      .status(201)
      .json({ message: "USUÁRIO CRIADO COM SUCESSO!", user, role });
  }
}

export default new UserController();
