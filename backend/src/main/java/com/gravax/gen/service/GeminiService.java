package com.gravax.gen.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

import java.util.*;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Service
@Slf4j
public class GeminiService {

    private final RestClient restClient;
    private final ObjectMapper objectMapper;
    private final String apiKey;

    public GeminiService(
            @Value("${gemini.api.key:}") String apiKey,
            ObjectMapper objectMapper
    ) {
        this.apiKey = (apiKey == null || apiKey.isBlank()) ? System.getenv("GEMINI_API_KEY") : apiKey;
        this.objectMapper = objectMapper;
        this.restClient = RestClient.builder()
                .baseUrl("https://generativelanguage.googleapis.com/v1beta")
                .build();
    }

    public String generateText(String prompt, String systemInstruction) {
        if (apiKey == null || apiKey.isBlank()) {
            log.warn("Gemini API key is not configured");
            return "";
        }

        try {
            Map<String, Object> body = new HashMap<>();

            // System instruction
            if (systemInstruction != null && !systemInstruction.isBlank()) {
                body.put("systemInstruction", Map.of(
                        "parts", List.of(Map.of("text", systemInstruction))
                ));
            }

            // User contents
            body.put("contents", List.of(
                    Map.of("role", "user", "parts", List.of(Map.of("text", prompt)))
            ));

            // Generation config
            body.put("generationConfig", Map.of(
                    "temperature", 0.7
            ));

            String response = restClient.post()
                    .uri(uriBuilder -> uriBuilder
                            .path("/models/gemini-2.5-flash:generateContent")
                            .queryParam("key", apiKey)
                            .build())
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(body)
                    .retrieve()
                    .body(String.class);

            JsonNode root = objectMapper.readTree(response);
            JsonNode candidates = root.path("candidates");
            if (candidates.isArray() && !candidates.isEmpty()) {
                JsonNode parts = candidates.get(0).path("content").path("parts");
                if (parts.isArray() && !parts.isEmpty()) {
                    return parts.get(0).path("text").asText("");
                }
            }
        } catch (Exception e) {
            log.error("Error invoking Gemini API: {}", e.getMessage(), e);
        }
        return "";
    }

    public JsonNode generateJson(String prompt, String systemInstruction) {
        String text = generateText(prompt, systemInstruction != null ? systemInstruction : "Generate structured JSON only.");
        try {
            Pattern pattern = Pattern.compile("\\{[\\s\\S]*\\}");
            Matcher matcher = pattern.matcher(text);
            if (matcher.find()) {
                return objectMapper.readTree(matcher.group(0));
            }
            return objectMapper.readTree(text);
        } catch (Exception e) {
            log.error("Failed to parse JSON from Gemini response: {}", text, e);
            return null;
        }
    }

    public JsonNode generateCourseOutline(String topic, String difficulty, int durationWeeks) {
        String formattedDuration = durationWeeks + " " + (durationWeeks == 1 ? "week" : "weeks");
        String prompt = """
            You are an AI capable of curating course content.
            Topic: %s
            Difficulty: %s
            Duration: %s

            Return ONLY valid JSON:
            {
              "title": "Course Title",
              "description": "Course Description",
              "modules": [
                { "week": 1, "title": "Module Title", "objectives": ["Objective 1","Objective 2"], "timeSpent": "2 hours" }
              ]
            }
            Total modules must equal %d.
            """.formatted(topic, difficulty, formattedDuration, durationWeeks);

        JsonNode json = generateJson(prompt, "Generate structured JSON only.");
        if (json != null && json.has("title") && json.has("modules")) {
            return json;
        }

        // Fallback outline
        Map<String, Object> fallback = new HashMap<>();
        fallback.put("title", topic + " Mastery");
        fallback.put("description", "A comprehensive guide to learning " + topic);
        List<Map<String, Object>> modules = new ArrayList<>();
        for (int i = 1; i <= durationWeeks; i++) {
            modules.add(Map.of(
                    "week", i,
                    "title", "Module " + i + ": " + topic + " Fundamentals Part " + i,
                    "objectives", List.of("Master core principles", "Practical implementation"),
                    "timeSpent", "2 hours"
            ));
        }
        fallback.put("modules", modules);
        return objectMapper.valueToTree(fallback);
    }

