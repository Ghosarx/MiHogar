package com.mihogar.controller;

import com.mihogar.dto.response.PropertyDetailDTO;
import com.mihogar.dto.response.PropertySummaryDTO;
import com.mihogar.service.PropertyService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/user")
@PreAuthorize("isAuthenticated()")
@RequiredArgsConstructor
public class UserController {

    private final PropertyService propertyService;

    /** Panel del usuario — mis propiedades publicadas */
    @GetMapping("/properties")
    public ResponseEntity<Page<PropertySummaryDTO>> myProperties(
            @AuthenticationPrincipal String correo,
            @RequestParam(required = false) String tipo,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "12") int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        return ResponseEntity.ok(propertyService.mine(correo, tipo, pageable));
    }

    /** Detalle de una propiedad propia */
    @GetMapping("/properties/{id}")
    public ResponseEntity<PropertyDetailDTO> myPropertyById(
            @PathVariable Long id,
            @AuthenticationPrincipal String correo) {
        return ResponseEntity.ok(propertyService.getOwnedById(id, correo));
    }
}
