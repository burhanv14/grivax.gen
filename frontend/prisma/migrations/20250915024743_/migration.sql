-- CreateTable
CREATE TABLE "public"."PublicCourse" (
    "public_course_id" TEXT NOT NULL,
    "teacher_id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "image" TEXT NOT NULL,
    "isPublished" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PublicCourse_pkey" PRIMARY KEY ("public_course_id")
);

-- CreateTable
CREATE TABLE "public"."PublicUnit" (
    "public_unit_id" TEXT NOT NULL,
    "public_course_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PublicUnit_pkey" PRIMARY KEY ("public_unit_id")
);

-- CreateTable
CREATE TABLE "public"."PublicChapter" (
    "public_chapter_id" TEXT NOT NULL,
    "public_unit_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "youtubeVidLink" TEXT NOT NULL,
    "readingMaterial" VARCHAR(3000000),
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PublicChapter_pkey" PRIMARY KEY ("public_chapter_id")
);

-- CreateTable
CREATE TABLE "public"."PublicCourseEnrollment" (
    "enrollment_id" TEXT NOT NULL,
    "public_course_id" TEXT NOT NULL,
    "student_id" TEXT NOT NULL,
    "enrolledAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "progress" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "PublicCourseEnrollment_pkey" PRIMARY KEY ("enrollment_id")
);

-- CreateIndex
CREATE INDEX "PublicCourse_teacher_id_idx" ON "public"."PublicCourse"("teacher_id");

-- CreateIndex
CREATE INDEX "PublicCourse_isPublished_idx" ON "public"."PublicCourse"("isPublished");

-- CreateIndex
CREATE INDEX "PublicUnit_public_course_id_idx" ON "public"."PublicUnit"("public_course_id");

-- CreateIndex
CREATE INDEX "PublicChapter_public_unit_id_idx" ON "public"."PublicChapter"("public_unit_id");

-- CreateIndex
CREATE INDEX "PublicCourseEnrollment_student_id_idx" ON "public"."PublicCourseEnrollment"("student_id");

-- CreateIndex
CREATE INDEX "PublicCourseEnrollment_public_course_id_idx" ON "public"."PublicCourseEnrollment"("public_course_id");

-- CreateIndex
CREATE UNIQUE INDEX "PublicCourseEnrollment_public_course_id_student_id_key" ON "public"."PublicCourseEnrollment"("public_course_id", "student_id");

-- AddForeignKey
ALTER TABLE "public"."PublicCourse" ADD CONSTRAINT "PublicCourse_teacher_id_fkey" FOREIGN KEY ("teacher_id") REFERENCES "public"."User"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."PublicUnit" ADD CONSTRAINT "PublicUnit_public_course_id_fkey" FOREIGN KEY ("public_course_id") REFERENCES "public"."PublicCourse"("public_course_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."PublicChapter" ADD CONSTRAINT "PublicChapter_public_unit_id_fkey" FOREIGN KEY ("public_unit_id") REFERENCES "public"."PublicUnit"("public_unit_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."PublicCourseEnrollment" ADD CONSTRAINT "PublicCourseEnrollment_public_course_id_fkey" FOREIGN KEY ("public_course_id") REFERENCES "public"."PublicCourse"("public_course_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."PublicCourseEnrollment" ADD CONSTRAINT "PublicCourseEnrollment_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "public"."User"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;
