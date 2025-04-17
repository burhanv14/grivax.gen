/*
  Warnings:

  - You are about to drop the column `difficulty` on the `Course` table. All the data in the column will be lost.
  - You are about to drop the column `pace` on the `Course` table. All the data in the column will be lost.
  - Added the required column `genId` to the `Course` table without a default value. This is not possible if the table is not empty.
  - Added the required column `image` to the `Course` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Course" DROP COLUMN "difficulty",
DROP COLUMN "pace",
ADD COLUMN     "genId" TEXT NOT NULL,
ADD COLUMN     "image" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "Unit" (
    "unit_id" TEXT NOT NULL,
    "course_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "Unit_pkey" PRIMARY KEY ("unit_id")
);

-- CreateTable
CREATE TABLE "Chapter" (
    "chapter_id" TEXT NOT NULL,
    "unit_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "youtubeVidLink" TEXT NOT NULL,
    "readingMaterial" VARCHAR(3000000),

    CONSTRAINT "Chapter_pkey" PRIMARY KEY ("chapter_id")
);

-- CreateIndex
CREATE INDEX "Unit_course_id_idx" ON "Unit"("course_id");

-- CreateIndex
CREATE INDEX "Chapter_unit_id_idx" ON "Chapter"("unit_id");

-- AddForeignKey
ALTER TABLE "Unit" ADD CONSTRAINT "Unit_course_id_fkey" FOREIGN KEY ("course_id") REFERENCES "Course"("course_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Chapter" ADD CONSTRAINT "Chapter_unit_id_fkey" FOREIGN KEY ("unit_id") REFERENCES "Unit"("unit_id") ON DELETE RESTRICT ON UPDATE CASCADE;
