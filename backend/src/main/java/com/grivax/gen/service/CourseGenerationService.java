package com.gravax.gen.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.gravax.gen.entity.*;
import com.gravax.gen.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.concurrent.CompletableFuture;

@Service
@RequiredArgsConstructor
@Slf4j
public class CourseGenerationService {

    private final CourseRepository courseRepository;
    private final UnitRepository unitRepository;
    private final ChapterRepository chapterRepository;
    private final TestRepository testRepository;
    private final GeminiService geminiService;
    private final GoogleSearchService googleSearchService;
    private final YouTubeService youTubeService;
    private final ObjectMapper objectMapper;

    /**
     * Executes the generation of detailed units, chapters, reading materials,
     * video links, and flashcard tests completely asynchronously in the background.
     */
    @Async("courseGenerationExecutor")
    public CompletableFuture<Void> startAsyncCourseGeneration(String userId, String courseId, GenCourse genCourse) {
        log.info("Starting background async generation for courseId: {}, userId: {}", courseId, userId);
        try {
            // 1. Fetch course image and detailed content
            String courseImage = googleSearchService.getCourseImage(genCourse.getTitle(), genCourse.getDescription());
            JsonNode modulesNode = objectMapper.valueToTree(genCourse.getModules());
            JsonNode detailedContent = geminiService.generateDetailedCourse(genCourse.getTitle(), genCourse.getDescription(), modulesNode);

            // 2. Ensure Course entity exists in DB
            Optional<Course> courseOpt = courseRepository.findByCourseIdAndUserId(courseId, userId);
            Course course = courseOpt.orElseGet(() -> Course.builder()
                    .courseId(courseId)
                    .userId(userId)
                    .genId(genCourse.getId())
                    .title(genCourse.getTitle())
                    .image(courseImage)
                    .build());
            course.setImage(courseImage);
            courseRepository.save(course);

            // 3. Generate each Unit and its Chapters asynchronously
            JsonNode unitsNode = detailedContent.path("units");
            if (unitsNode.isArray()) {
                for (JsonNode uNode : unitsNode) {
                    String unitTitle = uNode.path("title").asText("Unit");
                    String unitDescription = uNode.path("description").asText("");

                    Unit unit = Unit.builder()
                            .courseId(courseId)
                            .name(unitTitle)
                            .progress(0)
                            .build();
                    unit = unitRepository.save(unit);

                    JsonNode chaptersNode = uNode.path("chapters");
                    List<String> chapterNames = new ArrayList<>();

                    if (chaptersNode.isArray()) {
                        for (JsonNode chNode : chaptersNode) {
                            String chTitle = chNode.path("title").asText("Chapter");
                            String chDesc = chNode.path("description").asText("");
                            chapterNames.add(chTitle);

                            String ytQuery = chNode.path("youtubeSearchQuery").asText(chTitle + " tutorial");
                            String ytLink = youTubeService.getVideoLink(ytQuery);

                            List<String> learningPoints = new ArrayList<>();
                            if (chNode.path("learningPoints").isArray()) {
                                chNode.path("learningPoints").forEach(lp -> learningPoints.add(lp.asText()));
                            }

                            String readingMaterial = geminiService.generateReadingMaterial(chTitle, chDesc, learningPoints);

                            Chapter chapter = Chapter.builder()
                                    .unitId(unit.getUnitId())
                                    .name(chTitle)
                                    .youtubeVidLink(ytLink)
                                    .readingMaterial(readingMaterial)
                                    .isCompleted(false)
                                    .build();
                            chapterRepository.save(chapter);
                            log.debug("Saved chapter '{}' for unit '{}'", chTitle, unitTitle);
                        }
                    }

                    // 4. Generate unit test flashcards
                    try {
                        JsonNode questions = geminiService.generateFlashcards(unitTitle, unitDescription, chapterNames);
                        Test test = Test.builder()
                                .unitId(unit.getUnitId())
                                .questions(questions)
                                .build();
                        testRepository.save(test);
                    } catch (Exception te) {
                        log.error("Failed to generate test for unit {}: {}", unit.getUnitId(), te.getMessage());
                    }
                }
            }

            log.info("Successfully completed background async generation for courseId: {}", courseId);
        } catch (Exception e) {
            log.error("Error during async course generation for courseId {}: {}", courseId, e.getMessage(), e);
        }
        return CompletableFuture.completedFuture(null);
    }
}
