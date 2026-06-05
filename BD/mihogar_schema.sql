-- =============================================================================
--  MiHogar — Script completo de Base de Datos
--  Motor: MySQL 8.0+  |  Charset: utf8mb4
-- =============================================================================

-- ────────────────────────────────────────────────────────────────────────────
--  1. CREAR BASE DE DATOS Y USUARIO DE APLICACIÓN
-- ────────────────────────────────────────────────────────────────────────────

CREATE DATABASE IF NOT EXISTS mihogar
    CHARACTER SET utf8mb4
    COLLATE utf8mb4_unicode_ci;

CREATE USER IF NOT EXISTS 'mihogar_user'@'localhost' IDENTIFIED BY 'mihogar_pass';
GRANT ALL PRIVILEGES ON mihogar.* TO 'mihogar_user'@'localhost';
FLUSH PRIVILEGES;

USE mihogar;

-- ────────────────────────────────────────────────────────────────────────────
--  2. TABLA: users  (HU-001, HU-002, HU-022)
-- ────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS users (
    id            BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    nombre        VARCHAR(100)  NOT NULL,
    correo        VARCHAR(150)  NOT NULL,
    password_hash VARCHAR(255)  NOT NULL,
    telefono      VARCHAR(20)   NULL,
    rol           ENUM('USER','ADMIN') NOT NULL DEFAULT 'USER',
    activo        TINYINT(1)    NOT NULL DEFAULT 1,
    created_at    DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at    DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT uq_users_correo UNIQUE (correo)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ────────────────────────────────────────────────────────────────────────────
--  3. TABLA: password_reset_tokens  (HU-003, HU-004, HU-005)
-- ────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS password_reset_tokens (
    id         BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id    BIGINT UNSIGNED NOT NULL,
    codigo     VARCHAR(6)      NOT NULL,
    expires_at DATETIME        NOT NULL,
    used       TINYINT(1)      NOT NULL DEFAULT 0,

    CONSTRAINT fk_prt_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ────────────────────────────────────────────────────────────────────────────
--  4. TABLA: properties  (HU-008/9/10/11/12/14/15/16)
-- ────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS properties (
    id          BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    owner_id    BIGINT UNSIGNED NOT NULL,
    titulo      VARCHAR(200)    NOT NULL,
    descripcion TEXT            NULL,
    precio      DECIMAL(12,2)   NOT NULL CHECK (precio > 0),
    ubicacion   VARCHAR(150)    NOT NULL,
    tipo        ENUM('venta','alquiler') NOT NULL,
    status      ENUM('PENDING','ACTIVE','REJECTED','SOLD') NOT NULL DEFAULT 'PENDING',
    habitaciones INT UNSIGNED   NULL,
    banos        INT UNSIGNED   NULL,
    metraje_m2   DOUBLE         NULL CHECK (metraje_m2 > 0),
    deleted_at  DATETIME        NULL,
    created_at  DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at  DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT fk_prop_owner FOREIGN KEY (owner_id) REFERENCES users(id),

    -- Índices para los filtros más frecuentes
    INDEX idx_tipo_precio   (tipo, precio),
    INDEX idx_ubicacion     (ubicacion(50)),
    INDEX idx_status        (status),
    INDEX idx_owner         (owner_id),
    INDEX idx_deleted_at    (deleted_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ────────────────────────────────────────────────────────────────────────────
--  5. TABLA: property_images  (HU-013)
-- ────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS property_images (
    id          BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    property_id BIGINT UNSIGNED NOT NULL,
    url         VARCHAR(500)    NOT NULL,
    orden       INT UNSIGNED    NOT NULL DEFAULT 0,

    CONSTRAINT fk_img_property FOREIGN KEY (property_id)
        REFERENCES properties(id) ON DELETE CASCADE,

    INDEX idx_prop_orden (property_id, orden)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ────────────────────────────────────────────────────────────────────────────
--  6. TABLA: property_amenities  (HU-012/015)
-- ────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS property_amenities (
    id          BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    property_id BIGINT UNSIGNED NOT NULL,
    nombre      VARCHAR(100)    NOT NULL,

    CONSTRAINT fk_amen_property FOREIGN KEY (property_id)
        REFERENCES properties(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ────────────────────────────────────────────────────────────────────────────
--  7. TABLA: favorites  (HU-019, HU-020)
-- ────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS favorites (
    user_id     BIGINT UNSIGNED NOT NULL,
    property_id BIGINT UNSIGNED NOT NULL,

    PRIMARY KEY (user_id, property_id),
    CONSTRAINT fk_fav_user     FOREIGN KEY (user_id)     REFERENCES users(id)      ON DELETE CASCADE,
    CONSTRAINT fk_fav_property FOREIGN KEY (property_id) REFERENCES properties(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ────────────────────────────────────────────────────────────────────────────
--  8. TABLA: contact_clicks  (HU-024 — analytics, opcional)
-- ────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS contact_clicks (
    id          BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    property_id BIGINT UNSIGNED NOT NULL,
    user_id     BIGINT UNSIGNED NULL,    -- NULL si es visitante no autenticado
    ip          VARCHAR(45)     NULL,
    clicked_at  DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_cc_property FOREIGN KEY (property_id) REFERENCES properties(id) ON DELETE CASCADE,
    CONSTRAINT fk_cc_user     FOREIGN KEY (user_id)     REFERENCES users(id)      ON DELETE SET NULL,
    INDEX idx_cc_property (property_id),
    INDEX idx_cc_clicked_at (clicked_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ────────────────────────────────────────────────────────────────────────────
--  9. TABLA: contact_messages  (HU-017 — canal email, opcional)
-- ────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS contact_messages (
    id          BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    property_id BIGINT UNSIGNED NOT NULL,
    agent_id    BIGINT UNSIGNED NOT NULL,
    nombre      VARCHAR(100)    NOT NULL,
    correo      VARCHAR(150)    NOT NULL,
    telefono    VARCHAR(20)     NULL,
    mensaje     TEXT            NOT NULL,
    leido       TINYINT(1)      NOT NULL DEFAULT 0,
    created_at  DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_cm_property FOREIGN KEY (property_id) REFERENCES properties(id) ON DELETE CASCADE,
    CONSTRAINT fk_cm_agent    FOREIGN KEY (agent_id)    REFERENCES users(id)      ON DELETE CASCADE,
    INDEX idx_cm_agent  (agent_id),
    INDEX idx_cm_leido  (leido)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================================================
--  10. DATOS SEMILLA (seed inicial para demo)
-- =============================================================================

-- Usuarios: admin, agente (owner), comprador
-- Contraseñas: todas son "password" — hash BCrypt rounds=10
INSERT IGNORE INTO users (nombre, correo, password_hash, telefono, rol) VALUES
('Admin MiHogar',  'admin@mihogar.pe',   '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', '999000001', 'ADMIN'),
('Carlos Mendoza', 'carlos@mihogar.pe',  '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', '987654321', 'USER'),
('María López',    'maria@mihogar.pe',   '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', '998765432', 'USER');

-- Propiedades (owner = Carlos, id=2)
INSERT IGNORE INTO properties (owner_id, titulo, descripcion, precio, ubicacion, tipo, status, habitaciones, banos, metraje_m2) VALUES
(2, 'Departamento moderno en Miraflores',
 'Hermoso departamento totalmente amoblado con acabados de primera, ubicado a pasos del malecón.',
 285000, 'Miraflores, Lima', 'venta', 'ACTIVE', 3, 2, 95),

(2, 'Casa de playa en Asia',
 'Casa de playa con diseño contemporáneo a 50 m del mar. Espacios amplios y piscina privada.',
 420000, 'Asia, Cañete', 'venta', 'ACTIVE', 4, 3, 220),

(2, 'Loft en San Isidro',
 'Loft minimalista en zona financiera, ideal para inversión. Gran iluminación natural.',
 198000, 'San Isidro, Lima', 'venta', 'ACTIVE', 1, 1, 55),

(2, 'Casa amplia en La Molina',
 'Residencia familiar con jardín, tres cocheras y zona de entretenimiento.',
 550000, 'La Molina, Lima', 'venta', 'ACTIVE', 5, 4, 350),

(2, 'Departamento en Jesús María',
 'Departamento bien ubicado cerca de hospitales y centros comerciales.',
 165000, 'Jesús María, Lima', 'venta', 'ACTIVE', 2, 1, 68),

(2, 'Estudio amoblado en Barranco',
 'Estudio acogedor en el corazón bohemio de Lima, a pasos de cafés y galerías.',
 1500, 'Barranco, Lima', 'alquiler', 'ACTIVE', 1, 1, 40),

(2, 'Departamento familiar en Surco',
 'Amplio departamento en zona residencial tranquila cerca de colegios y parques.',
 2800, 'Santiago de Surco, Lima', 'alquiler', 'ACTIVE', 3, 2, 110),

(2, 'Penthouse en San Borja',
 'Penthouse de lujo con terraza privada y vista 360°. Acabados premium.',
 4200, 'San Borja, Lima', 'alquiler', 'ACTIVE', 3, 3, 160),

(2, 'Habitación en San Miguel',
 'Habitación independiente con baño privado en casa compartida. Incluye servicios.',
 850, 'San Miguel, Lima', 'alquiler', 'ACTIVE', 1, 1, 18),

(2, 'Departamento ejecutivo en Miraflores',
 'Departamento moderno con vista al mar, perfecto para ejecutivos.',
 3500, 'Miraflores, Lima', 'alquiler', 'ACTIVE', 2, 2, 80);

-- Amenidades para las propiedades
INSERT IGNORE INTO property_amenities (property_id, nombre) VALUES
(1,'Cochera'),(1,'Gimnasio'),(1,'Piscina'),(1,'Vista al mar'),
(2,'Piscina'),(2,'Terraza'),(2,'Parrilla'),(2,'Vista al mar'),(2,'Cochera doble'),
(3,'Cochera'),(3,'Seguridad 24h'),(3,'Ascensor'),
(4,'Jardín'),(4,'Cochera triple'),(4,'Zona BBQ'),(4,'Cuarto de servicio'),
(5,'Ascensor'),(5,'Vigilancia'),
(6,'Amoblado'),(6,'Wifi'),(6,'Lavandería'),
(7,'Cochera'),(7,'Áreas comunes'),(7,'Parque cercano'),
(8,'Terraza privada'),(8,'Piscina'),(8,'Gimnasio'),(8,'Cochera doble'),(8,'Vista panorámica'),
(9,'Servicios incluidos'),(9,'Wifi'),
(10,'Vista al mar'),(10,'Cochera'),(10,'Seguridad 24h');


-- =============================================================================
--  11. IMÁGENES DE PROPIEDADES (usando Unsplash para demo)
-- =============================================================================
INSERT IGNORE INTO property_images (property_id, url, orden) VALUES
-- Departamento moderno en Miraflores
(1, 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800', 0),
(1, 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800', 1),
-- Casa de playa en Asia
(2, 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800', 0),
(2, 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800', 1),
-- Loft en San Isidro
(3, 'https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=800', 0),
(3, 'https://images.unsplash.com/photo-1554995207-c18c203602cb?w=800', 1),
-- Casa amplia en La Molina
(4, 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800', 0),
(4, 'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=800', 1),
-- Departamento en Jesús María
(5, 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800', 0),
-- Estudio amoblado en Barranco
(6, 'https://images.unsplash.com/photo-1630699144867-37acec97df5a?w=800', 0),
-- Departamento familiar en Surco
(7, 'https://images.unsplash.com/photo-1574362848149-11496d93a7c7?w=800', 0),
(7, 'https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=800', 1),
-- Penthouse en San Borja
(8, 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=800', 0),
(8, 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800', 1),
-- Habitación en San Miguel
(9, 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800', 0),
-- Departamento ejecutivo en Miraflores
(10, 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800', 0),
(10, 'https://images.unsplash.com/photo-1560185007-cde436f6a4d0?w=800', 1);

-- =============================================================================
--  FIN DEL SCRIPT
-- =============================================================================

