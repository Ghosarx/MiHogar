package com.mihogar.service;

import com.mihogar.dto.request.ForgotPasswordRequest;
import com.mihogar.dto.request.LoginRequest;
import com.mihogar.dto.request.RegisterRequest;
import com.mihogar.dto.request.ResetPasswordRequest;
import com.mihogar.dto.request.VerifyCodeRequest;
import com.mihogar.dto.response.AuthResponse;
import com.mihogar.entity.PasswordResetToken;
import com.mihogar.entity.User;
import com.mihogar.exception.BadRequestException;
import com.mihogar.exception.ConflictException;
import com.mihogar.repository.PasswordResetTokenRepository;
import com.mihogar.repository.UserRepository;
import com.mihogar.util.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.DisabledException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Random;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepo;
    private final PasswordResetTokenRepository resetRepo;
    private final PasswordEncoder encoder;
    private final JwtUtil jwtUtil;
    private final AuthenticationManager authManager;
    private final EmailService emailService;

    @Transactional
    public AuthResponse register(RegisterRequest req) {
        if (userRepo.existsByCorreo(req.getCorreo())) {
            throw new ConflictException("El correo ya está registrado.");
        }
        User user = User.builder()
                .nombre(req.getNombre())
                .correo(req.getCorreo())
                .passwordHash(encoder.encode(req.getContrasena()))
                .telefono(req.getTelefono())
                .build();
        userRepo.save(user);
        return buildTokenResponse(user);
    }

    public AuthResponse login(LoginRequest req) {
        try {
            authManager.authenticate(
                    new UsernamePasswordAuthenticationToken(req.getCorreo(), req.getContrasena()));
        } catch (BadCredentialsException | DisabledException e) {
            throw new BadRequestException("Credenciales inválidas.");
        }
        User user = userRepo.findByCorreo(req.getCorreo()).orElseThrow();
        return buildTokenResponse(user);
    }

    @Transactional
    public void requestPasswordReset(ForgotPasswordRequest req) {
        userRepo.findByCorreo(req.getCorreo()).ifPresent(user -> {
            String codigo = String.format("%06d", new Random().nextInt(999999));
            PasswordResetToken token = PasswordResetToken.builder()
                    .user(user)
                    .codigo(codigo)
                    .expiresAt(LocalDateTime.now().plusMinutes(15))
                    .build();
            resetRepo.save(token);
            emailService.sendPasswordResetCode(user.getCorreo(), user.getNombre(), codigo);
        });
    }

    public String verifyCode(VerifyCodeRequest req) {
        User user = userRepo.findByCorreo(req.getCorreo())
                .orElseThrow(() -> new BadRequestException("Código inválido o expirado."));
        PasswordResetToken token = resetRepo
                .findTopByUserAndUsedFalseOrderByExpiresAtDesc(user)
                .orElseThrow(() -> new BadRequestException("Código inválido o expirado."));

        if (!token.getCodigo().equals(req.getCodigo())
                || token.getExpiresAt().isBefore(LocalDateTime.now())) {
            throw new BadRequestException("Código inválido o expirado.");
        }
        return jwtUtil.generatePasswordResetToken(req.getCorreo());
    }

    @Transactional
    public void resetPassword(ResetPasswordRequest req) {
        if (!req.getNuevaContrasena().equals(req.getConfirmar())) {
            throw new BadRequestException("Las contraseñas no coinciden.");
        }
        if (!jwtUtil.isValid(req.getResetToken())) {
            throw new BadRequestException("Token inválido o expirado.");
        }
        String correo = jwtUtil.getSubject(req.getResetToken());
        User user = userRepo.findByCorreo(correo)
                .orElseThrow(() -> new BadRequestException("Usuario no encontrado."));

        resetRepo.findTopByUserAndUsedFalseOrderByExpiresAtDesc(user).ifPresent(t -> {
            t.setUsed(true);
            resetRepo.save(t);
        });

        user.setPasswordHash(encoder.encode(req.getNuevaContrasena()));
        userRepo.save(user);
    }

    private AuthResponse buildTokenResponse(User user) {
        return AuthResponse.builder()
                .accessToken(jwtUtil.generateAccessToken(user.getCorreo(), user.getRol().name()))
                .refreshToken(jwtUtil.generateRefreshToken(user.getCorreo()))
                .correo(user.getCorreo())
                .nombre(user.getNombre())
                .rol(user.getRol().name())
                .build();
    }
}
