-- ========================================
-- PROBAR INSERCIÓN EXACTA COMO LA APLICACIÓN
-- ========================================
-- Ejecutar en Supabase SQL Editor

-- 1. Probar inserción con datos exactos como los envía la aplicación
DO $$
DECLARE
    test_id UUID;
    error_message TEXT;
BEGIN
    -- Intentar insertar con la estructura exacta que envía la aplicación
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
        approved_at,
        auto_renewal,
        renewal_reminder_sent,
        renewal_attempts,
        last_renewal_attempt,
        renewal_status,
        original_purchase_id,
        is_renewal
    ) VALUES (
        'Cliente Test Manual',
        '+593999999999',
        'Netflix',
        CURRENT_DATE,
        CURRENT_DATE + INTERVAL '1 month',
        1,
        true,
        'test@netflix.com_' || EXTRACT(EPOCH FROM NOW()),
        'password123',
        'Notas de prueba',
        'admin',
        NOW(),
        false,
        false,
        0,
        NULL,
        'none',
        NULL,
        false
    ) RETURNING id INTO test_id;
    
    RAISE NOTICE '✅ Inserción exitosa con ID: %', test_id;
    
    -- Mostrar el registro insertado
    SELECT 
        id,
        customer,
        phone,
        service,
        validated,
        service_email,
        approved_by,
        created_at
    FROM purchases 
    WHERE id = test_id;
    
    -- Limpiar el registro de prueba
    DELETE FROM purchases WHERE id = test_id;
    RAISE NOTICE '✅ Registro de prueba eliminado';
    
EXCEPTION
    WHEN OTHERS THEN
        error_message := SQLERRM;
        RAISE NOTICE '❌ Error en inserción: %', error_message;
        RAISE NOTICE '❌ Código de error: %', SQLSTATE;
        
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
                'Test Minimo',
                '+593888888888',
                'Disney+',
                CURRENT_DATE,
                CURRENT_DATE + INTERVAL '1 month',
                1,
                true
            );
            RAISE NOTICE '✅ Inserción mínima exitosa';
        EXCEPTION
            WHEN OTHERS THEN
                RAISE NOTICE '❌ Error también en inserción mínima: %', SQLERRM;
        END;
END $$;

-- 2. Verificar el estado actual de la tabla
SELECT 
    COUNT(*) as total_compras,
    COUNT(CASE WHEN validated = true THEN 1 END) as compras_validadas,
    COUNT(CASE WHEN validated = false THEN 1 END) as compras_pendientes
FROM purchases;

-- 3. Mostrar las últimas compras
SELECT 
    id,
    customer,
    phone,
    service,
    validated,
    service_email,
    created_at
FROM purchases 
ORDER BY created_at DESC 
LIMIT 5;

