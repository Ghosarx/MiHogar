package com.mihogar.controller;

import com.mihogar.dto.request.PropertyRequest;
import com.mihogar.dto.response.PropertyDetailDTO;
import com.mihogar.dto.response.PropertySummaryDTO;
import com.mihogar.service.PropertyService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/properties")
@RequiredArgsConstructor
public class PropertyController {

    private final PropertyService propertyService;

    @GetMapping
    public ResponseEntity<Page<PropertySummaryDTO>> list(
            @RequestParam(required = false) String tipo,
            @RequestParam(required = false) Double precioMin,
            @RequestParam(required = false) Double precioMax,
            @RequestParam(required = false) Integer habitaciones,
            @RequestParam(required = false) Integer banos,
            @RequestParam(required = false) String ubicacion,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "12") int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        return ResponseEntity.ok(
                propertyService.list(tipo, precioMin, precioMax, habitaciones, banos, ubicacion, pageable));
    }

    @GetMapping("/{id}")
    public ResponseEntity<PropertyDetailDTO> getById(@PathVariable Long id) {
        return ResponseEntity.ok(propertyService.getById(id));
    }

    @PostMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<PropertyDetailDTO> create(
            @Valid @RequestBody PropertyRequest req,
            @AuthenticationPrincipal String correo) {
        return ResponseEntity.status(HttpStatus.CREATED).body(propertyService.create(req, correo));
    }

    @PutMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<PropertyDetailDTO> update(
            @PathVariable Long id,
            @Valid @RequestBody PropertyRequest req,
            @AuthenticationPrincipal String correo) {
        return ResponseEntity.ok(propertyService.update(id, req, correo));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Void> delete(
            @PathVariable Long id,
            @AuthenticationPrincipal String correo) {
        propertyService.delete(id, correo);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/mine")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Page<PropertySummaryDTO>> mine(
            @AuthenticationPrincipal String correo,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "12") int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        return ResponseEntity.ok(propertyService.mine(correo, pageable));
    }

    @PostMapping("/{id}/contact-click")
    public ResponseEntity<Void> contactClick(@PathVariable Long id) {
        return ResponseEntity.noContent().build();
    }
}
