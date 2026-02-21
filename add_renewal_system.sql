-- Sistema de renovaciones automáticas
-- Ejecutar en Supabase SQL Editor

-- Agregar columnas para el sistema de renovaciones
ALTER TABLE purchases
ADD COLUMN IF NOT EXISTS auto_renewal BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS renewal_reminder_sent BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS renewal_attempts INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS last_renewal_attempt TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS renewal_status VARCHAR(20) DEFAULT 'none', -- 'none', 'pending', 'success', 'failed'
ADD COLUMN IF NOT EXISTS original_purchase_id VARCHAR(255), -- Para rastrear renovaciones
ADD COLUMN IF NOT EXISTS is_renewal BOOLEAN DEFAULT false;

-- Crear tabla para historial de renovaciones
CREATE TABLE IF NOT EXISTS renewal_history (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    purchase_id UUID REFERENCES purchases(id) ON DELETE CASCADE,
    renewal_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    previous_end_date DATE,
    new_end_date DATE,
    renewal_type VARCHAR(20) DEFAULT 'manual', -- 'manual', 'auto', 'admin'
    status VARCHAR(20) DEFAULT 'success', -- 'success', 'failed', 'pending'
    admin_notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Crear índices para mejorar rendimiento
CREATE INDEX IF NOT EXISTS idx_purchases_auto_renewal ON purchases(auto_renewal);
CREATE INDEX IF NOT EXISTS idx_purchases_end_date ON purchases(end);
CREATE INDEX IF NOT EXISTS idx_purchases_renewal_status ON purchases(renewal_status);
CREATE INDEX IF NOT EXISTS idx_renewal_history_purchase_id ON renewal_history(purchase_id);
CREATE INDEX IF NOT EXISTS idx_renewal_history_renewal_date ON renewal_history(renewal_date);

-- Función para verificar servicios próximos a vencer (7 días antes)
CREATE OR REPLACE FUNCTION get_expiring_services(days_ahead INTEGER DEFAULT 7)
RETURNS TABLE (
    purchase_id UUID,
    customer_name VARCHAR,
    customer_phone VARCHAR,
    service_name VARCHAR,
    end_date DATE,
    days_remaining INTEGER
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        p.id,
        p.customer,
        p.phone,
        p.service,
        p.end::DATE,
        (p.end::DATE - CURRENT_DATE)::INTEGER as days_remaining
    FROM purchases p
    WHERE p.validated = true 
    AND p.end::DATE BETWEEN CURRENT_DATE AND (CURRENT_DATE + INTERVAL '1 day' * days_ahead)
    ORDER BY p.end::DATE ASC;
END;
$$ LANGUAGE plpgsql;

-- Función para crear renovación automática
CREATE OR REPLACE FUNCTION create_renewal(
    purchase_uuid UUID,
    renewal_months INTEGER,
    admin_user VARCHAR DEFAULT 'system'
)
RETURNS UUID AS $$
DECLARE
    original_purchase RECORD;
    new_purchase_id UUID;
    new_start_date DATE;
    new_end_date DATE;
BEGIN
    -- Obtener información de la compra original
    SELECT * INTO original_purchase FROM purchases WHERE id = purchase_uuid;
    
    IF original_purchase.id IS NULL THEN
        RAISE EXCEPTION 'Purchase not found';
    END IF;
    
    -- Calcular nuevas fechas
    new_start_date := original_purchase.end::DATE;
    new_end_date := new_start_date + INTERVAL '1 month' * renewal_months;
    
    -- Crear nueva compra (renovación)
    INSERT INTO purchases (
        customer, phone, service, start, end, months, 
        validated, service_email, service_password, admin_notes,
        approved_by, approved_at, auto_renewal, is_renewal, original_purchase_id
    ) VALUES (
        original_purchase.customer,
        original_purchase.phone,
        original_purchase.service,
        new_start_date::TEXT,
        new_end_date::TEXT,
        renewal_months,
        true, -- Las renovaciones se aprueban automáticamente
        original_purchase.service_email,
        original_purchase.service_password,
        'Renovación automática - ' || original_purchase.admin_notes,
        admin_user,
        NOW()::TEXT,
        original_purchase.auto_renewal,
        true,
        purchase_uuid
    ) RETURNING id INTO new_purchase_id;
    
    -- Registrar en historial de renovaciones
    INSERT INTO renewal_history (
        purchase_id, previous_end_date, new_end_date, 
        renewal_type, status, admin_notes
    ) VALUES (
        purchase_uuid, original_purchase.end::DATE, new_end_date,
        'auto', 'success', 'Renovación automática creada'
    );
    
    -- Actualizar estado de renovación en compra original
    UPDATE purchases 
    SET renewal_status = 'success',
        renewal_attempts = renewal_attempts + 1,
        last_renewal_attempt = NOW()
    WHERE id = purchase_uuid;
    
    RETURN new_purchase_id;
END;
$$ LANGUAGE plpgsql;

-- Función para notificar servicios próximos a vencer
CREATE OR REPLACE FUNCTION notify_expiring_services()
RETURNS INTEGER AS $$
DECLARE
    expiring_count INTEGER;
BEGIN
    -- Actualizar flag de notificación enviada para servicios que vencen en 3 días
    UPDATE purchases 
    SET renewal_reminder_sent = true
    WHERE validated = true 
    AND end::DATE = (CURRENT_DATE + INTERVAL '3 days')
    AND renewal_reminder_sent = false;
    
    -- Contar servicios que vencen en los próximos 7 días
    SELECT COUNT(*) INTO expiring_count
    FROM purchases 
    WHERE validated = true 
    AND end::DATE BETWEEN CURRENT_DATE AND (CURRENT_DATE + INTERVAL '7 days');
    
    RETURN expiring_count;
END;
$$ LANGUAGE plpgsql;

-- Agregar comentarios para documentar las nuevas columnas
COMMENT ON COLUMN purchases.auto_renewal IS 'Indica si el servicio se renueva automáticamente';
COMMENT ON COLUMN purchases.renewal_reminder_sent IS 'Indica si se envió notificación de vencimiento';
COMMENT ON COLUMN purchases.renewal_attempts IS 'Número de intentos de renovación realizados';
COMMENT ON COLUMN purchases.last_renewal_attempt IS 'Fecha del último intento de renovación';
COMMENT ON COLUMN purchases.renewal_status IS 'Estado de la renovación: none, pending, success, failed';
COMMENT ON COLUMN purchases.original_purchase_id IS 'ID de la compra original (para renovaciones)';
COMMENT ON COLUMN purchases.is_renewal IS 'Indica si esta compra es una renovación';

-- Verificar la estructura actualizada
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'purchases' 
AND column_name IN ('auto_renewal', 'renewal_reminder_sent', 'renewal_attempts', 'last_renewal_attempt', 'renewal_status', 'original_purchase_id', 'is_renewal')
ORDER BY ordinal_position;

-- Mostrar servicios próximos a vencer (prueba)
SELECT * FROM get_expiring_services(7);

-- Mostrar estadísticas de renovaciones
SELECT 
    COUNT(*) as total_purchases,
    COUNT(*) FILTER (WHERE auto_renewal = true) as auto_renewal_enabled,
    COUNT(*) FILTER (WHERE is_renewal = true) as renewal_purchases,
    COUNT(*) FILTER (WHERE end::DATE < CURRENT_DATE) as expired_services
FROM purchases;

