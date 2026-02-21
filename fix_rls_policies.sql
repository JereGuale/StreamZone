-- ========================================
-- SCRIPT PARA ARREGLAR POLÍTICAS RLS
-- ========================================

-- 1. DESHABILITAR RLS TEMPORALMENTE PARA DEBUGGING
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
ALTER TABLE services DISABLE ROW LEVEL SECURITY;
ALTER TABLE purchases DISABLE ROW LEVEL SECURITY;
ALTER TABLE admin_emails DISABLE ROW LEVEL SECURITY;

-- 2. ELIMINAR POLÍTICAS EXISTENTES (si las hay)
DROP POLICY IF EXISTS "Enable read access for all users" ON users;
DROP POLICY IF EXISTS "Enable insert for all users" ON users;
DROP POLICY IF EXISTS "Enable update for all users" ON users;
DROP POLICY IF EXISTS "Enable read access for all users" ON services;
DROP POLICY IF EXISTS "Enable insert for all users" ON services;
DROP POLICY IF EXISTS "Enable read access for all users" ON purchases;
DROP POLICY IF EXISTS "Enable insert for all users" ON purchases;
DROP POLICY IF EXISTS "Enable read access for all users" ON admin_emails;
DROP POLICY IF EXISTS "Enable insert for all users" ON admin_emails;

-- 3. CREAR POLÍTICAS PERMISIVAS PARA DESARROLLO
-- POLÍTICAS PARA USERS
CREATE POLICY "Allow all operations on users" ON users
    FOR ALL USING (true) WITH CHECK (true);

-- POLÍTICAS PARA SERVICES  
CREATE POLICY "Allow all operations on services" ON services
    FOR ALL USING (true) WITH CHECK (true);

-- POLÍTICAS PARA PURCHASES
CREATE POLICY "Allow all operations on purchases" ON purchases
    FOR ALL USING (true) WITH CHECK (true);

-- POLÍTICAS PARA ADMIN_EMAILS
CREATE POLICY "Allow all operations on admin_emails" ON admin_emails
    FOR ALL USING (true) WITH CHECK (true);

-- 4. HABILITAR RLS CON POLÍTICAS PERMISIVAS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE purchases ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_emails ENABLE ROW LEVEL SECURITY;

-- 5. VERIFICAR QUE LAS TABLAS EXISTAN Y TENGAN LAS COLUMNAS CORRECTAS
SELECT 
    table_name,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_name IN ('users', 'services', 'purchases', 'admin_emails')
ORDER BY table_name, ordinal_position;

-- 6. VERIFICAR POLÍTICAS CREADAS
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies
WHERE tablename IN ('users', 'services', 'purchases', 'admin_emails');

-- 7. INSERTAR USUARIO DE PRUEBA SI NO EXISTE
INSERT INTO users (name, phone, email, password)
VALUES ('Usuario Test', '+593999999999', 'gualejere1@gmail.com', '123456')
ON CONFLICT (email) DO UPDATE SET
    name = EXCLUDED.name,
    phone = EXCLUDED.phone,
    password = EXCLUDED.password;

-- 8. VERIFICAR USUARIO CREADO
SELECT * FROM users WHERE email = 'gualejere1@gmail.com';

-- ========================================
-- MENSAJE DE ÉXITO
-- ========================================
SELECT '✅ Políticas RLS arregladas correctamente' as status;

