/*!
 * baraja-espanola-horror.js — Baraja española de terror (patrón castellano) en SVG puro.
 * Monstruos clásicos de cuerpo entero, palos macabros (oros-calavera, cálices de sangre, dagas y huesos),
 * "pinta" en el marco, comodín de payaso siniestro y varios reversos. Sin dependencias.
 *
 *   Oros:     Sota cabeza de calabaza · Caballo jinete sin cabeza · Rey momia
 *   Copas:    Sota bruja              · Caballo vampiresa         · Rey vampiro
 *   Espadas:  Sota esqueleto          · Caballo la Muerte         · Rey monstruo cosido
 *   Bastos:   Sota zombi              · Caballo novia fantasma    · Rey hombre lobo
 *
 *   EspanolaHorror.svgCarta(12, 'copas')                 -> string SVG (10 = Sota, 11 = Caballo, 12 = Rey)
 *   EspanolaHorror.svgReverso('morado', 'telarana')      -> string SVG (diseños: murcielagos | telarana | calaveras)
 *   EspanolaHorror.svgComodin('rojo')                    -> string SVG ('rojo' | 'negro')
 *   EspanolaHorror.crearMazo({ cartas: 40, comodines })  -> [{ numero, palo, id }, ...]  (cartas: 40 | 48)
 *   EspanolaHorror.barajar(mazo) · elemento(carta, opciones) · imagen(svg)
 */
