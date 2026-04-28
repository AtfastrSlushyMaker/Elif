package com.elif.services.events.interfaces;

import com.elif.dto.events.request.SmartMatchRequest;
import com.elif.dto.events.response.AiStreamChunkDto;
import reactor.core.publisher.Flux;

public interface IAiSmartMatchService {
    Flux<AiStreamChunkDto> streamSmartMatch(SmartMatchRequest request);
}