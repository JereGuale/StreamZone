-- ========================================
-- VERIFICAR CREDENCIALES EN LA BASE DE DATOS
-- ========================================
-- Ejecutar en Supabase SQL Editor

-- 1. Verificar todas las compras y sus credenciales
SELECT 
    id,
    customer,
    service,
    service_email,
    service_password,
    validated,
    created_at
FROM purchases 
ORDER BY created_at DESC;

-- 2. Contar compras con y sin credenciales
SELECT 
    COUNT(*) as total_compras,
    COUNT(CASE WHEN service_email IS NOT NULL AND service_email != '' THEN 1 END) as con_email,
    COUNT(CASE WHEN service_password IS NOT NULL AND service_password != '' THEN 1 END) as con_password,
    COUNT(CASE WHEN service_email IS NOT NULL AND service_email != '' AND service_password IS NOT NULL AND service_password != '' THEN 1 END) as con_ambas_credenciales
FROM purchases;

-- 3. Mostrar solo compras con credenciales
SELECT 
    id,
    customer,
    service,
    service_email,
    CASE 
        WHEN LENGTH(service_password) > 0 THEN '***' || SUBSTRING(service_password, -4)
        ELSE 'Sin contraseña'
    END as password_preview,
    validated,
    created_at
FROM purchases 
WHERE service_email IS NOT NULL 
    AND service_email != ''
    AND service_password IS NOT NULL 
    AND service_password != ''
ORDER BY created_at DESC;

-- 4. Verificar si hay compras sin credenciales
SELECT 
    id,
    customer,
    service,
    validated,
    created_at
FROM purchases 
WHERE service_email IS NULL 
    OR service_email = ''
    OR service_password IS NULL 
    OR service_password = ''
ORDER BY created_at DESC;

