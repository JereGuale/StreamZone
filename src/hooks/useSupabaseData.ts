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
      const result = await getAllPurchases();
      if (result.data) {
        setAllPurchases(result.data);
        console.log('✅ Todas las compras cargadas desde Supabase:', result.data.length);
        return result.data;
      } else {
        console.warn('⚠️ No se pudieron cargar las compras desde Supabase');
        setAllPurchases([]);
        return [];
      }
    } catch (error) {
      console.error('❌ Error cargando compras desde Supabase:', error);
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
      const result = await getPendingPurchases();
      if (result.data) {
        setPendingPurchases(result.data);
        console.log('✅ Compras pendientes cargadas:', result.data.length);
        return result.data;
      } else {
        setPendingPurchases([]);
        return [];
      }
    } catch (error) {
      console.error('❌ Error cargando compras pendientes:', error);
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

  // Cargar datos iniciales
  useEffect(() => {
    console.log('🔄 useSupabaseData: Iniciando carga de datos...');
    refreshAllStats();
  }, []);

  // Cargar compras del usuario cuando cambie el teléfono
  useEffect(() => {
    if (userPhone) {
      console.log('🔄 Cargando compras del usuario:', userPhone);
      loadUserActivePurchases(userPhone);
    } else {
      setUserActivePurchases([]);
    }
  }, [userPhone]);

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
    refreshAllStats
  };
}
