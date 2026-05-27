package com.mihogar.entity;

import lombok.*;
import java.io.Serializable;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @EqualsAndHashCode
public class FavoriteId implements Serializable {
    private Long user;
    private Long property;
}
