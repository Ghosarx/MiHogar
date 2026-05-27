# 🏠 MiHogar — Plataforma Inmobiliaria

MiHogar es una plataforma web para la compra y alquiler de propiedades en Perú. Permite a los usuarios explorar el catálogo, registrarse, publicar propiedades y contactar agentes directamente por WhatsApp.

---

## 📁 Estructura del Proyecto

```
MiHogar_Final/
├── FrontEnd/     → Angular 19 (interfaz de usuario)
├── BackEnd/      → Spring Boot 3 (API REST)
└── BD/           → MySQL 8 (base de datos)
```

---

## ⚙️ Requisitos Previos

| Herramienta | Versión mínima |
|---|---|
| Java | 21 |
| Maven | 3.9+ |
| Node.js | 20+ |
| Angular CLI | 19+ |
| MySQL | 8.0+ |

---

## 🚀 Instalación y Ejecución

### 1. Base de Datos

Abre MySQL Workbench y ejecuta el script:

```
BD/mihogar_schema.sql
```

Esto crea la base de datos `mihogar`, las 9 tablas y los datos de prueba.

### 2. BackEnd

```bash
cd BackEnd
mvn spring-boot:run
```

Antes de arrancar, configura tus credenciales de Mailtrap en:
```
BackEnd/src/main/resources/application.yml
```

El servidor arranca en: `http://localhost:8080`  
Swagger UI: `http://localhost:8080/swagger-ui.html`

### 3. FrontEnd

```bash
cd FrontEnd
npm install
ng serve
```

La aplicación abre en: `http://localhost:4200`

---

## 👥 Usuarios de Prueba

| Correo | Contraseña | Rol |
|---|---|---|
| admin@mihogar.pe | password | Admin |
| carlos@mihogar.pe | password | Agente |
| maria@mihogar.pe | password | Usuario |

---

## 🛠️ Tecnologías Utilizadas

**FrontEnd**
- Angular 19 con Signals
- TypeScript 5.7
- RxJS 7.8

**BackEnd**
- Spring Boot 3.2.5
- Spring Security + JWT
- Spring Data JPA
- Lombok

**Base de Datos**
- MySQL 8.0

---

## 📄 Documentación Adicional

- [Documentación Técnica](./DOCUMENTACION_TECNICA.md)
- [Manual de Usuario](./MANUAL_USUARIO.md)
