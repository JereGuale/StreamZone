-- ========================================
-- DIAGNOSTICAR CONEXIÓN Y PERMISOS
-- ========================================
-- Ejecutar en Supabase SQL Editor

-- 1. Verificar el usuario actual y permisos
SELECT 
    current_user as usuario_actual,
    current_database() as base_datos_actual,
    current_schema() as esquema_actual;

-- 2. Verificar permisos específicos en la tabla purchases
SELECT 
    table_name,
    privilege_type,
    is_grantable,
    grantee
FROM information_schema.table_privileges 
WHERE table_name = 'purchases'
ORDER BY grantee, privilege_type;

-- 3. Verificar si hay restricciones CHECK
SELECT 
    conname as constraint_name,
    contype as constraint_type,
    pg_get_constraintdef(oid) as constraint_definition
FROM pg_constraint 
WHERE conrelid = 'purchases'::regclass
    AND contype = 'c';

-- 4. Verificar si hay triggers en la tabla
SELECT 
    trigger_name,
    event_manipulation,
    action_timing,
    action_statement
FROM information_schema.triggers 
WHERE event_object_table = 'purchases';

-- 5. Probar inserción con manejo de errores detallado
DO $$
DECLARE
    test_id UUID;
    error_detail TEXT;
    error_hint TEXT;
    error_message TEXT;
BEGIN
    -- Intentar inserción con datos exactos
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
        'Test Debug ' || EXTRACT(EPOCH FROM NOW()),
        '+593' || (RANDOM() * 1000000000)::INT,
        'Netflix',
        CURRENT_DATE,
        CURRENT_DATE + INTERVAL '1 month',
        1,
        true,
        'test@netflix.com_' || EXTRACT(EPOCH FROM NOW()),
        'password123',
        'Notas de debug',
        'admin',
        NOW()
    ) RETURNING id INTO test_id;
    
    RAISE NOTICE '✅ Inserción exitosa con ID: %', test_id;
    
    -- Mostrar el registro insertado
    PERFORM * FROM purchases WHERE id = test_id;
    
    -- Limpiar
    DELETE FROM purchases WHERE id = test_id;
    RAISE NOTICE '✅ Registro de prueba eliminado';
    
EXCEPTION
    WHEN OTHERS THEN
        GET STACKED DIAGNOSTICS 
            error_message = MESSAGE_TEXT,
            error_detail = PG_EXCEPTION_DETAIL,
            error_hint = PG_EXCEPTION_HINT;
            
        RAISE NOTICE '❌ Error SQLSTATE: %', SQLSTATE;
        RAISE NOTICE '❌ Mensaje: %', error_message;
        RAISE NOTICE '❌ Detalle: %', error_detail;
        RAISE NOTICE '❌ Hint: %', error_hint;
        
        -- Intentar con datos mínimos
        BEGIN
            INSERT INTO purchases (
                customer, 
                phone, 
                service, 
                start, 
                "end", 
                months, 
                validated
            ) VALUES (
                'Test Minimo ' || EXTRACT(EPOCH FROM NOW()),
                '+593' || (RANDOM() * 1000000000)::INT,
                'Disney+',
                CURRENT_DATE,
                CURRENT_DATE + INTERVAL '1 month',
                1,
                true
            );
            RAISE NOTICE '✅ Inserción mínima exitosa';
        EXCEPTION
            WHEN OTHERS THEN
                GET STACKED DIAGNOSTICS 
                    error_message = MESSAGE_TEXT,
                    error_detail = PG_EXCEPTION_DETAIL;
                RAISE NOTICE '❌ Error también en inserción mínima: %', error_message;
                RAISE NOTICE '❌ Detalle: %', error_detail;
        END;
END $$;

-- 6. Verificar el estado final de la tabla
SELECT 
    COUNT(*) as total_compras,
    MAX(created_at) as ultima_compra
FROM purchases;

