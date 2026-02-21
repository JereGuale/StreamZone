-- ========================================
-- VERIFICAR TABLA PURCHASES
-- ========================================
-- Ejecutar en Supabase SQL Editor

-- 1. Verificar si la tabla purchases existe
SELECT 
    table_name,
    table_type
FROM information_schema.tables 
WHERE table_name = 'purchases';

-- 2. Si existe, mostrar su estructura
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default,
    character_maximum_length
FROM information_schema.columns 
WHERE table_name = 'purchases' 
ORDER BY ordinal_position;

-- 3. Verificar políticas RLS
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

-- 4. Verificar si hay datos en la tabla
SELECT 
    COUNT(*) as total_compras,
    COUNT(CASE WHEN validated = true THEN 1 END) as compras_validadas,
    COUNT(CASE WHEN validated = false THEN 1 END) as compras_pendientes
FROM purchases;

-- 5. Mostrar las últimas 5 compras
SELECT 
    id,
    customer,
    phone,
    service,
    start,
    "end",
    validated,
    created_at
FROM purchases 
ORDER BY created_at DESC 
LIMIT 5;

-- 6. Verificar permisos de la tabla
SELECT 
    grantee,
    privilege_type,
    is_grantable
FROM information_schema.table_privileges 
WHERE table_name = 'purchases';

