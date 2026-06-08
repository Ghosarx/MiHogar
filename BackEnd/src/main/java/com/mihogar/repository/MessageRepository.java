package com.mihogar.repository;

import com.mihogar.entity.Message;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface MessageRepository extends JpaRepository<Message, Long> {

    List<Message> findByChatIdOrderByEnviadoEnAsc(Long chatId);

    @Modifying
    @Query("UPDATE Message m SET m.leido = true WHERE m.chat.id = :chatId AND m.remitente.id <> :userId")
    void markAllAsRead(@Param("chatId") Long chatId, @Param("userId") Long userId);

    @Query("SELECT COUNT(m) FROM Message m WHERE m.chat.usuario1.id = :uid OR m.chat.usuario2.id = :uid AND m.leido = false AND m.remitente.id <> :uid")
    long countUnreadForUser(@Param("uid") Long userId);
}
