package com.gravax.gen.repository;

import com.gravax.gen.entity.AssessmentAttempt;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface AssessmentAttemptRepository extends JpaRepository<AssessmentAttempt, String> {
    Optional<AssessmentAttempt> findByAssessmentIdAndUserId(String assessmentId, String userId);
    List<AssessmentAttempt> findByAssessmentId(String assessmentId);
}
