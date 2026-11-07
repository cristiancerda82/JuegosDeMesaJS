/*!
 * baraja-espanola-clasica.js — Baraja española de diseño clásico (patrón castellano) en SVG puro.
 * Figuras de cuerpo entero (Sota, Caballo, Rey) con ropajes estampados, "pinta" en el marco,
 * espadas y bastos entrecruzados, ases ornamentados, comodín y varios reversos. Sin dependencias.
 *
 *   EspanolaClasica.svgCarta(12, 'oros')                  -> string SVG (10 = Sota, 11 = Caballo, 12 = Rey)
 *   EspanolaClasica.svgReverso('rojo', 'clasico')         -> string SVG (diseños: clasico | cenefa | damero)
 *   EspanolaClasica.svgComodin('rojo')                    -> string SVG ('rojo' | 'azul')
 *   EspanolaClasica.crearMazo({ cartas: 40, comodines })  -> [{ numero, palo, id }, ...]  (cartas: 40 | 48)
 *   EspanolaClasica.barajar(mazo)                         -> mazo barajado (in place)
 *   EspanolaClasica.elemento(carta, opciones)             -> <div class="naipe"> con animación de giro
 *   EspanolaClasica.imagen(svg)                           -> Promise<HTMLImageElement> para ctx.drawImage
 */
