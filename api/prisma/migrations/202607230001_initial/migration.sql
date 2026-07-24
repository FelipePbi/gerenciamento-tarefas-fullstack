CREATE TYPE "TaskStatus" AS ENUM ('PENDING', 'IN_PROGRESS', 'COMPLETED');

CREATE TABLE "Team" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "name" VARCHAR(120) NOT NULL,
  "colorHex" VARCHAR(7) NOT NULL,
  "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMPTZ(3) NOT NULL,
  CONSTRAINT "Team_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Task" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "title" VARCHAR(200) NOT NULL,
  "description" VARCHAR(2000),
  "status" "TaskStatus" NOT NULL DEFAULT 'PENDING',
  "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMPTZ(3) NOT NULL,
  CONSTRAINT "Task_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "TaskTeam" (
  "taskId" UUID NOT NULL,
  "teamId" UUID NOT NULL,
  "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "TaskTeam_pkey" PRIMARY KEY ("taskId", "teamId")
);

CREATE UNIQUE INDEX "Team_name_key" ON "Team"("name");
CREATE INDEX "Team_createdAt_idx" ON "Team"("createdAt");
CREATE INDEX "Team_name_lower_idx" ON "Team"(LOWER("name"));
CREATE INDEX "Task_status_idx" ON "Task"("status");
CREATE INDEX "Task_createdAt_idx" ON "Task"("createdAt");
CREATE INDEX "Task_updatedAt_idx" ON "Task"("updatedAt");
CREATE INDEX "Task_title_lower_idx" ON "Task"(LOWER("title"));
CREATE INDEX "TaskTeam_teamId_taskId_idx" ON "TaskTeam"("teamId", "taskId");
CREATE INDEX "TaskTeam_taskId_teamId_idx" ON "TaskTeam"("taskId", "teamId");

ALTER TABLE "TaskTeam"
  ADD CONSTRAINT "TaskTeam_taskId_fkey"
  FOREIGN KEY ("taskId") REFERENCES "Task"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "TaskTeam"
  ADD CONSTRAINT "TaskTeam_teamId_fkey"
  FOREIGN KEY ("teamId") REFERENCES "Team"("id") ON DELETE CASCADE ON UPDATE CASCADE;
