package com.gravax.gen.controller;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.gravax.gen.entity.Chapter;
import com.gravax.gen.entity.Test;
import com.gravax.gen.entity.TestAttempt;
import com.gravax.gen.entity.Unit;
import com.gravax.gen.repository.ChapterRepository;
import com.gravax.gen.repository.TestAttemptRepository;
import com.gravax.gen.repository.TestRepository;
import com.gravax.gen.repository.UnitRepository;
import com.gravax.gen.service.GeminiService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.*;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
@Slf4j
public class UnitTestController {

    private final TestRepository testRepository;
    private final TestAttemptRepository testAttemptRepository;
    private final UnitRepository unitRepository;
    private final ChapterRepository chapterRepository;
    private final GeminiService geminiService;
    private final ObjectMapper objectMapper;

    @GetMapping({"/unit-tests/{unit_id}", "/test/{unit_id}"})
    public ResponseEntity<?> getUnitTest(
            @PathVariable("unit_id") String unitId,
            @RequestParam("user_id") String userId
    ) {
        if (userId == null || userId.isBlank()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("error", "User ID is required"));
        }

        Optional<Test> testOpt = testRepository.findByUnitId(unitId);
        if (testOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", "Unit test not found"));
        }

        Test test = testOpt.get();
        List<TestAttempt> attempts = testAttemptRepository.findByTestIdAndUserIdOrderByCompletedAtDesc(test.getTestId(), userId);
        TestAttempt userAttempt = attempts.isEmpty() ? null : attempts.get(0);

        Map<String, Object> attemptData = null;
        if (userAttempt != null) {
            attemptData = Map.of(
                    "score", userAttempt.getScore(),
                    "correctCount", userAttempt.getCorrectCount(),
                    "totalQuestions", userAttempt.getTotalQuestions(),
                    "completedAt", userAttempt.getCompletedAt()
            );
        }

        Map<String, Object> testData = Map.of(
                "test_id", test.getTestId(),
                "questions", test.getQuestions(),
                "hasAttempted", userAttempt != null,
                "userAttempt", attemptData != null ? attemptData : Map.of()
        );

        return ResponseEntity.ok(Map.of(
                "success", true,
                "unitTest", testData,
                "test", testData
        ));
    }

    @PostMapping({"/unit-tests/attempt", "/test-attempt"})
    public ResponseEntity<?> submitUnitTestAttempt(@RequestBody Map<String, Object> body) {
        String testId = (String) body.get("test_id");
        String userId = (String) body.get("user_id");
        Object answersObj = body.get("answers");

        if (testId == null || userId == null || answersObj == null) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("error", "Missing required fields: test_id, user_id, answers"));
        }

        Optional<TestAttempt> existingOpt = testAttemptRepository.findByTestIdAndUserId(testId, userId);
        if (existingOpt.isPresent() && existingOpt.get().getScore() >= 50) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("error", "Unit test already passed. No further attempts allowed."));
        }

        Optional<Test> testOpt = testRepository.findById(testId);
        if (testOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", "Unit test not found"));
        }

        Test test = testOpt.get();
        JsonNode questionsNode = objectMapper.valueToTree(test.getQuestions());
        JsonNode answersNode = objectMapper.valueToTree(answersObj);

        int totalQuestions = questionsNode.isArray() ? questionsNode.size() : 0;
        int correctCount = 0;

        for (int i = 0; i < totalQuestions; i++) {
            JsonNode q = questionsNode.get(i);
            String correctAnswer = q.path("correctAnswer").asText("");
            String userAnswer = "";

            if (answersNode.isArray() && answersNode.size() > i) {
                JsonNode aNode = answersNode.get(i);
                userAnswer = aNode.has("answer") ? aNode.path("answer").asText("") : aNode.asText("");
            }

            if (correctAnswer.equalsIgnoreCase(userAnswer)) {
                correctCount++;
            }
        }

        int score = totalQuestions > 0 ? (int) Math.round(((double) correctCount / totalQuestions) * 100) : 0;

        TestAttempt attempt;
        if (existingOpt.isPresent()) {
            attempt = existingOpt.get();
            attempt.setAnswers(answersObj);
            attempt.setScore(score);
            attempt.setCorrectCount(correctCount);
            attempt.setTotalQuestions(totalQuestions);
            attempt.setAttemptCount(attempt.getAttemptCount() + 1);
            attempt.setCompletedAt(LocalDateTime.now());
        } else {
            attempt = TestAttempt.builder()
                    .testId(testId)
                    .userId(userId)
                    .answers(answersObj)
                    .score(score)
                    .correctCount(correctCount)
                    .totalQuestions(totalQuestions)
                    .attemptCount(1)
                    .build();
        }
        attempt = testAttemptRepository.save(attempt);

        return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Unit test attempt submitted successfully",
                "attempt", Map.of(
                        "attempt_id", attempt.getAttemptId(),
                        "score", attempt.getScore(),
                        "correctCount", attempt.getCorrectCount(),
                        "totalQuestions", attempt.getTotalQuestions(),
                        "completedAt", attempt.getCompletedAt()
                )
        ));
    }

    @PostMapping({"/unit-tests/generate/{unit_id}", "/generate-test/{unit_id}"})
    public ResponseEntity<?> generateUnitTestForUnit(@PathVariable("unit_id") String unitId) {
        Optional<Unit> unitOpt = unitRepository.findById(unitId);
        if (unitOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", "Unit not found"));
        }

        Optional<Test> existing = testRepository.findByUnitId(unitId);
        if (existing.isPresent()) {
            return ResponseEntity.ok(Map.of("message", "Unit test already exists", "test", existing.get()));
        }

        Unit unit = unitOpt.get();
        List<Chapter> chapters = chapterRepository.findByUnitId(unitId);
        List<String> chapterNames = chapters.stream().map(Chapter::getName).toList();

        JsonNode questions = geminiService.generateUnitTest(unit.getName(), chapterNames);

        Test test = Test.builder()
                .unitId(unitId)
                .questions(questions)
                .build();
        test = testRepository.save(test);

        return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Unit test generated successfully",
                "test", test
        ));
    }

    @PostMapping({"/unit-tests/generate-missing", "/generate-missing-tests"})
    public ResponseEntity<?> generateMissingUnitTests(@RequestBody Map<String, String> body) {
        String courseId = body.get("course_id");
        if (courseId == null || courseId.isBlank()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("error", "course_id is required"));
        }

        List<Unit> units = unitRepository.findByCourseId(courseId);
        List<Map<String, Object>> generatedTests = new ArrayList<>();

        for (Unit unit : units) {
            Optional<Test> testOpt = testRepository.findByUnitId(unit.getUnitId());
            if (testOpt.isEmpty()) {
                List<Chapter> chapters = chapterRepository.findByUnitId(unit.getUnitId());
                List<String> chapterNames = chapters.stream().map(Chapter::getName).toList();
                JsonNode questions = geminiService.generateUnitTest(unit.getName(), chapterNames);

                Test test = Test.builder()
                        .unitId(unit.getUnitId())
                        .questions(questions)
                        .build();
                test = testRepository.save(test);

                generatedTests.add(Map.of(
                        "unit_id", unit.getUnitId(),
                        "unit_name", unit.getName(),
                        "test_id", test.getTestId()
                ));
            }
        }

        return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Generated " + generatedTests.size() + " unit tests",
                "generatedTests", generatedTests
        ));
    }
}
