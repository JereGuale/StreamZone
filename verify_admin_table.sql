-- Script para verificar y crear la tabla admin_emails si no existe
-- Primero crear la tabla si no existe
CREATE TABLE IF NOT EXISTS admin_emails (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Crear índices para búsquedas rápidas
CREATE INDEX IF NOT EXISTS idx_admin_emails_email ON admin_emails(email);
CREATE INDEX IF NOT EXISTS idx_admin_emails_active ON admin_emails(is_active);

-- Verificar la estructura de la tabla
SELECT 
    table_name,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'admin_emails'
ORDER BY ordinal_position;

-- Verificar que la tabla se creó correctamente
SELECT 
    'admin_emails' as tabla,
    COUNT(*) as total_registros
FROM admin_emails;

-- Mostrar todos los administradores (si existen)
SELECT 
    email,
    is_active,
    created_at
FROM admin_emails
ORDER BY created_at DESC;
