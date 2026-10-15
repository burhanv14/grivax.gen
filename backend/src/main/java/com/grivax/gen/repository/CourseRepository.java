package com.gravax.gen.repository;

import com.gravax.gen.entity.Course;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CourseRepository extends JpaRepository<Course, String> {
    List<Course> findByUserIdOrderByCreatedAtDesc(String userId);
    List<Course> findByUserIdOrderByUpdatedAtDesc(String userId);
    Optional<Course> findByCourseIdAndUserId(String courseId, String userId);
}
