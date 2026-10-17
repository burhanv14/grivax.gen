package com.grivax.gen.repository;

import com.grivax.gen.entity.Chapter;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ChapterRepository extends JpaRepository<Chapter, String> {
    List<Chapter> findByUnitId(String unitId);
    Optional<Chapter> findByChapterIdAndUnitId(String chapterId, String unitId);
}

