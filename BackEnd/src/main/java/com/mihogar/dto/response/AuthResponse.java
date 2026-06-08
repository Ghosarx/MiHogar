package com.mihogar.dto.response;
import lombok.*;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class AuthResponse {
    private String accessToken;
    private String refreshToken;
    private String correo;
    private String nombre;
    private String apellido;
    private String dni;
    private String telefono;
    private String fotoPerfil;
    private String rol;
    private Long id;
}
