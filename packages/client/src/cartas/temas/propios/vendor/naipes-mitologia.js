/*!
 * naipes-mitologia.js — Baraja francesa de mitología griega: dioses del Olimpo de dos cabezas. SVG puro, sin dependencias.
 *
 *   Picas:     J Hermes  · Q Atenea    · K Hades
 *   Corazones: J Apolo   · Q Afrodita  · K Zeus
 *   Diamantes: J Dioniso · Q Hera      · K Poseidón
 *   Tréboles:  J Ares    · Q Artemisa  · K Hefesto
 *   Comodines: Pan
 *
 *   NaipesMitologia.svgCarta('K', 'corazones')         -> string SVG
 *   NaipesMitologia.svgReverso('azul', 'meandro')      -> string SVG (diseños: meandro | anfora | olivo; colores: azul | terracota | negro | verde)
 *   NaipesMitologia.svgJoker('rojo') · crearMazo({ jokers: true }) · barajar(mazo) · elemento(carta, opciones) · imagen(svg)
 */
(function (global) {
  'use strict';

  var W = 240,
    H = 336,
    MITAD = 168;
  var PALOS = ['picas', 'corazones', 'diamantes', 'treboles'];
  var VALORES = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
  var DISENOS = ['meandro', 'anfora', 'olivo'];
  var N = '#1b1712',
    B = '#fff',
    ROJO_PIP = '#b5482a',
    PAPEL = '#f7f1e3',
    NIEBLA = '#dce8f0',
    ORO = '#d9a72b',
    BLANCO_TOGA = '#f4efe4',
    TERRACOTA = '#c0603a',
    AZUL = '#2d5f8a',
    VERDE = '#5f8a3a',
    BRONCE = '#c8913a',
    ACERO = '#cfd3d8',
    MADERA = '#7a4a2a',
    PURPURA = '#6b2d5c';
  var PREFIJO = 'nm';
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
    return palo === 'corazones' || palo === 'diamantes' ? ROJO_PIP : N;
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

  // ---------- Generador de cabezas (coordenadas locales 0–100; la barbilla queda hacia y = 92) ----------
  var HUMANO = (function () {
    var N = '#18140f',
      B = '#fff',
      ORO = '#d9a72b';
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
    function rizos(cx, cy, r, desde, hasta, n, rr, col) {
      var s = '';
      for (var i = 0; i < n; i++) {
        var a = ((desde + ((hasta - desde) * i) / (n - 1)) * Math.PI) / 180;
        s += c(r1(cx + Math.cos(a) * r), r1(cy + Math.sin(a) * r), rr, col, N, 1.1);
      }
      return s;
    }
    var CALAVERA =
      p('M22 42Q22 8 50 8 78 8 78 42 78 56 70 62L68 74H32L30 62Q22 56 22 42z', '#efe6d2', N, 1.8) +
      espejo(p('M30 40Q38 32 46 40 46 52 38 54 28 52 30 40z', N)) +
      p('M50 52L45 62H55z', N) +
      p('M32 72H68L66 86Q50 94 34 86z', '#efe6d2', N, 1.6) +
      p('M32 77H68M37 72V84M43 72V86M50 72V87M57 72V86M63 72V84', null, N, 1);

    function pelo(o, capa) {
      var col = o.pelo || '#3a2a1e';
      switch (o.peinado) {
        case 'largo':
          return capa === 'atras'
            ? p('M24 44Q22 10 50 10 78 10 76 44L82 98 62 96 66 56H34L38 96 18 98z', col, N, 1.2)
            : p('M29 42Q32 18 50 20 68 18 71 42 64 28 50 31 36 28 29 42z', col, N, 1);
        case 'melena':
          return capa === 'atras'
            ? p('M22 48Q20 10 50 10 80 10 78 48L82 92 66 94 68 58H32L34 94 18 92z', col, N, 1.2) +
                p('M24 62q2 12 0 24M76 62q-2 12 0 24', null, N, 0.8)
            : p('M28 44Q30 16 50 16 70 16 72 44 66 30 58 32 50 26 42 32 34 30 28 44z', col, N, 1);
        case 'rizado':
          return capa === 'atras'
            ? rizos(50, 46, 28, 150, 390, 13, 8, col)
            : rizos(50, 40, 22, 195, 345, 7, 7, col);
        case 'recogido':
          return capa === 'atras'
            ? c(50, 13, 11, col, N, 1.2)
            : p('M29 42Q31 18 50 18 69 18 71 42 63 27 50 29 37 27 29 42z', col, N, 1);
        case 'calvo':
          return capa === 'atras'
            ? ''
            : p('M30 46q-3 10 0 20l4-2q-2-8 0-16zM70 46q3 10 0 20l-4-2q2-8 0-16z', col, N, 0.8);
        case 'chonmage':
          return capa === 'atras'
            ? p('M27 52Q24 30 30 26H70Q76 30 73 52z', col, N, 1.2)
            : p(
                'M28 46Q27 30 32 27L36 40Q32 42 28 46zM72 46Q73 30 68 27L64 40Q68 42 72 46z',
                col,
                N,
                1,
              ) +
                p('M46 6h8v20h-8z', col, N, 1) +
                p('M42 25h16', null, N, 2);
        case 'geisha':
          return capa === 'atras'
            ? p('M16 46Q10 8 50 4 90 8 84 46 78 30 50 26 22 30 16 46z', col, N, 1.2) +
                c(50, 4, 12, col, N, 1.2)
            : p('M28 44Q30 22 50 22 70 22 72 44 64 30 50 32 36 30 28 44z', col, N, 1) +
                p('M22 22L8 14M78 22l14-8M66 6l16-8', null, ORO, 2) +
                c(8, 14, 2.6, '#c0392b') +
                c(92, 14, 2.6, '#c0392b') +
                c(82, -2, 2.6, '#c0392b') +
                flor(24, 12, 5, '#f4a7b9');
        case 'bob':
          return capa === 'atras'
            ? p('M22 44Q20 10 50 10 80 10 78 44V86H22z', col, N, 1.2)
            : p('M28 42Q28 16 50 16 72 16 72 42z', col, N, 1);
        case 'trenzas':
          return capa === 'atras'
            ? p('M24 46Q22 12 50 12 78 12 76 46z', col, N, 1.2) +
                trenza(26, 56, col) +
                trenza(74, 56, col)
            : p('M29 42Q32 18 50 20 68 18 71 42 64 28 50 31 36 28 29 42z', col, N, 1);
        case 'puntas':
          return capa === 'atras'
            ? ''
            : p(
                'M28 46L25 20 34 28 37 10 44 24 50 6 56 24 63 10 66 28 75 20 72 46 64 30 50 30 36 30z',
                col,
                N,
                1,
              );
        default:
          return capa === 'atras'
            ? p('M27 52Q24 16 50 16 76 16 73 52z', col, N, 1.2)
            : p('M28 46Q26 16 50 15 74 16 72 46 68 30 58 29 50 33 42 29 32 30 28 46z', col, N, 1);
      }
    }

    function barba(o) {
      var col = o.barbaColor || o.pelo || '#3a2a1e';
      var bigote = p('M38 74q6-5 12-1 6-4 12 1-6 4-12 1-6 3-12-1z', col, N, 0.9);
      switch (o.barba) {
        case 'corta':
          return (
            p('M31 64Q32 90 50 95 68 90 69 64 63 78 50 80 37 78 31 64z', col, N, 1.2) +
            p('M40 84l2 4M50 85v5M60 84l-2 4', null, N, 0.7) +
            bigote
          );
        case 'larga':
          return (
            p('M29 60Q28 104 50 114 72 104 71 60 63 76 50 78 37 76 29 60z', col, N, 1.2) +
            p(
              'M38 84q2 12 6 22M50 86v24M62 84q-2 12-6 22M44 82q0 14 2 26M56 82q0 14-2 26',
              null,
              N,
              0.7,
            ) +
            bigote
          );
        case 'rizada':
          return (
            p('M32 66Q34 98 50 102 66 98 68 66 60 80 50 82 40 80 32 66z', col, N, 1) +
            rizos(50, 76, 20, 15, 165, 8, 6, col) +
            rizos(50, 96, 7, 20, 160, 3, 5, col) +
            bigote
          );
        case 'perilla':
          return p('M44 85Q50 100 56 85 50 89 44 85z', col, N, 1) + bigote;
        case 'bigote':
          return bigote;
        case 'faraon':
          return (
            p('M45 88h10l-1 18h-8z', col, N, 1) + p('M45 93h10M45 98h10M46 103h8', null, N, 0.6)
          );
        case 'enano':
          return (
            p('M25 58Q23 114 50 122 77 114 75 58 64 76 50 78 36 76 25 58z', col, N, 1.2) +
            p('M38 84q2 14 6 26M50 86v28M62 84q-2 14-6 26', null, N, 0.7) +
            p('M40 104h20M43 113h14', null, ORO, 3.2) +
            bigote
          );
        default:
          return '';
      }
    }

    function tocado(o) {
      var col = o.tocadoColor,
        hojas = '',
        i,
        a,
        x,
        y;
      switch (o.tocado) {
        case 'tricornio':
          return (
            p('M8 36Q50 8 92 36L84 42Q50 32 16 42z', col || N, N, 1.2) +
            p('M22 36Q28 4 50 4 72 4 78 36Q50 26 22 36z', col || N, N, 1.2) +
            p('M12 37Q50 13 88 37', null, ORO, 1.6) +
            (o.emblema ? '<g transform="translate(42 12) scale(.16)">' + CALAVERA + '</g>' : '') +
            (o.pluma ? p('M70 24Q92 2 99 9 86 11 76 30z', o.pluma, N, 1) : '')
          );
        case 'bicornio':
          return (
            p('M4 34Q50 2 96 34Q50 22 4 34z', col || N, N, 1.2) +
            p('M8 33Q50 6 92 33', null, ORO, 2) +
            c(50, 20, 4, '#c0392b', ORO, 1.2)
          );
        case 'bandana':
          return (
            p('M27 38Q28 14 50 14 72 14 73 38Q50 28 27 38z', col || '#c0392b', N, 1.2) +
            p('M72 30l15 2-3 7zM72 33l11 10-6 2z', col || '#c0392b', N, 1) +
            (o.lunares === false
              ? ''
              : [
                  [38, 24],
                  [50, 20],
                  [62, 24],
                  [44, 31],
                  [57, 30],
                ]
                  .map(function (q) {
                    return c(q[0], q[1], 1.6, B);
                  })
                  .join(''))
          );
        case 'gorro':
          return (
            p('M28 36Q28 10 50 10 72 10 72 36z', col || '#2c4a7a', N, 1.2) +
            p('M27 31h46v7H27z', col || '#2c4a7a', N, 1) +
            p('M27 34.5h46', null, B, 1) +
            c(50, 9, 4, B, N, 1)
          );
        case 'laurel':
          for (i = 0; i < 7; i++) {
            a = ((195 + i * 22) * Math.PI) / 180;
            x = 50 + Math.cos(a) * 25;
            y = 36 + Math.sin(a) * 18;
            hojas +=
              '<ellipse cx="' +
              r1(x) +
              '" cy="' +
              r1(y) +
              '" rx="5.5" ry="2.6" transform="rotate(' +
              r1((a * 180) / Math.PI + 90) +
              ' ' +
              r1(x) +
              ' ' +
              r1(y) +
              ')"/>';
          }
          return (
            '<g fill="' +
            (col || '#5f8a3a') +
            '" stroke="' +
            N +
            '" stroke-width=".8">' +
            hojas +
            '<g transform="translate(100 0) scale(-1 1)">' +
            hojas +
            '</g></g>' +
            (o.uvas
              ? rizos(26, 34, 5, 0, 300, 5, 3.4, '#6b2d5c') +
                rizos(74, 34, 5, 0, 300, 5, 3.4, '#6b2d5c')
              : '')
          );
        case 'casco':
          return (
            p('M26 16Q50-14 76 14', null, N, 10) +
            p('M26 16Q50-14 76 14', null, col || '#b0302a', 7.5) +
            p('M30 10l4 4M38 4l3 5M46 1l2 5M54 1l-1 5M62 3l-2 5M70 8l-3 4', null, N, 0.8) +
            p('M26 42Q24 10 50 10 76 10 74 42Q50 32 26 42z', '#c8913a', N, 1.3) +
            p('M30 36Q50 28 70 36', null, N, 0.9) +
            p('M47 12V30', null, N, 0.8)
          );
        case 'corona':
          return (
            p('M30 32L28 12 38 22 50 8 62 22 72 12 70 32z', col || '#e2b13c', N, 1.2) +
            p('M29 28h42v6H29z', col || '#e2b13c', N, 1) +
            c(50, 31, 2.4, o.joya || '#c0392b', N, 0.7) +
            c(28, 12, 2, B, N, 0.6) +
            c(50, 8, 2, B, N, 0.6) +
            c(72, 12, 2, B, N, 0.6)
          );
        case 'coronaPuntas':
          return (
            p(
              'M28 32L28 6 35 22 42 2 48 20 50 0 52 20 58 2 65 22 72 6 72 32z',
              col || '#e2b13c',
              N,
              1.2,
            ) +
            p('M27 28h46v6H27z', col || '#e2b13c', N, 1) +
            c(50, 31, 2.4, o.joya || '#2d7f9e', N, 0.7)
          );
        case 'diadema':
          return (
            p('M29 32Q50 22 71 32V37Q50 27 29 37z', col || '#e2b13c', N, 1) +
            c(50, 27, 2.8, o.joya || '#c0392b', N, 0.7) +
            (o.luna ? p('M44 18a8 8 0 1 0 12 0 6 6 0 1 1-12 0z', '#eef0f5', N, 1) : '')
          );
        case 'petaso':
          return (
            espejo(
              p('M30 24Q12 8 4 16 12 17 9 23 18 21 17 28L24 26z', B, N, 1) +
                p('M12 16l10 6M12 22l9 4', null, N, 0.6),
            ) +
            p('M14 32Q50 18 86 32Q50 40 14 32z', col || '#b08850', N, 1.2) +
            p('M32 30Q34 8 50 8 66 8 68 30z', col || '#b08850', N, 1.2)
          );
        case 'pileo':
          return (
            p('M28 36Q30 4 54 4 68 8 72 36z', col || '#7a4a2a', N, 1.2) + p('M28 33h44', null, N, 1)
          );
        case 'concha':
          return (
            p('M36 26Q50 0 64 26z', '#f2b8a2', N, 1.2) +
            p('M50 6V25M44 10l2 15M56 10l-2 15M40 16l3 9M60 16l-3 9', null, N, 0.7) +
            [30, 36, 64, 70]
              .map(function (x, k) {
                return c(x, 28 - (k % 2 ? 1.5 : 0), 2.4, '#f6f2ea', N, 0.7);
              })
              .join('')
          );
        case 'cascoEspacial':
          return (
            '<circle cx="50" cy="52" r="43" fill="#bfe6ff" fill-opacity=".22" stroke="#55565c" stroke-width="2.6"/>' +
            p('M20 36q10-20 30-24', null, B, 3.4, ' stroke-opacity=".85"') +
            p('M12 80Q50 106 88 80', null, '#cfd3d8', 7) +
            p('M12 80Q50 106 88 80', null, N, 1)
          );
        case 'coronaTech':
          return (
            p('M28 34L30 16 40 26 50 10 60 26 70 16 72 34z', col || '#9aa4b2', N, 1.2) +
            p('M28 30h44v5H28z', '#55565c', N, 1) +
            c(50, 24, 3.2, '#36c5f0', N, 0.8)
          );
        case 'antenas':
          return espejo(
            p('M40 26Q34 10 26 2', null, N, 1.6) + c(26, 2, 3.4, col || '#c0392b', N, 0.8),
          );
        case 'charro':
          return (
            p('M-2 42Q50 24 102 42Q50 56-2 42z', col || '#1d1d2b', N, 1.2) +
            p('M30 40Q32 4 50 4 68 4 70 40z', col || '#1d1d2b', N, 1.2) +
            p('M3 42Q50 28 97 42', null, ORO, 1.6) +
            p('M30 33Q50 27 70 33', null, ORO, 2.6)
          );
        case 'catrina':
          return (
            p('M-6 36Q50 16 106 30Q50 48-6 36z', col || '#2b2140', N, 1.2) +
            p('M28 32Q30 4 54 4 74 6 74 30z', col || '#2b2140', N, 1.2) +
            p('M72 18Q90-2 98 3 86 6 78 24z', '#f2f2f2', N, 1) +
            flor(34, 24, 7, '#e8487a') +
            flor(48, 20, 7, '#f39c34') +
            flor(62, 24, 7, '#8e44ad')
          );
        case 'chistera':
          return (
            p('M14 34Q50 26 86 34Q50 40 14 34z', col || N, N, 1.2) +
            p('M30 32V8H70V32z', col || N, N, 1.2) +
            p('M30 22h40v6H30z', o.cinta || '#c0392b')
          );
        case 'flores':
          for (i = 0; i < 7; i++) {
            a = ((200 + i * 23.3) * Math.PI) / 180;
            hojas += flor(
              r1(50 + Math.cos(a) * 26),
              r1(34 + Math.sin(a) * 20),
              6,
              ['#f39c34', '#e8487a', '#f2c230', '#8e44ad'][i % 4],
            );
          }
          return hojas;
        case 'penacho':
          for (i = 0; i < 9; i++) {
            a = -80 + i * 20;
            hojas +=
              '<ellipse cx="50" cy="8" rx="5" ry="20" fill="' +
              ['#2f8a5a', '#c0392b', '#f2c230', '#1abc9c'][i % 4] +
              '" stroke="' +
              N +
              '" stroke-width=".8" transform="rotate(' +
              a +
              ' 50 30)"/>';
          }
          return (
            hojas +
            p('M27 30Q50 22 73 30V37Q50 29 27 37z', ORO, N, 1) +
            c(50, 32, 3, '#1abc9c', N, 0.7)
          );
        case 'mago':
          return (
            p('M4 40Q50 30 96 40Q50 50 4 40z', col || '#3b2a6b', N, 1.2) +
            p('M26 38Q42 18 54-8Q62-12 66-4L58 6Q70 20 76 38z', col || '#3b2a6b', N, 1.2) +
            p('M28 34Q50 28 74 34', null, ORO, 3) +
            estrella(44, 20, 4) +
            estrella(60, 8, 3) +
            estrella(62, 28, 2.6)
          );
        case 'capucha':
          return p(
            'M12 104Q6 40 24 16 38 2 50 2 62 2 76 16 94 40 88 104zM30 104Q26 60 30 44 34 30 50 30 66 30 70 44 74 60 70 104z',
            col || '#3a3a3a',
            N,
            1.2,
            ' fill-rule="evenodd"',
          );
        case 'cuernos':
          return (
            espejo(p('M28 30Q8 24 4 2 16 14 30 22z', '#efe6d2', N, 1)) +
            p('M26 40Q24 10 50 10 76 10 74 40z', '#9aa4b2', N, 1.2) +
            p('M26 36h48', null, ORO, 3) +
            c(36, 36, 1.6, N) +
            c(50, 36, 1.6, N) +
            c(64, 36, 1.6, N)
          );
        case 'elfica':
          return (
            p('M28 36Q50 26 72 36', null, '#cfd8e0', 2.6) +
            espejo(
              '<ellipse cx="40" cy="30" rx="5" ry="2" fill="#cfd8e0" stroke="' +
                N +
                '" stroke-width=".6" transform="rotate(-30 40 30)"/>',
            ) +
            p('M50 24l-4 6 4 6 4-6z', o.joya || '#36c5f0', N, 0.8)
          );
        case 'boina':
          return (
            p('M24 30Q24 10 52 10 78 12 76 30Q50 24 24 30z', col || '#7a2a4a', N, 1.2) +
            p('M70 18Q92 0 98 6 86 8 76 22z', o.pluma || '#e8b04b', N, 1)
          );
        case 'yelmo':
          return (
            p('M24 56Q22 8 50 8 78 8 76 56H68V40H32V56z', '#aab4c0', N, 1.4) +
            p('M28 30Q50 18 72 30V37Q50 27 28 37z', '#8a94a2', N, 1) +
            p('M50 8Q60-8 78-6 66 0 58 10z', col || '#c0392b', N, 1)
          );
        case 'nemes':
          return (
            p(
              'M26 44Q24 14 50 14 76 14 74 44L82 94H68L68 46Q50 36 32 46L32 94H18z',
              col || '#e2b13c',
              N,
              1.2,
            ) +
            p(
              'M28 22h44M27 28h46M30 36q20-8 40 0M22 60h10M68 60h10M21 70h11M68 70h11M20 80h12M68 80h12',
              null,
              o.franja || '#2d5f8a',
              2.6,
            ) +
            (o.uraeus === false ? '' : p('M48 40q-4-10 2-14 6 4 2 14z', ORO, N, 1))
          );
        case 'atef':
          return (
            espejo(p('M36 34Q28 14 32-4 38 14 40 32z', '#e8dcc4', N, 1)) +
            p('M38 34Q36 10 50-6 64 10 62 34z', '#f4efe4', N, 1.2) +
            p('M36 32h28', null, ORO, 3) +
            p('M48 32q-4-8 2-12 6 4 2 12z', ORO, N, 1)
          );
        case 'disco':
          return (
            espejo(p('M36 26Q20 14 28-6 30 10 42 20z', '#3a2a1e', N, 1)) +
            c(50, 4, 13, '#e74c3c', N, 1.2) +
            p('M30 30Q50 22 70 30V36Q50 28 30 36z', ORO, N, 1)
          );
        case 'coronaReina':
          return (
            p('M30 36L26 6H74L70 36z', col || '#2d5f8a', N, 1.2) +
            p('M28 24h44M27 15h46', null, ORO, 2.6) +
            p('M48 36q-4-8 2-12 6 4 2 12z', ORO, N, 1)
          );
        case 'kabuto':
          return (
            p('M16 48Q50 38 84 48L90 64Q50 56 10 64z', col || '#2b2b2b', N, 1) +
            p(
              'M20 48Q18 14 50 12 82 14 80 48L72 44Q70 26 50 26 30 26 28 44z',
              col || '#2b2b2b',
              N,
              1.2,
            ) +
            p('M14 56Q50 48 86 56', null, ORO, 1.4) +
            espejo(p('M46 18Q34 0 18-8 28 6 44 22z', ORO, N, 1)) +
            c(50, 20, 4, ORO, N, 1)
          );
        case 'hachimaki':
          return (
            p('M28 38Q50 30 72 38V44Q50 36 28 44z', B, N, 1) +
            c(50, 38, 3.4, '#c0392b') +
            p('M72 40l12 6M72 42l10 10', null, B, 3)
          );
        case 'kasa':
          return (
            p('M0 42L50 4 100 42Q50 50 0 42z', '#d6b46a', N, 1.2) +
            p('M50 4L28 40M50 4L50 46M50 4L72 40M50 4L12 41M50 4L88 41', null, '#8a6a2a', 0.8)
          );
        case 'eboshi':
          return (
            p('M34 30Q34 2 52 0 66 2 66 30z', '#1d1d2b', N, 1.2) +
            p('M36 30Q50 34 64 30', null, B, 1)
          );
        case 'kanmuri':
          return (
            p('M54 14Q74-6 92-2 76 2 60 18z', '#1d1d2b', N, 1) +
            p('M32 32Q32 12 50 12 68 12 68 32z', '#1d1d2b', N, 1.2) +
            p('M34 26h32', null, ORO, 2)
          );
        case 'noel':
          return (
            p('M24 34Q30 4 56 4 82 8 94 42L84 46Q78 24 62 20 44 20 40 34z', '#c0392b', N, 1.2) +
            p('M22 30Q50 22 78 30V40Q50 32 22 40z', B, N, 1) +
            c(92, 44, 7, B, N, 1)
          );
        case 'elfo':
          return (
            p('M26 34Q36 2 60-4 84 0 94 22 82 14 70 16L74 34z', '#2f8a3a', N, 1.2) +
            p('M24 30Q50 24 76 30V38Q50 32 24 38z', '#c0392b', N, 1) +
            c(94, 24, 4, ORO, N, 1)
          );
        case 'shako':
          return (
            p('M30 32V6H70V32z', col || '#1d1d2b', N, 1.2) +
            p('M28 28h44v6H28z', ORO, N, 1) +
            p('M30 11h40', null, ORO, 2) +
            p('M50 6Q45-2 50-6 55-2 50 6z', B, N, 0.8) +
            c(50, 19, 5, ORO, N, 1)
          );
        case 'hielo':
          return p(
            'M26 34L28 14 34 26 40 4 46 24 50 0 54 24 60 4 66 26 72 14 74 34z',
            '#d8eefa',
            '#5b8db8',
            1.2,
          );
        case 'turbante':
          return (
            p('M22 40Q18 10 50 8 82 10 78 40Q50 30 22 40z', col || '#f4efe4', N, 1.2) +
            p('M26 30Q50 16 74 28M28 36Q50 24 72 34', null, 'rgba(0,0,0,.25)', 1.2) +
            c(50, 22, 4, o.joya || '#c0392b', N, 1) +
            p('M50 18Q46 0 54-4 56 8 52 18z', B, N, 0.8)
          );
        case 'aureola':
          return '<ellipse cx="50" cy="6" rx="22" ry="5" fill="none" stroke="#f2c230" stroke-width="3.4"/>';
        case 'cofia':
          return (
            p('M24 34Q24 12 50 12 76 12 76 34Q50 28 24 34z', B, N, 1) +
            p('M24 34Q50 28 76 34', null, N, 1.4, ' stroke-dasharray="1 3"') +
            p('M70 30l8 10M72 30l2 12', null, '#c0392b', 2.4)
          );
        default:
          return '';
      }
    }

    function estrella(x, y, r) {
      var d = '';
      for (var k = 0; k < 10; k++) {
        var rr = k % 2 ? r * 0.45 : r,
          a = -Math.PI / 2 + (k * Math.PI) / 5;
        d += (k ? 'L' : 'M') + r1(x + Math.cos(a) * rr) + ' ' + r1(y + Math.sin(a) * rr);
      }
      return p(d + 'z', '#f2c230', N, 0.6);
    }
    function flor(x, y, r, col) {
      var s = '';
      for (var k = 0; k < 6; k++) {
        var a = (k * Math.PI) / 3;
        s += c(
          r1(x + Math.cos(a) * r * 0.55),
          r1(y + Math.sin(a) * r * 0.55),
          r1(r * 0.45),
          col,
          N,
          0.6,
        );
      }
      return s + c(x, y, r1(r * 0.32), '#f2c230', N, 0.6);
    }
    function trenza(x, y, col) {
      var s = '';
      for (var k = 0; k < 6; k++)
        s +=
          '<ellipse cx="' +
          x +
          '" cy="' +
          (y + k * 8) +
          '" rx="5" ry="5" fill="' +
          col +
          '" stroke="' +
          N +
          '" stroke-width="1"/>';
      return s;
    }

    function cabeza(o) {
      var iris = o.ojos || '#3a2a1e';
      var ojos = espejo(
        p('M33 53Q39 48 45 53 39 56 33 53z', B, N, 1) +
          c(39, 53, 2.2, iris) +
          c(39, 53, 1, N) +
          (o.femenino
            ? p('M33 53l-3-2M34.5 51l-2-3M37 50l-1-3', null, N, 0.9) +
              p('M33 46Q39 43 45 46', null, N, 1.2)
            : p('M31 46L46 47.5', null, o.cejas || N, 2.2)),
      );
      return (
        pelo(o, 'atras') +
        p('M41 84H59V100H41z', o.piel, N, 1) +
        (o.cuernos ? espejo(p('M33 26Q20 10 28 0 30 12 40 22z', '#d9c9a8', N, 1)) : '') +
        p('M30 44Q30 24 50 24 70 24 70 44L68 68Q62 88 50 92 38 88 32 68z', o.piel, N, 1.5) +
        (o.orejas === 'elfo'
          ? espejo(p('M31 50L12 34 29 64z', o.piel, N, 1))
          : espejo(p('M30 54q-4 0-3 6t5 6', o.piel, N, 1))) +
        (o.catrina ? espejo(c(39, 53, 10, o.color2 || '#e8487a') + c(39, 53, 7, '#1d1d2b')) : '') +
        (o.kohl ? espejo(p('M32 48Q39 43 46 48', null, o.sombra || '#2d7f9e', 3)) : '') +
        ojos +
        (o.kohl ? espejo(p('M33 53Q39 48 45 53L50 50', null, N, 1.8)) : '') +
        (o.oshiroi ? espejo(p('M45 51l4-1', null, '#c0392b', 1.4)) : '') +
        (o.catrina
          ? p('M47 67q3-6 3 0 0-6 3 0l-3 4z', '#1d1d2b') +
            p('M36 80Q50 84 64 80', null, N, 1.2) +
            p('M40 77v6M44 78v6M48 78v6M52 78v6M56 78v6M60 77v6', null, N, 0.9) +
            c(50, 32, 3.2, o.color || '#f39c34', N, 0.6) +
            espejo(c(44, 35, 1.6, o.color2 || '#e8487a')) +
            p('M45 88q5 3 10 0', null, o.color || '#f39c34', 1.4)
          : p('M50 54L47 68 52 69', null, N, 1) +
            (o.femenino
              ? p(
                  'M43 79Q47 76 50 78 53 76 57 79 53 83 50 83 47 83 43 79z',
                  o.labios || '#b83a35',
                  N,
                  0.8,
                )
              : p('M43 80q7 3 14 0', null, N, 1.3))) +
        (o.mejillas ? espejo(c(35, 66, 4.5, 'rgba(230,90,90,.45)')) : '') +
        (o.colmillos ? espejo(p('M42 84l1-8 3 7z', '#fff', N, 0.7)) : '') +
        (o.gafas
          ? espejo(
              '<circle cx="39" cy="53" r="7.5" fill="none" stroke="' +
                (o.gafas === true ? '#8a6a2a' : o.gafas) +
                '" stroke-width="1.6"/>',
            ) + p('M46.5 53h7', null, '#8a6a2a', 1.4)
          : '') +
        (o.cyborg
          ? p('M50 24Q70 24 70 44L68 68Q62 88 50 92z', '#9aa4b2', N, 1.2) +
            c(61, 53, 4, '#e53935', N, 1) +
            c(58, 34, 1.4, N) +
            c(66, 72, 1.4, N) +
            p('M50 60h14', null, N, 0.8)
          : '') +
        (o.mascara
          ? p(
              'M29 58Q50 54 71 58L68 68Q62 88 50 92 38 88 32 68z',
              o.mascara === true ? '#1d1d2b' : o.mascara,
              N,
              1.2,
            )
          : '') +
        (o.visor
          ? p(
              'M27 47Q50 41 73 47V58Q50 53 27 58z',
              o.visor === true ? '#36c5f0' : o.visor,
              N,
              1.2,
              ' fill-opacity=".85"',
            )
          : '') +
        (o.mayor ? p('M38 36q12-3 24 0M40 40q10-2 20 0', null, 'rgba(0,0,0,.35)', 0.8) : '') +
        (o.cicatriz ? p('M60 59l7 13M61 63l4-1.5M63 67l4-1.5', null, '#8a3b2b', 1.2) : '') +
        (o.parche
          ? p('M27 42L55 50M67 50L73 46', null, N, 1.6) +
            '<ellipse cx="61" cy="53" rx="7" ry="6" fill="' +
            N +
            '"/>'
          : '') +
        barba(o) +
        pelo(o, 'delante') +
        (o.pendiente ? c(30.5, 68, 3.2, 'none', ORO, 1.6) : '') +
        (o.antiparras
          ? espejo(c(39, 32, 7, '#9fd3e8', '#55565c', 2.4)) +
            p('M26 32h6M46 32h8M68 32h6', null, '#55565c', 2.4)
          : '') +
        tocado(o)
      );
    }

    return {
      cabeza: cabeza,
      tocado: tocado,
      flor: flor,
      estrella: estrella,
      calavera: CALAVERA,
      p: p,
      c: c,
      espejo: espejo,
      rizos: rizos,
    };
  })();

  // ---------- Cabezas especiales (criaturas, máscaras y personajes no humanos) ----------
  var ESPECIAL = (function () {
    var N = '#18140f',
      B = '#fff',
      ORO = '#d9a72b';
    var p = HUMANO.p,
      c = HUMANO.c,
      espejo = HUMANO.espejo;
    var nemesAtras = function (col, franja) {
      return (
        p('M22 40Q20 14 50 14 80 14 78 40L84 96H66V56H34V96H16z', col || '#e2b13c', N, 1.2) +
        p('M18 62h16M66 62h16M17 72h17M66 72h17M16 82h18M66 82h18', null, franja || '#2d5f8a', 2.6)
      );
    };
    return {
      alien: function (o) {
        return (
          (o.antenas ? HUMANO.tocado({ tocado: 'antenas', tocadoColor: o.antenas }) : '') +
          p('M14 40Q14 4 50 4 86 4 86 40 86 64 64 82L50 94 36 82Q14 64 14 40z', o.piel, N, 1.6) +
          espejo(p('M22 44Q34 36 46 48 42 62 32 60 20 54 22 44z', N) + c(31, 48, 2.4, B)) +
          (o.femenino
            ? espejo(p('M22 44l-4-3M25 41l-3-4', null, N, 1)) +
              p('M44 79Q50 76 56 79 50 83 44 79z', o.labios || '#8e44ad', N, 0.8)
            : p('M45 79q5 2 10 0', null, N, 1.2)) +
          p('M47 66h1.5M51.5 66h1.5', null, N, 2) +
          (o.corona ? HUMANO.tocado({ tocado: 'coronaTech', tocadoColor: ORO }) : '')
        );
      },
      robot: function (o) {
        var col = o.metal || '#aab4c0';
        return (
          espejo(p('M14 40h8v18h-8z', '#55565c', N, 1)) +
          p('M40 84h20v14H40z', '#7d8792', N, 1) +
          p('M22 18h56v66H22z', col, N, 1.6) +
          p('M50 18V4', null, N, 2) +
          c(50, 3, 3.4, '#e53935', N, 1) +
          p('M28 36h44v16H28z', '#1d2b44', N, 1) +
          c(40, 44, 4.4, o.ojos || '#36c5f0') +
          c(60, 44, 4.4, o.ojos || '#36c5f0') +
          p('M34 64h32v12H34z', '#55565c', N, 1) +
          p('M40 64v12M46 64v12M52 64v12M58 64v12', null, N, 0.8) +
          c(27, 23, 1.6, N) +
          c(73, 23, 1.6, N) +
          c(27, 79, 1.6, N) +
          c(73, 79, 1.6, N)
        );
      },
      xolo: function () {
        return (
          espejo(p('M24 36L8 0 40 20z', '#3b3b44', N, 1.4) + p('M24 28L15 8 34 21z', '#c47a7a')) +
          p(
            'M24 40Q24 16 50 16 76 16 76 40 76 58 66 66L62 86Q50 94 38 86L34 66Q24 58 24 40z',
            '#4a4a55',
            N,
            1.6,
          ) +
          p('M38 62Q50 56 62 62L60 82Q50 90 40 82z', '#5c5c68', N, 1) +
          '<ellipse cx="50" cy="64" rx="6" ry="4" fill="' +
          N +
          '"/>' +
          espejo(
            p('M32 44Q38 39 45 45 38 49 32 44z', '#f2a51c', N, 1) +
              c(38.5, 44.5, 1.8, N) +
              c(36, 50, 2, '#e8487a'),
          ) +
          p('M46 84q4 10 8 0z', '#e87a8a', N, 0.8) +
          HUMANO.tocado({ tocado: 'flores' })
        );
      },
      dragon: function () {
        var escamas = '';
        for (var y = 30; y < 70; y += 8)
          for (var x = 34; x < 68; x += 8)
            escamas += 'M' + (x + (y % 16 ? 4 : 0)) + ' ' + y + 'q4 4 8 0';
        return (
          espejo(
            p('M30 22Q14 0 4-4 16 12 26 28z', '#efe6d2', N, 1.2) +
              p('M22 40L6 34 18 50z', '#c0392b', N, 1),
          ) +
          p(
            'M20 50Q16 16 50 12 84 16 80 50 78 70 66 80L60 94H40L34 80Q22 70 20 50z',
            '#2f8a5a',
            N,
            1.6,
          ) +
          p(escamas, null, '#1f5a3a', 0.9) +
          p('M44 12l6-10 6 10M38 14l4-8 4 6M54 12l4-6 4 8', '#c0392b', N, 0.8) +
          espejo(
            p('M28 44Q36 36 46 46 38 52 28 44z', '#f2c230', N, 1) +
              p('M37.5 40Q36 45 37.5 50 39 45 37.5 40z', N),
          ) +
          p('M38 70Q50 64 62 70L60 90Q50 96 40 90z', '#3fa06a', N, 1.2) +
          espejo(c(44, 74, 1.8, N)) +
          p('M40 86l3 5 3-4 4 5 4-5 3 4 3-5', '#fff', N, 0.6)
        );
      },
      anubis: function () {
        return (
          nemesAtras() +
          espejo(
            p('M32 30L24-8 46 18z', '#1d1d2b', N, 1.4) + p('M32 22L28 2 40 16', null, ORO, 1.2),
          ) +
          p(
            'M28 40Q28 18 50 18 72 18 72 40 70 54 62 60L58 92Q50 98 42 92L38 60Q30 54 28 40z',
            '#1d1d2b',
            N,
            1.6,
          ) +
          espejo(
            p('M32 44Q38 39 45 45 38 48 32 44z', ORO, N, 0.8) +
              c(39, 44.5, 1.6, N) +
              p('M30 42Q38 37 47 44', null, ORO, 1.2),
          ) +
          '<ellipse cx="50" cy="90" rx="5" ry="3.4" fill="' +
          N +
          '" stroke="' +
          ORO +
          '" stroke-width=".8"/>' +
          p('M50 60V86', null, '#3a3a4e', 1)
        );
      },
      horus: function (o) {
        return (
          nemesAtras('#2d5f8a', ORO) +
          (o.disco
            ? c(50, 2, 14, '#e74c3c', N, 1.2) + p('M46 16q-3-8 4-11 6 3 0 11z', ORO, N, 1)
            : '') +
          p(
            'M26 44Q26 14 50 14 74 14 74 44 74 66 60 80L50 92 40 80Q26 66 26 44z',
            '#8a5a32',
            N,
            1.6,
          ) +
          p('M32 70Q50 60 68 70L60 80 50 92 40 80z', '#efe0c8', N, 1) +
          espejo(
            c(38, 44, 6.5, '#f2c230', N, 1) +
              c(38, 44, 3.2, N) +
              p('M37 51q-3 9 2 16M31 44h-5', null, N, 2),
          ) +
          p('M44 52Q50 48 56 52L54 70Q50 77 46 70z', '#f2c230', N, 1.2) +
          p('M46 64Q50 70 54 64', null, N, 1)
        );
      },
      bastet: function () {
        return (
          espejo(p('M26 36L20 2 46 24z', '#1d1d2b', N, 1.4) + p('M28 28L24 10 38 22z', '#c47a7a')) +
          p(
            'M24 46Q24 20 50 20 76 20 76 46 76 68 62 80Q50 90 38 80Q24 68 24 46z',
            '#1d1d2b',
            N,
            1.6,
          ) +
          espejo(
            p('M30 48Q38 41 46 49 38 54 30 48z', '#7ccf5a', ORO, 1.2) +
              p('M38 43Q36.5 48 38 53 39.5 48 38 43z', N) +
              p('M46 49l6-2', null, ORO, 1.2) +
              p('M40 68L14 64M40 71L14 72', null, B, 0.7),
          ) +
          p('M46 62h8l-4 5z', '#e8a0a8') +
          p('M50 67v4M45 73q5 3 10 0', null, B, 1) +
          c(24, 60, 3.4, 'none', ORO, 1.8) +
          p('M30 82Q50 94 70 82', null, ORO, 3)
        );
      },
      sobek: function () {
        var dientes =
          'M36 60l2 4 2-4 2 4 2-4M36 74l2 4 2-4M36 86l2 4 2-4M64 60l-2 4-2-4-2 4-2-4M64 74l-2 4-2-4M64 86l-2 4-2-4';
        return (
          nemesAtras() +
          c(50, 6, 10, '#e74c3c', N, 1.2) +
          p('M28 34Q28 14 50 14 72 14 72 34L68 56H32z', '#4f7a35', N, 1.6) +
          p('M34 54H66L62 94Q50 100 38 94z', '#5f8a45', N, 1.6) +
          p(dientes, B, N, 0.6) +
          espejo(c(38, 30, 6, '#f2c230', N, 1) + p('M38 25V35', null, N, 2)) +
          espejo(c(46, 92, 1.6, N)) +
          p('M40 40q10 4 20 0M42 66h16M42 78h16', null, '#2f5a25', 1)
        );
      },
      kitsune: function () {
        return (
          p('M22 44Q20 10 50 10 80 10 78 44L82 96 62 94 66 56H34L38 94 18 96z', '#1d1d2b', N, 1.2) +
          espejo(p('M26 38L18 2 44 24z', B, N, 1.4) + p('M27 30L22 10 38 23z', '#c0392b')) +
          p('M24 44Q24 18 50 18 76 18 76 44 74 62 60 74L50 94 40 74Q26 62 24 44z', B, N, 1.6) +
          espejo(
            p('M30 48Q38 42 46 50 38 54 30 48z', N) +
              p('M28 45Q36 35 48 45', null, '#c0392b', 2.2) +
              p('M32 62l8 4M34 68l6 2', null, '#c0392b', 1.6),
          ) +
          p('M50 24q-6 8 0 14 6-6 0-14z', '#c0392b') +
          '<ellipse cx="50" cy="88" rx="4" ry="3" fill="' +
          N +
          '"/>'
        );
      },
      oni: function () {
        return (
          p(
            'M14 60Q6 20 50 8 94 20 86 60L80 40 72 52 66 32 58 46 50 28 42 46 34 32 28 52 20 40z',
            '#efe6d2',
            N,
            1.2,
          ) +
          espejo(p('M34 24Q30 4 22-6 36 0 42 18z', '#efe6d2', N, 1.2)) +
          p(
            'M24 42Q24 18 50 18 76 18 76 42 74 66 62 80Q50 90 38 80Q26 66 24 42z',
            '#c0392b',
            N,
            1.6,
          ) +
          espejo(p('M28 40L46 48', null, N, 4) + c(38, 52, 5, '#f2c230', N, 1) + c(38, 52, 2, N)) +
          p('M42 64Q50 58 58 64 56 70 50 70 44 70 42 64z', '#a02a1f', N, 1) +
          p('M32 74Q50 92 68 74 50 82 32 74z', N) +
          p('M36 76l2 6 2-5M60 76l-2 6-2-5', B, N, 0.6) +
          espejo(p('M37 80l2-8 3 7z', B, N, 0.6))
        );
      },
      tengu: function () {
        return (
          p('M30 30Q30 6 52 6 66 8 68 28z', '#1d1d2b', N, 1.2) +
          p(
            'M24 42Q24 18 50 18 76 18 76 42 74 66 62 80Q50 90 38 80Q26 66 24 42z',
            '#c0392b',
            N,
            1.6,
          ) +
          p('M26 82Q50 112 74 82 64 90 50 90 36 90 26 82z', B, N, 1) +
          espejo(
            p('M26 40Q36 30 48 40', null, B, 4) +
              p('M32 50Q38 45 45 51 38 54 32 50z', '#f2c230', N, 1) +
              c(38.5, 50.5, 1.8, N),
          ) +
          p('M46 52Q50 50 54 52L56 84Q50 92 44 84z', '#d9432f', N, 1.4) +
          p('M48 60q2 10 0 20', null, '#ff8a70', 1.2)
        );
      },
      reno: function () {
        var cuerna = 'M38 26Q30 10 34-6M34 6Q24 4 18-4M32 14Q22 16 14 10';
        return (
          espejo(
            p(cuerna, null, '#6b4423', 4) + p('M30 44Q14 38 10 46 18 52 30 50z', '#8a5a32', N, 1),
          ) +
          p(
            'M30 40Q30 20 50 20 70 20 70 40 70 56 62 66L58 88Q50 96 42 88L38 66Q30 56 30 40z',
            '#8a5a32',
            N,
            1.6,
          ) +
          p('M38 64Q50 58 62 64L60 86Q50 94 40 86z', '#c49a6a', N, 1) +
          espejo(c(40, 44, 3.6, N) + c(39, 43, 1.2, B)) +
          c(50, 84, 7, '#e53935', N, 1) +
          c(48, 82, 2, '#ff8a80') +
          p('M30 92Q50 104 70 92', null, '#2f8a3a', 6) +
          p('M60 94l6 12', null, '#2f8a3a', 5)
        );
      },
      muneco: function () {
        var bufanda =
          p('M22 86Q50 98 78 86V96Q50 108 22 96z', '#c0392b', N, 1.2) +
          p('M66 94l6 16h8l-4-18z', '#c0392b', N, 1);
        return (
          c(50, 56, 32, B, N, 1.6) +
          espejo(c(39, 48, 3.4, N)) +
          p('M50 56L70 62 50 62z', '#f2862e', N, 1) +
          [
            [36, 70],
            [42, 74],
            [50, 76],
            [58, 74],
            [64, 70],
          ]
            .map(function (q) {
              return c(q[0], q[1], 2, N);
            })
            .join('') +
          bufanda +
          HUMANO.tocado({ tocado: 'chistera', cinta: '#2f8a3a' }) +
          espejo(c(35, 61, 4, 'rgba(230,90,90,.4)'))
        );
      },
      jengibre: function () {
        return (
          c(50, 52, 34, '#b5733a', N, 1.6) +
          '<circle cx="50" cy="52" r="29" fill="none" stroke="#fff" stroke-width="2.4" stroke-dasharray="4 3"/>' +
          espejo(c(40, 46, 3.6, N) + c(39, 45, 1.2, B) + c(34, 60, 4, '#e57373')) +
          p('M38 66Q50 76 62 66', null, B, 2.6) +
          c(50, 16, 5, '#c0392b', N, 1) +
          p('M44 14l-6-6M56 14l6-6', null, '#2f8a3a', 3)
        );
      },
    };
  })();

  // ---------- Dioses y héroes (cabezas en coordenadas locales 0–100) ----------
  var CLARA = '#f3cfb0',
    TOSTADA = '#d9a47a',
    MORENA = '#a8704a',
    OSCURA = '#7a4a2e';
  var DIOSES = {
    zeus: {
      piel: CLARA,
      pelo: '#e9e6df',
      peinado: 'melena',
      barba: 'larga',
      tocado: 'laurel',
      tocadoColor: '#d9a72b',
      ojos: '#2d6f9e',
      mayor: true,
    },
    hera: {
      piel: CLARA,
      pelo: '#5a3520',
      peinado: 'recogido',
      femenino: true,
      tocado: 'corona',
      joya: '#2d7f9e',
      ojos: '#5a3520',
    },
    poseidon: {
      piel: TOSTADA,
      pelo: '#7d8b8f',
      peinado: 'melena',
      barba: 'rizada',
      tocado: 'coronaPuntas',
      ojos: '#2d7f9e',
      mayor: true,
    },
    hades: {
      piel: '#d8d4dc',
      pelo: '#1b1b22',
      peinado: 'melena',
      barba: 'corta',
      tocado: 'corona',
      tocadoColor: '#4a4552',
      joya: '#c0392b',
      ojos: '#8a1c1c',
      cejas: '#1b1b22',
    },
    atenea: {
      piel: TOSTADA,
      pelo: '#2b1d15',
      peinado: 'largo',
      femenino: true,
      tocado: 'casco',
      ojos: '#6b7a3a',
    },
    afrodita: {
      piel: CLARA,
      pelo: '#e3b04b',
      peinado: 'largo',
      femenino: true,
      tocado: 'diadema',
      joya: '#d94a7a',
      ojos: '#3a7ab8',
    },
    artemisa: {
      piel: MORENA,
      pelo: '#1f1611',
      peinado: 'recogido',
      femenino: true,
      tocado: 'diadema',
      tocadoColor: '#c9ced8',
      luna: true,
      ojos: '#3a2a1e',
    },
    hefesto: {
      piel: MORENA,
      pelo: '#2b1d15',
      peinado: 'calvo',
      barba: 'rizada',
      tocado: 'pileo',
      ojos: '#3a2a1e',
      mayor: true,
      cicatriz: true,
    },
    hermes: { piel: TOSTADA, pelo: '#7a4a24', peinado: 'corto', tocado: 'petaso', ojos: '#3a2a1e' },
    apolo: { piel: CLARA, pelo: '#e3b04b', peinado: 'rizado', tocado: 'laurel', ojos: '#3a7ab8' },
    ares: {
      piel: MORENA,
      pelo: '#1f1611',
      peinado: 'corto',
      barba: 'corta',
      tocado: 'casco',
      ojos: '#3a2a1e',
      cicatriz: true,
    },
    dioniso: {
      piel: TOSTADA,
      pelo: '#4a2a3a',
      peinado: 'rizado',
      tocado: 'laurel',
      uvas: true,
      ojos: '#6b2d5c',
    },
    perseo: {
      piel: OSCURA,
      pelo: '#1f1611',
      peinado: 'rizado',
      tocado: 'casco',
      tocadoColor: '#2d6f9e',
      ojos: '#3a2a1e',
    },
    heracles: {
      piel: TOSTADA,
      pelo: '#3a2416',
      peinado: 'rizado',
      barba: 'corta',
      tocado: 'laurel',
      ojos: '#3a2a1e',
    },
    pan: {
      piel: TOSTADA,
      pelo: '#6b4a2a',
      peinado: 'rizado',
      barba: 'perilla',
      cuernos: true,
      ojos: '#6b7a3a',
    },
  };
  var CABEZAS_H = {},
    PIEL_H = {};
  Object.keys(DIOSES).forEach(function (k) {
    CABEZAS_H[k] = function () {
      return HUMANO.cabeza(DIOSES[k]);
    };
    PIEL_H[k] = DIOSES[k].piel;
  });

  function laurel(cx, cy, r, col, desde, hasta, n) {
    var s = '';
    for (var i = 0; i < n; i++) {
      var a = ((desde + ((hasta - desde) * i) / (n - 1)) * Math.PI) / 180,
        x = cx + Math.cos(a) * r,
        y = cy + Math.sin(a) * r;
      s +=
        '<ellipse cx="' +
        f(x) +
        '" cy="' +
        f(y) +
        '" rx="7" ry="3" transform="rotate(' +
        f((a * 180) / Math.PI + 60) +
        ' ' +
        f(x) +
        ' ' +
        f(y) +
        ')"/>';
    }
    return '<g fill="' + (col || VERDE) + '" stroke="' + N + '" stroke-width=".8">' + s + '</g>';
  }

  // ---------- Accesorios de los dioses ----------
  var ACCESORIOS = {
    rayo: function (x, y) {
      return p(
        'M' +
          (x + 6) +
          ' ' +
          (y - 66) +
          'L' +
          (x - 8) +
          ' ' +
          (y - 34) +
          'H' +
          (x + 2) +
          'L' +
          (x - 6) +
          ' ' +
          (y - 4) +
          'L' +
          (x + 12) +
          ' ' +
          (y - 40) +
          'H' +
          (x + 2) +
          'L' +
          (x + 12) +
          ' ' +
          (y - 66) +
          'z',
        ORO,
        N,
        1.4,
      );
    },
    cetro: function (x, y) {
      return (
        halo('M' + x + ' ' + (y + 22) + 'V' + (y - 50), 3) +
        '<circle cx="' +
        x +
        '" cy="' +
        (y - 56) +
        '" r="6" fill="' +
        ORO +
        '" stroke="' +
        N +
        '"/>' +
        p('M' + (x - 6) + ' ' + (y - 46) + 'h12', null, N, 3)
      );
    },
    tridente: function (x, y) {
      return (
        halo('M' + x + ' ' + (y + 22) + 'V' + (y - 44), 3) +
        p(
          'M' +
            (x - 12) +
            ' ' +
            (y - 66) +
            'V' +
            (y - 46) +
            'Q' +
            (x - 12) +
            ' ' +
            (y - 40) +
            ' ' +
            x +
            ' ' +
            (y - 40) +
            'Q' +
            (x + 12) +
            ' ' +
            (y - 40) +
            ' ' +
            (x + 12) +
            ' ' +
            (y - 46) +
            'V' +
            (y - 66) +
            'M' +
            x +
            ' ' +
            (y - 70) +
            'V' +
            (y - 44),
          null,
          ORO,
          3.4,
        ) +
        p(
          'M' +
            (x - 12) +
            ' ' +
            (y - 66) +
            'l-3 6h6zM' +
            (x + 12) +
            ' ' +
            (y - 66) +
            'l-3 6h6zM' +
            x +
            ' ' +
            (y - 72) +
            'l-3 6h6z',
          ORO,
          N,
          0.8,
        )
      );
    },
    bidente: function (x, y) {
      return (
        halo('M' + x + ' ' + (y + 22) + 'V' + (y - 44), 3) +
        p(
          'M' +
            (x - 8) +
            ' ' +
            (y - 64) +
            'V' +
            (y - 46) +
            'Q' +
            (x - 8) +
            ' ' +
            (y - 40) +
            ' ' +
            x +
            ' ' +
            (y - 40) +
            'Q' +
            (x + 8) +
            ' ' +
            (y - 40) +
            ' ' +
            (x + 8) +
            ' ' +
            (y - 46) +
            'V' +
            (y - 64),
          null,
          '#4a4552',
          3.4,
        )
      );
    },
    lanza: function (x, y) {
      return (
        halo('M' + x + ' ' + (y + 24) + 'V' + (y - 56), 2.6) +
        p('M' + x + ' ' + (y - 74) + 'l6 16-6 4-6-4z', BRONCE, N, 1.2)
      );
    },
    escudo: function (x, y) {
      return (
        '<circle cx="' +
        x +
        '" cy="' +
        (y - 22) +
        '" r="20" fill="' +
        BRONCE +
        '" stroke="' +
        N +
        '" stroke-width="1.6"/><circle cx="' +
        x +
        '" cy="' +
        (y - 22) +
        '" r="15" fill="none" stroke="' +
        N +
        '"/>' +
        buho(x, y - 22, 0.5)
      );
    },
    espada: function (x, y) {
      return (
        p(
          'M' +
            x +
            ' ' +
            (y - 64) +
            'Q' +
            (x + 7) +
            ' ' +
            (y - 40) +
            ' ' +
            (x + 3) +
            ' ' +
            (y - 14) +
            'H' +
            (x - 3) +
            'Q' +
            (x - 7) +
            ' ' +
            (y - 40) +
            ' ' +
            x +
            ' ' +
            (y - 64) +
            'z',
          BRONCE,
          N,
          1.2,
        ) + p('M' + (x - 10) + ' ' + (y - 14) + 'h20v4h-20z', N)
      );
    },
    lira: function (x, y) {
      return (
        p(
          'M' +
            (x - 12) +
            ' ' +
            (y - 10) +
            'Q' +
            (x - 18) +
            ' ' +
            (y - 40) +
            ' ' +
            (x - 6) +
            ' ' +
            (y - 56) +
            'M' +
            (x + 12) +
            ' ' +
            (y - 10) +
            'Q' +
            (x + 18) +
            ' ' +
            (y - 40) +
            ' ' +
            (x + 6) +
            ' ' +
            (y - 56),
          null,
          ORO,
          3.4,
        ) +
        p(
          'M' + (x - 14) + ' ' + (y - 46) + 'h28M' + (x - 12) + ' ' + (y - 10) + 'h24',
          null,
          N,
          2,
        ) +
        p(
          'M' +
            (x - 6) +
            ' ' +
            (y - 46) +
            'v36M' +
            x +
            ' ' +
            (y - 46) +
            'v36M' +
            (x + 6) +
            ' ' +
            (y - 46) +
            'v36',
          null,
          N,
          0.7,
        )
      );
    },
    arco: function (x, y) {
      return (
        p(
          'M' +
            (x - 6) +
            ' ' +
            (y - 66) +
            'Q' +
            (x + 22) +
            ' ' +
            (y - 30) +
            ' ' +
            (x - 6) +
            ' ' +
            (y + 8),
          null,
          MADERA,
          3,
        ) + p('M' + (x - 6) + ' ' + (y - 66) + 'V' + (y + 8), null, N, 0.8)
      );
    },
    antorcha: function (x, y) {
      return (
        halo('M' + x + ' ' + (y + 16) + 'V' + (y - 38), 3.4) +
        p('M' + (x - 6) + ' ' + (y - 40) + 'h12l-2 6h-8z', BRONCE, N, 1) +
        p('M' + x + ' ' + (y - 66) + 'q12 14 4 26h-8q-8-12 4-26z', '#f2a51c', '#c0392b', 1.4)
      );
    },
    espejo: function (x, y) {
      return (
        halo('M' + x + ' ' + (y + 8) + 'V' + (y - 18), 3) +
        '<ellipse cx="' +
        x +
        '" cy="' +
        (y - 32) +
        '" rx="12" ry="14" fill="#dfe9f2" stroke="' +
        ORO +
        '" stroke-width="3"/>' +
        p('M' + (x - 5) + ' ' + (y - 38) + 'q3-5 8-5', null, '#fff', 2)
      );
    },
    manzana: function (x, y) {
      return (
        '<circle cx="' +
        x +
        '" cy="' +
        (y - 18) +
        '" r="9" fill="' +
        ORO +
        '" stroke="' +
        N +
        '" stroke-width="1.2"/>' +
        p(
          'M' + x + ' ' + (y - 27) + 'q1-5 4-6M' + x + ' ' + (y - 27) + 'q-6-4-8 0 4 3 8 0',
          '#5f8a3a',
          N,
          0.8,
        )
      );
    },
    granada: function (x, y) {
      return (
        '<circle cx="' +
        x +
        '" cy="' +
        (y - 18) +
        '" r="10" fill="#b0302a" stroke="' +
        N +
        '" stroke-width="1.2"/>' +
        p('M' + (x - 4) + ' ' + (y - 27) + 'l2-5 2 3 2-3 2 5z', '#b0302a', N, 0.8)
      );
    },
    copa: function (x, y) {
      return (
        halo('M' + x + ' ' + (y - 18) + 'V' + (y + 8), 2) +
        p('M' + (x - 8) + ' ' + (y + 9) + 'h16', null, N, 2.4) +
        p('M' + (x - 18) + ' ' + (y - 32) + 'h36q-4 14-18 14-14 0-18-14z', TERRACOTA, N, 1.3) +
        p('M' + (x - 16) + ' ' + (y - 30) + 'h32', null, PURPURA, 2.6) +
        p('M' + (x - 14) + ' ' + (y - 24) + 'h28', null, N, 2)
      );
    },
    racimo: function (x, y) {
      var s = '';
      [
        [0, -20],
        [-5, -27],
        [5, -27],
        [-9, -34],
        [0, -34],
        [9, -34],
        [-5, -41],
        [5, -41],
        [0, -48],
      ].forEach(function (q) {
        s +=
          '<circle cx="' +
          (x + q[0]) +
          '" cy="' +
          (y + q[1]) +
          '" r="4.4" fill="' +
          PURPURA +
          '" stroke="' +
          N +
          '"/>';
      });
      return s + p('M' + x + ' ' + (y - 52) + 'q4-6 10-4-4 6-10 4z', VERDE, N, 0.8);
    },
    pluma: function (x, y) {
      return (
        halo(
          'M' +
            x +
            ' ' +
            (y + 10) +
            'Q' +
            (x - 4) +
            ' ' +
            (y - 30) +
            ' ' +
            (x + 2) +
            ' ' +
            (y - 60),
          1.4,
        ) +
        '<ellipse cx="' +
        (x + 2) +
        '" cy="' +
        (y - 56) +
        '" rx="8" ry="11" fill="#2d7f9e" stroke="' +
        N +
        '"/><ellipse cx="' +
        (x + 2) +
        '" cy="' +
        (y - 55) +
        '" rx="4.5" ry="6" fill="' +
        ORO +
        '"/><ellipse cx="' +
        (x + 2) +
        '" cy="' +
        (y - 54) +
        '" rx="2" ry="3" fill="#1d3a6b"/>'
      );
    },
    caracola: function (x, y) {
      return (
        p(
          'M' +
            (x - 10) +
            ' ' +
            (y - 8) +
            'Q' +
            (x - 16) +
            ' ' +
            (y - 36) +
            ' ' +
            (x + 4) +
            ' ' +
            (y - 46) +
            'Q' +
            (x + 16) +
            ' ' +
            (y - 30) +
            ' ' +
            (x + 8) +
            ' ' +
            (y - 8) +
            'z',
          '#f2d6c2',
          N,
          1.3,
        ) +
        p(
          'M' +
            (x - 8) +
            ' ' +
            (y - 20) +
            'h16M' +
            (x - 6) +
            ' ' +
            (y - 30) +
            'h12M' +
            (x - 2) +
            ' ' +
            (y - 39) +
            'h6',
          null,
          '#c48a6a',
          1.2,
        )
      );
    },
    caduceo: function (x, y) {
      return (
        halo('M' + x + ' ' + (y + 22) + 'V' + (y - 56), 2.4) +
        p(
          'M' +
            (x - 8) +
            ' ' +
            (y - 6) +
            'C' +
            (x + 10) +
            ' ' +
            (y - 16) +
            ' ' +
            (x - 10) +
            ' ' +
            (y - 30) +
            ' ' +
            (x + 8) +
            ' ' +
            (y - 40) +
            'M' +
            (x + 8) +
            ' ' +
            (y - 6) +
            'C' +
            (x - 10) +
            ' ' +
            (y - 16) +
            ' ' +
            (x + 10) +
            ' ' +
            (y - 30) +
            ' ' +
            (x - 8) +
            ' ' +
            (y - 40),
          null,
          VERDE,
          2.4,
        ) +
        p(
          'M' +
            x +
            ' ' +
            (y - 56) +
            'q-14-8-18 0 8 2 18 4zM' +
            x +
            ' ' +
            (y - 56) +
            'q14-8 18 0-8 2-18 4z',
          '#fff',
          N,
          1,
        )
      );
    },
    martillo: function (x, y) {
      return (
        halo('M' + x + ' ' + (y + 16) + 'V' + (y - 44), 3) +
        p('M' + (x - 14) + ' ' + (y - 56) + 'h28v12h-28z', '#55565c', N, 1.2)
      );
    },
    tenazas: function (x, y) {
      return (
        p(
          'M' +
            (x - 3) +
            ' ' +
            (y + 6) +
            'L' +
            (x + 4) +
            ' ' +
            (y - 50) +
            'M' +
            (x + 3) +
            ' ' +
            (y + 6) +
            'L' +
            (x - 4) +
            ' ' +
            (y - 50),
          null,
          '#55565c',
          3,
        ) +
        '<circle cx="' +
        x +
        '" cy="' +
        (y - 20) +
        '" r="2.4" fill="' +
        N +
        '"/>' +
        p('M' + (x - 2) + ' ' + (y - 54) + 'h4v4h-4z', '#f2a51c', '#c0392b', 1)
      );
    },
    flauta: function (x, y) {
      var s = '';
      for (var i = 0; i < 5; i++)
        s +=
          '<rect x="' +
          (x - 12 + i * 5) +
          '" y="' +
          (y - 44 + i * 4) +
          '" width="4.6" height="' +
          (34 - i * 4) +
          '" fill="#d9b26a" stroke="' +
          N +
          '" stroke-width=".8"/>';
      return s + p('M' + (x - 13) + ' ' + (y - 24) + 'h26', null, MADERA, 2.4);
    },
  };

  function buho(x, y, s) {
    return (
      '<g transform="translate(' +
      x +
      ' ' +
      y +
      ') scale(' +
      s +
      ')"><ellipse cx="0" cy="4" rx="14" ry="18" fill="' +
      N +
      '"/>' +
      '<path d="M-14-10l4-10 6 6h8l6-6 4 10z" fill="' +
      N +
      '"/><circle cx="-6" cy="-6" r="5" fill="' +
      ORO +
      '"/><circle cx="6" cy="-6" r="5" fill="' +
      ORO +
      '"/>' +
      '<circle cx="-6" cy="-6" r="2" fill="' +
      N +
      '"/><circle cx="6" cy="-6" r="2" fill="' +
      N +
      '"/><path d="M-2 0h4l-2 4z" fill="' +
      ORO +
      '"/></g>'
    );
  }

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
  // Trajes: toga, vestido, armadura, mandil, piel, casaca, marinero, blusa, chaleco, sirena, plumas.
  var ORO_T = '#d9a72b',
    BRONCE_T = '#c8913a';

  function patronesCuerpo(pre) {
    return (
      '<pattern id="' +
      pre +
      'rayas" width="8" height="8" patternUnits="userSpaceOnUse"><rect width="8" height="8" fill="#fff"/><rect width="8" height="3.6" fill="#2c4a7a"/></pattern>' +
      '<pattern id="' +
      pre +
      'escamas" width="10" height="8" patternUnits="userSpaceOnUse"><rect width="10" height="8" fill="#2a9d8f"/><path d="M0 8a5 5 0 0 1 10 0M-5 4a5 5 0 0 1 10 0M5 4a5 5 0 0 1 10 0" fill="none" stroke="#bfe6df" stroke-width="1"/></pattern>' +
      '<pattern id="' +
      pre +
      'plumas" width="10" height="8" patternUnits="userSpaceOnUse"><rect width="10" height="8" fill="#2f9e44"/><path d="M0 8a5 5 0 0 1 10 0M-5 4a5 5 0 0 1 10 0M5 4a5 5 0 0 1 10 0" fill="none" stroke="#18140f" stroke-width=".8"/></pattern>' +
      '<pattern id="' +
      pre +
      'sarape" width="4" height="24" patternUnits="userSpaceOnUse"><rect width="4" height="4" fill="#c0392b"/><rect y="4" width="4" height="4" fill="#f39c34"/><rect y="8" width="4" height="4" fill="#f2c230"/><rect y="12" width="4" height="4" fill="#1abc9c"/><rect y="16" width="4" height="4" fill="#8e44ad"/><rect y="20" width="4" height="4" fill="#e8487a"/></pattern>' +
      '<pattern id="' +
      pre +
      'floresK" width="16" height="16" patternUnits="userSpaceOnUse"><circle cx="4" cy="4" r="2" fill="#fff" fill-opacity=".8"/><circle cx="12" cy="12" r="2" fill="#f4a7b9"/><circle cx="12" cy="12" r=".8" fill="#f2c230"/></pattern>' +
      '<clipPath id="' +
      pre +
      'mitad"><rect x="0" y="0" width="' +
      W +
      '" height="' +
      MITAD +
      '"/></clipPath>'
    );
  }

  function cuerpo(o, pre, cabeza) {
    var J = o.c1 || N,
      K = o.c2 || ORO_T,
      L = o.lineas || 'rgba(0,0,0,.35)';
    var base = 'M50 168V134Q52 104 82 96L104 90H136L158 96Q188 104 190 134V168z';
    var mangas =
      'M58 118Q44 132 42 144L56 150Q60 138 66 128zM182 118Q196 132 198 144L184 150Q180 138 174 128z';
    var pliegues =
      'M66 140Q74 150 72 168M82 128Q90 148 88 168M174 140Q166 150 168 168M158 128Q150 148 152 168';
    var perlas = [
      [110, 102],
      [114, 108],
      [120, 111],
      [126, 108],
      [130, 102],
    ]
      .map(function (q) {
        return (
          '<circle cx="' +
          q[0] +
          '" cy="' +
          q[1] +
          '" r="2" fill="#f6f2ea" stroke="' +
          N +
          '" stroke-width=".6"/>'
        );
      })
      .join('');
    var botones = [
      [98, 132],
      [98, 148],
      [142, 132],
      [142, 148],
    ]
      .map(function (q) {
        return (
          '<circle cx="' +
          q[0] +
          '" cy="' +
          q[1] +
          '" r="2.6" fill="' +
          ORO_T +
          '" stroke="' +
          N +
          '" stroke-width=".7"/>'
        );
      })
      .join('');
    var t = [];
    switch (o.traje) {
      case 'toga':
        t.push(
          p(base, J, N, 1.5),
          p(mangas, J, N, 1.2),
          p(pliegues, null, L, 1),
          p('M140 94Q170 104 178 124L92 168H64z', K, N, 1.3),
          p('M152 104Q130 132 100 162M166 114Q142 142 116 167', null, L, 1),
          p('M100 92Q120 106 140 92', null, ORO_T, 3),
          '<circle cx="146" cy="104" r="5" fill="' + ORO_T + '" stroke="' + N + '"/>',
        );
        break;
      case 'vestido':
        t.push(
          p(base, J, N, 1.5),
          p(mangas, J, N, 1.2),
          p(pliegues, null, L, 1),
          p('M103 92L120 120 137 92z', o.piel, N, 1),
          p('M100 92L120 124 140 92', null, K, 3),
          perlas,
          p('M86 150H154V158H86z', K, N, 1),
        );
        break;
      case 'armadura':
        t.push(
          p(base, K, N, 1.5),
          p(mangas, K, N, 1.2),
          p('M82 98H158L152 168H88z', o.metal || BRONCE_T, N, 1.4),
          p(
            'M120 102V164M96 118Q108 128 120 120 132 128 144 118M98 140Q120 150 142 140',
            null,
            'rgba(0,0,0,.35)',
            1.2,
          ),
          p('M82 98Q120 112 158 98', null, N, 1.2),
          '<circle cx="120" cy="110" r="3" fill="' + ORO_T + '" stroke="' + N + '"/>',
        );
        break;
      case 'mandil':
        t.push(
          p(base, J, N, 1.5),
          p(mangas, J, N, 1.2),
          p(pliegues, null, L, 1),
          p('M96 100H144L140 168H100z', '#7a4a2a', N, 1.4),
          p('M96 100L84 94M144 100L156 94', null, N, 2.4),
          p('M104 112h32M104 150h32', null, '#4a2a1a', 1.2),
        );
        break;
      case 'piel':
        t.push(
          p(base, '#8a6a4a', N, 1.5),
          p(mangas, '#8a6a4a', N, 1.2),
          p(
            'M64 120l4 8M76 110l3 8M92 104l2 8M148 104l-2 8M164 110l-3 8M176 120l-4 8M70 146l4 8M90 136l3 8M150 136l-3 8M170 146l-4 8M110 120l2 8M130 120l-2 8M120 146v8',
            null,
            '#4a3220',
            1.3,
          ),
          p('M100 92Q120 104 140 92', null, '#4a3220', 2),
        );
        break;
      case 'casaca':
        t.push(
          p(base, J, N, 1.5),
          p(mangas, J, N, 1.2),
          p('M100 92H140L128 168H112z', '#fff', N, 1),
          p('M112 98q8 4 16 0M110 106q10 4 20 0M112 114q8 4 16 0', null, N, 0.8),
          p('M106 120L120 128 134 120 129 168H111z', K, N, 1),
          p(
            'M100 92L80 120 96 124 112 168H104L76 120 92 96zM140 92L160 120 144 124 128 168H136L164 120 148 96z',
            J,
            N,
            1,
          ),
          p('M100 92L80 120 96 124 112 168M140 92L160 120 144 124 128 168', null, ORO_T, 1.6),
          botones,
          p('M42 140l14 6 3-7-13-6zM198 140l-14 6-3-7 13-6z', K, N, 1),
        );
        break;
      case 'marinero':
        t.push(
          p(base, J, N, 1.5),
          p(mangas, 'url(#' + pre + 'rayas)', N, 1.2),
          p('M100 92H140L128 168H112z', 'url(#' + pre + 'rayas)', N, 1),
          p('M100 92L92 168M140 92L148 168', null, L, 1.2),
          p('M104 92L120 114 136 92z', K, N, 1),
          p('M118 112l-6 12 8-4 8 4-6-12z', K, N, 1),
        );
        break;
      case 'blusa':
        t.push(
          p(base, '#f6f2ea', N, 1.5),
          p(mangas, '#f6f2ea', N, 1.2),
          p('M64 118q6 8 2 18M76 108q6 8 2 18M176 118q-6 8-2 18M164 108q-6 8-2 18', null, L, 1),
          p('M98 116H142L136 168H104z', J, N, 1.2),
          p('M110 122l20 10M130 122l-20 10M110 138l20 10M130 138l-20 10', null, K, 1.2),
          p('M100 92Q120 112 140 92', null, N, 1),
          p('M60 128L174 104', null, K, 5),
        );
        break;
      case 'chaleco':
        t.push(
          p(base, '#e8dcc4', N, 1.5),
          p(mangas, '#e8dcc4', N, 1.2),
          p(pliegues, null, L, 1),
          p('M84 98L104 92 112 168H86zM156 98L136 92 128 168H154z', J, N, 1.2),
          p('M102 92L120 108 138 92', null, N, 1),
          p('M84 150H156V160H84z', K, N, 1),
        );
        break;
      case 'sirena':
        t.push(
          p(base, 'url(#' + pre + 'escamas)', N, 1.5),
          p(mangas, o.piel, N, 1.2),
          p('M84 98Q120 90 156 98L154 120Q120 112 86 120z', o.piel, N, 1),
          p('M98 104q10-8 18 2-8 8-18-2zM142 104q-10-8-18 2 8 8 18-2z', '#f2b8a2', N, 1),
          perlas,
        );
        break;
      case 'uniforme':
        t.push(
          p(base, J, N, 1.5),
          p(mangas, J, N, 1.2),
          p(pliegues, null, L, 1),
          p('M98 92L146 168H128L86 102z', K, N, 1),
          p('M100 92Q120 100 140 92L138 101Q120 109 102 101z', K, N, 1),
          p('M60 112h22v6H60zM158 112h22v6h-22z', ORO_T, N, 0.8),
          HUMANO.estrella(150, 120, 6),
        );
        break;
      case 'espacial':
        t.push(
          p(base, '#eef2f6', N, 1.5),
          p(mangas, '#eef2f6', N, 1.2),
          p(pliegues, null, 'rgba(0,0,0,.25)', 1),
          p('M96 94Q120 106 144 94', null, '#9aa4b2', 7),
          p('M106 112h28v22h-28z', '#55565c', N, 1),
          '<circle cx="113" cy="119" r="2.4" fill="#e53935"/><circle cx="120" cy="119" r="2.4" fill="#2ecc71"/><circle cx="127" cy="119" r="2.4" fill="#36c5f0"/>',
          p('M110 127h20', null, '#9aa4b2', 2),
          '<circle cx="74" cy="122" r="7" fill="' + J + '" stroke="' + N + '"/>',
          p('M50 150H190', null, '#9aa4b2', 4),
        );
        break;
      case 'sarape':
        t.push(
          p(base, '#f4efe4', N, 1.5),
          p(mangas, '#f4efe4', N, 1.2),
          p(
            'M50 142V134Q52 104 82 96L104 90H136L158 96Q188 104 190 134V142Q120 122 50 142z',
            'url(#' + pre + 'sarape)',
            N,
            1.2,
          ),
          p(
            'M54 142v6M62 140v6M70 138v6M78 136v6M86 134v6M154 134v6M162 136v6M170 138v6M178 140v6M186 142v6',
            null,
            N,
            1,
          ),
          p('M104 92L120 108 136 92', null, N, 1.2),
        );
        break;
      case 'kimono':
        t.push(
          p(base, J, N, 1.5),
          o.patron ? p(base, 'url(#' + pre + 'floresK)') : '',
          p('M58 112L34 152H60L72 124zM182 112L206 152H180L168 124z', J, N, 1.2),
          p('M100 92L122 146H134L108 92z', K, N, 1),
          p('M140 92L118 146H106L132 92z', K, N, 1),
          p('M104 92L120 128 136 92', null, '#fff', 3),
          p('M70 146H170V166H70z', o.obi || '#c0392b', N, 1.2),
          p('M70 156h100', null, ORO_T, 1.6),
        );
        break;
      case 'yoroi':
        t.push(
          p(base, J, N, 1.5),
          p(mangas, J, N, 1.2),
          p('M60 118h120M58 128h124M56 138h128M54 148h132M52 158h136', null, K, 1.6),
          p('M48 106H84V148H48zM156 106H192V148H156z', J, N, 1.2),
          p('M50 116h32M50 126h32M50 136h32M158 116h32M158 126h32M158 136h32', null, K, 1.4),
          p('M92 98H148V132H92z', J, N, 1.2),
          '<circle cx="120" cy="114" r="7" fill="none" stroke="' + ORO_T + '" stroke-width="2"/>',
        );
        break;
      case 'egipcio':
        t.push(
          p(base, o.c1 || o.piel, N, 1.5),
          p(mangas, o.piel, N, 1.2),
          p('M80 96Q120 152 160 96', null, '#c0392b', 5),
          p('M84 97Q120 142 156 97', null, ORO_T, 5),
          p('M88 98Q120 132 152 98', null, '#2d5f8a', 5),
          p('M92 99Q120 122 148 99', null, ORO_T, 4),
          p('M46 138l14 5M194 138l-14 5', null, ORO_T, 4),
          o.c1 ? p(pliegues, null, L, 1) : '',
          p('M78 160H162V168H78z', ORO_T, N, 1),
        );
        break;
      case 'noel':
        t.push(
          p(base, '#c0392b', N, 1.5),
          p(mangas, '#c0392b', N, 1.2),
          p('M112 92H128V168H112z', '#fff', N, 1),
          p('M88 94Q120 110 152 94V104Q120 120 88 104z', '#fff', N, 1),
          p('M50 150H190V162H50z', N),
          p('M112 148h16v16h-16z', 'none', ORO_T, 2.4),
          p('M42 140l14 6 3-7-13-6zM198 140l-14 6-3-7 13-6z', '#fff', N, 1),
        );
        break;
      case 'capa':
        t.push(
          p(base, J, N, 1.5),
          p(mangas, J, N, 1.2),
          p(pliegues, null, L, 1),
          p('M106 96H134L130 168H110z', K, N, 1),
          '<circle cx="120" cy="98" r="5" fill="' + ORO_T + '" stroke="' + N + '"/>',
        );
        break;
      case 'plumas':
        t.push(
          p(base, 'url(#' + pre + 'plumas)', N, 1.5),
          p(mangas, '#e8481e', N, 1.2),
          p('M100 92H140L130 168H110z', '#f2c230', N, 1),
          p('M104 110h32M106 130h28M108 150h24', null, '#e8481e', 2),
        );
        break;
    }
    var hueso = o.cabeza === 'calavera';
    return (
      t.join('') +
      '<g transform="translate(60 -1) scale(1.2)">' +
      cabeza +
      '</g>' +
      ACCESORIOS[o.acc[0]](50, 144, o.palo) +
      mano(50, 144, o.piel, hueso) +
      ACCESORIOS[o.acc[1]](190, 144, o.palo) +
      mano(190, 144, o.piel, hueso)
    );
  }

  var PERSONAJES = {
    picas: {
      J: { cabeza: 'hermes', traje: 'toga', c1: BLANCO_TOGA, c2: AZUL, acc: ['caduceo', 'lira'] },
      Q: { cabeza: 'atenea', traje: 'armadura', c2: AZUL, acc: ['lanza', 'escudo'] },
      K: {
        cabeza: 'hades',
        traje: 'toga',
        c1: '#2a2630',
        c2: '#6b1f2a',
        lineas: '#8a8494',
        acc: ['bidente', 'granada'],
      },
    },
    corazones: {
      J: { cabeza: 'apolo', traje: 'toga', c1: BLANCO_TOGA, c2: ORO, acc: ['lira', 'antorcha'] },
      Q: {
        cabeza: 'afrodita',
        traje: 'vestido',
        c1: '#f2c4cf',
        c2: ORO,
        acc: ['espejo', 'manzana'],
      },
      K: { cabeza: 'zeus', traje: 'toga', c1: BLANCO_TOGA, c2: PURPURA, acc: ['rayo', 'cetro'] },
    },
    diamantes: {
      J: { cabeza: 'dioniso', traje: 'toga', c1: '#e9dcc4', c2: PURPURA, acc: ['copa', 'racimo'] },
      Q: { cabeza: 'hera', traje: 'vestido', c1: '#3e6e8e', c2: ORO, acc: ['cetro', 'pluma'] },
      K: {
        cabeza: 'poseidon',
        traje: 'toga',
        c1: '#d9e6ea',
        c2: '#2d7f9e',
        acc: ['tridente', 'caracola'],
      },
    },
    treboles: {
      J: { cabeza: 'ares', traje: 'armadura', c2: TERRACOTA, acc: ['espada', 'escudo'] },
      Q: {
        cabeza: 'artemisa',
        traje: 'vestido',
        c1: '#6f8f55',
        c2: ORO,
        acc: ['arco', 'antorcha'],
      },
      K: { cabeza: 'hefesto', traje: 'mandil', c1: '#b8a58a', acc: ['martillo', 'tenazas'] },
    },
  };

  function patrones(pre) {
    return (
      patronesCuerpo(pre) +
      '<pattern id="' +
      pre +
      'meandro" width="12" height="10" patternUnits="userSpaceOnUse"><rect width="12" height="10" fill="' +
      TERRACOTA +
      '"/>' +
      '<path d="M0 9H10V1H3V6H7V4" fill="none" stroke="' +
      N +
      '" stroke-width="1.4"/></pattern>'
    );
  }

  // Fondo: cielo con aureola dorada detrás de la cabeza; arriba, una greca.
  function fondoFigura() {
    var rayos = '';
    for (var i = 0; i < 24; i++) {
      var a = (i * Math.PI) / 12;
      rayos +=
        'M' +
        f(120 + Math.cos(a) * 30) +
        ' ' +
        f(58 + Math.sin(a) * 30) +
        'L' +
        f(120 + Math.cos(a) * 62) +
        ' ' +
        f(58 + Math.sin(a) * 62);
    }
    return (
      '<path d="' +
      rayos +
      '" stroke="#f1e2b0" stroke-width="3"/><circle cx="120" cy="58" r="44" fill="#f6efd6"/>'
    );
  }
  function decoMarco(pre) {
    return (
      '<rect x="34" y="30" width="172" height="10" fill="url(#' +
      pre +
      'meandro)" stroke="' +
      N +
      '" stroke-width=".8"/>'
    );
  }
  function pipFigura(palo) {
    return pip(palo, 56, 54, 28);
  }

  function figura(o, palo, valor, indice) {
    var pre = PREFIJO + ++uid;
    o.palo = palo;
    o.piel = PIEL_H[o.cabeza];
    var fondo = fondoFigura(pre);
    var mitad =
      '<g clip-path="url(#' +
      pre +
      'mitad)">' +
      fondo +
      cuerpo(o, pre, CABEZAS_H[o.cabeza]()) +
      decoMarco(pre) +
      (palo ? pipFigura(palo) : '') +
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
    var corona = laurel(120, 168, 62, VERDE, 100, 250, 9) + laurel(120, 168, 62, VERDE, -70, 80, 9);
    if (palo !== 'picas') return corona + pip(palo, 120, 168, 66);
    return (
      corona +
      pip('picas', 120, 166, 120, false, N) +
      buho(120, 172, 0.9) +
      '<text x="120" y="270" fill="' +
      N +
      '" font-family="' +
      FUENTE +
      '" font-size="12" text-anchor="middle" letter-spacing="5">ΟΛΥΜΠΟΣ</text>'
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
    var o = { cabeza: 'pan', traje: 'piel', acc: ['flauta', 'racimo'] };
    return figura(o, null, 'Comodín', esquinas('JOKER', null, rojo ? ROJO_PIP : N));
  }

  // ---------- Reversos ----------
  var COLORES_REVERSO = {
    azul: '#2d5f8a',
    terracota: '#b5532e',
    negro: '#1b1712',
    verde: '#3f6b3a',
  };

  function svgReverso(nombre, diseno) {
    var c = COLORES_REVERSO[nombre] || nombre || COLORES_REVERSO.azul;
    var id = PREFIJO + 'r' + ++uid,
      defs,
      fondo,
      i;
    var ORO_R = '#d9a72b',
      TINTA = '#1b1712',
      CREMA = '#f4ecd8';
    diseno = DISENOS.indexOf(diseno) >= 0 ? diseno : DISENOS[0];
    var greca =
      '<pattern id="' +
      id +
      'g" width="12" height="10" patternUnits="userSpaceOnUse"><rect width="12" height="10" fill="' +
      c +
      '"/>' +
      '<path d="M0 9H10V1H3V6H7V4" fill="none" stroke="' +
      CREMA +
      '" stroke-width="1.3"/></pattern>';
    var lechuza =
      '<g transform="translate(120 170)"><ellipse cx="0" cy="6" rx="22" ry="28" fill="' +
      TINTA +
      '"/><path d="M-22-14l6-16 10 10h12l10-10 6 16z" fill="' +
      TINTA +
      '"/>' +
      '<circle cx="-9" cy="-8" r="8" fill="' +
      ORO_R +
      '"/><circle cx="9" cy="-8" r="8" fill="' +
      ORO_R +
      '"/><circle cx="-9" cy="-8" r="3.4" fill="' +
      TINTA +
      '"/><circle cx="9" cy="-8" r="3.4" fill="' +
      TINTA +
      '"/>' +
      '<path d="M-3 2h6l-3 6z" fill="' +
      ORO_R +
      '"/><path d="M-12 18q12 8 24 0M-10 26q10 6 20 0" fill="none" stroke="' +
      CREMA +
      '" stroke-width="1.2"/></g>';
    if (diseno === 'meandro') {
      defs = greca;
      fondo =
        '<rect x="12" y="12" width="216" height="312" rx="6" fill="' +
        c +
        '"/>' +
        '<rect x="20" y="20" width="200" height="296" fill="url(#' +
        id +
        'g)"/>' +
        '<rect x="34" y="34" width="172" height="268" fill="' +
        c +
        '" stroke="' +
        CREMA +
        '" stroke-width="1.5"/>' +
        '<circle cx="120" cy="168" r="52" fill="' +
        CREMA +
        '" stroke="' +
        ORO_R +
        '" stroke-width="3"/>' +
        lechuza;
    } else if (diseno === 'anfora') {
      defs =
        '<pattern id="' +
        id +
        '" width="16" height="16" patternUnits="userSpaceOnUse"><rect width="16" height="16" fill="' +
        c +
        '"/><circle cx="8" cy="8" r="1.6" fill="' +
        TINTA +
        '"/></pattern>' +
        greca;
      fondo =
        '<rect x="12" y="12" width="216" height="312" rx="6" fill="url(#' +
        id +
        ')"/>' +
        '<rect x="12" y="12" width="216" height="14" fill="url(#' +
        id +
        'g)"/><rect x="12" y="310" width="216" height="14" fill="url(#' +
        id +
        'g)"/>' +
        '<path d="M104 92h32l-4 14q34 20 30 70-4 44-28 64h-28q-24-20-28-64-4-50 30-70z" fill="' +
        TINTA +
        '"/>' +
        '<path d="M108 106q-24-4-22 22M132 106q24-4 22 22" fill="none" stroke="' +
        TINTA +
        '" stroke-width="5"/>' +
        '<path d="M84 160h72M86 196h68" stroke="' +
        c +
        '" stroke-width="3"/>' +
        '<path d="M100 172l8-8 8 8 8-8 8 8 8-8" fill="none" stroke="' +
        c +
        '" stroke-width="2"/>';
    } else {
      var rama = '';
      for (i = 0; i < 5; i++)
        rama +=
          '<ellipse cx="' +
          (6 + i * 4) +
          '" cy="' +
          (i % 2 ? 6 : 14) +
          '" rx="3.6" ry="1.6" transform="rotate(' +
          (i % 2 ? -30 : 30) +
          ' ' +
          (6 + i * 4) +
          ' ' +
          (i % 2 ? 6 : 14) +
          ')"/>';
      defs =
        '<pattern id="' +
        id +
        '" width="30" height="22" patternUnits="userSpaceOnUse"><rect width="30" height="22" fill="' +
        CREMA +
        '"/>' +
        '<path d="M2 10h26" stroke="' +
        c +
        '" stroke-width=".8"/><g fill="' +
        c +
        '">' +
        rama +
        '</g></pattern>';
      fondo =
        '<rect x="12" y="12" width="216" height="312" rx="6" fill="url(#' +
        id +
        ')" stroke="' +
        c +
        '" stroke-width="2"/>' +
        '<rect x="20" y="20" width="200" height="296" fill="none" stroke="' +
        c +
        '" stroke-width="1"/>' +
        '<circle cx="120" cy="168" r="52" fill="' +
        CREMA +
        '" stroke="' +
        c +
        '" stroke-width="3"/>' +
        lechuza;
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

  global.NaipesMitologia = {
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
