-- ========================================
-- DIAGNOSTICAR ERROR 409 MÁS PROFUNDAMENTE
-- ========================================
-- Ejecutar en Supabase SQL Editor

-- 1. Verificar políticas RLS que puedan estar bloqueando inserciones
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'purchases';

-- 2. Verificar si hay triggers que puedan estar causando conflictos
SELECT 
    trigger_name,
    event_manipulation,
    action_timing,
    action_statement
FROM information_schema.triggers 
WHERE event_object_table = 'purchases';

-- 3. Verificar permisos de la tabla
SELECT 
    grantee,
    privilege_type,
    is_grantable
FROM information_schema.table_privileges 
WHERE table_name = 'purchases';

-- 4. Probar inserción simple para ver si funciona
INSERT INTO purchases (
    customer, 
    phone, 
    service, 
    start, 
    "end", 
    months, 
    validated
) VALUES (
    'Test Cliente ' || EXTRACT(EPOCH FROM NOW()),
    '+593' || (RANDOM() * 1000000000)::INT,
    'Netflix',
    CURRENT_DATE,
    CURRENT_DATE + INTERVAL '1 month',
    1,
    true
);

-- 5. Verificar que la inserción funcionó
SELECT 
    id,
    customer,
    phone,
    service,
    validated,
    created_at
FROM purchases 
ORDER BY created_at DESC 
LIMIT 3;

-- 6. Verificar si hay funciones que validen datos
SELECT 
    routine_name,
    routine_definition
FROM information_schema.routines 
WHERE routine_name LIKE '%purchase%'
    OR routine_definition LIKE '%purchases%';

-- 7. Verificar si hay restricciones CHECK que puedan estar fallando
SELECT 
    conname as constraint_name,
    contype as constraint_type,
    pg_get_constraintdef(oid) as constraint_definition
FROM pg_constraint 
WHERE conrelid = 'purchases'::regclass
    AND contype = 'c';

-- 8. Verificar si hay índices que puedan estar causando problemas
SELECT 
    indexname,
    indexdef,
    indisunique
FROM pg_indexes pi
JOIN pg_index i ON pi.indexname = i.indexrelid::regclass::text
WHERE pi.tablename = 'purchases';

