package com.mihogar.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Entity
@Table(name = "propiedades", indexes = {
    @Index(name = "idx_tipo_precio", columnList = "tipo, precio"),
    @Index(name = "idx_ubicacion",   columnList = "ubicacion"),
    @Index(name = "idx_estado",      columnList = "estado")
})
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Property {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "propietario_id")
    private User owner;

    @Column(nullable = false, length = 200)
    private String titulo;

    @Column(columnDefinition = "TEXT")
    private String descripcion;

    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal precio;

    @Column(nullable = false, length = 150)
    private String ubicacion;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private TipoPropiedad tipo;

    @Enumerated(EnumType.STRING)
    @Column(name = "estado", nullable = false, length = 20)
    @Builder.Default
    private StatusPropiedad status = StatusPropiedad.PENDIENTE;

    private Integer habitaciones;
    private Integer banos;

    @Column(name = "metraje_m2")
    private Double metraje;

    @OneToMany(mappedBy = "property", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @Builder.Default
    private List<PropertyImage> imagenes = new ArrayList<>();

    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable(
        name = "propiedad_tags",
        joinColumns = @JoinColumn(name = "propiedad_id"),
        inverseJoinColumns = @JoinColumn(name = "tag_id")
    )
    @Builder.Default
    private Set<Tag> tags = new HashSet<>();

    @Column(name = "eliminado_en")
    private LocalDateTime deletedAt;

    @CreationTimestamp
    @Column(name = "creado_en", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "actualizado_en")
    private LocalDateTime updatedAt;

    public enum TipoPropiedad { venta, alquiler }
    public enum StatusPropiedad { PENDIENTE, ACTIVO, RECHAZADO, VENDIDO }
}
