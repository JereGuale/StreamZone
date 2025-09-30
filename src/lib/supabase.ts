import { createClient } from '@supabase/supabase-js';

// Hardcodeando las variables temporalmente para solucionar el problema
const url  = 'https://gfjwebngyzfftakbbmji.supabase.co';
const anon = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdmandlYm5neXpmZnRha2JibWppIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgzMjI1MzEsImV4cCI6MjA3Mzg5ODUzMX0.niC_FqHiHZ4EMNW86VpXX_ouIVsxftfXV8JgZxuCBGE';

// Debug: Mostrar las variables cargadas
console.log('🔍 Debug - Variables hardcodeadas:');
console.log('URL:', url);
console.log('ANON_KEY:', anon.substring(0, 20) + '...');
console.log('✅ Variables configuradas correctamente');

// Verificar si las variables de entorno están configuradas
const isSupabaseConfigured = url && anon && 
  url.includes('supabase.co') &&
  anon.startsWith('eyJ') &&
  !url.includes('tu-proyecto') &&
  !anon.includes('tu_clave_anonima');

let supabase: any = null;

if (isSupabaseConfigured) {
  try {
    supabase = createClient(url, anon);
    console.log('[StreamZone] Supabase configurado correctamente');
  } catch (error) {
    console.error('[StreamZone] Error configurando Supabase:', error);
    supabase = null;
  }
} else {
  console.warn(
    "[StreamZone] Supabase no configurado. " +
    "Para habilitar el guardado en la nube, crea .env.local con VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY"
  );
}

export { supabase };

// Tipos para la base de datos
export interface DatabasePurchase {
  id: string;
  customer: string;
  phone: string;
  service: string;
  start: string;
  end: string;
  months: number;
  validated: boolean;
  created_at: string;
  service_email?: string;
  service_password?: string;
  admin_notes?: string;
  approved_by?: string;
  approved_at?: string;
  auto_renewal?: boolean;
  renewal_reminder_sent?: boolean;
  renewal_attempts?: number;
  last_renewal_attempt?: string;
  renewal_status?: 'none' | 'pending' | 'success' | 'failed';
  original_purchase_id?: string;
  is_renewal?: boolean;
}

export interface RenewalHistory {
  id: string;
  purchase_id: string;
  renewal_date: string;
  previous_end_date: string;
  new_end_date: string;
  renewal_type: 'manual' | 'auto' | 'admin';
  status: 'success' | 'failed' | 'pending';
  admin_notes?: string;
  created_at: string;
}

export interface ExpiringService {
  purchase_id: string;
  customer_name: string;
  customer_phone: string;
  service_name: string;
  end_date: string;
  days_remaining: number;
}

export interface DatabaseUser {
  id: string;
  name: string;
  phone: string;
  email: string;
  created_at: string;
}

export interface DatabaseService {
  id: string;
  name: string;
  price: number;
  billing: string;
  color: string;
  logo: string;
}

// Funciones para manejar usuarios
export const createUser = async (userData: Omit<DatabaseUser, 'id' | 'created_at'>) => {
  if (!supabase) {
    console.warn('Supabase no configurado, no se puede crear usuario');
    return { data: null, error: new Error('Supabase no configurado') };
  }

  try {
    console.log('📝 Creando usuario en Supabase:', userData);
    
    // Validar datos antes de enviar
    if (!userData.name || !userData.phone || !userData.email) {
      throw new Error('Datos de usuario incompletos');
    }
    
    // Limpiar y formatear datos
    const cleanUserData = {
      name: userData.name.trim(),
      phone: userData.phone.trim(),
      email: userData.email.trim().toLowerCase()
    };
    
    console.log('📝 Datos limpios para insertar:', cleanUserData);
    
    const { data, error } = await supabase
      .from('users')
      .insert([cleanUserData])
      .select()
      .single();

    if (error) {
      console.error('❌ Error de Supabase al crear usuario:', error);
      console.error('❌ Detalles del error:', {
        code: error.code,
        message: error.message,
        details: error.details,
        hint: error.hint
      });
      throw error;
    }
    
    console.log('✅ Usuario creado exitosamente:', data);
    return { data, error: null };
  } catch (error) {
    console.error('❌ Error creating user:', error);
    return { data: null, error };
  }
};

