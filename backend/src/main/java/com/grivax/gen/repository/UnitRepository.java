package com.grivax.gen.repository;

import com.grivax.gen.entity.Unit;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface UnitRepository extends JpaRepository<Unit, String> {
    List<Unit> findByCourseId(String courseId);
}

