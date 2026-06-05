DROP DATABASE IF EXISTS mihogar;

CREATE DATABASE mihogar
    CHARACTER SET utf8mb4
    COLLATE utf8mb4_unicode_ci;

CREATE USER IF NOT EXISTS 'mihogar_user'@'localhost' IDENTIFIED BY 'mihogar_pass';
GRANT ALL PRIVILEGES ON mihogar.* TO 'mihogar_user'@'localhost';
FLUSH PRIVILEGES;

USE mihogar;

CREATE TABLE usuarios (
    id            BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    nombre        VARCHAR(100)  NOT NULL,
    correo        VARCHAR(150)  NOT NULL,
    contrasena    VARCHAR(255)  NOT NULL,
    telefono      VARCHAR(20)   NULL,
    rol           ENUM('USER','ADMIN') NOT NULL DEFAULT 'USER',
    activo        TINYINT(1)    NOT NULL DEFAULT 1,
    creado_en     DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
    actualizado_en DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT uq_usuarios_correo UNIQUE (correo)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE tokens_recuperacion (
    id         BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    usuario_id BIGINT UNSIGNED NOT NULL,
    codigo     VARCHAR(6)      NOT NULL,
    expira_en  DATETIME        NOT NULL,
    usado      TINYINT(1)      NOT NULL DEFAULT 0,
    CONSTRAINT fk_tr_usuario FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE propiedades (
    id           BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    propietario_id BIGINT UNSIGNED NOT NULL,
    titulo       VARCHAR(200)    NOT NULL,
    descripcion  TEXT            NULL,
    precio       DECIMAL(12,2)   NOT NULL CHECK (precio > 0),
    ubicacion    VARCHAR(150)    NOT NULL,
    tipo         ENUM('venta','alquiler') NOT NULL,
    estado       ENUM('PENDIENTE','ACTIVO','RECHAZADO','VENDIDO') NOT NULL DEFAULT 'PENDIENTE',
    habitaciones INT UNSIGNED    NULL,
    banos        INT UNSIGNED    NULL,
    metraje_m2   DOUBLE          NULL CHECK (metraje_m2 > 0),
    eliminado_en DATETIME        NULL,
    creado_en    DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
    actualizado_en DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_prop_propietario FOREIGN KEY (propietario_id) REFERENCES usuarios(id),
    INDEX idx_tipo_precio    (tipo, precio),
    INDEX idx_ubicacion      (ubicacion(50)),
    INDEX idx_estado         (estado),
    INDEX idx_propietario    (propietario_id),
    INDEX idx_eliminado_en   (eliminado_en)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE imagenes_propiedad (
    id           BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    propiedad_id BIGINT UNSIGNED NOT NULL,
    url          VARCHAR(500)    NOT NULL,
    orden        INT UNSIGNED    NOT NULL DEFAULT 0,
    CONSTRAINT fk_img_propiedad FOREIGN KEY (propiedad_id) REFERENCES propiedades(id) ON DELETE CASCADE,
    INDEX idx_prop_orden (propiedad_id, orden)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE favoritos (
    usuario_id   BIGINT UNSIGNED NOT NULL,
    propiedad_id BIGINT UNSIGNED NOT NULL,
    PRIMARY KEY (usuario_id, propiedad_id),
    CONSTRAINT fk_fav_usuario   FOREIGN KEY (usuario_id)   REFERENCES usuarios(id)    ON DELETE CASCADE,
    CONSTRAINT fk_fav_propiedad FOREIGN KEY (propiedad_id) REFERENCES propiedades(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE clics_contacto (
    id           BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    propiedad_id BIGINT UNSIGNED NOT NULL,
    usuario_id   BIGINT UNSIGNED NULL,
    ip           VARCHAR(45)     NULL,
    registrado_en DATETIME       NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_cc_propiedad FOREIGN KEY (propiedad_id) REFERENCES propiedades(id) ON DELETE CASCADE,
    CONSTRAINT fk_cc_usuario   FOREIGN KEY (usuario_id)   REFERENCES usuarios(id)    ON DELETE SET NULL,
    INDEX idx_cc_propiedad    (propiedad_id),
    INDEX idx_cc_registrado_en (registrado_en)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE mensajes_contacto (
    id           BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    propiedad_id BIGINT UNSIGNED NOT NULL,
    agente_id    BIGINT UNSIGNED NOT NULL,
    nombre       VARCHAR(100)    NOT NULL,
    correo       VARCHAR(150)    NOT NULL,
    telefono     VARCHAR(20)     NULL,
    mensaje      TEXT            NOT NULL,
    leido        TINYINT(1)      NOT NULL DEFAULT 0,
    creado_en    DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_mc_propiedad FOREIGN KEY (propiedad_id) REFERENCES propiedades(id) ON DELETE CASCADE,
    CONSTRAINT fk_mc_agente    FOREIGN KEY (agente_id)    REFERENCES usuarios(id)    ON DELETE CASCADE,
    INDEX idx_mc_agente (agente_id),
    INDEX idx_mc_leido  (leido)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE tags (
    id        BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    nombre    VARCHAR(60)  NOT NULL,
    categoria VARCHAR(40)  NOT NULL,
    CONSTRAINT uq_tag_nombre UNIQUE (nombre)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE propiedad_tags (
    propiedad_id BIGINT UNSIGNED NOT NULL,
    tag_id       BIGINT UNSIGNED NOT NULL,
    PRIMARY KEY (propiedad_id, tag_id),
    CONSTRAINT fk_pt_propiedad FOREIGN KEY (propiedad_id) REFERENCES propiedades(id) ON DELETE CASCADE,
    CONSTRAINT fk_pt_tag       FOREIGN KEY (tag_id)       REFERENCES tags(id)        ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO tags (nombre, categoria) VALUES
('Wifi',                     'servicios'),
('Agua caliente',            'servicios'),
('Gas natural',              'servicios'),
('Electricidad',             'servicios'),
('Cable/TV',                 'servicios'),
('Lavandería',               'servicios'),
('Aire acondicionado',       'servicios'),
('Calefacción',              'servicios'),
('Seguridad 24h',            'seguridad'),
('Cámara de vigilancia',     'seguridad'),
('Puerta blindada',          'seguridad'),
('Intercomunicador',         'seguridad'),
('Vigilante',                'seguridad'),
('Cochera',                  'espacios'),
('Cochera doble',            'espacios'),
('Cochera triple',           'espacios'),
('Jardín',                   'espacios'),
('Terraza',                  'espacios'),
('Balcón',                   'espacios'),
('Patio',                    'espacios'),
('Sótano',                   'espacios'),
('Cuarto de servicio',       'espacios'),
('Depósito',                 'espacios'),
('Piscina',                  'amenidades'),
('Gimnasio',                 'amenidades'),
('Sauna',                    'amenidades'),
('Zona BBQ',                 'amenidades'),
('Parrilla',                 'amenidades'),
('Salón de eventos',         'amenidades'),
('Juegos infantiles',        'amenidades'),
('Áreas comunes',            'amenidades'),
('Ascensor',                 'amenidades'),
('Vista al mar',             'vistas'),
('Vista panorámica',         'vistas'),
('Vista a parque',           'vistas'),
('Zona tranquila',           'vistas'),
('Cerca del mar',            'vistas'),
('Amoblado',                 'extras'),
('Semi amoblado',            'extras'),
('Mascotas permitidas',      'extras'),
('Parque cercano',           'extras'),
('Centro comercial cercano', 'extras'),
('Colegio cercano',          'extras'),
('Hospital cercano',         'extras');

INSERT INTO usuarios (nombre, correo, contrasena, telefono, rol) VALUES
('Admin MiHogar',  'admin@mihogar.pe',  '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', '999000001', 'ADMIN'),
('Carlos Mendoza', 'carlos@mihogar.pe', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', '987654321', 'USER'),
('María López',    'maria@mihogar.pe',  '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', '998765432', 'USER');

INSERT INTO propiedades (propietario_id, titulo, descripcion, precio, ubicacion, tipo, estado, habitaciones, banos, metraje_m2) VALUES
(2, 'Departamento moderno en Miraflores', 'Hermoso departamento totalmente amoblado con acabados de primera, ubicado a pasos del malecón.', 285000, 'Miraflores, Lima', 'venta', 'ACTIVO', 3, 2, 95),
(2, 'Casa de playa en Asia', 'Casa de playa con diseño contemporáneo a 50 m del mar. Espacios amplios y piscina privada.', 420000, 'Asia, Cañete', 'venta', 'ACTIVO', 4, 3, 220),
(2, 'Loft en San Isidro', 'Loft minimalista en zona financiera, ideal para inversión. Gran iluminación natural.', 198000, 'San Isidro, Lima', 'venta', 'ACTIVO', 1, 1, 55),
(2, 'Casa amplia en La Molina', 'Residencia familiar con jardín, tres cocheras y zona de entretenimiento.', 550000, 'La Molina, Lima', 'venta', 'ACTIVO', 5, 4, 350),
(2, 'Departamento en Jesús María', 'Departamento bien ubicado cerca de hospitales y centros comerciales.', 165000, 'Jesús María, Lima', 'venta', 'ACTIVO', 2, 1, 68),
(2, 'Estudio amoblado en Barranco', 'Estudio acogedor en el corazón bohemio de Lima, a pasos de cafés y galerías.', 1500, 'Barranco, Lima', 'alquiler', 'ACTIVO', 1, 1, 40),
(2, 'Departamento familiar en Surco', 'Amplio departamento en zona residencial tranquila cerca de colegios y parques.', 2800, 'Santiago de Surco, Lima', 'alquiler', 'ACTIVO', 3, 2, 110),
(2, 'Penthouse en San Borja', 'Penthouse de lujo con terraza privada y vista 360°. Acabados premium.', 4200, 'San Borja, Lima', 'alquiler', 'ACTIVO', 3, 3, 160),
(2, 'Habitación en San Miguel', 'Habitación independiente con baño privado en casa compartida. Incluye servicios.', 850, 'San Miguel, Lima', 'alquiler', 'ACTIVO', 1, 1, 18),
(2, 'Departamento ejecutivo en Miraflores', 'Departamento moderno con vista al mar, perfecto para ejecutivos.', 3500, 'Miraflores, Lima', 'alquiler', 'ACTIVO', 2, 2, 80);

INSERT INTO imagenes_propiedad (propiedad_id, url, orden) VALUES
(1, 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800', 0),
(1, 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800', 1),
(2, 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800', 0),
(2, 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800', 1),
(3, 'https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=800', 0),
(3, 'https://images.unsplash.com/photo-1554995207-c18c203602cb?w=800', 1),
(4, 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800', 0),
(4, 'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=800', 1),
(5, 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800', 0),
(6, 'https://images.unsplash.com/photo-1630699144867-37acec97df5a?w=800', 0),
(7, 'https://images.unsplash.com/photo-1574362848149-11496d93a7c7?w=800', 0),
(7, 'https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=800', 1),
(8, 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=800', 0),
(8, 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800', 1),
(9, 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800', 0),
(10, 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800', 0),
(10, 'https://images.unsplash.com/photo-1560185007-cde436f6a4d0?w=800', 1);

INSERT INTO propiedad_tags (propiedad_id, tag_id) SELECT 1, id FROM tags WHERE nombre IN ('Cochera','Gimnasio','Piscina','Vista al mar');
INSERT INTO propiedad_tags (propiedad_id, tag_id) SELECT 2, id FROM tags WHERE nombre IN ('Piscina','Terraza','Parrilla','Vista al mar','Cochera doble');
INSERT INTO propiedad_tags (propiedad_id, tag_id) SELECT 3, id FROM tags WHERE nombre IN ('Cochera','Seguridad 24h','Ascensor');
INSERT INTO propiedad_tags (propiedad_id, tag_id) SELECT 4, id FROM tags WHERE nombre IN ('Jardín','Cochera triple','Zona BBQ','Cuarto de servicio');
INSERT INTO propiedad_tags (propiedad_id, tag_id) SELECT 5, id FROM tags WHERE nombre IN ('Ascensor','Seguridad 24h');
INSERT INTO propiedad_tags (propiedad_id, tag_id) SELECT 6, id FROM tags WHERE nombre IN ('Amoblado','Wifi','Lavandería');
INSERT INTO propiedad_tags (propiedad_id, tag_id) SELECT 7, id FROM tags WHERE nombre IN ('Cochera','Áreas comunes','Parque cercano');
INSERT INTO propiedad_tags (propiedad_id, tag_id) SELECT 8, id FROM tags WHERE nombre IN ('Terraza','Piscina','Gimnasio','Cochera doble','Vista panorámica');
INSERT INTO propiedad_tags (propiedad_id, tag_id) SELECT 9, id FROM tags WHERE nombre IN ('Wifi');
INSERT INTO propiedad_tags (propiedad_id, tag_id) SELECT 10, id FROM tags WHERE nombre IN ('Vista al mar','Cochera','Seguridad 24h');