export const getUserByPhone = async (phone: string) => {
  if (!supabase) {
    console.warn('Supabase no configurado, no se puede obtener usuario');
    return { data: null, error: new Error('Supabase no configurado') };
  }

  try {
    console.log('🔍 Buscando usuario con teléfono:', phone);
    
    // Limpiar el número de teléfono
    const cleanPhone = phone.trim();
    
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('phone', cleanPhone)
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error('❌ Error de Supabase al buscar usuario:', error);
      console.error('❌ Detalles del error:', {
        code: error.code,
        message: error.message,
        details: error.details,
        hint: error.hint
      });
      throw error;
    }
    
    if (error && error.code === 'PGRST116') {
      console.log('ℹ️ Usuario no encontrado (esto es normal para nuevos usuarios)');
      return { data: null, error: null };
    }
    
    console.log('✅ Usuario encontrado:', data);
    return { data, error: null };
  } catch (error) {
    console.error('❌ Error getting user by phone:', error);
    return { data: null, error };
  }
};

export const updateUser = async (id: string, userData: Partial<DatabaseUser>) => {
  if (!supabase) {
    console.warn('Supabase no configurado, no se puede actualizar usuario');
    return { data: null, error: new Error('Supabase no configurado') };
  }

  try {
    const { data, error } = await supabase
      .from('users')
      .update(userData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Error updating user:', error);
    return { data: null, error };
  }
};

// Funciones para manejar compras
export const createPurchase = async (purchaseData: Omit<DatabasePurchase, 'id' | 'created_at'>) => {
  if (!supabase) {
    console.warn('Supabase no configurado, no se puede crear compra');
    return { data: null, error: new Error('Supabase no configurado') };
  }

  try {
    console.log('💾 createPurchase: Creando compra en Supabase:', purchaseData);
    console.log('💾 createPurchase: validated =', purchaseData.validated);
    
    const { data, error } = await supabase
      .from('purchases')
      .insert([purchaseData])
      .select()
      .single();

    if (error) {
      console.error('❌ Error de Supabase al crear compra:', error);
      throw error;
    }
    
    console.log('✅ createPurchase: Compra creada exitosamente con ID:', data?.id);
    console.log('✅ createPurchase: Compra validated =', data?.validated);
    return { data, error: null };
  } catch (error) {
    console.error('❌ Error creating purchase:', error);
    return { data: null, error };
  }
};

export const getUserPurchases = async (phone: string) => {
  if (!supabase) {
    console.warn('Supabase no configurado, no se pueden obtener compras');
    return { data: [], error: new Error('Supabase no configurado') };
  }

  try {
    const { data, error } = await supabase
      .from('purchases')
      .select('*')
      .eq('phone', phone)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Error getting user purchases:', error);
    return { data: [], error };
  }
};

export const updatePurchaseValidation = async (id: string, validated: boolean) => {
  try {
    const { data, error } = await supabase
      .from('purchases')
      .update({ validated })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Error updating purchase validation:', error);
    return { data: null, error };
  }
};

export const updatePurchase = async (id: string, updateData: Partial<DatabasePurchase>) => {
  console.log('🔧 ===== updatePurchase INICIADO =====');
  console.log('🆔 ID recibido:', id);
  console.log('📝 updateData recibido:', updateData);
  console.log('📊 Tipo de ID:', typeof id);
  console.log('📊 Tipo de updateData:', typeof updateData);
  
  try {
    if (!supabase) {
      console.error('❌ Supabase no configurado');
      throw new Error('Supabase no configurado');
    }
    
    console.log('💾 Ejecutando update en Supabase...');
    console.log('📤 Query:', {
      table: 'purchases',
      id: id,
      updateData: updateData
    });
    
    const { data, error } = await supabase
      .from('purchases')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    console.log('📥 Respuesta de Supabase:', { data, error });

    if (error) {
      console.error('❌ Error de Supabase:', error);
      console.error('❌ Detalles del error:', {
        code: error.code,
        message: error.message,
        details: error.details,
        hint: error.hint
      });
      throw error;
    }
    
    console.log('✅ Update exitoso en Supabase:', data);
    console.log('🎉 ===== updatePurchase COMPLETADO =====');
    return { data, error: null };
  } catch (error) {
    console.error('❌ ===== ERROR EN updatePurchase =====');
    console.error('❌ Error updating purchase:', error);
    console.error('❌ Stack trace:', error.stack);
    return { data: null, error };
  }
};

// Funciones para manejar servicios
export const getServices = async () => {
  try {
    const { data, error } = await supabase
      .from('services')
      .select('*')
      .order('name');

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Error getting services:', error);
    return { data: null, error };
  }
};

// Función para sincronizar servicios con la base de datos
export const syncServices = async (services: any[]) => {
  if (!supabase) {
    console.warn('Supabase no configurado, saltando sincronización de servicios');
    return { data: [], error: null };
  }

  try {
    // Primero, obtener todos los servicios existentes
    const { data: existingServices, error: fetchError } = await supabase
      .from('services')
      .select('*');

    if (fetchError) throw fetchError;

    // Crear un mapa de servicios existentes
    const existingMap = new Map(existingServices?.map(s => [s.name, s]) || []);

    // Determinar qué servicios necesitan ser insertados
    const servicesToInsert = services.filter(service => !existingMap.has(service.name));

    if (servicesToInsert.length > 0) {
      const { data, error } = await supabase
        .from('services')
        .insert(servicesToInsert.map(s => ({
          id: s.id,
          name: s.name,
          price: s.price,
          billing: s.billing,
          color: s.color,
          logo: s.logo
        })))
        .select();

      if (error) throw error;
      console.log(`Sincronizados ${servicesToInsert.length} servicios nuevos`);
    }

    return { data: servicesToInsert, error: null };
  } catch (error) {
    console.error('Error syncing services:', error);
    return { data: [], error };
  }
};

// Función para obtener todas las compras (para admin)
export const getAllPurchases = async () => {
  if (!supabase) {
    console.warn('Supabase no configurado, no se pueden obtener todas las compras');
    return { data: null, error: new Error('Supabase no configurado') };
  }

  try {
    console.log('🔍 getAllPurchases: Obteniendo todas las compras...');
    const { data, error } = await supabase
      .from('purchases')
      .select(`
        *,
        users!purchases_phone_fkey (
          name,
          email
        )
      `)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('❌ Error en getAllPurchases:', error);
      throw error;
    }
    
    console.log('✅ getAllPurchases: Obtenidas', data?.length || 0, 'compras totales');
    return { data, error: null };
  } catch (error) {
    console.error('❌ Error getting all purchases:', error);
    return { data: null, error };
  }
};

