-- Script para arreglar la tabla admin_emails
-- Ejecutar este script completo en Supabase SQL Editor

-- Paso 1: Eliminar la tabla si existe (para empezar limpio)
DROP TABLE IF EXISTS admin_emails CASCADE;

-- Paso 2: Crear la tabla admin_emails desde cero
CREATE TABLE admin_emails (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Paso 3: Crear índices
CREATE INDEX idx_admin_emails_email ON admin_emails(email);
CREATE INDEX idx_admin_emails_active ON admin_emails(is_active);

-- Paso 4: Insertar el administrador principal
INSERT INTO admin_emails (email, password, is_active) 
VALUES ('gualejere@gmail.com', 'Admin_GUA_1234', true);

-- Paso 5: Verificar que todo funciona
SELECT '✅ Tabla admin_emails creada exitosamente' as status;

-- Paso 6: Mostrar la estructura de la tabla
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'admin_emails'
ORDER BY ordinal_position;

-- Paso 7: Mostrar los datos
SELECT 
    email,
    is_active,
    created_at
FROM admin_emails;

