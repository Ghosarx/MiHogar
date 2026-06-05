package com.mihogar.controller;

import com.mihogar.dto.request.PropertyRequest;
import com.mihogar.dto.response.PropertyDetailDTO;
import com.mihogar.dto.response.PropertySummaryDTO;
import com.mihogar.entity.ContactClick;
import com.mihogar.entity.Property;
import com.mihogar.entity.User;
import com.mihogar.exception.NotFoundException;
import com.mihogar.repository.ContactClickRepository;
import com.mihogar.repository.PropertyRepository;
import com.mihogar.repository.UserRepository;
import com.mihogar.service.CloudinaryService;
import com.mihogar.service.PropertyService;
import jakarta.servlet.http.HttpServletRequest;
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
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/properties")
@RequiredArgsConstructor
public class PropertyController {

    private final PropertyService propertyService;
    private final CloudinaryService cloudinaryService;
    private final ContactClickRepository clickRepo;
    private final PropertyRepository propertyRepo;
    private final UserRepository userRepo;

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

    @PostMapping("/{id}/images")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Map<String, List<String>>> uploadImages(
            @PathVariable Long id,
            @RequestParam("files") List<MultipartFile> files,
            @AuthenticationPrincipal String correo) {
        List<String> urls = cloudinaryService.uploadImages(files);
        propertyService.addImages(id, urls, correo);
        return ResponseEntity.ok(Map.of("urls", urls));
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

    /** Guarda el click en la BD para analytics */
    @PostMapping("/{id}/contact-click")
    public ResponseEntity<Void> contactClick(
            @PathVariable Long id,
            @AuthenticationPrincipal String correo,
            HttpServletRequest request) {
        Property property = propertyRepo.findById(id)
                .orElseThrow(() -> new NotFoundException("Propiedad no encontrada."));
        User user = correo != null ? userRepo.findByCorreo(correo).orElse(null) : null;
        String ip = request.getRemoteAddr();
        clickRepo.save(ContactClick.builder().property(property).user(user).ip(ip).build());
        return ResponseEntity.noContent().build();
    }
}
