package com.gravax.gen.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

@Service
@Slf4j
public class YouTubeService {

    private static final String DEFAULT_VIDEO = "https://www.youtube.com/watch?v=KfVpPpXwXqY";

    private final RestClient restClient;
    private final ObjectMapper objectMapper;
    private final String apiKey;

    public YouTubeService(
            @Value("${youtube.api.key:}") String apiKey,
            ObjectMapper objectMapper
    ) {
        this.apiKey = (apiKey == null || apiKey.isBlank()) ? System.getenv("YOUTUBE_API_KEY") : apiKey;
        this.objectMapper = objectMapper;
        this.restClient = RestClient.builder()
                .baseUrl("https://www.googleapis.com")
                .build();
    }

    public String getVideoLink(String query) {
        if (apiKey == null || apiKey.isBlank() || query == null || query.isBlank()) {
            return DEFAULT_VIDEO;
        }

        try {
            String response = restClient.get()
                    .uri(uriBuilder -> uriBuilder
                            .path("/youtube/v3/search")
                            .queryParam("key", apiKey)
                            .queryParam("q", query)
                            .queryParam("videoDuration", "medium")
                            .queryParam("videoEmbeddable", "true")
                            .queryParam("type", "video")
                            .queryParam("maxResults", 1)
                            .build())
                    .retrieve()
                    .body(String.class);

            JsonNode root = objectMapper.readTree(response);
            JsonNode items = root.path("items");
            if (items.isArray() && !items.isEmpty()) {
                String videoId = items.get(0).path("id").path("videoId").asText();
                if (videoId != null && !videoId.isBlank()) {
                    return "https://www.youtube.com/watch?v=" + videoId;
                }
            }
        } catch (Exception e) {
            log.error("Error searching YouTube for query '{}': {}", query, e.getMessage());
        }

        return DEFAULT_VIDEO;
    }
}
