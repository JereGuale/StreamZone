-- Crear vista para servicios próximos a vencer
CREATE OR REPLACE VIEW expiring_services AS
SELECT 
    p.id as purchase_id,
    p.customer as customer_name,
    p.phone as customer_phone,
    p.service as service_name,
    p."end" as end_date,
    (p."end"::date - CURRENT_DATE) as days_remaining
FROM purchases p
WHERE p.validated = true 
    AND p."end"::date > CURRENT_DATE 
    AND p."end"::date <= CURRENT_DATE + INTERVAL '7 days'
ORDER BY p."end" ASC;

-- Verificar que la vista se creó correctamente
SELECT * FROM expiring_services LIMIT 5;
