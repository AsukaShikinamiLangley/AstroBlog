import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import tailwindcss from '@tailwindcss/vite';
import mdx from '@astrojs/mdx';
import vue from '@astrojs/vue';
import icon from 'astro-icon';

// https://astro.build/config
export default defineConfig({
  integrations: [react(), mdx(), vue(), icon()],
  markdown: {
    shikiConfig: {
      themes: {
        light: 'github-light',
        dark: 'github-dark',
      },
    },
  },
  vite: {
    plugins: [tailwindcss()],
  },
  prefetch: {
    // 预获取策略: 'tap' | 'hover' | 'viewport' | 'load'
    defaultStrategy: 'load',
  },
  experimental: {
    fonts: [
      {
        provider: 'local',
        name: 'Matisse-EB',
        cssVariable: '--font-matisse-eb',
        variants: [
          {
            style: 'normal',
            weight: '700',
            src: ['./src/assets/fonts/FOT-MatissePro-EB.woff2'],
          },
        ],
      },
    ],
  },
});
