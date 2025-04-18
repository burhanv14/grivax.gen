-- AlterTable
ALTER TABLE "Chapter" ADD COLUMN     "isCompleted" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "Course" ADD COLUMN     "progress" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "Unit" ADD COLUMN     "progress" INTEGER NOT NULL DEFAULT 0;
