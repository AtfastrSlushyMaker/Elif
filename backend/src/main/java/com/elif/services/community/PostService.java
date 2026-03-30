package com.elif.services.community;

import com.elif.dto.community.request.CreatePostRequest;
import com.elif.dto.community.response.PostResponse;
import com.elif.entities.community.*;
import com.elif.entities.community.enums.MemberRole;
import com.elif.entities.community.enums.PostType;
import com.elif.entities.community.enums.SortMode;
import com.elif.exceptions.community.CommunityNotFoundException;
import com.elif.exceptions.community.PostNotFoundException;
import com.elif.repositories.community.CommunityRepository;
import com.elif.repositories.community.CommentRepository;
import com.elif.repositories.community.FlairRepository;
import com.elif.repositories.community.PostRepository;
import jakarta.transaction.Transactional;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
@AllArgsConstructor
@Transactional
public class PostService {

    private final PostRepository postRepository;
    private final CommunityRepository communityRepository;
    private final CommentRepository commentRepository;
    private final FlairRepository flairRepository;
    private final CommunityService communityService;
    private final SortingService sortingService;

    public List<PostResponse> getPosts(Long communityId, SortMode sortMode, Long flairId, PostType type) {
        List<Post> posts;
        if (flairId != null) {
            posts = postRepository.findByCommunityIdAndFlairIdAndDeletedAtIsNull(communityId, flairId);
        } else if (type != null) {
            posts = postRepository.findByCommunityIdAndTypeAndDeletedAtIsNull(communityId, type);
        } else {
            posts = postRepository.findByCommunityIdAndDeletedAtIsNull(communityId);
        }

        SortMode mode = sortMode == null ? SortMode.HOT : sortMode;
        return sortingService.sort(posts, mode).stream().map(this::toResponse).toList();
    }

    public PostResponse getPost(Long id) {
        Post post = postRepository.findById(id)
                .orElseThrow(() -> new PostNotFoundException("Post not found"));
        postRepository.incrementViewCount(id);
        return toResponse(post);
    }

    public List<PostResponse> getTrendingPosts(SortMode sortMode, Integer limit) {
        SortMode mode = sortMode == null ? SortMode.HOT : sortMode;
        int safeLimit = limit == null ? 12 : Math.max(1, Math.min(50, limit));

        return sortingService.sort(postRepository.findByDeletedAtIsNull(), mode)
                .stream()
                .limit(safeLimit)
                .map(this::toResponse)
                .toList();
    }

    public PostResponse createPost(Long communityId, Long userId, CreatePostRequest req) {
        MemberRole role = communityService.getUserRole(communityId, userId);
        if (role == null) {
            throw new IllegalStateException("Membership required");
        }

        Community community = communityRepository.findById(communityId)
                .orElseThrow(() -> new CommunityNotFoundException("Community not found"));

        Flair flair = null;
        if (req.getFlairId() != null) {
            flair = flairRepository.findById(req.getFlairId())
                    .orElseThrow(() -> new IllegalArgumentException("Flair not found"));
        }

        Post post = Post.builder()
                .community(community)
                .userId(userId)
                .title(req.getTitle())
                .content(req.getContent())
            .imageUrl(normalizeOptional(req.getImageUrl()))
                .type(req.getType() == null ? PostType.DISCUSSION : req.getType())
                .flair(flair)
                .build();

        return toResponse(postRepository.save(post));
    }

    public PostResponse updatePost(Long postId, Long userId, CreatePostRequest req) {
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new PostNotFoundException("Post not found"));

        if (!post.getUserId().equals(userId)) {
            throw new IllegalStateException("Only author can edit the post");
        }

        post.setTitle(req.getTitle());
        post.setContent(req.getContent());
        post.setImageUrl(normalizeOptional(req.getImageUrl()));
        if (req.getType() != null) {
            post.setType(req.getType());
        }
        if (req.getFlairId() != null) {
            Flair flair = flairRepository.findById(req.getFlairId())
                    .orElseThrow(() -> new IllegalArgumentException("Flair not found"));
            post.setFlair(flair);
        }

        return toResponse(postRepository.save(post));
    }

    public void softDeletePost(Long postId, Long userId) {
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new PostNotFoundException("Post not found"));

        boolean isAuthor = post.getUserId().equals(userId);
        boolean isModerator = false;
        try {
            communityService.requireModerator(post.getCommunity().getId(), userId);
            isModerator = true;
        } catch (RuntimeException ignored) {
        }

        if (!isAuthor && !isModerator) {
            throw new IllegalStateException("Not allowed to delete this post");
        }

        post.setDeletedAt(LocalDateTime.now());
        postRepository.save(post);
    }

    public List<PostResponse> search(String query) {
        return postRepository.searchByKeyword(query).stream().map(this::toResponse).toList();
    }

    private PostResponse toResponse(Post post) {
        return PostResponse.builder()
                .id(post.getId())
                .communityId(post.getCommunity().getId())
                .communitySlug(post.getCommunity().getSlug())
                .userId(post.getUserId())
                .title(post.getTitle())
                .content(post.isDeleted() ? "[deleted]" : post.getContent())
                .imageUrl(post.isDeleted() ? null : post.getImageUrl())
                .type(post.getType())
                .flairId(post.getFlair() == null ? null : post.getFlair().getId())
                .flairName(post.getFlair() == null ? null : post.getFlair().getName())
                .voteScore(post.getVoteScore())
                .viewCount(post.getViewCount())
                .commentCount(commentRepository.countByPostIdAndDeletedAtIsNull(post.getId()))
                .createdAt(post.getCreatedAt())
                .updatedAt(post.getUpdatedAt())
                .build();
    }

    private String normalizeOptional(String value) {
        if (value == null) return null;
        String trimmed = value.trim();
        return trimmed.isEmpty() ? null : trimmed;
    }
}
