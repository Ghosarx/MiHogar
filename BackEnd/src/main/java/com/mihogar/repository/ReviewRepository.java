package com.mihogar.repository;

import com.mihogar.entity.Review;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface ReviewRepository extends JpaRepository<Review, Long> {

    List<Review> findByPropiedadIdOrderByCreadoEnDesc(Long propiedadId);

    boolean existsByPropiedadIdAndUsuarioId(Long propiedadId, Long usuarioId);

    Optional<Review> findByPropiedadIdAndUsuarioId(Long propiedadId, Long usuarioId);

    @Query("SELECT COALESCE(AVG(r.estrellas), 0) FROM Review r WHERE r.propiedad.id = :pid")
    Double avgByPropiedad(@Param("pid") Long propiedadId);

    @Query("SELECT COUNT(r) FROM Review r WHERE r.propiedad.id = :pid")
    Long countByPropiedad(@Param("pid") Long propiedadId);
}
