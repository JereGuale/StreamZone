-- ========================================
-- CORREGIR FECHAS DE COMPRAS EXISTENTES
-- ========================================
-- Ejecutar en Supabase SQL Editor

-- 1. Verificar las compras actuales y sus fechas
SELECT 
    id,
    customer,
    service,
    start,
    "end",
    months,
    ("end"::date - start::date) as dias_actuales
FROM purchases 
WHERE validated = true
ORDER BY created_at DESC;

-- 2. Corregir las fechas de fin para que sean exactamente 30 días por mes
UPDATE purchases 
SET "end" = (start::date + INTERVAL '30 days' * months)::date
WHERE validated = true 
    AND months = 1 
    AND ("end"::date - start::date) = 31;

-- 3. Para compras de 2 meses, corregir a 60 días
UPDATE purchases 
SET "end" = (start::date + INTERVAL '30 days' * months)::date
WHERE validated = true 
    AND months = 2 
    AND ("end"::date - start::date) = 61;

-- 4. Para compras de 3 meses, corregir a 90 días
UPDATE purchases 
SET "end" = (start::date + INTERVAL '30 days' * months)::date
WHERE validated = true 
    AND months = 3 
    AND ("end"::date - start::date) = 91;

-- 5. Para compras de 6 meses, corregir a 180 días
UPDATE purchases 
SET "end" = (start::date + INTERVAL '30 days' * months)::date
WHERE validated = true 
    AND months = 6 
    AND ("end"::date - start::date) = 181;

-- 6. Verificar las correcciones
SELECT 
    id,
    customer,
    service,
    start,
    "end",
    months,
    ("end"::date - start::date) as dias_corregidos
FROM purchases 
WHERE validated = true
ORDER BY created_at DESC;

-- 7. Mostrar estadísticas finales
SELECT 
    months,
    COUNT(*) as cantidad,
    ("end"::date - start::date) as dias_promedio
FROM purchases 
WHERE validated = true
GROUP BY months, ("end"::date - start::date)
ORDER BY months;
