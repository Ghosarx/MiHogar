package com.mihogar.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import java.time.LocalDateTime;

@Entity
@Table(name = "clics_contacto", indexes = {
    @Index(name = "idx_cc_propiedad",     columnList = "propiedad_id"),
    @Index(name = "idx_cc_registrado_en", columnList = "registrado_en")
})
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class ContactClick {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "propiedad_id")
    private Property property;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "usuario_id")
    private User user;

    @Column(length = 45)
    private String ip;

    @CreationTimestamp
    @Column(name = "registrado_en", updatable = false)
    private LocalDateTime clickedAt;
}
