package com.mihogar.repository;

import com.mihogar.entity.PasswordResetToken;
import com.mihogar.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface PasswordResetTokenRepository extends JpaRepository<PasswordResetToken, Long> {
    Optional<PasswordResetToken> findTopByUserAndUsedFalseOrderByExpiresAtDesc(User user);
}
