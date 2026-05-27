package com.mihogar.dto.request;
import jakarta.validation.constraints.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.math.BigDecimal;
import java.util.List;

@Data @NoArgsConstructor @AllArgsConstructor
public class PropertyRequest {
    @NotBlank private String titulo;
    private String descripcion;
    @NotNull @DecimalMin("0.01") private BigDecimal precio;
    @NotBlank private String ubicacion;
    @NotBlank private String tipo;
    @Min(0) private Integer habitaciones;
    @Min(0) private Integer banos;
    private Double metraje;
    private List<String> amenidades;
}
