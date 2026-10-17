package com.grivax.gen.repository;

import com.grivax.gen.entity.Test;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface TestRepository extends JpaRepository<Test, String> {
    Optional<Test> findByUnitId(String unitId);
}

