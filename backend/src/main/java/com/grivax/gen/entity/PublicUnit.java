package com.gravax.gen.entity;

import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fasterxml.jackson.annotation.JsonManagedReference;
import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "public_units", indexes = {
    @Index(name = "idx_public_unit_course_id", columnList = "public_course_id")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PublicUnit {

    @Id
    @Column(name = "public_unit_id", length = 64)
    @JsonProperty("public_unit_id")
    private String publicUnitId;

    @Column(name = "public_course_id", nullable = false, length = 64)
    @JsonProperty("public_course_id")
    private String publicCourseId;

    @Column(name = "name", nullable = false)
    private String name;

    @Column(name = "unit_order", nullable = false)
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
    @JoinColumn(name = "public_course_id", insertable = false, updatable = false)
    @JsonBackReference
    private PublicCourse publicCourse;

    @OneToMany(mappedBy = "publicUnit", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("order ASC")
    @JsonManagedReference
    @Builder.Default
    private List<PublicChapter> chapters = new ArrayList<>();

    @PrePersist
    public void ensureId() {
        if (this.publicUnitId == null || this.publicUnitId.isBlank()) {
            this.publicUnitId = UUID.randomUUID().toString().replace("-", "").substring(0, 10);
        }
    }
}
