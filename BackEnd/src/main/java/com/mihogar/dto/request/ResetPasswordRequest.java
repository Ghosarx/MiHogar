package com.mihogar.dto.request;
import jakarta.validation.constraints.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Data @NoArgsConstructor @AllArgsConstructor
public class ResetPasswordRequest {
    @NotBlank private String resetToken;
    @NotBlank @Size(min = 8) private String nuevaContrasena;
    @NotBlank private String confirmar;
}
