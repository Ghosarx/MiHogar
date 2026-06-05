package com.mihogar.service;

import com.mihogar.dto.request.PropertyRequest;
import com.mihogar.dto.response.PropertyDetailDTO;
import com.mihogar.dto.response.PropertySummaryDTO;
import com.mihogar.entity.*;
import com.mihogar.exception.ForbiddenException;
import com.mihogar.exception.NotFoundException;
import com.mihogar.repository.PropertyRepository;
import com.mihogar.repository.TagRepository;
import com.mihogar.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Set;
import java.util.concurrent.atomic.AtomicInteger;

@Service
@RequiredArgsConstructor
public class PropertyService {

    private final PropertyRepository propertyRepo;
    private final UserRepository userRepo;
    private final TagRepository tagRepo;

    // ── Catálogo público ──────────────────────────────────────────────────────

    public Page<PropertySummaryDTO> list(String tipo, Double precioMin, Double precioMax,
                                          Integer habitaciones, Integer banos,
                                          String ubicacion, Pageable pageable) {
        Specification<Property> spec = Specification.where(notDeleted()).and(activeStatus());
        if (tipo != null)         spec = spec.and(tipoEq(tipo));
        if (precioMin != null)    spec = spec.and(precioGte(precioMin));
        if (precioMax != null)    spec = spec.and(precioLte(precioMax));
        if (habitaciones != null) spec = spec.and(habitacionesGte(habitaciones));
        if (banos != null)        spec = spec.and(banosGte(banos));
        if (ubicacion != null && !ubicacion.isBlank()) spec = spec.and(ubicacionLike(ubicacion));
        return propertyRepo.findAll(spec, pageable).map(this::toSummary);
    }

    public PropertyDetailDTO getById(Long id) {
        return toDetail(findActiveOrThrow(id));
    }

    // ── Panel usuario ─────────────────────────────────────────────────────────

    public Page<PropertySummaryDTO> mine(String correoOwner, String tipo, Pageable pageable) {
        User owner = userRepo.findByCorreo(correoOwner).orElseThrow();
        if (tipo != null && !tipo.isBlank()) {
            return propertyRepo
                    .findByOwnerIdAndTipoAndDeletedAtIsNull(owner.getId(),
                            Property.TipoPropiedad.valueOf(tipo), pageable)
                    .map(this::toSummary);
        }
        return propertyRepo.findByOwnerIdAndDeletedAtIsNull(owner.getId(), pageable).map(this::toSummary);
    }

    public Page<PropertySummaryDTO> mine(String correoOwner, Pageable pageable) {
        return mine(correoOwner, null, pageable);
    }

    public PropertyDetailDTO getOwnedById(Long id, String correoOwner) {
        Property p = propertyRepo.findById(id)
                .filter(pr -> pr.getDeletedAt() == null)
                .orElseThrow(() -> new NotFoundException("Propiedad no encontrada."));
        if (!p.getOwner().getCorreo().equals(correoOwner))
            throw new ForbiddenException("No tienes acceso a esta propiedad.");
        return toDetail(p);
    }

    // ── CRUD ──────────────────────────────────────────────────────────────────

    @Transactional
    public PropertyDetailDTO create(PropertyRequest req, String correoOwner) {
        User owner = userRepo.findByCorreo(correoOwner).orElseThrow();
        Set<Tag> tags = resolveTags(req.getAmenidades());
        Property p = Property.builder()
                .owner(owner).titulo(req.getTitulo()).descripcion(req.getDescripcion())
                .precio(req.getPrecio()).ubicacion(req.getUbicacion())
                .tipo(Property.TipoPropiedad.valueOf(req.getTipo()))
                .habitaciones(req.getHabitaciones()).banos(req.getBanos()).metraje(req.getMetraje())
                .status(Property.StatusPropiedad.ACTIVO)
                .tags(tags)
                .build();
        return toDetail(propertyRepo.save(p));
    }

    @Transactional
    public void addImages(Long propertyId, List<String> urls, String correoOwner) {
        Property p = findOwnedOrThrow(propertyId, correoOwner);
        AtomicInteger orden = new AtomicInteger(p.getImagenes().size());
        urls.forEach(url ->
                p.getImagenes().add(PropertyImage.builder().property(p).url(url).orden(orden.getAndIncrement()).build()));
        propertyRepo.save(p);
    }

