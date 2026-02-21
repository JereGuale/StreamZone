-- ========================================
-- PROBAR INSERCIÓN DIRECTA EN SUPABASE
-- ========================================
-- Ejecutar en Supabase SQL Editor

-- 1. Probar inserción directa simple
INSERT INTO purchases (
    customer, 
    phone, 
    service, 
    start, 
    "end", 
    months, 
    validated
) VALUES (
    'Test Directo',
    '+593777777777',
    'Netflix',
    CURRENT_DATE,
    CURRENT_DATE + INTERVAL '1 month',
    1,
    true
);

-- 2. Verificar que se insertó
SELECT 
    id,
    customer,
    phone,
    service,
    validated,
    created_at
FROM purchases 
WHERE customer = 'Test Directo'
ORDER BY created_at DESC;

-- 3. Probar inserción con todos los campos como la aplicación
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
    'Test Completo',
    '+593666666666',
    'Disney+',
    CURRENT_DATE,
    CURRENT_DATE + INTERVAL '1 month',
    1,
    true,
    'test@disney.com_' || EXTRACT(EPOCH FROM NOW()),
    'password123',
    'Notas de prueba completa',
    'admin',
    NOW()
);

-- 4. Verificar inserción completa
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
WHERE customer = 'Test Completo'
ORDER BY created_at DESC;

-- 5. Limpiar registros de prueba
DELETE FROM purchases WHERE customer IN ('Test Directo', 'Test Completo');

-- 6. Verificar limpieza
SELECT COUNT(*) as total_after_cleanup FROM purchases WHERE customer IN ('Test Directo', 'Test Completo');

