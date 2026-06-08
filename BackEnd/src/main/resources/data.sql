-- data.sql — Spring Boot lo ejecuta en cada arranque (mode: always)
-- Solo inserta si no existe — nunca borra datos existentes

INSERT INTO usuarios (nombre, apellido, dni, correo, contrasena, telefono, rol)
SELECT 'Admin','MiHogar','00000001','admin@mihogar.pe',
       '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi','999000001','ADMIN'
WHERE NOT EXISTS (SELECT 1 FROM usuarios WHERE correo='admin@mihogar.pe');

INSERT INTO usuarios (nombre, apellido, dni, correo, contrasena, telefono, rol)
SELECT 'Carlos','Mendoza','12345678','carlos@mihogar.pe',
       '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi','987654321','USER'
WHERE NOT EXISTS (SELECT 1 FROM usuarios WHERE correo='carlos@mihogar.pe');

INSERT INTO usuarios (nombre, apellido, dni, correo, contrasena, telefono, rol)
SELECT 'María','López','87654321','maria@mihogar.pe',
       '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi','998765432','USER'
WHERE NOT EXISTS (SELECT 1 FROM usuarios WHERE correo='maria@mihogar.pe');
-- Contraseña para todos: "password"
