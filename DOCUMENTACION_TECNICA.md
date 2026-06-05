# Documentación Técnica — MiHogar

## 1. Arquitectura del Sistema

```
Navegador (Angular 19 :4200)
        |
        | HTTP REST + Bearer JWT
        v
Spring Boot 3 (:8080)
  Controller → Service → Repository → JPA
  Spring Security + BCrypt
        |
        | JPA / Hibernate
        v
MySQL 8 (:3306) — base de datos: mihogar
```

---

## 2. Estructura del FrontEnd

```
FrontEnd/src/app/
├── components/
│   ├── navbar/                       Barra de navegación con toggle modo oscuro
│   ├── footer/                       Pie de página
│   ├── property-card/                Tarjeta de propiedad en el catálogo
│   └── property-detail-modal/        Modal de detalle con galería y contacto
├── pages/
│   ├── home/                         Página principal con buscador
│   ├── catalogo/                     Listado con filtros
│   ├── publicar/                     Formulario de publicación y edición con tags
│   ├── mi-panel/                     Panel del usuario con sus propiedades
│   ├── registro/                     Login, registro y recuperación de contraseña
│   └── admin/                        Dashboard de métricas y gestión de usuarios
├── services/
│   ├── auth.service.ts               Login, registro, JWT, sesión
│   ├── property.service.ts           CRUD propiedades y filtros
│   ├── modal.service.ts              Control del modal de detalle
│   ├── tag.service.ts                Tags de la plataforma
│   ├── user.service.ts               Panel del usuario
│   ├── admin.service.ts              Métricas y gestión admin
│   └── theme.service.ts              Modo oscuro/claro persistente
├── interceptors/
│   └── jwt.interceptor.ts            Añade Bearer token a cada request
├── guards/
│   ├── auth.guard.ts                 Protege rutas que requieren sesión
│   └── admin.guard.ts                Solo para ADMIN
└── models/
    └── property.model.ts             Interfaces TypeScript
```

---

## 3. Estructura del BackEnd

```
BackEnd/src/main/java/com/mihogar/
├── controller/
│   ├── AuthController.java
│   ├── PropertyController.java
│   ├── TagController.java
│   ├── UserController.java
│   └── AdminController.java
├── service/
│   ├── AuthService.java
│   ├── PropertyService.java
│   ├── AdminService.java
│   ├── CloudinaryService.java
│   └── EmailService.java
├── entity/
│   ├── User.java            → tabla: usuarios
│   ├── Property.java        → tabla: propiedades
│   ├── PropertyImage.java   → tabla: imagenes_propiedad
│   ├── Tag.java             → tabla: tags
│   ├── PasswordResetToken.java → tabla: tokens_recuperacion
│   ├── Favorite.java        → tabla: favoritos
│   └── ContactClick.java   → tabla: clics_contacto
├── repository/
├── dto/
│   ├── request/
│   └── response/
├── security/
├── config/
├── exception/
└── util/
```

---

## 4. Base de Datos

### Tablas

| Tabla | Descripción |
|---|---|
| usuarios | Cuentas de usuario (USER / ADMIN) |
| tokens_recuperacion | Códigos de recuperación de contraseña (6 dígitos, expiran en 15 min) |
| propiedades | Inmuebles publicados con estado (PENDIENTE/ACTIVO/RECHAZADO/VENDIDO) |
| imagenes_propiedad | URLs de imágenes alojadas en Cloudinary |
| tags | 42 tags predefinidos en 6 categorías |
| propiedad_tags | Relación ManyToMany propiedades — tags |
| favoritos | Propiedades guardadas por usuario |
| clics_contacto | Analytics de clicks al botón WhatsApp |
| mensajes_contacto | Mensajes del formulario de contacto |

### Categorías de Tags

| Categoría | Ejemplos |
|---|---|
| servicios | Wifi, Aire acondicionado, Lavandería |
| seguridad | Seguridad 24h, Cámara de vigilancia |
| espacios | Cochera, Jardín, Terraza, Balcón |
| amenidades | Piscina, Gimnasio, Ascensor |
| vistas | Vista al mar, Vista panorámica |
| extras | Amoblado, Mascotas permitidas |

---

## 5. Endpoints API REST

### Autenticación — `/api/auth` (público)

| Método | Endpoint | Descripción |
|---|---|---|
| POST | `/api/auth/register` | Registrar usuario |
| POST | `/api/auth/login` | Iniciar sesión |
| POST | `/api/auth/forgot-password` | Solicitar código de recuperación |
| POST | `/api/auth/verify-code` | Verificar código |
| POST | `/api/auth/reset-password` | Nueva contraseña |
| POST | `/api/auth/logout` | Cerrar sesión |

### Tags — `/api/tags` (público)

| Método | Endpoint | Descripción |
|---|---|---|
| GET | `/api/tags` | Listar todos los tags por categoría |

### Propiedades — `/api/properties`

| Método | Endpoint | Auth | Descripción |
|---|---|---|---|
| GET | `/api/properties` | No | Catálogo con filtros |
| GET | `/api/properties/{id}` | No | Detalle |
| POST | `/api/properties` | Sí | Publicar |
| PUT | `/api/properties/{id}` | Sí (owner) | Editar |
| DELETE | `/api/properties/{id}` | Sí (owner) | Eliminar |
| POST | `/api/properties/{id}/images` | Sí | Subir imágenes |
| POST | `/api/properties/{id}/contact-click` | No | Registrar click |

### Panel usuario — `/api/user` (requiere sesión)

| Método | Endpoint | Descripción |
|---|---|---|
| GET | `/api/user/properties` | Mis propiedades |
| GET | `/api/user/properties/{id}` | Detalle propio |

### Admin — `/api/admin` (solo ADMIN)

| Método | Endpoint | Descripción |
|---|---|---|
| GET | `/api/admin/metrics` | Métricas del dashboard |
| GET | `/api/admin/users` | Listar usuarios |
| PUT | `/api/admin/users/{id}` | Editar usuario |
| PATCH | `/api/admin/users/{id}/toggle-active` | Activar/desactivar |
| PATCH | `/api/admin/properties/{id}/status` | Cambiar estado |

---

## 6. Seguridad

- JWT con HMAC-SHA256. Access token: 1h. Refresh token: 7d. Reset token: 5min.
- Contraseñas con BCrypt 10 rounds.
- CORS habilitado solo para `http://localhost:4200`.

---

## 7. Modo Oscuro

Variables CSS en `:root` (claro) y `[data-theme="dark"]` (oscuro). `ThemeService` aplica el atributo al elemento `html` y persiste en `localStorage`. Al primer uso respeta `prefers-color-scheme` del sistema operativo.

---

## 8. Variables de Configuración

```yaml
spring.datasource.url:      jdbc:mysql://localhost:3306/mihogar
spring.datasource.username: mihogar_user
spring.datasource.password: mihogar_pass
app.jwt.expiration:         3600000
app.cors.allowed-origins:   http://localhost:4200
spring.mail.username:       [usuario Mailtrap]
spring.mail.password:       [contraseña Mailtrap]
app.cloudinary.cloud-name:  [cloud name]
app.cloudinary.api-key:     [api key]
app.cloudinary.api-secret:  [api secret]
```
