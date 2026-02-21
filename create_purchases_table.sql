-- ========================================
-- CREAR TABLA PURCHASES COMPLETA
-- ========================================
-- Ejecutar en Supabase SQL Editor

-- 1. Crear la tabla purchases si no existe
CREATE TABLE IF NOT EXISTS purchases (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    customer VARCHAR(255) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    service VARCHAR(255) NOT NULL,
    start DATE NOT NULL,
    "end" DATE NOT NULL,
    months INTEGER NOT NULL DEFAULT 1,
    validated BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Columnas para credenciales de servicio
    service_email VARCHAR(255),
    service_password VARCHAR(255),
    admin_notes TEXT,
    approved_by VARCHAR(255),
    approved_at TIMESTAMP WITH TIME ZONE,
    
    -- Columnas para sistema de renovaciones
    auto_renewal BOOLEAN DEFAULT false,
    renewal_reminder_sent BOOLEAN DEFAULT false,
    renewal_attempts INTEGER DEFAULT 0,
    last_renewal_attempt TIMESTAMP WITH TIME ZONE,
    renewal_status VARCHAR(20) DEFAULT 'none' CHECK (renewal_status IN ('none', 'pending', 'success', 'failed')),
    original_purchase_id UUID,
    is_renewal BOOLEAN DEFAULT false
);

-- 2. Crear índices para mejorar rendimiento
CREATE INDEX IF NOT EXISTS idx_purchases_validated ON purchases(validated);
CREATE INDEX IF NOT EXISTS idx_purchases_phone ON purchases(phone);
CREATE INDEX IF NOT EXISTS idx_purchases_service ON purchases(service);
CREATE INDEX IF NOT EXISTS idx_purchases_end_date ON purchases("end");
CREATE INDEX IF NOT EXISTS idx_purchases_auto_renewal ON purchases(auto_renewal);
CREATE INDEX IF NOT EXISTS idx_purchases_renewal_status ON purchases(renewal_status);

-- 3. Habilitar RLS (Row Level Security)
ALTER TABLE purchases ENABLE ROW LEVEL SECURITY;

-- 4. Crear políticas RLS básicas
-- Política para permitir lectura a todos los usuarios autenticados
CREATE POLICY IF NOT EXISTS "Allow authenticated users to read purchases" ON purchases
    FOR SELECT USING (auth.role() = 'authenticated');

-- Política para permitir inserción a usuarios autenticados
CREATE POLICY IF NOT EXISTS "Allow authenticated users to insert purchases" ON purchases
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Política para permitir actualización a usuarios autenticados
CREATE POLICY IF NOT EXISTS "Allow authenticated users to update purchases" ON purchases
    FOR UPDATE USING (auth.role() = 'authenticated');

-- Política para permitir eliminación a usuarios autenticados
CREATE POLICY IF NOT EXISTS "Allow authenticated users to delete purchases" ON purchases
    FOR DELETE USING (auth.role() = 'authenticated');

-- 5. Verificar la estructura de la tabla
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'purchases' 
ORDER BY ordinal_position;

-- 6. Insertar una compra de prueba para verificar que funciona
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
    'Cliente de Prueba',
    '+593999999999',
    'Netflix',
    CURRENT_DATE,
    CURRENT_DATE + INTERVAL '1 month',
    1,
    true,
    'test@netflix.com',
    'password123',
    'Compra de prueba creada automáticamente',
    'admin',
    NOW()
) ON CONFLICT DO NOTHING;

-- 7. Verificar que la inserción funcionó
SELECT 
    id,
    customer,
    phone,
    service,
    start,
    "end",
    validated,
    service_email,
    approved_by,
    created_at
FROM purchases 
ORDER BY created_at DESC 
LIMIT 5;

-- 8. Mostrar estadísticas de la tabla
SELECT 
    'purchases' as tabla,
    COUNT(*) as total_registros,
    COUNT(CASE WHEN validated = true THEN 1 END) as compras_validadas,
    COUNT(CASE WHEN validated = false THEN 1 END) as compras_pendientes
FROM purchases;

