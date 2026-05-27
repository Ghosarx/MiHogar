package com.mihogar.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "favorites")
@IdClass(FavoriteId.class)
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Favorite {

    @Id
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private User user;

    @Id
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "property_id")
    private Property property;
}
