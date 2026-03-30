package com.elif.repositories.community;

import com.elif.entities.community.Post;
import com.elif.entities.community.enums.PostType;
import jakarta.transaction.Transactional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface PostRepository extends JpaRepository<Post, Long> {

    List<Post> findByDeletedAtIsNull();

    List<Post> findByCommunityIdAndDeletedAtIsNull(Long communityId);

    List<Post> findByCommunityIdAndFlairIdAndDeletedAtIsNull(Long communityId, Long flairId);

    List<Post> findByCommunityIdAndTypeAndDeletedAtIsNull(Long communityId, PostType type);

    @Query(value = "SELECT * FROM community_post WHERE MATCH(title, content) AGAINST (:kw IN BOOLEAN MODE) AND deleted_at IS NULL", nativeQuery = true)
    List<Post> searchByKeyword(@Param("kw") String keyword);

    @Modifying
    @Transactional
    @Query("UPDATE Post p SET p.voteScore = p.voteScore + :delta WHERE p.id = :id")
    void incrementVoteScore(@Param("id") Long id, @Param("delta") int delta);

    @Modifying
    @Transactional
    @Query("UPDATE Post p SET p.viewCount = p.viewCount + 1 WHERE p.id = :id")
    void incrementViewCount(@Param("id") Long id);

    @Modifying
    @Transactional
    @Query("UPDATE Post p SET p.flair = null WHERE p.community.id = :communityId AND p.flair.id = :flairId")
    void clearFlairFromCommunityPosts(@Param("communityId") Long communityId, @Param("flairId") Long flairId);
}
