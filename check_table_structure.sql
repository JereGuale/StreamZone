-- Script para verificar la estructura de las tablas
-- Verificar qué columnas tiene la tabla admin_emails

-- Ver estructura de admin_emails
SELECT 
    column_name, 
    data_type, 
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'admin_emails'
ORDER BY ordinal_position;

-- Ver si la tabla admin_emails existe y tiene datos
SELECT 
    'admin_emails' as tabla,
    COUNT(*) as total_registros
FROM admin_emails;

-- Ver todos los emails de administradores
SELECT 
    email,
    created_at
FROM admin_emails
ORDER BY created_at DESC;

-- Verificar otras tablas importantes
SELECT 
    'users' as tabla,
    COUNT(*) as total_registros
FROM users
UNION ALL
SELECT 
    'purchases' as tabla,
    COUNT(*) as total_registros
FROM purchases;

