package com.mihogar.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "favoritos")
@IdClass(FavoriteId.class)
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Favorite {
    @Id
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "usuario_id")
    private User user;

    @Id
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "propiedad_id")
    private Property property;
}
