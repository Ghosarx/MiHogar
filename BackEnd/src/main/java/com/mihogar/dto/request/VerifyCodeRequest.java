package com.mihogar.dto.request;
import jakarta.validation.constraints.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Data @NoArgsConstructor @AllArgsConstructor
public class VerifyCodeRequest {
    @NotBlank @Email private String correo;
    @NotBlank @Pattern(regexp = "^[0-9]{6}$") private String codigo;
}
