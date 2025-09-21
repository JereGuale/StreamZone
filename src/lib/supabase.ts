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
  url !== "https://tu-proyecto.supabase.co" && 
  anon !== "tu_clave_anonima_aqui" &&
  url.includes('supabase.co') &&
  anon.startsWith('eyJ');

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
    const { data, error } = await supabase
      .from('users')
      .insert([userData])
      .select()
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Error creating user:', error);
    return { data: null, error };
  }
};

export const getUserByPhone = async (phone: string) => {
  if (!supabase) {
    console.warn('Supabase no configurado, no se puede obtener usuario');
    return { data: null, error: new Error('Supabase no configurado') };
  }

  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('phone', phone)
      .single();

    if (error && error.code !== 'PGRST116') throw error; // PGRST116 = no rows returned
    return { data, error: null };
  } catch (error) {
    console.error('Error getting user by phone:', error);
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
    const { data, error } = await supabase
      .from('purchases')
      .insert([purchaseData])
      .select()
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Error creating purchase:', error);
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
  try {
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

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Error getting all purchases:', error);
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
  if (!supabase) {
    console.warn('Supabase no configurado, no se puede aprobar compra');
    return { data: null, error: new Error('Supabase no configurado') };
  }

  try {
    const { data, error } = await supabase
      .from('purchases')
      .update({
        validated: true,
        service_email: serviceEmail,
        service_password: servicePassword,
        admin_notes: adminNotes,
        approved_by: approvedBy,
        approved_at: new Date().toISOString()
      })
      .eq('id', purchaseId)
      .select()
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Error approving purchase:', error);
    return { data: null, error };
  }
};

// Función para obtener compras pendientes (para admin)
export const getPendingPurchases = async () => {
  if (!supabase) {
    console.warn('Supabase no configurado, no se puede obtener compras pendientes');
    return { data: null, error: new Error('Supabase no configurado') };
  }

  try {
    const { data, error } = await supabase
      .from('purchases')
      .select(`
        *,
        users!purchases_phone_fkey (
          name,
          email
        )
      `)
      .eq('validated', false)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Error getting pending purchases:', error);
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
    const { data, error } = await supabase
      .from('purchases')
      .select('*')
      .eq('phone', phone)
      .eq('validated', true)
      .gte('end', new Date().toISOString().split('T')[0]) // Solo compras activas
      .order('end', { ascending: true });

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Error getting user active purchases:', error);
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