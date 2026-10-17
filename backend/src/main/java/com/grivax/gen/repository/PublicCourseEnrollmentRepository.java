package com.grivax.gen.repository;

import com.grivax.gen.entity.PublicCourseEnrollment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PublicCourseEnrollmentRepository extends JpaRepository<PublicCourseEnrollment, String> {
    Optional<PublicCourseEnrollment> findByPublicCourseIdAndStudentId(String publicCourseId, String studentId);
    List<PublicCourseEnrollment> findByPublicCourseIdOrderByEnrolledAtDesc(String publicCourseId);
    List<PublicCourseEnrollment> findByStudentIdOrderByEnrolledAtDesc(String studentId);
}

