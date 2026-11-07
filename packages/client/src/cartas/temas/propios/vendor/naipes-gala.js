/*!
 * naipes-gala.js — Baraja francesa "de gala": animales elegantes en esmoquin, tinta negra con detalles en rojo.
 * Figuras de dos cabezas, SVG puro, sin dependencias ni imágenes externas.
 *
 *   Picas:     J cuervo · Q búho        · K lobo
 *   Corazones: J zorro  · Q cisne       · K león
 *   Diamantes: J gato   · Q pavo real   · K oso
 *   Tréboles:  J carnero · Q cierva     · K ciervo
 *   Comodines: mapache (rojo y negro)
 *
 *   NaipesGala.svgCarta('K', 'corazones') -> string SVG
 *   NaipesGala.svgReverso('negro')         -> string SVG ('negro' | 'rojo' | '#hex')
 *   NaipesGala.svgJoker('rojo')            -> string SVG
 *   NaipesGala.crearMazo({ jokers: true }) -> [{ valor, palo, id }, ...]
 *   NaipesGala.barajar(mazo)               -> mazo barajado (in place)
 *   NaipesGala.elemento(carta, opciones)   -> <div class="naipe"> con animación de giro
 *   NaipesGala.imagen(svg)                 -> Promise<HTMLImageElement> para ctx.drawImage
 */
