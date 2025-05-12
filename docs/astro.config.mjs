import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';

export default defineConfig({
  site: 'https://letorguez.github.io',
  base: 'monads-docs',
  integrations: [
    starlight({
      title: 'Monads',
      logo: {
        src: './src/assets/logo.svg',
        alt: 'Monads Logo',
        width: 24, // puedes ajustar tamaño
        height: 24,
      },
      social: {
        github: 'https://github.com/lean-mind/monads',
      },
      titleDelimiter: '⇒',
      head: [
        {
          tag: 'script',
          attrs: {
            src: './src/assets/loadLibrary.js',
            type: 'module',
          },
        },
      ],
      sidebar: [
        {
          label: 'How to use',
          autogenerate: { directory: 'how-to-use' },
        },
        {
          label: 'Option',
          autogenerate: { directory: 'option' },
        },
        {
          label: 'Try',
          autogenerate: { directory: 'try' },
        },
        {
          label: 'Either',
          autogenerate: { directory: 'either' },
        },
        {
          label: 'IO',
          autogenerate: { directory: 'io' },
        },
        {
          label: 'Future',
          autogenerate: { directory: 'future' },
        },
      ],
      customCss: ['./src/styles/custom.css'],
    }),
  ],
});