// Función para obtener estadísticas (para admin)
export const getPurchaseStats = async () => {
  try {
    const { data, error } = await supabase
      .from('purchases')
      .select('validated, created_at, service');

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Error getting purchase stats:', error);
    return { data: null, error };
  }
};

// Función para aprobar una compra y asignar credenciales
export const approvePurchase = async (
  purchaseId: string, 
  serviceEmail: string, 
  servicePassword: string, 
  adminNotes?: string,
  approvedBy?: string
) => {
  console.log('🔍 approvePurchase: Verificando configuración de Supabase...');
  console.log('🔍 supabase client:', supabase);
  console.log('🔍 isSupabaseConfigured:', isSupabaseConfigured);
  
  if (!supabase) {
    console.error('❌ Supabase no configurado, no se puede aprobar compra');
    return { data: null, error: new Error('Supabase no configurado') };
  }

  try {
    console.log('🔄 Supabase: Aprobando compra...', {
      purchaseId,
      serviceEmail,
      servicePassword: servicePassword ? '***' : 'undefined',
      adminNotes,
      approvedBy
    });

    const { data, error } = await supabase
      .from('purchases')
      .update({
        validated: true,
        service_email: serviceEmail,
        service_password: servicePassword,
        admin_notes: adminNotes,
        approved_by: approvedBy
      })
      .eq('id', purchaseId)
      .select()
      .single();

    if (error) {
      console.error('❌ Supabase Error:', error);
      throw error;
    }

    console.log('✅ Supabase: Compra aprobada exitosamente:', data);
    return { data, error: null };
  } catch (error) {
    console.error('❌ Error approving purchase:', error);
    return { data: null, error };
  }
};

