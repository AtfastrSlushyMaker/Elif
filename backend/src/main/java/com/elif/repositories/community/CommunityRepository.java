package com.elif.repositories.community;

import com.elif.entities.community.Community;
import com.elif.entities.community.enums.CommunityType;
import jakarta.transaction.Transactional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface CommunityRepository extends JpaRepository<Community, Long> {

    Optional<Community> findBySlug(String slug);

    boolean existsBySlug(String slug);

    List<Community> findByTypeOrderByMemberCountDesc(CommunityType type);

    @Modifying
    @Transactional
    @Query("UPDATE Community c SET c.memberCount = c.memberCount + :delta WHERE c.id = :id")
    void updateMemberCount(@Param("id") Long id, @Param("delta") int delta);
}
