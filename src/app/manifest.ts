
import { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'ChronicAI - Saúde',
    short_name: 'ChronicAI',
    description: 'Acompanhamento de saúde e assistente com IA para cuidados crónicos.',
    start_url: '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#008ba3',
    icons: [
      {
        src: '/favicon.ico',
        sizes: 'any',
        type: 'image/x-icon',
      },
    ],
  }
}
