package com.gravax.gen.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
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
@Table(name = "courses", indexes = {
    @Index(name = "idx_course_user_id", columnList = "user_id")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Course {

    @Id
    @Column(name = "course_id", length = 64)
    @JsonProperty("course_id")
    private String courseId;

    @Column(name = "user_id", nullable = false, length = 64)
    @JsonProperty("user_id")
    private String userId;

    @Column(name = "gen_id", length = 64)
    @JsonProperty("genId")
    private String genId;

    @Column(name = "title", nullable = false)
    private String title;

    @Column(name = "image", columnDefinition = "TEXT")
    private String image;

    @Column(name = "progress", nullable = false)
    @Builder.Default
    private Integer progress = 0;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    @JsonProperty("createdAt")
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    @JsonProperty("updatedAt")
    private LocalDateTime updatedAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", insertable = false, updatable = false)
    @JsonIgnore
    private User user;

    @OneToMany(mappedBy = "course", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonManagedReference
    @Builder.Default
    private List<Unit> units = new ArrayList<>();

    @OneToOne(mappedBy = "course", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonProperty("assessment")
    private Assessment assessment;

    @JsonProperty("quiz")
    public Assessment getQuiz() {
        return assessment;
    }

    @PrePersist
    public void ensureId() {
        if (this.courseId == null || this.courseId.isBlank()) {
            this.courseId = UUID.randomUUID().toString().replace("-", "").substring(0, 10);
        }
    }
}
