package com.grivax.gen.controller;

import com.grivax.gen.entity.PublicCourse;
import com.grivax.gen.entity.PublicCourseEnrollment;
import com.grivax.gen.entity.User;
import com.grivax.gen.repository.PublicCourseEnrollmentRepository;
import com.grivax.gen.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/api/students")
@RequiredArgsConstructor
@Slf4j
public class StudentController {

    private final UserRepository userRepository;
    private final PublicCourseEnrollmentRepository enrollmentRepository;

    @GetMapping
    public ResponseEntity<?> getStudents(@RequestParam(value = "search", required = false) String search) {
        List<User> students;
        if (search != null && !search.isBlank()) {
            students = userRepository.findByRoleAndNameContainingIgnoreCaseOrRoleAndEmailContainingIgnoreCase(
                    "STUDENT", search, "STUDENT", search
            );
        } else {
            students = userRepository.findByRoleOrderByNameAsc("STUDENT");
        }

        List<Map<String, Object>> result = students.stream().map(s -> {
            Map<String, Object> map = new HashMap<>();
            map.put("user_id", s.getUserId());
            map.put("name", s.getName() != null ? s.getName() : "");
            map.put("email", s.getEmail());
            map.put("createdAt", s.getCreatedAt() != null ? s.getCreatedAt().toString() : "");
            return map;
        }).toList();

        return ResponseEntity.ok(result);
    }

    @GetMapping("/{user_id}/enrolled-courses")
    public ResponseEntity<?> getEnrolledCourses(@PathVariable("user_id") String userId) {
        List<PublicCourseEnrollment> enrollments = enrollmentRepository.findByStudentIdOrderByEnrolledAtDesc(userId);

        List<Map<String, Object>> result = new ArrayList<>();
        for (PublicCourseEnrollment e : enrollments) {
            PublicCourse pc = e.getPublicCourse();
            // Hide draft (unpublished) public courses from enrolled students
            if (pc == null || !Boolean.TRUE.equals(pc.getIsPublished())) {
                continue;
            }

            Map<String, Object> courseData = new HashMap<>();
            courseData.put("public_course_id", pc.getPublicCourseId());
            courseData.put("title", pc.getTitle());
            courseData.put("description", pc.getDescription());
            courseData.put("image", pc.getImage());
            courseData.put("teacher", pc.getTeacher());
            courseData.put("units", pc.getUnits());
            courseData.put("isPublished", pc.getIsPublished());
            courseData.put("_count", pc.getCount());
            courseData.put("enrollment", Map.of(
                    "enrollment_id", e.getEnrollmentId(),
                    "enrolledAt", e.getEnrolledAt(),
                    "progress", e.getProgress()
            ));
            result.add(courseData);
        }

        return ResponseEntity.ok(result);
    }
}

