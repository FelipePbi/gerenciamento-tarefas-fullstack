import { Prisma, type PrismaClient } from "@prisma/client";
import { Router } from "express";

import { AppError } from "../errors/AppError.js";
import {
  idParamsSchema,
  taskInputSchema,
  tasksQuerySchema,
  taskStatusSchema,
  type TaskInput,
} from "../validation/schemas.js";

const taskInclude = {
  taskTeams: {
    include: { team: true },
    orderBy: { team: { name: "asc" as const } },
  },
} satisfies Prisma.TaskInclude;

type TaskWithTeams = Prisma.TaskGetPayload<{ include: typeof taskInclude }>;

function serializeTask(task: TaskWithTeams) {
  const { taskTeams, ...data } = task;
  return { ...data, teams: taskTeams.map((link) => link.team) };
}

function meta(total: number, limit: number, offset: number) {
  return { total, limit, offset, hasNext: offset + limit < total };
}

async function ensureTeamsExist(
  prisma: PrismaClient,
  teamIds: string[],
): Promise<void> {
  if (teamIds.length === 0) return;
  const count = await prisma.team.count({ where: { id: { in: teamIds } } });
  if (count !== teamIds.length) {
    throw new AppError(
      422,
      "INVALID_RELATIONSHIP",
      "Um ou mais times informados nao existem.",
    );
  }
}

function taskData(input: TaskInput): Prisma.TaskUncheckedCreateInput {
  return {
    title: input.title,
    description: input.description ?? null,
    status: input.status,
  };
}

function orderBy(sort: string): Prisma.TaskOrderByWithRelationInput[] {
  const [field, direction] = sort.split(":") as [
    "createdAt" | "updatedAt" | "title",
    Prisma.SortOrder,
  ];
  return [{ [field]: direction }, { id: "asc" }];
}

export function createTasksRouter(prisma: PrismaClient): Router {
  const router = Router();

  router.get("/", async (request, response) => {
    const query = tasksQuerySchema.parse(request.query);
    const where: Prisma.TaskWhereInput = {
      ...(query.status ? { status: query.status } : {}),
      ...(query.teamId
        ? { taskTeams: { some: { teamId: query.teamId } } }
        : {}),
      ...(query.search
        ? {
            OR: [
              { title: { contains: query.search, mode: "insensitive" } },
              { description: { contains: query.search, mode: "insensitive" } },
            ],
          }
        : {}),
    };
    const [total, tasks] = await prisma.$transaction([
      prisma.task.count({ where }),
      prisma.task.findMany({
        where,
        include: taskInclude,
        orderBy: orderBy(query.sort),
        skip: query.offset,
        take: query.limit,
      }),
    ]);
    response.json({
      data: tasks.map(serializeTask),
      meta: meta(total, query.limit, query.offset),
    });
  });

  router.get("/:id", async (request, response) => {
    const { id } = idParamsSchema.parse(request.params);
    const task = await prisma.task.findUnique({
      where: { id },
      include: taskInclude,
    });
    if (!task) {
      throw new AppError(404, "TASK_NOT_FOUND", "Tarefa nao encontrada.");
    }
    response.json({ data: serializeTask(task) });
  });

  router.post("/", async (request, response) => {
    const input = taskInputSchema.parse(request.body);
    await ensureTeamsExist(prisma, input.teamIds);
    const task = await prisma.task.create({
      data: {
        ...taskData(input),
        taskTeams: { create: input.teamIds.map((teamId) => ({ teamId })) },
      },
      include: taskInclude,
    });
    response.status(201).json({ data: serializeTask(task) });
  });

  router.put("/:id", async (request, response) => {
    const { id } = idParamsSchema.parse(request.params);
    const input = taskInputSchema.parse(request.body);
    await ensureTeamsExist(prisma, input.teamIds);
    const existing = await prisma.task.findUnique({
      where: { id },
      select: { id: true },
    });
    if (!existing) {
      throw new AppError(404, "TASK_NOT_FOUND", "Tarefa nao encontrada.");
    }
    const task = await prisma.$transaction(async (transaction) => {
      await transaction.task.update({ where: { id }, data: taskData(input) });
      await transaction.taskTeam.deleteMany({ where: { taskId: id } });
      if (input.teamIds.length > 0) {
        await transaction.taskTeam.createMany({
          data: input.teamIds.map((teamId) => ({ taskId: id, teamId })),
        });
      }
      return transaction.task.findUniqueOrThrow({
        where: { id },
        include: taskInclude,
      });
    });
    response.json({ data: serializeTask(task) });
  });

  router.patch("/:id/status", async (request, response) => {
    const { id } = idParamsSchema.parse(request.params);
    const { status } = taskStatusSchema.parse(request.body);
    const existing = await prisma.task.findUnique({
      where: { id },
      select: { id: true },
    });
    if (!existing) {
      throw new AppError(404, "TASK_NOT_FOUND", "Tarefa nao encontrada.");
    }
    const task = await prisma.task.update({
      where: { id },
      data: { status },
      include: taskInclude,
    });
    response.json({ data: serializeTask(task) });
  });

  router.delete("/:id", async (request, response) => {
    const { id } = idParamsSchema.parse(request.params);
    const existing = await prisma.task.findUnique({
      where: { id },
      select: { id: true },
    });
    if (!existing) {
      throw new AppError(404, "TASK_NOT_FOUND", "Tarefa nao encontrada.");
    }
    await prisma.task.delete({ where: { id } });
    response.status(204).send();
  });

  return router;
}
