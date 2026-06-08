package com.mihogar.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "chats", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"usuario1_id", "usuario2_id", "propiedad_id"})
})
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Chat {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "usuario1_id", nullable = false)
    private User usuario1;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "usuario2_id", nullable = false)
    private User usuario2;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "propiedad_id")
    private Property propiedad;

    @CreationTimestamp
    @Column(name = "creado_en", updatable = false)
    private LocalDateTime creadoEn;
}
