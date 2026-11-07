/*!
 * naipes-clasicos.js — Baraja francesa de diseño clásico (patrón inglés) en SVG puro.
 * Figuras de dos cabezas con ropajes estampados en rojo, azul, amarillo y negro,
 * as de picas ornamentado, comodín de bufón y varios reversos. Sin dependencias.
 *
 *   NaipesClasicos.svgCarta('K', 'corazones')     -> string SVG
 *   NaipesClasicos.svgReverso('rojo', 'rombos')   -> string SVG (diseños: rombos | roseta | trama | marco)
 *   NaipesClasicos.svgJoker('color')              -> string SVG ('color' | 'negro')
 *   NaipesClasicos.crearMazo({ jokers: true })    -> [{ valor, palo, id }, ...]
 *   NaipesClasicos.barajar(mazo)                  -> mazo barajado (in place)
 *   NaipesClasicos.elemento(carta, opciones)      -> <div class="naipe"> con animación de giro
 *   NaipesClasicos.imagen(svg)                    -> Promise<HTMLImageElement> para ctx.drawImage
 */
(function (global) {
  'use strict';

  var W = 240,
    H = 336,
    MITAD = 168;
  var PALOS = ['picas', 'corazones', 'diamantes', 'treboles'];
  var VALORES = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
  var MORENO = '#2a1d17';
  var NEGRO = '#151515',
    ROJO = '#c8202f',
    AZUL = '#1d4f9c',
    AMARILLO = '#f2b51c',
    PIEL = '#fdeee2',
    BLANCO = '#fff',
    ACERO = '#dfe6ee';
  var FUENTE = "'Times New Roman', Times, Georgia, serif";
  var DISENOS = ['rombos', 'roseta', 'trama', 'marco'];
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
    return palo === 'corazones' || palo === 'diamantes' ? ROJO : NEGRO;
  }
  function f(n) {
    return Math.round(n * 10) / 10;
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
    return '<g transform="rotate(180 ' + W / 2 + ' ' + MITAD + ')">' + c + '</g>';
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

  function esquinas(valor, palo, c) {
    c = c || color(palo);
    var t =
      valor === 'JOKER'
        ? 'JOKER'
            .split('')
            .map(function (l, i) {
              return (
                '<text x="20" y="' +
                (30 + i * 19) +
                '" fill="' +
                c +
                '" font-family="' +
                FUENTE +
                '" font-size="18" font-weight="700" text-anchor="middle">' +
                l +
                '</text>'
              );
            })
            .join('')
        : '<text x="20" y="40" fill="' +
          c +
          '" font-family="' +
          FUENTE +
          '" font-size="30" font-weight="700" text-anchor="middle"' +
          (valor === '10' ? ' letter-spacing="-3"' : '') +
          '>' +
          valor +
          '</text>' +
          pip(palo, 20, 57, 17);
    return t + girado(t);
  }

  // ---------- Cartas numéricas y ases ----------
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

  // As de picas: pica grande con filigrana, roseta central y volutas.
  function asDePicas() {
    var voluta = function (sx) {
      return (
        '<g transform="translate(120 0) scale(' +
        sx +
        ' 1) translate(-120 0)" fill="none" stroke="' +
        NEGRO +
        '" stroke-linecap="round">' +
        '<path d="M70 170C44 170 40 140 58 134 70 130 76 144 66 150" stroke-width="2.4"/>' +
        '<path d="M74 214C50 230 54 262 74 260 88 258 86 240 74 242" stroke-width="2.4"/>' +
        '<path d="M66 150q-8 12 4 20M74 242q-12-6-4-18" stroke-width="1.2"/>' +
        '<circle cx="58" cy="134" r="3" fill="' +
        NEGRO +
        '"/><circle cx="74" cy="242" r="2.5" fill="' +
        NEGRO +
        '"/></g>'
      );
    };
    var petalos = '';
    for (var i = 0; i < 8; i++) {
      petalos +=
        '<ellipse cx="120" cy="171" rx="4" ry="11" fill="' +
        BLANCO +
        '" transform="rotate(' +
        i * 45 +
        ' 120 182)"/>';
    }
    return (
      voluta(1) +
      voluta(-1) +
      pip('picas', 120, 176, 128, false, NEGRO) +
      '<g transform="translate(120 176) scale(.82) translate(-120 -176)">' +
      pip('picas', 120, 176, 128, false, 'none').replace(
        '<g fill="none"',
        '<g fill="none" stroke="' + BLANCO + '" stroke-width="2.4"',
      ) +
      '</g>' +
      petalos +
      '<circle cx="120" cy="182" r="7" fill="' +
      ROJO +
      '" stroke="' +
      BLANCO +
      '" stroke-width="2"/>' +
      '<circle cx="120" cy="182" r="22" fill="none" stroke="' +
      BLANCO +
      '" stroke-width="1.2" stroke-dasharray="2 3"/>'
    );
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
          '" stroke-width="1.3"/>',
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
          '" stroke-width="1.6"/><circle cx="0" cy="0" r="1.2" fill="' +
          BLANCO +
          '"/><circle cx="12" cy="12" r="1.2" fill="' +
          BLANCO +
          '"/><circle cx="12" cy="0" r="1.2" fill="' +
          BLANCO +
          '"/><circle cx="0" cy="12" r="1.2" fill="' +
          BLANCO +
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
          '" stroke-width="1.6"/>',
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
        'cuadros',
        8,
        8,
        '<rect width="8" height="8" fill="' +
          BLANCO +
          '"/><path d="M0 0h4v4H0zM4 4h4v4H4z" fill="' +
          NEGRO +
          '"/>',
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
        'puntos',
        8,
        8,
        '<rect width="8" height="8" fill="' +
          AMARILLO +
          '"/><circle cx="2" cy="2" r="1.2" fill="' +
          NEGRO +
          '"/><circle cx="6" cy="6" r="1.2" fill="' +
          NEGRO +
          '"/>',
      ) +
      pat(
        'lineasA',
        6,
        6,
        '<rect width="6" height="6" fill="' +
          AZUL +
          '"/><path d="M0 3h6" stroke="' +
          BLANCO +
          '" stroke-width=".8"/>',
      ) +
      '<clipPath id="' +
      pre +
      'mitad"><rect x="38" y="30" width="164" height="138"/></clipPath>'
    );
  }

  // Formas [d, relleno, grosor]: 'L' = línea de dibujo, NEGRO = mancha negra, otro = relleno con contorno.
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
            NEGRO +
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

  function manga(x, y, relleno) {
    var sx = x > 120 ? 150 : 90,
      sy = 116,
      dx = x - sx,
      dy = y - sy,
      l = Math.sqrt(dx * dx + dy * dy) || 1;
    var nx = -dy / l,
      ny = dx / l;
    return [
      [
        'M' +
          f(sx + nx * 10) +
          ' ' +
          f(sy + ny * 10) +
          'L' +
          f(x + nx * 7) +
          ' ' +
          f(y + ny * 7) +
          'L' +
          f(x - nx * 7) +
          ' ' +
          f(y - ny * 7) +
          'L' +
          f(sx - nx * 10) +
          ' ' +
          f(sy - ny * 10) +
          'z',
        relleno,
      ],
      [
        'M' +
          f(x + nx * 7.5 - (dx / l) * 4) +
          ' ' +
          f(y + ny * 7.5 - (dy / l) * 4) +
          'L' +
          f(x - nx * 7.5 - (dx / l) * 4) +
          ' ' +
          f(y - ny * 7.5 - (dy / l) * 4),
        'L',
        3,
      ],
    ];
  }

  function mano(x, y) {
    return [
      ['M' + (x - 7) + ' ' + (y - 3) + 'q7-7 14 0 2 9-7 11-7-1-7-11z', PIEL],
      ['M' + (x - 4) + ' ' + (y + 1) + 'h8M' + (x - 4) + ' ' + (y + 4) + 'h7', 'L', 0.7],
    ];
  }

  // Cabezas: de frente o de perfil (mirando a la izquierda; se reflejan con "derecha").
  function cabeza(tipo, perfil, u, pelo) {
    pelo = pelo || AMARILLO;
    var formas = [];
    var ojo = function (x) {
      return [
        ['M' + x + ' 71q5-4 10 0-5 3-10 0z', BLANCO, 1.1],
        ['M' + (x + 5) + ' 71.2a1.8 1.8 0 1 0 .1 0z', NEGRO],
        ['M' + (x - 1) + ' 66q6-4 12 0', 'L', 1.2],
      ];
    };
    if (!perfil) {
      if (tipo === 'Q')
        formas.push(
          [
            'M98 62Q86 100 94 122L104 116Q98 92 104 68zM142 62Q154 100 146 122L136 116Q142 92 136 68z',
            pelo,
          ],
          ['M96 80q-2 14 2 26M144 80q2 14-2 26', 'L', 0.8],
        );
      else
        formas.push(
          ['M98 62Q94 92 100 106H140Q146 92 142 62z', pelo],
          ['M100 72q-2 12 2 24M140 72q2 12-2 24', 'L', 0.8],
        );
      formas.push(['M102 60Q102 52 120 52 138 52 138 60V86Q136 100 120 104 104 100 102 86z', PIEL]);
      formas = formas.concat(ojo(105), ojo(125));
      formas.push(['M120 72L117 84 122 85', 'L', 1.1]);
      if (tipo === 'K') {
        formas.push(
          ['M103 86Q104 106 120 116 136 106 137 86 128 95 120 95 112 95 103 86z', pelo],
          ['M110 98q2 6 4 10M120 99v12M130 98q-2 6-4 10', 'L', 0.8],
          ['M108 90q6-5 12-1 6-4 12 1-6 4-12 1-6 3-12-1z', pelo, 1.1],
        );
      } else if (tipo === 'Q') {
        formas.push(['M115 91q5-2 10 0-5 4-10 0z', ROJO, 0.8]);
      } else {
        formas.push(['M112 91q8 3 16 0', 'L', 1.2], ['M110 88q5-3 10 0 5-3 10 0', 'L', 1]);
      }
    } else {
      formas.push(
        ['M110 54Q142 48 144 74 146 100 136 112H118Q124 90 120 70z', pelo],
        ['M114 98H130V112H114z', PIEL],
        [
          'M108 56Q124 50 134 58 138 70 134 84 132 98 122 104L114 102 110 97 112 93 108 89 110 85 102 79 109 73Q105 62 108 56z',
          PIEL,
        ],
        ['M124 58Q140 56 140 76 140 96 132 108L126 106Q132 92 130 76 128 66 122 64z', pelo],
        ['M134 70q4 14 0 30M138 74q2 12-2 24', 'L', 0.8],
        ['M123 74q5-2 6 4 0 6-5 6', 'L', 1],
        ['M107 70q5-4 10 0-5 3-10 0z', BLANCO, 1.1],
        ['M110.5 70.2a1.8 1.8 0 1 0 .1 0z', NEGRO],
        ['M105 65q6-3 12 0', 'L', 1.2],
      );
      if (tipo === 'K')
        formas.push(
          ['M110 89Q112 108 124 115 135 108 134 90 128 98 119 96z', pelo],
          ['M118 101q2 6 4 10M127 99q0 6-2 10', 'L', 0.8],
          ['M107 88q5-3 10 0', 'L', 1.2],
        );
      else formas.push(['M108 92q4 2 8 0', 'L', 1.2]);
    }
    // Tocado
    if (tipo === 'K') {
      formas.push(
        ['M100 54Q120 30 140 54z', ROJO],
        ['M98 54L96 34 106 44 113 30 120 42 127 30 134 44 144 34 142 54z', AMARILLO],
        ['M98 50h44v10H98z', AMARILLO],
        ['M106 55a2.2 2.2 0 1 0 .1 0zM134 55a2.2 2.2 0 1 0 .1 0z', AZUL, 0.8],
        ['M120 55a2.6 2.6 0 1 0 .1 0z', ROJO, 0.8],
        [
          'M96 34a2 2 0 1 0 .1 0zM113 30a2 2 0 1 0 .1 0zM127 30a2 2 0 1 0 .1 0zM144 34a2 2 0 1 0 .1 0z',
          BLANCO,
          0.8,
        ],
      );
    } else if (tipo === 'Q') {
      formas.push(
        ['M102 52Q120 36 138 52z', AZUL],
        ['M102 54l-1-14 7 7 6-11 6 9 6-9 6 11 7-7-1 14z', AMARILLO],
        [
          'M101 40a2.4 2.4 0 1 0 .1 0zM114 36a2.4 2.4 0 1 0 .1 0zM126 36a2.4 2.4 0 1 0 .1 0zM139 40a2.4 2.4 0 1 0 .1 0z',
          BLANCO,
          0.8,
        ],
        ['M102 50h36v6h-36z', AMARILLO],
        ['M120 53a2 2 0 1 0 .1 0z', ROJO, 0.7],
      );
    } else {
      formas.push(
        ['M96 58Q98 34 122 36 146 38 146 56z', ROJO],
        ['M94 54h54v8H94z', u('puntos')],
        ['M142 44Q160 26 170 34 158 36 150 50z', AMARILLO],
        ['M146 46q8-10 18-11', 'L', 0.8],
      );
    }
    return formas;
  }

  function cuerpo(tipo, ropa, u) {
    var izq = u(ropa[0]),
      der = u(ropa[1]),
      centro = u(ropa[2]);
    var f0 = [
      ['M38 168V124L86 105 104 103V168z', izq],
      ['M202 168V124L154 105 136 103V168z', der],
      ['M104 103H136V168H104z', centro],
      [
        'M58 136Q70 150 64 168M80 126Q92 148 86 168M182 136Q170 150 176 168M160 126Q148 148 154 168',
        'L',
        1.1,
      ],
    ];
    if (tipo === 'K') {
      f0.push(
        ['M98 104h8v64h-8zM134 104h8v64h-8z', u('armino')],
        ['M66 112Q120 92 174 112L176 124Q120 104 64 124z', u('armino')],
        ['M38 150Q60 140 82 146M202 150Q180 140 158 146', 'L', 1],
      );
    } else if (tipo === 'Q') {
      f0.push(
        ['M104 104Q120 126 136 104V118Q120 140 104 118z', ROJO],
        ['M106 112q14 14 28 0', 'L', 1],
        [
          'M108 120a2 2 0 1 0 .1 0zM114 124a2 2 0 1 0 .1 0zM120 126a2 2 0 1 0 .1 0zM126 124a2 2 0 1 0 .1 0zM132 120a2 2 0 1 0 .1 0z',
          BLANCO,
          0.8,
        ],
        ['M60 128Q84 112 104 108L98 168H82Q80 140 60 128z', u('rayas')],
      );
    } else {
      f0.push(
        [
          'M96 104L100 112 104 104 108 112 112 104 116 112 120 104 124 112 128 104 132 112 136 104 140 112 144 104 146 112H94z',
          BLANCO,
          1,
        ],
        ['M104 140h32v8h-32z', NEGRO],
        ['M114 140h12v8h-12z', AMARILLO, 1],
      );
    }
    return f0;
  }

  // Objetos que sostienen las figuras: [capa, formas, mano(x,y)].
  var OBJETOS = {
    espadaAlta: {
      capa: 'delante',
      mano: [162, 150],
      formas: [
        ['M158 46L162 36 166 46V134H158z', ACERO],
        ['M162 44V132', 'L', 0.7],
        ['M148 134H176V141H148z', AMARILLO],
        ['M159 141h6v10h-6z', ROJO, 1],
      ],
    },
    espadaNuca: {
      capa: 'medio',
      mano: [90, 140],
      formas: [
        ['M150 32L157 37 102 126 95 122z', ACERO],
        ['M153 35L99 124', 'L', 0.7],
        ['M84 116L106 132 102 137 80 121z', AMARILLO],
      ],
    },
    hacha: {
      capa: 'atras',
      mano: [160, 146],
      formas: [
        ['M159 44H164L165 146H160z', AMARILLO],
        ['M164 48Q188 44 192 66 182 80 164 74z', ACERO],
        ['M170 52q12 2 16 14', 'L', 0.7],
        ['M161 40a3 3 0 1 0 .1 0z', AMARILLO],
      ],
    },
    orbe: {
      capa: 'delante',
      mano: [160, 146],
      formas: [
        ['M160 116a12 12 0 1 0 .1 0z', AMARILLO],
        ['M148 128h24M160 116v24', 'L', 1.2],
        ['M158 104h4v12h-4zM154 108h12v4h-12z', AMARILLO, 1],
      ],
    },
    florR: {
      capa: 'delante',
      mano: [158, 148],
      formas: [
        ['M158 146Q160 120 164 100', 'L', 1.6],
        ['M161 124q10-6 14 0-8 6-14 0z', AMARILLO, 1],
        flor(165, 96, ROJO),
      ],
    },
    florA: {
      capa: 'delante',
      mano: [82, 148],
      formas: [
        ['M82 146Q80 120 76 100', 'L', 1.6],
        ['M79 124q-10-6-14 0 8 6 14 0z', AMARILLO, 1],
        flor(75, 96, AZUL),
      ],
    },
    cetro: {
      capa: 'atras',
      mano: [160, 146],
      formas: [
        ['M158 60h5v94h-5z', AMARILLO],
        ['M160.5 50a7 7 0 1 0 .1 0z', ROJO],
        ['M154 64h13v4h-13z', AMARILLO, 1],
      ],
    },
    alabarda: {
      capa: 'atras',
      mano: [164, 148],
      formas: [
        ['M163 32h4v136h-4z', AMARILLO],
        ['M167 44Q190 44 192 64 178 66 167 60z', ACERO],
        ['M163 44Q148 40 146 50 154 52 163 52z', ACERO],
        ['M165 26l3 8h-6z', ACERO],
      ],
    },
    hoja: {
      capa: 'delante',
      mano: [160, 148],
      formas: [
        ['M160 146Q146 110 168 72 182 112 160 146z', AMARILLO],
        ['M160 144Q162 110 168 76M162 120l-8-6M163 108l8-6M164 96l-7-5', 'L', 0.8],
      ],
    },
    flecha: {
      capa: 'delante',
      mano: [162, 148],
      formas: [
        ['M161 40h3v120h-3z', AMARILLO, 1],
        ['M162.5 28l6 14h-12z', ACERO],
        ['M161 150l-6 10v-14l6-6zM164 150l6 10v-14l-6-6z', ROJO, 1],
      ],
    },
    baston: {
      capa: 'atras',
      mano: [82, 148],
      formas: [
        ['M80 52h5v110h-5z', AMARILLO],
        ['M82.5 44a8 8 0 1 0 .1 0z', AZUL],
        ['M78 60h9v4h-9z', ROJO, 1],
      ],
    },
  };

  function flor(x, y, c) {
    var s = '';
    for (var i = 0; i < 5; i++) {
      var a = (i * Math.PI * 2) / 5 - Math.PI / 2;
      s +=
        '<circle cx="' +
        f(x + Math.cos(a) * 5) +
        '" cy="' +
        f(y + Math.sin(a) * 5) +
        '" r="4.6" fill="' +
        c +
        '" stroke="' +
        NEGRO +
        '" stroke-width="1"/>';
    }
    return (
      s +
      '<circle cx="' +
      x +
      '" cy="' +
      y +
      '" r="3" fill="' +
      AMARILLO +
      '" stroke="' +
      NEGRO +
      '" stroke-width="1"/>'
    );
  }

  // Configuración de cada figura: perfil, mirada, ropa [izquierda, derecha, centro], objetos, lado del símbolo.
  var FIGURAS = {
    picas: {
      K: {
        perfil: false,
        ropa: ['flores', 'rombos', 'escamas'],
        obj: ['espadaAlta'],
        pelo: MORENO,
      },
      Q: { perfil: false, ropa: ['rombos', 'flores', 'cuadros'], obj: ['cetro', 'florA'] },
      J: {
        perfil: true,
        ropa: ['rombos', 'flores', 'rayas'],
        obj: ['baston'],
        pipDer: true,
        pelo: MORENO,
      },
    },
    corazones: {
      K: { perfil: false, ropa: ['rombos', 'flores', 'puntos'], obj: ['espadaNuca'], pipDer: true },
      Q: { perfil: false, ropa: ['flores', 'rombos', 'zigzag'], obj: ['florR'], pelo: MORENO },
      J: { perfil: true, derecha: true, ropa: ['flores', 'rombos', 'escamas'], obj: ['hoja'] },
    },
    diamantes: {
      K: { perfil: true, ropa: ['rombos', 'lineasA', 'escamas'], obj: ['hacha'], pelo: MORENO },
      Q: { perfil: false, ropa: ['lineasA', 'rombos', 'puntos'], obj: ['florR'] },
      J: { perfil: false, ropa: ['rombos', 'flores', 'cuadros'], obj: ['alabarda'], pelo: MORENO },
    },
    treboles: {
      K: { perfil: false, ropa: ['flores', 'rombos', 'rayas'], obj: ['orbe'] },
      Q: {
        perfil: false,
        ropa: ['rombos', 'lineasA', 'escamas'],
        obj: ['florA'],
        pipDer: true,
        pelo: MORENO,
      },
      J: { perfil: false, ropa: ['lineasA', 'rombos', 'zigzag'], obj: ['flecha'] },
    },
  };

  function figura(tipo, cfg, palo, indice, nombre) {
    var pre = 'nc' + ++uid;
    var u = function (n) {
      return 'url(#' + pre + n + ')';
    };
    var obj = cfg.obj.map(function (n) {
      return OBJETOS[n];
    });
    var capa = function (c) {
      return obj
        .filter(function (o) {
          return o.capa === c;
        })
        .map(function (o) {
          return imprimir(o.formas);
        })
        .join('');
    };
    var manos = obj
      .map(function (o) {
        return imprimir(mano(o.mano[0], o.mano[1]));
      })
      .join('');
    var mangas = obj
      .map(function (o) {
        return imprimir(manga(o.mano[0], o.mano[1], u(cfg.ropa[o.mano[0] > 120 ? 0 : 1])));
      })
      .join('');
    var cab =
      '<g transform="translate(120 30) scale(1.18) translate(-120 -30)">' +
      imprimir(cabeza(tipo, cfg.perfil, u, cfg.pelo)) +
      '</g>';
    if (cfg.derecha) cab = '<g transform="translate(240 0) scale(-1 1)">' + cab + '</g>';
    var mitad =
      '<g clip-path="url(#' +
      pre +
      'mitad)">' +
      capa('atras') +
      imprimir(cuerpo(tipo, cfg.ropa, u)) +
      capa('medio') +
      cab +
      mangas +
      capa('delante') +
      manos +
      (palo ? pip(palo, cfg.pipDer ? 186 : 54, 48, 22) : '') +
      '</g>';
    return svg(
      '<rect x="38" y="30" width="164" height="276" fill="' +
        BLANCO +
        '"/>' +
        mitad +
        girado(mitad) +
        '<path d="M38 168H202" stroke="' +
        NEGRO +
        '" stroke-width="1"/>' +
        '<rect x="38" y="30" width="164" height="276" fill="none" stroke="' +
        NEGRO +
        '" stroke-width="1.6"/>' +
        indice,
      nombre,
      patrones(pre),
    );
  }

  function svgCarta(valor, palo) {
    valor = String(valor).toUpperCase();
    if (VALORES.indexOf(valor) < 0 || PALOS.indexOf(palo) < 0)
      throw new Error('Carta no válida: ' + valor + ' de ' + palo);
    if ('JQK'.indexOf(valor) >= 0)
      return figura(
        valor,
        FIGURAS[palo][valor],
        palo,
        esquinas(valor, palo),
        valor + ' de ' + palo,
      );
    var centro =
      valor === 'A'
        ? palo === 'picas'
          ? asDePicas()
          : pip(palo, 120, 168, 64)
        : DISPOSICION[+valor]
            .map(function (q) {
              return pip(palo, X[q[0]], q[1], 44, q[1] > M);
            })
            .join('');
    return svg(centro + esquinas(valor, palo), valor + ' de ' + palo);
  }

  // Comodín: bufón de dos cabezas con gorro de cascabeles.
  function svgJoker(variante) {
    var pre = 'nc' + ++uid;
    var u = function (n) {
      return 'url(#' + pre + n + ')';
    };
    var c = variante === 'negro' ? NEGRO : ROJO;
    var gorro = [
      ['M96 60Q84 36 62 34 76 46 82 62zM144 60Q156 36 178 34 164 46 158 62z', c],
      ['M96 62Q100 22 120 24 140 22 144 62z', AMARILLO],
      ['M120 24Q118 40 120 60', 'L', 1],
      ['M62 34a5 5 0 1 0 .1 0zM178 34a5 5 0 1 0 .1 0zM120 20a5 5 0 1 0 .1 0z', AMARILLO],
      ['M94 58h52v8H94z', u('cuadros')],
    ];
    var cara = cabeza('J', false, u).slice(0, -4);
    var mitad =
      '<g clip-path="url(#' +
      pre +
      'mitad)">' +
      imprimir(cuerpo('J', ['rombos', 'flores', 'cuadros'], u)) +
      imprimir([['M162 146V60', 'L', 2]]) +
      imprimir([['M162 52a9 9 0 1 0 .1 0z', AMARILLO]]) +
      '<g transform="translate(120 30) scale(1.18) translate(-120 -30)">' +
      imprimir(cara) +
      imprimir(gorro) +
      '</g>' +
      imprimir(manga(162, 146, u('flores'))) +
      imprimir(mano(162, 146)) +
      '</g>';
    return svg(
      '<rect x="38" y="30" width="164" height="276" fill="' +
        BLANCO +
        '"/>' +
        mitad +
        girado(mitad) +
        '<path d="M38 168H202" stroke="' +
        NEGRO +
        '" stroke-width="1"/>' +
        '<rect x="38" y="30" width="164" height="276" fill="none" stroke="' +
        NEGRO +
        '" stroke-width="1.6"/>' +
        esquinas('JOKER', null, c),
      'Comodín',
      patrones(pre),
    );
  }

  // ---------- Reversos ----------
  var COLORES_REVERSO = { rojo: '#b3202c', azul: '#1d4f9c', verde: '#1f6b45', negro: '#1d1d1d' };

  function svgReverso(nombre, diseno) {
    var c = COLORES_REVERSO[nombre] || nombre || COLORES_REVERSO.rojo;
    var id = 'ncr' + ++uid;
    var defs, fondo;
    diseno = DISENOS.indexOf(diseno) >= 0 ? diseno : 'rombos';
    if (diseno === 'rombos') {
      defs =
        '<pattern id="' +
        id +
        '" width="14" height="14" patternUnits="userSpaceOnUse"><rect width="14" height="14" fill="' +
        BLANCO +
        '"/>' +
        '<path d="M7 0L14 7 7 14 0 7z" fill="none" stroke="' +
        c +
        '" stroke-width="1.3"/><circle cx="7" cy="7" r="2" fill="' +
        c +
        '"/>' +
        '<circle cx="0" cy="0" r="1.6" fill="' +
        c +
        '"/><circle cx="14" cy="14" r="1.6" fill="' +
        c +
        '"/><circle cx="14" cy="0" r="1.6" fill="' +
        c +
        '"/><circle cx="0" cy="14" r="1.6" fill="' +
        c +
        '"/></pattern>';
      fondo =
        '<rect x="14" y="14" width="212" height="308" fill="url(#' +
        id +
        ')" stroke="' +
        c +
        '" stroke-width="2"/>';
    } else if (diseno === 'roseta') {
      var r = '';
      for (var i = 0; i < 6; i++)
        r += '<ellipse cx="12" cy="6" rx="2.6" ry="5.5" transform="rotate(' + i * 60 + ' 12 12)"/>';
      defs =
        '<pattern id="' +
        id +
        '" width="24" height="24" patternUnits="userSpaceOnUse"><rect width="24" height="24" fill="' +
        c +
        '"/>' +
        '<g fill="none" stroke="' +
        BLANCO +
        '" stroke-width=".9">' +
        r +
        '</g><circle cx="12" cy="12" r="1.8" fill="' +
        BLANCO +
        '"/>' +
        '<circle cx="0" cy="0" r="1.2" fill="' +
        BLANCO +
        '"/><circle cx="24" cy="0" r="1.2" fill="' +
        BLANCO +
        '"/><circle cx="0" cy="24" r="1.2" fill="' +
        BLANCO +
        '"/><circle cx="24" cy="24" r="1.2" fill="' +
        BLANCO +
        '"/></pattern>';
      fondo =
        '<rect x="14" y="14" width="212" height="308" fill="url(#' +
        id +
        ')"/>' +
        '<circle cx="120" cy="168" r="42" fill="' +
        c +
        '" stroke="' +
        BLANCO +
        '" stroke-width="3"/>' +
        '<circle cx="120" cy="168" r="35" fill="none" stroke="' +
        BLANCO +
        '" stroke-width="1"/>' +
        PALOS.map(function (p, k) {
          return pip(p, 120 + [0, 17, 0, -17][k], 168 + [-17, 0, 17, 0][k], 18, false, BLANCO);
        }).join('');
    } else if (diseno === 'trama') {
      defs =
        '<pattern id="' +
        id +
        '" width="8" height="8" patternUnits="userSpaceOnUse"><rect width="8" height="8" fill="' +
        BLANCO +
        '"/>' +
        '<path d="M0 0l8 8M8 0L0 8" stroke="' +
        c +
        '" stroke-width="1.1"/></pattern>';
      fondo =
        '<rect x="14" y="14" width="212" height="308" fill="url(#' +
        id +
        ')" stroke="' +
        c +
        '" stroke-width="2"/>' +
        '<rect x="70" y="118" width="100" height="100" rx="50" fill="' +
        BLANCO +
        '" stroke="' +
        c +
        '" stroke-width="3"/>' +
        pip('picas', 120, 168, 50, false, c);
    } else {
      defs =
        '<pattern id="' +
        id +
        '" width="20" height="20" patternUnits="userSpaceOnUse"><rect width="20" height="20" fill="' +
        c +
        '"/>' +
        '<path d="M10 2l8 8-8 8-8-8z" fill="none" stroke="' +
        BLANCO +
        '" stroke-opacity=".6" stroke-width="1"/><path d="M10 7l3 3-3 3-3-3z" fill="' +
        BLANCO +
        '" fill-opacity=".6"/></pattern>';
      fondo =
        '<rect x="12" y="12" width="216" height="312" rx="6" fill="' +
        c +
        '"/>' +
        '<rect x="26" y="26" width="188" height="284" fill="url(#' +
        id +
        ')"/>' +
        '<rect x="20" y="20" width="200" height="296" rx="4" fill="none" stroke="' +
        BLANCO +
        '" stroke-width="2"/>' +
        '<rect x="26" y="26" width="188" height="284" fill="none" stroke="' +
        BLANCO +
        '" stroke-width="1"/>' +
        '<path d="M120 112L160 168 120 224 80 168z" fill="' +
        c +
        '" stroke="' +
        BLANCO +
        '" stroke-width="2.4"/>' +
        '<path d="M120 126L150 168 120 210 90 168z" fill="none" stroke="' +
        BLANCO +
        '" stroke-width="1"/>' +
        '<circle cx="120" cy="168" r="10" fill="' +
        BLANCO +
        '"/>';
    }
    return svg(fondo, 'Reverso', defs);
  }

  function crearMazo(opciones) {
    var mazo = [];
    PALOS.forEach(function (palo) {
      VALORES.forEach(function (valor) {
        mazo.push({ valor: valor, palo: palo, id: valor + '-' + palo });
      });
    });
    if (opciones && opciones.jokers)
      mazo.push(
        { valor: 'JOKER', palo: 'color', id: 'JOKER-color' },
        { valor: 'JOKER', palo: 'negro', id: 'JOKER-negro' },
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
    return carta.valor === 'JOKER' ? svgJoker(carta.palo) : svgCarta(carta.valor, carta.palo);
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

  // opciones: { bocaAbajo: bool, girable: bool, reverso: 'rojo'|'azul'|'verde'|'negro'|'#hex', diseno: 'rombos'|'roseta'|'trama'|'marco' }
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

  global.NaipesClasicos = {
    ANCHO: W,
    ALTO: H,
    PALOS: PALOS,
    VALORES: VALORES,
    DISENOS: DISENOS,
    FIGURAS: FIGURAS,
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
