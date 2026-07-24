import request from "supertest";
import { afterAll, describe, expect, it } from "vitest";

import { app } from "../src/app.js";
import { prisma } from "../src/db/prisma.js";

describe("teams and tasks integration", () => {
  const suffix = `${Date.now()}-${Math.random().toString(16).slice(2)}`;
  const createdTeamIds: string[] = [];
  const createdTaskIds: string[] = [];

  afterAll(async () => {
    await prisma.task.deleteMany({ where: { id: { in: createdTaskIds } } });
    await prisma.team.deleteMany({ where: { id: { in: createdTeamIds } } });
    await prisma.$disconnect();
  });

  it("executes CRUD, N:N, filters, pagination, status and deletion rules", async () => {
    const teamAResponse = await request(app)
      .post("/api/teams")
      .send({
        name: `Integracao Produto ${suffix}`,
        colorHex: "#123ABC",
      });
    expect(teamAResponse.status).toBe(201);
    expect(teamAResponse.body.data).not.toHaveProperty("description");
    const teamA = teamAResponse.body.data as { id: string };
    createdTeamIds.push(teamA.id);

    const teamBResponse = await request(app)
      .post("/api/teams")
      .send({
        name: `Integracao Design ${suffix}`,
        colorHex: "#00AA77",
      });
    expect(teamBResponse.status).toBe(201);
    const teamB = teamBResponse.body.data as { id: string };
    createdTeamIds.push(teamB.id);

    const conflict = await request(app)
      .post("/api/teams")
      .send({
        name: `Integracao Produto ${suffix}`,
        colorHex: "#FFFFFF",
      });
    expect(conflict.status).toBe(409);
    expect(conflict.body.error.code).toBe("RESOURCE_CONFLICT");

    const obsoleteTeamField = await request(app)
      .post("/api/teams")
      .send({
        name: `Integracao Legado ${suffix}`,
        colorHex: "#123ABC",
        description: "Campo removido",
      });
    expect(obsoleteTeamField.status).toBe(422);

    const search = await request(app)
      .get("/api/teams")
      .query({ search: `Produto ${suffix}`, limit: 1, offset: 0 });
    expect(search.status).toBe(200);
    expect(search.body.data).toHaveLength(1);
    expect(search.body.meta).toMatchObject({
      total: 1,
      limit: 1,
      offset: 0,
      hasNext: false,
    });

    const updatedTeam = await request(app)
      .put(`/api/teams/${teamA.id}`)
      .send({
        name: `Integracao Produto Editado ${suffix}`,
        colorHex: "#ABCDEF",
      });
    expect(updatedTeam.status).toBe(200);
    expect(updatedTeam.body.data.colorHex).toBe("#ABCDEF");

    const noTeamTaskResponse = await request(app)
      .post("/api/tasks")
      .send({
        title: `Tarefa sem time ${suffix}`,
        description: "Sem relacionamento",
        status: "PENDING",
        teamIds: [],
      });
    expect(noTeamTaskResponse.status).toBe(201);
    expect(noTeamTaskResponse.body.data.teams).toEqual([]);
    const noTeamTask = noTeamTaskResponse.body.data as { id: string };
    createdTaskIds.push(noTeamTask.id);

    const multiTeamTaskResponse = await request(app)
      .post("/api/tasks")
      .send({
        title: `Tarefa multipla ${suffix}`,
        description: "Conteudo unico para pesquisa combinada",
        status: "IN_PROGRESS",
        teamIds: [teamA.id, teamB.id],
      });
    expect(multiTeamTaskResponse.status).toBe(201);
    expect(multiTeamTaskResponse.body.data.teams).toHaveLength(2);
    expect(multiTeamTaskResponse.body.data).not.toHaveProperty("dueDate");
    const multiTeamTask = multiTeamTaskResponse.body.data as { id: string };
    createdTaskIds.push(multiTeamTask.id);

    const combined = await request(app).get("/api/tasks").query({
      teamId: teamA.id,
      status: "IN_PROGRESS",
      search: "conteudo unico",
      limit: 1,
      offset: 0,
      sort: "updatedAt:desc",
    });
    expect(combined.status).toBe(200);
    expect(combined.body.data.map((task: { id: string }) => task.id)).toEqual([
      multiTeamTask.id,
    ]);
    expect(combined.body.meta).toMatchObject({ total: 1, hasNext: false });

    const obsoleteTaskField = await request(app)
      .post("/api/tasks")
      .send({
        title: `Tarefa legada ${suffix}`,
        dueDate: "2026-08-10T12:00:00.000Z",
        teamIds: [],
      });
    expect(obsoleteTaskField.status).toBe(422);

    const obsoleteSort = await request(app)
      .get("/api/tasks")
      .query({ sort: "dueDate:asc" });
    expect(obsoleteSort.status).toBe(422);

    const patched = await request(app)
      .patch(`/api/tasks/${multiTeamTask.id}/status`)
      .send({ status: "COMPLETED" });
    expect(patched.status).toBe(200);
    expect(patched.body.data.status).toBe("COMPLETED");

    const edited = await request(app)
      .put(`/api/tasks/${multiTeamTask.id}`)
      .send({
        title: `Tarefa multipla editada ${suffix}`,
        description: null,
        status: "COMPLETED",
        teamIds: [teamA.id, teamB.id],
      });
    expect(edited.status).toBe(200);
    expect(edited.body.data.title).toContain("editada");

    const invalidRelationship = await request(app)
      .post("/api/tasks")
      .send({
        title: "Relacionamento invalido",
        teamIds: ["99999999-9999-4999-8999-999999999999"],
      });
    expect(invalidRelationship.status).toBe(422);
    expect(invalidRelationship.body.error.code).toBe("INVALID_RELATIONSHIP");

    expect((await request(app).delete(`/api/teams/${teamA.id}`)).status).toBe(
      204,
    );
    createdTeamIds.splice(createdTeamIds.indexOf(teamA.id), 1);

    const taskAfterTeamDeletion = await request(app).get(
      `/api/tasks/${multiTeamTask.id}`,
    );
    expect(taskAfterTeamDeletion.status).toBe(200);
    expect(
      taskAfterTeamDeletion.body.data.teams.map(
        (team: { id: string }) => team.id,
      ),
    ).toEqual([teamB.id]);

    expect(
      (await request(app).delete(`/api/tasks/${multiTeamTask.id}`)).status,
    ).toBe(204);
    createdTaskIds.splice(createdTaskIds.indexOf(multiTeamTask.id), 1);
    expect(
      (await request(app).get(`/api/tasks/${multiTeamTask.id}`)).status,
    ).toBe(404);
  });
});
