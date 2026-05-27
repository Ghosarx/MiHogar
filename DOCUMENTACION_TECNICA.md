# 📐 Documentación Técnica — MiHogar

## 1. Arquitectura del Sistema

```
┌─────────────────────────────────────────────────────┐
│                    NAVEGADOR                         │
│              Angular 19 (:4200)                      │
│   Components → Services → HttpClient + JWT           │
└─────────────────────┬───────────────────────────────┘
                      │ HTTP REST + Bearer Token
                      ▼
┌─────────────────────────────────────────────────────┐
│              Spring Boot 3 (:8080)                   │
│  Controller → Service → Repository → JPA             │
│  Spring Security (JWT) + BCrypt                      │
└─────────────────────┬───────────────────────────────┘
                      │ JPA / Hibernate
                      ▼
┌─────────────────────────────────────────────────────┐
│              MySQL 8 (:3306)                         │
│              Base de datos: mihogar                  │
└─────────────────────────────────────────────────────┘
```

---

## 2. Estructura del FrontEnd

```
FrontEnd/src/app/
├── components/
│   ├── navbar/                  → Barra de navegación con estado de sesión
│   ├── footer/                  → Pie de página
│   ├── property-card/           → Tarjeta de propiedad en el catálogo
│   └── property-detail-modal/   → Modal con detalle completo + contacto
├── pages/
│   ├── home/                    → Página principal con buscador
│   ├── catalogo/                → Listado con filtros (venta/alquiler)
│   ├── publicar/                → Formulario para publicar propiedad
│   └── registro/                → Login, registro y recuperación de contraseña
├── services/
│   ├── auth.service.ts          → Login, registro, JWT, sesión
│   ├── property.service.ts      → CRUD propiedades + filtros
│   └── modal.service.ts         → Control del modal de detalle
├── interceptors/
│   └── jwt.interceptor.ts       → Añade Bearer token a cada request
├── guards/
│   └── auth.guard.ts            → Protege rutas que requieren sesión
└── models/
    └── property.model.ts        → Interfaces TypeScript
```

---

## 3. Estructura del BackEnd

```
BackEnd/src/main/java/com/mihogar/
├── controller/
│   ├── AuthController.java       → Endpoints de autenticación
│   └── PropertyController.java   → Endpoints de propiedades
├── service/
│   ├── AuthService.java          → Lógica de negocio auth
│   ├── PropertyService.java      → Lógica de negocio propiedades
│   └── EmailService.java         → Envío de emails (Mailtrap)
├── entity/
│   ├── User.java                 → Entidad usuario
│   ├── Property.java             → Entidad propiedad
│   ├── PropertyImage.java        → Imágenes de propiedad
│   ├── PropertyAmenity.java      → Amenidades
│   ├── PasswordResetToken.java   → Tokens de recuperación
│   └── Favorite.java             → Favoritos
├── repository/                   → Interfaces JPA
├── dto/
│   ├── request/                  → DTOs de entrada (validados)
│   └── response/                 → DTOs de salida
├── security/
│   ├── JwtAuthenticationFilter.java
│   └── CustomUserDetailsService.java
├── config/
│   └── SecurityConfig.java       → CORS, JWT, permisos
├── exception/                    → Excepciones y handler global
└── util/
    └── JwtUtil.java              → Generación y validación JWT
```

---

## 4. Base de Datos

### Diagrama de Tablas

```
users
├── id (PK)
├── nombre
├── correo (UNIQUE)
├── password_hash
├── telefono
├── rol (USER / ADMIN)
├── activo
├── created_at
└── updated_at

properties
├── id (PK)
├── owner_id (FK → users)
├── titulo
├── descripcion
├── precio
├── ubicacion
├── tipo (venta / alquiler)
├── status (PENDING / ACTIVE / REJECTED / SOLD)
├── habitaciones
├── banos
├── metraje_m2
├── deleted_at
├── created_at
└── updated_at

property_images
├── id (PK)
├── property_id (FK → properties)
├── url
└── orden

property_amenities
├── id (PK)
├── property_id (FK → properties)
└── nombre

favorites
├── user_id (FK → users)
└── property_id (FK → properties)

password_reset_tokens
├── id (PK)
├── user_id (FK → users)
├── codigo (6 dígitos)
├── expires_at
└── used

contact_clicks
├── id (PK)
├── property_id (FK → properties)
├── user_id (FK → users, nullable)
├── ip
└── clicked_at

contact_messages
├── id (PK)
├── property_id (FK → properties)
├── agent_id (FK → users)
├── nombre, correo, telefono, mensaje
├── leido
└── created_at
```

---

## 5. Endpoints API REST

### Autenticación — `/api/auth`

| Método | Endpoint | Descripción | Auth |
|---|---|---|---|
| POST | `/api/auth/register` | Registrar usuario | No |
| POST | `/api/auth/login` | Iniciar sesión | No |
| POST | `/api/auth/forgot-password` | Solicitar código de recuperación | No |
| POST | `/api/auth/verify-code` | Verificar código (devuelve resetToken) | No |
| POST | `/api/auth/reset-password` | Cambiar contraseña | No |
| POST | `/api/auth/logout` | Cerrar sesión (client-side) | Sí |

### Propiedades — `/api/properties`

| Método | Endpoint | Descripción | Auth |
|---|---|---|---|
| GET | `/api/properties` | Listar propiedades con filtros | No |
| GET | `/api/properties/{id}` | Detalle de propiedad | No |
| POST | `/api/properties` | Publicar propiedad | Sí |
| PUT | `/api/properties/{id}` | Editar propiedad | Sí (owner) |
| DELETE | `/api/properties/{id}` | Eliminar propiedad (soft delete) | Sí (owner) |
| GET | `/api/properties/mine` | Mis propiedades | Sí |
| POST | `/api/properties/{id}/contact-click` | Registrar click WhatsApp | No |

### Parámetros de filtro (GET /api/properties)

| Parámetro | Tipo | Descripción |
|---|---|---|
| tipo | string | `venta` o `alquiler` |
| precioMin | number | Precio mínimo |
| precioMax | number | Precio máximo |
| habitaciones | number | Mínimo de habitaciones |
| banos | number | Mínimo de baños |
| ubicacion | string | Texto libre (búsqueda parcial) |
| page | number | Página (default: 0) |
| size | number | Tamaño (default: 12) |

---

## 6. Seguridad

- **Autenticación:** JWT (JSON Web Token)
- **Access Token:** válido 1 hora
- **Refresh Token:** válido 7 días
- **Reset Token:** válido 5 minutos
- **Contraseñas:** BCrypt con 10 rounds
- **CORS:** habilitado solo para `http://localhost:4200`
- **Rutas públicas:** catálogo, detalle, auth endpoints
- **Rutas protegidas:** publicar, editar, eliminar, mis propiedades

---

## 7. Variables de Configuración

Archivo: `BackEnd/src/main/resources/application.yml`

```yaml
spring.datasource.url: jdbc:mysql://localhost:3306/mihogar
spring.datasource.username: mihogar_user
spring.datasource.password: mihogar_pass

app.jwt.secret: [clave secreta]
app.jwt.expiration: 3600000        # 1 hora
app.jwt.refresh-expiration: 604800000  # 7 días

app.cors.allowed-origins: http://localhost:4200

spring.mail.host: sandbox.smtp.mailtrap.io
spring.mail.port: 587
spring.mail.username: [tu usuario Mailtrap]
spring.mail.password: [tu contraseña Mailtrap]
```
