package com.mihogar.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "property_images", indexes = {
    @Index(name = "idx_prop_orden", columnList = "property_id, orden")
})
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class PropertyImage {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "property_id")
    private Property property;

    @Column(nullable = false)
    private String url;

    @Column(nullable = false)
    @Builder.Default
    private Integer orden = 0;
}
