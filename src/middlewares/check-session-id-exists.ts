import { FastifyReply, FastifyRequest } from "fastify";
import { knex } from "../database";

export async function checkSessionIdExists(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const { sessionId } = request.cookies;
  console.log(sessionId)
  const isUser = await knex("users").where("id", sessionId).select().first();
  
  if (!isUser) {
    return reply.status(401).send({
      error: "Unauthorized.",
    });
  }

  request.userId = isUser.id;
}
