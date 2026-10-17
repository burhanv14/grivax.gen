package com.grivax.gen.controller;

import com.grivax.gen.entity.Chapter;
import com.grivax.gen.entity.Course;
import com.grivax.gen.entity.Unit;
import com.grivax.gen.entity.User;
import com.grivax.gen.repository.ChapterRepository;
import com.grivax.gen.repository.CourseRepository;
import com.grivax.gen.repository.UnitRepository;
import com.grivax.gen.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/api/courses")
@RequiredArgsConstructor
@Slf4j
public class CourseController {

    private final CourseRepository courseRepository;
    private final UnitRepository unitRepository;
    private final ChapterRepository chapterRepository;
    private final UserRepository userRepository;

    @GetMapping
    public ResponseEntity<?> getCourses(
            @RequestParam(value = "userId", required = false) String userId,
            @RequestParam(value = "user_id", required = false) String user_id,
            @RequestParam(value = "email", required = false) String email,
            @RequestHeader(value = "X-User-Email", required = false) String headerEmail
    ) {
        String resolvedUserId = userId != null ? userId : user_id;
        if (resolvedUserId == null && (email != null || headerEmail != null)) {
            String targetEmail = email != null ? email : headerEmail;
            Optional<User> userOpt = userRepository.findByEmail(targetEmail);
            if (userOpt.isPresent()) {
                resolvedUserId = userOpt.get().getUserId();
            }
        }

        if (resolvedUserId == null || resolvedUserId.isBlank()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("error", "User ID is required"));
        }

        List<Course> courses = courseRepository.findByUserIdOrderByCreatedAtDesc(resolvedUserId);
        return ResponseEntity.ok(courses);
    }

    @GetMapping("/user")
    public ResponseEntity<?> getCoursesForCurrentUser(
            @RequestParam(value = "email", required = false) String email,
            @RequestParam(value = "user_id", required = false) String userId,
            @RequestParam(value = "userId", required = false) String altUserId,
            @RequestHeader(value = "X-User-Email", required = false) String headerEmail
    ) {
        String targetEmail = email != null ? email : headerEmail;
        String resolvedUserId = userId != null ? userId : altUserId;

        if (resolvedUserId == null && targetEmail != null) {
            Optional<User> userOpt = userRepository.findByEmail(targetEmail);
            if (userOpt.isPresent()) {
                resolvedUserId = userOpt.get().getUserId();
            }
        }

        if (resolvedUserId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "Unauthorized"));
        }

        List<Course> courses = courseRepository.findByUserIdOrderByCreatedAtDesc(resolvedUserId);
        return ResponseEntity.ok(Map.of("success", true, "courses", courses));
    }

    @GetMapping("/{user_id}")
    public ResponseEntity<?> getCoursesByUserId(@PathVariable("user_id") String userId) {
        if (userId == null || userId.isBlank()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("error", "User ID is required"));
        }

        List<Course> courses = courseRepository.findByUserIdOrderByCreatedAtDesc(userId);
        return ResponseEntity.ok(courses);
    }

    @GetMapping("/{user_id}/{course_id}")
    public ResponseEntity<?> getCourseById(
            @PathVariable("user_id") String userId,
            @PathVariable("course_id") String courseId
    ) {
        Optional<Course> courseOpt = courseRepository.findByCourseIdAndUserId(courseId, userId);
        if (courseOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", "Course not found"));
        }
        return ResponseEntity.ok(courseOpt.get());
    }

    @GetMapping("/{user_id}/{course_id}/{unit_id}/{chapter_id}/status")
    public ResponseEntity<?> getChapterStatus(
            @PathVariable("user_id") String userId,
            @PathVariable("course_id") String courseId,
            @PathVariable("unit_id") String unitId,
            @PathVariable("chapter_id") String chapterId
    ) {
        Optional<Course> courseOpt = courseRepository.findByCourseIdAndUserId(courseId, userId);
        if (courseOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", "Course not found"));
        }

        Optional<Chapter> chapterOpt = chapterRepository.findByChapterIdAndUnitId(chapterId, unitId);
        if (chapterOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", "Chapter not found"));
        }

        Chapter chapter = chapterOpt.get();
        return ResponseEntity.ok(Map.of("success", true, "isCompleted", chapter.getIsCompleted()));
    }

    @PostMapping("/{user_id}/{course_id}/{unit_id}/{chapter_id}/complete")
    public ResponseEntity<?> completeChapter(
            @PathVariable("user_id") String userId,
            @PathVariable("course_id") String courseId,
            @PathVariable("unit_id") String unitId,
            @PathVariable("chapter_id") String chapterId
    ) {
        Optional<Course> courseOpt = courseRepository.findByCourseIdAndUserId(courseId, userId);
        if (courseOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", "Course not found"));
        }

        Optional<Chapter> chapterOpt = chapterRepository.findByChapterIdAndUnitId(chapterId, unitId);
        if (chapterOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", "Chapter not found"));
        }

        Chapter chapter = chapterOpt.get();
        chapter.setIsCompleted(true);
        chapterRepository.save(chapter);

        // Recalculate unit progress
        Optional<Unit> unitOpt = unitRepository.findById(unitId);
        int unitProgress = 0;
        if (unitOpt.isPresent()) {
            Unit unit = unitOpt.get();
            List<Chapter> chapters = chapterRepository.findByUnitId(unitId);
            long completed = chapters.stream().filter(Chapter::getIsCompleted).count();
            unitProgress = chapters.isEmpty() ? 0 : (int) Math.round(((double) completed / chapters.size()) * 100);
            unit.setProgress(unitProgress);
            unitRepository.save(unit);
        }

        // Recalculate course progress
        List<Unit> courseUnits = unitRepository.findByCourseId(courseId);
        long completedUnits = 0;
        for (Unit u : courseUnits) {
            List<Chapter> chapters = chapterRepository.findByUnitId(u.getUnitId());
            boolean allDone = !chapters.isEmpty() && chapters.stream().allMatch(Chapter::getIsCompleted);
            if (allDone) completedUnits++;
        }
        int courseProgress = courseUnits.isEmpty() ? 0 : (int) Math.round(((double) completedUnits / courseUnits.size()) * 100);

        Course course = courseOpt.get();
        course.setProgress(courseProgress);
        courseRepository.save(course);

        return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Chapter marked as completed",
                "chapter", chapter,
                "unitProgress", unitProgress,
                "courseProgress", courseProgress
        ));
    }
}

