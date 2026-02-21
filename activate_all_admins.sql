-- Script para activar todos los administradores en la tabla admin_emails
-- Esto asegura que todos los administradores aparezcan en la aplicación

-- Activar todos los administradores
UPDATE admin_emails 
SET is_active = true 
WHERE is_active = false;

-- Verificar el estado actual
SELECT 
    email,
    is_active,
    created_at
FROM admin_emails 
ORDER BY created_at DESC;

-- Mostrar mensaje de confirmación
SELECT '✅ Todos los administradores han sido activados' as status;


