package com.mihogar.dto.response;

import lombok.*;
import java.time.LocalDateTime;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class UserSummaryDTO {
    private Long id;
    private String nombre;
    private String correo;
    private String telefono;
    private String rol;
    private Boolean activo;
    private LocalDateTime createdAt;
    private long totalPropiedades;
}
