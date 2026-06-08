package com.mihogar.dto.response;
import lombok.*;
import java.math.BigDecimal;
import java.util.List;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class PropertyDetailDTO {
    private Long id;
    private String titulo;
    private String descripcion;
    private BigDecimal precio;
    private String ubicacion;
    private String tipo;
    private String status;
    private Integer habitaciones;
    private Integer banos;
    private Double metraje;
    private List<String> imagenes;
    private List<String> amenidades;
    private OwnerDTO owner;
    private Double promedioEstrellas;
    private Long totalResenas;

    @Data @Builder @NoArgsConstructor @AllArgsConstructor
    public static class OwnerDTO {
        private Long id;
        private String nombre;
        private String apellido;
        private String telefono;
        private String fotoPerfil;
    }
}
