package com.gravax.gen.repository;

import com.gravax.gen.entity.Test;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface TestRepository extends JpaRepository<Test, String> {
    Optional<Test> findByUnitId(String unitId);
}