    @Transactional
    public PropertyDetailDTO update(Long id, PropertyRequest req, String correoOwner) {
        Property p = findOwnedOrThrow(id, correoOwner);
        p.setTitulo(req.getTitulo()); p.setDescripcion(req.getDescripcion());
        p.setPrecio(req.getPrecio()); p.setUbicacion(req.getUbicacion());
        p.setTipo(Property.TipoPropiedad.valueOf(req.getTipo()));
        p.setHabitaciones(req.getHabitaciones()); p.setBanos(req.getBanos()); p.setMetraje(req.getMetraje());
        p.getTags().clear();
        p.getTags().addAll(resolveTags(req.getAmenidades()));
        return toDetail(propertyRepo.save(p));
    }

    @Transactional
    public void delete(Long id, String correoOwner) {
        Property p = findOwnedOrThrow(id, correoOwner);
        p.setDeletedAt(LocalDateTime.now());
        propertyRepo.save(p);
    }

    // ── Helpers ───────────────────────────────────────────────────────────────

    private Set<Tag> resolveTags(List<String> nombres) {
        if (nombres == null || nombres.isEmpty()) return new java.util.HashSet<>();
        return tagRepo.findByNombreIn(nombres);
    }

    private Property findActiveOrThrow(Long id) {
        return propertyRepo.findById(id)
                .filter(p -> p.getDeletedAt() == null)
                .orElseThrow(() -> new NotFoundException("Propiedad no encontrada."));
    }

    private Property findOwnedOrThrow(Long id, String correoOwner) {
        Property p = propertyRepo.findById(id)
                .filter(pr -> pr.getDeletedAt() == null)
                .orElseThrow(() -> new NotFoundException("Propiedad no encontrada."));
        if (!p.getOwner().getCorreo().equals(correoOwner))
            throw new ForbiddenException("No eres el propietario de esta publicación.");
        return p;
    }

    private PropertySummaryDTO toSummary(Property p) {
        String imagen = p.getImagenes().isEmpty() ? null : p.getImagenes().get(0).getUrl();
        return PropertySummaryDTO.builder()
                .id(p.getId()).titulo(p.getTitulo()).precio(p.getPrecio())
                .ubicacion(p.getUbicacion()).tipo(p.getTipo().name()).status(p.getStatus().name())
                .habitaciones(p.getHabitaciones()).banos(p.getBanos()).metraje(p.getMetraje())
                .imagenPrincipal(imagen).build();
    }

    private PropertyDetailDTO toDetail(Property p) {
        List<String> imgs = p.getImagenes().stream().map(PropertyImage::getUrl).toList();
        // Tags ordenados alfabéticamente
        List<String> tagNames = p.getTags().stream()
                .map(Tag::getNombre).sorted().toList();
        return PropertyDetailDTO.builder()
                .id(p.getId()).titulo(p.getTitulo()).descripcion(p.getDescripcion())
                .precio(p.getPrecio()).ubicacion(p.getUbicacion()).tipo(p.getTipo().name())
                .status(p.getStatus().name()).habitaciones(p.getHabitaciones())
                .banos(p.getBanos()).metraje(p.getMetraje()).imagenes(imgs).amenidades(tagNames)
                .owner(PropertyDetailDTO.OwnerDTO.builder()
                        .id(p.getOwner().getId()).nombre(p.getOwner().getNombre())
                        .telefono(p.getOwner().getTelefono()).build())
                .build();
    }

    private static Specification<Property> notDeleted() { return (r,q,cb) -> cb.isNull(r.get("deletedAt")); }
    private static Specification<Property> activeStatus() { return (r,q,cb) -> cb.equal(r.get("status"), Property.StatusPropiedad.ACTIVO); }
    private static Specification<Property> tipoEq(String tipo) { return (r,q,cb) -> cb.equal(r.get("tipo"), Property.TipoPropiedad.valueOf(tipo)); }
    private static Specification<Property> precioGte(double min) { return (r,q,cb) -> cb.ge(r.get("precio"), min); }
    private static Specification<Property> precioLte(double max) { return (r,q,cb) -> cb.le(r.get("precio"), max); }
    private static Specification<Property> habitacionesGte(int n) { return (r,q,cb) -> cb.ge(r.get("habitaciones"), n); }
    private static Specification<Property> banosGte(int n) { return (r,q,cb) -> cb.ge(r.get("banos"), n); }
    private static Specification<Property> ubicacionLike(String q) { return (r,qb,cb) -> cb.like(cb.lower(r.get("ubicacion")), "%"+q.toLowerCase()+"%"); }
}
