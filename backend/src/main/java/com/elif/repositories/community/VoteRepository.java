package com.elif.repositories.community;

import com.elif.entities.community.Vote;
import com.elif.entities.community.enums.TargetType;
import jakarta.transaction.Transactional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface VoteRepository extends JpaRepository<Vote, Long> {

    Optional<Vote> findByUserIdAndTargetIdAndTargetType(Long userId, Long targetId, TargetType targetType);

    boolean existsByUserIdAndTargetIdAndTargetType(Long userId, Long targetId, TargetType targetType);

    @Modifying
    @Transactional
    @Query("DELETE FROM Vote v WHERE v.targetType = :targetType AND v.targetId = :targetId")
    void deleteByTarget(@Param("targetType") TargetType targetType, @Param("targetId") Long targetId);
}
