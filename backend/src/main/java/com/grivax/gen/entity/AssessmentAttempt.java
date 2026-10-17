package com.grivax.gen.entity;

import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "assessment_attempts", uniqueConstraints = {
    @UniqueConstraint(name = "uk_assessment_user_attempt", columnNames = {"assessment_id", "user_id"})
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AssessmentAttempt {

    @Id
    @Column(name = "attempt_id", length = 64)
    @JsonProperty("attempt_id")
    private String attemptId;

    @Column(name = "assessment_id", nullable = false, length = 64)
    @JsonProperty("assessment_id")
    private String assessmentId;

    @Column(name = "user_id", nullable = false, length = 64)
    @JsonProperty("user_id")
    private String userId;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "answers", columnDefinition = "jsonb")
    private Object answers;

    @Column(name = "score", nullable = false)
    private Integer score;

    @Column(name = "correct_count", nullable = false)
    @JsonProperty("correctCount")
    private Integer correctCount;

    @Column(name = "total_questions", nullable = false)
    @JsonProperty("totalQuestions")
    private Integer totalQuestions;

    @CreationTimestamp
    @Column(name = "completed_at", nullable = false)
    @JsonProperty("completedAt")
    private LocalDateTime completedAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "assessment_id", insertable = false, updatable = false)
    @JsonBackReference
    private Assessment assessment;

    @JsonProperty("quiz_id")
    public String getQuizId() {
        return assessmentId;
    }

    @PrePersist
    public void ensureId() {
        if (this.attemptId == null || this.attemptId.isBlank()) {
            this.attemptId = UUID.randomUUID().toString().replace("-", "").substring(0, 10);
        }
    }
}

