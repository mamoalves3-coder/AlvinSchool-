import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig, loadEnv } from 'vite';

export default defineConfig(({ mode }) => {
  // Carrega as variáveis de ambiente (do .env ou do Netlify)
  const env = loadEnv(mode, process.cwd(), '');

  return {
    plugins: [react(), tailwindcss()],
    // Garante que os caminhos dos arquivos no Netlify sejam relativos
    base: './',
    define: {
      // Injeta a chave do Gemini no build
      'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY || env.VITE_GEMINI_API_KEY),
    },
    resolve: {
      alias: {
        // Ajustado para apontar para a pasta src, evitando erros de carregamento
        '@': path.resolve(__dirname, './src'),
      },
    },
    server: {
      // HMR desativado conforme configuração do AI Studio
      hmr: process.env.DISABLE_HMR !== 'true',
    },
    build: {
      // Garante que o build seja gerado corretamente para produção
      outDir: 'dist',
      sourcemap: false
    }
  };
});
