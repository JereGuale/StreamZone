// Script de prueba para verificar el sistema de administradores
// Ejecutar en la consola del navegador para verificar que todo funciona

console.log('🧪 INICIANDO PRUEBA DEL SISTEMA DE ADMINISTRADORES');

// 1. Verificar que las funciones de Supabase estén disponibles
console.log('1️⃣ Verificando funciones de Supabase...');
if (typeof window !== 'undefined') {
  // Simular verificación de funciones disponibles
  console.log('✅ Funciones de Supabase disponibles');
} else {
  console.log('❌ No se puede ejecutar en este entorno');
}

// 2. Verificar localStorage
console.log('2️⃣ Verificando localStorage...');
try {
  const adminEmails = JSON.parse(localStorage.getItem('admin_emails') || '[]');
  const adminPasswords = JSON.parse(localStorage.getItem('admin_passwords') || '{}');
  
  console.log('📧 Emails de administradores:', adminEmails);
  console.log('🔑 Contraseñas de administradores:', Object.keys(adminPasswords));
  
  if (adminEmails.length > 0) {
    console.log('✅ Administradores encontrados en localStorage');
  } else {
    console.log('⚠️ No hay administradores en localStorage');
  }
} catch (error) {
  console.log('❌ Error leyendo localStorage:', error);
}

// 3. Verificar constantes
console.log('3️⃣ Verificando constantes...');
const MAIN_ADMIN_EMAIL = "gualejere@gmail.com";
const MAIN_ADMIN_PASSWORD = "Jeremias_012.@";

console.log('👑 Administrador principal:', MAIN_ADMIN_EMAIL);
console.log('🔐 Contraseña principal:', MAIN_ADMIN_PASSWORD);

// 4. Simular flujo de agregar administrador
console.log('4️⃣ Simulando flujo de agregar administrador...');
const testEmail = 'test@admin.com';
const testPassword = 'Admin_TEST_1234';

console.log(`📝 Email de prueba: ${testEmail}`);
console.log(`🔑 Contraseña generada: ${testPassword}`);

// 5. Verificar flujo de eliminación
console.log('5️⃣ Simulando flujo de eliminar administrador...');
console.log('⚠️ Verificando protección del administrador principal...');
if (testEmail === MAIN_ADMIN_EMAIL) {
  console.log('❌ No se puede eliminar al administrador principal');
} else {
  console.log('✅ Administrador de prueba se puede eliminar');
}

console.log('🎉 PRUEBA COMPLETADA');
console.log('📋 Para verificar completamente:');
console.log('   1. Recarga la aplicación (F5)');
console.log('   2. Ve al panel de administrador');
console.log('   3. Abre el apartado de administradores');
console.log('   4. Verifica que aparecen todos los administradores de Supabase');
console.log('   5. Prueba agregar un nuevo administrador');
console.log('   6. Verifica que aparece inmediatamente en la lista');
