/*!
 * naipes-antiguos.js — Baraja francesa de estilo antiguo (grabado del siglo XIX) en SVG puro.
 * Figuras de cuerpo entero, papel envejecido, tintas planas con ligero desajuste de impresión
 * y cartas sin índices en las esquinas (opcionales). Sin dependencias ni imágenes externas.
 *
 *   NaipesAntiguos.svgCarta('K', 'picas', { indices: false }) -> string SVG
 *   NaipesAntiguos.svgReverso('azul')                          -> string SVG
 *   NaipesAntiguos.svgJoker()                                  -> string SVG
 *   NaipesAntiguos.crearMazo({ jokers: true })                 -> [{ valor, palo, id }, ...]
 *   NaipesAntiguos.barajar(mazo)                               -> mazo barajado (in place)
 *   NaipesAntiguos.elemento(carta, opciones)                   -> <div class="naipe"> con animación de giro
 *   NaipesAntiguos.imagen(svg)                                 -> Promise<HTMLImageElement> para ctx.drawImage
 */
(function (global) {
  'use strict';

  var W = 240,
    H = 336;
  var PALOS = ['picas', 'corazones', 'diamantes', 'treboles'];
  var VALORES = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
  // Tintas de imprenta antigua
  var TINTA = '#1d1a17',
    ROJO = '#c0391f',
    OCRE = '#d99a2b',
    AZUL = '#2f4f86',
    PAPEL = '#efe2c4';
  var FUENTE = "Georgia, 'Times New Roman', serif";
  var uid = 0;

  var FORMAS = {
    corazones:
      '<path d="M50 92C20 68 2 48 2 28 2 12 14 2 28 2c10 0 18 6 22 15C54 8 62 2 72 2c14 0 26 10 26 26 0 20-18 40-48 64z"/>',
    diamantes: '<path d="M50 0Q68 28 88 50 68 72 50 100 32 72 12 50 32 28 50 0z"/>',
    picas:
      '<path d="M50 0C60 18 98 38 98 62c0 16-12 26-25 26-9 0-17-4-21-11 1 11 6 18 14 23H34c8-5 13-12 14-23-4 7-12 11-21 11C14 88 2 78 2 62 2 38 40 18 50 0z"/>',
    treboles:
      '<circle cx="50" cy="26" r="22"/><circle cx="24" cy="57" r="22"/><circle cx="76" cy="57" r="22"/><path d="M45 48h10c0 28 5 42 15 52H30c10-10 15-24 15-52z"/>',
  };

  function color(palo) {
    return palo === 'corazones' || palo === 'diamantes' ? ROJO : TINTA;
  }

  function pip(palo, cx, cy, s, invertido, fill) {
    return (
      '<g fill="' +
      (fill || color(palo)) +
      '" transform="translate(' +
      cx +
      ' ' +
      cy +
      ')' +
      (invertido ? ' rotate(180)' : '') +
      ' translate(' +
      -s / 2 +
      ' ' +
      -s / 2 +
      ') scale(' +
      s / 100 +
      ')">' +
      FORMAS[palo] +
      '</g>'
    );
  }

  function girado(c) {
    return '<g transform="rotate(180 ' + W / 2 + ' ' + H / 2 + ')">' + c + '</g>';
  }

  // Papel envejecido: color base, grano (ruido) y bordes oscurecidos.
  function svg(contenido, etiqueta, defs) {
    var id = 'na' + ++uid;
    return (
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ' +
      W +
      ' ' +
      H +
      '" role="img" aria-label="' +
      etiqueta +
      '">' +
      '<defs>' +
      '<filter id="' +
      id +
      'g" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency=".85" numOctaves="2" seed="' +
      (uid % 50) +
      '"/>' +
      '<feColorMatrix values="0 0 0 0 .45 0 0 0 0 .34 0 0 0 0 .18 .9 0 0 0 -.3"/></filter>' +
      '<radialGradient id="' +
      id +
      'v" cx="50%" cy="50%" r="72%"><stop offset="60%" stop-color="#9c7a40" stop-opacity="0"/><stop offset="100%" stop-color="#9c7a40" stop-opacity=".45"/></radialGradient>' +
      '<clipPath id="' +
      id +
      'c"><rect x="1" y="1" width="' +
      (W - 2) +
      '" height="' +
      (H - 2) +
      '" rx="12"/></clipPath>' +
      (defs || '') +
      '</defs>' +
      '<g clip-path="url(#' +
      id +
      'c)"><rect width="' +
      W +
      '" height="' +
      H +
      '" fill="' +
      PAPEL +
      '"/>' +
      '<rect width="' +
      W +
      '" height="' +
      H +
      '" filter="url(#' +
      id +
      'g)" opacity=".35"/>' +
      '<rect width="' +
      W +
      '" height="' +
      H +
      '" fill="url(#' +
      id +
      'v)"/></g>' +
      contenido +
      '<rect x="1" y="1" width="' +
      (W - 2) +
      '" height="' +
      (H - 2) +
      '" rx="12" fill="none" stroke="#a88d5c" stroke-width="2"/>' +
      '</svg>'
    );
  }

  function esquinas(valor, palo) {
    var c =
      '<text x="20" y="36" fill="' +
      color(palo) +
      '" font-family="' +
      FUENTE +
      '" font-size="26" font-weight="700" text-anchor="middle"' +
      (valor === '10' ? ' letter-spacing="-3"' : '') +
      '>' +
      valor +
      '</text>' +
      pip(palo, 20, 52, 18);
    return c + girado(c);
  }

  // ---------- Cartas numéricas ----------
  var X = [72, 120, 168],
    T = 62,
    B = 274,
    M = 168,
    F4 = [62, 132.7, 203.3, 274];
  var DISPOSICION = {
    2: [
      [1, T],
      [1, B],
    ],
    3: [
      [1, T],
      [1, M],
      [1, B],
    ],
    4: [
      [0, T],
      [2, T],
      [0, B],
      [2, B],
    ],
    5: [
      [0, T],
      [2, T],
      [1, M],
      [0, B],
      [2, B],
    ],
    6: [
      [0, T],
      [2, T],
      [0, M],
      [2, M],
      [0, B],
      [2, B],
    ],
    7: [
      [0, T],
      [2, T],
      [1, 115],
      [0, M],
      [2, M],
      [0, B],
      [2, B],
    ],
    8: [
      [0, T],
      [2, T],
      [1, 115],
      [0, M],
      [2, M],
      [1, 221],
      [0, B],
      [2, B],
    ],
    9: [
      [0, F4[0]],
      [2, F4[0]],
      [0, F4[1]],
      [2, F4[1]],
      [1, M],
      [0, F4[2]],
      [2, F4[2]],
      [0, F4[3]],
      [2, F4[3]],
    ],
    10: [
      [0, F4[0]],
      [2, F4[0]],
      [1, 97],
      [0, F4[1]],
      [2, F4[1]],
      [0, F4[2]],
      [2, F4[2]],
      [1, 239],
      [0, F4[3]],
      [2, F4[3]],
    ],
  };

  function numerica(valor, palo) {
    return DISPOSICION[valor]
      .map(function (p) {
        return pip(palo, X[p[0]], p[1], 42, p[1] > M);
      })
      .join('');
  }

  // As de picas grabado: corona de laurel, cinta, estrellas y ramas, todo en tinta azul.
  function asDePicas() {
    var hojas = '',
      i,
      a,
      x,
      y;
    for (i = 0; i < 13; i++) {
      a = ((200 - i * 13) * Math.PI) / 180;
      x = 120 + Math.cos(a) * 62;
      y = 176 - Math.sin(a) * 62;
      hojas +=
        '<ellipse cx="' +
        x.toFixed(1) +
        '" cy="' +
        y.toFixed(1) +
        '" rx="9" ry="4" transform="rotate(' +
        (-(200 - i * 13) + 60) +
        ' ' +
        x.toFixed(1) +
        ' ' +
        y.toFixed(1) +
        ')"/>';
      x = 240 - x;
      hojas +=
        '<ellipse cx="' +
        x.toFixed(1) +
        '" cy="' +
        y.toFixed(1) +
        '" rx="9" ry="4" transform="rotate(' +
        (200 - i * 13 - 60) +
        ' ' +
        x.toFixed(1) +
        ' ' +
        y.toFixed(1) +
        ')"/>';
    }
    var estrella = function (cx, cy, r) {
      var d = '';
      for (var k = 0; k < 10; k++) {
        var rr = k % 2 ? r * 0.45 : r,
          ang = -Math.PI / 2 + (k * Math.PI) / 5;
        d +=
          (k ? 'L' : 'M') +
          (cx + Math.cos(ang) * rr).toFixed(1) +
          ' ' +
          (cy + Math.sin(ang) * rr).toFixed(1);
      }
      return '<path d="' + d + 'z"/>';
    };
    var rama = function (sx) {
      return (
        '<g transform="translate(120 0) scale(' +
        sx +
        ' 1) translate(-120 0)">' +
        '<path d="M40 300C30 250 50 220 40 180S24 110 44 70" fill="none" stroke="' +
        AZUL +
        '" stroke-width="2"/>' +
        [
          [38, 270, 30],
          [46, 236, -30],
          [36, 200, 30],
          [40, 150, -20],
          [30, 118, 40],
          [44, 86, -30],
        ]
          .map(function (h) {
            return (
              '<path d="M' +
              h[0] +
              ' ' +
              h[1] +
              'q12-10 22-2-12 8-22 2z" transform="rotate(' +
              h[2] +
              ' ' +
              h[0] +
              ' ' +
              h[1] +
              ')"/>'
            );
          })
          .join('') +
        '<circle cx="54" cy="300" r="4"/><circle cx="30" cy="230" r="3.5"/><circle cx="52" cy="160" r="3.5"/>' +
        '</g>'
      );
    };
    return (
      '<g fill="' +
      AZUL +
      '">' +
      rama(1) +
      rama(-1) +
      hojas +
      '<path d="M74 238q46 26 92 0l6 14q-52 28-104 0z"/>' +
      '<path d="M66 64q54-26 108 0l-6 22q-48-20-96 0z"/>' +
      '<path d="M74 72q46-16 92 0" fill="none" stroke="' +
      PAPEL +
      '" stroke-width="1.2" stroke-dasharray="3 3"/>' +
      estrella(84, 112, 6) +
      estrella(156, 112, 6) +
      estrella(120, 100, 7) +
      estrella(100, 262, 5) +
      estrella(140, 262, 5) +
      '</g>' +
      pip('picas', 120, 172, 64, false, TINTA) +
      '<circle cx="120" cy="176" r="46" fill="none" stroke="' +
      AZUL +
      '" stroke-width="1.5"/>'
    );
  }

  // ---------- Figuras: dibujo por capas (color desplazado + contorno), como una impresión antigua ----------
  function patrones(p) {
    var pat = function (n, w, h, body) {
      return (
        '<pattern id="' +
        p +
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
          OCRE +
          '"/><path d="M-2 2l4-4M0 8l8-8M6 10l4-4" stroke="' +
          TINTA +
          '" stroke-width="1.6"/>',
      ) +
      pat(
        'rayasR',
        10,
        10,
        '<rect width="10" height="10" fill="' +
          OCRE +
          '"/><path d="M0 0h10v4H0z" fill="' +
          ROJO +
          '"/>',
      ) +
      pat(
        'rayasA',
        10,
        10,
        '<rect width="10" height="10" fill="' +
          PAPEL +
          '"/><path d="M0 0h4v10H0z" fill="' +
          AZUL +
          '"/>',
      ) +
      pat(
        'escamas',
        14,
        12,
        '<rect width="14" height="12" fill="' +
          OCRE +
          '"/><path d="M0 12a7 7 0 0 1 14 0M-7 6a7 7 0 0 1 14 0M7 6a7 7 0 0 1 14 0" fill="none" stroke="' +
          ROJO +
          '" stroke-width="2"/><circle cx="7" cy="9" r="1.6" fill="' +
          TINTA +
          '"/>',
      ) +
      pat(
        'escamasA',
        14,
        12,
        '<rect width="14" height="12" fill="' +
          AZUL +
          '"/><path d="M0 12a7 7 0 0 1 14 0M-7 6a7 7 0 0 1 14 0M7 6a7 7 0 0 1 14 0" fill="none" stroke="' +
          OCRE +
          '" stroke-width="2"/>',
      ) +
      pat(
        'cuadros',
        10,
        10,
        '<rect width="10" height="10" fill="' +
          PAPEL +
          '"/><path d="M0 0h5v5H0zM5 5h5v5H5z" fill="' +
          TINTA +
          '"/>',
      ) +
      pat(
        'puntos',
        9,
        9,
        '<rect width="9" height="9" fill="' +
          ROJO +
          '"/><circle cx="4.5" cy="4.5" r="1.6" fill="' +
          PAPEL +
          '"/>',
      ) +
      pat(
        'zigzag',
        12,
        10,
        '<rect width="12" height="10" fill="' +
          PAPEL +
          '"/><path d="M0 7l3-4 3 4 3-4 3 4" fill="none" stroke="' +
          ROJO +
          '" stroke-width="2"/>',
      ) +
      pat(
        'armino',
        14,
        14,
        '<rect width="14" height="14" fill="' +
          PAPEL +
          '"/><path d="M7 3v6M5 9l2-2 2 2" stroke="' +
          TINTA +
          '" stroke-width="1.5" fill="none"/>',
      ) +
      pat(
        'ladrillo',
        24,
        12,
        '<rect width="24" height="12" fill="' +
          TINTA +
          '"/><path d="M1 1h21v4H1zM-11 7h21v4h-21zM13 7h21v4H13z" fill="' +
          PAPEL +
          '"/>',
      )
    );
  }

  // Lista de formas [d, relleno]; 'L' = trazo fino de sombreado, TINTA = mancha negra.
  function imprimir(formas) {
    return formas
      .map(function (f) {
        var d = f[0],
          r = f[1];
        if (r === 'L')
          return (
            '<path d="' +
            d +
            '" fill="none" stroke="' +
            TINTA +
            '" stroke-width="1.2" stroke-linecap="round"/>'
          );
        if (r === TINTA) return '<path d="' + d + '" fill="' + TINTA + '"/>';
        return (
          '<path d="' +
          d +
          '" fill="' +
          r +
          '" transform="translate(1.4 1.1)"/>' +
          '<path d="' +
          d +
          '" fill="none" stroke="' +
          TINTA +
          '" stroke-width="2.2" stroke-linejoin="round"/>'
        );
      })
      .join('');
  }

  var CARA = 'M114 54c-8 4-11 14-9 22l-9 11 8 3c0 8 4 14 12 14h18l4-50z';
  var OJO = 'M106 72q7-5 14 0-7 4-14 0z';

  function rey(c, u, objeto) {
    return [
      ['M128 106c48 4 72 44 76 104l4 112h-58V140z', c.B],
      ['M196 180l12 142h-14l-10-136z', u('escamas')],
      objeto,
      ['M84 112c-14 38-18 118-12 180h98c6-62 0-142-14-180z', c.A],
      ['M84 150l76 80v20l-76-80z', TINTA],
      ['M110 172h22l8 120h-38z', u('rayas')],
      ['M72 278h98v14H72z', u('cuadros')],
      ['M96 300h18v12H96zM128 300h18v12h-18z', u('rayasR')],
      ['M90 292h22v8H90zM126 292h22v8h-22z', c.A],
      ['M90 310h28q6 8-4 10H88zM124 310h28q6 8-4 10h-26z', TINTA],
      ['M86 120c-16 30-16 60-6 76l20-4c-4-22-2-42 4-62z', u('rayas')],
      ['M80 192l20-4 2 8-20 4z', u('cuadros')],
      ['M84 200c-2 8 6 12 12 8 6-6 0-14-6-12z', PAPEL],
      ['M110 50c-14 8-14 48-6 66h36c8-20 6-54-6-64z', c.C],
      ['M112 62c-2 14-2 34 2 46M138 60c2 16 2 34-2 48', 'L'],
      ['M88 110q32 26 64 0l4 14q-34 26-70 0z', u('armino')],
      [CARA, PAPEL],
      [OJO, TINTA],
      ['M104 66q8-4 16 0M98 94q10-3 20 2', 'L'],
      ['M104 96c0 16 8 30 14 36 8-10 16-22 16-34z', PAPEL],
      ['M110 104l6 18M118 102l2 20M126 100l-2 18', 'L'],
      ['M104 34h40v16h-40z', c.C],
      ['M104 34l-4-14 12 8 10-10 10 10 12-8-4 14z', c.C],
      ['M106 32q18-12 36 0z', ROJO],
      ['M108 40h4v4h-4zM122 40h4v4h-4zM136 40h4v4h-4z', TINTA],
    ];
  }

  function reina(c, u, objeto) {
    return [
      ['M108 52c-16 18-16 70-10 98h14l6-90z', u('rayas')],
      ['M88 118c-12 52-24 122-28 200h120c-4-78-16-148-28-200z', u('escamas')],
      ['M140 118c30 22 46 102 48 200h-38c0-70-4-130-14-188z', c.B],
      ['M160 150q8 60 10 160M174 170q6 60 6 140', 'L'],
      ['M86 196l70-46 6 14-72 48z', TINTA],
      ['M98 116h46l-4 34h-38z', u('cuadros')],
      ['M60 300h120v18H60z', u('zigzag')],
      ['M96 110q24 16 50 0v10q-26 16-50 0z', c.A],
      ['M100 124c-14 26-8 52 12 58l6-10c-14-6-14-22-10-36z', c.C],
      ['M114 172c-2 8 6 14 12 8 4-6-2-12-8-10z', PAPEL],
      objeto,
      ['M138 124c18 16 22 36 14 52l-12-4c2-14 0-26-8-36z', c.A],
      ['M144 176c-2 8 6 14 12 8 4-6-2-12-8-10z', PAPEL],
      [CARA, PAPEL],
      [OJO, TINTA],
      ['M104 66q8-4 16 0M104 96q6 2 10 0', 'L'],
      ['M112 48q14-12 30 0l-2 20q-14-10-26-6z', c.C],
      ['M110 46l-2-16 8 8 8-12 8 12 8-8-2 16z', OCRE],
      ['M116 36a2 2 0 1 0 0.1 0M128 30a2 2 0 1 0 0.1 0', TINTA],
    ];
  }

  function jota(c, u, objeto, bufon) {
    var gorro = bufon
      ? [
          [
            'M100 56c-6-20 0-34 14-38-14 10-10 22-2 30zM150 56c10-18 26-22 38-12-16-2-24 6-28 16z',
            c.A,
          ],
          ['M98 56c0-22 54-24 54 0z', c.B],
          ['M96 52h58v8H96z', OCRE],
          ['M108 18a6 6 0 1 0 0.1 0M190 42a6 6 0 1 0 0.1 0', OCRE],
        ]
      : [
          ['M100 56c0-24 50-26 52 0z', c.A],
          ['M98 50h56v8H98z', c.C],
          ['M146 40c4-24 20-28 24-20-8 6-14 14-20 24z', OCRE],
        ];
    return [
      ['M16 296h208v26H16z', u('ladrillo')],
      objeto,
      ['M140 108c36 12 50 72 46 142h-20c2-60-6-100-30-126z', c.B],
      ['M180 140c6 30 8 70 6 110h-8c2-40 0-76-6-104z', u('escamasA')],
      ['M94 220l-6 80h14l6-80zM128 220l8 80h14l-6-80z', u('rayasR')],
      ['M80 298h24v8H78zM132 298h24l2 8h-26z', TINTA],
      ['M92 112c-12 38-12 88-8 124h74c2-36 0-86-10-124z', c.A],
      ['M84 214h74l2 22H82z', u('zigzag')],
      ['M108 120h26l2 70h-30z', u('cuadros')],
      ['M86 190h70v8H86z', TINTA],
      ['M96 120c-16 20-18 50-10 66l14-4c-4-16-2-32 6-50z', u('rayas')],
      ['M84 190c-2 8 6 12 12 8 6-6 0-14-6-12z', PAPEL],
      ['M126 56c24 4 26 44 14 56h-14z', c.C],
      ['M132 64q8 16 0 40', 'L'],
      ['M96 108q26 14 52 0v8q-26 14-52 0z', PAPEL],
      [CARA, PAPEL],
      [OJO, TINTA],
      ['M104 66q8-4 16 0M98 94q8-1 14 1', 'L'],
    ].concat(gorro);
  }

  // Objetos que sostienen las figuras (cambian según el palo para dar variedad).
  function objetoRey(palo) {
    return {
      picas: ['M84 60l6-8 6 8v128h-12zM74 186h32v8H74z', PAPEL],
      corazones: ['M86 70h8v128h-8zM90 50a10 10 0 1 0 0.1 0z', OCRE],
      diamantes: ['M72 92q18-26 36 0l-14 4v100h-8V96z', PAPEL],
      treboles: ['M80 112a16 16 0 1 0 0.1 0zM76 96h28v6H76zM88 84h4v12h-4z', OCRE],
    }[palo];
  }
  function objetoReina(palo) {
    return palo === 'diamantes' || palo === 'treboles'
      ? [
          'M152 176l14-100M166 76a8 8 0 1 0 0.1 0M158 70a8 8 0 1 0 0.1 0M174 70a8 8 0 1 0 0.1 0M166 62a8 8 0 1 0 0.1 0',
          OCRE,
        ]
      : [
          'M150 176l12-82h3l-11 82zM162 96c-10-6-12-22-6-30l6 8 6-10 6 10 6-8c6 8 4 24-6 30zM157 140c-12-4-18-14-16-22 10 2 16 10 16 22z',
          OCRE,
        ];
  }
  function objetoJota(palo) {
    return palo === 'picas' || palo === 'diamantes'
      ? ['M68 44h6v256h-6zM74 56c22 0 28 22 22 40l-22-8zM68 56l-10 10 10 6z', PAPEL]
      : ['M70 300l4-250 16-14-8 28-6 236z', OCRE];
  }

  var ESPEJO = { picas: false, corazones: true, diamantes: false, treboles: true };
  var COLORES = {
    picas: { A: ROJO, B: AZUL, C: OCRE },
    corazones: { A: ROJO, B: OCRE, C: AZUL },
    diamantes: { A: AZUL, B: ROJO, C: OCRE },
    treboles: { A: ROJO, B: AZUL, C: OCRE },
  };

  function escena(formas, palo, espejo, extra) {
    var p = 'nf' + ++uid;
    var marco =
      '<rect x="16" y="16" width="208" height="304" fill="none" stroke="' +
      TINTA +
      '" stroke-width="2"/>';
    var dibujo =
      '<g clip-path="url(#' +
      p +
      'clip)"' +
      (espejo ? ' transform="translate(240 0) scale(-1 1)"' : '') +
      '>' +
      imprimir(formas) +
      '</g>';
    var defs =
      patrones(p) +
      '<clipPath id="' +
      p +
      'clip"><rect x="16" y="16" width="208" height="304"/></clipPath>';
    return {
      defs: defs,
      cuerpo: dibujo + (extra || '') + marco,
      u: function (n) {
        return 'url(#' + p + n + ')';
      },
    };
  }

  function figura(valor, palo, opciones) {
    var espejo = ESPEJO[palo],
      c = COLORES[palo];
    // u() necesita el prefijo de patrones de esta carta: se crea antes de armar las formas.
    var p = 'nf' + (uid + 1);
    var u = function (n) {
      return 'url(#' + p + n + ')';
    };
    var formas =
      valor === 'K'
        ? rey(c, u, objetoRey(palo))
        : valor === 'Q'
          ? reina(c, u, objetoReina(palo))
          : jota(c, u, objetoJota(palo));
    var esquina = pip(palo, espejo ? 44 : 196, 42, 30);
    var e = escena(formas, palo, espejo, esquina);
    var contenido = e.cuerpo;
    if (opciones.indices)
      contenido =
        '<g transform="translate(120 168) scale(.84) translate(-120 -168)">' +
        contenido +
        '</g>' +
        esquinas(valor, palo);
    return svg(contenido, valor + ' de ' + palo, e.defs);
  }

  function svgCarta(valor, palo, opciones) {
    opciones = opciones || {};
    valor = String(valor).toUpperCase();
    if (VALORES.indexOf(valor) < 0 || PALOS.indexOf(palo) < 0)
      throw new Error('Carta no válida: ' + valor + ' de ' + palo);
    if ('JQK'.indexOf(valor) >= 0) return figura(valor, palo, opciones);
    var centro =
      valor === 'A'
        ? palo === 'picas'
          ? asDePicas()
          : pip(palo, 120, 168, 48)
        : numerica(+valor, palo);
    return svg(centro + (opciones.indices ? esquinas(valor, palo) : ''), valor + ' de ' + palo);
  }

  function svgJoker(opciones) {
    opciones = opciones || {};
    var p = 'nf' + (uid + 1);
    var u = function (n) {
      return 'url(#' + p + n + ')';
    };
    var formas = jota(
      { A: ROJO, B: AZUL, C: OCRE },
      u,
      ['M70 300l2-230M72 70a12 12 0 1 0 0.1 0', OCRE],
      true,
    );
    var cartela =
      '<rect x="58" y="270" width="124" height="28" fill="' +
      PAPEL +
      '" stroke="' +
      TINTA +
      '" stroke-width="2"/>' +
      '<text x="120" y="290" fill="' +
      TINTA +
      '" font-family="' +
      FUENTE +
      '" font-size="18" font-weight="700" text-anchor="middle" letter-spacing="4">JOKER</text>';
    var e = escena(formas, 'picas', false, cartela);
    return svg(e.cuerpo, 'Comodín', e.defs);
  }

  // Reverso: papel crema con florecillas de seis pétalos impresas en una tinta.
  var COLORES_REVERSO = { azul: AZUL, rojo: ROJO, negro: TINTA, verde: '#2f6b4a' };
  function svgReverso(nombre) {
    var c = COLORES_REVERSO[nombre] || nombre || AZUL;
    var id = 'nr' + ++uid;
    var flor = function (x, y) {
      return (
        '<g transform="translate(' +
        x +
        ' ' +
        y +
        ')"><path d="M0-4.5V4.5M-3.9-2.25 3.9 2.25M-3.9 2.25 3.9-2.25" stroke="' +
        c +
        '" stroke-width="1.6" stroke-linecap="round"/>' +
        '<circle r="1.2" fill="' +
        PAPEL +
        '"/></g>'
      );
    };
    return svg(
      '<rect x="10" y="10" width="220" height="316" fill="url(#' +
        id +
        ')"/>' +
        '<rect x="10" y="10" width="220" height="316" fill="none" stroke="' +
        c +
        '" stroke-width="1.5"/>',
      'Reverso',
      '<pattern id="' +
        id +
        '" width="16" height="16" patternUnits="userSpaceOnUse">' +
        flor(4, 4) +
        flor(12, 12) +
        '<circle cx="12" cy="4" r=".9" fill="' +
        c +
        '"/><circle cx="4" cy="12" r=".9" fill="' +
        c +
        '"/></pattern>',
    );
  }

  function crearMazo(opciones) {
    var mazo = [];
    PALOS.forEach(function (palo) {
      VALORES.forEach(function (valor) {
        mazo.push({ valor: valor, palo: palo, id: valor + '-' + palo });
      });
    });
    if (opciones && opciones.jokers) mazo.push({ valor: 'JOKER', palo: '', id: 'JOKER' });
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

  function svgDe(carta, opciones) {
    return carta.valor === 'JOKER'
      ? svgJoker(opciones)
      : svgCarta(carta.valor, carta.palo, opciones);
  }

  // Mismo CSS que naipes.js y baraja-espanola.js: las librerías pueden usarse a la vez.
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

  // opciones: { bocaAbajo: bool, reverso: 'azul'|'rojo'|'verde'|'negro'|'#hex', girable: bool, indices: bool }
  function elemento(carta, opciones) {
    opciones = opciones || {};
    inyectarCSS();
    var div = document.createElement('div');
    div.className =
      'naipe' + (opciones.bocaAbajo ? ' boca-abajo' : '') + (opciones.girable ? ' girable' : '');
    div.dataset.id = carta.id;
    div.innerHTML =
      '<div class="naipe-interior"><div class="naipe-cara naipe-frente">' +
      svgDe(carta, opciones) +
      '</div><div class="naipe-cara naipe-dorso">' +
      svgReverso(opciones.reverso) +
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

  global.NaipesAntiguos = {
    ANCHO: W,
    ALTO: H,
    PALOS: PALOS,
    VALORES: VALORES,
    svgCarta: svgCarta,
    svgReverso: svgReverso,
    svgJoker: svgJoker,
    svg: svgDe,
    crearMazo: crearMazo,
    barajar: barajar,
    elemento: elemento,
    imagen: imagen,
  };
})(typeof window !== 'undefined' ? window : globalThis);
