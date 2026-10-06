import os from 'node:os'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vite'

const PORT = 5173

const VIRTUAL_ADAPTER = /virtual|vbox|vmware|vethernet|hyper-v|wsl|docker|bluetooth|loopback|tailscale|zerotier/i
const WIRELESS_ADAPTER = /wi-?fi|wlan|wireless|^wl|^en0$/i

// Phones scanning the QR code must reach this address, so skip virtual adapters
// (VirtualBox uses 192.168.56.x, Hyper-V/WSL/Docker use 172.16-31.x).
function addressScore(name, address) {
  if (address.startsWith('169.254.') || VIRTUAL_ADAPTER.test(name) || address.startsWith('192.168.56.')) return 0
  if (WIRELESS_ADAPTER.test(name)) return 3
  if (address.startsWith('192.168.') || address.startsWith('10.')) return 2
  return 1
}

function getLanAddress() {
  const candidates = Object.entries(os.networkInterfaces()).flatMap(([name, addresses]) =>
    (addresses ?? [])
      .filter((addr) => addr.family === 'IPv4' && !addr.internal)
      .map((addr) => ({ address: addr.address, score: addressScore(name, addr.address) })),
  )
  const best = candidates.filter((c) => c.score > 0).sort((a, b) => b.score - a.score)[0]
  return best?.address ?? 'localhost'
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
