package com.mihogar.dto.response;
import lombok.*;

@Data @NoArgsConstructor @AllArgsConstructor
public class ErrorResponse {
    private int status;
    private String error;
    private String message;
}
