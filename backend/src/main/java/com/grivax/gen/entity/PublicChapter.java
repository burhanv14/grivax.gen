package com.grivax.gen.entity;

import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "public_chapters", indexes = {
    @Index(name = "idx_public_chapter_unit_id", columnList = "public_unit_id")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PublicChapter {

    @Id
    @Column(name = "public_chapter_id", length = 64)
    @JsonProperty("public_chapter_id")
    private String publicChapterId;

    @Column(name = "public_unit_id", nullable = false, length = 64)
    @JsonProperty("public_unit_id")
    private String publicUnitId;

    @Column(name = "name", nullable = false)
    private String name;

    @Column(name = "youtube_vid_link", length = 1000)
    @JsonProperty("youtubeVidLink")
    private String youtubeVidLink;

    @Column(name = "reading_material", columnDefinition = "TEXT")
    @JsonProperty("readingMaterial")
    private String readingMaterial;

    @Column(name = "chapter_order", nullable = false)
    @JsonProperty("order")
    @Builder.Default
    private Integer order = 0;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    @JsonProperty("createdAt")
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    @JsonProperty("updatedAt")
    private LocalDateTime updatedAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "public_unit_id", insertable = false, updatable = false)
    @JsonBackReference
    private PublicUnit publicUnit;

    @PrePersist
    public void ensureId() {
        if (this.publicChapterId == null || this.publicChapterId.isBlank()) {
            this.publicChapterId = UUID.randomUUID().toString().replace("-", "").substring(0, 10);
        }
    }
}

