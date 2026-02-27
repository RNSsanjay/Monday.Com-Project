import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
    plugins: [react()],
    base: '/',
    build: {
        outDir: 'dist',
        sourcemap: false,
        minify: 'esbuild',
        target: 'esnext',
        rollupOptions: {
            output: {
                manualChunks: {
                    vendor: ['react', 'react-dom'],
                    ui: ['lucide-react', 'framer-motion']
                }
            }
        }
    },
    server: {
        host: true,
        port: 3000
    },
    preview: {
        host: true,
        port: 3000
    }
})
