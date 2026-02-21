-- Script simple para arreglar la función de aprobar compras
-- Ejecutar en Supabase SQL Editor

-- Agregar solo las columnas esenciales para aprobar compras
ALTER TABLE purchases
ADD COLUMN IF NOT EXISTS service_email VARCHAR(255),
ADD COLUMN IF NOT EXISTS service_password VARCHAR(255),
ADD COLUMN IF NOT EXISTS admin_notes TEXT,
ADD COLUMN IF NOT EXISTS approved_by VARCHAR(255),
ADD COLUMN IF NOT EXISTS approved_at TIMESTAMP WITH TIME ZONE;

-- Verificar que las columnas se agregaron correctamente
SELECT 
    column_name, 
    data_type, 
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'purchases' 
AND column_name IN ('service_email', 'service_password', 'admin_notes', 'approved_by', 'approved_at')
ORDER BY ordinal_position;

-- Mostrar una compra de ejemplo para verificar
SELECT id, customer, service, validated, service_email, service_password, approved_by
FROM purchases 
ORDER BY created_at DESC 
LIMIT 1;

