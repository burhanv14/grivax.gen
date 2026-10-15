package com.gravax.gen.repository;

import com.gravax.gen.entity.PublicUnit;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PublicUnitRepository extends JpaRepository<PublicUnit, String> {
    List<PublicUnit> findByPublicCourseIdOrderByOrderAsc(String publicCourseId);
}
