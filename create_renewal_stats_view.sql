-- Crear vista para estadísticas de renovación
CREATE OR REPLACE VIEW renewal_stats AS
SELECT 
    COUNT(*) as total_purchases,
    0 as auto_renewal_enabled, -- Columna no existe aún
    COUNT(CASE WHEN "end"::date <= CURRENT_DATE + INTERVAL '7 days' AND "end"::date > CURRENT_DATE THEN 1 END) as expiring_this_week,
    COUNT(CASE WHEN "end"::date < CURRENT_DATE THEN 1 END) as expired_services
FROM purchases 
WHERE validated = true;

-- Verificar que la vista se creó correctamente
SELECT * FROM renewal_stats;
