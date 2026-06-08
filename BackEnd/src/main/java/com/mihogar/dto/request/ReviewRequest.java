package com.mihogar.dto.request;

import jakarta.validation.constraints.*;
import lombok.Data;

@Data
public class ReviewRequest {

    @NotNull(message = "Las estrellas son obligatorias.")
    @Min(value = 1, message = "Mínimo 1 estrella.")
    @Max(value = 5, message = "Máximo 5 estrellas.")
    private Integer estrellas;

    @Size(max = 500, message = "El comentario no puede superar los 500 caracteres.")
    private String comentario;
}