    public JsonNode generateDetailedCourse(String courseTitle, String courseDescription, JsonNode modulesNode) {
        StringBuilder modulesText = new StringBuilder();
        if (modulesNode != null && modulesNode.isArray()) {
            for (JsonNode m : modulesNode) {
                int week = m.path("week").asInt(1);
                String title = m.path("title").asText("Unit");
                String obj = m.path("objectives").toString();
                String time = m.path("timeSpent").asText("2 hours");
                modulesText.append("Week ").append(week).append(": ").append(title)
                        .append(" Objectives: ").append(obj).append(" Time: ").append(time).append("\n");
            }
        }

        String prompt = """
            Return ONLY JSON.
            Course Title: %s
            Description: %s
            Modules:
            %s

            JSON structure:
            {
              "units":[
                {
                  "unitNumber":1,
                  "title":"Unit Title",
                  "description":"Unit description",
                  "chapters":[
                    {
                      "chapterNumber":1,
                      "title":"Chapter Title",
                      "description":"Chapter description",
                      "estimatedTime":"30 minutes",
                      "learningPoints":["Point 1","Point 2","Point 3"],
                      "resources":["Resource 1","Resource 2"],
                      "youtubeSearchQuery":"query"
                    }
                  ]
                }
              ]
            }
            """.formatted(courseTitle, courseDescription, modulesText.toString());

        JsonNode json = generateJson(prompt, "Return valid JSON only.");
        if (json != null && json.has("units") && json.path("units").isArray()) {
            return json;
        }

        // Fallback units
        Map<String, Object> fallback = new HashMap<>();
        List<Map<String, Object>> units = new ArrayList<>();
        if (modulesNode != null && modulesNode.isArray()) {
            int idx = 1;
            for (JsonNode m : modulesNode) {
                String title = m.path("title").asText("Unit " + idx);
                units.add(Map.of(
                        "unitNumber", idx,
                        "title", title,
                        "description", "Unit " + idx + ": " + title,
                        "chapters", List.of(Map.of(
                                "chapterNumber", 1,
                                "title", "Introduction to " + title,
                                "description", "Introduction to " + title,
                                "estimatedTime", "30 minutes",
                                "learningPoints", List.of("Learning point 1", "Learning point 2"),
                                "resources", List.of("Resource 1", "Resource 2"),
                                "youtubeSearchQuery", title + " tutorial"
                        ))
                ));
                idx++;
            }
        }
        fallback.put("units", units);
        return objectMapper.valueToTree(fallback);
    }

    public String generateReadingMaterial(String title, String description, List<String> learningPoints) {
        String prompt = """
            Create concise markdown reading material.
            Title: %s
            Description: %s
            Learning Points: %s

            Format:
            # %s
            ## Overview
            ## Key Points
            ## Summary
            """.formatted(title, description, String.join(", ", learningPoints != null ? learningPoints : List.of()), title);

        String text = generateText(prompt, "Return markdown only.");
        if (text != null && !text.isBlank()) {
            return text;
        }
        return "# " + title + "\n\n## Overview\n" + description + "\n\n## Summary\nComprehensive coverage of " + title + ".";
    }

    public JsonNode generateUnitTest(String unitTitle, List<String> chapterNames) {
        return generateFlashcards(unitTitle, "", chapterNames);
    }

