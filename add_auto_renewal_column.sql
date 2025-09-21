-- Agregar columna auto_renewal a la tabla purchases
ALTER TABLE purchases 
ADD COLUMN IF NOT EXISTS auto_renewal BOOLEAN DEFAULT FALSE;

-- Agregar otras columnas que puedan faltar
ALTER TABLE purchases 
ADD COLUMN IF NOT EXISTS renewal_reminder_sent BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS renewal_attempts INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS last_renewal_attempt TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS renewal_status TEXT DEFAULT 'none' CHECK (renewal_status IN ('none', 'pending', 'success', 'failed')),
ADD COLUMN IF NOT EXISTS original_purchase_id UUID,
ADD COLUMN IF NOT EXISTS is_renewal BOOLEAN DEFAULT FALSE;

-- Verificar que las columnas se agregaron correctamente
SELECT column_name, data_type, is_nullable, column_default 
FROM information_schema.columns 
WHERE table_name = 'purchases' 
AND column_name IN ('auto_renewal', 'renewal_reminder_sent', 'renewal_attempts', 'last_renewal_attempt', 'renewal_status', 'original_purchase_id', 'is_renewal')
ORDER BY column_name;

