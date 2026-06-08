package com.mihogar.dto.request;
import jakarta.validation.constraints.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Data @NoArgsConstructor @AllArgsConstructor
public class RegisterRequest {
    @NotBlank private String nombre;
    @NotBlank private String apellido;
    @NotBlank @Pattern(regexp = "^[0-9]{8}$", message = "El DNI debe tener exactamente 8 dígitos") private String dni;
    @NotBlank @Email private String correo;
    @NotBlank @Size(min = 8) private String contrasena;
    @NotBlank @Pattern(regexp = "^[0-9]{6,15}$") private String telefono;
}
