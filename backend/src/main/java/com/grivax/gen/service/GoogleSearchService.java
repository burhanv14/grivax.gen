package com.grivax.gen.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

@Service
@Slf4j
public class GoogleSearchService {

    private static final String DEFAULT_IMAGE = "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1740&q=80";

    private final RestClient restClient;
    private final ObjectMapper objectMapper;
    private final String apiKey;
    private final String cx;

    public GoogleSearchService(
            @Value("${google.api.key:}") String apiKey,
            @Value("${google.cx:}") String cx,
            ObjectMapper objectMapper
    ) {
        this.apiKey = (apiKey == null || apiKey.isBlank()) ? System.getenv("GOOGLE_API_KEY") : apiKey;
        this.cx = (cx == null || cx.isBlank()) ? System.getenv("GOOGLE_CX") : cx;
        this.objectMapper = objectMapper;
        this.restClient = RestClient.builder()
                .baseUrl("https://www.googleapis.com")
                .build();
    }

    public String getCourseImage(String courseTitle, String courseDescription) {
        if (apiKey == null || apiKey.isBlank() || cx == null || cx.isBlank()) {
            return DEFAULT_IMAGE;
        }

        try {
            String response = restClient.get()
                    .uri(uriBuilder -> uriBuilder
                            .path("/customsearch/v1")
                            .queryParam("key", apiKey)
                            .queryParam("cx", cx)
                            .queryParam("q", courseTitle)
                            .queryParam("searchType", "image")
                            .queryParam("num", 1)
                            .queryParam("safe", "active")
                            .queryParam("imgSize", "medium")
                            .build())
                    .retrieve()
                    .body(String.class);

            JsonNode root = objectMapper.readTree(response);
            JsonNode items = root.path("items");
            if (items.isArray() && !items.isEmpty()) {
                String link = items.get(0).path("link").asText();
                if (link != null && !link.isBlank()) {
                    return link;
                }
            }
        } catch (Exception e) {
            log.error("Error fetching course image from Google Search: {}", e.getMessage());
        }

        return DEFAULT_IMAGE;
    }
}

