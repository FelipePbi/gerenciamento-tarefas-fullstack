import { TaskStatus } from "@prisma/client";

import { prisma } from "../src/db/prisma.js";

const teams = [
  {
    id: "11111111-1111-4111-8111-111111111111",
    name: "Produto",
    colorHex: "#B8F500",
  },
  {
    id: "22222222-2222-4222-8222-222222222222",
    name: "Engenharia",
    colorHex: "#F3D400",
  },
  {
    id: "33333333-3333-4333-8333-333333333333",
    name: "Design",
    colorHex: "#00C7D9",
  },
] as const;

const tasks = [
  {
    id: "a1111111-1111-4111-8111-111111111111",
    title: "Revisar fluxo de cadastro",
    description: "Validar estados de erro, carregamento e sucesso.",
    status: TaskStatus.PENDING,
    teamIds: [teams[0].id, teams[2].id],
  },
  {
    id: "a2222222-2222-4222-8222-222222222222",
    title: "Implementar filtros combinados",
    description: "Pesquisa, time, status e ordenacao na mesma consulta.",
    status: TaskStatus.IN_PROGRESS,
    teamIds: [teams[1].id],
  },
  {
    id: "a3333333-3333-4333-8333-333333333333",
    title: "Publicar tokens visuais",
    description: "Centralizar cores, tipografia e espacamentos.",
    status: TaskStatus.COMPLETED,
    teamIds: [teams[2].id],
  },
  {
    id: "a4444444-4444-4444-8444-444444444444",
    title: "Documentar contratos da API",
    description: "Revisar Swagger e exemplos de erro.",
    status: TaskStatus.IN_PROGRESS,
    teamIds: [teams[0].id, teams[1].id],
  },
  {
    id: "a5555555-5555-4555-8555-555555555555",
    title: "Planejar retrospectiva",
    description: "Tarefa deliberadamente sem time associado.",
    status: TaskStatus.PENDING,
    teamIds: [],
  },
  {
    id: "a6666666-6666-4666-8666-666666666666",
    title: "Cobrir rollback otimista",
    description: "Testar restauracao do cache quando a API falhar.",
    status: TaskStatus.COMPLETED,
    teamIds: [teams[1].id],
  },
  {
    id: "a7777777-7777-4777-8777-777777777777",
    title: "Auditar contraste dos componentes",
    description: "Conferir legibilidade sem alterar a referencia visual.",
    status: TaskStatus.PENDING,
    teamIds: [teams[2].id],
  },
  {
    id: "a8888888-8888-4888-8888-888888888888",
    title: "Otimizar consulta de tarefas",
    description: "Evitar N+1 e validar indices dos filtros.",
    status: TaskStatus.IN_PROGRESS,
    teamIds: [teams[1].id],
  },
  {
    id: "a9999999-9999-4999-8999-999999999999",
    title: "Validar cache offline",
    description: "Reabrir o app desconectado e conferir dados persistidos.",
    status: TaskStatus.PENDING,
    teamIds: [teams[0].id, teams[1].id, teams[2].id],
  },
  {
    id: "a0000000-0000-4000-8000-000000000000",
    title: "Finalizar checklist de entrega",
    description: "Executar lint, testes, build e smoke test.",
    status: TaskStatus.COMPLETED,
    teamIds: [teams[0].id],
  },
] as const;

async function seed(): Promise<void> {
  for (const team of teams) {
    await prisma.team.upsert({
      where: { id: team.id },
      create: team,
      update: {
        name: team.name,
        colorHex: team.colorHex,
      },
    });
  }

  for (const task of tasks) {
    await prisma.$transaction(async (transaction) => {
      await transaction.task.upsert({
        where: { id: task.id },
        create: {
          id: task.id,
          title: task.title,
          description: task.description,
          status: task.status,
        },
        update: {
          title: task.title,
          description: task.description,
          status: task.status,
        },
      });
      await transaction.taskTeam.deleteMany({ where: { taskId: task.id } });
      if (task.teamIds.length > 0) {
        await transaction.taskTeam.createMany({
          data: task.teamIds.map((teamId) => ({ taskId: task.id, teamId })),
          skipDuplicates: true,
        });
      }
    });
  }

  console.log(
    `Seed concluido: ${teams.length} times e ${tasks.length} tarefas.`,
  );
}

seed()
  .catch((error) => {
    console.error(
      "Seed falhou:",
      error instanceof Error ? error.message : "erro desconhecido",
    );
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
