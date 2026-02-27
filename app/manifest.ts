import { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Fusion Interno',
    short_name: 'Fusion',
    description: 'Gestão de Tarefas Empresarial e Colaboração',
    start_url: '/',
    display: 'standalone', // É ISSO QUE REMOVE A BARRA DE NAVEGAÇÃO
    background_color: '#1a1625',
    theme_color: '#1a1625',
    orientation: 'portrait-primary',
    icons: [
      {
        src: '/icon-192x192.png', // Você precisará criar e colocar esta imagem na pasta public
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: '/icon-512x512.png', // Você precisará criar e colocar esta imagem na pasta public
        sizes: '512x512',
        type: 'image/png',
      },
    ],
  }
}