package com.mihogar.dto.response;

import lombok.*;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class AdminMetricsDTO {
    private long totalUsuarios;
    private long totalPropiedades;
    private long propiedadesVenta;
    private long propiedadesAlquiler;
    private long propiedadesPendientes;
    private long propiedadesActivas;
    private long propiedadesRechazadas;
    private long propiedadesVendidas;
    private long totalContactClicks;
}
