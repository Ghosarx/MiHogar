# MiHogar — Plataforma Inmobiliaria

MiHogar es una plataforma web para la compra y alquiler de propiedades en Perú. Permite a los usuarios explorar el catálogo, registrarse, publicar inmuebles con tags predefinidos, gestionar sus publicaciones y contactar agentes por WhatsApp. Incluye un panel de administración con dashboard de métricas y gestión de usuarios.

---

## Estructura del Proyecto

```
MiHogar/
├── FrontEnd/     Angular 19 — interfaz de usuario
├── BackEnd/      Spring Boot 3 — API REST
└── BD/           MySQL 8 — base de datos
```

---

## Requisitos Previos

| Herramienta | Versión mínima |
|---|---|
| Java | 21 |
| Eclipse IDE | 2023-09+ |
| Spring Tools 4 (plugin Eclipse) | Última versión |
| Lombok (plugin Eclipse) | 1.18+ |
| Node.js | 20+ |
| Angular CLI | 19+ |
| MySQL | 8.0+ |
| MySQL Workbench | 8.0+ |

---

## Instalación y Ejecución

### 1. Base de Datos

Abrir MySQL Workbench, conectarse al servidor local y ejecutar el script:

```
BD/mihogar_schema.sql
```

El script elimina y recrea la base de datos desde cero, crea todas las tablas en español, inserta los tags predefinidos y los datos de prueba.

### 2. BackEnd con Eclipse IDE

**Paso 1 — Instalar plugins en Eclipse**

Ir a Help → Eclipse Marketplace e instalar:
- Spring Tools 4 (aka Spring Tool Suite 4)
- Lombok: descargar lombok.jar desde projectlombok.org, ejecutar con `java -jar lombok.jar` y apuntar al ejecutable de Eclipse

**Paso 2 — Importar el proyecto**

Ir a File → Import → Maven → Existing Maven Projects, seleccionar la carpeta `BackEnd/` y hacer clic en Finish. Eclipse descargará las dependencias automáticamente.

**Paso 3 — Configurar credenciales**

Abrir `BackEnd/src/main/resources/application.yml` y completar:

```yaml
spring:
  mail:
    username: TU_USUARIO_MAILTRAP
    password: TU_PASSWORD_MAILTRAP

app:
  cloudinary:
    cloud-name: TU_CLOUD_NAME
    api-key:    TU_API_KEY
    api-secret: TU_API_SECRET
```

- Mailtrap: cuenta gratuita en mailtrap.io para pruebas de correo.
- Cloudinary: cuenta gratuita en cloudinary.com para almacenamiento de imágenes.

**Paso 4 — Ejecutar**

Clic derecho en el proyecto → Run As → Spring Boot App.

Verificar en la consola: `Started MiHogarApplication in X seconds`

- API: `http://localhost:8080`
- Swagger: `http://localhost:8080/swagger-ui.html`

### 3. FrontEnd

```bash
cd FrontEnd
npm install
ng serve
```

Aplicación disponible en: `http://localhost:4200`

---

## Orden de Arranque

1. MySQL (verificar que el servidor esté activo en Workbench)
2. BackEnd desde Eclipse (Spring Boot App)
3. FrontEnd desde la terminal (ng serve)

---

## Usuarios de Prueba

| Correo | Contraseña | Rol |
|---|---|---|
| admin@mihogar.pe | password | Admin |
| carlos@mihogar.pe | password | Usuario |
| maria@mihogar.pe | password | Usuario |

Panel de administración: `http://localhost:4200/admin`

---

## Funcionalidades

- Catálogo de propiedades en venta y alquiler con filtros
- Modal de detalle con galería, amenidades y contacto por WhatsApp
- Registro e inicio de sesión con JWT
- Recuperación de contraseña por correo (código de 6 dígitos)
- Publicar propiedades con tags predefinidos de la plataforma
- Panel de usuario (Mi Panel) con propiedades publicadas, edición y eliminación
- Panel de administración con dashboard de métricas y gráficas
- Gestión de usuarios desde el panel admin
- Subida de imágenes a Cloudinary
- Modo oscuro/claro persistente (respeta preferencia del sistema)

---

## Tecnologías

**FrontEnd:** Angular 19, TypeScript 5.7, RxJS 7.8

**BackEnd:** Spring Boot 3.2.5, Spring Security + JWT, Spring Data JPA, Lombok, Cloudinary SDK

**Base de Datos:** MySQL 8.0

---

## Documentación Adicional

- [Documentación Técnica](./docs/DOCUMENTACION_TECNICA.md)
- [Manual de Usuario](./docs/MANUAL_USUARIO.md)
