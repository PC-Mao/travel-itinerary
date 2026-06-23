import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  base: '/travel-itinerary/v3.1/',
  plugins: [react()],
})
