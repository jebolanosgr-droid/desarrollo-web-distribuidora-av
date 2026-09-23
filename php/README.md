# Avinova PHP

1. Copia el contenido de esta carpeta a `htdocs`.
2. Renombra `includes/config.example.php` a `includes/config.php` y configura el host, base, usuario y contraseña MySQL del hosting.
3. Importa `sql/avinova_schema.sql` en phpMyAdmin.
4. Abre `index.php` y prueba registro, login, reserva y dashboard.

En producción usa HTTPS, cambia las credenciales y crea un usuario administrador mediante una consulta segura. No subas `includes/config.php` al repositorio.
