import { FastifyInstance } from "fastify";
import { z } from "zod";
import { randomUUID } from "node:crypto";
import { knex } from "../database";

const currentDate = new Date().toISOString();

export async function usersRoutes(app: FastifyInstance) {
  app.get("/", async (request) => {
    const users = await knex("users").select();
    return {
      amount: users.length,
      data: users,
    };
  });

  app.post("/", async (request, reply) => {
    const createUserBodySchema = z.object({
      name: z.string(),
      email: z.string().email(),
    });

    const { name, email } = createUserBodySchema.parse(request.body);
    const userByEmail = await knex("users").where({ email }).first();

    if (userByEmail) {
      return reply.status(400).send({ message: "Email já cadastrado." });
    }

    await knex("users").insert({
      id: randomUUID(),
      name,
      email,
      updated_at: currentDate,
    });
    return reply.status(201).send({ message: "Usuário criado com sucesso!" });
  });
}
