import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { fileURLToPath } from 'url'
import path from 'path'
import dotenv from 'dotenv'

// Safely calculate the path to the backend folder without relying on "process"
const __dirname = path.dirname(fileURLToPath(import.meta.url))
const backendEnvPath = path.resolve(__dirname, '../backend/.env')

// Load the specific .env file from the backend directory
const env = dotenv.config({ path: backendEnvPath }).parsed || {}

console.log(env.VITE_API_URL)
export default defineConfig({
  plugins: [react()],
  server: {
    host: true,
    port: 5173,
    proxy: {
      '/api': {
        // Reads VITE_API_URL from your backend's .env file
        target: env.VITE_API_URL || 'http://localhost:8080', 
        changeOrigin: true,
        secure: true,
      },
    },
  },
})