(function (global) {
  'use strict';

  var W = 240,
    H = 336;
  var PALOS = ['oros', 'copas', 'espadas', 'bastos'];
  var NUMEROS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
  var NOMBRES = { 1: 'As', 10: 'Sota', 11: 'Caballo', 12: 'Rey' };
  var DISENOS = ['murcielagos', 'telarana', 'calaveras'];
  var NEGRO = '#141014',
    ROJO = '#c81e24',
    SANGRE = '#8e0e14',
    AZUL = '#2a3f6b',
    AMARILLO = '#f2c230',
    VERDE = '#3f6b2f',
    MORADO = '#4b2a5e',
    PIEL = '#fbe3cf',
    BLANCO = '#fff',
    HUESO = '#efe6d2',
    ACERO = '#cfd3d8',
    ORO_OSC = '#8a5a00',
    PAPEL = '#f3ecdc',
    NIEBLA = '#ddd3e2',
    LUNA = '#f6f0dc';
  var pielActual = PIEL;
  var FUENTE = "'Times New Roman', Times, Georgia, serif";
  var uid = 0;

  var COLOR = { oros: '#946200', copas: SANGRE, espadas: '#3a3a4e', bastos: '#5a4632' };

  // ---------- Símbolos de los palos (caja de 100x100) ----------
  var FORMAS = {
    // Oro: moneda con calavera grabada
    oros:
      '<circle cx="50" cy="50" r="47" fill="' +
      AMARILLO +
      '" stroke="' +
      NEGRO +
      '" stroke-width="2.5"/>' +
      '<circle cx="50" cy="50" r="40" fill="none" stroke="' +
      ORO_OSC +
      '" stroke-width="2"/>' +
      '<circle cx="50" cy="50" r="43.5" fill="none" stroke="' +
      ORO_OSC +
      '" stroke-width="1" stroke-dasharray="2 3"/>' +
      '<path d="M30 46Q30 22 50 22 70 22 70 46 70 56 64 60L63 68H37L36 60Q30 56 30 46z" fill="#fbe7a1" stroke="' +
      NEGRO +
      '" stroke-width="1.6"/>' +
      '<path d="M36 44Q41 38 47 44 47 51 41 52 35 51 36 44zM64 44Q59 38 53 44 53 51 59 52 65 51 64 44zM50 54l-3 6h6z" fill="' +
      NEGRO +
      '"/>' +
      '<path d="M38 68H62L61 76Q50 82 39 76z" fill="#fbe7a1" stroke="' +
      NEGRO +
      '" stroke-width="1.4"/>' +
      '<path d="M43 68v8M50 68v9M57 68v8" stroke="' +
      NEGRO +
      '" stroke-width="1"/>',
    // Copa: cáliz desbordado de sangre
    copas:
      '<path d="M18 10h64c0 24-10 38-26 44v6c6 1 8 4 8 7s-2 6-8 7v4c10 2 18 8 18 16H26c0-8 8-14 18-16v-4c-6-1-8-4-8-7s2-6 8-7v-6C28 48 18 34 18 10z" fill="#b9b2a6" stroke="' +
      NEGRO +
      '" stroke-width="2"/>' +
      '<path d="M24 30Q50 38 76 30" fill="none" stroke="' +
      NEGRO +
      '" stroke-width="1"/>' +
      '<ellipse cx="50" cy="10" rx="32" ry="5" fill="' +
      SANGRE +
      '" stroke="' +
      NEGRO +
      '" stroke-width="1.5"/>' +
      '<path d="M24 11v12a3 3 0 0 0 6 0V12zM60 12v18a3 3 0 0 0 6 0V11zM70 10v8a3 3 0 0 0 6 0v-9z" fill="' +
      SANGRE +
      '"/>' +
      '<circle cx="50" cy="42" r="4" fill="' +
      SANGRE +
      '" stroke="' +
      NEGRO +
      '"/>' +
      '<ellipse cx="50" cy="67" rx="9" ry="4" fill="' +
      NEGRO +
      '"/>' +
      '<path d="M32 86h36" stroke="' +
      NEGRO +
      '" stroke-width="2"/>',
    // Espada: daga ondulada con guarda de alas de murciélago
    espadas:
      '<path d="M50 2C58 12 46 22 54 32 62 42 48 52 56 66H44C38 52 50 42 44 32 38 22 50 12 50 2z" fill="' +
      ACERO +
      '" stroke="' +
      NEGRO +
      '" stroke-width="1.8"/>' +
      '<path d="M50 10C53 20 46 26 50 34 54 42 47 52 51 64" stroke="' +
      BLANCO +
      '" stroke-width="1.2" fill="none"/>' +
      '<path d="M50 66C42 60 30 62 22 70 28 70 30 74 30 74 34 70 38 72 40 76 44 72 48 72 50 74 52 72 56 72 60 76 62 72 66 70 70 74 70 74 72 70 78 70 70 62 58 60 50 66z" fill="' +
      NEGRO +
      '"/>' +
      '<rect x="45.5" y="75" width="9" height="14" fill="' +
      SANGRE +
      '" stroke="' +
      NEGRO +
      '" stroke-width="1.4"/>' +
      '<circle cx="50" cy="93" r="6" fill="' +
      HUESO +
      '" stroke="' +
      NEGRO +
      '" stroke-width="1.2"/>' +
      '<path d="M47.5 92a1.2 1.2 0 1 0 .1 0M52.5 92a1.2 1.2 0 1 0 .1 0" stroke="' +
      NEGRO +
      '" stroke-width="1.6"/>',
    // Basto: hueso largo
    bastos:
      '<g stroke="' +
      NEGRO +
      '" stroke-width="2"><circle cx="41" cy="10" r="9" fill="' +
      HUESO +
      '"/><circle cx="59" cy="10" r="9" fill="' +
      HUESO +
      '"/>' +
      '<circle cx="41" cy="90" r="9" fill="' +
      HUESO +
      '"/><circle cx="59" cy="90" r="9" fill="' +
      HUESO +
      '"/><rect x="42" y="12" width="16" height="76" fill="' +
      HUESO +
      '"/></g>' +
      '<circle cx="41" cy="10" r="8" fill="' +
      HUESO +
      '"/><circle cx="59" cy="10" r="8" fill="' +
      HUESO +
      '"/>' +
      '<circle cx="41" cy="90" r="8" fill="' +
      HUESO +
      '"/><circle cx="59" cy="90" r="8" fill="' +
      HUESO +
      '"/><rect x="43" y="10" width="14" height="80" fill="' +
      HUESO +
      '"/>' +
      '<path d="M47 24Q46 50 47 76M53 30v20" stroke="#b9ab8f" stroke-width="1.2" fill="none"/>',
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
      '<rect x="1.5" y="1.5" width="' +
      (W - 3) +
      '" height="' +
      (H - 3) +
      '" rx="13" fill="' +
      PAPEL +
      '" stroke="#4a3b30" stroke-width="3"/>' +
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
          MORADO +
          '"/><path d="M-2 2l4-4M0 8l8-8M6 10l4-4" stroke="' +
          NEGRO +
          '" stroke-width="1.4"/>',
      ) +
      pat(
        'rombos',
        12,
        12,
        '<rect width="12" height="12" fill="' +
          SANGRE +
          '"/><path d="M6 2l3 4-3 4-3-4z" fill="' +
          NEGRO +
          '"/>',
      ) +
      pat(
        'flores',
        12,
        12,
        '<rect width="12" height="12" fill="' +
          AZUL +
          '"/><path d="M6 3v6M3 6h6" stroke="' +
          HUESO +
          '" stroke-width="1.4"/>',
      ) +
      pat(
        'hojas',
        12,
        12,
        '<rect width="12" height="12" fill="' +
          VERDE +
          '"/><path d="M3 9q3-6 6-6-1 5-6 6z" fill="' +
          NEGRO +
          '"/>',
      ) +
      pat(
        'escamas',
        12,
        10,
        '<rect width="12" height="10" fill="#3a3a4e"/><path d="M0 10a6 6 0 0 1 12 0M-6 5a6 6 0 0 1 12 0M6 5a6 6 0 0 1 12 0" fill="none" stroke="' +
          ACERO +
          '" stroke-width="1.2"/>',
      ) +
      pat(
        'armino',
        12,
        12,
        '<rect width="12" height="12" fill="' +
          NEGRO +
          '"/><path d="M6 3v5M4.5 8l1.5-1.5L7.5 8" stroke="' +
          HUESO +
          '" stroke-width="1.3" fill="none"/>',
      ) +
      pat(
        'zigzag',
        10,
        8,
        '<rect width="10" height="8" fill="' +
          HUESO +
          '"/><path d="M0 6l2.5-4 2.5 4 2.5-4 2.5 4" fill="none" stroke="' +
          SANGRE +
          '" stroke-width="1.5"/>',
      ) +
      pat(
        'franjasR',
        8,
        8,
        '<rect width="8" height="8" fill="' +
          HUESO +
          '"/><rect width="8" height="4" fill="' +
          NEGRO +
          '"/>',
      ) +
      pat(
        'franjasA',
        8,
        8,
        '<rect width="8" height="8" fill="' +
          HUESO +
          '"/><rect width="4" height="8" fill="' +
          MORADO +
          '"/>',
      ) +
      pat(
        'vendas',
        10,
        8,
        '<rect width="10" height="8" fill="#e2d6b5"/><path d="M0 1l10 2M0 6l10 1" stroke="#8a7a5a" stroke-width="1"/>',
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
    return [['M' + (x - 6) + ' ' + (y - 3) + 'q6-6 12 0 2 8-6 9-6-1-6-9z', pielActual, 1.2]];
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

  // Ropa de cada palo y caballo: pálido (con crin negra) o negro (con ojo rojo).
  var VESTUARIO = {
    oros: {
      ropa: 'rayas',
      capa: 'armino',
      calzas: 'franjasR',
      caballo: NEGRO,
      crin: '#3a2a2e',
      ojo: ROJO,
    },
    copas: {
      ropa: 'rombos',
      capa: 'rayas',
      calzas: 'franjasA',
      caballo: NEGRO,
      crin: '#3a2a2e',
      ojo: ROJO,
    },
    espadas: {
      ropa: 'escamas',
      capa: 'armino',
      calzas: 'franjasR',
      caballo: '#d9d4c7',
      crin: NEGRO,
      ojo: NEGRO,
    },
    bastos: {
      ropa: 'hojas',
      capa: 'flores',
      calzas: 'franjasA',
      caballo: '#d9d4c7',
      crin: NEGRO,
      ojo: NEGRO,
    },
  };

  var PERSONAJES = {
    oros: { sota: 'calabaza', caballo: 'sincabeza', rey: 'momia' },
    copas: { sota: 'bruja', caballo: 'vampiresa', rey: 'vampiro' },
    espadas: { sota: 'esqueleto', caballo: 'muerte', rey: 'monstruo' },
    bastos: { sota: 'zombi', caballo: 'fantasma', rey: 'lobo' },
  };

  // ---------- Personajes de terror (cabezas en coordenadas locales 0–100; la barbilla queda hacia y = 92) ----------
  var CABEZAS_H = (function () {
    var N = '#141014',
      B = '#fff',
      HUESO = '#efe6d2',
      SANGRE = '#8e0e14',
      ROJO = '#c81e24',
      MORADO = '#4b2a5e',
      AMBAR = '#f2c230',
      NARANJA = '#e8781e',
      VERDE = '#4f7a35',
      VERDEZ = '#9db57a',
      VERDEM = '#93b987',
      BRUJA = '#a9c27f',
      PALIDO = '#ece6ef',
      VENDA = '#e2d6b5',
      PELAJE = '#5b4a3e',
      PELAJE2 = '#8a776a',
      FANTASMA = '#dfe8ef',
      GRIS = '#8d8f96';

    function r1(n) {
      return Math.round(n * 10) / 10;
    }
    function p(d, fill, stroke, sw, extra) {
      return (
        '<path d="' +
        d +
        '" fill="' +
        (fill || 'none') +
        '"' +
        (stroke
          ? ' stroke="' +
            stroke +
            '" stroke-width="' +
            (sw || 1.5) +
            '" stroke-linecap="round" stroke-linejoin="round"'
          : '') +
        (extra || '') +
        '/>'
      );
    }
    function c(cx, cy, r, fill, stroke, sw) {
      return (
        '<circle cx="' +
        cx +
        '" cy="' +
        cy +
        '" r="' +
        r +
        '" fill="' +
        fill +
        '"' +
        (stroke ? ' stroke="' + stroke + '" stroke-width="' + (sw || 1) + '"' : '') +
        '/>'
      );
    }
    function espejo(s) {
      return s + '<g transform="translate(100 0) scale(-1 1)">' + s + '</g>';
    }
    function dentado(cx, cy, ra, rb, n, irregular) {
      var d = '';
      for (var i = 0; i < n * 2; i++) {
        var r = i % 2 ? rb : ra * (irregular ? 1 - ((i * 37) % 9) / 60 : 1),
          a = (i * Math.PI) / n;
        d += (i ? 'L' : 'M') + r1(cx + Math.cos(a) * r) + ' ' + r1(cy + Math.sin(a) * r);
      }
      return d + 'z';
    }
    function radiales(cx, cy, ra, rb, n, col, sw) {
      var d = '';
      for (var i = 0; i < n; i++) {
        var a = (i * Math.PI * 2) / n;
        d +=
          'M' +
          r1(cx + Math.cos(a) * ra) +
          ' ' +
          r1(cy + Math.sin(a) * ra) +
          'L' +
          r1(cx + Math.cos(a + 0.1) * rb) +
          ' ' +
          r1(cy + Math.sin(a + 0.1) * rb);
      }
      return p(d, null, col, sw);
    }
    function cuelloVampiro(forro) {
      return espejo(p('M8 98L2 36 30 68z', N) + p('M13 92L9 50 28 72z', forro));
    }
    function caraPalida() {
      return p('M27 40Q27 22 50 22 73 22 73 40L71 66Q65 86 50 92 35 86 29 66z', PALIDO, N, 1.5);
    }
    function calavera() {
      return (
        p('M22 42Q22 8 50 8 78 8 78 42 78 56 70 62L68 74H32L30 62Q22 56 22 42z', HUESO, N, 1.8) +
        espejo(p('M30 40Q38 32 46 40 46 52 38 54 28 52 30 40z', N)) +
        p('M50 52L45 62H55z', N) +
        p('M32 72H68L66 86Q50 94 34 86z', HUESO, N, 1.6) +
        p('M32 77H68M37 72V84M43 72V86M50 72V87M57 72V86M63 72V84', null, N, 1) +
        p('M60 14l-4 8 4 4-3 6', null, N, 0.9)
      );
    }
    function serpiente(x, y, dx, dy, giro) {
      return (
        '<g transform="translate(' +
        x +
        ' ' +
        y +
        ') rotate(' +
        giro +
        ')">' +
        p('M0 0C-6-8 6-14 0-22S-6-34 0-38', null, N, 7) +
        p('M0 0C-6-8 6-14 0-22S-6-34 0-38', null, VERDE, 4.6) +
        '<ellipse cx="0" cy="-41" rx="4.4" ry="5.6" fill="' +
        VERDE +
        '" stroke="' +
        N +
        '" stroke-width="1"/>' +
        c(-1.6, -42, 0.9, AMBAR) +
        c(1.6, -42, 0.9, AMBAR) +
        p('M0-46.5v-3l-1.5-1.5M0-49.5l1.5-1.5', null, ROJO, 0.7) +
        '</g>'
      );
    }

    return {
      vampiro: function () {
        return (
          cuelloVampiro(SANGRE) +
          p('M22 42Q22 8 50 8 78 8 78 42V62H22z', N) +
          caraPalida() +
          p('M24 40Q28 14 50 13 72 14 76 40 68 27 57 26L50 40 43 26Q32 27 24 40z', N) +
          espejo(
            p('M31 45L46 49', null, N, 2.6) +
              p('M33 53Q39 48 45 53 39 56 33 53z', B) +
              c(39, 53, 2.1, ROJO) +
              p('M33 64q4 6 6 12', null, '#b8adc0', 1),
          ) +
          p('M50 53L47 67 52 68', null, N, 1) +
          p('M39 76Q50 81 61 76', null, N, 1.6) +
          p('M43 77L45 85 47 78zM53 78L55 85 57 77z', B, N, 0.8) +
          p('M55 86q1 3-1 6', null, ROJO, 1.4)
        );
      },
      vampiresa: function () {
        return (
          cuelloVampiro(MORADO) +
          p('M18 42Q18 6 50 6 82 6 82 42L86 100 64 96 68 52H32L36 96 14 100z', N) +
          caraPalida() +
          p('M28 36Q36 18 50 20 64 18 72 36 62 26 50 30 38 26 28 36z', N) +
          espejo(
            p('M33 46Q39 43 45 46', null, N, 1.4) +
              p('M33 54Q39 49 45 54 39 57 33 54z', B) +
              c(39, 54, 2, ROJO) +
              p('M33 54l-3-2M34.5 52l-2-3M37 50.5l-1-3', null, N, 0.9),
          ) +
          p('M50 55L48 67 52 68', null, N, 0.9) +
          p('M42 77Q46 74 50 76 54 74 58 77 54 81 50 81 46 81 42 77z', SANGRE, N, 0.8) +
          p('M46 80l1 4 1-3.5M52 80.5l1 3.5 1-4', B, N, 0.5) +
          c(73, 60, 2.2, ROJO, N, 0.7)
        );
      },
      lobo: function () {
        return (
          espejo(p('M16 40L12 0 40 22z', PELAJE, N, 1.5) + p('M19 30L16 9 33 22z', '#2f2620')) +
          p(dentado(50, 52, 47, 38, 24, true), PELAJE) +
          radiales(50, 52, 24, 44, 44, '#2f2620', 1) +
          p('M28 34Q50 24 72 34L70 60H30z', PELAJE2, N, 1) +
          p('M44 30l2 10M50 28v12M56 30l-2 10', null, '#4a3b30', 1) +
          espejo(
            p('M27 40L46 46', null, N, 3.2) +
              p('M31 48Q38 42 45 48 38 52 31 48z', AMBAR, N, 1) +
              p('M38 44.5Q36.5 48 38 51.5 39.5 48 38 44.5z', N),
          ) +
          p('M36 58Q50 50 64 58L62 82Q50 94 38 82z', '#a69584', N, 1.5) +
          '<ellipse cx="50" cy="60" rx="7" ry="4.5" fill="' +
          N +
          '"/>' +
          p('M37 76Q50 98 63 76Q50 84 37 76z', SANGRE, N, 1.2) +
          p('M39 77L41 84 43 78 45 84 47 79 50 85 53 79 55 84 57 78 59 84 61 77', B, N, 0.6) +
          p('M40 86l2-4 2 4M56 86l2-4 2 4', B, N, 0.6)
        );
      },
      zombi: function () {
        return (
          p('M24 32L20 12 30 20 32 6 40 16 48 2 54 14 62 4 66 18 78 10 76 32z', '#3b3226') +
          p('M24 32Q24 12 50 12 76 12 76 34L74 62Q70 84 52 92 32 90 28 70z', VERDEZ, N, 1.5) +
          p('M24 32Q34 22 44 28 52 18 60 26 70 18 76 32', null, '#3b3226', 3) +
          p('M58 30L72 34 68 46 58 42z', '#c9a6a0', N, 1) +
          p('M56 26l18 5M60 24l-1 4M65 25.5l-1 4M70 27l-1 4', null, N, 1) +
          c(38, 50, 7.5, B, N, 1.2) +
          c(39, 51, 1.8, N) +
          p('M55 46Q62 41 69 47 62 53 55 48z', '#2b2b22') +
          c(62, 47, 1.2, ROJO) +
          p('M30 59q8 4 16 0M55 57q8 4 14 0', null, '#5b6b45', 1.3) +
          p('M47 64h1.5M52 64h1.5', null, N, 2.2) +
          p('M34 74Q50 68 66 74L64 83Q50 87 36 83z', '#3b1f1f', N, 1.2) +
          p('M40 72v6M45 71v7M50 71v6M55 71v7M60 72v5', null, HUESO, 2.2) +
          p('M28 64l8 4M70 68l-6 6', null, SANGRE, 2)
        );
      },
      bruja: function () {
        return (
          espejo(p('M24 44Q14 78 10 100L28 96Q28 72 34 54z', '#3d3d3d', N, 1)) +
          p('M30 46Q30 34 50 34 70 34 70 46L68 70Q62 88 50 92 38 88 32 70z', BRUJA, N, 1.5) +
          espejo(
            p('M32 52L46 56', null, N, 2) +
              p('M34 59Q40 55 46 59 40 62 34 59z', AMBAR, N, 0.9) +
              c(40, 59, 1.6, N),
          ) +
          p('M51 56Q47 70 38 78Q47 78 53 73z', BRUJA, N, 1.2) +
          c(42, 74, 2, '#6f8a4f', N, 0.6) +
          p('M38 84Q50 90 64 80', null, N, 1.6) +
          p('M56 84.5l1 3 2-3.5', B, N, 0.5) +
          p('M2 42Q50 30 98 42 50 52 2 42z', N) +
          p('M26 40L52 8Q60 0 66 6L74 40z', N) +
          p('M52 8Q66-2 84 8 70 6 62 12z', N) +
          p('M28 32H72L73 39H27z', MORADO) +
          p('M45 31h10v9H45z', 'none', AMBAR, 1.6)
        );
      },
      monstruo: function () {
        return (
          p('M34 86H66V100H34z', VERDEM, N, 1.2) +
          espejo(p('M12 70h12v8H12z', GRIS, N, 1.2) + p('M8 67h4v14H8z', '#55565c', N, 1)) +
          p('M25 20H75L77 70Q72 88 50 92 28 88 23 70z', VERDEM, N, 1.6) +
          p('M23 32V10H77V32Q67 25 58 31 50 23 42 31 33 25 23 32z', N) +
          p('M30 37H70', null, N, 1.2) +
          p('M34 34v6M42 34v6M50 34v6M58 34v6M66 34v6', null, N, 1) +
          p('M26 44H74V50H26z', '#7ca06f', N, 1) +
          espejo(
            '<ellipse cx="39" cy="56" rx="6.5" ry="3.6" fill="' + N + '"/>' + c(37.5, 55, 1, B),
          ) +
          p('M50 54V69H46', null, N, 1.2) +
          p('M37 79H63', null, N, 2.2) +
          p('M28 64l9 9M29 72l5-5M33 76l5-5', null, N, 1)
        );
      },
      momia: function () {
        return (
          p('M24 40Q24 10 50 10 76 10 76 40L74 70Q68 90 50 92 32 90 26 70z', VENDA, N, 1.6) +
          p(
            'M26 22L74 30M24 33L76 40M25 45L76 49M26 64L74 68M28 74L72 79M32 83L68 87M30 16L62 12M50 10l-8 14M70 58l6 6',
            null,
            '#8a7a5a',
            1.2,
          ) +
          p('M27 50L73 54 73 61 27 57z', '#2a2018') +
          c(40, 55, 2.8, AMBAR) +
          c(60, 57, 2.8, AMBAR) +
          p('M74 70q12 6 10 24-4-10-12-15z', VENDA, N, 1)
        );
      },
      esqueleto: function () {
        return calavera();
      },
      muerte: function () {
        return (
          p('M6 100Q2 40 20 18 36 0 50 0 64 0 80 18 98 40 94 100z', N) +
          p('M20 40Q20 80 22 100M80 40Q80 80 78 100', null, '#3a3340', 1.2) +
          p('M24 40Q26 15 50 13 74 15 76 40L74 94H26z', '#231c26') +
          '<g transform="translate(18 20) scale(.64)">' +
          calavera() +
          '</g>' +
          c(42.2, 46, 2, ROJO) +
          c(57.8, 46, 2, ROJO)
        );
      },
      calabaza: function () {
        return (
          p('M46 12Q46 2 56 2L55 13z', VERDE, N, 1.2) +
          p('M56 4q10-4 12 4-6-2-10 1', null, VERDE, 1.4) +
          p(
            'M50 12C20 10 8 34 10 56 12 80 30 92 50 92 70 92 88 80 90 56 92 34 80 10 50 12z',
            NARANJA,
            N,
            1.8,
          ) +
          p(
            'M50 14Q36 50 50 90M50 14Q64 50 50 90M34 16Q18 50 32 88M66 16Q82 50 68 88',
            null,
            '#b4561a',
            1.2,
          ) +
          espejo(p('M28 48L40 36 45 52z', AMBAR, N, 1.2)) +
          p('M45 60L50 51 55 60z', AMBAR, N, 1) +
          p(
            'M23 66Q50 86 77 66L73 77 66 72 60 81 54 74 48 83 42 74 36 81 31 72 27 77z',
            AMBAR,
            N,
            1.2,
          )
        );
      },
      fantasma: function () {
        return (
          p('M10 100Q4 50 18 20 34 2 50 2 66 2 82 20 96 50 90 100z', '#f7f7fa', '#9aa4b2', 1.2) +
          p(
            'M14 96Q8 50 20 24 34 8 50 8 66 8 80 24 92 50 86 96',
            null,
            '#c3cad4',
            1,
            ' stroke-dasharray="1 3"',
          ) +
          p('M24 40Q20 80 26 100H74Q80 80 76 40z', '#e8e8ef', '#9aa4b2', 1) +
          p('M30 40Q30 24 50 24 70 24 70 40L68 66Q62 86 50 90 38 86 32 66z', FANTASMA, N, 1.4) +
          espejo(
            '<ellipse cx="40" cy="50" rx="5.5" ry="7" fill="#1d2430"/>' +
              c(41.5, 48, 1, B) +
              p('M40 58q-1 10 1 16', null, '#9aa4b2', 1),
          ) +
          '<ellipse cx="50" cy="76" rx="5" ry="8" fill="#1d2430"/>' +
          [26, 34, 42, 50, 58, 66, 74]
            .map(function (x, i) {
              return c(x, 20 - Math.abs(3 - i) * -1 - 4, 3.2, '#cfd6df', '#9aa4b2', 0.8);
            })
            .join('')
        );
      },
      medusa: function () {
        return (
          serpiente(26, 40, 0, 0, -50) +
          serpiente(74, 40, 0, 0, 50) +
          serpiente(32, 26, 0, 0, -22) +
          serpiente(68, 26, 0, 0, 22) +
          serpiente(50, 22, 0, 0, 0) +
          serpiente(20, 60, 0, 0, -80) +
          serpiente(80, 60, 0, 0, 80) +
          p('M30 40Q30 24 50 24 70 24 70 40L68 66Q62 86 50 92 38 86 32 66z', '#b9d0a2', N, 1.5) +
          espejo(
            p('M33 47Q39 44 45 47', null, N, 1.4) +
              p('M33 54Q39 49 45 54 39 57 33 54z', AMBAR, N, 0.9) +
              p('M39 50.5Q38 54 39 57.5 40 54 39 50.5z', N),
          ) +
          p('M50 55L48 67 52 68', null, N, 0.9) +
          p('M43 77Q50 74 57 77 50 81 43 77z', '#4f7a35', N, 0.8) +
          p('M50 80v5l-1.5 1.5M50 85l1.5 1.5', null, ROJO, 0.8)
        );
      },
      payaso: function () {
        return (
          espejo(p(dentado(18, 46, 20, 9, 9, true), ROJO, N, 1)) +
          p('M26 40Q26 14 50 14 74 14 74 40L72 66Q66 88 50 92 34 88 28 66z', B, N, 1.5) +
          p('M40 16L50 -2 60 16z', MORADO, N, 1.2) +
          c(50, -2, 3.4, AMBAR, N, 0.8) +
          espejo(
            p('M38 36L44 48 38 62 32 48z', MORADO, N, 1) +
              p('M33 47Q38 43 43 47 38 51 33 47z', B, N, 0.8) +
              c(38, 47, 1.6, ROJO) +
              p('M30 32Q36 26 44 32', null, N, 1.6),
          ) +
          c(50, 60, 7, ROJO, N, 1.2) +
          c(48, 57.5, 2, '#f2a0a0') +
          p('M30 70Q50 93 70 70 60 78 50 78 40 78 30 70z', ROJO, N, 1.2) +
          p('M35 73L38 80 41 76 44 82 47 77 50 83 53 77 56 82 59 76 62 80 65 73', B, N, 0.7) +
          p('M30 70l-6-7M70 70l6-7', null, ROJO, 2.6)
        );
      },
      sincabeza: function () {
        return (
          p('M30 92Q50 80 70 92V100H30z', '#3a1010', N, 1.2) +
          '<ellipse cx="50" cy="90" rx="13" ry="4" fill="' +
          SANGRE +
          '" stroke="' +
          N +
          '"/>' +
          p('M44 84q-4-8 2-14M52 82q4-10-2-18M58 86q6-6 2-12', null, '#8d8f96', 1.2)
        );
      },
    };
  })();

  // Color de las manos de cada personaje.
  var PIEL_H = {
    vampiro: '#ece6ef',
    vampiresa: '#ece6ef',
    lobo: '#5b4a3e',
    zombi: '#9db57a',
    bruja: '#a9c27f',
    monstruo: '#93b987',
    momia: '#e2d6b5',
    esqueleto: '#efe6d2',
    muerte: '#efe6d2',
    calabaza: '#3a2a20',
    fantasma: '#dfe8ef',
    medusa: '#b9d0a2',
    payaso: '#fff',
    sincabeza: '#3a2a20',
  };

  // Cabeza de terror colocada con el centro en cx y la barbilla en yBarbilla; los reyes llevan corona.
  function cabezaH(nombre, cx, yBarbilla, s, corona) {
    var x = cx - 50 * s,
      y = yBarbilla - 92 * s;
    var c = corona
      ? (function () {
          var b = yBarbilla - 80 * s,
            w = (34 * s) / 0.58;
          return imprimir([
            [
              'M' +
                f(cx - w / 2) +
                ' ' +
                f(b) +
                'L' +
                f(cx - w / 2 - 2) +
                ' ' +
                f(b - 18) +
                'L' +
                f(cx - w / 4) +
                ' ' +
                f(b - 9) +
                'L' +
                cx +
                ' ' +
                f(b - 22) +
                'L' +
                f(cx + w / 4) +
                ' ' +
                f(b - 9) +
                'L' +
                f(cx + w / 2 + 2) +
                ' ' +
                f(b - 18) +
                'L' +
                f(cx + w / 2) +
                ' ' +
                f(b) +
                'z',
              AMARILLO,
            ],
            ['M' + cx + ' ' + f(b - 6) + 'a2.4 2.4 0 1 0 .1 0z', ROJO, 0.7],
          ]);
        })()
      : '';
    return (
      '<g transform="translate(' +
      f(x) +
      ' ' +
      f(y) +
      ') scale(' +
      s +
      ')">' +
      CABEZAS_H[nombre]() +
      '</g>' +
      c
    );
  }

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
        ['M94 116H146L160 296H80z', PERSONAJES[palo].rey === 'momia' ? u('vendas') : u(v.ropa)],
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
      cabezaH(PERSONAJES[palo].rey, 120, 112, 0.7, true) +
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
      cabezaH(PERSONAJES[palo].sota, 120, 108, 0.68) +
      (largo(palo) ? imprimir(mano(s.mano[0], s.mano[1])) : simbolo)
    );
  }

  function caballo(palo, u) {
    var v = VESTUARIO[palo],
      s = SOSTIENE.caballo[palo],
      piel = v.caballo,
      crin = v.crin;
    var patas = [74, 92, 150, 168]
      .map(function (x) {
        return ['M' + x + ' 236h10v50h-10z', piel];
      })
      .concat([
        ['M73 282h12v7H73zM91 282h12v7H91zM149 282h12v7h-12zM167 282h12v7h-12z', '#55565c'],
      ]);
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
          ['M58 159a2.4 2.4 0 1 0 .1 0z', v.ojo],
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
          ['M108 176L68 160', 'L', 1.2, '#6b4423'],
        ]),
      ) +
      imprimir(brazo(112, 158, 108, 178, u(v.capa))) +
      (largo(palo) ? simbolo : '') +
      imprimir(brazo(132, 156, s.mano[0], s.mano[1], u(v.capa))) +
      cabezaH(PERSONAJES[palo].caballo, 121, 152, 0.46) +
      (largo(palo) ? imprimir(mano(s.mano[0], s.mano[1])) : simbolo)
    );
  }

  function murcielago(x, y, s, col) {
    return (
      '<path transform="translate(' +
      x +
      ' ' +
      y +
      ') scale(' +
      s +
      ')" fill="' +
      (col || NEGRO) +
      '" d="M0 0q-4-6-12-6 3 3 2 7-4-3-8-1 3 2 2 6 6-4 12-2 2-3 4-4 2 1 2 2 2-2 2-4 2 2 2 4 0-1 2-2 2 1 4 4 6-2 12 2-1-4 2-6-4-2-8 1-1-4 2-7-8 0-12 6-1-3-2-4-1 1-2 4z"/>'
    );
  }

  function gotas() {
    return [
      [46, 10],
      [60, 16],
      [178, 12],
      [194, 7],
    ]
      .map(function (g) {
        return (
          '<path d="M' +
          (g[0] - 3) +
          ' ' +
          MY +
          'v' +
          g[1] +
          'a3 3 0 0 0 6 0v-' +
          g[1] +
          'z" fill="' +
          SANGRE +
          '"/>'
        );
      })
      .join('');
  }

  function figura(numero, palo) {
    var pre = 'eh' + ++uid;
    var u = function (n) {
      return 'url(#' + pre + n + ')';
    };
    var quien = PERSONAJES[palo][numero === 12 ? 'rey' : numero === 11 ? 'caballo' : 'sota'];
    pielActual = PIEL_H[quien];
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
        '" fill="' +
        NIEBLA +
        '"/>' +
        '<g clip-path="url(#' +
        pre +
        'marco)"><circle cx="' +
        (numero === 11 ? 150 : 120) +
        '" cy="' +
        (numero === 11 ? 80 : 86) +
        '" r="44" fill="' +
        LUNA +
        '"/>' +
        murcielago(64, 70, 0.8) +
        murcielago(182, 210, 0.6) +
        dibujo +
        gotas() +
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
    var pre = 'eh' + ++uid;
    var u = function (n) {
      return 'url(#' + pre + n + ')';
    };
    var c = variante === 'negro' ? NEGRO : SANGRE,
      otro = MORADO;
    pielActual = BLANCO;
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
      cabezaH('payaso', 120, 110, 0.68);
    return svg(
      '<rect x="' +
        MX +
        '" y="' +
        MY +
        '" width="' +
        MW +
        '" height="' +
        MH +
        '" fill="' +
        NIEBLA +
        '"/>' +
        '<g clip-path="url(#' +
        pre +
        'marco)"><circle cx="120" cy="86" r="44" fill="' +
        LUNA +
        '"/><g transform="translate(0 6)">' +
        cuerpo +
        '</g>' +
        gotas() +
        '</g>' +
        '<rect x="64" y="278" width="112" height="22" fill="' +
        PAPEL +
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
  var COLORES_REVERSO = { morado: '#2a1f33', negro: '#141014', rojo: '#4a0c10', verde: '#1c2b1f' };

  function svgReverso(nombre, diseno) {
    var c = COLORES_REVERSO[nombre] || nombre || COLORES_REVERSO.morado;
    var id = 'ehr' + ++uid,
      defs = '',
      fondo;
    diseno = DISENOS.indexOf(diseno) >= 0 ? diseno : 'murcielagos';
    var marco = '<rect x="12" y="12" width="216" height="312" rx="6" fill="' + c + '"/>';
    if (diseno === 'murcielagos') {
      defs =
        '<pattern id="' +
        id +
        '" width="40" height="34" patternUnits="userSpaceOnUse">' +
        murcielago(10, 10, 0.6, LUNA) +
        murcielago(30, 27, 0.6, LUNA) +
        '</pattern>';
      fondo =
        marco +
        '<rect x="12" y="12" width="216" height="312" rx="6" fill="url(#' +
        id +
        ')" opacity=".25"/>' +
        '<rect x="20" y="20" width="200" height="296" rx="3" fill="none" stroke="' +
        LUNA +
        '" stroke-opacity=".6" stroke-width="1.5"/>' +
        '<circle cx="120" cy="168" r="50" fill="' +
        LUNA +
        '"/>' +
        murcielago(120, 168, 2.6) +
        '<circle cx="120" cy="168" r="56" fill="none" stroke="' +
        LUNA +
        '" stroke-width="1"/>';
    } else if (diseno === 'telarana') {
      var d = '',
        a,
        k,
        r;
      for (k = 0; k < 12; k++) {
        a = (k * Math.PI) / 6;
        d += 'M120 168L' + f(120 + Math.cos(a) * 200) + ' ' + f(168 + Math.sin(a) * 200);
      }
      for (r = 18; r < 200; r += 18) {
        for (k = 0; k < 12; k++) {
          var a1 = (k * Math.PI) / 6,
            a2 = ((k + 1) * Math.PI) / 6,
            am = (a1 + a2) / 2;
          d +=
            (k ? '' : 'M' + f(120 + Math.cos(a1) * r) + ' ' + f(168 + Math.sin(a1) * r)) +
            'Q' +
            f(120 + Math.cos(am) * r * 0.86) +
            ' ' +
            f(168 + Math.sin(am) * r * 0.86) +
            ' ' +
            f(120 + Math.cos(a2) * r) +
            ' ' +
            f(168 + Math.sin(a2) * r);
        }
      }
      defs =
        '<clipPath id="' +
        id +
        '"><rect x="12" y="12" width="216" height="312" rx="6"/></clipPath>';
      fondo =
        marco +
        '<g clip-path="url(#' +
        id +
        ')">' +
        '<path d="' +
        d +
        '" fill="none" stroke="#b9b0c4" stroke-width=".8"/>' +
        '</g>' +
        '<path d="M120 12V150" stroke="#b9b0c4" stroke-width="1"/>' +
        '<ellipse cx="120" cy="160" rx="9" ry="11" fill="' +
        NEGRO +
        '" stroke="#b9b0c4" stroke-width="1"/><circle cx="120" cy="146" r="6" fill="' +
        NEGRO +
        '" stroke="#b9b0c4" stroke-width="1"/>' +
        '<path d="M112 152l-12-8-4 6M112 158l-14 0-4 6M112 164l-12 8-2 8M128 152l12-8 4 6M128 158l14 0 4 6M128 164l12 8 2 8" fill="none" stroke="#b9b0c4" stroke-width="1.4"/>' +
        '<circle cx="117" cy="145" r="1.2" fill="' +
        ROJO +
        '"/><circle cx="123" cy="145" r="1.2" fill="' +
        ROJO +
        '"/>' +
        '<path d="M116 156l4 8 4-8z" fill="' +
        ROJO +
        '"/>';
    } else {
      defs =
        '<pattern id="' +
        id +
        '" width="24" height="24" patternUnits="userSpaceOnUse"><g transform="translate(5 5) scale(.14)" opacity=".35">' +
        CABEZAS_H.esqueleto() +
        '</g></pattern>';
      fondo =
        marco +
        '<rect x="12" y="12" width="216" height="312" rx="6" fill="url(#' +
        id +
        ')"/>' +
        '<rect x="20" y="20" width="200" height="296" rx="3" fill="none" stroke="' +
        HUESO +
        '" stroke-opacity=".7" stroke-width="1.5"/>' +
        '<circle cx="120" cy="168" r="50" fill="' +
        c +
        '" stroke="' +
        HUESO +
        '" stroke-width="3"/>' +
        '<g transform="translate(90 136) scale(.6)">' +
        CABEZAS_H.esqueleto() +
        '</g>';
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
        { numero: 0, palo: 'negro', id: 'comodin-negro' },
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

  // opciones: { bocaAbajo: bool, girable: bool, reverso: 'morado'|'negro'|'rojo'|'verde'|'#hex', diseno: 'murcielagos'|'telarana'|'calaveras' }
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

  global.EspanolaHorror = {
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
