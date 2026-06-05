package com.mihogar.dto.request;

import jakarta.validation.constraints.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Data @NoArgsConstructor @AllArgsConstructor
public class UpdateUserRequest {
    @NotBlank private String nombre;
    @NotBlank @Email private String correo;
    @Pattern(regexp = "^[0-9]{6,15}$") private String telefono;
    private String nuevaContrasena; // opcional, si viene se actualiza
}
