import { FastifyInstance } from "fastify";
import { z } from "zod";
import { randomUUID } from "node:crypto";
import { knex } from "../database";
import { checkSessionIdExists } from "../middlewares/check-session-id-exists";

const currentDate = new Date().toISOString();

export async function mealsRoutes(app: FastifyInstance) {
  app.get("/", { preHandler: [checkSessionIdExists] }, async (request) => {
    const meals = await knex("meals").where("user_id", request.userId).select();
    return {
      amount: meals.length,
      data: meals,
    };
  });

  app.get(
    "/:id",
    { preHandler: [checkSessionIdExists] },
    async (request, reply) => {
      const getMealParamsSchema = z.object({
        id: z.string().uuid(),
      });

      const { id } = getMealParamsSchema.parse(request.params);

      const meal = await knex("meals").where("id", id).select().first();

      if (!meal)
        return reply.status(404).send({ message: "Refeição não encontrada." });

      return meal;
    }
  );

  app.post(
    "/",
    { preHandler: [checkSessionIdExists] },
    async (request, reply) => {
      const createMealSchema = z.object({
        name: z.string(),
        description: z.string(),
        is_on_diet: z.boolean(),
        date: z.coerce.date(),
      });

      const { name, description, is_on_diet, date } = createMealSchema.parse(
        request.body
      );

      const isUser = await knex("users")
        .where("id", request.userId)
        .select()
        .first();

      if (!isUser)
        return reply.status(400).send({ message: "user_id não encontrado." });

      await knex("meals").insert({
        id: randomUUID(),
        date: date.getTime(),
        name,
        description,
        is_on_diet,
        user_id: request.userId,
        updated_at: currentDate,
      });

      return reply
        .status(201)
        .send({ message: "Refeição criada com sucesso!" });
    }
  );

  app.put(
    "/:id",
    { preHandler: [checkSessionIdExists] },
    async (request, reply) => {
      const getMealParamsSchema = z.object({
        id: z.string().uuid(),
      });

      const { id } = getMealParamsSchema.parse(request.params);

      const createMealSchema = z.object({
        name: z.string(),
        description: z.string(),
        is_on_diet: z.boolean(),
        date: z.coerce.date(),
      });

      const { name, date, description, is_on_diet } = createMealSchema.parse(
        request.body
      );

      const meal = await knex("meals").where("id", id).select().first();
      if (!meal)
        return reply.status(404).send({ message: "Meal not found." });

      await knex("meals").where("id", id).update({
        name,
        description,
        is_on_diet,
        date: date.toISOString(),
        updated_at: date.toISOString(),
      });

      return reply
        .status(201)
        .send({ message: "Refeição atualizada com sucesso." });
    }
  );
}
