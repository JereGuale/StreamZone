-- ========================================
-- SCRIPT PARA ARREGLAR ESTRUCTURA DE BASE DE DATOS
-- ========================================

-- 1. VERIFICAR ESTRUCTURA ACTUAL
SELECT 
    table_name,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_name IN ('users', 'services', 'purchases', 'admin_emails')
ORDER BY table_name, ordinal_position;

-- 2. AGREGAR RESTRICCIÓN UNIQUE A EMAIL SI NO EXISTE
DO $$
BEGIN
    -- Verificar si existe la restricción unique en email
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE table_name = 'users' 
        AND constraint_type = 'UNIQUE' 
        AND constraint_name LIKE '%email%'
    ) THEN
        -- Crear índice único en email
        CREATE UNIQUE INDEX IF NOT EXISTS idx_users_email_unique ON users(email);
        RAISE NOTICE 'Índice único creado en email';
    ELSE
        RAISE NOTICE 'Índice único en email ya existe';
    END IF;
END $$;

-- 3. DESHABILITAR RLS TEMPORALMENTE
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
ALTER TABLE services DISABLE ROW LEVEL SECURITY;
ALTER TABLE purchases DISABLE ROW LEVEL SECURITY;
ALTER TABLE admin_emails DISABLE ROW LEVEL SECURITY;

-- 4. ELIMINAR POLÍTICAS EXISTENTES
DROP POLICY IF EXISTS "Enable read access for all users" ON users;
DROP POLICY IF EXISTS "Enable insert for all users" ON users;
DROP POLICY IF EXISTS "Enable update for all users" ON users;
DROP POLICY IF EXISTS "Enable read access for all users" ON services;
DROP POLICY IF EXISTS "Enable insert for all users" ON services;
DROP POLICY IF EXISTS "Enable read access for all users" ON purchases;
DROP POLICY IF EXISTS "Enable insert for all users" ON purchases;
DROP POLICY IF EXISTS "Enable read access for all users" ON admin_emails;
DROP POLICY IF EXISTS "Enable insert for all users" ON admin_emails;

-- 5. CREAR POLÍTICAS PERMISIVAS
CREATE POLICY "Allow all operations on users" ON users
    FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow all operations on services" ON services
    FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow all operations on purchases" ON purchases
    FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow all operations on admin_emails" ON admin_emails
    FOR ALL USING (true) WITH CHECK (true);

-- 6. HABILITAR RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE purchases ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_emails ENABLE ROW LEVEL SECURITY;

-- 7. INSERTAR USUARIO DE PRUEBA (SIN ON CONFLICT)
INSERT INTO users (name, phone, email, password)
VALUES ('Usuario Test', '+593999999999', 'gualejere1@gmail.com', '123456');

-- 8. VERIFICAR USUARIO CREADO
SELECT * FROM users WHERE email = 'gualejere1@gmail.com';

-- 9. VERIFICAR POLÍTICAS
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd
FROM pg_policies
WHERE tablename IN ('users', 'services', 'purchases', 'admin_emails');

-- ========================================
-- MENSAJE DE ÉXITO
-- ========================================
SELECT '✅ Base de datos arreglada correctamente' as status;

