import { z } from "zod";

export const taskStatuses = ["PENDING", "IN_PROGRESS", "COMPLETED"] as const;

const optionalText = (maximum: number) =>
  z
    .union([z.string().trim().max(maximum), z.null()])
    .optional()
    .transform((value) => (value === "" ? null : value));

export const idParamsSchema = z.object({ id: z.uuid() });

export const teamInputSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(3, "Nome deve ter ao menos 3 caracteres.")
      .max(120),
    colorHex: z
      .string()
      .trim()
      .regex(/^#[0-9A-Fa-f]{6}$/, "Cor deve usar formato #RRGGBB.")
      .transform((value) => value.toUpperCase()),
  })
  .strict();

export const teamsQuerySchema = z.object({
  search: z.string().trim().max(120).optional().default(""),
  limit: z.coerce.number().int().min(1).max(100).optional().default(20),
  offset: z.coerce.number().int().min(0).optional().default(0),
});

const teamIdsSchema = z
  .array(z.uuid())
  .max(100)
  .optional()
  .default([])
  .transform((ids) => [...new Set(ids)]);

export const taskInputSchema = z
  .object({
    title: z
      .string()
      .trim()
      .min(3, "Titulo deve ter ao menos 3 caracteres.")
      .max(200),
    description: optionalText(2000),
    status: z.enum(taskStatuses).optional().default("PENDING"),
    teamIds: teamIdsSchema,
  })
  .strict();

export const taskStatusSchema = z.object({ status: z.enum(taskStatuses) });

export const tasksQuerySchema = z.object({
  teamId: z.uuid().optional(),
  status: z.enum(taskStatuses).optional(),
  search: z.string().trim().max(200).optional().default(""),
  limit: z.coerce.number().int().min(1).max(100).optional().default(20),
  offset: z.coerce.number().int().min(0).optional().default(0),
  sort: z
    .enum([
      "createdAt:desc",
      "createdAt:asc",
      "updatedAt:desc",
      "title:asc",
      "title:desc",
    ])
    .optional()
    .default("createdAt:desc"),
});

export type TeamInput = z.infer<typeof teamInputSchema>;
export type TaskInput = z.infer<typeof taskInputSchema>;
