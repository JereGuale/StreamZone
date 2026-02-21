-- ========================================
-- DIAGNOSTICAR ERROR 409 ESPECÍFICAMENTE
-- ========================================
-- Ejecutar en Supabase SQL Editor

-- 1. Verificar si hay restricciones UNIQUE ocultas
SELECT 
    conname as constraint_name,
    contype as constraint_type,
    pg_get_constraintdef(oid) as constraint_definition
FROM pg_constraint 
WHERE conrelid = 'purchases'::regclass
    AND contype = 'u';

-- 2. Verificar todos los índices únicos
SELECT 
    indexname,
    indexdef,
    indisunique
FROM pg_indexes pi
JOIN pg_index i ON pi.indexname = i.indexrelid::regclass::text
WHERE pi.tablename = 'purchases'
    AND i.indisunique = true;

-- 3. Verificar si hay triggers que puedan estar causando conflictos
SELECT 
    trigger_name,
    event_manipulation,
    action_timing,
    action_statement
FROM information_schema.triggers 
WHERE event_object_table = 'purchases';

-- 4. Verificar si hay funciones que validen datos
SELECT 
    routine_name,
    routine_definition
FROM information_schema.routines 
WHERE routine_name LIKE '%purchase%'
    OR routine_definition LIKE '%purchases%';

-- 5. Probar inserción con datos mínimos para aislar el problema
DO $$
DECLARE
    test_id UUID;
BEGIN
    -- Intentar insertar con datos mínimos
    INSERT INTO purchases (
        customer, 
        phone, 
        service, 
        start, 
        "end", 
        months, 
        validated
    ) VALUES (
        'Test Debug',
        '+593999999999',
        'Netflix',
        CURRENT_DATE,
        CURRENT_DATE + INTERVAL '1 month',
        1,
        true
    ) RETURNING id INTO test_id;
    
    RAISE NOTICE 'Inserción exitosa con ID: %', test_id;
    
    -- Limpiar el registro de prueba
    DELETE FROM purchases WHERE id = test_id;
    
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Error en inserción: %', SQLERRM;
END $$;

-- 6. Verificar si el problema está en las columnas opcionales
DO $$
DECLARE
    test_id UUID;
BEGIN
    -- Intentar insertar con todas las columnas opcionales
    INSERT INTO purchases (
        customer, 
        phone, 
        service, 
        start, 
        "end", 
        months, 
        validated,
        service_email,
        service_password,
        admin_notes,
        approved_by,
        approved_at
    ) VALUES (
        'Test Debug Full',
        '+593999999998',
        'Disney+',
        CURRENT_DATE,
        CURRENT_DATE + INTERVAL '1 month',
        1,
        true,
        'test@disney.com',
        'password123',
        'Notas de prueba',
        'admin',
        NOW()
    ) RETURNING id INTO test_id;
    
    RAISE NOTICE 'Inserción completa exitosa con ID: %', test_id;
    
    -- Limpiar el registro de prueba
    DELETE FROM purchases WHERE id = test_id;
    
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Error en inserción completa: %', SQLERRM;
END $$;

-- 7. Verificar logs de errores recientes
SELECT 
    'Verificar logs de Supabase para errores 409' as mensaje;

