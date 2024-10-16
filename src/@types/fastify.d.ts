// FastifyRequestContext
import "fastify";

declare module "fastify" {
  export interface FastifyRequest {
    userId?: string;
    cookies: { sessionId: string };
  }
}
