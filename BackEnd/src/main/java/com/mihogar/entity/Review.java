package com.mihogar.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "resenas",
    uniqueConstraints = @UniqueConstraint(name = "uq_resena", columnNames = {"usuario_id", "propiedad_id"}),
    indexes = {
        @Index(name = "idx_res_propiedad", columnList = "propiedad_id"),
        @Index(name = "idx_res_usuario",   columnList = "usuario_id")
    }
)
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Review {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "propiedad_id")
    private Property propiedad;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "usuario_id")
    private User usuario;

    @Column(nullable = false)
    private Integer estrellas;

    @Column(length = 500)
    private String comentario;

    @CreationTimestamp
    @Column(name = "creado_en", updatable = false)
    private LocalDateTime creadoEn;
}
