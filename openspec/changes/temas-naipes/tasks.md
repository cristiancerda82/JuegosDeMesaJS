## 1. Línea base y modelo de tema

- [x] 1.1 Antes de tocar nada, capturar con Playwright el muestrario completo y una mesa de Spider con el diseño actual, y guardarlas como referencia de «Minimal»
- [x] 1.2 Definir `TemaNaipes` y `RefDibujo` en `cartas/temas/tipos.ts`, y el registro `cartas/temas/index.ts` con Minimal en el bundle y los demás temas como `import()` diferido
- [x] 1.3 Reescribir Minimal con el modelo nuevo a partir de `dibujo.ts` (palos, pips, figuras, índices), manteniendo `nombreCarta` donde está
- [x] 1.4 Reescribir `Carta.svelte` para que pida cada pieza al tema efectivo (papel, marco, índices, numerales o composición, as y figura con `<use>`), con el prop opcional `tema`; comodines, triunfos, Excusa y dorso sin cambios
- [x] 1.5 Verificar que las capturas de Minimal coinciden con las de la tarea 1.1

## 2. Estado, carga y sprites

- [x] 2.1 Crear `cartas/tema.svelte.ts`: la elección por baraja leída y guardada en `localStorage` con `try`, los valores inválidos que vuelven a Minimal y el tema efectivo (el elegido si está cargado, Minimal si no)
- [x] 2.2 Inyectar el sprite de cada tema cargado una sola vez en un contenedor oculto; precarga en `main.ts` con un máximo de 300 ms y caída a Minimal si la importación falla
- [x] 2.3 Infraestructura de arte: `temas/<tema>/arte/`, generador del sprite con `import.meta.glob` (`?raw`) y prefijo por tema, script `pnpm arte:optimizar` con SVGO como dependencia de desarrollo
- [x] 2.4 Test de contrato genérico: todos los símbolos requeridos por baraja (48 españolas; 52 más 4 caballos franceses), sin `<script>`, `on*`, `<foreignObject>`, `<text>` ni referencias externas, y presupuesto de 150 KB gzip
- [x] 2.5 Tests unitarios de `tema.svelte.ts`: valor por defecto, valor inválido, almacenamiento que falla y elección independiente por baraja

## 3. Selector y muestrario

- [x] 3.1 Panel «Diseño de las cartas» en el pie del menú, con radios por baraja y vista previa de as, numeral y figura de cada tema, cargando los temas de una baraja al abrir su grupo
- [x] 3.2 Selectores de tema en `Muestrario.svelte`, con el mazo completo redibujado con el elegido
- [x] 3.3 Textos nuevos en `textos.ts` (nombres de los temas, selector y nombres accesibles)

## 4. Tema Castizo (española)

- [x] 4.1 Palos (oros, copas, espadas y bastos), marco con pintas por palo, papel, color y tipografía de los índices
- [x] 4.2 Ases y numerales del 2 al 9, con composiciones propias para bastos y espadas cruzados
- [x] 4.3 Figuras base sota, caballo y rey de cuerpo entero, los 4 atributos por palo y la paleta por palo
- [x] 4.4 Pasar el test de contrato, añadir capturas del muestrario y revisar el tema con el usuario (originalidad y estilo) antes de darlo por terminado

## 5. Tema Victoriano (francesa)

- [x] 5.1 Palos, papel, filete, índices con serifa y as de picas ornamental propio
- [x] 5.2 Numerales del 2 al 10 con la disposición clásica francesa
- [x] 5.3 Medias figuras jota, reina, rey y caballo con reflejo de doble cabeza, atributos y paleta por palo
- [ ] 5.4 Pasar el test de contrato, añadir capturas del muestrario y revisar el tema con el usuario antes de darlo por terminado

## 6. Tema Napolitano (española)

- [ ] 6.1 Palos de estilo italiano (rosetón, copa, espada curva y maza), papel crema e índices añadidos
- [ ] 6.2 Ases y composiciones entrelazadas de espadas y bastos del 2 al 9; oros y copas en disposición propia
- [ ] 6.3 Figuras base fante, cavallo y re de cuerpo entero, con atributos y paleta por palo
- [ ] 6.4 Pasar el test de contrato, añadir capturas del muestrario y revisar el tema con el usuario antes de darlo por terminado

## 7. Verificación

- [ ] 7.1 E2E: cambiar el tema y que se recuerde al recargar; Escoba con Napolitano y Klondike con Minimal a la vez; el valor guardado inválido
- [ ] 7.2 E2E de legibilidad: columna de Klondike de 12 cartas en Victoriano y mano de la Escoba a 360 × 640 en Castizo; el mismo nombre accesible de las cartas con todos los temas
- [ ] 7.3 E2E sin conexión con la app instalada (ampliando `pwa.spec.ts`) y fallo de carga simulado que deja Minimal sin errores
- [ ] 7.4 E2E de rendimiento: Spider de 4 palos con Victoriano en menos del doble del tiempo de Minimal, en Chromium y WebKit
- [ ] 7.5 Ejecutar todos los tests (motor, servidor, cliente y E2E), la comprobación de tipos, el lint, el formato y `openspec validate --strict`
