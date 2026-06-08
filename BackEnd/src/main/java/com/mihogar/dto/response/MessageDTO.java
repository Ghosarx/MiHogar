package com.mihogar.dto.response;

import lombok.*;
import java.time.LocalDateTime;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class MessageDTO {
    private Long id;
    private Long remitenteId;
    private String remitenteNombre;
    private String contenido;
    private Boolean leido;
    private LocalDateTime enviadoEn;
}
