-- CreateTable
CREATE TABLE "public"."Quiz" (
    "quiz_id" TEXT NOT NULL,
    "course_id" TEXT NOT NULL,
    "questions" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Quiz_pkey" PRIMARY KEY ("quiz_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Quiz_course_id_key" ON "public"."Quiz"("course_id");

-- AddForeignKey
ALTER TABLE "public"."Quiz" ADD CONSTRAINT "Quiz_course_id_fkey" FOREIGN KEY ("course_id") REFERENCES "public"."Course"("course_id") ON DELETE RESTRICT ON UPDATE CASCADE;
