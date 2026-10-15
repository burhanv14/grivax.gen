package com.gravax.gen.entity;

import com.fasterxml.jackson.annotation.JsonManagedReference;
import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Entity
@Table(name = "public_courses", indexes = {
    @Index(name = "idx_pub_course_teacher_id", columnList = "teacher_id"),
    @Index(name = "idx_pub_course_is_published", columnList = "is_published")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PublicCourse {

    @Id
    @Column(name = "public_course_id", length = 64)
    @JsonProperty("public_course_id")
    private String publicCourseId;

    @Column(name = "teacher_id", nullable = false, length = 64)
    @JsonProperty("teacher_id")
    private String teacherId;

    @Column(name = "title", nullable = false)
    private String title;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @Column(name = "image", columnDefinition = "TEXT")
    private String image;

    @Column(name = "is_published", nullable = false)
    @JsonProperty("isPublished")
    @Builder.Default
    private Boolean isPublished = false;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    @JsonProperty("createdAt")
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    @JsonProperty("updatedAt")
    private LocalDateTime updatedAt;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "teacher_id", insertable = false, updatable = false)
    private User teacher;

    @OneToMany(mappedBy = "publicCourse", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("order ASC")
    @JsonManagedReference
    @Builder.Default
    private List<PublicUnit> units = new ArrayList<>();

    @OneToMany(mappedBy = "publicCourse", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonManagedReference
    @Builder.Default
    private List<PublicCourseEnrollment> enrollments = new ArrayList<>();

    @JsonProperty("_count")
    public Map<String, Integer> getCount() {
        return Map.of("enrollments", enrollments != null ? enrollments.size() : 0);
    }

    @PrePersist
    public void ensureId() {
        if (this.publicCourseId == null || this.publicCourseId.isBlank()) {
            this.publicCourseId = UUID.randomUUID().toString().replace("-", "").substring(0, 10);
        }
    }
}
