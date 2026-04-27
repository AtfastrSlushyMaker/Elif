package com.elif.controllers.events;

import com.elif.dto.events.request.SmartMatchRequest;
import com.elif.dto.events.response.AiStreamChunkDto;
import com.elif.services.events.interfaces.IAiSmartMatchService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;
import reactor.core.publisher.Flux;

@RestController
@RequestMapping("/api/events/ai/smart-match")
@CrossOrigin(origins = "http://localhost:4200", allowCredentials = "true")
@RequiredArgsConstructor
@Slf4j
public class AiSmartMatchController {

    private final IAiSmartMatchService smartMatchService;

    @PostMapping(value = "/stream", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public Flux<AiStreamChunkDto> streamSmartMatch(@Valid @RequestBody SmartMatchRequest request) {
        log.info("🎯 Smart match request: {}", request.getQuery());
        return smartMatchService.streamSmartMatch(request);
    }
    @GetMapping(value = "/test-stream", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public Flux<AiStreamChunkDto> testStream() {
        return Flux.just(
                new AiStreamChunkDto("token", "Test message 1\n"),
                new AiStreamChunkDto("token", "Test message 2\n"),
                new AiStreamChunkDto("done", "")
        );
    }
}