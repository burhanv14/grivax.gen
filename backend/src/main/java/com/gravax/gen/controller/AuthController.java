package com.gravax.gen.controller;

import com.gravax.gen.entity.User;
import com.gravax.gen.repository.UserRepository;
import com.gravax.gen.service.RecaptchaService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.Optional;
import java.util.UUID;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
@Slf4j
public class AuthController {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final RecaptchaService recaptchaService;

    @PostMapping("/signup")
    public ResponseEntity<?> signup(@RequestBody Map<String, Object> body) {
        try {
            String email = (String) body.get("email");
            String name = (String) body.get("name");
            String password = (String) body.get("password");
            String role = (String) body.getOrDefault("role", "STUDENT");
            Object oauthProvider = body.get("oauthProvider");

            if (role != null && !role.equals("STUDENT") && !role.equals("TEACHER")) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body(Map.of("error", "Invalid role. Must be STUDENT or TEACHER"));
            }

            Optional<User> existing = userRepository.findByEmail(email);
            if (existing.isPresent()) {
                return ResponseEntity.status(HttpStatus.CONFLICT)
                        .body(Map.of("message", "User already exists", "error", "User already exists"));
            }

            String userId = UUID.randomUUID().toString().replace("-", "").substring(0, 10);
            String encodedPassword = (oauthProvider != null) ? "" : passwordEncoder.encode(password != null ? password : "");

            User user = User.builder()
                    .userId(userId)
                    .email(email)
                    .name(name)
                    .password(encodedPassword)
                    .role(role != null ? role : "STUDENT")
                    .build();

            userRepository.save(user);

            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(Map.of("message", "User created successfully", "userId", userId));
        } catch (Exception e) {
            log.error("Signup error: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Internal server error"));
        }
    }

    @PostMapping("/auth/verify-credentials")
    public ResponseEntity<?> verifyCredentials(@RequestBody Map<String, String> body) {
        String email = body.get("email");
        String password = body.get("password");

        if (email == null || password == null) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("error", "Invalid credentials"));
        }

        Optional<User> optionalUser = userRepository.findByEmail(email);
        if (optionalUser.isEmpty()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "User not found"));
        }

        User user = optionalUser.get();
        if (!passwordEncoder.matches(password, user.getPassword())) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "Invalid password"));
        }

        return ResponseEntity.ok(Map.of(
                "user_id", user.getUserId(),
                "email", user.getEmail(),
                "name", user.getName() != null ? user.getName() : "",
                "role", user.getRole()
        ));
    }

    @PostMapping("/auth/oauth-user")
    public ResponseEntity<?> getOrCreateOauthUser(@RequestBody Map<String, Object> body) {
        try {
            String email = (String) body.get("email");
            String name = (String) body.get("name");

            if (email == null || email.isBlank()) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("error", "Email is required"));
            }

            Optional<User> existing = userRepository.findByEmail(email);
            if (existing.isPresent()) {
                User user = existing.get();
                return ResponseEntity.ok(Map.of(
                        "user_id", user.getUserId(),
                        "email", user.getEmail(),
                        "name", user.getName() != null ? user.getName() : "",
                        "role", user.getRole()
                ));
            }

            String userId = UUID.randomUUID().toString().replace("-", "").substring(0, 10);
            User newUser = User.builder()
                    .userId(userId)
                    .email(email)
                    .name(name != null ? name : "")
                    .password("")
                    .role("STUDENT")
                    .build();

            userRepository.save(newUser);

            return ResponseEntity.ok(Map.of(
                    "user_id", newUser.getUserId(),
                    "email", newUser.getEmail(),
                    "name", newUser.getName(),
                    "role", newUser.getRole()
            ));
        } catch (Exception e) {
            log.error("OAuth user lookup/creation error: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of("error", "Internal server error"));
        }
    }

    @PostMapping("/verify-recaptcha")
    public ResponseEntity<?> verifyRecaptcha(@RequestBody Map<String, String> body) {
        String token = body.get("token");
        Map<String, Object> result = recaptchaService.verify(token);
        return ResponseEntity.ok(result);
    }
}
