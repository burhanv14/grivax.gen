package com.gravax.gen.repository;

import com.gravax.gen.entity.PublicChapter;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PublicChapterRepository extends JpaRepository<PublicChapter, String> {
    List<PublicChapter> findByPublicUnitIdOrderByOrderAsc(String publicUnitId);
    Optional<PublicChapter> findFirstByPublicUnitIdOrderByOrderDesc(String publicUnitId);
}
