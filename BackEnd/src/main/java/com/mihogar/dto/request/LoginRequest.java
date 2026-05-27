package com.mihogar.dto.request;
import jakarta.validation.constraints.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Data @NoArgsConstructor @AllArgsConstructor
public class LoginRequest {
    @NotBlank @Email private String correo;
    @NotBlank private String contrasena;
}
