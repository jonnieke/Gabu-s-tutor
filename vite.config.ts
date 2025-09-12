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
      }
    };
});
