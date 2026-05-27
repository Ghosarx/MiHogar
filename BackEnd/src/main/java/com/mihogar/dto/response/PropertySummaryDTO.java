package com.mihogar.dto.response;
import lombok.*;
import java.math.BigDecimal;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class PropertySummaryDTO {
    private Long id;
    private String titulo;
    private BigDecimal precio;
    private String ubicacion;
    private String tipo;
    private String status;
    private Integer habitaciones;
    private Integer banos;
    private Double metraje;
    private String imagenPrincipal;
}
