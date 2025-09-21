-- Actualizar administrador principal a gualejeremi@gmail.com
-- Desactivar el admin anterior
UPDATE admin_emails 
SET is_active = FALSE 
WHERE email = 'gualejere@gmail.com';

-- Activar y actualizar el nuevo admin principal
UPDATE admin_emails 
SET 
  password = 'Jeremias_012.@',
  is_active = TRUE 
WHERE email = 'gualejeremi@gmail.com';

-- Si no existe, crearlo
INSERT INTO admin_emails (email, password, is_active) 
VALUES ('gualejeremi@gmail.com', 'Jeremias_012.@', TRUE)
ON CONFLICT (email) DO UPDATE SET 
  password = 'Jeremias_012.@',
  is_active = TRUE;

-- Verificar el resultado
SELECT email, password, is_active, created_at 
FROM admin_emails 
ORDER BY is_active DESC, created_at ASC;