// Función simple para probar la conexión
export const testConnection = async () => {
  if (!supabase) {
    console.warn('❌ Supabase no configurado');
    return { success: false, error: 'Supabase no configurado' };
  }

  try {
    console.log('🔍 testConnection: Probando conexión básica...');
    
    // Probar una consulta simple
    const { data, error } = await supabase
      .from('purchases')
      .select('count')
      .limit(1);
    
    console.log('🔍 testConnection: Resultado:', { data, error });
    
    if (error) {
      console.error('❌ Error en testConnection:', error);
      return { success: false, error };
    }
    
    console.log('✅ testConnection: Conexión exitosa');
    return { success: true, data };
  } catch (error) {
    console.error('❌ Error en testConnection:', error);
    return { success: false, error };
  }
};

// Función para crear una compra de prueba
export const createTestPurchase = async () => {
  if (!supabase) {
    console.warn('Supabase no configurado');
    return { success: false, error: 'Supabase no configurado' };
  }

  try {
    console.log('🧪 createTestPurchase: Creando compra de prueba...');
    console.log('🧪 createTestPurchase: Supabase configurado:', !!supabase);
    
    // ✅ USAR COLUMNAS CORRECTAS SEGÚN LA ESTRUCTURA REAL DE LA BD
    const testPurchaseData = {
      customer: 'Cliente Prueba',
      phone: '+593999999999',
      service: 'Netflix Premium',
      start: new Date().toISOString().slice(0, 10),
      end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
      months: 1,
      validated: false, // ✅ IMPORTANTE: Como pendiente
      service_email: null,
      service_password: null,
      admin_notes: 'Compra de prueba creada desde admin',
      approved_by: null,
      approved_at: null,
      auto_renewal: false,
      renewal_reminder_sent: false,
      renewal_attempts: 0,
      last_renewal_attempt: null,
      renewal_status: 'none',
      original_purchase_id: null,
      is_renewal: false
    };
    
    console.log('🧪 createTestPurchase: Datos a insertar:', testPurchaseData);
    
    const { data, error } = await supabase
      .from('purchases')
      .insert([testPurchaseData])
      .select()
      .single();
    
    console.log('🧪 createTestPurchase: Resultado de insert:', { data, error });
    
    if (error) {
      console.error('❌ Error creando compra de prueba:', error);
      console.error('❌ Detalles del error:', JSON.stringify(error, null, 2));
      return { success: false, error };
    }
    
    console.log('✅ Compra de prueba creada:', data);
    return { success: true, data };
  } catch (error) {
    console.error('❌ Error en createTestPurchase:', error);
    return { success: false, error };
  }
};

// Función de prueba para verificar la base de datos
export const testDatabaseConnection = async () => {
  if (!supabase) {
    console.warn('Supabase no configurado');
    return { success: false, error: 'Supabase no configurado' };
  }

  try {
    console.log('🧪 testDatabaseConnection: Probando conexión a la BD...');
    
    // Probar tabla purchases
    const { data: purchasesData, error: purchasesError } = await supabase
      .from('purchases')
      .select('id, customer, validated, created_at')
      .limit(5);
    
    console.log('🧪 testDatabaseConnection: Resultado tabla purchases:', { purchasesData, purchasesError });
    
    // Probar tabla users
    const { data: usersData, error: usersError } = await supabase
      .from('users')
      .select('id, name, phone, email')
      .limit(5);
    
    console.log('🧪 testDatabaseConnection: Resultado tabla users:', { usersData, usersError });
    
    // Contar compras totales
    const { count: totalCount, error: countError } = await supabase
      .from('purchases')
      .select('*', { count: 'exact', head: true });
    
    console.log('🧪 testDatabaseConnection: Total compras:', totalCount);
    
    // Contar compras pendientes
    const { count: pendingCount, error: pendingCountError } = await supabase
      .from('purchases')
      .select('*', { count: 'exact', head: true })
      .eq('validated', false);
    
    console.log('🧪 testDatabaseConnection: Compras pendientes:', pendingCount);
    
    return { 
      success: true, 
      totalPurchases: totalCount,
      pendingPurchases: pendingCount,
      samplePurchases: purchasesData,
      sampleUsers: usersData
    };
  } catch (error) {
    console.error('❌ testDatabaseConnection: Error:', error);
    return { success: false, error };
  }
};

