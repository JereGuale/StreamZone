-- Script para verificar administradores registrados
-- Consultar la tabla admin_emails

SELECT 
    email,
    created_at,
    is_active
FROM admin_emails
ORDER BY created_at DESC;

-- Contar total de administradores
SELECT 
    COUNT(*) as total_administradores,
    COUNT(CASE WHEN is_active = true THEN 1 END) as administradores_activos,
    COUNT(CASE WHEN is_active = false THEN 1 END) as administradores_inactivos
FROM admin_emails;

-- Mostrar información adicional
SELECT 
    'admin_emails' as tabla,
    COUNT(*) as total_registros
FROM admin_emails
UNION ALL
SELECT 
    'users' as tabla,
    COUNT(*) as total_registros
FROM users
UNION ALL
SELECT 
    'purchases' as tabla,
    COUNT(*) as total_registros
FROM purchases;
