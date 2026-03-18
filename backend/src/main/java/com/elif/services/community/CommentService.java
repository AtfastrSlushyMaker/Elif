package com.elif.services.community;

import com.elif.dto.community.request.CreateCommentRequest;
import com.elif.dto.community.response.CommentResponse;
import com.elif.entities.community.Comment;
import com.elif.entities.community.Post;
import com.elif.entities.community.enums.PostType;
import com.elif.exceptions.community.PostNotFoundException;
import com.elif.repositories.community.CommentRepository;
import com.elif.repositories.community.PostRepository;
import com.elif.repositories.user.UserRepository;
import jakarta.transaction.Transactional;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.*;

@Service
@AllArgsConstructor
@Transactional
public class CommentService {

    private final CommentRepository commentRepository;
    private final PostRepository postRepository;
    private final CommunityService communityService;
    private final UserRepository userRepository;

    public List<CommentResponse> getCommentTree(Long postId) {
        List<Comment> flat = commentRepository.findCommentTreeByPostId(postId);
        return buildTree(flat);
    }

    public CommentResponse createComment(Long postId, Long userId, CreateCommentRequest req) {
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new PostNotFoundException("Post not found"));

        Comment parent = null;
        if (req.getParentCommentId() != null) {
            parent = commentRepository.findById(req.getParentCommentId())
                    .orElseThrow(() -> new IllegalArgumentException("Parent comment not found"));
        }

        Comment saved = commentRepository.save(Comment.builder()
                .post(post)
                .parent(parent)
                .userId(userId)
            .content(normalizeContent(req.getContent()))
            .imageUrl(normalizeOptional(req.getImageUrl()))
                .build());

        return toResponse(saved);
    }

    public CommentResponse updateComment(Long commentId, Long userId, CreateCommentRequest req) {
        Comment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new IllegalArgumentException("Comment not found"));

        if (!comment.getUserId().equals(userId)) {
            throw new IllegalStateException("Only author can edit comment");
        }

        comment.setContent(normalizeContent(req.getContent()));
        comment.setImageUrl(normalizeOptional(req.getImageUrl()));
        return toResponse(commentRepository.save(comment));
    }

    public void softDeleteComment(Long commentId, Long userId) {
        Comment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new IllegalArgumentException("Comment not found"));

        boolean isAuthor = comment.getUserId().equals(userId);
        boolean isModerator = false;
        try {
            communityService.requireModerator(comment.getPost().getCommunity().getId(), userId);
            isModerator = true;
        } catch (RuntimeException ignored) {
        }

        if (!isAuthor && !isModerator) {
            throw new IllegalStateException("Not allowed to delete this comment");
        }

        comment.setDeletedAt(LocalDateTime.now());
        commentRepository.save(comment);
    }

    public void acceptAnswer(Long commentId, Long userId) {
        Comment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new IllegalArgumentException("Comment not found"));

        Post post = comment.getPost();
        if (!post.getUserId().equals(userId)) {
            throw new IllegalStateException("Only post owner can accept answer");
        }
        if (post.getType() != PostType.QUESTION) {
            throw new IllegalStateException("Accepted answer is only for QUESTION posts");
        }

        comment.setAcceptedAnswer(true);
        commentRepository.save(comment);
    }

    private List<CommentResponse> buildTree(List<Comment> comments) {
        Map<Long, CommentResponse> byId = new LinkedHashMap<>();
        List<CommentResponse> roots = new ArrayList<>();

        for (Comment c : comments) {
            byId.put(c.getId(), toResponse(c));
        }

        for (Comment c : comments) {
            CommentResponse current = byId.get(c.getId());
            if (c.getParent() == null) {
                roots.add(current);
            } else {
                CommentResponse parent = byId.get(c.getParent().getId());
                if (parent != null) {
                    parent.getReplies().add(current);
                }
            }
        }

        return roots;
    }

    private CommentResponse toResponse(Comment comment) {
        return CommentResponse.builder()
                .id(comment.getId())
                .postId(comment.getPost().getId())
                .parentCommentId(comment.getParent() == null ? null : comment.getParent().getId())
                .userId(comment.getUserId())
                .authorName(userRepository.findById(comment.getUserId())
                    .map(u -> u.getFirstName() + " " + u.getLastName())
                    .orElse("Unknown"))
                .content(comment.isDeleted() ? "[deleted]" : comment.getContent())
                .imageUrl(comment.isDeleted() ? null : comment.getImageUrl())
                .voteScore(comment.getVoteScore())
                .acceptedAnswer(comment.isAcceptedAnswer())
                .createdAt(comment.getCreatedAt())
                .build();
    }

    private String normalizeOptional(String value) {
        if (value == null) return null;
        String trimmed = value.trim();
        return trimmed.isEmpty() ? null : trimmed;
    }

    private String normalizeContent(String value) {
        if (value == null) return "";
        return value.trim();
    }
}
