package com.mihogar.repository;

import com.mihogar.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByCorreo(String correo);
    boolean existsByCorreo(String correo);
    boolean existsByDni(String dni);
}