// Función para obtener compras pendientes (para admin)
export const getPendingPurchases = async () => {
  if (!supabase) {
    console.warn('Supabase no configurado, no se puede obtener compras pendientes');
    return { data: null, error: new Error('Supabase no configurado') };
  }

  try {
    console.log('🔍 getPendingPurchases: DIAGNÓSTICO COMPLETO...');
    
    // 🔍 PASO 1: Contar TODAS las compras
    const { count: totalCount, error: countError } = await supabase
      .from('purchases')
      .select('*', { count: 'exact', head: true });
    
    console.log('📊 Total compras en BD:', totalCount);
    
    // 🔍 PASO 2: Contar compras pendientes
    const { count: pendingCount, error: pendingCountError } = await supabase
      .from('purchases')
      .select('*', { count: 'exact', head: true })
      .eq('validated', false);
    
    console.log('⏳ Compras pendientes en BD:', pendingCount);
    
    // 🔍 PASO 3: Obtener todas las compras (últimas 10)
    const { data: allPurchases, error: allError } = await supabase
      .from('purchases')
      .select('id, customer, validated, created_at')
      .order('created_at', { ascending: false })
      .limit(10);
    
    console.log('📋 Últimas 10 compras:', allPurchases?.map(p => ({
      id: p.id,
      customer: p.customer,
      validated: p.validated,
      created_at: p.created_at
    })));
    
    // 🔍 PASO 4: Obtener compras pendientes
    let { data, error } = await supabase
      .from('purchases')
      .select('*')
      .eq('validated', false)
      .order('created_at', { ascending: false });

    // Si hay error, intentar con consulta básica
    if (error) {
      console.warn('⚠️ Error en consulta principal, intentando consulta básica:', error);
      const { data: basicData, error: basicError } = await supabase
        .from('purchases')
        .select('id, customer, phone, service, validated, created_at, start, end, months')
        .eq('validated', false)
        .order('created_at', { ascending: false });
      
      if (basicError) {
        console.error('❌ Error también en consulta básica:', basicError);
        throw basicError;
      }
      
      data = basicData;
      error = null;
    }
    
    console.log('✅ getPendingPurchases: RESULTADO FINAL - Encontradas', data?.length || 0, 'compras pendientes');
    if (data && data.length > 0) {
      console.log('📋 Compras pendientes encontradas:', data.map(p => ({
        id: p.id,
        customer: p.customer,
        validated: p.validated,
        created_at: p.created_at
      })));
    } else {
      console.log('❌ NO SE ENCONTRARON COMPRAS PENDIENTES');
    }
    
    return { data, error: null };
  } catch (error) {
    console.error('❌ Error getting pending purchases:', error);
    return { data: null, error };
  }
};

// Función para obtener compras activas de un usuario
export const getUserActivePurchases = async (phone: string) => {
  if (!supabase) {
    console.warn('Supabase no configurado, no se puede obtener compras del usuario');
    return { data: null, error: new Error('Supabase no configurado') };
  }

  try {
    console.log('🔍 Buscando compras activas para teléfono:', phone);
    
    // Normalizar el número de teléfono
    let normalizedPhone = phone.trim();
    if (!normalizedPhone.startsWith('+')) {
      normalizedPhone = '+593' + normalizedPhone.replace(/[^\d]/g, '');
    }
    
    console.log('📞 Teléfono normalizado:', normalizedPhone);
    
    // Buscar con el teléfono exacto
    let { data, error } = await supabase
      .from('purchases')
      .select('*')
      .eq('phone', normalizedPhone)
      .eq('validated', true)
      .gte('end', new Date().toISOString().split('T')[0])
      .order('end', { ascending: true });

    if (error) throw error;
    
    console.log('✅ Compras encontradas con teléfono exacto:', data?.length || 0);
    
    // Si no se encuentran compras, intentar con diferentes formatos
    if (!data || data.length === 0) {
      console.log('🔍 No se encontraron compras, intentando otros formatos...');
      
      // Intentar sin el +593
      const phoneWithoutCountry = phone.replace(/[^\d]/g, '');
      console.log('📞 Intentando sin código de país:', phoneWithoutCountry);
      
      const { data: data2, error: error2 } = await supabase
        .from('purchases')
        .select('*')
        .eq('phone', phoneWithoutCountry)
        .eq('validated', true)
        .gte('end', new Date().toISOString().split('T')[0])
        .order('end', { ascending: true });
        
      if (!error2 && data2 && data2.length > 0) {
        console.log('✅ Compras encontradas sin código de país:', data2.length);
        data = data2;
      }
      
      // Si aún no se encuentran, intentar con +593 al inicio
      if (!data || data.length === 0) {
        const phoneWithCountry = '+593' + phoneWithoutCountry;
        console.log('📞 Intentando con +593:', phoneWithCountry);
        
        const { data: data3, error: error3 } = await supabase
          .from('purchases')
          .select('*')
          .eq('phone', phoneWithCountry)
          .eq('validated', true)
          .gte('end', new Date().toISOString().split('T')[0])
          .order('end', { ascending: true });
          
        if (!error3 && data3 && data3.length > 0) {
          console.log('✅ Compras encontradas con +593:', data3.length);
          data = data3;
        }
      }
    }
    
    console.log('📊 Total de compras activas encontradas:', data?.length || 0);
    if (data && data.length > 0) {
      console.log('📋 Compras encontradas:', data.map(p => ({ id: p.id, customer: p.customer, service: p.service, phone: p.phone, end: p.end })));
    }
    
    return { data, error: null };
  } catch (error) {
    console.error('❌ Error getting user active purchases:', error);
    return { data: null, error };
  }
};


