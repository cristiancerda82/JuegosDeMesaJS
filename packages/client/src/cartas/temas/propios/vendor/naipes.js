/*!
 * naipes.js — Baraja francesa (52 cartas + 2 comodines) en SVG puro.
 * Sin dependencias ni imágenes externas. Funciona en DOM (HTML) y en <canvas>.
 *
 *   Naipes.svgCarta('K', 'corazones')      -> string SVG
 *   Naipes.svgReverso('azul')              -> string SVG
 *   Naipes.svgJoker('rojo')                -> string SVG
 *   Naipes.crearMazo({ jokers: true })     -> [{ valor, palo, id }, ...]
 *   Naipes.barajar(mazo)                   -> mazo barajado (Fisher–Yates, in place)
 *   Naipes.elemento(carta, opciones)       -> <div class="naipe"> con animación de giro
 *   Naipes.imagen(svg)                     -> Promise<HTMLImageElement> para ctx.drawImage
 */
(function (global) {
  'use strict';

  var W = 240,
    H = 336;
  var PALOS = ['picas', 'corazones', 'diamantes', 'treboles'];
  var VALORES = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
  var ROJO = '#c8102e',
    NEGRO = '#1a1a2e',
    AZUL = '#1f3a93',
    ORO = '#e2b13c',
    PIEL = '#f3d2b3';
  var FUENTE = "Georgia, 'Times New Roman', serif";
  var uid = 0;

  // Formas de los palos dibujadas en una caja de 100x100.
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

  function girado(contenido) {
    return '<g transform="rotate(180 ' + W / 2 + ' ' + H / 2 + ')">' + contenido + '</g>';
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
      '" rx="14" fill="#fff" stroke="#c9c9c9" stroke-width="2"/>' +
      contenido +
      '</svg>'
    );
  }

  function esquinas(valor, palo) {
    var c =
      '<text x="22" y="42" fill="' +
      color(palo) +
      '" font-family="' +
      FUENTE +
      '" font-size="32" font-weight="700" text-anchor="middle"' +
      (valor === '10' ? ' letter-spacing="-3"' : '') +
      '>' +
      valor +
      '</text>' +
      pip(palo, 22, 60, 20);
    return c + girado(c);
  }

  // Posiciones de los símbolos para 2–10 (columna, fila). Las filas > 168 se dibujan invertidas.
  var X = [75, 120, 165],
    T = 72,
    B = 264,
    M = 168;
  var F4 = [72, 136, 200, 264];
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
      [1, 120],
      [0, M],
      [2, M],
      [0, B],
      [2, B],
    ],
    8: [
      [0, T],
      [2, T],
      [1, 120],
      [0, M],
      [2, M],
      [1, 216],
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
      [1, 104],
      [0, F4[1]],
      [2, F4[1]],
      [0, F4[2]],
      [2, F4[2]],
      [1, 232],
      [0, F4[3]],
      [2, F4[3]],
    ],
  };

  function numerica(valor, palo) {
    return DISPOSICION[valor]
      .map(function (p) {
        return pip(palo, X[p[0]], p[1], 44, p[1] > M);
      })
      .join('');
  }

  function as(palo) {
    var extra =
      palo === 'picas'
        ? '<circle cx="120" cy="168" r="78" fill="none" stroke="' +
          ORO +
          '" stroke-width="3"/>' +
          '<circle cx="120" cy="168" r="70" fill="none" stroke="' +
          NEGRO +
          '" stroke-width="1"/>'
        : '';
    return extra + pip(palo, 120, 168, palo === 'picas' ? 100 : 110);
  }

  // Figura (J, Q, K): se dibuja la mitad superior y se repite girada, como en los naipes clásicos.
  function figura(valor, palo) {
    var rojo = color(palo) === ROJO;
    var tunica = rojo ? ROJO : AZUL,
      acento = rojo ? AZUL : ROJO;
    var pelo = { K: '#6b4423', Q: '#c98a2b', J: '#2b2b2b' }[valor];
    var id = 'nf' + ++uid;
    var mitad = [];

    // Objeto en la mano: espada (K), flor (Q), alabarda (J)
    if (valor === 'K') {
      mitad.push(
        '<path d="M162 168V84" stroke="#9aa3ad" stroke-width="5"/><path d="M162 84l-4 8h8z" fill="#9aa3ad"/>' +
          '<path d="M150 148h24" stroke="' +
          ORO +
          '" stroke-width="5" stroke-linecap="round"/>',
      );
    } else if (valor === 'Q') {
      mitad.push(
        '<path d="M78 168V112" stroke="#3b7d3b" stroke-width="3"/><path d="M78 140q-12-6-14-16 12 2 14 16z" fill="#3b7d3b"/>' +
          [0, 72, 144, 216, 288]
            .map(function (a) {
              return (
                '<circle cx="78" cy="102" r="6" fill="' +
                tunica +
                '" transform="rotate(' +
                a +
                ' 78 108)"/>'
              );
            })
            .join('') +
          '<circle cx="78" cy="108" r="4" fill="' +
          ORO +
          '"/>',
      );
    } else {
      mitad.push(
        '<path d="M164 168V92" stroke="#7a5230" stroke-width="4"/>' +
          pip(palo, 164, 84, 22, false, ORO),
      );
    }

    // Túnica, cuello y adornos
    mitad.push(
      '<path d="M56 168c2-30 22-44 46-48h36c24 4 44 18 46 48z" fill="' +
        tunica +
        '" stroke="#222" stroke-width="1.5"/>',
      '<path d="M90 168c0-20 6-36 12-46M150 168c0-20-6-36-12-46" stroke="' +
        acento +
        '" stroke-width="4" fill="none"/>',
      '<path d="M120 132v36" stroke="' + ORO + '" stroke-width="7"/>',
      '<path d="M100 121q20 22 40 0" stroke="' + ORO + '" stroke-width="6" fill="none"/>',
      pip(palo, 120, 150, 16, false, '#fff'),
      '<rect x="112" y="108" width="16" height="14" fill="' + PIEL + '"/>',
    );

    // Pelo largo (Q) detrás de la cabeza
    if (valor === 'Q')
      mitad.push(
        '<path d="M101 92q-4 26-12 34l16-4q-2-14 2-28zM139 92q4 26 12 34l-16-4q2-14-2-28z" fill="' +
          pelo +
          '"/>',
      );

    // Cabeza
    mitad.push(
      '<circle cx="120" cy="96" r="18" fill="' + PIEL + '" stroke="#222" stroke-width="1.5"/>',
      '<circle cx="113" cy="94" r="2" fill="#222"/><circle cx="127" cy="94" r="2" fill="#222"/>',
      '<path d="M115 104q5 3 10 0" stroke="#8a3b2b" stroke-width="1.6" fill="none"/>',
    );

    if (valor === 'K') {
      mitad.push(
        '<path d="M104 101q16 28 32 0-4 12-16 12t-16-12z" fill="' + pelo + '"/>',
        '<path d="M101 84 98 60l11 10 11-16 11 16 11-10-3 24z" fill="' +
          ORO +
          '" stroke="#222" stroke-width="1.5"/>',
        '<circle cx="120" cy="74" r="3.5" fill="' +
          ROJO +
          '"/><circle cx="108" cy="78" r="2.5" fill="' +
          AZUL +
          '"/><circle cx="132" cy="78" r="2.5" fill="' +
          AZUL +
          '"/>',
      );
    } else if (valor === 'Q') {
      mitad.push(
        '<path d="M103 88q17-18 34 0-6-14-17-14t-17 14z" fill="' + pelo + '"/>',
        '<path d="M104 82l2-14 7 8 7-12 7 12 7-8 2 14z" fill="' +
          ORO +
          '" stroke="#222" stroke-width="1.5"/>',
        '<circle cx="106" cy="68" r="2.5" fill="#fff"/><circle cx="120" cy="64" r="2.5" fill="#fff"/><circle cx="134" cy="68" r="2.5" fill="#fff"/>',
      );
    } else {
      mitad.push(
        '<path d="M103 92q17-12 34 0v-6q-17-10-34 0z" fill="' + pelo + '"/>',
        '<path d="M100 88q0-22 22-22t20 20z" fill="' +
          acento +
          '" stroke="#222" stroke-width="1.5"/>',
        '<path d="M138 74q20-16 28-4-14 0-26 10z" fill="' +
          ORO +
          '" stroke="#222" stroke-width="1"/>',
      );
    }

    var mitadSvg = mitad.join('');
    return (
      '<defs><clipPath id="' +
      id +
      '"><rect x="46" y="46" width="148" height="244" rx="4"/></clipPath></defs>' +
      '<rect x="46" y="46" width="148" height="244" rx="4" fill="#fdf6e3"/>' +
      '<g clip-path="url(#' +
      id +
      ')">' +
      mitadSvg +
      girado(mitadSvg) +
      '</g>' +
      '<path d="M46 168h148" stroke="#222" stroke-width="1" opacity=".35"/>' +
      '<rect x="46" y="46" width="148" height="244" rx="4" fill="none" stroke="' +
      color(palo) +
      '" stroke-width="2"/>' +
      pip(palo, 62, 64, 18) +
      girado(pip(palo, 62, 64, 18))
    );
  }

  function svgCarta(valor, palo) {
    valor = String(valor).toUpperCase();
    if (VALORES.indexOf(valor) < 0 || PALOS.indexOf(palo) < 0)
      throw new Error('Carta no válida: ' + valor + ' de ' + palo);
    var centro =
      valor === 'A'
        ? as(palo)
        : 'JQK'.indexOf(valor) >= 0
          ? figura(valor, palo)
          : numerica(+valor, palo);
    return svg(centro + esquinas(valor, palo), valor + ' de ' + palo);
  }

  var COLORES_REVERSO = { azul: AZUL, rojo: ROJO, verde: '#1e6b45', negro: NEGRO };

  function svgReverso(nombre) {
    var c = COLORES_REVERSO[nombre] || nombre || AZUL;
    var id = 'nr' + ++uid;
    var emblema = PALOS.map(function (p, i) {
      return pip(p, 120 + [0, 18, 0, -18][i], 168 + [-18, 0, 18, 0][i], 20, false, '#fff');
    }).join('');
    return svg(
      '<defs><pattern id="' +
        id +
        '" width="16" height="16" patternUnits="userSpaceOnUse">' +
        '<path d="M8 0 16 8 8 16 0 8z" fill="none" stroke="#fff" stroke-opacity=".28" stroke-width="1.2"/>' +
        '<circle cx="8" cy="8" r="1.4" fill="#fff" fill-opacity=".35"/></pattern></defs>' +
        '<rect x="12" y="12" width="216" height="312" rx="8" fill="' +
        c +
        '"/>' +
        '<rect x="12" y="12" width="216" height="312" rx="8" fill="url(#' +
        id +
        ')"/>' +
        '<rect x="20" y="20" width="200" height="296" rx="5" fill="none" stroke="#fff" stroke-opacity=".7" stroke-width="2"/>' +
        '<circle cx="120" cy="168" r="44" fill="' +
        c +
        '" stroke="#fff" stroke-width="3"/>' +
        '<circle cx="120" cy="168" r="38" fill="none" stroke="' +
        ORO +
        '" stroke-width="2"/>' +
        emblema,
      'Reverso',
    );
  }

  function svgJoker(variante) {
    var c = variante === 'negro' ? NEGRO : ROJO;
    var letras = 'JOKER'
      .split('')
      .map(function (l, i) {
        return (
          '<text x="22" y="' +
          (34 + i * 20) +
          '" fill="' +
          c +
          '" font-family="' +
          FUENTE +
          '" font-size="18" font-weight="700" text-anchor="middle">' +
          l +
          '</text>'
        );
      })
      .join('');
    var estrella =
      '<path d="M22 140l4 9 10 1-7.5 6.5 2.5 9.5-9-5-9 5 2.5-9.5L8 150l10-1z" fill="' + c + '"/>';
    return svg(
      letras +
        estrella +
        girado(letras + estrella) +
        '<path d="M72 196q-6-56-34-74 44 6 58 74zM100 196q4-76 20-98 16 22 20 98zM168 196q6-56 34-74-44 6-58 74z" fill="' +
        c +
        '" stroke="#222" stroke-width="1.5"/>' +
        '<path d="M96 196q-4-60 4-92M144 196q4-60-4-92" fill="none" stroke="' +
        ORO +
        '" stroke-width="2"/>' +
        '<circle cx="38" cy="122" r="9" fill="' +
        ORO +
        '" stroke="#222" stroke-width="1.5"/>' +
        '<circle cx="120" cy="96" r="9" fill="' +
        ORO +
        '" stroke="#222" stroke-width="1.5"/>' +
        '<circle cx="202" cy="122" r="9" fill="' +
        ORO +
        '" stroke="#222" stroke-width="1.5"/>' +
        '<rect x="66" y="194" width="108" height="18" rx="4" fill="' +
        ORO +
        '" stroke="#222" stroke-width="1.5"/>' +
        [80, 100, 120, 140, 160]
          .map(function (x) {
            return '<circle cx="' + x + '" cy="203" r="3" fill="' + c + '"/>';
          })
          .join('') +
        '<text x="120" y="256" fill="' +
        c +
        '" font-family="' +
        FUENTE +
        '" font-size="30" font-weight="700" text-anchor="middle" letter-spacing="5">JOKER</text>',
      'Comodín ' + variante,
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

  // opciones: { bocaAbajo: bool, reverso: 'azul'|'rojo'|'verde'|'negro'|'#hex', girable: bool }
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

  global.Naipes = {
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
