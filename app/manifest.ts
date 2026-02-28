import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Portion',
    short_name: 'Portion',
    description: 'Track your meals and macros',
    start_url: '/',
    display: 'standalone',
    background_color: '#F0F4F8',
    theme_color: '#0D9488',
    orientation: 'portrait-primary',
    icons: [
      {
        src: '/favicon.ico',
        sizes: '48x48',
        type: 'image/x-icon',
        purpose: 'any',
      },
    ],
  };
}