// ============ FUNCIONES DE RENOVACIÓN ============

// Función para obtener servicios próximos a vencer
export const getExpiringServices = async (daysAhead: number = 7) => {
  if (!supabase) {
    console.warn('Supabase no configurado, no se puede obtener servicios próximos a vencer');
    return { data: null, error: new Error('Supabase no configurado') };
  }

  try {
    const { data, error } = await supabase
      .rpc('get_expiring_services', { days_ahead: daysAhead });

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Error getting expiring services:', error);
    return { data: null, error };
  }
};

// Función para crear una renovación
export const createRenewal = async (
  purchaseId: string, 
  renewalMonths: number, 
  adminUser: string = 'system'
) => {
  if (!supabase) {
    console.warn('Supabase no configurado, no se puede crear renovación');
    return { data: null, error: new Error('Supabase no configurado') };
  }

  try {
    const { data, error } = await supabase
      .rpc('create_renewal', {
        purchase_uuid: purchaseId,
        renewal_months: renewalMonths,
        admin_user: adminUser
      });

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Error creating renewal:', error);
    return { data: null, error };
  }
};

// Función para obtener historial de renovaciones de una compra
export const getRenewalHistory = async (purchaseId: string) => {
  if (!supabase) {
    console.warn('Supabase no configurado, no se puede obtener historial de renovaciones');
    return { data: null, error: new Error('Supabase no configurado') };
  }

  try {
    const { data, error } = await supabase
      .from('renewal_history')
      .select('*')
      .eq('purchase_id', purchaseId)
      .order('renewal_date', { ascending: false });

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Error getting renewal history:', error);
    return { data: null, error };
  }
};

// Función para habilitar/deshabilitar renovación automática
export const toggleAutoRenewal = async (purchaseId: string, enabled: boolean) => {
  if (!supabase) {
    console.warn('Supabase no configurado, no se puede cambiar renovación automática');
    return { data: null, error: new Error('Supabase no configurado') };
  }

  try {
    const { data, error } = await supabase
      .from('purchases')
      .update({ auto_renewal: enabled })
      .eq('id', purchaseId)
      .select()
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Error toggling auto renewal:', error);
    return { data: null, error };
  }
};

// Función para obtener notificaciones de servicios próximos a vencer
export const getRenewalNotifications = async () => {
  if (!supabase) {
    console.warn('Supabase no configurado, no se pueden obtener notificaciones');
    return { data: null, error: new Error('Supabase no configurado') };
  }

  try {
    const { data, error } = await supabase
      .rpc('notify_expiring_services');

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Error getting renewal notifications:', error);
    return { data: null, error };
  }
};

