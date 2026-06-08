package com.mihogar.service;

import com.mihogar.dto.request.ReviewRequest;
import com.mihogar.dto.response.ReviewResponse;
import com.mihogar.entity.Property;
import com.mihogar.entity.Review;
import com.mihogar.entity.User;
import com.mihogar.exception.BadRequestException;
import com.mihogar.exception.ForbiddenException;
import com.mihogar.exception.NotFoundException;
import com.mihogar.repository.PropertyRepository;
import com.mihogar.repository.ReviewRepository;
import com.mihogar.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ReviewService {

    private final ReviewRepository reviewRepo;
    private final PropertyRepository propertyRepo;
    private final UserRepository userRepo;

    public List<ReviewResponse> getReviews(Long propiedadId) {
        return reviewRepo.findByPropiedadIdOrderByCreadoEnDesc(propiedadId)
                .stream().map(this::toResponse).toList();
    }

    @Transactional
    public ReviewResponse crearReview(Long propiedadId, String correo, ReviewRequest req) {
        User user = findUser(correo);
        Property prop = propertyRepo.findById(propiedadId)
                .filter(p -> p.getDeletedAt() == null)
                .orElseThrow(() -> new NotFoundException("Propiedad no encontrada."));

        if (prop.getOwner().getId().equals(user.getId()))
            throw new BadRequestException("No puedes reseñar tu propia propiedad.");

        if (reviewRepo.existsByPropiedadIdAndUsuarioId(propiedadId, user.getId()))
            throw new BadRequestException("Ya has reseñado esta propiedad.");

        Review review = reviewRepo.save(Review.builder()
                .propiedad(prop).usuario(user)
                .estrellas(req.getEstrellas())
                .comentario(req.getComentario())
                .build());

        return toResponse(review);
    }

    @Transactional
    public void eliminarReview(Long reviewId, String correo) {
        User user = findUser(correo);
        Review review = reviewRepo.findById(reviewId)
                .orElseThrow(() -> new NotFoundException("Reseña no encontrada."));

        boolean esAdmin = user.getRol().name().equals("ADMIN");
        if (!review.getUsuario().getId().equals(user.getId()) && !esAdmin)
            throw new ForbiddenException("No tienes permiso para eliminar esta reseña.");

        reviewRepo.delete(review);
    }

    private User findUser(String correo) {
        return userRepo.findByCorreo(correo)
                .orElseThrow(() -> new NotFoundException("Usuario no encontrado."));
    }

    private ReviewResponse toResponse(Review r) {
        return ReviewResponse.builder()
                .id(r.getId())
                .propiedadId(r.getPropiedad().getId())
                .usuarioId(r.getUsuario().getId())
                .usuarioNombre(r.getUsuario().getNombre())
                .usuarioApellido(r.getUsuario().getApellido())
                .usuarioFoto(r.getUsuario().getFotoPerfil())
                .estrellas(r.getEstrellas())
                .comentario(r.getComentario())
                .creadoEn(r.getCreadoEn())
                .build();
    }
}
