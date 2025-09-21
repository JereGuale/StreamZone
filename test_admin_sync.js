// Script de prueba para verificar la sincronización de administradores
// Ejecutar en la consola del navegador para probar

console.log('🧪 Iniciando prueba de sincronización de administradores...');

// Función para probar la creación de administradores
async function testAdminSync() {
  try {
    // Simular datos de administradores
    const testAdmins = ['admin1@test.com', 'admin2@test.com'];
    const testPasswords = {
      'admin1@test.com': 'Admin_ADM_1234',
      'admin2@test.com': 'Admin_ADM_5678'
    };

    console.log('📧 Administradores de prueba:', testAdmins);
    console.log('🔑 Contraseñas de prueba:', testPasswords);

    // Verificar que las funciones están disponibles
    if (typeof window !== 'undefined' && window.supabase) {
      console.log('✅ Supabase está disponible');
      
      // Probar la función de sincronización
      const { createAdmin, getAllAdmins, deleteAdmin } = await import('./src/lib/supabase.ts');
      
      if (createAdmin && getAllAdmins && deleteAdmin) {
        console.log('✅ Funciones de administradores importadas correctamente');
        
        // Probar crear un administrador
        console.log('🔄 Probando creación de administrador...');
        const { data, error } = await createAdmin({
          email: 'test@example.com',
          password: 'Test1234',
          is_active: true
        });
        
        if (error) {
          console.error('❌ Error creando administrador:', error);
        } else {
          console.log('✅ Administrador creado:', data);
        }
        
        // Probar obtener administradores
        console.log('🔄 Probando obtención de administradores...');
        const { data: admins, error: getError } = await getAllAdmins();
        
        if (getError) {
          console.error('❌ Error obteniendo administradores:', getError);
        } else {
          console.log('✅ Administradores obtenidos:', admins);
        }
        
      } else {
        console.error('❌ No se pudieron importar las funciones de administradores');
      }
    } else {
      console.error('❌ Supabase no está disponible en el navegador');
    }
    
  } catch (error) {
    console.error('❌ Error en la prueba:', error);
  }
}

// Ejecutar la prueba
testAdminSync();

console.log('🏁 Prueba completada. Revisa la consola para ver los resultados.');
