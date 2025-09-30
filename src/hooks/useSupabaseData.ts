import { useState, useEffect } from 'react';
import { getAllPurchases, getPendingPurchases, getUserActivePurchases, getExpiringServices, getRenewalStats } from '../lib/supabase';

export function useSupabaseData(userPhone?: string) {
  const [allPurchases, setAllPurchases] = useState<any[]>([]);
  const [pendingPurchases, setPendingPurchases] = useState<any[]>([]);
  const [userActivePurchases, setUserActivePurchases] = useState<any[]>([]);
  const [expiringServices, setExpiringServices] = useState<any[]>([]);
  const [renewalStats, setRenewalStats] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Cargar TODAS las compras desde Supabase (para admin)
  const loadAllPurchasesFromSupabase = async () => {
    setLoading(true);
    setError(null);
    
    try {
      console.log('🔄 loadAllPurchasesFromSupabase: Iniciando carga...');
      const result = await getAllPurchases();
      console.log('🔄 loadAllPurchasesFromSupabase: Resultado recibido:', result);
      
      if (result.data && Array.isArray(result.data)) {
        setAllPurchases(result.data);
        console.log('✅ loadAllPurchasesFromSupabase: Todas las compras cargadas desde Supabase:', result.data.length);
        
        // Debug: mostrar algunas compras para verificar
        if (result.data.length > 0) {
          console.log('📋 Primeras 3 compras:', result.data.slice(0, 3).map(p => ({
            id: p.id,
            customer: p.customer,
            validated: p.validated,
            created_at: p.created_at
          })));
        }
        
        return result.data;
      } else {
        console.warn('⚠️ loadAllPurchasesFromSupabase: No se pudieron cargar las compras desde Supabase');
        setAllPurchases([]);
        return [];
      }
    } catch (error) {
      console.error('❌ loadAllPurchasesFromSupabase: Error cargando compras desde Supabase:', error);
      setError('Error cargando compras desde la base de datos');
      setAllPurchases([]);
      return [];
    } finally {
      setLoading(false);
    }
  };

  // Cargar compras pendientes (para admin)
  const loadPendingPurchases = async () => {
    try {
      console.log('🔄 loadPendingPurchases: Iniciando carga...');
      const result = await getPendingPurchases();
      console.log('🔄 loadPendingPurchases: Resultado recibido:', result);
      
      if (result.data && Array.isArray(result.data)) {
        setPendingPurchases(result.data);
        console.log('✅ loadPendingPurchases: Compras pendientes cargadas:', result.data.length);
        return result.data;
      } else {
        console.log('⚠️ loadPendingPurchases: No hay datos o no es array, estableciendo array vacío');
        setPendingPurchases([]);
        return [];
      }
    } catch (error) {
      console.error('❌ loadPendingPurchases: Error cargando compras pendientes:', error);
      setPendingPurchases([]);
      return [];
    }
  };

  // Cargar compras activas de un usuario específico
  const loadUserActivePurchases = async (phone: string) => {
    try {
      const result = await getUserActivePurchases(phone);
      if (result.data) {
        setUserActivePurchases(result.data);
        console.log('✅ Compras activas del usuario cargadas:', result.data.length);
        return result.data;
      } else {
        setUserActivePurchases([]);
        return [];
      }
    } catch (error) {
      console.error('❌ Error cargando compras del usuario:', error);
      setUserActivePurchases([]);
      return [];
    }
  };

  // Cargar servicios próximos a vencer
  const loadExpiringServices = async () => {
    try {
      const result = await getExpiringServices(7); // 7 días
      if (result.data) {
        setExpiringServices(result.data);
        console.log('✅ Servicios próximos a vencer cargados:', result.data.length);
        return result.data;
      } else {
        setExpiringServices([]);
        return [];
      }
    } catch (error) {
      console.error('❌ Error cargando servicios próximos a vencer:', error);
      setExpiringServices([]);
      return [];
    }
  };

  // Cargar estadísticas de renovaciones
  const loadRenewalStats = async () => {
    try {
      const result = await getRenewalStats();
      if (result.data) {
        setRenewalStats(result.data);
        console.log('✅ Estadísticas de renovaciones cargadas');
        return result.data;
      } else {
        setRenewalStats(null);
        return null;
      }
    } catch (error) {
      console.error('❌ Error cargando estadísticas de renovaciones:', error);
      setRenewalStats(null);
      return null;
    }
  };

  // Función para actualizar todas las estadísticas del dashboard
  const refreshAllStats = async () => {
    console.log('🔄 refreshAllStats: Iniciando recarga completa...');
    setLoading(true);
    setError(null);
    
    try {
      // Recargar TODAS las compras desde Supabase
      console.log('🔄 refreshAllStats: Cargando todas las compras...');
      await loadAllPurchasesFromSupabase();
      
      // Recargar compras pendientes
      console.log('🔄 refreshAllStats: Cargando compras pendientes...');
      await loadPendingPurchases();
      
      // Recargar servicios próximos a vencer
      console.log('🔄 refreshAllStats: Cargando servicios próximos a vencer...');
      await loadExpiringServices();
      
      // Recargar estadísticas de renovaciones
      console.log('🔄 refreshAllStats: Cargando estadísticas de renovaciones...');
      await loadRenewalStats();
      
      console.log('✅ refreshAllStats: Todas las estadísticas actualizadas desde Supabase');
      
    } catch (error) {
      console.error('❌ refreshAllStats: Error actualizando estadísticas:', error);
      setError('Error actualizando estadísticas');
    } finally {
      setLoading(false);
    }
  };

  // Cargar datos iniciales solo si no hay userPhone (modo admin)
  useEffect(() => {
    if (!userPhone) {
      console.log('🔄 useSupabaseData: Iniciando carga de datos de admin...');
      refreshAllStats();
    }
  }, [userPhone]);

  // ✅ CARGAR COMPRAS PENDIENTES AUTOMÁTICAMENTE AL INICIO
  useEffect(() => {
    console.log('🔄 useSupabaseData: Cargando compras pendientes al inicio...');
    const loadOnMount = async () => {
      const result = await loadPendingPurchases();
      console.log('🎯 RESULTADO INICIAL loadPendingPurchases:', result);
    };
    loadOnMount();
  }, []); // Solo al montar el componente

  // 🔄 ACTUALIZACIÓN AUTOMÁTICA EN TIEMPO REAL (solo para admin)
  useEffect(() => {
    if (!userPhone) { // Solo en modo admin
      console.log('🔄 useSupabaseData: Iniciando actualización automática cada 5 segundos...');
      
      const interval = setInterval(async () => {
        console.log('🔄 ACTUALIZACIÓN AUTOMÁTICA: Recargando compras pendientes...');
        try {
          const result = await loadPendingPurchases();
          console.log('🔄 ACTUALIZACIÓN AUTOMÁTICA: Compras pendientes:', result?.length || 0);
        } catch (error) {
          console.error('❌ Error en actualización automática:', error);
        }
      }, 5000); // Cada 5 segundos

      return () => {
        console.log('🛑 useSupabaseData: Deteniendo actualización automática...');
        clearInterval(interval);
      };
    }
  }, [userPhone]);

  // Cargar compras del usuario cuando cambie el teléfono
  useEffect(() => {
    if (userPhone) {
      console.log('🔄 Cargando compras del usuario:', userPhone);
      setLoading(true);
      loadUserActivePurchases(userPhone).finally(() => setLoading(false));
    } else {
      setUserActivePurchases([]);
    }
  }, [userPhone]);

  // Escuchar cambios en localStorage para recargar compras del usuario
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'userPhone' && e.newValue) {
        console.log('🔄 Teléfono de usuario cambiado, recargando compras...');
        setLoading(true);
        loadUserActivePurchases(e.newValue).finally(() => setLoading(false));
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // Función para forzar recarga de compras del usuario
  const refreshUserPurchases = async (phone: string) => {
    console.log('🔄 Forzando recarga de compras del usuario:', phone);
    setLoading(true);
    try {
      const result = await loadUserActivePurchases(phone);
      console.log('✅ Compras del usuario recargadas:', result?.length || 0);
      return result;
    } catch (error) {
      console.error('❌ Error recargando compras del usuario:', error);
      return [];
    } finally {
      setLoading(false);
    }
  };

  return {
    allPurchases,
    pendingPurchases,
    userActivePurchases,
    expiringServices,
    renewalStats,
    loading,
    error,
    loadAllPurchasesFromSupabase,
    loadPendingPurchases,
    loadUserActivePurchases,
    loadExpiringServices,
    loadRenewalStats,
    refreshAllStats,
    refreshUserPurchases
  };
}
