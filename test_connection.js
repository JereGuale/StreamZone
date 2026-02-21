// Script de prueba para verificar la conexión con Supabase
import { createClient } from '@supabase/supabase-js';

const url = 'https://gfjwebngyzfftakbbmji.supabase.co';
const anonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdmandlYm5neXpmZnRha2JibWppIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgzMjI1MzEsImV4cCI6MjA3Mzg5ODUzMX0.niC_FqHiHZ4EMNW86VpXX_ouIVsxftfXV8JgZxuCBGE';

console.log('🔗 Probando conexión con Supabase...');
console.log('URL:', url);
console.log('Key:', anonKey.substring(0, 20) + '...');

const supabase = createClient(url, anonKey);

async function testConnection() {
  try {
    // Probar lectura de servicios
    console.log('📊 Probando lectura de servicios...');
    const { data: services, error: servicesError } = await supabase
      .from('services')
      .select('*')
      .limit(5);

    if (servicesError) {
      console.error('❌ Error leyendo servicios:', servicesError);
      return;
    }

    console.log('✅ Servicios leídos correctamente:', services?.length || 0, 'servicios');

    // Probar inserción de usuario de prueba
    console.log('👤 Probando inserción de usuario...');
    const testUser = {
      name: 'Usuario Prueba',
      phone: '+593999999999',
      email: 'test@example.com'
    };

    const { data: user, error: userError } = await supabase
      .from('users')
      .insert([testUser])
      .select()
      .single();

    if (userError) {
      console.error('❌ Error insertando usuario:', userError);
    } else {
      console.log('✅ Usuario insertado correctamente:', user);
    }

    console.log('🎉 Prueba de conexión completada');

  } catch (error) {
    console.error('💥 Error general:', error);
  }
}

testConnection();
