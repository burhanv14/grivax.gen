package com.grivax.gen.entity;

import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fasterxml.jackson.annotation.JsonManagedReference;
import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.*;
import lombok.*;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "units", indexes = {
    @Index(name = "idx_unit_course_id", columnList = "course_id")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Unit {

    @Id
    @Column(name = "unit_id", length = 64)
    @JsonProperty("unit_id")
    private String unitId;

    @Column(name = "course_id", nullable = false, length = 64)
    @JsonProperty("course_id")
    private String courseId;

    @Column(name = "name", nullable = false)
    private String name;

    @Column(name = "progress", nullable = false)
    @Builder.Default
    private Integer progress = 0;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "course_id", insertable = false, updatable = false)
    @JsonBackReference
    private Course course;

    @OneToMany(mappedBy = "unit", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonManagedReference
    @Builder.Default
    private List<Chapter> chapters = new ArrayList<>();

    @OneToOne(mappedBy = "unit", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonProperty("test")
    private Test test;

    @PrePersist
    public void ensureId() {
        if (this.unitId == null || this.unitId.isBlank()) {
            this.unitId = UUID.randomUUID().toString().replace("-", "").substring(0, 10);
        }
    }
}

