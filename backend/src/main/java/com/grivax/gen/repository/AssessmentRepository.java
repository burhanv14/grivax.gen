package com.grivax.gen.repository;

import com.grivax.gen.entity.Assessment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface AssessmentRepository extends JpaRepository<Assessment, String> {
    Optional<Assessment> findByCourseId(String courseId);
}

