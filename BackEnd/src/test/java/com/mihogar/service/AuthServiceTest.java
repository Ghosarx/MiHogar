package com.mihogar.service;

import com.mihogar.dto.request.ForgotPasswordRequest;
import com.mihogar.dto.request.RegisterRequest;
import com.mihogar.dto.response.AuthResponse;
import com.mihogar.entity.User;
import com.mihogar.exception.ConflictException;
import com.mihogar.repository.PasswordResetTokenRepository;
import com.mihogar.repository.UserRepository;
import com.mihogar.util.JwtUtil;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock UserRepository userRepo;
    @Mock PasswordResetTokenRepository resetRepo;
    @Mock PasswordEncoder encoder;
    @Mock JwtUtil jwtUtil;
    @Mock AuthenticationManager authManager;
    @Mock EmailService emailService;

    @InjectMocks AuthService authService;

    @Test
    @DisplayName("register() — éxito crea usuario y devuelve tokens")
    void register_success() {
        RegisterRequest req = new RegisterRequest();
        req.setNombre("Ana Torres");
        req.setCorreo("ana@test.com");
        req.setContrasena("secret123");
        req.setTelefono("987654321");

        when(userRepo.existsByCorreo("ana@test.com")).thenReturn(false);
        when(encoder.encode("secret123")).thenReturn("hash");
        when(userRepo.save(any(User.class))).thenAnswer(inv -> inv.getArgument(0));
        when(jwtUtil.generateAccessToken(any(), any())).thenReturn("access");
        when(jwtUtil.generateRefreshToken(any())).thenReturn("refresh");

        AuthResponse resp = authService.register(req);
        assertThat(resp.getAccessToken()).isEqualTo("access");
        assertThat(resp.getNombre()).isEqualTo("Ana Torres");
        verify(userRepo).save(any(User.class));
    }

    @Test
    @DisplayName("register() — correo duplicado lanza ConflictException")
    void register_duplicateEmail() {
        RegisterRequest req = new RegisterRequest();
        req.setCorreo("dup@test.com");
        when(userRepo.existsByCorreo("dup@test.com")).thenReturn(true);
        assertThatThrownBy(() -> authService.register(req))
                .isInstanceOf(ConflictException.class);
    }

    @Test
    @DisplayName("requestPasswordReset() — correo inexistente no lanza excepción")
    void forgotPassword_unknownEmail_noException() {
        ForgotPasswordRequest req = new ForgotPasswordRequest();
        req.setCorreo("unknown@test.com");
        when(userRepo.findByCorreo("unknown@test.com")).thenReturn(Optional.empty());
        assertThatCode(() -> authService.requestPasswordReset(req)).doesNotThrowAnyException();
        verifyNoInteractions(resetRepo, emailService);
    }
}
