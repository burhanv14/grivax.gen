package com.gravax.gen.controller;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.gravax.gen.entity.*;
import com.gravax.gen.repository.*;
import com.gravax.gen.service.GeminiService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping({"/api/assessments", "/api/quizzes"})
@RequiredArgsConstructor
@Slf4j
public class AssessmentController {

    private final AssessmentRepository assessmentRepository;
    private final AssessmentAttemptRepository assessmentAttemptRepository;
    private final CourseRepository courseRepository;
    private final UnitRepository unitRepository;
    private final ChapterRepository chapterRepository;
    private final UserRepository userRepository;
    private final GeminiService geminiService;
    private final ObjectMapper objectMapper;

    @PostMapping("/{courseId}")
    public ResponseEntity<?> generateAssessment(
            @PathVariable("courseId") String courseId,
            @RequestParam(value = "user_id", required = false) String userId,
            @RequestParam(value = "email", required = false) String email,
            @RequestHeader(value = "X-User-Email", required = false) String headerEmail
    ) {
        Optional<Assessment> existing = assessmentRepository.findByCourseId(courseId);
        if (existing.isPresent()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("error", "Assessment already exists for this course"));
        }

        Optional<Course> courseOpt = courseRepository.findById(courseId);
        if (courseOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", "Course not found"));
        }

        Course course = courseOpt.get();
        List<Unit> units = unitRepository.findByCourseId(courseId);
        List<Map<String, Object>> unitsData = new ArrayList<>();
        for (Unit u : units) {
            List<Chapter> chapters = chapterRepository.findByUnitId(u.getUnitId());
            List<String> chapterNames = chapters.stream().map(Chapter::getName).toList();
            unitsData.add(Map.of("name", u.getName(), "chapters", chapterNames));
        }

        JsonNode questions = geminiService.generateAssessmentQuestions(course.getTitle(), unitsData);

        Assessment assessment = Assessment.builder()
                .courseId(courseId)
                .questions(questions)
                .build();
        assessment = assessmentRepository.save(assessment);

        Map<String, Object> assessmentData = Map.of(
                "assessment_id", assessment.getAssessmentId(),
                "quiz_id", assessment.getAssessmentId(),
                "questions", assessment.getQuestions()
        );