(function (global) {
  'use strict';

  var W = 240,
    H = 336,
    MITAD = 168;
  var PALOS = ['picas', 'corazones', 'diamantes', 'treboles'];
  var VALORES = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
  var N = '#111',
    B = '#fff',
    R = '#d7192a',
    BORDE = '#9bd3e2';
  var FUENTE = "Didot, 'Bodoni 72', 'Bodoni MT', 'Playfair Display', Georgia, serif";
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
    return palo === 'corazones' || palo === 'diamantes' ? R : N;
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
  // Trazo negro con halo blanco: se lee igual sobre el fondo blanco que sobre la chaqueta negra.
  function halo(d, sw) {
    return p(d, null, B, sw + 3) + p(d, null, N, sw);
  }
  // Copia simétrica respecto al eje vertical x = 50 (coordenadas locales de la cabeza).
  function espejo(c) {
    return c + '<g transform="translate(100 0) scale(-1 1)">' + c + '</g>';
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
      B +
      '" stroke="' +
      BORDE +
      '" stroke-width="3"/>' +
      contenido +
      '</svg>'
    );
  }

  function esquinas(valor, palo, c) {
    c = c || color(palo);
    var t =
      valor === 'JOKER'
        ? valor
            .split('')
            .map(function (l, i) {
              return (
                '<text x="20" y="' +
                (32 + i * 19) +
                '" fill="' +
                c +
                '" font-family="' +
                FUENTE +
                '" font-size="18" text-anchor="middle">' +
                l +
                '</text>'
              );
            })
            .join('')
        : '<text x="20" y="40" fill="' +
          c +
          '" font-family="' +
          FUENTE +
          '" font-size="31" text-anchor="middle"' +
          (valor === '10' ? ' letter-spacing="-3"' : '') +
          '>' +
          valor +
          '</text>' +
          pip(palo, 20, 57, 16);
    return t + girado(t);
  }

  // ---------- Cabezas (coordenadas locales 0–100; la barbilla queda hacia y = 92) ----------

  // Trazos de pelo/pluma en filas dentro de una elipse, evitando un rectángulo central opcional.
  function textura(cx, cy, rx, ry, paso, trazo, col, sw, evitar) {
    var d = '';
    for (var y = cy - ry; y <= cy + ry; y += paso) {
      for (var x = cx - rx + ((y / paso) % 2 ? paso / 2 : 0); x <= cx + rx; x += paso) {
        var k = Math.pow((x - cx) / rx, 2) + Math.pow((y - cy) / ry, 2);
        if (k > 0.82) continue;
        if (evitar && x > evitar[0] && x < evitar[2] && y > evitar[1] && y < evitar[3]) continue;
        d += 'M' + f(x) + ' ' + f(y) + trazo;
      }
    }
    return p(d, null, col, sw || 1);
  }

  // Polígono dentado (melenas, pelajes).
  function dentado(cx, cy, r1, r2, n, giro, irregular) {
    var d = '';
    for (var i = 0; i < n * 2; i++) {
      var r = i % 2 ? r2 : r1 * (irregular ? 1 - ((i * 37) % 9) / 60 : 1);
      var a = (giro || 0) + (i * Math.PI) / n;
      d += (i ? 'L' : 'M') + f(cx + Math.cos(a) * r) + ' ' + f(cy + Math.sin(a) * r);
    }
    return d + 'z';
  }

  function radiales(cx, cy, r1, r2, n, col, sw, desde, hasta) {
    var d = '';
    desde = desde || 0;
    hasta = hasta || Math.PI * 2;
    for (var i = 0; i < n; i++) {
      var a = desde + ((hasta - desde) * i) / n,
        b = a + 0.12;
      d +=
        'M' +
        f(cx + Math.cos(a) * r1) +
        ' ' +
        f(cy + Math.sin(a) * r1) +
        'Q' +
        f(cx + (Math.cos(b) * (r1 + r2)) / 2) +
        ' ' +
        f(cy + (Math.sin(b) * (r1 + r2)) / 2) +
        ' ' +
        f(cx + Math.cos(a) * r2) +
        ' ' +
        f(cy + Math.sin(a) * r2);
    }
    return p(d, null, col, sw);
  }

  function ojo(cx, cy, r, glint) {
    return (
      '<circle cx="' +
      cx +
      '" cy="' +
      cy +
      '" r="' +
      r +
      '" fill="' +
      N +
      '"/>' +
      (glint === false
        ? ''
        : '<circle cx="' +
          f(cx - r * 0.35) +
          '" cy="' +
          f(cy - r * 0.35) +
          '" r="' +
          f(r * 0.32) +
          '" fill="' +
          B +
          '"/>')
    );
  }

  function flor(x, y, s) {
    var pet = '';
    for (var i = 0; i < 5; i++) {
      var a = (i * Math.PI * 2) / 5 - Math.PI / 2;
      pet +=
        '<circle cx="' +
        f(x + Math.cos(a) * s * 0.55) +
        '" cy="' +
        f(y + Math.sin(a) * s * 0.55) +
        '" r="' +
        f(s * 0.48) +
        '" fill="' +
        R +
        '" stroke="' +
        N +
        '" stroke-width="1"/>';
    }
    return (
      pet +
      '<circle cx="' +
      x +
      '" cy="' +
      y +
      '" r="' +
      f(s * 0.3) +
      '" fill="' +
      B +
      '" stroke="' +
      N +
      '" stroke-width="1"/>' +
      '<circle cx="' +
      x +
      '" cy="' +
      y +
      '" r="' +
      f(s * 0.12) +
      '" fill="' +
      N +
      '"/>'
    );
  }

  var CABEZAS = {
    cuervo: function () {
      return (
        p('M50 6C76 6 88 28 85 50 82 68 70 80 62 90H38C30 80 18 68 15 50 12 28 24 6 50 6z', N) +
        p('M50 4l-4 -4M50 4l4 -4M44 6l-6 -4M56 6l6 -4', null, N, 2.5) +
        textura(50, 44, 34, 40, 8, 'q4 4 8 0', B, 0.9, [30, 30, 70, 96]) +
        p('M24 34q10-8 22 0M54 34q12-8 22 0', null, B, 1.6) +
        '<circle cx="35" cy="42" r="7.5" fill="' +
        B +
        '"/><circle cx="65" cy="42" r="7.5" fill="' +
        B +
        '"/>' +
        ojo(35, 42, 4) +
        ojo(65, 42, 4) +
        p('M41 50Q50 45 59 50L52.5 90Q50 95 47.5 90z', N, B, 1.6) +
        p('M50 50V88M44 57q6 3 12 0', null, B, 0.8)
      );
    },
    buho: function (reina) {
      var disco = function (cx) {
        return (
          '<circle cx="' +
          cx +
          '" cy="48" r="19" fill="' +
          B +
          '" stroke="' +
          N +
          '" stroke-width="1.5"/>' +
          '<circle cx="' +
          cx +
          '" cy="48" r="15" fill="none" stroke="' +
          N +
          '" stroke-width=".8" stroke-dasharray="2 2"/>' +
          radiales(cx, 48, 10, 18, 22, N, 0.7) +
          '<circle cx="' +
          cx +
          '" cy="48" r="9" fill="' +
          N +
          '"/><circle cx="' +
          cx +
          '" cy="48" r="5.5" fill="' +
          (reina ? R : B) +
          '"/>' +
          ojo(cx, 48, 3.5)
        );
      };
      return (
        p('M20 34L12 2 36 20Q50 14 64 20L88 2 80 34Q96 62 78 84 50 98 22 84 4 62 20 34z', N) +
        p('M16 8l8 14M20 6l6 12M84 8l-8 14M80 6l-6 12', null, B, 1) +
        disco(33) +
        disco(67) +
        p('M16 30L50 42 84 30 82 37 50 50 18 37z', N) +
        p('M24 33l26 9 26-9', null, B, 0.8) +
        p('M44 54h12l-6 18z', B, N, 1.5) +
        p('M30 78l4 4 4-4M40 84l4 4 4-4M52 84l4 4 4-4M62 78l4 4 4-4M46 74l4 4 4-4', null, B, 1.2) +
        (reina ? flor(82, 16, 11) : '')
      );
    },
    lobo: function () {
      return (
        p('M22 44L16 2 40 26Q50 22 60 26L84 2 78 44Q86 66 68 82L58 96H42L32 82Q14 66 22 44z', N) +
        espejo(
          p('M22 12l14 16-10 8z', B) +
            p('M25 18l6 8M23 24l5 6', null, N, 1) +
            p('M22 50l-8 6h10l-8 8 12-2-6 10 12-4-4 10', null, B, 1.4) +
            p('M28 46l14-2-4 6z', B) +
            '<circle cx="36" cy="47" r="2" fill="' +
            N +
            '"/>' +
            p('M28 40l14 2', null, B, 1.8) +
            p('M38 32l3 7M33 34l3 6', null, B, 0.9),
        ) +
        p('M46 28Q50 25 54 28L53 48H47z', B) +
        p('M38 58Q50 50 62 58L60 84Q50 94 40 84z', B, N, 1.5) +
        p('M44 60Q50 56 56 60Q56 66 50 68Q44 66 44 60z', N) +
        p('M50 68V76M42 78Q50 84 58 78', null, N, 1.5) +
        '<circle cx="43" cy="72" r="1" fill="' +
        N +
        '"/><circle cx="57" cy="72" r="1" fill="' +
        N +
        '"/>' +
        '<circle cx="64" cy="47" r="8" fill="none" stroke="' +
        B +
        '" stroke-width="1.6"/>' +
        p('M72 49Q82 68 72 96', null, B, 1.2, ' stroke-dasharray="1.5 2"')
      );
    },
    zorro: function () {
      return (
        p(
          'M16 36L8 2 36 22Q50 18 64 22L92 2 84 36Q96 52 76 70L54 94H46L24 70Q4 52 16 36z',
          R,
          N,
          2,
        ) +
        espejo(
          p('M14 10l16 14-10 8z', N) +
            p('M16 14l4 8M19 12l4 8', null, B, 0.8) +
            p('M12 44Q20 56 36 60Q44 72 48 92L46 94 24 70Q8 56 12 44z', B, N, 1.2) +
            p('M14 50l6 2-4 4 7 1-3 5 7-1', null, N, 1) +
            p('M29 41Q37 34 45 42 37 45 29 41z', N) +
            '<circle cx="39" cy="40" r="1.2" fill="' +
            B +
            '"/>' +
            p('M30 30l8 4M28 26l10 4', null, N, 1.2) +
            p('M58 80l12-2M58 84l12 2', null, N, 0.8),
        ) +
        p('M50 22V38M45 24l2 10M55 24l-2 10', null, N, 1.4) +
        '<ellipse cx="50" cy="89" rx="5.5" ry="4" fill="' +
        N +
        '"/>'
      );
    },
    cisne: function () {
      var plumas = '';
      for (var i = 0; i < 9; i++)
        plumas += 'M' + (34 + (i % 3) * 7) + ' ' + (92 - i * 6) + 'q4-3 8 0';
      return (
        p(
          'M38 98C24 70 26 38 44 20 56 8 74 14 74 28L91 36 72 40C66 41 60 38 58 33 48 46 50 72 62 98z',
          B,
          N,
          2.5,
        ) +
        p(plumas, null, N, 0.9) +
        p('M60 22Q68 19 73 26 68 33 72 40 64 41 59 34z', N) +
        p('M73 26L91 36 72 40Q69 33 73 26z', R, N, 1.4) +
        '<circle cx="64" cy="28" r="1.8" fill="' +
        B +
        '"/>' +
        p('M44 16l2-10 4 6 4-9 4 9 4-6 2 10z', N) +
        '<circle cx="54" cy="9" r="2" fill="' +
        R +
        '"/>' +
        flor(32, 34, 10)
      );
    },
    leon: function () {
      return (
        p(dentado(50, 50, 51, 38, 26, 0, true), N) +
        radiales(50, 50, 28, 46, 52, B, 0.9) +
        p('M30 30Q50 18 70 30 78 54 68 74 50 92 32 74 22 54 30 30z', B, N, 2) +
        espejo(
          p('M32 38Q40 31 48 40', null, N, 3) +
            p('M34 45Q40 40 46 46 40 48 34 45z', N) +
            '<circle cx="39" cy="44.5" r="1" fill="' +
            B +
            '"/>' +
            p('M33 52q4 6 2 12M36 30q4 2 6 6M38 25q4 2 6 5', null, N, 0.9) +
            '<circle cx="40" cy="68" r="1" fill="' +
            N +
            '"/><circle cx="43" cy="71" r="1" fill="' +
            N +
            '"/><circle cx="38" cy="72" r="1" fill="' +
            N +
            '"/>',
        ) +
        p('M46 41L44 58M54 41L56 58', null, N, 1.2) +
        p('M42 58Q50 54 58 58L54 66Q50 68 46 66z', N) +
        p('M50 66V72M40 74Q50 82 60 74', null, N, 1.6) +
        p('M40 82l4 6 2-4 4 6 2-6 4 4 2-6', null, N, 1.2) +
        p('M44 26q6-4 12 0', null, N, 1)
      );
    },
    gato: function () {
      return (
        p(
          'M18 42L14 6 38 26Q50 22 62 26L86 6 82 42Q90 56 94 60L84 64Q80 78 70 84 50 96 30 84 20 78 16 64L6 60Q10 56 18 42z',
          N,
        ) +
        espejo(
          p('M20 14l12 14-10 6z', null, B, 1.2) +
            p('M22 20l4 6M21 25l4 4', null, B, 0.8) +
            p('M28 50Q38 39 47 50 38 57 28 50z', B) +
            p('M37.5 43Q35 50 37.5 57 40 50 37.5 43z', N) +
            p('M40 69L6 62M40 71L6 71M41 73L9 80', null, B, 0.8) +
            p('M26 40l6 2M27 36l5 3', null, B, 1) +
            p('M14 62l6-2M16 66l6-2', null, B, 0.8),
        ) +
        p('M44 30l2 8M50 28v10M56 30l-2 8', null, B, 1) +
        p('M46 62h8l-4 5z', R, B, 1) +
        p('M50 67v4M44 73q3 3 6-2 3 5 6 2', null, B, 1.4)
      );
    },
    pavo: function () {
      var abanico = '';
      for (var i = 0; i < 11; i++) {
        var a = Math.PI * (1.08 + i * 0.084),
          x = 50 + Math.cos(a) * 46,
          y = 88 + Math.sin(a) * 74;
        var g = (a * 180) / Math.PI + 90;
        abanico +=
          p('M50 88L' + f(x) + ' ' + f(y), null, N, 0.9) +
          p('M50 88L' + f(50 + Math.cos(a) * 30) + ' ' + f(88 + Math.sin(a) * 48), null, N, 2) +
          '<g transform="translate(' +
          f(x) +
          ' ' +
          f(y) +
          ') rotate(' +
          f(g) +
          ')">' +
          '<ellipse rx="6.5" ry="9" fill="' +
          N +
          '"/><ellipse rx="4.5" ry="6.5" fill="' +
          B +
          '"/>' +
          '<ellipse rx="3.2" ry="4.6" fill="' +
          R +
          '"/><ellipse cy="1" rx="1.5" ry="2.2" fill="' +
          N +
          '"/></g>';
      }
      var penacho = '';
      [-14, -7, 0, 7, 14].forEach(function (dx, i) {
        penacho +=
          p('M55 25L' + (55 + dx) + ' 8', null, N, 1) +
          '<circle cx="' +
          (55 + dx) +
          '" cy="7" r="2.6" fill="' +
          (i % 2 ? R : N) +
          '"/>';
      });
      return (
        abanico +
        penacho +
        p('M38 98Q38 66 44 46Q46 28 57 28Q68 30 63 46Q58 64 62 98z', N) +
        textura(50, 70, 12, 26, 6, 'q3 3 6 0', B, 0.8) +
        p('M50 30Q57 25 64 32 57 35 50 30z', B) +
        ojo(57, 31, 2) +
        p('M47 33L37 38 47 39z', B, N, 1.2)
      );
    },
    oso: function () {
      return (
        '<circle cx="22" cy="20" r="13" fill="' +
        N +
        '"/><circle cx="78" cy="20" r="13" fill="' +
        N +
        '"/>' +
        '<circle cx="22" cy="20" r="6" fill="none" stroke="' +
        B +
        '" stroke-width="1.2"/><circle cx="78" cy="20" r="6" fill="none" stroke="' +
        B +
        '" stroke-width="1.2"/>' +
        p(dentado(50, 52, 42, 38, 30, 0, true), N) +
        textura(50, 46, 38, 40, 7, 'l2 4', B, 0.8, [28, 32, 72, 96]) +
        p('M34 54Q50 46 66 54Q70 72 58 80Q50 84 42 80Q30 72 34 54z', B, N, 1.5) +
        p('M42 57Q50 52 58 57Q56 65 50 65Q44 65 42 57z', N) +
        '<ellipse cx="47" cy="57" rx="2.5" ry="1.2" fill="' +
        B +
        '"/>' +
        p('M50 65V71M43 74Q50 78 57 74', null, N, 1.5) +
        espejo(
          p('M26 36L44 44', null, B, 2.4) +
            p('M30 44Q37 40 43 45 37 48 30 44z', B) +
            '<circle cx="37" cy="44.5" r="2" fill="' +
            N +
            '"/>',
        )
      );
    },
    carnero: function () {
      var cuerno = 'M36 24C16 8 0 22 3 40 6 56 26 58 28 44 30 34 18 32 16 40';
      return (
        espejo(
          p(cuerno, null, N, 11) +
            p(cuerno, null, B, 8, ' stroke-dasharray="1.3 3.2"') +
            p(cuerno, null, N, 1.2),
        ) +
        espejo(p('M36 42L22 48 36 50z', N)) +
        p('M36 24Q50 16 64 24L62 72Q60 88 50 93 40 88 38 72z', B, N, 2) +
        [
          [42, 24],
          [50, 19],
          [58, 24],
          [45, 30],
          [55, 30],
          [50, 26],
        ]
          .map(function (c) {
            return (
              '<circle cx="' +
              c[0] +
              '" cy="' +
              c[1] +
              '" r="6" fill="' +
              B +
              '" stroke="' +
              N +
              '" stroke-width="1.4"/>' +
              p('M' + (c[0] - 2) + ' ' + c[1] + 'a2 2 0 1 1 3 2', null, N, 0.8)
            );
          })
          .join('') +
        espejo(
          p('M36 44Q41 40 46 45 41 48 36 44z', N) +
            p('M44 40Q42 60 43 76', null, N, 0.9) +
            p('M44 78q2 4 4 2', null, N, 2),
        ) +
        p('M46 87Q50 89 54 87', null, N, 1.4)
      );
    },
    cierva: function (rey) {
      var cuernas = rey
        ? espejo(
            p('M42 22C34 12 24 8 8 4M30 12L26 0M20 9L12 0M14 6L2 12M36 16L40 4', null, N, 5) +
              p(
                'M42 22C34 12 24 8 8 4M30 12L26 0M20 9L12 0M14 6L2 12M36 16L40 4',
                null,
                B,
                1,
                ' stroke-dasharray="2 3"',
              ),
          )
        : '';
      return (
        cuernas +
        espejo(
          p('M36 34Q12 18 3 30Q12 46 37 44z', B, N, 2) +
            p('M32 36Q16 28 9 31Q16 39 31 41z', N) +
            p('M14 31l4 3M20 30l4 4M26 32l3 3', null, B, 0.8),
        ) +
        p('M36 20Q50 12 64 20Q71 40 62 64Q58 82 50 93 42 82 38 64Q29 40 36 20z', B, N, 2) +
        espejo(
          p('M34 44Q40 37 47 44 40 49 34 44z', N) +
            '<circle cx="39" cy="42.5" r="1.1" fill="' +
            B +
            '"/>' +
            p('M34 43l-3-3M35.5 41l-2-4M38 40l-1-4', null, N, 1) +
            p('M40 52q2 12 6 22M37 30q4-2 8 0', null, N, 0.9),
        ) +
        p('M46 24Q50 20 54 24 52 32 50 36 48 32 46 24z', N) +
        p('M43 84Q50 79 57 84Q55 91 50 91Q45 91 43 84z', N) +
        p('M38 90l-4 6M62 90l4 6M44 93l-2 4M56 93l2 4', null, N, 1.2) +
        (rey ? '' : flor(80, 26, 10))
      );
    },
    mapache: function () {
      return (
        espejo(p('M18 32L14 4 40 20z', N) + p('M21 26l-2-14 12 8z', B)) +
        p(
          'M14 44Q16 16 50 14Q84 16 86 44Q96 60 76 74Q60 90 50 93Q40 90 24 74Q4 60 14 44z',
          B,
          N,
          2,
        ) +
        espejo(p('M12 58l-6 4 8 1-4 5 8-1', null, N, 1) + p('M30 26l3 6M36 22l2 6', null, N, 0.9)) +
        p(
          'M14 46Q30 35 46 46L50 52 54 46Q70 35 86 46 84 61 66 61 56 59 50 67 44 59 34 61 16 61 14 46z',
          N,
        ) +
        espejo('<circle cx="32" cy="50" r="5" fill="' + B + '"/>' + ojo(32, 50, 3)) +
        p('M47 18H53L52 44H48z', N) +
        p('M44 78Q50 73 56 78Q54 85 50 85Q46 85 44 78z', N) +
        p('M50 85v3M45 89q5 3 10 0', null, N, 1.2) +
        espejo(p('M40 80L14 76M40 83L16 86', null, N, 0.7))
      );
    },
  };

  // ---------- Accesorios que sostienen las manos (hx, hy = posición de la mano) ----------
  var ACCESORIOS = {
    baston: function (x, y) {
      return (
        halo('M' + x + ' ' + (y + 24) + 'V' + (y - 50) + 'a8 8 0 0 1 16 0v4', 3.5) +
        '<rect x="' +
        (x - 2.5) +
        '" y="' +
        (y + 20) +
        '" width="5" height="5" fill="' +
        B +
        '" stroke="' +
        N +
        '"/>'
      );
    },
    paraguas: function (x, y) {
      return (
        halo('M' + x + ' ' + (y - 4) + 'V' + (y + 16) + 'a5 5 0 0 1-10 0', 3) +
        p(
          'M' +
            x +
            ' ' +
            (y - 66) +
            'L' +
            (x + 8) +
            ' ' +
            (y - 22) +
            'L' +
            (x + 4) +
            ' ' +
            (y - 6) +
            'H' +
            (x - 4) +
            'L' +
            (x - 8) +
            ' ' +
            (y - 22) +
            'z',
          N,
          B,
          1.4,
        ) +
        p(
          'M' +
            x +
            ' ' +
            (y - 60) +
            'V' +
            (y - 8) +
            'M' +
            (x - 3) +
            ' ' +
            (y - 50) +
            'L' +
            (x - 5) +
            ' ' +
            (y - 12),
          null,
          B,
          0.8,
        ) +
        '<rect x="' +
        (x - 6) +
        '" y="' +
        (y - 30) +
        '" width="12" height="3" fill="' +
        R +
        '"/>'
      );
    },
    copa: function (x, y) {
      return (
        halo('M' + x + ' ' + (y - 18) + 'V' + (y + 8), 1.6) +
        p('M' + (x - 7) + ' ' + (y + 9) + 'h14', null, N, 2) +
        p(
          'M' + (x - 13) + ' ' + (y - 36) + 'H' + (x + 13) + 'L' + x + ' ' + (y - 18) + 'z',
          B,
          N,
          1.5,
        ) +
        p('M' + (x - 9.5) + ' ' + (y - 33) + 'H' + (x + 9.5) + 'L' + x + ' ' + (y - 21) + 'z', R) +
        halo('M' + (x - 4) + ' ' + (y - 40) + 'L' + (x + 6) + ' ' + (y - 28), 1) +
        '<circle cx="' +
        (x + 3) +
        '" cy="' +
        (y - 31) +
        '" r="2.6" fill="' +
        N +
        '" stroke="' +
        B +
        '" stroke-width=".8"/>'
      );
    },
    rosa: function (x, y) {
      return (
        halo(
          'M' + x + ' ' + (y + 10) + 'Q' + (x - 3) + ' ' + (y - 20) + ' ' + x + ' ' + (y - 40),
          2,
        ) +
        p('M' + x + ' ' + (y - 16) + 'q8-7 13-2-6 7-13 2z', N, B, 1) +
        p('M' + x + ' ' + (y - 28) + 'q-8-6-12-1 6 6 12 1z', N, B, 1) +
        '<circle cx="' +
        x +
        '" cy="' +
        (y - 47) +
        '" r="9.5" fill="' +
        R +
        '" stroke="' +
        N +
        '" stroke-width="1.5"/>' +
        p('M' + (x - 3) + ' ' + (y - 47) + 'q3-4 6 0-1 5-6 4-5-3-2-9 6-5 9 1', null, N, 1) +
        p('M' + (x - 8) + ' ' + (y - 40) + 'l4-3 4 3 4-3 4 3', N, B, 0.8)
      );
    },
    ramo: function (x, y) {
      var c = '';
      [
        [0, -34],
        [-9, -29],
        [9, -29],
        [-5, -40],
        [5, -40],
        [-12, -38],
        [12, -38],
        [0, -46],
        [-7, -48],
        [7, -48],
        [0, -24],
      ].forEach(function (o) {
        c +=
          '<circle cx="' +
          (x + o[0]) +
          '" cy="' +
          (y + o[1]) +
          '" r="4.6" fill="' +
          R +
          '" stroke="' +
          N +
          '" stroke-width="1"/>' +
          '<circle cx="' +
          (x + o[0]) +
          '" cy="' +
          (y + o[1]) +
          '" r="1.2" fill="' +
          B +
          '"/>';
      });
      return (
        halo(
          'M' +
            x +
            ' ' +
            (y + 10) +
            'L' +
            x +
            ' ' +
            (y - 22) +
            'M' +
            (x - 4) +
            ' ' +
            (y + 8) +
            'L' +
            (x - 8) +
            ' ' +
            (y - 24) +
            'M' +
            (x + 4) +
            ' ' +
            (y + 8) +
            'L' +
            (x + 8) +
            ' ' +
            (y - 24),
          1.2,
        ) + c
      );
    },
    reloj: function (x, y) {
      var marcas = '';
      for (var i = 0; i < 12; i++) {
        var a = (i * Math.PI) / 6;
        marcas +=
          'M' +
          f(x + Math.cos(a) * 7) +
          ' ' +
          f(y - 30 + Math.sin(a) * 7) +
          'L' +
          f(x + Math.cos(a) * 8.5) +
          ' ' +
          f(y - 30 + Math.sin(a) * 8.5);
      }
      return (
        halo('M' + x + ' ' + (y - 19) + 'Q' + (x + 10) + ' ' + (y - 6) + ' ' + x + ' ' + y, 1.2) +
        '<circle cx="' +
        x +
        '" cy="' +
        (y - 42) +
        '" r="2.5" fill="none" stroke="' +
        N +
        '" stroke-width="1.5"/>' +
        '<circle cx="' +
        x +
        '" cy="' +
        (y - 30) +
        '" r="11" fill="' +
        B +
        '" stroke="' +
        N +
        '" stroke-width="2.2"/>' +
        p(marcas, null, N, 1) +
        p(
          'M' +
            x +
            ' ' +
            (y - 30) +
            'V' +
            (y - 36) +
            'M' +
            x +
            ' ' +
            (y - 30) +
            'L' +
            (x + 4) +
            ' ' +
            (y - 28),
          null,
          R,
          1.3,
        )
      );
    },
    sombrero: function (x, y) {
      return (
        p(
          'M' +
            (x - 16) +
            ' ' +
            (y - 10) +
            'Q' +
            x +
            ' ' +
            (y - 4) +
            ' ' +
            (x + 16) +
            ' ' +
            (y - 10) +
            'L' +
            (x + 14) +
            ' ' +
            (y - 6) +
            'Q' +
            x +
            ' ' +
            y +
            ' ' +
            (x - 14) +
            ' ' +
            (y - 6) +
            'z',
          N,
          B,
          1.2,
        ) +
        p(
          'M' +
            (x - 11) +
            ' ' +
            (y - 9) +
            'L' +
            (x - 12) +
            ' ' +
            (y - 42) +
            'H' +
            (x + 12) +
            'L' +
            (x + 11) +
            ' ' +
            (y - 9) +
            'z',
          N,
          B,
          1.2,
        ) +
        '<rect x="' +
        (x - 11.5) +
        '" y="' +
        (y - 18) +
        '" width="23" height="5" fill="' +
        R +
        '"/>' +
        p('M' + (x - 7) + ' ' + (y - 38) + 'V' + (y - 22), null, B, 0.8)
      );
    },
    boquilla: function (x, y) {
      return (
        halo('M' + x + ' ' + (y + 4) + 'L' + (x + 4) + ' ' + (y - 48), 1.8) +
        p('M' + (x + 4) + ' ' + (y - 48) + 'L' + (x + 5) + ' ' + (y - 60), null, N, 4) +
        p('M' + (x + 4) + ' ' + (y - 48) + 'L' + (x + 5) + ' ' + (y - 59), null, B, 2.6) +
        '<circle cx="' +
        (x + 5) +
        '" cy="' +
        (y - 60) +
        '" r="1.6" fill="' +
        R +
        '"/>' +
        p('M' + (x + 5) + ' ' + (y - 63) + 'q-5-5 0-10 5-5 0-10 -4-4 1-8', null, N, 0.8)
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
        B +
        '" stroke="' +
        N +
        '" stroke-width="1.5"/>' +
        pip(palo, x, y - 26, 12) +
        '</g>'
      );
    },
    monoculo: function (x, y) {
      return (
        halo('M' + x + ' ' + y + 'Q' + (x + 10) + ' ' + (y - 12) + ' ' + x + ' ' + (y - 20), 1) +
        '<circle cx="' +
        x +
        '" cy="' +
        (y - 30) +
        '" r="10" fill="' +
        B +
        '" stroke="' +
        N +
        '" stroke-width="2.4"/>' +
        p('M' + (x - 5) + ' ' + (y - 34) + 'q3-3 7-3', null, N, 1)
      );
    },
  };

  function mano(x, y) {
    return (
      '<rect x="' +
      (x - 6.5) +
      '" y="' +
      (y + 4) +
      '" width="13" height="7" rx="1" fill="' +
      B +
      '" stroke="' +
      N +
      '" stroke-width="1.2"/>' +
      '<ellipse cx="' +
      x +
      '" cy="' +
      y +
      '" rx="8.5" ry="7" fill="' +
      B +
      '" stroke="' +
      N +
      '" stroke-width="1.5"/>' +
      '<ellipse cx="' +
      (x + 6) +
      '" cy="' +
      (y - 4) +
      '" rx="3" ry="3.6" fill="' +
      B +
      '" stroke="' +
      N +
      '" stroke-width="1.2"/>' +
      p('M' + (x - 6) + ' ' + y + 'q6 3 11 0', null, N, 0.8)
    );
  }

  // ---------- Cuerpo en esmoquin (mitad superior; la inferior es la misma girada 180°) ----------
  function cuerpo(o, pre, cabeza) {
    var chaleco = {
      clasica: '',
      rojo: p('M104 108L120 124 136 108 129 168H111z', R, N, 1.2),
      rayas: p('M104 108L120 124 136 108 129 168H111z', 'url(#' + pre + 'rayas)', N, 1.2),
      puntos: p('M104 108L120 124 136 108 129 168H111z', 'url(#' + pre + 'puntos)', N, 1.2),
      palo: p('M104 108L120 124 136 108 129 168H111z', 'url(#' + pre + 'palo)', N, 1.2),
    }[o.camisa];
    var paj = o.pajarita === 'negra' ? N : R;
    var puntosPaj =
      o.pajarita === 'puntos'
        ? [
            [108, 96],
            [109, 103],
            [131, 96],
            [132, 103],
            [104, 100],
            [136, 100],
          ]
            .map(function (c) {
              return '<circle cx="' + c[0] + '" cy="' + c[1] + '" r="1.2" fill="' + B + '"/>';
            })
            .join('')
        : '';
    var izq = o.acc[0],
      der = o.acc[1];
    return [
      // chaqueta y mangas
      p('M50 168V134Q52 104 82 96L104 90H136L158 96Q188 104 190 134V168z', N),
      p(
        'M58 118Q44 132 42 144L56 150Q60 138 66 128zM182 118Q196 132 198 144L184 150Q180 138 174 128z',
        N,
      ),
      p('M66 128Q62 146 64 168M174 128Q178 146 176 168', null, B, 0.8),
      // camisa
      p('M100 92H140L128 168H112z', B),
      chaleco,
      o.camisa === 'clasica' || o.camisa === 'rojo'
        ? [120, 138, 156]
            .map(function (y) {
              return '<circle cx="120" cy="' + y + '" r="2.2" fill="' + N + '"/>';
            })
            .join('')
        : '',
      o.camisa === 'clasica' ? p('M114 112v52M126 112v52', null, N, 0.6) : '',
      // fajín
      p('M111 156H129L128 168H112z', N),
      p('M112 160h16M112 164h16', null, B, 0.6),
      // solapas
      p(
        'M100 92L84 116 96 120 112 168H104L82 118 92 98zM140 92L156 116 144 120 128 168H136L158 118 148 98z',
        N,
      ),
      p('M100 92L84 116 96 120 112 168M140 92L156 116 144 120 128 168', null, B, 1.3),
      // pañuelo y flor en el ojal
      o.panuelo ? p('M146 122l4-9 4 6 4-9 4 12z', R, N, 0.8) + p('M145 122h18', null, B, 1.5) : '',
      o.ojal ? flor(90, 124, 7) : '',
      // cabeza (más grande que la caja local de 100x100)
      '<g transform="translate(60 -1) scale(1.2)">' + cabeza + '</g>',
      // cuello de la camisa y pajarita
      p('M110 90L120 99 130 90 128 86H112z', B, N, 1.2),
      p('M120 100L103 91V109zM120 100L137 91V109z', paj, N, 1.3),
      puntosPaj,
      '<rect x="116" y="95" width="8" height="10" rx="2" fill="' +
        paj +
        '" stroke="' +
        N +
        '" stroke-width="1.3"/>',
      // accesorios y manos
      ACCESORIOS[izq](50, 144, o.palo),
      mano(50, 144),
      ACCESORIOS[der](190, 144, o.palo),
      mano(190, 144),
    ].join('');
  }

  var PERSONAJES = {
    picas: {
      J: { cabeza: 'cuervo', camisa: 'palo', pajarita: 'roja', acc: ['paraguas', 'naipe'] },
      Q: {
        cabeza: 'buho',
        camisa: 'clasica',
        pajarita: 'negra',
        acc: ['copa', 'rosa'],
        ojal: true,
      },
      K: {
        cabeza: 'lobo',
        camisa: 'clasica',
        pajarita: 'puntos',
        acc: ['monoculo', 'reloj'],
        panuelo: true,
      },
    },
    corazones: {
      J: { cabeza: 'zorro', camisa: 'rojo', pajarita: 'negra', acc: ['baston', 'rosa'] },
      Q: {
        cabeza: 'cisne',
        camisa: 'clasica',
        pajarita: 'roja',
        acc: ['ramo', 'copa'],
        ojal: true,
      },
      K: {
        cabeza: 'leon',
        camisa: 'rayas',
        pajarita: 'roja',
        acc: ['sombrero', 'baston'],
        panuelo: true,
      },
    },
    diamantes: {
      J: { cabeza: 'gato', camisa: 'puntos', pajarita: 'roja', acc: ['ramo', 'naipe'] },
      Q: {
        cabeza: 'pavo',
        camisa: 'clasica',
        pajarita: 'negra',
        acc: ['boquilla', 'rosa'],
        ojal: true,
      },
      K: {
        cabeza: 'oso',
        camisa: 'rayas',
        pajarita: 'roja',
        acc: ['sombrero', 'reloj'],
        panuelo: true,
      },
    },
    treboles: {
      J: { cabeza: 'carnero', camisa: 'palo', pajarita: 'roja', acc: ['copa', 'copa'] },
      Q: {
        cabeza: 'cierva',
        camisa: 'clasica',
        pajarita: 'puntos',
        acc: ['reloj', 'ramo'],
        ojal: true,
      },
      K: {
        cabeza: 'ciervo',
        camisa: 'rojo',
        pajarita: 'negra',
        acc: ['baston', 'paraguas'],
        panuelo: true,
      },
    },
  };

  function patrones(pre, palo) {
    return (
      '<pattern id="' +
      pre +
      'rayas" width="5" height="10" patternUnits="userSpaceOnUse"><rect width="5" height="10" fill="' +
      B +
      '"/><path d="M1 0v10" stroke="' +
      N +
      '" stroke-width="1"/></pattern>' +
      '<pattern id="' +
      pre +
      'puntos" width="8" height="8" patternUnits="userSpaceOnUse"><rect width="8" height="8" fill="' +
      B +
      '"/><circle cx="2" cy="2" r="1.4" fill="' +
      R +
      '"/><circle cx="6" cy="6" r="1.4" fill="' +
      R +
      '"/></pattern>' +
      '<pattern id="' +
      pre +
      'palo" width="10" height="10" patternUnits="userSpaceOnUse"><rect width="10" height="10" fill="' +
      B +
      '"/>' +
      pip(palo, 5, 5, 5.5) +
      '</pattern>' +
      '<clipPath id="' +
      pre +
      'mitad"><rect x="0" y="0" width="' +
      W +
      '" height="' +
      MITAD +
      '"/></clipPath>'
    );
  }

  function figura(o, palo, valor, indice) {
    var pre = 'ng' + ++uid;
    o.palo = palo;
    var cabeza =
      o.cabeza === 'ciervo'
        ? CABEZAS.cierva(true)
        : o.cabeza === 'cierva'
          ? CABEZAS.cierva(false)
          : CABEZAS[o.cabeza](valor === 'Q');
    var mitad =
      '<g clip-path="url(#' +
      pre +
      'mitad)">' +
      cuerpo(o, pre, cabeza) +
      (palo ? pip(palo, 56, 52, 30) : '') +
      '</g>';
    return svg(
      '<rect x="34" y="30" width="172" height="276" fill="none" stroke="' +
        N +
        '" stroke-width="1.2"/>' +
        mitad +
        girado(mitad) +
        '<path d="M50 168H190" stroke="' +
        B +
        '" stroke-width=".8"/>' +
        indice,
      valor + (palo ? ' de ' + palo : ''),
      patrones(pre, palo || 'picas'),
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
    if (palo !== 'picas') {
      return (
        '<circle cx="120" cy="168" r="62" fill="none" stroke="' +
        color(palo) +
        '" stroke-width="1"/>' +
        '<circle cx="120" cy="168" r="57" fill="none" stroke="' +
        color(palo) +
        '" stroke-width=".6" stroke-dasharray="1 3"/>' +
        pip(palo, 120, 168, 72)
      );
    }
    // As de picas: pica grande con sombrero de copa, pajarita y bastón.
    return (
      '<circle cx="120" cy="176" r="76" fill="none" stroke="' +
      N +
      '" stroke-width="1"/>' +
      '<circle cx="120" cy="176" r="70" fill="none" stroke="' +
      N +
      '" stroke-width=".6" stroke-dasharray="1 3"/>' +
      pip('picas', 120, 182, 112, false, N) +
      p('M120 162L104 153V171zM120 162L136 153V171z', R, B, 1.4) +
      '<rect x="116" y="157" width="8" height="10" rx="2" fill="' +
      R +
      '" stroke="' +
      B +
      '" stroke-width="1.2"/>' +
      p('M96 104Q120 98 144 104L141 108Q120 103 99 108z', N) +
      p('M104 104L103 64H137L136 104z', N) +
      '<rect x="103.5" y="92" width="33" height="7" fill="' +
      R +
      '"/>' +
      p('M110 70V90', null, B, 1) +
      halo('M176 262V178a9 9 0 0 1 18 0v4', 3.5) +
      '<text x="120" y="292" fill="' +
      N +
      '" font-family="' +
      FUENTE +
      '" font-size="13" text-anchor="middle" letter-spacing="6">GALA</text>'
    );
  }

  function svgCarta(valor, palo) {
    valor = String(valor).toUpperCase();
    if (VALORES.indexOf(valor) < 0 || PALOS.indexOf(palo) < 0)
      throw new Error('Carta no válida: ' + valor + ' de ' + palo);
    if ('JQK'.indexOf(valor) >= 0)
      return figura(Object.assign({}, PERSONAJES[palo][valor]), palo, valor, esquinas(valor, palo));
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
      cabeza: 'mapache',
      camisa: rojo ? 'rojo' : 'rayas',
      pajarita: rojo ? 'puntos' : 'roja',
      acc: ['sombrero', 'naipe'],
      panuelo: true,
    };
    return figura(o, null, 'Comodín', esquinas('JOKER', null, rojo ? R : N));
  }

  // Reverso art déco: abanicos en líneas finas y emblema central con pajarita.
  function svgReverso(nombre) {
    var c = nombre === 'rojo' ? R : nombre && nombre.charAt(0) === '#' ? nombre : N;
    var id = 'ngr' + ++uid;
    var arcos = '';
    for (var r = 4; r <= 16; r += 4)
      arcos += 'M' + (10 - r) + ' 20A' + r + ' ' + r + ' 0 0 1 ' + (10 + r) + ' 20';
    return svg(
      '<rect x="12" y="12" width="216" height="312" rx="6" fill="' +
        c +
        '"/>' +
        '<rect x="12" y="12" width="216" height="312" rx="6" fill="url(#' +
        id +
        ')"/>' +
        '<rect x="20" y="20" width="200" height="296" rx="3" fill="none" stroke="' +
        B +
        '" stroke-width="1.5"/>' +
        '<rect x="25" y="25" width="190" height="286" rx="2" fill="none" stroke="' +
        B +
        '" stroke-width=".6"/>' +
        '<path d="M120 116L168 168 120 220 72 168z" fill="' +
        c +
        '" stroke="' +
        B +
        '" stroke-width="2"/>' +
        '<path d="M120 126L158 168 120 210 82 168z" fill="none" stroke="' +
        B +
        '" stroke-width=".8"/>' +
        p('M120 168L100 157V179zM120 168L140 157V179z', nombre === 'rojo' ? N : R, B, 1.4) +
        '<rect x="115" y="162" width="10" height="12" rx="2" fill="' +
        (nombre === 'rojo' ? N : R) +
        '" stroke="' +
        B +
        '" stroke-width="1.2"/>',
      'Reverso',
      '<pattern id="' +
        id +
        '" width="20" height="20" patternUnits="userSpaceOnUse"><path d="' +
        arcos +
        '" fill="none" stroke="' +
        B +
        '" stroke-opacity=".35" stroke-width=".8"/></pattern>',
    );
  }

  function crearMazo(opciones) {
    var mazo = [];
    PALOS.forEach(function (palo) {
      VALORES.forEach(function (valor) {
        mazo.push({ valor: valor, palo: palo, id: valor + '-' + palo });
      });
    });
    if (opciones && opciones.jokers) {
      mazo.push(
        { valor: 'JOKER', palo: 'rojo', id: 'JOKER-rojo' },
        { valor: 'JOKER', palo: 'negro', id: 'JOKER-negro' },
      );
    }
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

  // opciones: { bocaAbajo: bool, reverso: 'negro'|'rojo'|'#hex', girable: bool }
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

  global.NaipesGala = {
    ANCHO: W,
    ALTO: H,
    PALOS: PALOS,
    VALORES: VALORES,
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
