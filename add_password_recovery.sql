-- Script para agregar funcionalidad de recuperación de contraseña
-- Ejecutar en Supabase SQL Editor

-- 1. Agregar columnas necesarias a la tabla users
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS password VARCHAR(255),
ADD COLUMN IF NOT EXISTS reset_token VARCHAR(255),
ADD COLUMN IF NOT EXISTS reset_token_expires TIMESTAMP WITH TIME ZONE;

-- 2. Crear índices para mejor rendimiento
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_reset_token ON users(reset_token);

-- 3. Actualizar usuarios existentes con contraseñas por defecto (si no tienen)
UPDATE users 
SET password = '123456' 
WHERE password IS NULL;

-- 4. Crear función para limpiar tokens expirados (opcional)
CREATE OR REPLACE FUNCTION clean_expired_tokens()
RETURNS void AS $$
BEGIN
  UPDATE users 
  SET reset_token = NULL, reset_token_expires = NULL 
  WHERE reset_token_expires < NOW();
END;
$$ LANGUAGE plpgsql;

-- 5. Comentarios para documentar
COMMENT ON COLUMN users.password IS 'Contraseña del usuario para login';
COMMENT ON COLUMN users.reset_token IS 'Token temporal para recuperación de contraseña';
COMMENT ON COLUMN users.reset_token_expires IS 'Fecha de expiración del token de recuperación';

-- 6. Verificar que las columnas se agregaron correctamente
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'users' 
AND column_name IN ('password', 'reset_token', 'reset_token_expires');

