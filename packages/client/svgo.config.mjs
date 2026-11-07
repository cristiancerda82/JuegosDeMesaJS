// Optimización del arte de los temas de naipes (`pnpm arte:optimizar`). Se conserva `style`
// porque lleva las variables CSS de la paleta de cada palo (p. ej. `fill:var(--ropa)`).
export default {
  multipass: true,
  plugins: [
    {
      name: 'preset-default',
      params: {
        overrides: { convertStyleToAttrs: false, inlineStyles: false, minifyStyles: false },
      },
    },
  ],
};
