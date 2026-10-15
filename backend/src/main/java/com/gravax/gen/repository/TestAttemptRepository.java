package com.gravax.gen.repository;

import com.gravax.gen.entity.TestAttempt;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface TestAttemptRepository extends JpaRepository<TestAttempt, String> {
    Optional<TestAttempt> findByTestIdAndUserId(String testId, String userId);
    List<TestAttempt> findByTestIdAndUserIdOrderByCompletedAtDesc(String testId, String userId);
}
