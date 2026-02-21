-- ========================================
-- ARREGLAR ERROR DE TIPO DE DATO EN VISTA
-- ========================================

-- 1. Eliminar las vistas existentes para recrearlas
DROP VIEW IF EXISTS renewal_stats CASCADE;
DROP VIEW IF EXISTS expiring_services CASCADE;

-- 2. Crear función get_expiring_services
CREATE OR REPLACE FUNCTION get_expiring_services(days_ahead INTEGER DEFAULT 7)
RETURNS TABLE (
    purchase_id UUID,
    customer_name TEXT,
    customer_phone TEXT,
    service_name TEXT,
    end_date DATE,
    days_remaining INTEGER
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        p.id as purchase_id,
        p.customer as customer_name,
        p.phone as customer_phone,
        p.service as service_name,
        p."end"::date as end_date,
        (p."end"::date - CURRENT_DATE) as days_remaining
    FROM purchases p
    WHERE p.validated = true 
        AND p."end"::date > CURRENT_DATE 
        AND p."end"::date <= CURRENT_DATE + INTERVAL '1 day' * days_ahead
    ORDER BY p."end" ASC;
END;
$$ LANGUAGE plpgsql;

-- 3. Agregar columnas faltantes a purchases
ALTER TABLE purchases 
ADD COLUMN IF NOT EXISTS auto_renewal BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS renewal_reminder_sent BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS renewal_attempts INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS last_renewal_attempt TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS renewal_status TEXT DEFAULT 'none' CHECK (renewal_status IN ('none', 'pending', 'success', 'failed')),
ADD COLUMN IF NOT EXISTS original_purchase_id UUID,
ADD COLUMN IF NOT EXISTS is_renewal BOOLEAN DEFAULT FALSE;

-- 4. Recrear vista expiring_services
CREATE VIEW expiring_services AS
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

-- 5. Recrear vista renewal_stats con tipos de dato correctos
CREATE VIEW renewal_stats AS
SELECT 
    COUNT(*)::INTEGER as total_purchases,
    COUNT(CASE WHEN auto_renewal = true THEN 1 END)::INTEGER as auto_renewal_enabled,
    COUNT(CASE WHEN "end"::date <= CURRENT_DATE + INTERVAL '7 days' AND "end"::date > CURRENT_DATE THEN 1 END)::INTEGER as expiring_this_week,
    COUNT(CASE WHEN "end"::date < CURRENT_DATE THEN 1 END)::INTEGER as expired_services
FROM purchases 
WHERE validated = true;

-- 6. Verificar que todo se creó correctamente
SELECT 'get_expiring_services function' as item, 'created' as status
UNION ALL
SELECT 'auto_renewal column' as item, 
    CASE WHEN EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'purchases' AND column_name = 'auto_renewal') 
    THEN 'exists' ELSE 'missing' END as status
UNION ALL
SELECT 'expiring_services view' as item, 
    CASE WHEN EXISTS (SELECT 1 FROM information_schema.views WHERE table_name = 'expiring_services') 
    THEN 'exists' ELSE 'missing' END as status
UNION ALL
SELECT 'renewal_stats view' as item, 
    CASE WHEN EXISTS (SELECT 1 FROM information_schema.views WHERE table_name = 'renewal_stats') 
    THEN 'exists' ELSE 'missing' END as status;



