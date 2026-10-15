package com.gravax.gen.controller;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.gravax.gen.entity.PublicChapter;
import com.gravax.gen.entity.PublicCourse;
import com.gravax.gen.entity.PublicCourseEnrollment;
import com.gravax.gen.entity.PublicUnit;
import com.gravax.gen.repository.PublicChapterRepository;
import com.gravax.gen.repository.PublicCourseEnrollmentRepository;
import com.gravax.gen.repository.PublicCourseRepository;
import com.gravax.gen.repository.PublicUnitRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/api/public-courses")
@RequiredArgsConstructor
@Slf4j
public class PublicCourseController {

    private final PublicCourseRepository publicCourseRepository;
    private final PublicUnitRepository publicUnitRepository;
    private final PublicChapterRepository publicChapterRepository;
    private final PublicCourseEnrollmentRepository enrollmentRepository;
    private final ObjectMapper objectMapper;

    @GetMapping
    public ResponseEntity<?> getPublicCourses(
            @RequestParam(value = "teacher_id", required = false) String teacherId,
            @RequestParam(value = "published", required = false) Boolean published
    ) {
        List<PublicCourse> list;
        if (teacherId != null && published != null) {
            list = publicCourseRepository.findByTeacherIdAndIsPublishedOrderByCreatedAtDesc(teacherId, published);
        } else if (teacherId != null) {
            list = publicCourseRepository.findByTeacherIdOrderByCreatedAtDesc(teacherId);
        } else if (published != null) {
            list = publicCourseRepository.findByIsPublishedOrderByCreatedAtDesc(published);
        } else {
            list = publicCourseRepository.findAllByOrderByCreatedAtDesc();
        }
        return ResponseEntity.ok(list);
    }

