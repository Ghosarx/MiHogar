# Manual de Usuario — MiHogar

## Introducción

MiHogar es una plataforma web para buscar, comprar y alquilar propiedades en Perú. También puedes publicar tus propias propiedades, gestionarlas desde tu panel personal y contactar agentes directamente por WhatsApp.

---

## 1. Modo Oscuro

En la esquina superior derecha del menú hay un botón con un ícono de luna o sol. Al hacer clic alternas entre el modo claro y el modo oscuro. La preferencia se guarda automáticamente y se mantiene la próxima vez que entres a la página.

---

## 2. Página Principal

Al entrar a `http://localhost:4200` verás la página principal con un buscador central.

**Cómo buscar:**
1. Selecciona si buscas para Comprar o Alquilar
2. Escribe la ubicación (ej. Miraflores)
3. Ingresa un precio máximo si lo deseas
4. Haz clic en Buscar

Serás redirigido al catálogo con los resultados filtrados.

---

## 3. Catálogo de Propiedades

Accede desde el menú en Comprar o Alquilar.

**Filtros disponibles:**
- Rango de precio — mínimo y máximo
- Habitaciones — cantidad mínima
- Baños — cantidad mínima
- Ubicación — texto libre

Los resultados se actualizan automáticamente. Para limpiar filtros haz clic en Limpiar.

**Ver detalles de una propiedad:**
Haz clic en Ver Detalles para abrir el modal con galería de imágenes, precio, características, descripción, tags/amenidades, botón de WhatsApp y formulario de contacto.

Para cerrar el modal haz clic en la X, fuera del modal o presiona Escape.

---

## 4. Crear una Cuenta

1. Haz clic en Registrarse en el menú
2. Completa el formulario: nombre, correo, contraseña (mínimo 8 caracteres) y teléfono
3. Haz clic en Crear cuenta

---

## 5. Iniciar Sesión

1. Haz clic en Iniciar sesión en el menú
2. Ingresa correo y contraseña
3. Haz clic en Iniciar sesión

El menú mostrará tu nombre y los enlaces Publicar Propiedad, Mi Panel y Cerrar sesión.

---

## 6. Recuperar Contraseña

1. En la pantalla de login haz clic en ¿Olvidaste tu contraseña?
2. Ingresa tu correo y haz clic en Enviar código
3. Revisa tu correo y escribe el código de 6 dígitos recibido
4. Ingresa tu nueva contraseña y confírmala
5. Haz clic en Guardar contraseña

El código expira en 15 minutos.

---

## 7. Publicar una Propiedad

Solo disponible para usuarios con sesión iniciada.

1. Haz clic en Publicar Propiedad en el menú
2. Selecciona el tipo: Venta o Alquiler
3. Completa título, dirección, precio, habitaciones, baños, metraje y descripción
4. Selecciona los tags que describen tu propiedad (servicios, seguridad, espacios, amenidades, vistas, extras)
5. Sube imágenes arrastrando o seleccionando archivos (opcional)
6. Haz clic en Publicar propiedad

---

## 8. Mi Panel

Accede desde el menú en Mi Panel (requiere sesión).

Verás todas tus propiedades publicadas con tabs para filtrar por tipo (todas, en venta, en alquiler).

**Editar una propiedad:** haz clic en el botón Editar de la tarjeta. Se abre el formulario con los datos actuales. Modifica lo que necesites y haz clic en Guardar cambios.

**Eliminar una propiedad:** haz clic en Eliminar. Aparece un modal de confirmación para evitar borrados accidentales.

---

## 9. Contactar a un Agente

Desde el modal de detalle de una propiedad:

**Por WhatsApp:** haz clic en el botón verde Contactar por WhatsApp. Se abrirá WhatsApp con un mensaje predefinido con el nombre y precio de la propiedad.

**Por formulario:** completa nombre, correo, teléfono y mensaje, luego haz clic en Enviar mensaje.

---

## 10. Panel de Administración

Solo accesible para usuarios con rol Admin en `http://localhost:4200/admin`.

**Métricas:** dashboard con tarjetas KPI (usuarios, propiedades, activas, clicks), gráfica de dona con distribución por tipo, gráficas de barras por tipo y estado, y resumen de estados.

**Usuarios:** tabla con todos los usuarios. Puedes editar nombre, correo, teléfono y contraseña de cualquier usuario, y activar o desactivar cuentas.

---

## 11. Preguntas Frecuentes

**¿Puedo ver propiedades sin registrarme?** Sí. El catálogo es público.

**¿Por qué no aparece el enlace Publicar Propiedad?** Debes iniciar sesión primero.

**¿Cómo sé si mi propiedad fue aprobada?** En Mi Panel verás el estado de cada publicación.

**¿Puedo subir imágenes al editar?** La subida de imágenes está disponible al crear. Para editar, actualiza los datos del formulario.

**El código de recuperación no llegó.** Revisa tu carpeta de spam. Expira en 15 minutos y puedes solicitar uno nuevo.
