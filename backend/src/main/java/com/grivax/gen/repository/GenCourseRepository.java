package com.grivax.gen.repository;

import com.grivax.gen.entity.GenCourse;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface GenCourseRepository extends JpaRepository<GenCourse, String> {
    Optional<GenCourse> findByCourseId(String courseId);
    Optional<GenCourse> findByUserIdAndCourseId(String userId, String courseId);
    Optional<GenCourse> findByIdAndUserIdAndCourseId(String id, String userId, String courseId);
}

