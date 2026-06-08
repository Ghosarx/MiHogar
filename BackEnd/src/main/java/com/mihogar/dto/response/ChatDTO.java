package com.mihogar.dto.response;

import lombok.*;
import java.time.LocalDateTime;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class ChatDTO {
    private Long id;
    private Long otroUsuarioId;
    private String otroUsuarioNombre;
    private String otroUsuarioApellido;
    private String otroUsuarioFoto;
    private Long propiedadId;
    private String propiedadTitulo;
    private String ultimoMensaje;
    private LocalDateTime ultimoMensajeEn;
    private long noLeidos;
    private LocalDateTime creadoEn;
}
