package com.elif.repositories.community;

import com.elif.entities.community.Conversation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface ConversationRepository extends JpaRepository<Conversation, Long> {

    @Query("""
            SELECT c FROM Conversation c
            WHERE (c.participantOneId = :u1 AND c.participantTwoId = :u2)
               OR (c.participantOneId = :u2 AND c.participantTwoId = :u1)
            """)
    Optional<Conversation> findByParticipants(@Param("u1") Long u1, @Param("u2") Long u2);

    @Query("""
            SELECT c FROM Conversation c
            WHERE c.participantOneId = :userId OR c.participantTwoId = :userId
            ORDER BY c.lastMessageAt DESC NULLS LAST
            """)
    List<Conversation> findInbox(@Param("userId") Long userId);
}
