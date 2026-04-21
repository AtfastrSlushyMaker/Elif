package com.elif.services.community;

import com.elif.dto.community.request.CreatePostRequest;
import com.elif.dto.community.response.PostResponse;
import com.elif.entities.community.*;
import com.elif.entities.community.enums.MemberRole;
import com.elif.entities.community.enums.PostType;
import com.elif.entities.community.enums.SortMode;
import com.elif.entities.community.enums.TargetType;
import com.elif.exceptions.community.CommunityNotFoundException;
import com.elif.exceptions.community.ForbiddenActionException;
import com.elif.exceptions.community.PostNotFoundException;
import com.elif.repositories.community.CommunityRepository;
import com.elif.repositories.community.CommentRepository;
import com.elif.repositories.community.FlairRepository;
import com.elif.repositories.community.PostRepository;
import com.elif.repositories.community.VoteRepository;
import com.elif.repositories.user.UserRepository;
import jakarta.transaction.Transactional;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

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
    private final VoteRepository voteRepository;
    private final UserRepository userRepository;

    public List<PostResponse> getPosts(Long communityId, SortMode sortMode, Long flairId, PostType type,
            Long viewerId) {
        List<Post> posts;
        if (flairId != null) {
            posts = postRepository.findByCommunityIdAndFlairIdAndDeletedAtIsNull(communityId, flairId);
        } else if (type != null) {
            posts = postRepository.findByCommunityIdAndTypeAndDeletedAtIsNull(communityId, type);
        } else {
            posts = postRepository.findByCommunityIdAndDeletedAtIsNull(communityId);
        }

        SortMode mode = sortMode == null ? SortMode.HOT : sortMode;
        return toResponses(sortingService.sort(posts, mode), viewerId);
    }

    public PostResponse getPost(Long id, Long viewerId) {
        Post post = postRepository.findById(id)
                .orElseThrow(() -> new PostNotFoundException("Post not found"));
        post.setViewCount(post.getViewCount() + 1);
        postRepository.save(post);
        return toResponse(post, viewerId);
    }

    public List<PostResponse> getTrendingPosts(SortMode sortMode, Integer limit, Long viewerId) {
        SortMode mode = sortMode == null ? SortMode.HOT : sortMode;
        int safeLimit = limit == null ? 12 : Math.max(1, Math.min(50, limit));
        List<Post> sorted = sortingService.sort(postRepository.findByDeletedAtIsNull(), mode)
                .stream()
                .limit(safeLimit)
                .toList();

        return toResponses(sorted, viewerId);
    }

    public PostResponse createPost(Long communityId, Long requestUserId, Long actingUserId, CreatePostRequest req) {
        Long authorUserId = communityService.resolveActingUserId(requestUserId, actingUserId);

        if (!communityService.isAdminUser(requestUserId)) {
            MemberRole role = communityService.getUserRole(communityId, requestUserId);
            if (role == null) {
                throw new IllegalStateException("Membership required");
            }
        } else {
            communityService.ensureMembership(communityId, authorUserId, MemberRole.MEMBER);
        }

        Community community = communityRepository.findById(communityId)
                .orElseThrow(() -> new CommunityNotFoundException("Community not found"));

        Flair flair = resolveFlair(req.getFlairId());

        Post post = Post.builder()
                .community(community)
                .userId(authorUserId)
                .title(req.getTitle())
                .content(req.getContent())
                .imageUrl(normalizeOptional(req.getImageUrl()))
                .type(req.getType() == null ? PostType.DISCUSSION : req.getType())
                .flair(flair)
                .build();

        return toResponse(postRepository.save(post), requestUserId);
    }

    public PostResponse updatePost(Long postId, Long userId, CreatePostRequest req) {
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new PostNotFoundException("Post not found"));

        if (!post.getUserId().equals(userId)) {
            throw new ForbiddenActionException("Only the post author can edit this post");
        }

        post.setTitle(req.getTitle());
        post.setContent(req.getContent());
        post.setImageUrl(normalizeOptional(req.getImageUrl()));
        if (req.getType() != null) {
            post.setType(req.getType());
        }
        if (req.getFlairId() != null) {
            post.setFlair(resolveFlair(req.getFlairId()));
        }

        return toResponse(postRepository.save(post), userId);
    }

    public PostResponse setPinned(Long postId, Long userId, boolean pinned) {
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new PostNotFoundException("Post not found"));

        boolean isAuthor = post.getUserId().equals(userId);
        boolean isModerator = communityService.canModerate(post.getCommunity().getId(), userId);

        if (!isAuthor && !isModerator) {
            throw new ForbiddenActionException("Only the post author, creator, or moderator can pin this post");
        }

        post.setPinnedAt(pinned ? LocalDateTime.now() : null);
        return toResponse(postRepository.save(post), userId);
    }

    public void softDeletePost(Long postId, Long userId) {
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new PostNotFoundException("Post not found"));

        boolean isAuthor = post.getUserId().equals(userId);
        boolean isModerator = communityService.canModerate(post.getCommunity().getId(), userId);

        if (!isAuthor && !isModerator) {
            throw new ForbiddenActionException("Only the post author, creator, or moderator can delete this post");
        }

        post.setDeletedAt(LocalDateTime.now());
        postRepository.save(post);
    }

    public void hardDeletePost(Long postId, Long userId) {
        if (!communityService.isAdminUser(userId)) {
            throw new ForbiddenActionException("Only admins can hard delete posts");
        }

        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new PostNotFoundException("Post not found"));

        voteRepository.deleteByTargetTypeAndTargetId(TargetType.POST, postId);
        commentRepository.findByPostId(postId)
                .forEach(comment -> voteRepository.deleteByTargetTypeAndTargetId(TargetType.COMMENT, comment.getId()));
        commentRepository.deleteAllByPostId(postId);
        postRepository.delete(post);
    }

    public List<PostResponse> search(String query) {
        String keyword = query == null ? "" : query.trim();
        return toResponses(
                postRepository
                        .findByDeletedAtIsNullAndTitleContainingIgnoreCaseOrDeletedAtIsNullAndContentContainingIgnoreCase(
                                keyword,
                                keyword),
                null);
    }

    private List<PostResponse> toResponses(List<Post> posts, Long viewerId) {
        Map<Long, String> authorNames = resolveAuthorNames(posts);
        return posts.stream().map(post -> toResponse(post, viewerId, authorNames)).toList();
    }

    private Map<Long, String> resolveAuthorNames(List<Post> posts) {
        Set<Long> authorIds = posts.stream().map(Post::getUserId).collect(Collectors.toSet());
        if (authorIds.isEmpty()) {
            return Map.of();
        }

        return userRepository.findAllById(authorIds).stream()
                .collect(Collectors.toMap(com.elif.entities.user.User::getId,
                        user -> formatAuthorName(user.getFirstName(), user.getLastName())));
    }

    private PostResponse toResponse(Post post, Long viewerId) {
        return toResponse(post, viewerId, Map.of());
    }

    private PostResponse toResponse(Post post, Long viewerId, Map<Long, String> authorNames) {
        return PostResponse.builder()
                .id(post.getId())
                .communityId(post.getCommunity().getId())
                .communitySlug(post.getCommunity().getSlug())
                .userId(post.getUserId())
                .authorName(authorNames.getOrDefault(post.getUserId(), "Unknown"))
                .title(post.getTitle())
                .content(post.isDeleted() ? "[deleted]" : post.getContent())
                .imageUrl(post.isDeleted() ? null : post.getImageUrl())
                .type(post.getType())
                .flairId(post.getFlair() == null ? null : post.getFlair().getId())
                .flairName(post.getFlair() == null ? null : post.getFlair().getName())
                .voteScore(post.getVoteScore())
                .userVote(resolveUserVote(viewerId, post.getId(), TargetType.POST))
                .viewCount(post.getViewCount())
                .commentCount(commentRepository.countByPostIdAndDeletedAtIsNull(post.getId()))
                .pinned(post.isPinned())
                .createdAt(post.getCreatedAt())
                .updatedAt(post.getUpdatedAt())
                .build();
    }

    private Integer resolveUserVote(Long viewerId, Long targetId, TargetType targetType) {
        if (viewerId == null) {
            return null;
        }

        return voteRepository.findByUserIdAndTargetIdAndTargetType(viewerId, targetId, targetType)
                .map(Vote::getValue)
                .orElse(null);
    }

    private Flair resolveFlair(Long flairId) {
        if (flairId == null) {
            return null;
        }

        return flairRepository.findById(flairId)
                .orElseThrow(() -> new IllegalArgumentException("Flair not found"));
    }

    private String formatAuthorName(String firstName, String lastName) {
        String normalizedFirst = normalizeOptional(firstName);
        String normalizedLast = normalizeOptional(lastName);

        String joined = String.join(" ",
                normalizedFirst == null ? "" : normalizedFirst,
                normalizedLast == null ? "" : normalizedLast).trim();

        return joined.isEmpty() ? "Unknown" : joined;
    }

    private String normalizeOptional(String value) {
        if (value == null)
            return null;
        String trimmed = value.trim();
        return trimmed.isEmpty() ? null : trimmed;
    }
}
