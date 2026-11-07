/*!
 * naipes-horror.js — Baraja francesa de terror: monstruos clásicos de dos cabezas, sangre, luna y murciélagos.
 * SVG puro, sin dependencias ni imágenes externas.
 *
 *   Picas:     J esqueleto · Q bruja     · K la Muerte
 *   Corazones: J hombre lobo · Q vampiresa · K vampiro
 *   Diamantes: J cabeza de calabaza · Q medusa · K momia
 *   Tréboles:  J zombi    · Q novia fantasma · K monstruo cosido
 *   Comodines: payaso siniestro (rojo y negro)
 *
 *   NaipesHorror.svgCarta('K', 'corazones')            -> string SVG
 *   NaipesHorror.svgReverso('morado', 'murcielagos')   -> string SVG (diseños: murcielagos | telarana | calaveras)
 *   NaipesHorror.svgJoker('rojo')                      -> string SVG
 *   NaipesHorror.crearMazo({ jokers: true })           -> [{ valor, palo, id }, ...]
 *   NaipesHorror.barajar(mazo) · elemento(carta, opciones) · imagen(svg)
 */
(function (global) {
  'use strict';

  var W = 240,
    H = 336,
    MITAD = 168;
  var PALOS = ['picas', 'corazones', 'diamantes', 'treboles'];
  var VALORES = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
  var DISENOS = ['murcielagos', 'telarana', 'calaveras'];
  var N = '#141014',
    B = '#fff',
    HUESO = '#efe6d2',
    SANGRE = '#8e0e14',
    ROJO = '#c81e24',
    MORADO = '#4b2a5e',
    AMBAR = '#f2c230',
    PAPEL = '#f3ecdc',
    NIEBLA = '#ddd3e2',
    LUNA = '#f6f0dc',
    ACERO = '#cfd3d8',
    MADERA = '#6b4423';
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
    return palo === 'corazones' || palo === 'diamantes' ? SANGRE : N;
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
  function halo(d, sw) {
    return p(d, null, PAPEL, sw + 3) + p(d, null, N, sw);
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

  function esquinas(valor, palo, c) {
    c = c || color(palo);
    var t =
      valor === 'JOKER'
        ? 'JOKER'
            .split('')
            .map(function (l, i) {
              return (
                '<text x="20" y="' +
                (32 + i * 19) +
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
          pip(palo, 20, 57, 16);
    return t + girado(t);
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
      (col || N) +
      '" d="M0 0q-4-6-12-6 3 3 2 7-4-3-8-1 3 2 2 6 6-4 12-2 2-3 4-4 2 1 2 2 2-2 2-4 2 2 2 4 0-1 2-2 2 1 4 4 6-2 12 2-1-4 2-6-4-2-8 1-1-4 2-7-8 0-12 6-1-3-2-4-1 1-2 4z"/>'
    );
  }

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

  // ---------- Accesorios que sostienen las manos ----------
  var ACCESORIOS = {
    guadana: function (x, y) {
      return (
        halo('M' + x + ' ' + (y + 24) + 'V' + (y - 62), 3) +
        p(
          'M' +
            x +
            ' ' +
            (y - 62) +
            'Q' +
            (x + 34) +
            ' ' +
            (y - 72) +
            ' ' +
            (x + 40) +
            ' ' +
            (y - 44) +
            'Q' +
            (x + 28) +
            ' ' +
            (y - 60) +
            ' ' +
            x +
            ' ' +
            (y - 55) +
            'z',
          ACERO,
          N,
          1.4,
        )
      );
    },
    arena: function (x, y) {
      return (
        p(
          'M' + (x - 10) + ' ' + (y - 44) + 'h20v4h-20zM' + (x - 10) + ' ' + (y - 8) + 'h20v4h-20z',
          MADERA,
          N,
          1,
        ) +
        p('M' + (x - 8) + ' ' + (y - 40) + 'h16l-7 14 7 14h-16l7-14z', '#eef3f6', N, 1.2) +
        p(
          'M' + (x - 5) + ' ' + (y - 37) + 'h10l-5 9zM' + (x - 6) + ' ' + (y - 12) + 'h12l-6-5z',
          AMBAR,
        )
      );
    },
    candelabro: function (x, y) {
      return (
        halo('M' + x + ' ' + (y + 10) + 'V' + (y - 20), 2.4) +
        p('M' + (x - 10) + ' ' + (y - 20) + 'h20', null, N, 3) +
        p('M' + (x - 4) + ' ' + (y - 46) + 'h8v26h-8z', HUESO, N, 1.2) +
        p('M' + (x + 2) + ' ' + (y - 46) + 'v8', null, HUESO, 2.4) +
        p('M' + x + ' ' + (y - 62) + 'q7 8 0 14-7-6 0-14z', AMBAR, ROJO, 1)
      );
    },
    caliz: function (x, y) {
      return (
        halo('M' + x + ' ' + (y - 18) + 'V' + (y + 8), 1.8) +
        p('M' + (x - 7) + ' ' + (y + 9) + 'h14', null, N, 2.4) +
        p('M' + (x - 12) + ' ' + (y - 40) + 'h24q0 18-12 22-12-4-12-22z', AMBAR, N, 1.4) +
        p('M' + (x - 11) + ' ' + (y - 38) + 'h22', null, SANGRE, 3) +
        p('M' + (x - 8) + ' ' + (y - 37) + 'v6a2 2 0 0 0 3 0v-6', SANGRE)
      );
    },
    farol: function (x, y) {
      return (
        halo('M' + x + ' ' + y + 'V' + (y - 14), 1.6) +
        p('M' + (x - 10) + ' ' + (y - 46) + 'h20l-3 32h-14z', AMBAR, N, 1.4) +
        p('M' + x + ' ' + (y - 40) + 'q5 8 0 16-5-8 0-16z', ROJO) +
        p(
          'M' + (x - 12) + ' ' + (y - 48) + 'h24v4h-24zM' + (x - 8) + ' ' + (y - 16) + 'h16v4h-16z',
          N,
        ) +
        p('M' + (x - 4) + ' ' + (y - 46) + 'v30M' + (x + 4) + ' ' + (y - 46) + 'v30', null, N, 1)
      );
    },
    escoba: function (x, y) {
      return (
        halo('M' + x + ' ' + (y + 6) + 'V' + (y - 60), 2.6) +
        p(
          'M' +
            (x - 2) +
            ' ' +
            (y + 6) +
            'L' +
            (x - 12) +
            ' ' +
            (y + 26) +
            'H' +
            (x + 12) +
            'L' +
            (x + 2) +
            ' ' +
            (y + 6) +
            'z',
          '#c49a52',
          N,
          1.2,
        ) +
        p(
          'M' +
            (x - 6) +
            ' ' +
            (y + 12) +
            'l-3 14M' +
            x +
            ' ' +
            (y + 12) +
            'v14M' +
            (x + 6) +
            ' ' +
            (y + 12) +
            'l3 14',
          null,
          N,
          0.8,
        )
      );
    },
    pocion: function (x, y) {
      return (
        p('M' + (x - 3) + ' ' + (y - 46) + 'h6v8l9 14v14h-24v-14l9-14z', '#7cd36b', N, 1.4) +
        p('M' + (x - 4) + ' ' + (y - 50) + 'h8v5h-8z', MADERA, N, 1) +
        '<circle cx="' +
        (x - 4) +
        '" cy="' +
        (y - 18) +
        '" r="2" fill="' +
        B +
        '" opacity=".7"/><circle cx="' +
        (x + 3) +
        '" cy="' +
        (y - 24) +
        '" r="1.4" fill="' +
        B +
        '" opacity=".7"/>'
      );
    },
    rosa: function (x, y) {
      return (
        halo(
          'M' + x + ' ' + (y + 10) + 'Q' + (x - 3) + ' ' + (y - 20) + ' ' + x + ' ' + (y - 40),
          2,
        ) +
        p('M' + x + ' ' + (y - 18) + 'q8-7 13-2-6 7-13 2z', N, PAPEL, 1) +
        '<circle cx="' +
        x +
        '" cy="' +
        (y - 47) +
        '" r="9.5" fill="' +
        N +
        '" stroke="' +
        SANGRE +
        '" stroke-width="1.4"/>' +
        p('M' + (x - 3) + ' ' + (y - 47) + 'q3-4 6 0-1 5-6 4-5-3-2-9 6-5 9 1', null, SANGRE, 1)
      );
    },
    calavera: function (x, y) {
      return (
        '<g transform="translate(' +
        (x - 14) +
        ' ' +
        (y - 40) +
        ') scale(.28)">' +
        CABEZAS_H.esqueleto() +
        '</g>'
      );
    },
    hacha: function (x, y) {
      return (
        halo('M' + x + ' ' + (y + 22) + 'V' + (y - 56), 3) +
        p('M' + x + ' ' + (y - 54) + 'q20-6 24 10-4 12-24 8z', ACERO, N, 1.4) +
        p('M' + (x + 22) + ' ' + (y - 46) + 'q2 6-2 14', null, SANGRE, 2)
      );
    },
    libro: function (x, y) {
      return (
        '<g transform="rotate(-10 ' +
        x +
        ' ' +
        y +
        ')">' +
        p('M' + (x - 12) + ' ' + (y - 40) + 'h24v30h-24z', MORADO, N, 1.4) +
        p('M' + (x - 9) + ' ' + (y - 40) + 'v30', null, AMBAR, 1.4) +
        '<circle cx="' +
        (x + 2) +
        '" cy="' +
        (y - 25) +
        '" r="5" fill="none" stroke="' +
        AMBAR +
        '" stroke-width="1.2"/>' +
        p('M' + (x + 2) + ' ' + (y - 30) + 'a5 5 0 0 0 0 10 4 4 0 0 1 0-10z', AMBAR) +
        '</g>'
      );
    },
    daga: function (x, y) {
      return (
        p(
          'M' +
            (x - 3) +
            ' ' +
            (y - 10) +
            'L' +
            x +
            ' ' +
            (y - 52) +
            'L' +
            (x + 3) +
            ' ' +
            (y - 10) +
            'z',
          ACERO,
          N,
          1.2,
        ) +
        p('M' + (x - 10) + ' ' + (y - 10) + 'h20v4h-20z', AMBAR, N, 1) +
        p('M' + x + ' ' + (y - 48) + 'v8', null, SANGRE, 1.6)
      );
    },
    naipe: function (x, y, palo) {
      return (
        '<g transform="rotate(-12 ' +
        x +
        ' ' +
        y +
        ')"><rect x="' +
        (x - 11) +
        '" y="' +
        (y - 42) +
        '" width="22" height="31" rx="2" fill="' +
        PAPEL +
        '" stroke="' +
        N +
        '" stroke-width="1.5"/>' +
        pip(palo || 'picas', x, y - 26, 12) +
        '</g>'
      );
    },
  };

  function mano(x, y, piel, hueso) {
    if (hueso) {
      return (
        '<ellipse cx="' +
        x +
        '" cy="' +
        y +
        '" rx="6" ry="5" fill="' +
        piel +
        '" stroke="' +
        N +
        '" stroke-width="1.2"/>' +
        p(
          'M' +
            (x - 5) +
            ' ' +
            (y + 3) +
            'v6M' +
            (x - 2) +
            ' ' +
            (y + 4) +
            'v7M' +
            (x + 1) +
            ' ' +
            (y + 4) +
            'v7M' +
            (x + 4) +
            ' ' +
            (y + 3) +
            'v6',
          null,
          piel,
          2.4,
        ) +
        p(
          'M' +
            (x - 5) +
            ' ' +
            (y + 3) +
            'v6M' +
            (x - 2) +
            ' ' +
            (y + 4) +
            'v7M' +
            (x + 1) +
            ' ' +
            (y + 4) +
            'v7M' +
            (x + 4) +
            ' ' +
            (y + 3) +
            'v6',
          null,
          N,
          0.6,
          ' stroke-dasharray="2 1"',
        )
      );
    }
    return (
      '<ellipse cx="' +
      x +
      '" cy="' +
      y +
      '" rx="8.5" ry="7" fill="' +
      piel +
      '" stroke="' +
      N +
      '" stroke-width="1.5"/>' +
      '<ellipse cx="' +
      (x + 6) +
      '" cy="' +
      (y - 4) +
      '" rx="3" ry="3.6" fill="' +
      piel +
      '" stroke="' +
      N +
      '" stroke-width="1.2"/>' +
      p('M' + (x - 6) + ' ' + y + 'q6 3 11 0', null, N, 0.8)
    );
  }

  // ---------- Cuerpo (mitad superior; la inferior es la misma girada 180°) ----------
  function camisa(o, pre) {
    var forma = 'M100 92H140L128 168H112z';
    var linea = function (d, c, w) {
      return p(d, null, c || N, w || 1);
    };
    switch (o.camisa) {
      case 'volantes':
        return (
          p(forma, B, N, 1) +
          linea(
            'M110 100q10 4 20 0M108 110q12 4 24 0M110 120q10 4 20 0M112 130q8 3 16 0M113 140q7 3 14 0',
            N,
            0.9,
          )
        );
      case 'rasgada':
        return (
          p(forma, '#d8d2c0', N, 1) +
          p('M110 112l8-4 6 6 8-2-4 12-10 4-8-6z', o.piel, N, 1) +
          linea('M114 140l6 8M124 132l-4 6', '#7a5a3a', 1.4)
        );
      case 'vendas':
        return p(forma, 'url(#' + pre + 'vendas)', N, 1);
      case 'costillas':
        var d = 'M120 98V166';
        for (var y = 106; y < 160; y += 10)
          d +=
            'M120 ' +
            y +
            'Q108 ' +
            (y - 2) +
            ' 102 ' +
            (y + 6) +
            'M120 ' +
            y +
            'Q132 ' +
            (y - 2) +
            ' 138 ' +
            (y + 6);
        return p(forma, N) + linea(d, HUESO, 2.6);
      case 'corse':
        return (
          p(forma, SANGRE, N, 1) +
          linea(
            'M114 104l12 8M126 104l-12 8M114 118l12 8M126 118l-12 8M114 132l12 8M126 132l-12 8',
            N,
            1.2,
          ) +
          linea('M101 94q19 8 38 0', B, 2.4)
        );
      case 'tunica':
        return (
          p(forma, o.chaqueta) +
          linea('M110 150h20', AMBAR, 2.4) +
          linea('M120 98v40', '#3a3340', 1)
        );
      case 'parches':
        return (
          p(forma, '#8d8f86', N, 1) +
          p('M106 110h12v12h-12z', '#6b6e64', N, 0.8) +
          p('M122 132h10v10h-10z', '#a9a99b', N, 0.8) +
          linea('M106 110l12 12M118 110l-12 12', N, 0.6)
        );
      case 'rayas':
        return p(forma, 'url(#' + pre + 'rayas)', N, 1);
      case 'pelaje':
        return (
          p(forma, '#8a776a', N, 1) +
          linea(
            'M108 104l4 6M116 102l3 7M126 104l-3 6M132 104l-4 6M110 124l4 6M122 122l3 7M114 144l3 6M124 140l-3 6',
            '#4a3b30',
            1.2,
          )
        );
      default:
        return p(forma, 'url(#' + pre + 'puntos)', N, 1);
    }
  }

  function cuerpo(o, pre, cabeza) {
    var J = o.chaqueta,
      L = o.lineas || '#9a8fa6';
    var hueso = o.cabeza === 'esqueleto' || o.cabeza === 'muerte';
    var paj = o.pajarita ? (o.pajarita === 'negra' ? N : ROJO) : null;
    return [
      p('M50 168V134Q52 104 82 96L104 90H136L158 96Q188 104 190 134V168z', J, N, 1.5),
      p(
        'M58 118Q44 132 42 144L56 150Q60 138 66 128zM182 118Q196 132 198 144L184 150Q180 138 174 128z',
        J,
        N,
        1.2,
      ),
      p('M66 128Q62 146 64 168M174 128Q178 146 176 168', null, L, 0.9),
      camisa(o, pre),
      o.camisa === 'tunica' ? '' : p('M111 156H129L128 168H112z', N),
      o.camisa === 'tunica'
        ? p('M100 90Q120 110 140 90', null, L, 1.2)
        : p(
            'M100 92L84 116 96 120 112 168H104L82 118 92 98zM140 92L156 116 144 120 128 168H136L158 118 148 98z',
            J,
          ) + p('M100 92L84 116 96 120 112 168M140 92L156 116 144 120 128 168', null, L, 1.2),
      o.panuelo ? p('M146 122l4-9 4 6 4-9 4 12z', SANGRE, N, 0.8) : '',
      '<g transform="translate(60 -1) scale(1.2)">' + cabeza + '</g>',
      paj
        ? p('M120 100L103 91V109zM120 100L137 91V109z', paj, N, 1.3) +
          '<rect x="116" y="95" width="8" height="10" rx="2" fill="' +
          paj +
          '" stroke="' +
          N +
          '" stroke-width="1.3"/>'
        : '',
      ACCESORIOS[o.acc[0]](50, 144, o.palo),
      mano(50, 144, o.piel, hueso),
      ACCESORIOS[o.acc[1]](190, 144, o.palo),
      mano(190, 144, o.piel, hueso),
    ].join('');
  }

  var PERSONAJES = {
    picas: {
      J: {
        cabeza: 'esqueleto',
        chaqueta: N,
        camisa: 'costillas',
        pajarita: 'roja',
        acc: ['calavera', 'candelabro'],
      },
      Q: { cabeza: 'bruja', chaqueta: '#2a2230', camisa: 'corse', acc: ['escoba', 'pocion'] },
      K: { cabeza: 'muerte', chaqueta: N, camisa: 'tunica', acc: ['guadana', 'arena'] },
    },
    corazones: {
      J: { cabeza: 'lobo', chaqueta: '#4a3b30', camisa: 'pelaje', acc: ['farol', 'rosa'] },
      Q: { cabeza: 'vampiresa', chaqueta: '#2b0f14', camisa: 'corse', acc: ['rosa', 'caliz'] },
      K: {
        cabeza: 'vampiro',
        chaqueta: N,
        camisa: 'volantes',
        pajarita: 'roja',
        acc: ['caliz', 'candelabro'],
        panuelo: true,
      },
    },
    diamantes: {
      J: {
        cabeza: 'calabaza',
        chaqueta: MORADO,
        camisa: 'rayas',
        pajarita: 'negra',
        acc: ['farol', 'escoba'],
      },
      Q: { cabeza: 'medusa', chaqueta: '#1f3a2a', camisa: 'puntos', acc: ['daga', 'rosa'] },
      K: {
        cabeza: 'momia',
        chaqueta: '#6b5a3a',
        camisa: 'vendas',
        lineas: '#2a2018',
        acc: ['arena', 'daga'],
      },
    },
    treboles: {
      J: { cabeza: 'zombi', chaqueta: '#3b3a35', camisa: 'rasgada', acc: ['hacha', 'farol'] },
      Q: {
        cabeza: 'fantasma',
        chaqueta: '#cfd6df',
        camisa: 'volantes',
        lineas: '#6b7684',
        acc: ['rosa', 'candelabro'],
      },
      K: { cabeza: 'monstruo', chaqueta: '#2f3a2a', camisa: 'parches', acc: ['libro', 'hacha'] },
    },
  };

  function patrones(pre) {
    return (
      '<pattern id="' +
      pre +
      'vendas" width="10" height="8" patternUnits="userSpaceOnUse"><rect width="10" height="8" fill="#e2d6b5"/><path d="M0 1l10 2M0 6l10 1" stroke="#8a7a5a" stroke-width="1"/></pattern>' +
      '<pattern id="' +
      pre +
      'rayas" width="8" height="8" patternUnits="userSpaceOnUse"><rect width="8" height="8" fill="' +
      B +
      '"/><rect width="8" height="4" fill="' +
      N +
      '"/></pattern>' +
      '<pattern id="' +
      pre +
      'puntos" width="8" height="8" patternUnits="userSpaceOnUse"><rect width="8" height="8" fill="#c9d8b8"/><circle cx="2" cy="2" r="1.3" fill="#1f3a2a"/><circle cx="6" cy="6" r="1.3" fill="#1f3a2a"/></pattern>' +
      '<clipPath id="' +
      pre +
      'mitad"><rect x="0" y="0" width="' +
      W +
      '" height="' +
      MITAD +
      '"/></clipPath>'
    );
  }

  // Gotas de sangre que cuelgan del marco.
  function gotas() {
    return [
      [44, 9],
      [58, 15],
      [182, 12],
      [196, 7],
    ]
      .map(function (g) {
        return p('M' + (g[0] - 3) + ' 30v' + g[1] + 'a3 3 0 0 0 6 0v-' + g[1] + 'z', SANGRE);
      })
      .join('');
  }

  function figura(o, palo, valor, indice) {
    var pre = 'nh' + ++uid;
    o.palo = palo;
    o.piel = PIEL_H[o.cabeza];
    var fondo =
      '<circle cx="120" cy="58" r="46" fill="' +
      LUNA +
      '"/>' +
      murcielago(176, 86, 0.9) +
      murcielago(70, 108, 0.7);
    var mitad =
      '<g clip-path="url(#' +
      pre +
      'mitad)">' +
      fondo +
      cuerpo(o, pre, CABEZAS_H[o.cabeza]()) +
      gotas() +
      (palo ? pip(palo, 56, 54, 28) : '') +
      '</g>';
    return svg(
      '<rect x="34" y="30" width="172" height="276" fill="' +
        NIEBLA +
        '"/>' +
        mitad +
        girado(mitad) +
        '<path d="M50 168H190" stroke="' +
        N +
        '" stroke-width="1"/>' +
        '<rect x="34" y="30" width="172" height="276" fill="none" stroke="' +
        N +
        '" stroke-width="2"/>' +
        indice,
      valor + (palo ? ' de ' + palo : ''),
      patrones(pre),
    );
  }

  // ---------- Cartas numéricas y ases ----------
  var X = [72, 120, 168],
    T = 62,
    Bj = 274,
    M = 168,
    F4 = [62, 132.7, 203.3, 274];
  var DISPOSICION = {
    2: [
      [1, T],
      [1, Bj],
    ],
    3: [
      [1, T],
      [1, M],
      [1, Bj],
    ],
    4: [
      [0, T],
      [2, T],
      [0, Bj],
      [2, Bj],
    ],
    5: [
      [0, T],
      [2, T],
      [1, M],
      [0, Bj],
      [2, Bj],
    ],
    6: [
      [0, T],
      [2, T],
      [0, M],
      [2, M],
      [0, Bj],
      [2, Bj],
    ],
    7: [
      [0, T],
      [2, T],
      [1, 115],
      [0, M],
      [2, M],
      [0, Bj],
      [2, Bj],
    ],
    8: [
      [0, T],
      [2, T],
      [1, 115],
      [0, M],
      [2, M],
      [1, 221],
      [0, Bj],
      [2, Bj],
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

  function as(palo) {
    var espinas = '';
    for (var i = 0; i < 36; i++) {
      var a = (i * Math.PI) / 18,
        x = 120 + Math.cos(a) * 58,
        y = 168 + Math.sin(a) * 58;
      espinas +=
        'M' +
        f(x) +
        ' ' +
        f(y) +
        'L' +
        f(120 + Math.cos(a + 0.05) * 66) +
        ' ' +
        f(168 + Math.sin(a + 0.05) * 66) +
        'L' +
        f(120 + Math.cos(a + 0.1) * 58) +
        ' ' +
        f(168 + Math.sin(a + 0.1) * 58);
    }
    var corona =
      '<circle cx="120" cy="168" r="58" fill="none" stroke="' +
      N +
      '" stroke-width="2"/>' +
      p(espinas, N);
    if (palo !== 'picas') return corona + pip(palo, 120, 168, 64) + murcielago(120, 82, 1.1);
    return (
      murcielago(66, 74, 1) +
      murcielago(178, 96, 0.8) +
      murcielago(70, 262, 0.8) +
      pip('picas', 120, 168, 140, false, N) +
      '<g transform="translate(96 132) scale(.48)">' +
      CABEZAS_H.esqueleto() +
      '</g>' +
      '<path d="M52 280h136" stroke="' +
      SANGRE +
      '" stroke-width="18"/>' +
      '<text x="120" y="284" fill="' +
      PAPEL +
      '" font-family="' +
      FUENTE +
      '" font-size="11" font-weight="700" text-anchor="middle" letter-spacing="2">MEMENTO MORI</text>'
    );
  }

  function svgCarta(valor, palo) {
    valor = String(valor).toUpperCase();
    if (VALORES.indexOf(valor) < 0 || PALOS.indexOf(palo) < 0)
      throw new Error('Carta no válida: ' + valor + ' de ' + palo);
    if ('JQK'.indexOf(valor) >= 0) {
      var o = {},
        base = PERSONAJES[palo][valor];
      for (var k in base) o[k] = base[k];
      return figura(o, palo, valor, esquinas(valor, palo));
    }
    var centro =
      valor === 'A'
        ? as(palo)
        : DISPOSICION[+valor]
            .map(function (q) {
              return pip(palo, X[q[0]], q[1], 42, q[1] > M);
            })
            .join('');
    return svg(centro + esquinas(valor, palo), valor + ' de ' + palo);
  }

  function svgJoker(variante) {
    var rojo = variante !== 'negro';
    var o = {
      cabeza: 'payaso',
      chaqueta: rojo ? MORADO : N,
      camisa: 'puntos',
      pajarita: rojo ? 'roja' : 'negra',
      acc: ['naipe', 'daga'],
      panuelo: true,
    };
    return figura(o, null, 'Comodín', esquinas('JOKER', null, rojo ? SANGRE : N));
  }

  // ---------- Reversos ----------
  var COLORES_REVERSO = { morado: '#2a1f33', negro: '#141014', rojo: '#4a0c10', verde: '#1c2b1f' };

  function svgReverso(nombre, diseno) {
    var c = COLORES_REVERSO[nombre] || nombre || COLORES_REVERSO.morado;
    var id = 'nhr' + ++uid,
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
        p(d, null, '#b9b0c4', 0.8) +
        '</g>' +
        '<path d="M120 12V150" stroke="#b9b0c4" stroke-width="1"/>' +
        '<ellipse cx="120" cy="160" rx="9" ry="11" fill="' +
        N +
        '" stroke="#b9b0c4" stroke-width="1"/><circle cx="120" cy="146" r="6" fill="' +
        N +
        '" stroke="#b9b0c4" stroke-width="1"/>' +
        p(
          'M112 152l-12-8-4 6M112 158l-14 0-4 6M112 164l-12 8-2 8M128 152l12-8 4 6M128 158l14 0 4 6M128 164l12 8 2 8',
          null,
          '#b9b0c4',
          1.4,
        ) +
        '<circle cx="117" cy="145" r="1.2" fill="' +
        ROJO +
        '"/><circle cx="123" cy="145" r="1.2" fill="' +
        ROJO +
        '"/>' +
        p('M116 156l4 8 4-8z', ROJO);
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

  function crearMazo(opciones) {
    var mazo = [];
    PALOS.forEach(function (palo) {
      VALORES.forEach(function (valor) {
        mazo.push({ valor: valor, palo: palo, id: valor + '-' + palo });
      });
    });
    if (opciones && opciones.jokers)
      mazo.push(
        { valor: 'JOKER', palo: 'rojo', id: 'JOKER-rojo' },
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

  // opciones: { bocaAbajo: bool, girable: bool, reverso: color o '#hex', diseno: nombre del diseño de reverso }
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

  global.NaipesHorror = {
    ANCHO: W,
    ALTO: H,
    PALOS: PALOS,
    VALORES: VALORES,
    DISENOS: DISENOS,
    PERSONAJES: PERSONAJES,
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
