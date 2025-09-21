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