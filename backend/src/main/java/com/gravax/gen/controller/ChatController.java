package com.gravax.gen.controller;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.gravax.gen.service.GeminiService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
@Slf4j
public class ChatController {

    private final GeminiService geminiService;
    private final ObjectMapper objectMapper;

    @PostMapping("/chat")
    public ResponseEntity<?> chat(@RequestBody Map<String, Object> body) {
        try {
            Object messagesObj = body.get("messages");
            List<Map<String, String>> messages = new ArrayList<>();

            if (messagesObj != null) {
                messages = objectMapper.convertValue(messagesObj, new TypeReference<List<Map<String, String>>>() {});
            }

            String pageContext = (String) body.getOrDefault("pageContext", "");
            String response = geminiService.chat(messages, pageContext);

            return ResponseEntity.ok(Map.of("message", response));
        } catch (Exception e) {
            log.error("Chat API error: {}", e.getMessage(), e);
            return ResponseEntity.ok(Map.of("message", "I apologize, but I encountered an error processing your request."));
        }
    }
}
