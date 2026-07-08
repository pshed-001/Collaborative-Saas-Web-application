/*
  Warnings:

  - A unique constraint covering the columns `[title,workspaceId]` on the table `Task` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Task" ADD COLUMN "duedate" DATETIME;
ALTER TABLE "Task" ADD COLUMN "recoveredBy" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Task_title_workspaceId_key" ON "Task"("title", "workspaceId");
