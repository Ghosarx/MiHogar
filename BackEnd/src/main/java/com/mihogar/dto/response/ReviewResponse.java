package com.mihogar.dto.response;

import lombok.*;
import java.time.LocalDateTime;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class ReviewResponse {
    private Long id;
    private Long propiedadId;
    private Long usuarioId;
    private String usuarioNombre;
    private String usuarioApellido;
    private String usuarioFoto;
    private Integer estrellas;
    private String comentario;
    private LocalDateTime creadoEn;
}
