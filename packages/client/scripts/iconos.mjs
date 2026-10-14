// Genera los iconos PNG de la aplicación a partir de `public/icono.svg` con el Chromium de
// Playwright. Se ejecuta a mano cuando cambia el icono: `node scripts/iconos.mjs`.
import { chromium } from '@playwright/test';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

const publico = fileURLToPath(new URL('../public/', import.meta.url));
const svg = await readFile(`${publico}icono.svg`, 'utf8');

const SALIDAS = [
  { archivo: 'icono-192.png', lado: 192, margen: 0 },
  { archivo: 'icono-512.png', lado: 512, margen: 0 },
  // El icono «maskable» deja un margen extra: el sistema puede recortar hasta un 20 %.
  { archivo: 'icono-maskable-512.png', lado: 512, margen: 0.1 },
  { archivo: 'apple-touch-icon.png', lado: 180, margen: 0 },
];

const navegador = await chromium.launch(
  process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {},
);
const pagina = await navegador.newPage();
for (const { archivo, lado, margen } of SALIDAS) {
  await pagina.setViewportSize({ width: lado, height: lado });
  const interior = Math.round(lado * (1 - 2 * margen));
  await pagina.setContent(
    `<body style="margin:0;background:#0b3d26;display:grid;place-items:center;height:${lado}px">
       <div style="width:${interior}px;height:${interior}px">${svg.replace('<svg ', `<svg width="${interior}" height="${interior}" `)}</div>
     </body>`,
  );
  await pagina.screenshot({ path: `${publico}${archivo}` });
  console.log(`${archivo} (${lado} px)`);
}
await navegador.close();
