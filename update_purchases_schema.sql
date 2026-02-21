-- Actualizar esquema de compras para incluir credenciales de servicio
-- Ejecutar en Supabase SQL Editor

-- Agregar nuevas columnas a la tabla purchases
ALTER TABLE purchases
ADD COLUMN IF NOT EXISTS service_email VARCHAR(255),
ADD COLUMN IF NOT EXISTS service_password VARCHAR(255),
ADD COLUMN IF NOT EXISTS admin_notes TEXT,
ADD COLUMN IF NOT EXISTS approved_by VARCHAR(255),
ADD COLUMN IF NOT EXISTS approved_at TIMESTAMP WITH TIME ZONE;

-- Crear índices para mejorar rendimiento
CREATE INDEX IF NOT EXISTS idx_purchases_validated ON purchases(validated);
CREATE INDEX IF NOT EXISTS idx_purchases_phone ON purchases(phone);
CREATE INDEX IF NOT EXISTS idx_purchases_service ON purchases(service);

-- Agregar comentarios para documentar las nuevas columnas
COMMENT ON COLUMN purchases.service_email IS 'Email del servicio asignado por el admin';
COMMENT ON COLUMN purchases.service_password IS 'Contraseña del servicio asignada por el admin';
COMMENT ON COLUMN purchases.admin_notes IS 'Notas del administrador sobre la compra';
COMMENT ON COLUMN purchases.approved_by IS 'ID del administrador que aprobó la compra';
COMMENT ON COLUMN purchases.approved_at IS 'Fecha y hora de aprobación';

-- Verificar la estructura actualizada
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'purchases' 
ORDER BY ordinal_position;

-- Mostrar compras actuales para verificar
SELECT 
    id,
    customer,
    phone,
    service,
    start,
    end,
    validated,
    service_email,
    service_password,
    approved_by,
    approved_at,
    created_at
FROM purchases 
ORDER BY created_at DESC 
LIMIT 5;

