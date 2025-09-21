-- Script para actualizar la contraseña del administrador principal
-- Ejecutar este script en Supabase SQL Editor

-- Actualizar la contraseña del administrador principal
UPDATE admin_emails 
SET password = 'Jeremias_012.@' 
WHERE email = 'gualejere@gmail.com';

-- Verificar que se actualizó correctamente
SELECT email, password, is_active, created_at 
FROM admin_emails 
WHERE email = 'gualejere@gmail.com';

-- Mostrar mensaje de confirmación
SELECT '✅ Contraseña del administrador principal actualizada' as status;

