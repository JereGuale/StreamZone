-- Script para debuggear la tabla admin_emails
-- Ejecutar este script para ver qué está pasando

-- 1. Verificar si la tabla existe
SELECT 
    table_name,
    table_type
FROM information_schema.tables 
WHERE table_name = 'admin_emails';

-- 2. Si la tabla existe, ver su estructura
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'admin_emails'
ORDER BY ordinal_position;

-- 3. Ver si hay datos
SELECT COUNT(*) as total_registros FROM admin_emails;

-- 4. Mostrar todos los datos si existen
SELECT * FROM admin_emails;
