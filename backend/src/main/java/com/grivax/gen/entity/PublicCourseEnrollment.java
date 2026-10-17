package com.grivax.gen.entity;

import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "public_course_enrollments", uniqueConstraints = {
    @UniqueConstraint(name = "uk_enrollment_course_student", columnNames = {"public_course_id", "student_id"})
}, indexes = {
    @Index(name = "idx_enrollment_student_id", columnList = "student_id"),
    @Index(name = "idx_enrollment_course_id", columnList = "public_course_id")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PublicCourseEnrollment {

    @Id
    @Column(name = "enrollment_id", length = 64)
    @JsonProperty("enrollment_id")
    private String enrollmentId;

    @Column(name = "public_course_id", nullable = false, length = 64)
    @JsonProperty("public_course_id")
    private String publicCourseId;

    @Column(name = "student_id", nullable = false, length = 64)
    @JsonProperty("student_id")
    private String studentId;

    @CreationTimestamp
    @Column(name = "enrolled_at", nullable = false)
    @JsonProperty("enrolledAt")
    private LocalDateTime enrolledAt;

    @Column(name = "progress", nullable = false)
    @Builder.Default
    private Integer progress = 0;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "public_course_id", insertable = false, updatable = false)
    @JsonBackReference
    private PublicCourse publicCourse;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "student_id", insertable = false, updatable = false)
    private User student;

    @PrePersist
    public void ensureId() {
        if (this.enrollmentId == null || this.enrollmentId.isBlank()) {
            this.enrollmentId = UUID.randomUUID().toString().replace("-", "").substring(0, 10);
        }
    }
}

