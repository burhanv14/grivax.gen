package com.gravax.gen.entity;

import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.annotations.UpdateTimestamp;
import org.hibernate.type.SqlTypes;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "assessments", uniqueConstraints = {
    @UniqueConstraint(name = "uk_assessment_course_id", columnNames = {"course_id"})
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Assessment {

    @Id
    @Column(name = "assessment_id", length = 64)
    @JsonProperty("assessment_id")
    private String assessmentId;

    @Column(name = "course_id", nullable = false, length = 64)
    @JsonProperty("course_id")
    private String courseId;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "questions", columnDefinition = "jsonb")
    private Object questions;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    @JsonProperty("createdAt")
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    @JsonProperty("updatedAt")
    private LocalDateTime updatedAt;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "course_id", insertable = false, updatable = false)
    @JsonBackReference
    private Course course;

    @OneToMany(mappedBy = "assessment", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<AssessmentAttempt> attempts = new ArrayList<>();

    @JsonProperty("quiz_id")
    public String getQuizId() {
        return assessmentId;
    }

    @PrePersist
    public void ensureId() {
        if (this.assessmentId == null || this.assessmentId.isBlank()) {
            this.assessmentId = UUID.randomUUID().toString().replace("-", "").substring(0, 10);
        }
    }
}
