-- data.sql — Spring Boot lo ejecuta en cada arranque cuando ddl-auto=update
-- Solo inserta si la tabla está vacía (para no duplicar en reinicios)

INSERT INTO users (nombre, correo, password_hash, telefono, rol)
SELECT 'Admin MiHogar','admin@mihogar.pe',
       '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi','999000001','ADMIN'
WHERE NOT EXISTS (SELECT 1 FROM users WHERE correo='admin@mihogar.pe');

INSERT INTO users (nombre, correo, password_hash, telefono, rol)
SELECT 'Carlos Mendoza','carlos@mihogar.pe',
       '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi','987654321','USER'
WHERE NOT EXISTS (SELECT 1 FROM users WHERE correo='carlos@mihogar.pe');

INSERT INTO users (nombre, correo, password_hash, telefono, rol)
SELECT 'María López','maria@mihogar.pe',
       '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi','998765432','USER'
WHERE NOT EXISTS (SELECT 1 FROM users WHERE correo='maria@mihogar.pe');
-- Contraseña para todos: "password" (BCrypt $2a$10$92IXU...)
