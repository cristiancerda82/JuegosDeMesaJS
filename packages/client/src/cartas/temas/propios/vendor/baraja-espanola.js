/*!
 * baraja-espanola.js — Baraja española (40 o 48 cartas + 2 comodines) en SVG puro.
 * Sin dependencias ni imágenes externas. Funciona en DOM (HTML) y en <canvas>.
 *
 *   BarajaEspanola.svgCarta(12, 'oros')                 -> string SVG (10 = Sota, 11 = Caballo, 12 = Rey)
 *   BarajaEspanola.svgReverso('rojo')                    -> string SVG
 *   BarajaEspanola.svgComodin('azul')                    -> string SVG
 *   BarajaEspanola.crearMazo({ cartas: 40, comodines })  -> [{ numero, palo, id }, ...]  (cartas: 40 | 48)
 *   BarajaEspanola.barajar(mazo)                         -> mazo barajado (Fisher–Yates, in place)
 *   BarajaEspanola.elemento(carta, opciones)             -> <div class="naipe"> con animación de giro
 *   BarajaEspanola.imagen(svg)                           -> Promise<HTMLImageElement> para ctx.drawImage
 */
(function (global) {
  'use strict';

  var W = 240,
    H = 336;
  var PALOS = ['oros', 'copas', 'espadas', 'bastos'];
  var NUMEROS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
  var NOMBRES = { 1: 'As', 10: 'Sota', 11: 'Caballo', 12: 'Rey' };
  var ROJO = '#c8102e',
    AZUL = '#1f5aa6',
    VERDE = '#2e7d32',
    ORO = '#f2c230',
    ORO_OSC = '#8a5a00',
    PIEL = '#f3d2b3';
  var FUENTE = "Georgia, 'Times New Roman', serif";
  var uid = 0;

  // Color de los números y de la "pinta" (marco) de cada palo.
  var COLOR = { oros: '#b07800', copas: ROJO, espadas: AZUL, bastos: VERDE };
  // Colores de vestimenta de las figuras: [principal, acento]
  var ROPA = {
    oros: [ROJO, AZUL],
    copas: [AZUL, ROJO],
    espadas: [ROJO, VERDE],
    bastos: [VERDE, ROJO],
  };

  // Símbolos de los palos dibujados en una caja de 100x100.
  var FORMAS = {
    oros:
      '<circle cx="50" cy="50" r="46" fill="' +
      ORO +
      '" stroke="' +
      ORO_OSC +
      '" stroke-width="3"/>' +
      '<circle cx="50" cy="50" r="40" fill="none" stroke="' +
      ROJO +
      '" stroke-width="3" stroke-dasharray="4 4"/>' +
      '<circle cx="50" cy="50" r="34" fill="none" stroke="' +
      ORO_OSC +
      '" stroke-width="2"/>' +
      '<path d="M50 24l8 26-8 26-8-26zM24 50l26-8 26 8-26 8z" fill="' +
      ROJO +
      '"/>' +
      '<circle cx="50" cy="50" r="6" fill="' +
      ORO +
      '" stroke="' +
      ORO_OSC +
      '" stroke-width="2"/>',
    copas:
      '<path d="M18 8h64c0 26-10 40-26 46v12c10 2 18 8 18 18v8H26v-8c0-10 8-16 18-18V54C28 48 18 34 18 8z" fill="' +
      ORO +
      '" stroke="' +
      ORO_OSC +
      '" stroke-width="3"/>' +
      '<ellipse cx="50" cy="9" rx="32" ry="5" fill="' +
      ROJO +
      '" stroke="' +
      ORO_OSC +
      '" stroke-width="2"/>' +
      '<path d="M21 26h58" stroke="' +
      ROJO +
      '" stroke-width="5"/>' +
      '<circle cx="50" cy="40" r="5" fill="' +
      AZUL +
      '"/>' +
      '<path d="M43 62h14M30 84h40" stroke="' +
      ROJO +
      '" stroke-width="4"/>',
    espadas:
      '<path d="M50 2l7 12v52H43V14z" fill="#b9cde4" stroke="#1f3a6b" stroke-width="2.5"/>' +
      '<path d="M50 12v52" stroke="#1f3a6b" stroke-width="1.5"/>' +
      '<path d="M24 66q26 8 52 0v8q-26 8-52 0z" fill="' +
      ORO +
      '" stroke="' +
      ORO_OSC +
      '" stroke-width="2"/>' +
      '<rect x="45" y="78" width="10" height="12" fill="' +
      ROJO +
      '" stroke="#7a0a1c" stroke-width="2"/>' +
      '<circle cx="50" cy="93" r="6" fill="' +
      ORO +
      '" stroke="' +
      ORO_OSC +
      '" stroke-width="2"/>',
    bastos:
      '<path d="M36 6q14-8 28 0 4 12-2 24 6 6-2 12l-4 48q-6 8-12 0l-4-48q-8-6-2-12-6-12-2-24z" fill="#5f9a3a" stroke="#244a17" stroke-width="2.5"/>' +
      '<path d="M44 16q4 4 0 8M56 28q-4 4 0 8M46 56q4 3 0 6M54 70q-3 3 0 6" stroke="#244a17" stroke-width="2" fill="none"/>' +
      '<path d="M61 14q12-7 17 2-9 5-17-2z" fill="#8fd05a" stroke="#244a17" stroke-width="1.5"/>',
  };

  // Espadas y bastos son estrechos: se dibujan más altos para que ocupen lo mismo que oros y copas.
  function escala(palo) {
    return palo === 'espadas' || palo === 'bastos' ? 1.3 : 1;
  }

  function pip(palo, cx, cy, s, giro) {
    s *= escala(palo);
    return (
      '<g transform="translate(' +
      cx +
      ' ' +
      cy +
      ')' +
      (giro ? ' rotate(' + giro + ')' : '') +
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

  function svg(contenido, etiqueta) {
    return (
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ' +
      W +
      ' ' +
      H +
      '" role="img" aria-label="' +
      etiqueta +
      '">' +
      '<rect x="1" y="1" width="' +
      (W - 2) +
      '" height="' +
      (H - 2) +
      '" rx="14" fill="#fffdf7" stroke="#c9c9c9" stroke-width="2"/>' +
      contenido +
      '</svg>'
    );
  }

  // La "pinta": marco cuyos bordes superior e inferior se cortan 0 (oros), 1 (copas), 2 (espadas) o 3 (bastos) veces.
  var MX = 34,
    MY = 34,
    MW = W - 2 * MX,
    MH = H - 2 * MY;
  function pinta(palo) {
    var n = PALOS.indexOf(palo),
      hueco = 10,
      xs = [MX];
    for (var i = 1; i <= n; i++) {
      var c = MX + (MW * i) / (n + 1);
      xs.push(c - hueco / 2, c + hueco / 2);
    }
    xs.push(MX + MW);
    var d = 'M' + MX + ' ' + MY + 'V' + (MY + MH) + 'M' + (MX + MW) + ' ' + MY + 'V' + (MY + MH);
    for (var j = 0; j < xs.length; j += 2) {
      d +=
        'M' + xs[j] + ' ' + MY + 'H' + xs[j + 1] + 'M' + xs[j] + ' ' + (MY + MH) + 'H' + xs[j + 1];
    }
    return (
      '<path d="' +
      d +
      '" stroke="' +
      COLOR[palo] +
      '" stroke-width="2.5" fill="none" stroke-linecap="square"/>'
    );
  }

  function indices(numero, palo) {
    var t = function (x, y) {
      return (
        '<text x="' +
        x +
        '" y="' +
        y +
        '" fill="' +
        COLOR[palo] +
        '" font-family="' +
        FUENTE +
        '" font-size="24" font-weight="700" text-anchor="middle"' +
        (numero > 9 ? ' letter-spacing="-2"' : '') +
        '>' +
        numero +
        '</text>'
      );
    };
    return t(18, 30) + t(W - 18, H - 12);
  }

  // Disposición de los símbolos [x, y, tamaño]
  var C2 = [84, 156],
    C3 = [72, 120, 168],
    F3 = [84, 168, 252];
  var DISPOSICION = {
    2: [
      [120, 106, 64],
      [120, 230, 64],
    ],
    3: [
      [120, F3[0], 60],
      [120, F3[1], 60],
      [120, F3[2], 60],
    ],
    4: [
      [C2[0], 106, 58],
      [C2[1], 106, 58],
      [C2[0], 230, 58],
      [C2[1], 230, 58],
    ],
    5: [
      [C2[0], F3[0], 54],
      [C2[1], F3[0], 54],
      [120, 168, 54],
      [C2[0], F3[2], 54],
      [C2[1], F3[2], 54],
    ],
    6: [
      [C2[0], F3[0], 54],
      [C2[1], F3[0], 54],
      [C2[0], F3[1], 54],
      [C2[1], F3[1], 54],
      [C2[0], F3[2], 54],
      [C2[1], F3[2], 54],
    ],
    7: [
      [C2[0], F3[0], 50],
      [C2[1], F3[0], 50],
      [120, 126, 50],
      [C2[0], F3[1], 50],
      [C2[1], F3[1], 50],
      [C2[0], F3[2], 50],
      [C2[1], F3[2], 50],
    ],
    8: [
      [C2[0], F3[0], 48],
      [C2[1], F3[0], 48],
      [120, 126, 48],
      [C2[0], F3[1], 48],
      [C2[1], F3[1], 48],
      [120, 210, 48],
      [C2[0], F3[2], 48],
      [C2[1], F3[2], 48],
    ],
    9: [0, 1, 2].reduce(function (a, f) {
      return a.concat(
        C3.map(function (x) {
          return [x, F3[f], 44];
        }),
      );
    }, []),
  };

  function numerica(numero, palo) {
    return DISPOSICION[numero]
      .map(function (p) {
        return pip(palo, p[0], p[1], p[2]);
      })
      .join('');
  }

  function as(palo) {
    var adorno =
      palo === 'oros'
        ? '<circle cx="120" cy="168" r="74" fill="none" stroke="' +
          ROJO +
          '" stroke-width="2"/>' +
          '<circle cx="120" cy="168" r="80" fill="none" stroke="' +
          ORO_OSC +
          '" stroke-width="1.5" stroke-dasharray="2 5"/>'
        : '';
    return adorno + pip(palo, 120, 168, palo === 'oros' ? 130 : 150);
  }

  function cara(cx, cy, r) {
    return (
      '<circle cx="' +
      cx +
      '" cy="' +
      cy +
      '" r="' +
      r +
      '" fill="' +
      PIEL +
      '" stroke="#222" stroke-width="1.5"/>' +
      '<circle cx="' +
      (cx - r * 0.38) +
      '" cy="' +
      (cy - 2) +
      '" r="1.8" fill="#222"/><circle cx="' +
      (cx + r * 0.38) +
      '" cy="' +
      (cy - 2) +
      '" r="1.8" fill="#222"/>' +
      '<path d="M' +
      (cx - 4) +
      ' ' +
      (cy + r * 0.45) +
      'q4 3 8 0" stroke="#8a3b2b" stroke-width="1.6" fill="none"/>'
    );
  }

  function brazo(x1, y1, x2, y2, c) {
    return (
      '<path d="M' +
      x1 +
      ' ' +
      y1 +
      'L' +
      x2 +
      ' ' +
      y2 +
      '" stroke="' +
      c +
      '" stroke-width="12" stroke-linecap="round"/>' +
      '<circle cx="' +
      x2 +
      '" cy="' +
      y2 +
      '" r="6" fill="' +
      PIEL +
      '" stroke="#222" stroke-width="1"/>'
    );
  }

  // Símbolo que sostiene la figura: espadas y bastos en vertical y grandes; oros y copas en la mano.
  function objeto(palo, x, y, grande) {
    var largo = palo === 'espadas' || palo === 'bastos';
    return largo
      ? pip(palo, x, y - (grande ? 28 : 22), grande ? 96 : 78)
      : pip(palo, x, y + 26, grande ? 50 : 44);
  }

  function rey(palo) {
    var p = ROPA[palo][0],
      a = ROPA[palo][1];
    var largo = palo === 'espadas' || palo === 'bastos';
    return [
      '<path d="M90 130q-30 70-24 160h20l6-140zM150 130q30 70 24 160h-20l-6-140z" fill="' +
        a +
        '" stroke="#222" stroke-width="1.5"/>',
      '<ellipse cx="106" cy="292" rx="11" ry="5" fill="#3a2a1a"/><ellipse cx="134" cy="292" rx="11" ry="5" fill="#3a2a1a"/>',
      '<path d="M92 130h56l10 158H82z" fill="' + p + '" stroke="#222" stroke-width="1.5"/>',
      '<path d="M120 140v146M84 282h72" stroke="' + ORO + '" stroke-width="6"/>',
      '<rect x="88" y="192" width="64" height="8" fill="' +
        ORO +
        '" stroke="' +
        ORO_OSC +
        '" stroke-width="1"/>',
      '<path d="M96 128q24 18 48 0" stroke="#fff" stroke-width="8" fill="none" stroke-linecap="round"/>',
      '<path d="M96 128q24 18 48 0" stroke="#222" stroke-width="2" stroke-dasharray="1 7" fill="none"/>',
      largo ? objeto(palo, 168, 180, true) : '',
      brazo(146, 136, 166, 182, p),
      brazo(94, 136, 84, 186, p),
      largo ? '' : objeto(palo, 168, 180, true),
      cara(120, 104, 18),
      '<path d="M103 108q17 32 34 0-6 14-17 14t-17-14z" fill="#e6e6e6" stroke="#999" stroke-width="1"/>',
      '<path d="M102 90 99 64l11 10 10-16 10 16 11-10-3 26z" fill="' +
        ORO +
        '" stroke="#222" stroke-width="1.5"/>',
      '<circle cx="120" cy="76" r="3.5" fill="' +
        ROJO +
        '"/><circle cx="109" cy="82" r="2.5" fill="' +
        AZUL +
        '"/><circle cx="131" cy="82" r="2.5" fill="' +
        AZUL +
        '"/>',
    ].join('');
  }

  function sota(palo) {
    var p = ROPA[palo][0],
      a = ROPA[palo][1];
    var largo = palo === 'espadas' || palo === 'bastos';
    return [
      '<rect x="105" y="214" width="11" height="72" fill="' +
        a +
        '" stroke="#222" stroke-width="1"/>',
      '<rect x="124" y="214" width="11" height="72" fill="' +
        a +
        '" stroke="#222" stroke-width="1"/>',
      '<ellipse cx="108" cy="290" rx="11" ry="5" fill="#3a2a1a"/><ellipse cx="132" cy="290" rx="11" ry="5" fill="#3a2a1a"/>',
      '<path d="M94 130h52l8 92H86z" fill="' + p + '" stroke="#222" stroke-width="1.5"/>',
      '<path d="M86 218h68" stroke="' + ORO + '" stroke-width="6"/>',
      '<rect x="90" y="172" width="60" height="7" fill="' +
        ORO +
        '" stroke="' +
        ORO_OSC +
        '" stroke-width="1"/>',
      '<path d="M100 130q20 14 40 0" stroke="#fff" stroke-width="6" fill="none" stroke-linecap="round"/>',
      '<path d="M108 140h24M108 152h24M108 164h24" stroke="' + ORO + '" stroke-width="2"/>',
      largo ? objeto(palo, 166, 182, false) : '',
      brazo(144, 138, 164, 182, p),
      brazo(96, 138, 86, 184, p),
      largo ? '' : objeto(palo, 166, 182, false),
      cara(120, 108, 17),
      '<path d="M104 104q16-14 32 0v-6q-16-12-32 0z" fill="#6b4423"/>',
      '<path d="M100 98q2-20 24-20 22 2 20 20z" fill="' +
        a +
        '" stroke="#222" stroke-width="1.5"/>',
      '<path d="M138 84q22-16 30-2-15 0-28 9z" fill="' + ORO + '" stroke="#222" stroke-width="1"/>',
    ].join('');
  }

  function caballo(palo) {
    var p = ROPA[palo][0],
      a = ROPA[palo][1];
    var crin = '#5a3a1a',
      piel = '#e9dcc4',
      trazo = ' stroke="#333" stroke-width="1.5"';
    var patas = [74, 92, 150, 168]
      .map(function (x) {
        return (
          '<rect x="' +
          x +
          '" y="236" width="10" height="50" fill="' +
          piel +
          '"' +
          trazo +
          '/>' +
          '<rect x="' +
          (x - 1) +
          '" y="282" width="12" height="7" rx="2" fill="#3a2a1a"/>'
        );
      })
      .join('');
    return [
      '<path d="M182 210q26 12 18 58-6-28-22-40z" fill="' + crin + '"/>',
      patas,
      '<ellipse cx="124" cy="222" rx="64" ry="30" fill="' + piel + '"' + trazo + '/>',
      '<path d="M72 216q-18-42-6-66h22q-6 36 14 56z" fill="' + piel + '"' + trazo + '/>',
      '<path d="M66 150q-18 0-28 18-3 9 6 11l28-10q10-10 6-20z" fill="' + piel + '"' + trazo + '/>',
      '<path d="M70 150l2-14 8 12z" fill="' + piel + '"' + trazo + '/>',
      '<path d="M86 150q-6 36 14 56l-8 2q-18-22-12-58z" fill="' + crin + '"/>',
      '<circle cx="60" cy="160" r="2" fill="#222"/>',
      '<path d="M98 194h52l6 46h-64z" fill="' + p + '" stroke="#222" stroke-width="1.5"/>',
      '<path d="M92 236h64" stroke="' + ORO + '" stroke-width="5"/>',
      '<path d="M44 172q40 0 70-14" stroke="#3a2a1a" stroke-width="2" fill="none"/>',
      '<path d="M122 200l-4 50" stroke="' + a + '" stroke-width="13" stroke-linecap="round"/>',
      '<ellipse cx="116" cy="254" rx="10" ry="6" fill="#3a2a1a"/>',
      '<path d="M106 150h30l4 52h-38z" fill="' + a + '" stroke="#222" stroke-width="1.5"/>',
      '<path d="M104 196h36" stroke="' + ORO + '" stroke-width="5"/>',
      brazo(110, 160, 112, 168, a),
      objeto(palo, 168, 108, false),
      brazo(134, 158, 160, 136, a),
      cara(121, 134, 14),
      '<path d="M98 126q23-28 46 0z" fill="' + p + '" stroke="#222" stroke-width="1.5"/>',
      '<path d="M94 126h54" stroke="#222" stroke-width="3" stroke-linecap="round"/>',
    ].join('');
  }

  function figura(numero, palo) {
    var id = 'bef' + ++uid;
    var dibujo = numero === 12 ? rey(palo) : numero === 11 ? caballo(palo) : sota(palo);
    return (
      '<defs><clipPath id="' +
      id +
      '"><rect x="' +
      MX +
      '" y="' +
      MY +
      '" width="' +
      MW +
      '" height="' +
      MH +
      '"/></clipPath></defs>' +
      '<rect x="' +
      MX +
      '" y="' +
      MY +
      '" width="' +
      MW +
      '" height="' +
      MH +
      '" fill="#f8efd9"/>' +
      '<g clip-path="url(#' +
      id +
      ')">' +
      dibujo +
      '</g>'
    );
  }

  function svgCarta(numero, palo) {
    numero = +numero;
    if (NUMEROS.indexOf(numero) < 0 || PALOS.indexOf(palo) < 0)
      throw new Error('Carta no válida: ' + numero + ' de ' + palo);
    var centro =
      numero === 1 ? as(palo) : numero >= 10 ? figura(numero, palo) : numerica(numero, palo);
    return svg(
      centro + pinta(palo) + indices(numero, palo),
      (NOMBRES[numero] || numero) + ' de ' + palo,
    );
  }

  var COLORES_REVERSO = { rojo: ROJO, azul: AZUL, verde: VERDE, negro: '#1a1a2e' };

  function svgReverso(nombre) {
    var c = COLORES_REVERSO[nombre] || nombre || ROJO;
    var id = 'ber' + ++uid;
    var emblema = PALOS.map(function (p, i) {
      return pip(p, 120 + [0, 19, 0, -19][i], 168 + [-19, 0, 19, 0][i], 20);
    }).join('');
    return svg(
      '<defs><pattern id="' +
        id +
        '" width="20" height="20" patternUnits="userSpaceOnUse">' +
        '<circle cx="10" cy="10" r="6" fill="none" stroke="#fff" stroke-opacity=".3" stroke-width="1.2"/>' +
        '<circle cx="0" cy="0" r="2" fill="#fff" fill-opacity=".35"/><circle cx="20" cy="20" r="2" fill="#fff" fill-opacity=".35"/>' +
        '<circle cx="20" cy="0" r="2" fill="#fff" fill-opacity=".35"/><circle cx="0" cy="20" r="2" fill="#fff" fill-opacity=".35"/></pattern></defs>' +
        '<rect x="12" y="12" width="216" height="312" rx="8" fill="' +
        c +
        '"/>' +
        '<rect x="12" y="12" width="216" height="312" rx="8" fill="url(#' +
        id +
        ')"/>' +
        '<rect x="20" y="20" width="200" height="296" rx="5" fill="none" stroke="' +
        ORO +
        '" stroke-width="2"/>' +
        '<rect x="25" y="25" width="190" height="286" rx="3" fill="none" stroke="#fff" stroke-opacity=".6" stroke-width="1"/>' +
        '<circle cx="120" cy="168" r="46" fill="#fffdf7" stroke="' +
        ORO +
        '" stroke-width="4"/>' +
        emblema,
      'Reverso',
    );
  }

  function svgComodin(variante) {
    var c = COLORES_REVERSO[variante] || ROJO;
    return svg(
      '<rect x="' +
        MX +
        '" y="' +
        MY +
        '" width="' +
        MW +
        '" height="' +
        MH +
        '" fill="none" stroke="' +
        c +
        '" stroke-width="2.5"/>' +
        '<path d="M72 196q-6-56-34-74 44 6 58 74zM100 196q4-76 20-98 16 22 20 98zM168 196q6-56 34-74-44 6-58 74z" fill="' +
        c +
        '" stroke="#222" stroke-width="1.5"/>' +
        '<path d="M96 196q-4-60 4-92M144 196q4-60-4-92" fill="none" stroke="' +
        ORO +
        '" stroke-width="2"/>' +
        [
          [38, 122],
          [120, 96],
          [202, 122],
        ]
          .map(function (b) {
            return (
              '<circle cx="' +
              b[0] +
              '" cy="' +
              b[1] +
              '" r="9" fill="' +
              ORO +
              '" stroke="#222" stroke-width="1.5"/>'
            );
          })
          .join('') +
        '<rect x="66" y="194" width="108" height="18" rx="4" fill="' +
        ORO +
        '" stroke="#222" stroke-width="1.5"/>' +
        '<text x="120" y="258" fill="' +
        c +
        '" font-family="' +
        FUENTE +
        '" font-size="26" font-weight="700" text-anchor="middle" letter-spacing="3">COMODÍN</text>' +
        '<text x="18" y="30" fill="' +
        c +
        '" font-family="' +
        FUENTE +
        '" font-size="22" font-weight="700" text-anchor="middle">★</text>' +
        '<text x="' +
        (W - 18) +
        '" y="' +
        (H - 12) +
        '" fill="' +
        c +
        '" font-family="' +
        FUENTE +
        '" font-size="22" font-weight="700" text-anchor="middle">★</text>',
      'Comodín ' + variante,
    );
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
    if (opciones.comodines) {
      mazo.push(
        { numero: 0, palo: 'rojo', id: 'comodin-rojo' },
        { numero: 0, palo: 'azul', id: 'comodin-azul' },
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
    return carta.numero === 0 ? svgComodin(carta.palo) : svgCarta(carta.numero, carta.palo);
  }

  // Mismo CSS que naipes.js: ambas librerías pueden usarse a la vez.
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

  // opciones: { bocaAbajo: bool, reverso: 'rojo'|'azul'|'verde'|'negro'|'#hex', girable: bool }
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

  global.BarajaEspanola = {
    ANCHO: W,
    ALTO: H,
    PALOS: PALOS,
    NUMEROS: NUMEROS,
    NOMBRES: NOMBRES,
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
