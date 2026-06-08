package com.mihogar.repository;

import com.mihogar.entity.Chat;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface ChatRepository extends JpaRepository<Chat, Long> {

    @Query("SELECT c FROM Chat c WHERE c.usuario1.id = :uid OR c.usuario2.id = :uid ORDER BY c.creadoEn DESC")
    List<Chat> findByUser(@Param("uid") Long userId);

    @Query("SELECT c FROM Chat c WHERE ((c.usuario1.id = :u1 AND c.usuario2.id = :u2) OR (c.usuario1.id = :u2 AND c.usuario2.id = :u1)) AND c.propiedad.id = :propId")
    Optional<Chat> findExistingChat(@Param("u1") Long u1, @Param("u2") Long u2, @Param("propId") Long propId);

    @Query("SELECT c FROM Chat c WHERE ((c.usuario1.id = :u1 AND c.usuario2.id = :u2) OR (c.usuario1.id = :u2 AND c.usuario2.id = :u1)) AND c.propiedad IS NULL")
    Optional<Chat> findDirectChat(@Param("u1") Long u1, @Param("u2") Long u2);
}
