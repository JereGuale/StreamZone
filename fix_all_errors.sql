-- ========================================
-- SCRIPT PARA RESOLVER TODOS LOS ERRORES
-- ========================================

-- 1. Crear vista para servicios próximos a vencer
CREATE OR REPLACE VIEW expiring_services AS
SELECT 
    p.id as purchase_id,
    p.customer as customer_name,
    p.phone as customer_phone,
    p.service as service_name,
    p."end" as end_date,
    (p."end"::date - CURRENT_DATE) as days_remaining
FROM purchases p
WHERE p.validated = true 
    AND p."end"::date > CURRENT_DATE 
    AND p."end"::date <= CURRENT_DATE + INTERVAL '7 days'
ORDER BY p."end" ASC;

-- 2. Crear vista para estadísticas de renovación
CREATE OR REPLACE VIEW renewal_stats AS
SELECT 
    COUNT(*) as total_purchases,
    0 as auto_renewal_enabled, -- Columna no existe aún
    COUNT(CASE WHEN "end"::date <= CURRENT_DATE + INTERVAL '7 days' AND "end"::date > CURRENT_DATE THEN 1 END) as expiring_this_week,
    COUNT(CASE WHEN "end"::date < CURRENT_DATE THEN 1 END) as expired_services
FROM purchases 
WHERE validated = true;

-- 3. Arreglar tabla de administradores
DO $$ 
BEGIN
    -- Agregar columna is_active si no existe
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'admin_emails' 
        AND column_name = 'is_active'
    ) THEN
        ALTER TABLE admin_emails ADD COLUMN is_active BOOLEAN DEFAULT true;
    END IF;
END $$;

-- 4. Actualizar administradores existentes
UPDATE admin_emails SET is_active = true WHERE is_active IS NULL;

-- 5. Verificar que todo funciona
SELECT 'expiring_services' as view_name, COUNT(*) as record_count FROM expiring_services
UNION ALL
SELECT 'renewal_stats' as view_name, COUNT(*) as record_count FROM renewal_stats
UNION ALL
SELECT 'admin_emails' as table_name, COUNT(*) as record_count FROM admin_emails;

-- 6. Mostrar administradores activos
SELECT email, is_active, created_at FROM admin_emails ORDER BY created_at DESC;