(function (global) {
  'use strict';

  var W = 240,
    H = 336;
  var PALOS = ['oros', 'copas', 'espadas', 'bastos'];
  var NUMEROS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
  var NOMBRES = { 1: 'As', 10: 'Sota', 11: 'Caballo', 12: 'Rey' };
  var DISENOS = ['clasico', 'cenefa', 'damero'];
  var NEGRO = '#151515',
    ROJO = '#c8202f',
    AZUL = '#1d4f9c',
    AMARILLO = '#f2b51c',
    VERDE = '#2f7d3a',
    PIEL = '#fbe3cf',
    BLANCO = '#fff',
    ACERO = '#7fa8dc',
    MADERA = '#d8902e',
    CANO = '#ece6da',
    CASTANO = '#7a4a22';
  var FUENTE = "'Times New Roman', Times, Georgia, serif";
  var uid = 0;

  var COLOR = { oros: '#a86f00', copas: ROJO, espadas: AZUL, bastos: VERDE };

  // ---------- Símbolos de los palos (caja de 100x100) ----------
  var FORMAS = {
    oros: (function () {
      var rayos = '',
        petalos = '';
      for (var i = 0; i < 24; i++) {
        var a = (i * Math.PI) / 12;
        rayos +=
          'M' +
          f(50 + Math.cos(a) * 17) +
          ' ' +
          f(50 + Math.sin(a) * 17) +
          'L' +
          f(50 + Math.cos(a) * 33) +
          ' ' +
          f(50 + Math.sin(a) * 33);
      }
      for (var k = 0; k < 8; k++)
        petalos +=
          '<ellipse cx="50" cy="40" rx="4" ry="9" transform="rotate(' + k * 45 + ' 50 50)"/>';
      return (
        '<circle cx="50" cy="50" r="47" fill="' +
        AMARILLO +
        '" stroke="' +
        NEGRO +
        '" stroke-width="2.5"/>' +
        '<circle cx="50" cy="50" r="40" fill="none" stroke="' +
        ROJO +
        '" stroke-width="5"/>' +
        '<circle cx="50" cy="50" r="37" fill="none" stroke="' +
        NEGRO +
        '" stroke-width=".8"/>' +
        '<circle cx="50" cy="50" r="43" fill="none" stroke="' +
        NEGRO +
        '" stroke-width=".8"/>' +
        '<path d="' +
        rayos +
        '" stroke="' +
        NEGRO +
        '" stroke-width=".9"/>' +
        '<g fill="' +
        ROJO +
        '" stroke="' +
        NEGRO +
        '" stroke-width=".8">' +
        petalos +
        '</g>' +
        '<circle cx="50" cy="50" r="6" fill="' +
        AMARILLO +
        '" stroke="' +
        NEGRO +
        '" stroke-width="1.2"/>'
      );
    })(),
    copas:
      '<path d="M18 10h64c0 24-10 38-26 44v6c6 1 8 4 8 7s-2 6-8 7v4c10 2 18 8 18 16H26c0-8 8-14 18-16v-4c-6-1-8-4-8-7s2-6 8-7v-6C28 48 18 34 18 10z" fill="' +
      AMARILLO +
      '" stroke="' +
      NEGRO +
      '" stroke-width="2"/>' +
      '<path d="M21 22Q50 30 79 22L77 29Q50 37 23 29z" fill="' +
      ROJO +
      '" stroke="' +
      NEGRO +
      '" stroke-width="1"/>' +
      '<ellipse cx="50" cy="10" rx="32" ry="5" fill="' +
      ROJO +
      '" stroke="' +
      NEGRO +
      '" stroke-width="1.5"/>' +
      '<circle cx="50" cy="41" r="4" fill="' +
      AZUL +
      '" stroke="' +
      NEGRO +
      '"/><circle cx="37" cy="36" r="2.4" fill="' +
      AZUL +
      '"/><circle cx="63" cy="36" r="2.4" fill="' +
      AZUL +
      '"/>' +
      '<ellipse cx="50" cy="67" rx="9" ry="4" fill="' +
      ROJO +
      '" stroke="' +
      NEGRO +
      '" stroke-width="1"/>' +
      '<path d="M32 86h36" stroke="' +
      ROJO +
      '" stroke-width="3"/>',
    espadas:
      '<path d="M50 2C58 14 59 40 56 68H44C42 40 44 16 50 2z" fill="' +
      ACERO +
      '" stroke="' +
      NEGRO +
      '" stroke-width="1.8"/>' +
      '<path d="M50 9C53 24 53 44 51 66" stroke="' +
      BLANCO +
      '" stroke-width="1.4" fill="none"/>' +
      '<path d="M24 68C32 62 42 72 50 68 58 72 68 62 76 68 72 77 58 72 50 77 42 72 28 77 24 68z" fill="' +
      AMARILLO +
      '" stroke="' +
      NEGRO +
      '" stroke-width="1.5"/>' +
      '<rect x="45.5" y="76" width="9" height="14" fill="' +
      ROJO +
      '" stroke="' +
      NEGRO +
      '" stroke-width="1.4"/>' +
      '<path d="M46 80l8 2M46 85l8 2" stroke="' +
      NEGRO +
      '" stroke-width=".8"/>' +
      '<circle cx="50" cy="94" r="5" fill="' +
      AMARILLO +
      '" stroke="' +
      NEGRO +
      '" stroke-width="1.4"/>',
    bastos:
      '<path d="M36 4Q50-2 64 4 70 16 64 28 70 34 62 40L58 90Q50 100 42 90L38 40Q30 34 36 28 30 16 36 4z" fill="' +
      MADERA +
      '" stroke="' +
      NEGRO +
      '" stroke-width="2"/>' +
      '<path d="M44 10Q46 40 47 86M56 10Q54 40 53 86" stroke="#8a4f12" stroke-width="1" fill="none"/>' +
      '<ellipse cx="37" cy="22" rx="5" ry="3" fill="#f1c27a" stroke="' +
      NEGRO +
      '"/><ellipse cx="63" cy="36" rx="4.5" ry="3" fill="#f1c27a" stroke="' +
      NEGRO +
      '"/>' +
      '<ellipse cx="41" cy="58" rx="4" ry="2.6" fill="#f1c27a" stroke="' +
      NEGRO +
      '"/><ellipse cx="58" cy="72" rx="3.6" ry="2.4" fill="#f1c27a" stroke="' +
      NEGRO +
      '"/>' +
      '<path d="M63 34q10-9 15-2-6 7-15 2zM40 56q-10-7-14 0 6 6 14 0z" fill="' +
      VERDE +
      '" stroke="' +
      NEGRO +
      '" stroke-width=".8"/>' +
      '<circle cx="50" cy="12" r="3" fill="' +
      ROJO +
      '" stroke="' +
      NEGRO +
      '" stroke-width=".8"/>',
  };

  function f(n) {
    return Math.round(n * 10) / 10;
  }
  function largo(palo) {
    return palo === 'espadas' || palo === 'bastos';
  }

  // Símbolo centrado en (cx, cy) con tamaño s y giro en grados. Espadas y bastos se alargan.
  function pip(palo, cx, cy, s, giro) {
    var sy = largo(palo) ? s * 1.3 : s;
    return (
      '<g transform="translate(' +
      f(cx) +
      ' ' +
      f(cy) +
      ')' +
      (giro ? ' rotate(' + giro + ')' : '') +
      ' translate(' +
      f(-s / 2) +
      ' ' +
      f(-sy / 2) +
      ') scale(' +
      f((s / 100) * 1000) / 1000 +
      ' ' +
      f((sy / 100) * 1000) / 1000 +
      ')">' +
      FORMAS[palo] +
      '</g>'
    );
  }

  function svg(contenido, etiqueta, defs) {
    return (
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ' +
      W +
      ' ' +
      H +
      '" role="img" aria-label="' +
      etiqueta +
      '">' +
      (defs ? '<defs>' + defs + '</defs>' : '') +
      '<rect x="1" y="1" width="' +
      (W - 2) +
      '" height="' +
      (H - 2) +
      '" rx="13" fill="' +
      BLANCO +
      '" stroke="#bdbdbd" stroke-width="2"/>' +
      contenido +
      '</svg>'
    );
  }

  // La "pinta": cortes en los bordes superior e inferior del marco (oros 0, copas 1, espadas 2, bastos 3).
  var MX = 32,
    MY = 32,
    MW = W - 2 * MX,
    MH = H - 2 * MY;
  function pinta(palo, c) {
    var n = palo ? PALOS.indexOf(palo) : 0,
      hueco = 10,
      xs = [MX];
    for (var i = 1; i <= n; i++) {
      var m = MX + (MW * i) / (n + 1);
      xs.push(m - hueco / 2, m + hueco / 2);
    }
    xs.push(MX + MW);
    var d = 'M' + MX + ' ' + MY + 'V' + (MY + MH) + 'M' + (MX + MW) + ' ' + MY + 'V' + (MY + MH);
    for (var j = 0; j < xs.length; j += 2)
      d +=
        'M' +
        f(xs[j]) +
        ' ' +
        MY +
        'H' +
        f(xs[j + 1]) +
        'M' +
        f(xs[j]) +
        ' ' +
        (MY + MH) +
        'H' +
        f(xs[j + 1]);
    return (
      '<path d="' + d + '" stroke="' + (c || COLOR[palo]) + '" stroke-width="2.5" fill="none"/>'
    );
  }

  function indices(texto, c) {
    var t = function (x, y) {
      return (
        '<text x="' +
        x +
        '" y="' +
        y +
        '" fill="' +
        c +
        '" font-family="' +
        FUENTE +
        '" font-size="24" font-weight="700" text-anchor="middle"' +
        (String(texto).length > 1 ? ' letter-spacing="-2"' : '') +
        '>' +
        texto +
        '</text>'
      );
    };
    return t(17, 28) + t(W - 17, H - 10);
  }

  // ---------- Cartas numéricas ----------
  // Oros y copas en cuadrícula [x, y, tamaño]; espadas y bastos en aspas entrecruzadas.
  var C2 = [82, 158],
    F3 = [84, 168, 252];
  var REJILLA = {
    2: [
      [120, 100, 64],
      [120, 236, 64],
    ],
    3: [
      [120, F3[0], 58],
      [120, F3[1], 58],
      [120, F3[2], 58],
    ],
    4: [
      [C2[0], 100, 56],
      [C2[1], 100, 56],
      [C2[0], 236, 56],
      [C2[1], 236, 56],
    ],
    5: [
      [C2[0], F3[0], 52],
      [C2[1], F3[0], 52],
      [120, 168, 52],
      [C2[0], F3[2], 52],
      [C2[1], F3[2], 52],
    ],
    6: [0, 1, 2].reduce(function (a, r) {
      return a.concat([
        [C2[0], F3[r], 52],
        [C2[1], F3[r], 52],
      ]);
    }, []),
    7: [0, 1, 2].reduce(
      function (a, r) {
        return a.concat([
          [C2[0], F3[r], 48],
          [C2[1], F3[r], 48],
        ]);
      },
      [[120, 126, 44]],
    ),
    8: [70, 126, 210, 266].reduce(function (a, y) {
      return a.concat([
        [C2[0], y, 46],
        [C2[1], y, 46],
      ]);
    }, []),
    9: F3.reduce(function (a, y) {
      return a.concat([
        [72, y, 44],
        [120, y, 44],
        [168, y, 44],
      ]);
    }, []),
  };

  // Rejilla para espadas y bastos (más estrechos y altos que oros y copas).
  var R3 = [72, 120, 168];
  var REJILLA_LARGA = {
    4: [
      [84, 110, 66],
      [156, 110, 66],
      [84, 226, 66],
      [156, 226, 66],
    ],
    5: [
      [84, 90, 60],
      [156, 90, 60],
      [120, 168, 60],
      [84, 246, 60],
      [156, 246, 60],
    ],
    6: F3.reduce(function (a, y) {
      return a.concat([
        [84, y, 62],
        [156, y, 62],
      ]);
    }, []),
    7: R3.map(function (x) {
      return [x, F3[0], 58];
    }).concat(
      [[120, F3[1], 58]],
      R3.map(function (x) {
        return [x, F3[2], 58];
      }),
    ),
    8: R3.map(function (x) {
      return [x, F3[0], 58];
    }).concat(
      [
        [84, F3[1], 58],
        [156, F3[1], 58],
      ],
      R3.map(function (x) {
        return [x, F3[2], 58];
      }),
    ),
    9: F3.reduce(function (a, y) {
      return a.concat(
        R3.map(function (x) {
          return [x, y, 58];
        }),
      );
    }, []),
  };

  // 2 y 3: aspa grande en el centro (más una vertical en el 3). Del 4 al 9: rejilla con las columnas inclinadas hacia dentro.
  function aspas(palo, n) {
    if (n <= 3) {
      return (
        pip(palo, 120, 168, 150, -28) +
        pip(palo, 120, 168, 150, 28) +
        (n === 3 ? pip(palo, 120, 168, 150, 0) : '')
      );
    }
    return REJILLA_LARGA[n]
      .map(function (q) {
        var giro = q[0] < 110 ? 16 : q[0] > 130 ? -16 : 0;
        return pip(palo, q[0], q[1], q[2], giro);
      })
      .join('');
  }

  // ---------- Ases ----------
  function as(palo) {
    var c = COLOR[palo];
    var orla =
      '<circle cx="120" cy="168" r="82" fill="none" stroke="' +
      c +
      '" stroke-width="1.2"/>' +
      '<circle cx="120" cy="168" r="77" fill="none" stroke="' +
      c +
      '" stroke-width=".7" stroke-dasharray="2 4"/>';
    var cinta =
      '<path d="M64 262Q120 280 176 262L182 276Q120 296 58 276z" fill="' +
      ROJO +
      '" stroke="' +
      NEGRO +
      '" stroke-width="1.2"/>' +
      '<path d="M58 276L48 270 56 262 64 262M182 276L192 270 184 262 176 262" fill="' +
      ROJO +
      '" stroke="' +
      NEGRO +
      '" stroke-width="1.2"/>' +
      '<path d="M66 268Q120 285 174 268" fill="none" stroke="' +
      AMARILLO +
      '" stroke-width="1" stroke-dasharray="3 3"/>';
    if (palo === 'oros') return orla + pip('oros', 120, 160, 120) + cinta;
    if (palo === 'copas') return orla + pip('copas', 120, 160, 120) + cinta;
    return orla + pip(palo, 120, 160, 120, palo === 'espadas' ? 0 : -8) + cinta;
  }

  // ---------- Figuras ----------
  function patrones(pre) {
    var pat = function (n, w, h, body) {
      return (
        '<pattern id="' +
        pre +
        n +
        '" width="' +
        w +
        '" height="' +
        h +
        '" patternUnits="userSpaceOnUse">' +
        body +
        '</pattern>'
      );
    };
    return (
      pat(
        'rayas',
        8,
        8,
        '<rect width="8" height="8" fill="' +
          AMARILLO +
          '"/><path d="M-2 2l4-4M0 8l8-8M6 10l4-4" stroke="' +
          NEGRO +
          '" stroke-width="1.2"/>',
      ) +
      pat(
        'rombos',
        12,
        12,
        '<rect width="12" height="12" fill="' +
          ROJO +
          '"/><path d="M6 2l3 4-3 4-3-4z" fill="' +
          AMARILLO +
          '"/>',
      ) +
      pat(
        'flores',
        12,
        12,
        '<rect width="12" height="12" fill="' +
          AZUL +
          '"/><path d="M6 3v6M3 6h6" stroke="' +
          AMARILLO +
          '" stroke-width="1.6"/>',
      ) +
      pat(
        'hojas',
        12,
        12,
        '<rect width="12" height="12" fill="' +
          VERDE +
          '"/><path d="M3 9q3-6 6-6-1 5-6 6z" fill="' +
          AMARILLO +
          '"/>',
      ) +
      pat(
        'escamas',
        12,
        10,
        '<rect width="12" height="10" fill="' +
          AMARILLO +
          '"/><path d="M0 10a6 6 0 0 1 12 0M-6 5a6 6 0 0 1 12 0M6 5a6 6 0 0 1 12 0" fill="none" stroke="' +
          ROJO +
          '" stroke-width="1.5"/>',
      ) +
      pat(
        'armino',
        12,
        12,
        '<rect width="12" height="12" fill="' +
          BLANCO +
          '"/><path d="M6 3v5M4.5 8l1.5-1.5L7.5 8" stroke="' +
          NEGRO +
          '" stroke-width="1.3" fill="none"/>',
      ) +
      pat(
        'zigzag',
        10,
        8,
        '<rect width="10" height="8" fill="' +
          BLANCO +
          '"/><path d="M0 6l2.5-4 2.5 4 2.5-4 2.5 4" fill="none" stroke="' +
          ROJO +
          '" stroke-width="1.5"/>',
      ) +
      pat(
        'franjasR',
        8,
        8,
        '<rect width="8" height="8" fill="' +
          AMARILLO +
          '"/><rect width="8" height="3.5" fill="' +
          ROJO +
          '"/>',
      ) +
      pat(
        'franjasA',
        8,
        8,
        '<rect width="8" height="8" fill="' +
          BLANCO +
          '"/><rect width="3.5" height="8" fill="' +
          AZUL +
          '"/>',
      ) +
      '<clipPath id="' +
      pre +
      'marco"><rect x="' +
      MX +
      '" y="' +
      MY +
      '" width="' +
      MW +
      '" height="' +
      MH +
      '"/></clipPath>'
    );
  }

  // Formas [d, relleno, grosor, colorDeLínea]: 'L' = línea, NEGRO = mancha, otro = relleno con contorno. Las cadenas pasan tal cual.
  function imprimir(formas) {
    return formas
      .filter(Boolean)
      .map(function (q) {
        if (typeof q === 'string') return q;
        var d = q[0],
          r = q[1];
        if (r === 'L')
          return (
            '<path d="' +
            d +
            '" fill="none" stroke="' +
            (q[3] || NEGRO) +
            '" stroke-width="' +
            (q[2] || 1) +
            '" stroke-linecap="round" stroke-linejoin="round"/>'
          );
        if (r === NEGRO) return '<path d="' + d + '" fill="' + NEGRO + '"/>';
        return (
          '<path d="' +
          d +
          '" fill="' +
          r +
          '" stroke="' +
          NEGRO +
          '" stroke-width="' +
          (q[2] || 1.5) +
          '" stroke-linejoin="round"/>'
        );
      })
      .join('');
  }

  function mano(x, y) {
    return [['M' + (x - 6) + ' ' + (y - 3) + 'q6-6 12 0 2 8-6 9-6-1-6-9z', PIEL, 1.2]];
  }

  function brazo(sx, sy, x, y, relleno) {
    var dx = x - sx,
      dy = y - sy,
      l = Math.sqrt(dx * dx + dy * dy) || 1,
      nx = -dy / l,
      ny = dx / l;
    return [
      [
        'M' +
          f(sx + nx * 8) +
          ' ' +
          f(sy + ny * 8) +
          'L' +
          f(x + nx * 6) +
          ' ' +
          f(y + ny * 6) +
          'L' +
          f(x - nx * 6) +
          ' ' +
          f(y - ny * 6) +
          'L' +
          f(sx - nx * 8) +
          ' ' +
          f(sy - ny * 8) +
          'z',
        relleno,
      ],
      [
        'M' +
          f(x + nx * 6.5 - (dx / l) * 4) +
          ' ' +
          f(y + ny * 6.5 - (dy / l) * 4) +
          'L' +
          f(x - nx * 6.5 - (dx / l) * 4) +
          ' ' +
          f(y - ny * 6.5 - (dy / l) * 4),
        'L',
        2.5,
      ],
    ].concat(mano(x, y));
  }

  function ojos(cx, cy, sep) {
    return [-1, 1].reduce(function (a, s) {
      var x = cx + s * sep;
      return a.concat([
        ['M' + (x - 4) + ' ' + cy + 'q4-3.5 8 0-4 2.6-8 0z', BLANCO, 0.9],
        ['M' + x + ' ' + (cy + 0.2) + 'a1.5 1.5 0 1 0 .1 0z', NEGRO],
        ['M' + (x - 5) + ' ' + (cy - 4) + 'q5-3 10 0', 'L', 1],
      ]);
    }, []);
  }

  // Colores de cada palo: [ropa, capa, calzas, sombrero]
  var VESTUARIO = {
    oros: { ropa: 'rombos', capa: 'flores', calzas: 'franjasA', gorro: AZUL, caballo: '#f4ead8' },
    copas: { ropa: 'flores', capa: 'rombos', calzas: 'franjasR', gorro: ROJO, caballo: '#b5733a' },
    espadas: {
      ropa: 'escamas',
      capa: 'hojas',
      calzas: 'franjasA',
      gorro: VERDE,
      caballo: '#f4ead8',
    },
    bastos: { ropa: 'hojas', capa: 'rombos', calzas: 'franjasR', gorro: ROJO, caballo: '#b5733a' },
  };

  // Cómo sostiene cada figura su símbolo: posición de la mano y del símbolo [x, y, tamaño, giro].
  var SOSTIENE = {
    rey: {
      oros: { mano: [160, 172], pip: [162, 146, 40, 0] },
      copas: { mano: [80, 172], pip: [78, 146, 40, 0] },
      espadas: { mano: [160, 172], pip: [160, 129, 92, 0] },
      bastos: { mano: [160, 172], pip: [162, 132, 92, -6] },
    },
    sota: {
      oros: { mano: [80, 150], pip: [78, 124, 42, 0] },
      copas: { mano: [160, 172], pip: [160, 146, 40, 0] },
      espadas: { mano: [80, 182], pip: [80, 140, 90, 0] },
      bastos: { mano: [160, 176], pip: [162, 136, 90, 6] },
    },
    caballo: {
      oros: { mano: [160, 130], pip: [168, 104, 38, 0] },
      copas: { mano: [160, 130], pip: [168, 104, 38, 0] },
      espadas: { mano: [160, 130], pip: [160, 92, 84, 0] },
      bastos: { mano: [160, 130], pip: [162, 92, 84, 8] },
    },
  };

  function cabezaRey(u) {
    return [
      ['M104 66Q98 100 104 116H136Q142 100 136 66z', CANO],
      ['M104 78q-2 14 2 30M136 78q2 14-2 30', 'L', 0.8],
      ['M106 62Q106 52 120 52 134 52 134 62V84Q132 94 120 96 108 94 106 84z', PIEL],
    ].concat(ojos(120, 70, 7.5), [
      ['M120 70L118 81 122 82', 'L', 1],
      ['M106 82Q106 110 120 122 134 110 134 82 128 90 120 90 112 90 106 82z', CANO],
      ['M112 96q1 8 4 14M120 96v18M128 96q-1 8-4 14', 'L', 0.8],
      ['M110 86q5-4 10 0 5-4 10 0-5 3-10 1-5 2-10-1z', CANO, 1],
      ['M106 56Q120 36 134 56z', ROJO],
      ['M104 56L102 36 111 46 120 32 129 46 138 36 136 56z', AMARILLO],
      ['M103 52h34v8h-34z', AMARILLO],
      ['M120 56a2.4 2.4 0 1 0 .1 0z', ROJO, 0.7],
      ['M110 56a1.8 1.8 0 1 0 .1 0zM130 56a1.8 1.8 0 1 0 .1 0z', AZUL, 0.7],
      ['M102 36a2 2 0 1 0 .1 0zM120 32a2 2 0 1 0 .1 0zM138 36a2 2 0 1 0 .1 0z', BLANCO, 0.7],
    ]);
  }

  function cabezaJoven(x, y, gorro, pelo, escala) {
    var g =
      '<g transform="translate(' +
      x +
      ' ' +
      y +
      ') scale(' +
      (escala || 1) +
      ') translate(-120 -70)">';
    return (
      g +
      imprimir(
        [
          ['M102 70Q96 100 104 112H136Q144 100 138 70z', pelo],
          ['M104 80q-2 12 2 24M136 80q2 12-2 24', 'L', 0.8],
          ['M106 66Q106 56 120 56 134 56 134 66V88Q132 98 120 100 108 98 106 88z', PIEL],
        ].concat(ojos(120, 74, 7.5), [
          ['M120 74L118 85 122 86', 'L', 1],
          ['M115 92q5 2.5 10 0', 'L', 1.2],
          ['M100 66Q102 44 122 44 144 46 142 66z', gorro],
          ['M98 62h46v6H98z', AMARILLO],
          ['M138 52Q156 32 166 40 154 42 146 56z', BLANCO],
          ['M142 52q8-10 20-12', 'L', 0.7],
        ]),
      ) +
      '</g>'
    );
  }

  function rey(palo, u) {
    var v = VESTUARIO[palo],
      s = SOSTIENE.rey[palo];
    var otraMano = s.mano[0] > 120 ? [86, 196] : [154, 196];
    var simbolo = pip(palo, s.pip[0], s.pip[1], s.pip[2], s.pip[3]);
    return (
      imprimir([
        ['M44 300H196', 'L', 1.4],
        ['M90 112Q60 190 62 298H102L98 120zM150 112Q180 190 178 298H138L142 120z', u(v.capa)],
        ['M74 200q-4 40-2 90M166 200q4 40 2 90', 'L', 0.9],
        ['M94 116H146L160 296H80z', u(v.ropa)],
        ['M112 122H128L132 296H108z', u('rayas')],
        ['M80 284H160V296H80z', u('armino')],
        ['M96 296h22q4 6-2 7H94zM122 296h22q4 6-2 7h-22z', NEGRO],
        ['M88 188H152V197H88z', AMARILLO],
        ['M116 186h8v13h-8z', ROJO, 1.2],
        ['M86 114Q120 100 154 114L158 134Q120 120 82 134z', u('armino')],
      ]) +
      (largo(palo) ? simbolo : '') +
      imprimir(brazo(otraMano[0] > 120 ? 148 : 92, 124, otraMano[0], otraMano[1], u(v.capa))) +
      imprimir(brazo(s.mano[0] > 120 ? 148 : 92, 124, s.mano[0], s.mano[1], u(v.capa))) +
      imprimir(cabezaRey(u)) +
      (largo(palo) ? imprimir(mano(s.mano[0], s.mano[1])) : simbolo)
    );
  }

  function sota(palo, u) {
    var v = VESTUARIO[palo],
      s = SOSTIENE.sota[palo];
    var otraMano = s.mano[0] > 120 ? [86, 192] : [154, 192];
    var simbolo = pip(palo, s.pip[0], s.pip[1], s.pip[2], s.pip[3]);
    return (
      imprimir([
        ['M44 300H196', 'L', 1.4],
        ['M106 214L103 292H115L117 214zM123 214L125 292H137L134 214z', u(v.calzas)],
        ['M96 292h21q4 6-2 8H94zM123 292h21q4 6-2 8h-21z', NEGRO],
        ['M96 118H144L154 222H86z', u(v.ropa)],
        ['M86 208H154L156 222H84z', u('zigzag')],
        ['M90 168H150V176H90z', AMARILLO],
        ['M100 140q-4 30-8 66M140 140q4 30 8 66', 'L', 0.9],
        ['M140 116Q172 132 170 196L152 192Q150 152 134 130z', u(v.capa)],
        [
          'M100 116L104 122 108 116 112 122 116 116 120 122 124 116 128 122 132 116 136 122 140 116 142 124H98z',
          BLANCO,
          1,
        ],
      ]) +
      (largo(palo) ? simbolo : '') +
      imprimir(brazo(otraMano[0] > 120 ? 142 : 98, 126, otraMano[0], otraMano[1], u(v.ropa))) +
      imprimir(brazo(s.mano[0] > 120 ? 142 : 98, 126, s.mano[0], s.mano[1], u(v.ropa))) +
      cabezaJoven(120, 74, v.gorro, AMARILLO) +
      (largo(palo) ? imprimir(mano(s.mano[0], s.mano[1])) : simbolo)
    );
  }

  function caballo(palo, u) {
    var v = VESTUARIO[palo],
      s = SOSTIENE.caballo[palo],
      piel = v.caballo,
      crin = piel === '#f4ead8' ? AMARILLO : CASTANO;
    var patas = [74, 92, 150, 168]
      .map(function (x) {
        return ['M' + x + ' 236h10v50h-10z', piel];
      })
      .concat([['M73 282h12v7H73zM91 282h12v7H91zM149 282h12v7h-12zM167 282h12v7h-12z', NEGRO]]);
    var simbolo = pip(palo, s.pip[0], s.pip[1], s.pip[2], s.pip[3]);
    return (
      imprimir(
        [
          ['M44 292H196', 'L', 1.4],
          ['M182 210q26 12 18 58-6-28-22-40z', crin],
        ].concat(patas, [
          ['M60 222a64 30 0 1 0 128 0a64 30 0 1 0-128 0z', piel],
          ['M72 216q-18-42-6-66h22q-6 36 14 56z', piel],
          ['M66 150q-18 0-28 18-3 9 6 11l28-10q10-10 6-20z', piel],
          ['M70 150l2-14 8 12z', piel],
          ['M86 150q-6 36 14 56l-8 2q-18-22-12-58z', crin],
          ['M58 159a2 2 0 1 0 .1 0z', NEGRO],
          ['M44 172L68 156M62 152L66 172', 'L', 2, ROJO],
          ['M98 194h52l6 46h-64z', u(v.ropa)],
          ['M92 236H156V243H92z', AMARILLO],
          [
            'M96 243l2 6M104 243l2 6M112 243l2 6M120 243l2 6M128 243l2 6M136 243l2 6M144 243l2 6M152 243l2 6',
            'L',
            1,
          ],
          ['M116 198L128 200 124 250 112 248z', u(v.calzas)],
          ['M106 246h20v10h-24z', NEGRO],
          ['M106 150h30l4 52h-38z', u(v.capa)],
          ['M104 194h36v6h-36z', AMARILLO],
          ['M108 176L68 160', 'L', 1.2, CASTANO],
        ]),
      ) +
      imprimir(brazo(112, 158, 108, 178, u(v.capa))) +
      (largo(palo) ? simbolo : '') +
      imprimir(brazo(132, 156, s.mano[0], s.mano[1], u(v.capa))) +
      cabezaJoven(121, 132, v.gorro, AMARILLO, 0.62) +
      (largo(palo) ? imprimir(mano(s.mano[0], s.mano[1])) : simbolo)
    );
  }

  function figura(numero, palo) {
    var pre = 'ec' + ++uid;
    var u = function (n) {
      return 'url(#' + pre + n + ')';
    };
    var dibujo = numero === 12 ? rey(palo, u) : numero === 11 ? caballo(palo, u) : sota(palo, u);
    return svg(
      '<rect x="' +
        MX +
        '" y="' +
        MY +
        '" width="' +
        MW +
        '" height="' +
        MH +
        '" fill="#fbf6ec"/>' +
        '<g clip-path="url(#' +
        pre +
        'marco)">' +
        dibujo +
        '</g>' +
        pinta(palo) +
        indices(numero, COLOR[palo]),
      NOMBRES[numero] + ' de ' + palo,
      patrones(pre),
    );
  }

  function svgCarta(numero, palo) {
    numero = +numero;
    if (NUMEROS.indexOf(numero) < 0 || PALOS.indexOf(palo) < 0)
      throw new Error('Carta no válida: ' + numero + ' de ' + palo);
    if (numero >= 10) return figura(numero, palo);
    var centro =
      numero === 1
        ? as(palo)
        : largo(palo)
          ? aspas(palo, numero)
          : REJILLA[numero]
              .map(function (q) {
                return pip(palo, q[0], q[1], q[2]);
              })
              .join('');
    return svg(
      centro + pinta(palo) + indices(numero, COLOR[palo]),
      (NOMBRES[numero] || numero) + ' de ' + palo,
    );
  }

  // Comodín: bufón de cuerpo entero con cartela.
  function svgComodin(variante) {
    var pre = 'ec' + ++uid;
    var u = function (n) {
      return 'url(#' + pre + n + ')';
    };
    var c = variante === 'azul' ? AZUL : ROJO,
      otro = variante === 'azul' ? ROJO : AZUL;
    var cuerpo =
      imprimir([
        ['M106 214L103 292H115L117 214z', c],
        ['M123 214L125 292H137L134 214z', AMARILLO],
        ['M96 292h21q4 6-2 8H94zM123 292h21q4 6-2 8h-21z', NEGRO],
        ['M96 118H120V222H86zM120 118H144L154 222H120z', c],
        ['M120 118H144L154 222H120z', AMARILLO],
        ['M86 208H154L156 222H84z', u('zigzag')],
        ['M98 116L102 128 108 118 114 130 120 118 126 130 132 118 138 128 142 116z', otro, 1],
      ]) +
      imprimir([
        ['M160 186V96', 'L', 2.4],
        ['M160 88a9 9 0 1 0 .1 0z', AMARILLO],
      ]) +
      imprimir(brazo(142, 126, 160, 180, otro)) +
      imprimir(brazo(98, 126, 86, 190, otro)) +
      '<g transform="translate(120 74) translate(-120 -70)">' +
      imprimir(
        [['M106 66Q106 56 120 56 134 56 134 66V88Q132 98 120 100 108 98 106 88z', PIEL]].concat(
          ojos(120, 74, 7.5),
          [
            ['M120 74L118 85 122 86', 'L', 1],
            ['M113 91q7 5 14 0', 'L', 1.4],
            ['M104 64Q92 40 70 40 84 50 90 66zM136 64Q148 40 170 40 156 50 150 66z', c],
            ['M104 66Q106 26 120 28 134 26 136 66z', otro],
            ['M120 28Q118 44 120 64', 'L', 1],
            ['M70 40a5 5 0 1 0 .1 0zM170 40a5 5 0 1 0 .1 0zM120 24a5 5 0 1 0 .1 0z', AMARILLO],
            ['M102 62h36v7h-36z', AMARILLO],
          ],
        ),
      ) +
      '</g>';
    return svg(
      '<rect x="' +
        MX +
        '" y="' +
        MY +
        '" width="' +
        MW +
        '" height="' +
        MH +
        '" fill="#fbf6ec"/>' +
        '<g clip-path="url(#' +
        pre +
        'marco)"><g transform="translate(0 6)">' +
        cuerpo +
        '</g></g>' +
        '<rect x="64" y="278" width="112" height="22" fill="' +
        BLANCO +
        '" stroke="' +
        NEGRO +
        '" stroke-width="1.4"/>' +
        '<text x="120" y="294" fill="' +
        c +
        '" font-family="' +
        FUENTE +
        '" font-size="15" font-weight="700" text-anchor="middle" letter-spacing="3">COMODÍN</text>' +
        pinta(null, c) +
        indices('★', c),
      'Comodín',
      patrones(pre),
    );
  }

  // ---------- Reversos ----------
  var COLORES_REVERSO = { rojo: '#b3202c', azul: '#1d4f9c', verde: '#1f6b45', negro: '#1d1d1d' };

  function medallon(c) {
    return (
      '<circle cx="120" cy="168" r="44" fill="' +
      BLANCO +
      '" stroke="' +
      c +
      '" stroke-width="3"/>' +
      '<circle cx="120" cy="168" r="39" fill="none" stroke="' +
      AMARILLO +
      '" stroke-width="2"/>' +
      pip('oros', 120, 149, 18) +
      pip('copas', 139, 168, 18) +
      pip('espadas', 120, 187, 15) +
      pip('bastos', 101, 168, 15)
    );
  }

  function svgReverso(nombre, diseno) {
    var c = COLORES_REVERSO[nombre] || nombre || COLORES_REVERSO.rojo;
    var id = 'ecr' + ++uid,
      defs,
      fondo;
    diseno = DISENOS.indexOf(diseno) >= 0 ? diseno : 'clasico';
    if (diseno === 'clasico') {
      defs =
        '<pattern id="' +
        id +
        '" width="16" height="16" patternUnits="userSpaceOnUse"><rect width="16" height="16" fill="' +
        c +
        '"/>' +
        '<path d="M8 0L16 8 8 16 0 8z" fill="none" stroke="' +
        BLANCO +
        '" stroke-opacity=".55" stroke-width="1"/>' +
        '<circle cx="8" cy="8" r="2.2" fill="' +
        AMARILLO +
        '"/><circle cx="0" cy="0" r="1.4" fill="' +
        BLANCO +
        '"/><circle cx="16" cy="16" r="1.4" fill="' +
        BLANCO +
        '"/>' +
        '<circle cx="16" cy="0" r="1.4" fill="' +
        BLANCO +
        '"/><circle cx="0" cy="16" r="1.4" fill="' +
        BLANCO +
        '"/></pattern>';
      fondo =
        '<rect x="12" y="12" width="216" height="312" rx="6" fill="url(#' +
        id +
        ')"/>' +
        '<rect x="18" y="18" width="204" height="300" rx="4" fill="none" stroke="' +
        AMARILLO +
        '" stroke-width="2"/>' +
        medallon(c);
    } else if (diseno === 'cenefa') {
      defs =
        '<pattern id="' +
        id +
        '" width="12" height="12" patternUnits="userSpaceOnUse"><rect width="12" height="12" fill="' +
        BLANCO +
        '"/>' +
        '<path d="M6 2v8M2 6h8" stroke="' +
        c +
        '" stroke-width="1.2"/><circle cx="6" cy="6" r="1.6" fill="' +
        c +
        '"/></pattern>';
      var greca = '';
      for (var x = 20; x < 220; x += 10) greca += 'M' + x + ' 20h5v5h-5zM' + x + ' 311h5v5h-5z';
      for (var y = 30; y < 310; y += 10) greca += 'M20 ' + y + 'h5v5h-5zM215 ' + y + 'h5v5h-5z';
      fondo =
        '<rect x="12" y="12" width="216" height="312" rx="6" fill="' +
        c +
        '"/>' +
        '<path d="' +
        greca +
        '" fill="' +
        AMARILLO +
        '"/>' +
        '<rect x="32" y="32" width="176" height="272" fill="url(#' +
        id +
        ')" stroke="' +
        AMARILLO +
        '" stroke-width="2"/>' +
        medallon(c);
    } else {
      defs =
        '<pattern id="' +
        id +
        '" width="12" height="12" patternUnits="userSpaceOnUse"><rect width="12" height="12" fill="' +
        BLANCO +
        '"/>' +
        '<path d="M0 0h6v6H0zM6 6h6v6H6z" fill="' +
        c +
        '"/></pattern>';
      fondo =
        '<rect x="14" y="14" width="212" height="308" fill="url(#' +
        id +
        ')" stroke="' +
        c +
        '" stroke-width="2"/>' +
        '<rect x="56" y="100" width="128" height="136" rx="10" fill="' +
        BLANCO +
        '" stroke="' +
        c +
        '" stroke-width="3"/>' +
        medallon(c);
    }
    return svg(fondo, 'Reverso', defs);
  }

  // opciones: { cartas: 40 | 48, comodines: bool }
  function crearMazo(opciones) {
    opciones = opciones || {};
    var nums =
      opciones.cartas === 48
        ? NUMEROS
        : NUMEROS.filter(function (n) {
            return n !== 8 && n !== 9;
          });
    var mazo = [];
    PALOS.forEach(function (palo) {
      nums.forEach(function (n) {
        mazo.push({ numero: n, palo: palo, id: n + '-' + palo });
      });
    });
    if (opciones.comodines)
      mazo.push(
        { numero: 0, palo: 'rojo', id: 'comodin-rojo' },
        { numero: 0, palo: 'azul', id: 'comodin-azul' },
      );
    return mazo;
  }

  function barajar(mazo) {
    for (var i = mazo.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var t = mazo[i];
      mazo[i] = mazo[j];
      mazo[j] = t;
    }
    return mazo;
  }

  function svgDe(carta) {
    return carta.numero === 0 ? svgComodin(carta.palo) : svgCarta(carta.numero, carta.palo);
  }

  // Mismo CSS que las otras barajas: las librerías pueden usarse a la vez.
  var CSS =
    '.naipe{width:var(--naipe-ancho,120px);aspect-ratio:240/336;perspective:900px;position:relative;display:inline-block;user-select:none}' +
    '.naipe-interior{position:absolute;inset:0;transform-style:preserve-3d;transition:transform .55s cubic-bezier(.3,.7,.3,1)}' +
    '.naipe.boca-abajo .naipe-interior{transform:rotateY(180deg)}' +
    '.naipe-cara{position:absolute;inset:0;backface-visibility:hidden;-webkit-backface-visibility:hidden;filter:drop-shadow(0 2px 4px rgba(0,0,0,.3))}' +
    '.naipe-dorso{transform:rotateY(180deg)}' +
    '.naipe svg{width:100%;height:100%;display:block}' +
    '.naipe.girable{cursor:pointer}';

  function inyectarCSS() {
    if (typeof document === 'undefined' || document.getElementById('naipes-css')) return;
    var s = document.createElement('style');
    s.id = 'naipes-css';
    s.textContent = CSS;
    document.head.appendChild(s);
  }

  // opciones: { bocaAbajo: bool, girable: bool, reverso: 'rojo'|'azul'|'verde'|'negro'|'#hex', diseno: 'clasico'|'cenefa'|'damero' }
  function elemento(carta, opciones) {
    opciones = opciones || {};
    inyectarCSS();
    var div = document.createElement('div');
    div.className =
      'naipe' + (opciones.bocaAbajo ? ' boca-abajo' : '') + (opciones.girable ? ' girable' : '');
    div.dataset.id = carta.id;
    div.innerHTML =
      '<div class="naipe-interior"><div class="naipe-cara naipe-frente">' +
      svgDe(carta) +
      '</div><div class="naipe-cara naipe-dorso">' +
      svgReverso(opciones.reverso, opciones.diseno) +
      '</div></div>';
    div.girar = function (bocaAbajo) {
      div.classList.toggle('boca-abajo', bocaAbajo);
    };
    if (opciones.girable)
      div.addEventListener('click', function () {
        div.girar();
      });
    return div;
  }

  function imagen(svgTexto) {
    return new Promise(function (ok, error) {
      var img = new Image();
      img.onload = function () {
        ok(img);
      };
      img.onerror = error;
      img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svgTexto);
    });
  }

  global.EspanolaClasica = {
    ANCHO: W,
    ALTO: H,
    PALOS: PALOS,
    NUMEROS: NUMEROS,
    NOMBRES: NOMBRES,
    DISENOS: DISENOS,
    svgCarta: svgCarta,
    svgReverso: svgReverso,
    svgComodin: svgComodin,
    svg: svgDe,
    crearMazo: crearMazo,
    barajar: barajar,
    elemento: elemento,
    imagen: imagen,
  };
})(typeof window !== 'undefined' ? window : globalThis);
