package com.grivax.gen.controller;

import com.grivax.gen.entity.User;
import com.grivax.gen.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
@Slf4j
public class UserController {

    private final UserRepository userRepository;

    @GetMapping("/user")
    public ResponseEntity<?> getUser(
            @RequestParam(value = "email", required = false) String email,
            @RequestParam(value = "user_id", required = false) String userId,
            @RequestHeader(value = "X-User-Email", required = false) String headerEmail
    ) {
        String targetEmail = email != null ? email : headerEmail;

        Optional<User> userOpt;
        if (targetEmail != null && !targetEmail.isBlank()) {
            userOpt = userRepository.findByEmail(targetEmail);
        } else if (userId != null && !userId.isBlank()) {
            userOpt = userRepository.findById(userId);
        } else {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("error", "Email or user_id required"));
        }

        if (userOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", "User not found"));
        }

        User user = userOpt.get();
        return ResponseEntity.ok(Map.of(
                "user_id", user.getUserId(),
                "email", user.getEmail(),
                "name", user.getName() != null ? user.getName() : "",
                "role", user.getRole()
        ));
    }

    @PostMapping("/update-role")
    public ResponseEntity<?> updateRole(
            @RequestBody Map<String, String> body,
            @RequestHeader(value = "X-User-Email", required = false) String headerEmail
    ) {
        String email = body.get("email") != null ? body.get("email") : headerEmail;
        String userId = body.get("user_id") != null ? body.get("user_id") : body.get("userId");
        String role = body.get("role");

        if ((email == null || email.isBlank()) && (userId == null || userId.isBlank())) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "Unauthorized"));
        }

        if (role == null || (!role.equals("STUDENT") && !role.equals("TEACHER"))) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("error", "Invalid role. Must be STUDENT or TEACHER"));
        }

        Optional<User> optionalUser;
        if (email != null && !email.isBlank()) {
            optionalUser = userRepository.findByEmail(email);
        } else {
            optionalUser = userRepository.findById(userId);
        }

        if (optionalUser.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", "User not found"));
        }

        User user = optionalUser.get();
        user.setRole(role);
        userRepository.save(user);

        return ResponseEntity.ok(Map.of(
                "message", "Role updated successfully",
                "role", user.getRole()
        ));
    }
}

