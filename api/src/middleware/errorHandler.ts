import { Prisma } from "@prisma/client";
import type { ErrorRequestHandler, RequestHandler } from "express";
import { ZodError } from "zod";

import { env } from "../config/env.js";
import { AppError } from "../errors/AppError.js";

export const notFoundHandler: RequestHandler = (request, response) => {
  response.status(404).json({
    error: {
      code: "ROUTE_NOT_FOUND",
      message: "Rota nao encontrada.",
      details: [{ path: request.path, message: "Verifique metodo e caminho." }],
    },
  });
};

export const errorHandler: ErrorRequestHandler = (
  error,
  _request,
  response,
  _next,
) => {
  if (error instanceof ZodError) {
    response.status(422).json({
      error: {
        code: "VALIDATION_ERROR",
        message: "Os dados enviados sao invalidos.",
        details: error.issues.map((issue) => ({
          path: issue.path.join("."),
          message: issue.message,
        })),
      },
    });
    return;
  }

  if (error instanceof AppError) {
    response.status(error.status).json({
      error: {
        code: error.code,
        message: error.message,
        details: error.details,
      },
    });
    return;
  }

  if (
    error instanceof Prisma.PrismaClientKnownRequestError &&
    error.code === "P2002"
  ) {
    response.status(409).json({
      error: {
        code: "RESOURCE_CONFLICT",
        message: "Ja existe um recurso com os mesmos dados unicos.",
        details: [],
      },
    });
    return;
  }

  if (env.NODE_ENV !== "test") {
    console.error(
      "Unhandled request error:",
      error instanceof Error ? error.message : "unknown error",
    );
  }
  response.status(500).json({
    error: {
      code: "INTERNAL_ERROR",
      message: "Ocorreu um erro interno inesperado.",
      details: [],
    },
  });
};
