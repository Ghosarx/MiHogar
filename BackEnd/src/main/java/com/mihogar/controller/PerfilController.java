package com.mihogar.controller;

import com.mihogar.dto.request.UpdateUserRequest;
import com.mihogar.dto.response.UserSummaryDTO;
import com.mihogar.entity.User;
import com.mihogar.exception.BadRequestException;
import com.mihogar.exception.ConflictException;
import com.mihogar.exception.NotFoundException;
import com.mihogar.repository.PropertyRepository;
import com.mihogar.repository.UserRepository;
import com.mihogar.service.CloudinaryService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/perfil")
@PreAuthorize("isAuthenticated()")
@RequiredArgsConstructor
public class PerfilController {

    private final UserRepository userRepo;
    private final PropertyRepository propertyRepo;
    private final PasswordEncoder encoder;
    private final CloudinaryService cloudinaryService;

    @GetMapping
    public ResponseEntity<UserSummaryDTO> getPerfil(@AuthenticationPrincipal String correo) {
        User u = findUser(correo);
        return ResponseEntity.ok(toDTO(u));
    }

    @PutMapping
    public ResponseEntity<UserSummaryDTO> updatePerfil(
            @AuthenticationPrincipal String correo,
            @Valid @RequestBody UpdateUserRequest req) {

        User u = findUser(correo);

        if (!u.getCorreo().equals(req.getCorreo()) && userRepo.existsByCorreo(req.getCorreo())) {
            throw new ConflictException("El correo ya está en uso.");
        }

        u.setNombre(req.getNombre());
        if (req.getApellido() != null) u.setApellido(req.getApellido());
        if (req.getDni() != null && !req.getDni().isBlank()) u.setDni(req.getDni());
        u.setCorreo(req.getCorreo());
        if (req.getTelefono() != null && !req.getTelefono().isBlank()) u.setTelefono(req.getTelefono());
        if (req.getNuevaContrasena() != null && !req.getNuevaContrasena().isBlank()) {
            if (req.getNuevaContrasena().length() < 8) {
                throw new BadRequestException("La contraseña debe tener mínimo 8 caracteres.");
            }
            u.setPasswordHash(encoder.encode(req.getNuevaContrasena()));
        }

        return ResponseEntity.ok(toDTO(userRepo.save(u)));
    }

    @PostMapping(value = "/foto", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<UserSummaryDTO> uploadFoto(
            @AuthenticationPrincipal String correo,
            @RequestParam("file") MultipartFile file) {

        if (file.isEmpty()) throw new BadRequestException("El archivo está vacío.");
        String contentType = file.getContentType();
        if (contentType == null || !contentType.startsWith("image/")) {
            throw new BadRequestException("Solo se permiten imágenes.");
        }

        User u = findUser(correo);
        String url = cloudinaryService.uploadFotoPerfil(file);
        u.setFotoPerfil(url);
        return ResponseEntity.ok(toDTO(userRepo.save(u)));
    }

    private User findUser(String correo) {
        return userRepo.findByCorreo(correo)
                .orElseThrow(() -> new NotFoundException("Usuario no encontrado."));
    }

    private UserSummaryDTO toDTO(User u) {
        long props = propertyRepo.countByOwnerIdAndDeletedAtIsNull(u.getId());
        return UserSummaryDTO.builder()
                .id(u.getId()).nombre(u.getNombre()).apellido(u.getApellido())
                .dni(u.getDni()).correo(u.getCorreo()).telefono(u.getTelefono())
                .rol(u.getRol().name()).activo(u.getActivo())
                .createdAt(u.getCreatedAt()).totalPropiedades(props).build();
    }
}
