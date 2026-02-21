-- ========================================
-- DIAGNOSTICAR COMPRAS ACTIVAS
-- ========================================
-- Ejecutar en Supabase SQL Editor

-- 1. Verificar todas las compras en la base de datos
SELECT 
    COUNT(*) as total_compras,
    COUNT(CASE WHEN validated = true THEN 1 END) as compras_validadas,
    COUNT(CASE WHEN validated = false THEN 1 END) as compras_pendientes
FROM purchases;

-- 2. Verificar compras activas (validadas y no vencidas)
SELECT 
    COUNT(*) as compras_activas,
    COUNT(CASE WHEN "end" >= CURRENT_DATE THEN 1 END) as no_vencidas,
    COUNT(CASE WHEN "end" < CURRENT_DATE THEN 1 END) as vencidas
FROM purchases 
WHERE validated = true;

-- 3. Mostrar todas las compras con su estado
SELECT 
    id,
    customer,
    phone,
    service,
    start,
    "end",
    validated,
    created_at,
    CASE 
        WHEN validated = false THEN 'PENDIENTE'
        WHEN "end" < CURRENT_DATE THEN 'VENCIDA'
        WHEN "end" >= CURRENT_DATE THEN 'ACTIVA'
        ELSE 'DESCONOCIDO'
    END as estado
FROM purchases 
ORDER BY created_at DESC;

-- 4. Verificar compras que deberían aparecer como activas
SELECT 
    id,
    customer,
    phone,
    service,
    start,
    "end",
    validated,
    created_at,
    ("end" - CURRENT_DATE) as dias_restantes
FROM purchases 
WHERE validated = true 
    AND "end" >= CURRENT_DATE
ORDER BY "end" ASC;

-- 5. Verificar si hay problemas con fechas
SELECT 
    'Fechas problemáticas' as tipo,
    COUNT(*) as cantidad
FROM purchases 
WHERE "end" IS NULL 
    OR start IS NULL
    OR "end" < start;

-- 6. Mostrar estadísticas por servicio
SELECT 
    service,
    COUNT(*) as total,
    COUNT(CASE WHEN validated = true AND "end" >= CURRENT_DATE THEN 1 END) as activas,
    COUNT(CASE WHEN validated = false THEN 1 END) as pendientes
FROM purchases 
GROUP BY service
ORDER BY total DESC;

