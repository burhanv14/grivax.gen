package com.grivax.gen.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestClient;

import java.util.Map;

@Service
@Slf4j
public class RecaptchaService {

    private final RestClient restClient;
    private final ObjectMapper objectMapper;
    private final String secretKey;

    public RecaptchaService(
            @Value("${recaptcha.secret.key:}") String secretKey,
            ObjectMapper objectMapper
    ) {
        this.secretKey = (secretKey == null || secretKey.isBlank()) ? System.getenv("RECAPTCHA_SECRET_KEY") : secretKey;
        this.objectMapper = objectMapper;
        this.restClient = RestClient.builder()
                .baseUrl("https://www.google.com/recaptcha/api")
                .build();
    }

    public Map<String, Object> verify(String token) {
        if (secretKey == null || secretKey.isBlank()) {
            return Map.of("success", true, "score", 1.0);
        }

        try {
            MultiValueMap<String, String> formData = new LinkedMultiValueMap<>();
            formData.add("secret", secretKey);
            formData.add("response", token);

            String response = restClient.post()
                    .uri("/siteverify")
                    .contentType(MediaType.APPLICATION_FORM_URLENCODED)
                    .body(formData)
                    .retrieve()
                    .body(String.class);

            JsonNode node = objectMapper.readTree(response);
            boolean success = node.path("success").asBoolean(false);
            double score = node.path("score").asDouble(0.0);

            if (success && score > 0.5) {
                return Map.of("success", true, "score", score);
            } else {
                return Map.of(
                        "success", false,
                        "score", score,
                        "errorCodes", node.path("error-codes")
                );
            }
        } catch (Exception e) {
            log.error("reCAPTCHA verification failed: {}", e.getMessage());
            return Map.of("success", false, "error", e.getMessage());
        }
    }
}

