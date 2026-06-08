package com.mihogar.service;

import com.mihogar.dto.request.UpdateUserRequest;
import com.mihogar.dto.response.AdminMetricsDTO;
import com.mihogar.dto.response.UserSummaryDTO;
import com.mihogar.entity.Property;
import com.mihogar.entity.User;
import com.mihogar.exception.BadRequestException;
import com.mihogar.exception.ConflictException;
import com.mihogar.exception.NotFoundException;
import com.mihogar.repository.ContactClickRepository;
import com.mihogar.repository.PropertyRepository;
import com.mihogar.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AdminService {

    private final UserRepository userRepo;
    private final PropertyRepository propertyRepo;
    private final ContactClickRepository clickRepo;
    private final PasswordEncoder encoder;

    // ── Métricas generales ────────────────────────────────────────────────────
    public AdminMetricsDTO getMetrics() {
        return AdminMetricsDTO.builder()
                .totalUsuarios(userRepo.count())
                .totalPropiedades(propertyRepo.count())
                .propiedadesVenta(propertyRepo.countByTipoAndDeletedAtIsNull(Property.TipoPropiedad.venta))
                .propiedadesAlquiler(propertyRepo.countByTipoAndDeletedAtIsNull(Property.TipoPropiedad.alquiler))
                .propiedadesPendientes(propertyRepo.countByStatusAndDeletedAtIsNull(Property.StatusPropiedad.PENDIENTE))
                .propiedadesActivas(propertyRepo.countByStatusAndDeletedAtIsNull(Property.StatusPropiedad.ACTIVO))
                .propiedadesRechazadas(propertyRepo.countByStatusAndDeletedAtIsNull(Property.StatusPropiedad.RECHAZADO))
                .propiedadesVendidas(propertyRepo.countByStatusAndDeletedAtIsNull(Property.StatusPropiedad.VENDIDO))
                .totalContactClicks(clickRepo.countAll())
                .build();
    }

    // ── Listar usuarios ───────────────────────────────────────────────────────
    public Page<UserSummaryDTO> listUsers(Pageable pageable) {
        return userRepo.findAll(pageable).map(this::toUserSummary);
    }

    // ── Obtener usuario por ID ────────────────────────────────────────────────
    public UserSummaryDTO getUserById(Long id) {
        return toUserSummary(userRepo.findById(id)
                .orElseThrow(() -> new NotFoundException("Usuario no encontrado.")));
    }

    // ── Actualizar usuario (correo, nombre, teléfono, contraseña) ─────────────
    @Transactional
    public UserSummaryDTO updateUser(Long id, UpdateUserRequest req) {
        User user = userRepo.findById(id)
                .orElseThrow(() -> new NotFoundException("Usuario no encontrado."));

        // Verificar que el nuevo correo no esté en uso por otro usuario
        if (!user.getCorreo().equals(req.getCorreo()) && userRepo.existsByCorreo(req.getCorreo())) {
            throw new ConflictException("El correo ya está en uso por otro usuario.");
        }

        user.setNombre(req.getNombre());
        if (req.getApellido() != null) user.setApellido(req.getApellido());
        if (req.getDni() != null && !req.getDni().isBlank()) user.setDni(req.getDni());
        user.setCorreo(req.getCorreo());
        if (req.getTelefono() != null && !req.getTelefono().isBlank()) {
            user.setTelefono(req.getTelefono());
        }
        if (req.getNuevaContrasena() != null && !req.getNuevaContrasena().isBlank()) {
            if (req.getNuevaContrasena().length() < 8) {
                throw new BadRequestException("La contraseña debe tener mínimo 8 caracteres.");
            }
            user.setPasswordHash(encoder.encode(req.getNuevaContrasena()));
        }

        return toUserSummary(userRepo.save(user));
    }

    // ── Activar / desactivar usuario ──────────────────────────────────────────
    @Transactional
    public UserSummaryDTO toggleUserActive(Long id) {
        User user = userRepo.findById(id)
                .orElseThrow(() -> new NotFoundException("Usuario no encontrado."));
        user.setActivo(!user.getActivo());
        return toUserSummary(userRepo.save(user));
    }

    // ── Aprobar / rechazar propiedad ──────────────────────────────────────────
    @Transactional
    public void updatePropertyStatus(Long propertyId, String status) {
        Property p = propertyRepo.findById(propertyId)
                .orElseThrow(() -> new NotFoundException("Propiedad no encontrada."));
        p.setStatus(Property.StatusPropiedad.valueOf(status));
        propertyRepo.save(p);
    }

    // ── Helper ────────────────────────────────────────────────────────────────
    private UserSummaryDTO toUserSummary(User u) {
        long props = propertyRepo.countByOwnerIdAndDeletedAtIsNull(u.getId());
        return UserSummaryDTO.builder()
                .id(u.getId()).nombre(u.getNombre()).apellido(u.getApellido())
                .dni(u.getDni()).fotoPerfil(u.getFotoPerfil()).correo(u.getCorreo())
                .telefono(u.getTelefono()).rol(u.getRol().name())
                .activo(u.getActivo()).createdAt(u.getCreatedAt())
                .totalPropiedades(props).build();
    }
}
