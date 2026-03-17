package com.elif.repositories.community;

import com.elif.entities.community.Message;
import jakarta.transaction.Transactional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;

public interface MessageRepository extends JpaRepository<Message, Long> {

    List<Message> findByConversationIdAndDeletedAtIsNullOrderByCreatedAtAsc(Long conversationId);

    long countByConversationIdAndSenderIdNotAndReadAtIsNull(Long conversationId, Long senderId);

    @Modifying
    @Transactional
    @Query("UPDATE Message m SET m.readAt = :now WHERE m.conversation.id = :convId AND m.senderId != :userId AND m.readAt IS NULL")
    void markAllAsRead(@Param("convId") Long convId, @Param("userId") Long userId, @Param("now") LocalDateTime now);
}
