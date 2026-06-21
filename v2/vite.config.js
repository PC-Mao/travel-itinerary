import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  base: '/travel-itinerary/v2/',
  plugins: [react()],
})
