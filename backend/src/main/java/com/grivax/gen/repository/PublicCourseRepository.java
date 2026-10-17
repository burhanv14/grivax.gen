package com.grivax.gen.repository;

import com.grivax.gen.entity.PublicCourse;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PublicCourseRepository extends JpaRepository<PublicCourse, String> {
    List<PublicCourse> findByTeacherIdOrderByCreatedAtDesc(String teacherId);
    List<PublicCourse> findByIsPublishedOrderByCreatedAtDesc(Boolean isPublished);
    List<PublicCourse> findByTeacherIdAndIsPublishedOrderByCreatedAtDesc(String teacherId, Boolean isPublished);
    List<PublicCourse> findAllByOrderByCreatedAtDesc();
}

