package com.gravax.gen.controller;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.gravax.gen.entity.*;
import com.gravax.gen.repository.*;
import com.gravax.gen.service.CourseGenerationService;
import com.gravax.gen.service.GeminiService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
@Slf4j
public class CourseGenerationController {

    private final GenCourseRepository genCourseRepository;
    private final CourseRepository courseRepository;
    private final UnitRepository unitRepository;
    private final ChapterRepository chapterRepository;
    private final PublicCourseRepository publicCourseRepository;
    private final PublicUnitRepository publicUnitRepository;
    private final PublicChapterRepository publicChapterRepository;

    private final GeminiService geminiService;
    private final CourseGenerationService courseGenerationService;
    private final ObjectMapper objectMapper;

    @PostMapping("/generate-course/{user_id}")
    public ResponseEntity<?> generateCourseOutline(
            @PathVariable("user_id") String userId,
            @RequestBody Map<String, Object> body
    ) {
        try {
            String topic = (String) body.get("topic");
            String difficulty = (String) body.getOrDefault("difficulty", "Intermediate");
            int pace = 4;
            if (body.get("pace") != null) {
                try {
                    pace = Integer.parseInt(body.get("pace").toString());
                } catch (Exception ignored) {}
            }

            JsonNode outline = geminiService.generateCourseOutline(topic, difficulty, pace);
            String courseId = UUID.randomUUID().toString().replace("-", "").substring(0, 10);

            GenCourse genCourse = GenCourse.builder()
                    .userId(userId)
                    .courseId(courseId)
                    .title(outline.path("title").asText(topic))
                    .description(outline.path("description").asText("A course on " + topic))
                    .modules(outline.path("modules"))
                    .build();

            genCourseRepository.save(genCourse);

            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "course_id", courseId,
                    "courseStructure", outline,
                    "redirectUrl", "/generate-courses/" + userId + "/" + courseId
            ));
        } catch (Exception e) {
            log.error("Error in generate-course outline: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to process course generation request"));
        }
    }

    @GetMapping("/generate-course/{user_id}/{course_id}")
    public ResponseEntity<?> getGeneratedCourse(
            @PathVariable("user_id") String userId,
            @PathVariable("course_id") String courseId
    ) {
        Optional<GenCourse> genOpt = genCourseRepository.findByUserIdAndCourseId(userId, courseId);
        if (genOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", "Course not found"));
        }

        GenCourse gen = genOpt.get();
        return ResponseEntity.ok(Map.of(
                "course_id", gen.getCourseId(),
                "title", gen.getTitle(),
                "description", gen.getDescription(),
                "modules", gen.getModules()
        ));
    }

    @PostMapping("/generate-course/{user_id}/{course_id}")
    public ResponseEntity<?> updateGeneratedCourse(
            @PathVariable("user_id") String userId,
            @PathVariable("course_id") String courseId,
            @RequestBody Map<String, Object> body
    ) {
        Optional<GenCourse> genOpt = genCourseRepository.findByUserIdAndCourseId(userId, courseId);
        if (genOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", "Course not found"));
        }

        GenCourse gen = genOpt.get();
        if (body.get("title") != null) gen.setTitle((String) body.get("title"));
        if (body.get("description") != null) gen.setDescription((String) body.get("description"));
        if (body.get("modules") != null) gen.setModules(body.get("modules"));

        genCourseRepository.save(gen);

        // Trigger async background generation of units and chapters immediately
        courseGenerationService.startAsyncCourseGeneration(userId, courseId, gen);

        return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Course data updated successfully and background generation initiated",
                "data", gen
        ));
    }

    @GetMapping("/generate-course/{user_id}/{course_id}/{id}")
    public ResponseEntity<?> getGenCourseById(
            @PathVariable("user_id") String userId,
            @PathVariable("course_id") String courseId,
            @PathVariable("id") String id
    ) {
        Optional<GenCourse> genOpt = genCourseRepository.findByIdAndUserIdAndCourseId(id, userId, courseId);
        if (genOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", "Course not found"));
        }

        GenCourse gen = genOpt.get();
        return ResponseEntity.ok(Map.of(
                "message", "Course found",
                "id", gen.getId(),
                "course_id", gen.getCourseId(),
                "user_id", gen.getUserId()
        ));
    }

    @PostMapping("/generate-course/{user_id}/{course_id}/{id}")
    public ResponseEntity<?> buildDetailedCourseContent(
            @PathVariable("user_id") String userId,
            @PathVariable("course_id") String courseId,
            @PathVariable("id") String id
    ) {
        Optional<GenCourse> genOpt = genCourseRepository.findByIdAndUserIdAndCourseId(id, userId, courseId);
        if (genOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", "Course not found"));
        }

        GenCourse genCourse = genOpt.get();

        // Trigger async background generation of units, chapters, reading materials, videos, and tests
        courseGenerationService.startAsyncCourseGeneration(userId, courseId, genCourse);

        return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Course details generation started in background",
                "id", id,
                "course_id", courseId,
                "user_id", userId,
                "courseDetails", Map.of(
                        "id", id,
                        "course_id", courseId,
                        "user_id", userId,
                        "title", genCourse.getTitle(),
                        "description", genCourse.getDescription() != null ? genCourse.getDescription() : ""
                ),
                "started", true
        ));
    }

    @GetMapping("/generate-course/{user_id}/{course_id}/status")
    public ResponseEntity<?> getCourseGenerationStatus(
            @PathVariable("user_id") String userId,
            @PathVariable("course_id") String courseId
    ) {
        Optional<GenCourse> genOpt = genCourseRepository.findByCourseId(courseId);
        int intendedUnits = 0;
        if (genOpt.isPresent()) {
            JsonNode modulesNode = objectMapper.valueToTree(genOpt.get().getModules());
            if (modulesNode.isArray()) intendedUnits = modulesNode.size();
        }

        Optional<Course> courseOpt = courseRepository.findByCourseIdAndUserId(courseId, userId);
        if (courseOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.ACCEPTED).body(Map.of(
                    "status", "generating",
                    "message", "Course generation is initializing...",
                    "course_id", courseId,
                    "user_id", userId,
                    "progress", Map.of(
                            "percent", 5,
                            "unitsCreated", 0,
                            "completedUnits", 0,
                            "totalIntendedUnits", intendedUnits,
                            "totalChapters", 0,
                            "chaptersPerUnit", List.of()
                    )
            ));
        }

        List<Unit> units = unitRepository.findByCourseId(courseId);
        int unitsCreated = units.size();
        int totalIntendedUnits = intendedUnits > 0 ? intendedUnits : Math.max(unitsCreated, 1);

        int completedUnits = 0;
        int totalChapters = 0;
        List<Map<String, Object>> chaptersPerUnit = new ArrayList<>();

        for (Unit u : units) {
            List<Chapter> chapters = chapterRepository.findByUnitId(u.getUnitId());
            totalChapters += chapters.size();
            chaptersPerUnit.add(Map.of("unit_id", u.getUnitId(), "chapters", chapters.size()));
            if (!chapters.isEmpty()) {
                completedUnits++;
            }
        }

        boolean isFullyGenerated = totalIntendedUnits > 0 && completedUnits >= totalIntendedUnits;
        int percent = totalIntendedUnits == 0 ? 0 : Math.min(100, (int) Math.round(((double) completedUnits / totalIntendedUnits) * 100));

        Map<String, Object> progress = Map.of(
                "percent", isFullyGenerated ? 100 : Math.max(10, percent),
                "unitsCreated", unitsCreated,
                "completedUnits", completedUnits,
                "totalIntendedUnits", totalIntendedUnits,
                "totalChapters", totalChapters,
                "chaptersPerUnit", chaptersPerUnit
        );

        if (!isFullyGenerated) {
            return ResponseEntity.status(HttpStatus.ACCEPTED).body(Map.of(
                    "status", "generating",
                    "message", "Course is still being generated",
                    "course_id", courseId,
                    "user_id", userId,
                    "progress", progress
            ));
        }

        return ResponseEntity.ok(Map.of(
                "status", "completed",
                "message", "Course generation completed",
                "course_id", courseId,
                "user_id", userId,
                "progress", progress
        ));
    }

    @PostMapping("/generate-course/{user_id}/{course_id}/status")
    public ResponseEntity<?> acknowledgeGenerationStatus(
            @PathVariable("user_id") String userId,
            @PathVariable("course_id") String courseId
    ) {
        return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Course generation acknowledgment received",
                "course_id", courseId,
                "user_id", userId
        ));
    }

    @PostMapping("/generate-public-course/{user_id}")
    public ResponseEntity<?> generatePublicCourse(
            @PathVariable("user_id") String userId,
            @RequestBody Map<String, Object> body
    ) {
        try {
            String topic = (String) body.get("topic");
            String difficulty = (String) body.getOrDefault("difficulty", "Intermediate");
            int pace = 4;
            if (body.get("pace") != null) {
                try {
                    pace = Integer.parseInt(body.get("pace").toString());
                } catch (Exception ignored) {}
            }

            JsonNode outline = geminiService.generateCourseOutline(topic, difficulty, pace);
            String publicCourseId = UUID.randomUUID().toString().replace("-", "").substring(0, 10);

            GenCourse genCourse = GenCourse.builder()
                    .userId(userId)
                    .courseId(publicCourseId)
                    .title(outline.path("title").asText(topic))
                    .description(outline.path("description").asText("Public Course on " + topic))
                    .modules(outline.path("modules"))
                    .build();

            genCourseRepository.save(genCourse);

            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "public_course_id", publicCourseId,
                    "courseStructure", outline,
                    "redirectUrl", "/generate-public-course/" + userId + "/" + publicCourseId
            ));
        } catch (Exception e) {
            log.error("Error generating public course outline: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to process public course generation request"));
        }
    }

    @PostMapping("/convert-to-public-course/{user_id}/{course_id}")
    public ResponseEntity<?> convertToPublicCourse(
            @PathVariable("user_id") String userId,
            @PathVariable("course_id") String courseId,
            @RequestBody Map<String, Object> body
    ) {
        try {
            String title = (String) body.get("title");
            String description = (String) body.getOrDefault("description", "");
            Object modulesObj = body.get("modules");

            JsonNode modulesNode = objectMapper.valueToTree(modulesObj);
            String publicCourseId = "pub_" + courseId;

            PublicCourse publicCourse = PublicCourse.builder()
                    .publicCourseId(publicCourseId)
                    .teacherId(userId)
                    .title(title)
                    .description(description)
                    .image("/images/learning-illustration.svg")
                    .isPublished(false)
                    .build();

            publicCourse = publicCourseRepository.save(publicCourse);

            if (modulesNode.isArray()) {
                int unitIdx = 0;
                for (JsonNode m : modulesNode) {
                    String mTitle = m.path("title").asText("Unit " + (unitIdx + 1));
                    PublicUnit publicUnit = PublicUnit.builder()
                            .publicCourseId(publicCourseId)
                            .name(mTitle)
                            .order(unitIdx++)
                            .build();
                    publicUnit = publicUnitRepository.save(publicUnit);

                    String reading = "# " + mTitle + "\n\n## Learning Objectives\n\n" +
                            m.path("objectives").toString() + "\n\n## Content\nFundamentals of " + mTitle + ".";

                    PublicChapter publicChapter = PublicChapter.builder()
                            .publicUnitId(publicUnit.getPublicUnitId())
                            .name(mTitle + " - Overview")
                            .youtubeVidLink("")
                            .readingMaterial(reading)
                            .order(0)
                            .build();
                    publicChapterRepository.save(publicChapter);
                }
            }

            return ResponseEntity.status(HttpStatus.CREATED).body(publicCourse);
        } catch (Exception e) {
            log.error("Error converting to public course: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Internal server error"));
        }
    }
}
