-- ========================================
-- SOLUCIONAR RESTRICCIÓN DE CLAVE FORÁNEA
-- ========================================
-- Ejecutar en Supabase SQL Editor

-- 1. Verificar la restricción de clave foránea
SELECT 
    tc.constraint_name,
    tc.table_name,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc 
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
    AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
    AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY' 
    AND tc.table_name = 'purchases';

-- 2. OPCIÓN 1: Eliminar la restricción de clave foránea (RECOMENDADO)
ALTER TABLE purchases DROP CONSTRAINT IF EXISTS purchases_phone_fkey;

-- 3. OPCIÓN 2: Crear usuario automáticamente antes de insertar compra
-- (Si prefieres mantener la restricción, descomenta las siguientes líneas)

/*
-- Función para crear usuario automáticamente si no existe
CREATE OR REPLACE FUNCTION ensure_user_exists(
    user_phone TEXT,
    user_name TEXT DEFAULT 'Cliente Manual'
) RETURNS VOID AS $$
BEGIN
    -- Insertar usuario si no existe
    INSERT INTO users (phone, name, email, created_at)
    VALUES (
        user_phone, 
        user_name, 
        user_phone || '@streamzone.com',
        NOW()
    )
    ON CONFLICT (phone) DO NOTHING;
END;
$$ LANGUAGE plpgsql;

-- Trigger para crear usuario automáticamente antes de insertar compra
CREATE OR REPLACE FUNCTION create_user_before_purchase()
RETURNS TRIGGER AS $$
BEGIN
    -- Asegurar que el usuario existe
    PERFORM ensure_user_exists(NEW.phone, NEW.customer);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER ensure_user_exists_trigger
    BEFORE INSERT ON purchases
    FOR EACH ROW
    EXECUTE FUNCTION create_user_before_purchase();
*/

-- 4. Probar inserción después de eliminar la restricción
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
    'Test Cliente Manual',
    '+593999999999',
    'Netflix',
    CURRENT_DATE,
    CURRENT_DATE + INTERVAL '1 month',
    1,
    true,
    'test@netflix.com',
    'password123',
    'Compra manual de prueba',
    'admin',
    NOW()
);

-- 5. Verificar que la inserción funcionó
SELECT 
    id,
    customer,
    phone,
    service,
    validated,
    service_email,
    created_at
FROM purchases 
WHERE customer = 'Test Cliente Manual'
ORDER BY created_at DESC;

-- 6. Limpiar registro de prueba
DELETE FROM purchases WHERE customer = 'Test Cliente Manual';

-- 7. Verificar que se eliminó
SELECT COUNT(*) as total_after_cleanup 
FROM purchases 
WHERE customer = 'Test Cliente Manual';

