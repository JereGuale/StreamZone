-- Script SIMPLE para crear tabla admin_emails
-- Ejecutar SOLO este script en Supabase

-- Eliminar tabla si existe
DROP TABLE IF EXISTS admin_emails;

-- Crear tabla
CREATE TABLE admin_emails (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insertar admin principal
INSERT INTO admin_emails (email, password) 
VALUES ('gualejere@gmail.com', 'Admin_GUA_1234');

-- Verificar
SELECT 'Tabla creada' as resultado;
SELECT * FROM admin_emails;