    public JsonNode generateFlashcards(String unitTitle, String unitDescription, List<String> chapterNames) {
        String prompt = """
            You are an expert educator. Create 5-7 flashcard MCQs for unit "%s".
            Chapters:
            %s

            Return ONLY JSON:
            {
              "questions":[
                {
                  "id":1,
                  "question":"Question?",
                  "options":{"A":"...","B":"...","C":"...","D":"..."},
                  "correctAnswer":"A",
                  "explanation":"..."
                }
              ]
            }
            """.formatted(unitTitle, String.join("\n", chapterNames != null ? chapterNames : List.of()));

        JsonNode json = generateJson(prompt, "Return valid JSON only.");
        if (json != null && json.has("questions") && json.path("questions").isArray()) {
            return json.path("questions");
        }

        // Fallback questions
        List<Map<String, Object>> fallback = List.of(
                Map.of(
                        "id", 1,
                        "question", "What is the main topic covered in " + unitTitle + "?",
                        "options", Map.of("A", "Basic concepts", "B", "Advanced techniques", "C", "Historical background", "D", "All of the above"),
                        "correctAnswer", "D",
                        "explanation", "This unit covers multiple aspects of the topic."
                ),
                Map.of(
                        "id", 2,
                        "question", "Which of the following is most important in " + unitTitle + "?",
                        "options", Map.of("A", "Memorization", "B", "Understanding concepts", "C", "Speed of completion", "D", "Following instructions"),
                        "correctAnswer", "B",
                        "explanation", "Understanding the underlying concepts is most important for learning."
                )
        );
        return objectMapper.valueToTree(fallback);
    }

    public JsonNode generateAssessmentQuestions(String courseTitle, List<Map<String, Object>> units) {
        StringBuilder sb = new StringBuilder();
        if (units != null) {
            int i = 1;
            for (Map<String, Object> u : units) {
                sb.append("Unit ").append(i++).append(": ").append(u.get("name")).append("\n");
            }
        }

        String prompt = """
            Create JSON with exactly 5 MCQ questions for course "%s".
            Units:
            %s

            Format:
            {
              "questions":[
                {
                  "questionText":"...",
                  "options":["A","B","C","D"],
                  "correctAnswer":0,
                  "explanation":"..."
                }
              ]
            }
            """.formatted(courseTitle, sb.toString());

        JsonNode json = generateJson(prompt, "Return ONLY valid JSON.");
        if (json != null && json.has("questions") && json.path("questions").isArray()) {
            return json.path("questions");
        }

        // Fallback questions
        List<Map<String, Object>> fallback = new ArrayList<>();
        fallback.add(Map.of(
                "questionText", "What is the primary subject of the \"" + courseTitle + "\" course?",
                "options", List.of("Learning and understanding " + courseTitle, "Basic computer literacy", "Hardware troubleshooting", "Network administration"),
                "correctAnswer", 0,
                "explanation", "This course is designed to teach " + courseTitle + " concepts and applications."
        ));
        for (int i = 1; i < 5; i++) {
            fallback.add(Map.of(
                    "questionText", "Which core concept is central to " + courseTitle + " Part " + i + "?",
                    "options", List.of("Practical foundational knowledge", "Random guesswork", "Irrelevant mechanics", "Deprecated ideas"),
                    "correctAnswer", 0,
                    "explanation", "Covers key foundational concepts."
            ));
        }
        return objectMapper.valueToTree(fallback);
    }

    public JsonNode generateQuizQuestions(String courseTitle, List<Map<String, Object>> units) {
        return generateAssessmentQuestions(courseTitle, units);
    }

    public String chat(List<Map<String, String>> messages, String pageContext) {
        String systemInstruction = "You are a helpful AI assistant for Grivax, an educational platform.\n" +
                (pageContext != null && !pageContext.isBlank() ? "Current page context:\n" + pageContext + "\n\n" : "") +
                "Guidelines:\n" +
                "1. Provide concise, accurate, and helpful responses\n" +
                "2. If you're unsure about something, say so\n" +
                "3. Use a friendly and professional tone\n" +
                "4. When relevant, reference the current page context\n" +
                "5. Do not explicitly say 'based on the page context'\n";

        StringBuilder conversation = new StringBuilder();
        if (messages != null) {
            for (Map<String, String> m : messages) {
                String role = m.getOrDefault("role", "user");
                if (!"system".equalsIgnoreCase(role)) {
                    conversation.append(role.toUpperCase()).append(": ").append(m.getOrDefault("content", "")).append("\n\n");
                }
            }
        }

        String prompt = conversation.toString().isBlank() ? "Hello" : conversation.toString();
        String response = generateText(prompt, systemInstruction);
        return (response != null && !response.isBlank()) ? response : "I apologize, but I could not generate a response.";
    }
}
