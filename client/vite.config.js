import os from 'node:os'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vite'

const PORT = 5173

function getLanAddress() {
  for (const addresses of Object.values(os.networkInterfaces())) {
    for (const addr of addresses ?? []) {
      if (addr.family === 'IPv4' && !addr.internal) return addr.address
    }
  }
  return 'localhost'
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  define: {
    __LAN_URL__: JSON.stringify(`http://${getLanAddress()}:${PORT}`),
  },
  server: {
    host: true,
    port: PORT,
    proxy: {
      '/api': 'http://localhost:5000',
      '/uploads': 'http://localhost:5000',
    },
  },
})
