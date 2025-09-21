-- Crear función para obtener servicios próximos a vencer
CREATE OR REPLACE FUNCTION get_expiring_services(days_ahead INTEGER DEFAULT 7)
RETURNS TABLE (
    purchase_id UUID,
    customer_name TEXT,
    customer_phone TEXT,
    service_name TEXT,
    end_date DATE,
    days_remaining INTEGER
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        p.id as purchase_id,
        p.customer as customer_name,
        p.phone as customer_phone,
        p.service as service_name,
        p."end"::date as end_date,
        (p."end"::date - CURRENT_DATE) as days_remaining
    FROM purchases p
    WHERE p.validated = true 
        AND p."end"::date > CURRENT_DATE 
        AND p."end"::date <= CURRENT_DATE + INTERVAL '1 day' * days_ahead
    ORDER BY p."end" ASC;
END;
$$ LANGUAGE plpgsql;

-- Verificar que la función se creó correctamente
SELECT * FROM get_expiring_services(7) LIMIT 5;

