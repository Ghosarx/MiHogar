package com.mihogar.controller;

import com.mihogar.dto.request.UpdateUserRequest;
import com.mihogar.dto.response.AdminMetricsDTO;
import com.mihogar.dto.response.UserSummaryDTO;
import com.mihogar.service.AdminService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasRole('ADMIN')")
@RequiredArgsConstructor
public class AdminController {

    private final AdminService adminService;

    /** Métricas generales del dashboard */
    @GetMapping("/metrics")
    public ResponseEntity<AdminMetricsDTO> getMetrics() {
        return ResponseEntity.ok(adminService.getMetrics());
    }

    /** Listar todos los usuarios */
    @GetMapping("/users")
    public ResponseEntity<Page<UserSummaryDTO>> listUsers(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        return ResponseEntity.ok(adminService.listUsers(pageable));
    }

    /** Obtener usuario por ID */
    @GetMapping("/users/{id}")
    public ResponseEntity<UserSummaryDTO> getUserById(@PathVariable Long id) {
        return ResponseEntity.ok(adminService.getUserById(id));
    }

    /** Actualizar nombre, correo, teléfono o contraseña de un usuario */
    @PutMapping("/users/{id}")
    public ResponseEntity<UserSummaryDTO> updateUser(
            @PathVariable Long id,
            @Valid @RequestBody UpdateUserRequest req) {
        return ResponseEntity.ok(adminService.updateUser(id, req));
    }

    /** Activar o desactivar usuario */
    @PatchMapping("/users/{id}/toggle-active")
    public ResponseEntity<UserSummaryDTO> toggleActive(@PathVariable Long id) {
        return ResponseEntity.ok(adminService.toggleUserActive(id));
    }

    /** Cambiar status de una propiedad (ACTIVE, REJECTED, SOLD, PENDING) */
    @PatchMapping("/properties/{id}/status")
    public ResponseEntity<Map<String, String>> updatePropertyStatus(
            @PathVariable Long id,
            @RequestParam String status) {
        adminService.updatePropertyStatus(id, status);
        return ResponseEntity.ok(Map.of("message", "Status actualizado a " + status));
    }
}
