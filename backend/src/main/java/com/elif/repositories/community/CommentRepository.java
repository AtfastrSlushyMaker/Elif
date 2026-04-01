package com.elif.repositories.community;

import com.elif.entities.community.Comment;
import jakarta.transaction.Transactional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface CommentRepository extends JpaRepository<Comment, Long> {

    int countByPostIdAndDeletedAtIsNull(Long postId);

    List<Comment> findByPostIdAndParentCommentIsNullAndDeletedAtIsNull(Long postId);

    List<Comment> findByParentCommentIdAndDeletedAtIsNull(Long parentCommentId);

    List<Comment> findByPostId(Long postId);

    @Query(value = """
            WITH RECURSIVE comment_tree AS (
                SELECT *, 0 AS depth FROM community_comment
                WHERE post_id = :postId AND parent_comment_id IS NULL AND deleted_at IS NULL
                UNION ALL
                SELECT c.*, ct.depth + 1 FROM community_comment c
                INNER JOIN comment_tree ct ON c.parent_comment_id = ct.id
                WHERE c.deleted_at IS NULL
            )
            SELECT * FROM comment_tree ORDER BY created_at
            """, nativeQuery = true)
    List<Comment> findCommentTreeByPostId(@Param("postId") Long postId);

    @Modifying
    @Transactional
    @Query("UPDATE Comment c SET c.voteScore = c.voteScore + :delta WHERE c.id = :id")
    void incrementVoteScore(@Param("id") Long id, @Param("delta") int delta);

    @Modifying
    @Transactional
    @Query("UPDATE Comment c SET c.acceptedAnswer = false WHERE c.post.id = :postId")
    void clearAcceptedAnswerByPostId(@Param("postId") Long postId);

    @Modifying
    @Transactional
    @Query("DELETE FROM Comment c WHERE c.post.id = :postId")
    void deleteByPostId(@Param("postId") Long postId);
}