        return ResponseEntity.ok(Map.of(
                "success", true,
                "assessment", assessmentData,
                "quiz", assessmentData
        ));
    }

    @GetMapping("/{courseId}")
    public ResponseEntity<?> getAssessment(
            @PathVariable("courseId") String courseId,
            @RequestParam(value = "user_id", required = false) String userId,
            @RequestParam(value = "userId", required = false) String altUserId,
            @RequestParam(value = "email", required = false) String email,
            @RequestHeader(value = "X-User-Email", required = false) String headerEmail
    ) {
        String resolvedUserId = resolveUserId(userId != null ? userId : altUserId, email, headerEmail);

        Optional<Assessment> assessmentOpt = assessmentRepository.findByCourseId(courseId);
        if (assessmentOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", "Assessment not found"));
        }

        Assessment assessment = assessmentOpt.get();
        Optional<AssessmentAttempt> attemptOpt = (resolvedUserId != null)
                ? assessmentAttemptRepository.findByAssessmentIdAndUserId(assessment.getAssessmentId(), resolvedUserId)
                : Optional.empty();

        boolean hasAttempt = attemptOpt.isPresent();

        Map<String, Object> assessmentData = Map.of(
                "assessment_id", assessment.getAssessmentId(),
                "quiz_id", assessment.getAssessmentId(),
                "questions", assessment.getQuestions()
        );

        return ResponseEntity.ok(Map.of(
                "assessment", assessmentData,
                "quiz", assessmentData,
                "hasAttempt", hasAttempt,
                "attempt", hasAttempt ? attemptOpt.get() : Map.of()
        ));
    }

    @GetMapping("/{courseId}/attempt")
    public ResponseEntity<?> getAssessmentAttempt(
            @PathVariable("courseId") String courseId,
            @RequestParam(value = "user_id", required = false) String userId,
            @RequestParam(value = "userId", required = false) String altUserId,
            @RequestParam(value = "email", required = false) String email,
            @RequestHeader(value = "X-User-Email", required = false) String headerEmail
    ) {
        String resolvedUserId = resolveUserId(userId != null ? userId : altUserId, email, headerEmail);
        if (resolvedUserId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "Unauthorized"));
        }

        Optional<Assessment> assessmentOpt = assessmentRepository.findByCourseId(courseId);
        if (assessmentOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", "Assessment not found"));
        }

        Assessment assessment = assessmentOpt.get();
        Optional<AssessmentAttempt> attemptOpt = assessmentAttemptRepository.findByAssessmentIdAndUserId(assessment.getAssessmentId(), resolvedUserId);
        if (attemptOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", "No assessment attempt found"));
        }

        AssessmentAttempt attempt = attemptOpt.get();
        JsonNode questionsNode = objectMapper.valueToTree(assessment.getQuestions());
        JsonNode answersNode = objectMapper.valueToTree(attempt.getAnswers());

        List<Map<String, Object>> results = new ArrayList<>();
        if (questionsNode.isArray()) {
            for (int i = 0; i < questionsNode.size(); i++) {
                JsonNode q = questionsNode.get(i);
                int userAnswer = (answersNode.isArray() && answersNode.size() > i) ? answersNode.get(i).asInt(-1) : -1;
                int correctAnswer = q.path("correctAnswer").asInt(0);

                results.add(Map.of(
                        "questionIndex", i,
                        "questionText", q.path("questionText").asText(""),
                        "userAnswer", userAnswer,
                        "correctAnswer", correctAnswer,
                        "isCorrect", userAnswer == correctAnswer,
                        "explanation", q.path("explanation").asText("No explanation available"),
                        "options", q.path("options")
                ));
            }
        }

        Map<String, Object> assessmentData = Map.of(
                "assessment_id", assessment.getAssessmentId(),
                "quiz_id", assessment.getAssessmentId(),
                "questions", assessment.getQuestions()
        );

        return ResponseEntity.ok(Map.of(
                "success", true,
                "assessment", assessmentData,
                "quiz", assessmentData,
                "attempt", Map.of(
                        "attempt_id", attempt.getAttemptId(),
                        "score", attempt.getScore(),
                        "correctCount", attempt.getCorrectCount(),
                        "totalQuestions", attempt.getTotalQuestions(),
                        "completedAt", attempt.getCompletedAt(),
                        "answers", attempt.getAnswers()
                ),
                "results", results
        ));
    }

    @PostMapping("/{courseId}/submit")
    public ResponseEntity<?> submitAssessment(
            @PathVariable("courseId") String courseId,
            @RequestBody Map<String, Object> body,
            @RequestHeader(value = "X-User-Email", required = false) String headerEmail
    ) {
        String userId = (String) body.get("user_id");
        if (userId == null) userId = (String) body.get("userId");
        String email = (String) body.get("email");
        String resolvedUserId = resolveUserId(userId, email, headerEmail);

        if (resolvedUserId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "Unauthorized"));
        }

        Object answersObj = body.get("answers");
        if (answersObj == null) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("error", "Invalid answers format"));
        }

        Optional<Assessment> assessmentOpt = assessmentRepository.findByCourseId(courseId);
        if (assessmentOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", "Assessment not found"));
        }

        Assessment assessment = assessmentOpt.get();
        Optional<AssessmentAttempt> existing = assessmentAttemptRepository.findByAssessmentIdAndUserId(assessment.getAssessmentId(), resolvedUserId);
        if (existing.isPresent()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of(
                    "error", "You have already completed this assessment. You can only review your previous attempt."
            ));
        }

        JsonNode questionsNode = objectMapper.valueToTree(assessment.getQuestions());
        JsonNode answersNode = objectMapper.valueToTree(answersObj);

        int correctCount = 0;
        int totalQuestions = questionsNode.isArray() ? questionsNode.size() : 0;
        List<Map<String, Object>> results = new ArrayList<>();

        for (int i = 0; i < totalQuestions; i++) {
            JsonNode q = questionsNode.get(i);
            int userAnswer = (answersNode.isArray() && answersNode.size() > i) ? answersNode.get(i).asInt(-1) : -1;
            int correctAnswer = q.path("correctAnswer").asInt(0);
            boolean isCorrect = userAnswer == correctAnswer;
            if (isCorrect) correctCount++;

            results.add(Map.of(
                    "questionIndex", i,
                    "questionText", q.path("questionText").asText(""),
                    "userAnswer", userAnswer,
                    "correctAnswer", correctAnswer,
                    "isCorrect", isCorrect,
                    "explanation", q.path("explanation").asText("No explanation available"),
                    "options", q.path("options")
            ));
        }

        int score = totalQuestions > 0 ? (int) Math.round(((double) correctCount / totalQuestions) * 100) : 0;

        AssessmentAttempt attempt = AssessmentAttempt.builder()
                .assessmentId(assessment.getAssessmentId())
                .userId(resolvedUserId)
                .answers(answersObj)
                .score(score)
                .correctCount(correctCount)
                .totalQuestions(totalQuestions)
                .build();
        attempt = assessmentAttemptRepository.save(attempt);

        return ResponseEntity.ok(Map.of(
                "success", true,
                "score", score,
                "correctAnswers", correctCount,
                "totalQuestions", totalQuestions,
                "results", results,
                "attemptId", attempt.getAttemptId()
        ));
    }

    private String resolveUserId(String userId, String email, String headerEmail) {
        if (userId != null && !userId.isBlank()) return userId;
        String targetEmail = email != null ? email : headerEmail;
        if (targetEmail != null && !targetEmail.isBlank()) {
            Optional<User> u = userRepository.findByEmail(targetEmail);
            if (u.isPresent()) return u.get().getUserId();
        }
        return null;
    }
}
