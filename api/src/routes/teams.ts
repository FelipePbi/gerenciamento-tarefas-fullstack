import type { PrismaClient } from "@prisma/client";
import { Router } from "express";

import { AppError } from "../errors/AppError.js";
import {
  idParamsSchema,
  teamInputSchema,
  teamsQuerySchema,
} from "../validation/schemas.js";

function meta(total: number, limit: number, offset: number) {
  return { total, limit, offset, hasNext: offset + limit < total };
}

export function createTeamsRouter(prisma: PrismaClient): Router {
  const router = Router();

  router.get("/", async (request, response) => {
    const query = teamsQuerySchema.parse(request.query);
    const where = query.search
      ? {
          name: { contains: query.search, mode: "insensitive" as const },
        }
      : {};
    const [total, teams] = await prisma.$transaction([
      prisma.team.count({ where }),
      prisma.team.findMany({
        where,
        orderBy: [{ name: "asc" }, { id: "asc" }],
        skip: query.offset,
        take: query.limit,
        include: { _count: { select: { taskTeams: true } } },
      }),
    ]);
    response.json({
      data: teams,
      meta: meta(total, query.limit, query.offset),
    });
  });

  router.get("/:id", async (request, response) => {
    const { id } = idParamsSchema.parse(request.params);
    const team = await prisma.team.findUnique({
      where: { id },
      include: { _count: { select: { taskTeams: true } } },
    });
    if (!team) {
      throw new AppError(404, "TEAM_NOT_FOUND", "Time nao encontrado.");
    }
    response.json({ data: team });
  });

  router.post("/", async (request, response) => {
    const input = teamInputSchema.parse(request.body);
    const team = await prisma.team.create({
      data: {
        name: input.name,
        colorHex: input.colorHex,
      },
    });
    response.status(201).json({ data: team });
  });

  router.put("/:id", async (request, response) => {
    const { id } = idParamsSchema.parse(request.params);
    const input = teamInputSchema.parse(request.body);
    const existing = await prisma.team.findUnique({
      where: { id },
      select: { id: true },
    });
    if (!existing) {
      throw new AppError(404, "TEAM_NOT_FOUND", "Time nao encontrado.");
    }
    const team = await prisma.team.update({
      where: { id },
      data: {
        name: input.name,
        colorHex: input.colorHex,
      },
    });
    response.json({ data: team });
  });

  router.delete("/:id", async (request, response) => {
    const { id } = idParamsSchema.parse(request.params);
    const existing = await prisma.team.findUnique({
      where: { id },
      select: { id: true },
    });
    if (!existing) {
      throw new AppError(404, "TEAM_NOT_FOUND", "Time nao encontrado.");
    }
    await prisma.team.delete({ where: { id } });
    response.status(204).send();
  });

  return router;
}
