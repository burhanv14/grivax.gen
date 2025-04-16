/*
  Warnings:

  - The primary key for the `Course` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `description` on the `Course` table. All the data in the column will be lost.
  - You are about to drop the column `id` on the `Course` table. All the data in the column will be lost.
  - You are about to drop the column `status` on the `Course` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `Course` table. All the data in the column will be lost.
  - You are about to drop the `Module` table. If the table is not empty, all the data it contains will be lost.
  - The required column `course_id` was added to the `Course` table with a prisma-level default value. This is not possible if the table is not empty. Please add this column as optional, then populate it before making it required.
  - Added the required column `difficulty` to the `Course` table without a default value. This is not possible if the table is not empty.
  - Added the required column `user_id` to the `Course` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Module" DROP CONSTRAINT "Module_courseId_fkey";

-- DropIndex
DROP INDEX "User_user_id_key";

-- AlterTable
ALTER TABLE "Course" DROP CONSTRAINT "Course_pkey",
DROP COLUMN "description",
DROP COLUMN "id",
DROP COLUMN "status",
DROP COLUMN "userId",
ADD COLUMN     "course_id" TEXT NOT NULL,
ADD COLUMN     "difficulty" TEXT NOT NULL,
ADD COLUMN     "pace" TEXT NOT NULL DEFAULT 'active',
ADD COLUMN     "user_id" TEXT NOT NULL,
ADD CONSTRAINT "Course_pkey" PRIMARY KEY ("course_id");

-- DropTable
DROP TABLE "Module";

-- CreateTable
CREATE TABLE "GenCourse" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "course_id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "modules" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "GenCourse_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "GenCourse_course_id_key" ON "GenCourse"("course_id");

-- AddForeignKey
ALTER TABLE "Course" ADD CONSTRAINT "Course_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GenCourse" ADD CONSTRAINT "GenCourse_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;
