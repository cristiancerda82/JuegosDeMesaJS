import type { CapacitorConfig } from '@capacitor/cli';

// El appId es el identificador de la ficha en Google Play y no se puede cambiar después de
// la primera subida. El esquema https es el de siempre: cambiarlo haría perder el
// localStorage (partidas guardadas, estadísticas y preferencias). Design, decisión 7.
const config: CapacitorConfig = {
  appId: 'com.crissdeveloper.juegosdemesa',
  appName: 'Juegos de mesa',
  webDir: '../client/dist',
  server: { androidScheme: 'https' },
  plugins: {
    // Iconos claros en las barras del sistema, que dejan ver el verde de la suite.
    SystemBars: { style: 'DARK' },
  },
  android: {
    // Contenido mixto solo en las versiones de depuración (spec «Seguridad de red de la app»).
    allowMixedContent: false,
  },
};

export default config;
