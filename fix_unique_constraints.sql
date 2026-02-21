-- ========================================
-- CORREGIR RESTRICCIONES UNIQUE QUE CAUSAN ERROR 409
-- ========================================
-- Ejecutar en Supabase SQL Editor

-- 1. Verificar todas las restricciones UNIQUE en la tabla purchases
SELECT 
    tc.constraint_name,
    tc.table_name,
    kcu.column_name,
    tc.constraint_type
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu 
    ON tc.constraint_name = kcu.constraint_name
    AND tc.table_schema = kcu.table_schema
WHERE tc.table_name = 'purchases' 
    AND tc.constraint_type = 'UNIQUE'
ORDER BY tc.constraint_name;

-- 2. Verificar índices únicos
SELECT 
    indexname,
    indexdef
FROM pg_indexes 
WHERE tablename = 'purchases' 
    AND indexdef LIKE '%UNIQUE%';

-- 3. Si hay restricciones UNIQUE problemáticas, eliminarlas
-- (Solo ejecutar si encuentras restricciones que causen conflictos)

-- Ejemplo: Si hay una restricción UNIQUE en service_email que causa problemas
-- ALTER TABLE purchases DROP CONSTRAINT IF EXISTS purchases_service_email_key;

-- 4. Verificar si hay datos duplicados que causen conflictos
SELECT 
    service_email,
    COUNT(*) as duplicados
FROM purchases 
WHERE service_email IS NOT NULL 
GROUP BY service_email 
HAVING COUNT(*) > 1;

-- 5. Verificar políticas RLS que puedan estar bloqueando inserciones
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

-- 6. Crear una política RLS más permisiva para inserciones
DROP POLICY IF EXISTS "Allow authenticated users to insert purchases" ON purchases;

CREATE POLICY "Allow authenticated users to insert purchases" ON purchases
    FOR INSERT WITH CHECK (true);

-- 7. Verificar permisos de la tabla
SELECT 
    grantee,
    privilege_type,
    is_grantable
FROM information_schema.table_privileges 
WHERE table_name = 'purchases';

-- 8. Probar una inserción simple para verificar que funciona
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
) ON CONFLICT DO NOTHING;

-- 9. Verificar que la inserción funcionó
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

