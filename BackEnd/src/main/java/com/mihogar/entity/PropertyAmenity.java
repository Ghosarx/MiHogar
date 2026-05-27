package com.mihogar.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "property_amenities")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class PropertyAmenity {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "property_id")
    private Property property;

    @Column(nullable = false, length = 100)
    private String nombre;
}
