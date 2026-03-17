package com.elif.dto.community.response;

import com.elif.entities.community.enums.PostType;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class PostResponse {
    private Long id;
    private Long communityId;
    private String communitySlug;
    private Long userId;
    private String title;
    private String content;
    private String imageUrl;
    private PostType type;
    private Long flairId;
    private String flairName;
    private int voteScore;
    private int viewCount;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
