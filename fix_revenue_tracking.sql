-- FIX: Columnas faltantes para el rastreo de ingresos
-- Ejecutar este script en el SQL EDITOR de Supabase (https://supabase.com/dashboard/project/gfjwebngyzfftakbbmji/sql/new)

-- 1. Asegurar que la columna 'price' existe en la tabla 'purchases'
ALTER TABLE purchases 
ADD COLUMN IF NOT EXISTS price NUMERIC DEFAULT 0;

-- 2. Agregar comentario explicativo
COMMENT ON COLUMN purchases.price IS 'Precio total de la venta (capital ingresado)';

-- 3. ACTUALIZACIÓN RETROACTIVA: Intentar poner precios a las compras que ya existen
-- Esto buscará en la tabla de servicios y multiplicará por los meses
UPDATE purchases p
SET price = s.price * p.months
FROM services s
WHERE p.service = s.name 
AND (p.price IS NULL OR p.price = 0);

-- 4. ACTUALIZACIÓN PARA COMBOS (Precios aproximados según catálogo actual)
UPDATE purchases SET price = 6.0 * months WHERE service = 'Netflix + Disney Estándar' AND (price IS NULL OR price = 0);
UPDATE purchases SET price = 6.5 * months WHERE service = 'Netflix + Disney Premium' AND (price IS NULL OR price = 0);
UPDATE purchases SET price = 5.5 * months WHERE service = 'Netflix + Max' AND (price IS NULL OR price = 0);
UPDATE purchases SET price = 5.5 * months WHERE service = 'Netflix + Prime Video' AND (price IS NULL OR price = 0);
UPDATE purchases SET price = 5.75 * months WHERE service = 'Prime Video + Disney Estándar' AND (price IS NULL OR price = 0);
UPDATE purchases SET price = 6.0 * months WHERE service = 'Disney Premium + Max' AND (price IS NULL OR price = 0);
UPDATE purchases SET price = 5.5 * months WHERE service = 'Max + Prime Video' AND (price IS NULL OR price = 0);
UPDATE purchases SET price = 7.0 * months WHERE service = 'Paramount + Max + Prime Video' AND (price IS NULL OR price = 0);
UPDATE purchases SET price = 11.5 * months WHERE service = 'Netflix + Max + Disney + Prime + Paramount' AND (price IS NULL OR price = 0);
UPDATE purchases SET price = 6.5 * months WHERE service = 'Spotify + Netflix' AND (price IS NULL OR price = 0);
UPDATE purchases SET price = 6.5 * months WHERE service = 'Spotify + Disney Premium' AND (price IS NULL OR price = 0);
UPDATE purchases SET price = 6.0 * months WHERE service = 'Spotify + Prime Video' AND (price IS NULL OR price = 0);
UPDATE purchases SET price = 8.0 * months WHERE service = 'Netflix + Spotify + Disney Standar' AND (price IS NULL OR price = 0);
UPDATE purchases SET price = 8.0 * months WHERE service = 'Netflix + Spotify + Prime Video' AND (price IS NULL OR price = 0);

-- 5. Verificar que se haya aplicado
SELECT customer, service, months, price, created_at 
FROM purchases 
ORDER BY created_at DESC 
LIMIT 10;