// Función para obtener estadísticas de renovaciones (para admin)
export const getRenewalStats = async () => {
  if (!supabase) {
    console.warn('Supabase no configurado, no se pueden obtener estadísticas');
    return { data: null, error: new Error('Supabase no configurado') };
  }

  try {
    const { data, error } = await supabase
      .from('purchases')
      .select('auto_renewal, is_renewal, end, validated');

    if (error) throw error;
    
    const stats = {
      totalPurchases: data.length,
      autoRenewalEnabled: data.filter(p => p.auto_renewal).length,
      renewalPurchases: data.filter(p => p.is_renewal).length,
      expiringThisWeek: data.filter(p => {
        const endDate = new Date(p.end);
        const now = new Date();
        const weekFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
        return endDate >= now && endDate <= weekFromNow && p.validated;
      }).length,
      expiredServices: data.filter(p => {
        const endDate = new Date(p.end);
        const now = new Date();
        return endDate < now && p.validated;
      }).length
    };

    return { data: stats, error: null };
  } catch (error) {
    console.error('Error getting renewal stats:', error);
    return { data: null, error };
  }
};

// ============ FUNCIONES DE RECUPERACIÓN DE CONTRASEÑA ============

// Función para buscar usuario por email para recuperación de contraseña
export const getUserByEmail = async (email: string) => {
  if (!supabase) {
    console.warn('Supabase no configurado, no se puede buscar usuario');
    return { data: null, error: new Error('Supabase no configurado') };
  }
  
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email.toLowerCase().trim())
      .single();
    
    if (error && error.code !== 'PGRST116') throw error; // PGRST116 = no rows returned
    return { data, error: null };
  } catch (error) {
    console.error('Error buscando usuario por email:', error);
    return { data: null, error };
  }
};

// Función para generar token de recuperación
export const generateResetToken = async (email: string) => {
  if (!supabase) {
    console.warn('Supabase no configurado, no se puede generar token');
    return { data: null, error: new Error('Supabase no configurado') };
  }
  
  try {
    // Verificar que el usuario existe
    const userResult = await getUserByEmail(email);
    if (!userResult.data) {
      return { data: null, error: { message: `No existe un usuario con el email: ${email}. Verifica que el email sea correcto o crea una cuenta primero.` } };
    }
    
    // Generar token único
    const resetToken = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    const expiresAt = new Date(Date.now() + 30 * 60 * 1000); // 30 minutos
    
    // Actualizar usuario con token
    const { data, error } = await supabase
      .from('users')
      .update({ 
        reset_token: resetToken,
        reset_token_expires: expiresAt.toISOString()
      })
      .eq('email', email.toLowerCase().trim())
      .select()
      .single();
    
    if (error) throw error;
    return { data: { token: resetToken, user: data }, error: null };
  } catch (error) {
    console.error('Error generando token de recuperación:', error);
    return { data: null, error };
  }
};

// Función para verificar token de recuperación
export const verifyResetToken = async (token: string) => {
  if (!supabase) {
    console.warn('Supabase no configurado, no se puede verificar token');
    return { data: null, error: new Error('Supabase no configurado') };
  }
  
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('reset_token', token)
      .gt('reset_token_expires', new Date().toISOString())
      .single();
    
    if (error && error.code !== 'PGRST116') throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Error verificando token:', error);
    return { data: null, error };
  }
};

// Función para restablecer contraseña
export const resetPassword = async (token: string, newPassword: string) => {
  if (!supabase) {
    console.warn('Supabase no configurado, no se puede restablecer contraseña');
    return { data: null, error: new Error('Supabase no configurado') };
  }
  
  try {
    // Verificar token
    const tokenResult = await verifyResetToken(token);
    if (!tokenResult.data) {
      return { data: null, error: { message: 'Token inválido o expirado' } };
    }
    
    // Actualizar contraseña y limpiar token
    const { data, error } = await supabase
      .from('users')
      .update({ 
        password: newPassword,
        reset_token: null,
        reset_token_expires: null
      })
      .eq('reset_token', token)
      .select()
      .single();
    
    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Error restableciendo contraseña:', error);
    return { data: null, error };
  }
};

// Función para login de usuario
export const loginUser = async (email: string, password: string) => {
  if (!supabase) {
    console.warn('Supabase no configurado, no se puede hacer login');
    return { data: null, error: new Error('Supabase no configurado') };
  }
  
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email.toLowerCase().trim())
      .eq('password', password)
      .single();
    
    if (error && error.code !== 'PGRST116') throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Error en login:', error);
    return { data: null, error };
  }
};