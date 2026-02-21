import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist',
    rollupOptions: {
      output: {
        manualChunks: {
          // Chunk para librerías de React
          'react-vendor': ['react', 'react-dom'],
          // Chunk para Supabase
          'supabase': ['@supabase/supabase-js'],
          // Chunk para componentes de UI
          'ui-components': [
            './src/components/ApprovePurchaseModal.tsx',
            './src/components/EditPurchaseModal.tsx',
            './src/components/AdminRegisterPurchaseModal.tsx',
            './src/components/PurchaseModal.tsx',
            './src/components/Modal.tsx'
          ],
          // Chunk para páginas
          'pages': [
            './src/pages/admin/AdminDashboard.tsx',
            './src/pages/auth/Login.tsx',
            './src/pages/auth/Register.tsx',
            './src/pages/Home.tsx'
          ],
          // Chunk para hooks
          'hooks': [
            './src/hooks/useAuth.ts',
            './src/hooks/useAdmin.ts',
            './src/hooks/useSupabaseData.ts',
            './src/hooks/usePurchases.ts'
          ]
        }
      }
    },
    // Aumentar el límite de advertencia de tamaño de chunk
    chunkSizeWarningLimit: 1000
  },
  server: {
    port: 5173,
  },
  envPrefix: 'VITE_',
  envDir: './',
});
