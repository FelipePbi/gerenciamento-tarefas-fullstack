export const openApiDocument = {
  openapi: "3.1.0",
  info: {
    title: "Gerenciamento de Times e Tarefas API",
    version: "1.0.0",
    description:
      "CRUD de times e tarefas com relacionamento muitos-para-muitos.",
  },
  servers: [{ url: "http://localhost:3000" }],
  tags: [{ name: "Health" }, { name: "Times" }, { name: "Tarefas" }],
  paths: {
    "/health": {
      get: {
        tags: ["Health"],
        summary: "Saude do processo",
        responses: { "200": { description: "OK" } },
      },
    },
    "/health/db": {
      get: {
        tags: ["Health"],
        summary: "Conectividade com PostgreSQL",
        responses: {
          "200": { description: "OK" },
          "503": { description: "Banco indisponivel" },
        },
      },
    },
    "/api/teams": {
      get: {
        tags: ["Times"],
        summary: "Lista, pesquisa e pagina times",
        parameters: [
          { in: "query", name: "search", schema: { type: "string" } },
          {
            in: "query",
            name: "limit",
            schema: { type: "integer", default: 20, maximum: 100 },
          },
          {
            in: "query",
            name: "offset",
            schema: { type: "integer", default: 0, minimum: 0 },
          },
        ],
        responses: {
          "200": { description: "Lista paginada" },
          "422": { description: "Entrada invalida" },
        },
      },
      post: {
        tags: ["Times"],
        summary: "Cria time",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/TeamInput" },
            },
          },
        },
        responses: {
          "201": { description: "Criado" },
          "409": { description: "Nome em conflito" },
        },
      },
    },
    "/api/teams/{id}": {
      get: {
        tags: ["Times"],
        summary: "Detalha time",
        parameters: [{ $ref: "#/components/parameters/Id" }],
        responses: {
          "200": { description: "Time" },
          "404": { description: "Nao encontrado" },
        },
      },
      put: {
        tags: ["Times"],
        summary: "Atualiza time",
        parameters: [{ $ref: "#/components/parameters/Id" }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/TeamInput" },
            },
          },
        },
        responses: { "200": { description: "Atualizado" } },
      },
      delete: {
        tags: ["Times"],
        summary: "Exclui time e preserva tarefas",
        parameters: [{ $ref: "#/components/parameters/Id" }],
        responses: { "204": { description: "Excluido" } },
      },
    },
    "/api/tasks": {
      get: {
        tags: ["Tarefas"],
        summary: "Lista tarefas com filtros combinaveis",
        parameters: [
          {
            in: "query",
            name: "teamId",
            schema: { type: "string", format: "uuid" },
          },
          {
            in: "query",
            name: "status",
            schema: { $ref: "#/components/schemas/TaskStatus" },
          },
          { in: "query", name: "search", schema: { type: "string" } },
          {
            in: "query",
            name: "limit",
            schema: { type: "integer", default: 7, maximum: 100 },
          },
          {
            in: "query",
            name: "offset",
            schema: { type: "integer", default: 0 },
          },
          {
            in: "query",
            name: "sort",
            schema: { type: "string", default: "createdAt:desc" },
          },
        ],
        responses: { "200": { description: "Lista paginada" } },
      },
      post: {
        tags: ["Tarefas"],
        summary: "Cria tarefa",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/TaskInput" },
            },
          },
        },
        responses: {
          "201": { description: "Criada" },
          "422": { description: "Payload ou relacionamento invalido" },
        },
      },
    },
    "/api/tasks/{id}": {
      get: {
        tags: ["Tarefas"],
        summary: "Detalha tarefa",
        parameters: [{ $ref: "#/components/parameters/Id" }],
        responses: { "200": { description: "Tarefa" } },
      },
      put: {
        tags: ["Tarefas"],
        summary: "Atualiza tarefa",
        parameters: [{ $ref: "#/components/parameters/Id" }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/TaskInput" },
            },
          },
        },
        responses: { "200": { description: "Atualizada" } },
      },
      delete: {
        tags: ["Tarefas"],
        summary: "Exclui tarefa",
        parameters: [{ $ref: "#/components/parameters/Id" }],
        responses: { "204": { description: "Excluida" } },
      },
    },
    "/api/tasks/{id}/status": {
      patch: {
        tags: ["Tarefas"],
        summary: "Altera status rapidamente",
        parameters: [{ $ref: "#/components/parameters/Id" }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["status"],
                properties: {
                  status: { $ref: "#/components/schemas/TaskStatus" },
                },
              },
            },
          },
        },
        responses: { "200": { description: "Atualizada" } },
      },
    },
  },
  components: {
    parameters: {
      Id: {
        in: "path",
        name: "id",
        required: true,
        schema: { type: "string", format: "uuid" },
      },
    },
    schemas: {
      TaskStatus: {
        type: "string",
        enum: ["PENDING", "IN_PROGRESS", "COMPLETED"],
      },
      TeamInput: {
        type: "object",
        additionalProperties: false,
        required: ["name", "colorHex"],
        properties: {
          name: { type: "string", maxLength: 120 },
          colorHex: { type: "string", pattern: "^#[0-9A-Fa-f]{6}$" },
        },
      },
      TaskInput: {
        type: "object",
        additionalProperties: false,
        required: ["title"],
        properties: {
          title: { type: "string", minLength: 3, maxLength: 200 },
          description: { type: ["string", "null"], maxLength: 2000 },
          status: { $ref: "#/components/schemas/TaskStatus" },
          teamIds: {
            type: "array",
            uniqueItems: true,
            items: { type: "string", format: "uuid" },
          },
        },
      },
    },
  },
} as const;
