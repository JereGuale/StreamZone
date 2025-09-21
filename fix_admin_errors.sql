-- Verificar estructura de la tabla admin_emails
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'admin_emails' 
ORDER BY ordinal_position;

-- Si la columna is_active no existe, agregarla
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'admin_emails' 
        AND column_name = 'is_active'
    ) THEN
        ALTER TABLE admin_emails ADD COLUMN is_active BOOLEAN DEFAULT true;
    END IF;
END $$;

-- Actualizar todos los administradores existentes para que estén activos
UPDATE admin_emails SET is_active = true WHERE is_active IS NULL;

-- Verificar el estado actual
SELECT email, is_active, created_at FROM admin_emails ORDER BY created_at DESC;

