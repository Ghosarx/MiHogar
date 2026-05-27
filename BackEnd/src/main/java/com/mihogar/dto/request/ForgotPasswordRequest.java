package com.mihogar.dto.request;
import jakarta.validation.constraints.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Data @NoArgsConstructor @AllArgsConstructor
public class ForgotPasswordRequest {
    @NotBlank @Email private String correo;
}
