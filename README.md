# MiHogar — Plataforma Inmobiliaria

MiHogar es una plataforma web para la compra y alquiler de propiedades en Perú. Permite a los usuarios explorar el catálogo de propiedades, registrarse, publicar inmuebles y contactar agentes directamente por WhatsApp. Incluye un panel de administración con métricas y gestión de usuarios.

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

| Herramienta   | Versión mínima |
|---------------|----------------|
| Java          | 21             |
| Eclipse IDE   | 2023-09+       |
| Spring Tools 4 (plugin Eclipse) | Última versión |
| Lombok (plugin Eclipse) | 1.18+ |
| Node.js       | 20+            |
| Angular CLI   | 19+            |
| MySQL         | 8.0+           |
| MySQL Workbench | 8.0+         |

---

## Instalación y Ejecución

### 1. Base de Datos

Abrir MySQL Workbench, conectarse al servidor local y ejecutar el script:

```
BD/mihogar_schema.sql
```

Esto crea la base de datos `mihogar`, las tablas, índices y los datos de prueba iniciales.

### 2. BackEnd con Eclipse IDE

**Paso 1 — Instalar plugins necesarios en Eclipse**

Ir a Help → Eclipse Marketplace e instalar:
- Spring Tools 4 (aka Spring Tool Suite 4)
- Lombok (descargar lombok.jar desde projectlombok.org e instalar apuntando al ejecutable de Eclipse)

**Paso 2 — Importar el proyecto**

Ir a File → Import → Maven → Existing Maven Projects.
Seleccionar la carpeta `BackEnd/` y hacer clic en Finish.
Eclipse descargará las dependencias automáticamente.

**Paso 3 — Configurar credenciales**

Abrir el archivo:
```
BackEnd/src/main/resources/application.yml
```

Completar los valores marcados como pendientes:

```yaml
spring:
  mail:
    username: TU_USUARIO_MAILTRAP
    password: TU_PASSWORD_MAILTRAP

app:
  cloudinary:
    cloud-name: TU_CLOUD_NAME
    api-key: TU_API_KEY
    api-secret: TU_API_SECRET
```

- Mailtrap: crear cuenta gratuita en mailtrap.io para pruebas de correo.
- Cloudinary: crear cuenta gratuita en cloudinary.com para almacenamiento de imágenes.

**Paso 4 — Ejecutar**

Hacer clic derecho en el proyecto → Run As → Spring Boot App.

Verificar que la consola muestre:
```
Started MiHogarApplication in X seconds
```

El servidor queda disponible en: `http://localhost:8080`

Documentación Swagger: `http://localhost:8080/swagger-ui.html`

### 3. FrontEnd

Abrir una terminal en la carpeta `FrontEnd/` y ejecutar:

```bash
npm install
ng serve
```

La aplicación queda disponible en: `http://localhost:4200`

---

## Orden de Arranque

Para que el sistema funcione correctamente, los servicios deben iniciarse en este orden:

1. MySQL (verificar que el servidor esté activo en Workbench)
2. BackEnd desde Eclipse (Spring Boot App)
3. FrontEnd desde la terminal (ng serve)

---

## Usuarios de Prueba

| Correo              | Contraseña | Rol    |
|---------------------|------------|--------|
| admin@mihogar.pe    | password   | Admin  |
| carlos@mihogar.pe   | password   | Usuario |
| maria@mihogar.pe    | password   | Usuario |

El usuario administrador tiene acceso al panel en `http://localhost:4200/admin`.

---

## Tecnologías Utilizadas

**FrontEnd**
- Angular 19 con Signals
- TypeScript 5.7
- RxJS 7.8

**BackEnd**
- Spring Boot 3.2.5
- Spring Security con JWT
- Spring Data JPA con Hibernate
- Lombok
- Cloudinary SDK

**Base de Datos**
- MySQL 8.0

---

## Documentación Adicional

- [Documentación Técnica](./docs/DOCUMENTACION_TECNICA.md)
- [Manual de Usuario](./docs/MANUAL_USUARIO.md)
