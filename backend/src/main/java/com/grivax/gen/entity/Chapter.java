package com.grivax.gen.entity;

import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.*;
import lombok.*;

import java.util.UUID;

@Entity
@Table(name = "chapters", indexes = {
    @Index(name = "idx_chapter_unit_id", columnList = "unit_id")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Chapter {

    @Id
    @Column(name = "chapter_id", length = 64)
    @JsonProperty("chapter_id")
    private String chapterId;

    @Column(name = "unit_id", nullable = false, length = 64)
    @JsonProperty("unit_id")
    private String unitId;

    @Column(name = "name", nullable = false)
    private String name;

    @Column(name = "youtube_vid_link", length = 1000)
    @JsonProperty("youtubeVidLink")
    private String youtubeVidLink;

    @Column(name = "reading_material", columnDefinition = "TEXT")
    @JsonProperty("readingMaterial")
    private String readingMaterial;

    @Column(name = "is_completed", nullable = false)
    @JsonProperty("isCompleted")
    @Builder.Default
    private Boolean isCompleted = false;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "unit_id", insertable = false, updatable = false)
    @JsonBackReference
    private Unit unit;

    @PrePersist
    public void ensureId() {
        if (this.chapterId == null || this.chapterId.isBlank()) {
            this.chapterId = UUID.randomUUID().toString().replace("-", "").substring(0, 10);
        }
    }
}

