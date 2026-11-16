// Genera las imágenes de partida del icono y de la pantalla de inicio (carpeta assets/) a
// partir del icono de la web, renderizándolo con el Chromium de Playwright. Después,
// `npx @capacitor/assets generate --android` crea con ellas los recursos de Android.
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const raiz = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const cliente = resolve(raiz, '..', 'client');
const { chromium } = createRequire(resolve(cliente, 'package.json'))('@playwright/test');

const svg = readFileSync(resolve(cliente, 'public', 'icono.svg'), 'utf8');
const defs = svg.match(/<defs>[\s\S]*?<\/defs>/)[0];
const tapete = svg.match(/<rect width="512" height="512"[^>]*\/>/)[0];
// Las dos cartas, sin el tapete.
const cartas = svg.slice(svg.indexOf(tapete) + tapete.length, svg.lastIndexOf('</svg>'));
const VERDE = '#0f5132';

/** Un SVG cuadrado con el tapete (o un color) de fondo y las cartas a la escala dada. */
const lienzo = (
  fondo,
  escala,
) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">${defs}${fondo}
  <g transform="translate(256 256) scale(${escala}) translate(-256 -256)">${cartas}</g></svg>`;

const IMAGENES = [
  // Icono clásico (Android 7): el de la web tal cual.
  ['icon-only.png', 1024, svg],
  // Icono adaptable: las cartas y el tapete detrás. Android los recorta con un margen del
  // 16,7 % (el inset del XML), así que las cartas van a tamaño completo.
  ['icon-foreground.png', 1024, lienzo('', 1)],
  [
    'icon-background.png',
    1024,
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">${defs}${tapete}</svg>`,
  ],
  // Pantalla de inicio: las cartas pequeñas sobre el verde de la suite.
  ['splash.png', 2732, lienzo(`<rect width="512" height="512" fill="${VERDE}"/>`, 0.3)],
  ['splash-dark.png', 2732, lienzo(`<rect width="512" height="512" fill="${VERDE}"/>`, 0.3)],
];

const navegador = await chromium.launch();
const pagina = await navegador.newPage();
for (const [nombre, lado, contenido] of IMAGENES) {
  await pagina.setViewportSize({ width: lado, height: lado });
  await pagina.setContent(
    `<style>html,body{margin:0;background:transparent}svg{display:block;width:${lado}px;height:${lado}px}</style>${contenido}`,
  );
  await pagina.screenshot({ path: resolve(raiz, 'assets', nombre), omitBackground: true });
  console.log('assets/' + nombre);
}
await navegador.close();