    @PostMapping
    public ResponseEntity<?> createPublicCourse(
            @RequestBody Map<String, Object> body,
            @RequestHeader(value = "X-User-Id", required = false) String headerUserId
    ) {
        try {
            String title = (String) body.get("title");
            String description = (String) body.getOrDefault("description", "");
            String image = (String) body.getOrDefault("image", "/images/learning-illustration.svg");
            String teacherId = (String) body.get("teacher_id");
            if (teacherId == null) teacherId = (String) body.get("teacherId");
            if (teacherId == null) teacherId = (String) body.get("user_id");
            if (teacherId == null) teacherId = (String) body.get("userId");
            if (teacherId == null) teacherId = headerUserId;

            Object unitsObj = body.get("units");
            boolean isPublished = Boolean.TRUE.equals(body.get("isPublished")) || "true".equalsIgnoreCase(String.valueOf(body.get("isPublished")));

            if (title == null || teacherId == null) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body(Map.of("error", "Title and teacher_id are required"));
            }

            PublicCourse course = PublicCourse.builder()
                    .title(title)
                    .description(description)
                    .image(image)
                    .teacherId(teacherId)
                    .isPublished(isPublished)
                    .build();
            course = publicCourseRepository.save(course);

            JsonNode unitsNode = objectMapper.valueToTree(unitsObj);
            if (unitsNode.isArray()) {
                int unitIdx = 0;
                for (JsonNode uNode : unitsNode) {
                    PublicUnit unit = PublicUnit.builder()
                            .publicCourseId(course.getPublicCourseId())
                            .name(uNode.path("name").asText("Unit"))
                            .order(unitIdx++)
                            .build();
                    unit = publicUnitRepository.save(unit);

                    JsonNode chaptersNode = uNode.path("chapters");
                    if (chaptersNode.isArray()) {
                        int chIdx = 0;
                        for (JsonNode chNode : chaptersNode) {
                            PublicChapter chapter = PublicChapter.builder()
                                    .publicUnitId(unit.getPublicUnitId())
                                    .name(chNode.path("name").asText("Chapter"))
                                    .youtubeVidLink(chNode.path("youtubeVidLink").asText(""))
                                    .readingMaterial(chNode.path("readingMaterial").asText(""))
                                    .order(chIdx++)
                                    .build();
                            publicChapterRepository.save(chapter);
                        }
                    }
                }
            }

            return ResponseEntity.status(HttpStatus.CREATED).body(publicCourseRepository.findById(course.getPublicCourseId()).get());
        } catch (Exception e) {
            log.error("Error creating public course: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Internal server error"));
        }
    }

    @GetMapping("/{course_id}")
    public ResponseEntity<?> getPublicCourseById(@PathVariable("course_id") String courseId) {
        Optional<PublicCourse> courseOpt = publicCourseRepository.findById(courseId);
        if (courseOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", "Public course not found"));
        }
        return ResponseEntity.ok(courseOpt.get());
    }

    @PutMapping("/{course_id}")
    public ResponseEntity<?> updatePublicCourse(
            @PathVariable("course_id") String courseId,
            @RequestBody Map<String, Object> body
    ) {
        Optional<PublicCourse> courseOpt = publicCourseRepository.findById(courseId);
        if (courseOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", "Public course not found"));
        }

        PublicCourse course = courseOpt.get();
        if (body.get("title") != null) course.setTitle((String) body.get("title"));
        if (body.get("description") != null) course.setDescription((String) body.get("description"));
        if (body.get("image") != null) course.setImage((String) body.get("image"));
        if (body.get("isPublished") != null) course.setIsPublished((Boolean) body.get("isPublished"));

        publicCourseRepository.save(course);
        return ResponseEntity.ok(course);
    }

    @DeleteMapping("/{course_id}")
    public ResponseEntity<?> deletePublicCourse(@PathVariable("course_id") String courseId) {
        Optional<PublicCourse> courseOpt = publicCourseRepository.findById(courseId);
        if (courseOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", "Public course not found"));
        }
        publicCourseRepository.delete(courseOpt.get());
        return ResponseEntity.ok(Map.of("message", "Public course deleted successfully"));
    }

    @PostMapping("/{course_id}/enroll")
    public ResponseEntity<?> enrollStudentByTeacher(
            @PathVariable("course_id") String courseId,
            @RequestBody Map<String, String> body
    ) {
        String studentId = body.get("student_id");
        if (studentId == null || studentId.isBlank()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("error", "Student ID is required"));
        }

        Optional<PublicCourseEnrollment> existing = enrollmentRepository.findByPublicCourseIdAndStudentId(courseId, studentId);
        if (existing.isPresent()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("error", "Student is already enrolled in this course"));
        }

        PublicCourseEnrollment enrollment = PublicCourseEnrollment.builder()
                .publicCourseId(courseId)
                .studentId(studentId)
                .progress(0)
                .build();
        enrollment = enrollmentRepository.save(enrollment);

        return ResponseEntity.status(HttpStatus.CREATED).body(enrollment);
    }

    @GetMapping("/{course_id}/enroll")
    public ResponseEntity<?> getEnrolledStudents(@PathVariable("course_id") String courseId) {
        List<PublicCourseEnrollment> enrollments = enrollmentRepository.findByPublicCourseIdOrderByEnrolledAtDesc(courseId);
        return ResponseEntity.ok(enrollments);
    }

    @PostMapping("/{course_id}/enroll-student")
    public ResponseEntity<?> selfEnrollStudent(
            @PathVariable("course_id") String courseId,
            @RequestBody Map<String, String> body
    ) {
        String studentId = body.get("student_id");
        if (studentId == null || studentId.isBlank()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("error", "Student ID is required"));
        }

        Optional<PublicCourse> courseOpt = publicCourseRepository.findById(courseId);
        if (courseOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", "Public course not found"));
        }

        Optional<PublicCourseEnrollment> existing = enrollmentRepository.findByPublicCourseIdAndStudentId(courseId, studentId);
        if (existing.isPresent()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("error", "You are already enrolled in this course"));
        }

        PublicCourseEnrollment enrollment = PublicCourseEnrollment.builder()
                .publicCourseId(courseId)
                .studentId(studentId)
                .progress(0)
                .build();
        enrollment = enrollmentRepository.save(enrollment);

        return ResponseEntity.status(HttpStatus.CREATED).body(enrollment);
    }

    @PostMapping("/{course_id}/units/{unit_id}/chapters")
    public ResponseEntity<?> addChapterToUnit(
            @PathVariable("course_id") String courseId,
            @PathVariable("unit_id") String unitId,
            @RequestBody Map<String, String> body
    ) {
        String name = body.get("name");
        String yt = body.getOrDefault("youtubeVidLink", "");
        String reading = body.getOrDefault("readingMaterial", "");

        if (name == null || name.isBlank()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("error", "Chapter name is required"));
        }

        int nextOrder = publicChapterRepository.findFirstByPublicUnitIdOrderByOrderDesc(unitId)
                .map(c -> c.getOrder() + 1)
                .orElse(0);

        PublicChapter chapter = PublicChapter.builder()
                .publicUnitId(unitId)
                .name(name)
                .youtubeVidLink(yt)
                .readingMaterial(reading)
                .order(nextOrder)
                .build();
        chapter = publicChapterRepository.save(chapter);

        return ResponseEntity.status(HttpStatus.CREATED).body(chapter);
    }

    @PutMapping("/{course_id}/chapters/{chapter_id}")
    public ResponseEntity<?> updateChapter(
            @PathVariable("course_id") String courseId,
            @PathVariable("chapter_id") String chapterId,
            @RequestBody Map<String, String> body
    ) {
        Optional<PublicChapter> chapterOpt = publicChapterRepository.findById(chapterId);
        if (chapterOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", "Chapter not found"));
        }

        PublicChapter chapter = chapterOpt.get();
        if (body.get("name") != null) chapter.setName(body.get("name"));
        if (body.get("youtubeVidLink") != null) chapter.setYoutubeVidLink(body.get("youtubeVidLink"));
        if (body.get("readingMaterial") != null) chapter.setReadingMaterial(body.get("readingMaterial"));

        publicChapterRepository.save(chapter);
        return ResponseEntity.ok(chapter);
    }
}
