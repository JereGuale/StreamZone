-- Script simple para crear la tabla admin_emails
-- Ejecutar este script en Supabase SQL Editor

-- Crear la tabla admin_emails
CREATE TABLE IF NOT EXISTS admin_emails (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Crear índices
CREATE INDEX IF NOT EXISTS idx_admin_emails_email ON admin_emails(email);
CREATE INDEX IF NOT EXISTS idx_admin_emails_active ON admin_emails(is_active);

-- Insertar el administrador principal
INSERT INTO admin_emails (email, password, is_active) 
VALUES ('gualejere@gmail.com', 'Admin_GUA_1234', true)
ON CONFLICT (email) DO NOTHING;

-- Verificar que se creó correctamente
SELECT 'Tabla admin_emails creada exitosamente' as status;
SELECT COUNT(*) as total_admins FROM admin_emails;

