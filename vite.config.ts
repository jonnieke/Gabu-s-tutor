import path from 'path';
import { defineConfig, loadEnv } from 'vite';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    return {
      define: {
        'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
        'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY),
        'process.env.GCS_UPLOAD_URL': JSON.stringify(env.GCS_UPLOAD_URL || ''),
        'process.env.GCS_PUBLIC_BASE_URL': JSON.stringify(env.GCS_PUBLIC_BASE_URL || ''),
        'process.env.CLOUDINARY_CLOUD_NAME': JSON.stringify(env.CLOUDINARY_CLOUD_NAME || ''),
        'process.env.CLOUDINARY_UPLOAD_PRESET': JSON.stringify(env.CLOUDINARY_UPLOAD_PRESET || '')
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      },
      build: {
        // Optimize for production
        minify: 'terser',
        terserOptions: {
          compress: {
            drop_console: true,
            drop_debugger: true,
          },
        },
        // Generate source maps for better debugging
        sourcemap: mode === 'development',
        // Optimize chunk splitting
        rollupOptions: {
          output: {
            manualChunks: {
              vendor: ['react', 'react-dom'],
              ai: ['@google/genai'],
            },
          },
        },
        // Optimize asset handling
        assetsInlineLimit: 4096,
        // Enable CSS code splitting
        cssCodeSplit: true,
      },
      // Performance optimizations
      optimizeDeps: {
        include: ['react', 'react-dom', '@google/genai'],
      },
      // Server configuration for development
      server: {
        port: 5173,
        host: true,
        // Enable HTTPS in development for better testing
        // https: true,
      },
      // Preview configuration
      preview: {
        port: 4173,
        host: true,
      },
    };
});
