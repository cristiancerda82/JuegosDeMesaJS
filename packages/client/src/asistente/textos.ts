import type { CodigoComentario, CodigoMotivo, IdCarta } from '@juegos/engine';
import { nombreCarta } from '../cartas/dibujo';
import type { IdJuego } from '../sesion/juegos';

/**
 * Textos del modo asistido (spec modo-asistido). Están aparte de `textos.ts` por su tamaño; se
 * usan como `T.asistente`.
 */

type Datos = Readonly<Record<string, string | number>>;

/** Nombre de las acciones más comunes; las demás se escriben a partir de su tipo. */
const ACCIONES: Readonly<Record<string, string>> = {
  jugar: 'juega',
  pasar: 'pasa',
  paso: 'pasa',
  robar: 'roba',
  robarMazo: 'roba del mazo',
  robarDescarte: 'roba del descarte',
  robarMonton: 'llévate el montón',
  tomarPozo: 'llévate el pozo',
  descartar: 'descarta',
  descarte: 'descarta',
  pujar: 'puja',
  apostar: 'apuesta',
  subir: 'sube',
  igualar: 'iguala',
  retirarse: 'retírate',
  pedir: 'pide carta',
  plantarse: 'plántate',
  doblar: 'dobla',
  separar: 'separa',
  bajar: 'baja tus combinaciones',
  anadir: 'añade a una combinación',
  cerrar: 'cierra',
  cantar: 'canta',
  cantarTute: 'canta el tute',
  cambiarSiete: 'cambia el siete de triunfo',
  cambiarMuestra: 'cambia la muestra',
  cambiar: 'cambia cartas',
  envidar: 'envida',
  envido: 'canta envido',
  realEnvido: 'canta real envido',
  faltaEnvido: 'canta falta envido',
  truco: 'canta truco',
  trucar: 'truca',
  quiero: 'di «quiero»',
  noQuiero: 'di «no quiero»',
  ordago: 'echa un órdago',
  mus: 'pide mus',
  triunfo: 'elige el triunfo',
  elegir: 'elige',
  contrato: 'elige el contrato',
  declarar: 'declara',
  anunciar: 'anuncia',
  aceptar: 'acepta',
  rehusar: 'rehúsa',
  contro: 'di contro',
  redoblar: 'redobla',
  recoger: 'recoge',
  construir: 'construye',
  atacar: 'ataca',
  defender: 'defiéndete',
  tomar: 'toma las cartas',
  coger: 'coge',
  devolver: 'devuelve cartas',
  desconfiar: 'di «¡mentiroso!»',
  creer: 'créete la bajada',
  meVoy: 'vete',
  dar: 'da cartas',
  llamar: 'llama',
  cortar: 'corta el mus',
  desmarcar: 'desmarca',
  go: 'di «go»',
  gin: 'cierra con gin',
  dejar: 'deja una carta en la mesa',
  echar: 'echa a la caja',
  marcar: 'marca',
  vull: 'di «vull»',
  noVull: 'di «no vull»',
  reservar: 'reserva',
  whist: 'di «whist»',
};

/** Acciones que significan otra cosa en un juego concreto. */
const ACCIONES_JUEGO: Partial<Record<IdJuego, Readonly<Record<string, string>>>> = {
  euchre: { pedir: 'pide que el repartidor recoja la carta de arriba' },
  pesca: { pedir: 'pide cartas a otro jugador' },
};

/**
 * Por qué suele convenir cada acción, dicho al jugador: es su mano, así que se puede hablar de
 * ella. Se usan cuando no hay un hecho medido más concreto (o junto a la simulación).
 */
const RAZONES: Readonly<Record<string, string>> = {
  pasar: 'con tu mano no te conviene ir más allá',
  paso: 'con tu mano no te conviene ir más allá',
  robarMazo: 'la carta del descarte no te sirve para ninguna combinación',
  robarDescarte: 'esa carta te sirve para formar una combinación',
  robarMonton: 'las cartas de arriba te sirven para tus combinaciones',
  tomarPozo: 'las cartas de arriba te sirven para tus combinaciones',
  descartar: 'es la carta que menos te sirve para formar combinaciones',
  descarte: 'es la carta que menos te sirve para formar combinaciones',
  pujar: 'tu mano da para cumplir esta puja',
  apostar: 'es lo que tu mano puede cumplir sin arriesgar de más',
  subir: 'tu mano es más fuerte que la de un rival medio',
  igualar: 'tu mano merece ver la jugada, pero no tanto como para subir',
  retirarse: 'tu mano tiene pocas opciones de ganar y así no pierdes más',
  pedir: 'todavía estás lejos y es poco probable que te pases',
  plantarse: 'con lo que tienes, otra carta te arriesga demasiado a pasarte',
  doblar: 'tu jugada es tan buena que vale la pena doblar la apuesta',
  separar: 'dos manos con esas cartas tienen más opciones que una',
  bajar: 'te quitas puntos de la mano antes de que alguien cierre',
  anadir: 'te quitas cartas de la mano sin esperar a formar otra combinación',
  cerrar: 'con lo que te queda, cerrar ahora te da ventaja',
  cantar: 'sumas los puntos del cante',
  cantarTute: 'sumas el tute, que vale la partida',
  cambiarSiete: 'te quedas con la carta de la muestra, que vale más',
  cambiarMuestra: 'te quedas con la carta de la muestra, que vale más',
  cambiar: 'con esas cartas fuera tienes más opciones de mejorar tu mano',
  envidar: 'tu jugada es buena para apostar por ella',
  envido: 'tienes buen tanto',
  realEnvido: 'tienes muy buen tanto',
  faltaEnvido: 'tu tanto es difícil de superar',
  truco: 'tus cartas son altas para ganar las bazas',
  trucar: 'tus cartas son altas para ganar las bazas',
  quiero: 'tus cartas tienen buenas opciones de ganar',
  noQuiero: 'tus cartas tienen pocas opciones y así pierdes poco',
  vull: 'tus cartas tienen buenas opciones de ganar',
  noVull: 'tus cartas tienen pocas opciones y así pierdes poco',
  ordago: 'tu jugada es casi imposible de superar',
  mus: 'cambiando cartas tu mano puede mejorar mucho',
  triunfo: 'es el palo en el que más fuerte estás',
  contrato: 'es el que mejor encaja con tu mano',
  aceptar: 'encaja con tu mano',
  rehusar: 'no encaja con tu mano',
  contro: 'es probable que el contrato no se cumpla',
  redoblar: 'es muy probable que cumplas',
  construir: 'en tu próximo turno podrás recoger esas cartas juntas',
  dejar: 'no puedes recoger ni construir nada que te convenga',
  echar: 'son las cartas que menos te sirven para tu mano',
  tomar: 'defenderte te costaría cartas mejores',
  desconfiar: 'es poco probable que tenga las cartas que dice',
  creer: 'es probable que diga la verdad',
  meVoy: 'con tu mano no te compensa seguir',
  go: 'no puedes jugar sin pasarte de 31',
  gin: 'no te queda ninguna carta suelta',
  whist: 'es probable que el contrato no se cumpla',
  marcar: 'es una de las cartas que te conviene bajar ahora',
  desmarcar: 'te conviene guardarla para más adelante',
  cortar: 'tu mano ya es buena, y así los rivales no pueden mejorar la suya',
  atacar: 'obliga al rival a gastar cartas para defenderse',
  robar: 'cambiar cartas te da opciones de mejorar tu mano',
  recoger: 'sumas cartas y puntos para el recuento',
  reservar: 'tu mano no da para jugar en solitario',
  anunciar: 'tu mano es fuerte y el anuncio suma puntos si ganas',
  elegir: 'es la opción en la que más fuerte estás',
  dar: 'es la carta que menos falta te hace',
  fijar: 'es lo que tu mano puede cumplir',
};

/** Razones que cambian en un juego concreto. */
const RAZONES_JUEGO: Partial<Record<IdJuego, Readonly<Record<string, string>>>> = {
  euchre: { pedir: 'ese triunfo te deja con buenas bazas', pasar: 'ese triunfo no te conviene' },
  pesca: { pedir: 'es probable que tenga cartas de ese número y completes un grupo' },
  corazones: { pasar: 'te quitas una carta peligrosa o difícil de jugar' },
  burro: { pasar: 'no te sirve para juntar cuatro iguales' },
  cinquillo: { jugar: 'abre el paso a tus cartas de ese palo antes que a las de los rivales' },
  sevens: { jugar: 'abre el paso a tus cartas de ese palo antes que a las de los rivales' },
  spiteMalice: { jugar: 'te acerca a vaciar tu montón, que es lo que gana la partida' },
};

/** La razón de una acción por su tipo, si la hay. */
function razonDe(d: Datos, juego?: IdJuego): string | null {
  const { tipo } = tipoYDetalle(d);
  return (juego && RAZONES_JUEGO[juego]?.[tipo]) ?? RAZONES[tipo] ?? null;
}

/** Nombre de la jugada en imperativo; los tipos sin nombre se escriben tal cual («noQuiero» → «no quiero»). */
const palabras = (tipo: string) => tipo.replace(/([a-z])([A-Z])/g, '$1 $2').toLowerCase();

export const nombreAccion = (tipo: string, juego?: IdJuego) =>
  (juego && ACCIONES_JUEGO[juego]?.[tipo]) ?? ACCIONES[tipo] ?? palabras(tipo);

/** En los juegos de dos barajas las cartas llevan su copia («picas-10#1»): no se nombra. */
const carta = (d: Datos) =>
  typeof d['carta'] === 'string' ? nombreCarta(d['carta'].replace(/#\d+$/, '') as IdCarta) : '';
const mayuscula = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);
const puntos = (n: unknown) => `${String(n)} ${Number(n) === 1 ? 'punto' : 'puntos'}`;
const cartas = (n: unknown) => `${String(n)} ${Number(n) === 1 ? 'carta' : 'cartas'}`;

/** «Robar» con el sitio de donde se roba en el detalle. */
const ROBAR_DE: Readonly<Record<string, string>> = {
  mazo: 'robarMazo',
  descarte: 'robarDescarte',
  monton: 'robarMonton',
  pozo: 'tomarPozo',
};
/** Acciones en las que el detalle (la puja, el palo…) dice algo; en las demás suele ser un índice. */
const CON_DETALLE: ReadonlySet<string> = new Set([
  'pujar',
  'apostar',
  'subir',
  'envidar',
  'triunfo',
  'elegir',
  'contrato',
  'cantar',
  'declarar',
  'anunciar',
  'reservar',
]);

/** El tipo de la acción y el detalle que vale la pena nombrar. */
function tipoYDetalle(d: Datos): { tipo: string; detalle: string } {
  let tipo = typeof d['tipo'] === 'string' ? d['tipo'] : 'jugar';
  let detalle = d['detalle'] !== undefined ? String(d['detalle']) : '';
  const desde = ROBAR_DE[detalle];
  if (tipo === 'robar' && desde) {
    tipo = desde;
    detalle = '';
  }
  if (!CON_DETALLE.has(tipo) && /^\d+$/.test(detalle)) detalle = '';
  // Una carta con su copia, que la acción guarda como texto.
  if (/^[a-z]+-\d+#\d+$/.test(detalle))
    detalle = nombreCarta(detalle.replace(/#\d+$/, '') as IdCarta);
  return { tipo, detalle };
}

/** La jugada sugerida, para empezar la frase: «Juega el As de copas», «Plántate»… */
function jugada(d: Datos, juego?: IdJuego): string {
  const { tipo, detalle } = tipoYDetalle(d);
  const c = carta(d);
  // «Jugar» sin carta es decidir jugar la mano (Julepe, Bourré, Écarté, Klaverjas).
  if (tipo === 'jugar' || tipo === 'jugarCarta') return c ? `Juega ${c}` : 'Juega esta mano';
  const accion = mayuscula(nombreAccion(tipo, juego));
  const entre = [c, detalle].filter(Boolean).join(', ');
  return entre ? `${accion} (${entre})` : accion;
}

/** Frase de la sugerencia: qué jugar y por qué. */
export function fraseMotivo(codigo: CodigoMotivo, d: Datos, juego?: IdJuego): string {
  const c = carta(d);
  switch (codigo) {
    case 'unica':
      return `${jugada(d, juego)}: es tu única jugada posible.`;
    case 'gana-baza-puntos':
      return `Juega ${c}: ganas la baza y te llevas ${puntos(d['puntos'])}${
        d['sinTriunfo'] ? ' sin gastar triunfo' : ''
      }.`;
    case 'gana-baza':
      return `Juega ${c}: ganas la baza${d['sinTriunfo'] ? ' sin gastar triunfo' : ''}.`;
    case 'entrega-poco':
      return `Juega ${c}: esta baza no la puedes ganar, así que entregas la carta que menos da${
        Number(d['puntos']) > 0 ? ` (la baza se lleva ${puntos(d['puntos'])})` : ''
      }.`;
    case 'guarda-carta':
      return `Juega ${c}: podrías ganar la baza, pero te conviene guardar tu carta buena para más adelante.`;
    case 'opciones-baza':
      return `Juega ${c}: nadie tiene la baza asegurada, pero es tu carta con más opciones de ganarla (en ${d['porcentaje']} de cada 100 repartos posibles de las cartas que no ves).`;
    case 'arriesga-poco':
      return `Juega ${c}: es difícil ganar esta baza, y es la carta con la que menos puntos arriesgas${
        Number(d['puntos']) > 0 ? ` (de media, la baza se lleva unos ${puntos(d['puntos'])})` : ''
      }.`;
    case 'evita-baza':
      return `Juega ${c}: así no te llevas la baza.`;
    case 'evita-baza-probable':
      return `Juega ${c}: es tu carta con menos opciones de llevarte la baza (te libras en ${d['porcentaje']} de cada 100 repartos posibles).`;
    case 'gana-sin-castigo':
      return `Juega ${c}: te llevas la baza, pero no trae ningún castigo.`;
    case 'escoba':
      return `Juega ${c}: te llevas ${Number(d['n']) === 1 ? 'la carta' : `las ${cartas(d['n'])}`} de la mesa y haces escoba.`;
    case 'captura-siete-oros':
      return `Juega ${c}: te llevas el 7 de oros, que vale un punto por sí solo.`;
    case 'captura':
      return `Juega ${c}: recoges ${cartas(d['n'])} de la mesa.`;
    case 'sin-captura':
      return `Juega ${c}: no puedes recoger nada que valga la pena, y es la carta que menos arriesgas en la mesa.`;
    case 'mejor-media': {
      const razon = razonDe(d, juego);
      return `${jugada(d, juego)}: ${razon ? `${razon}. Además, ` : ''}la he probado en ${d['total']} repartos posibles de las cartas que no ves y es la que mejor sale de media.`;
    }
    case 'mejor-simulada': {
      const razon = razonDe(d, juego);
      return `${jugada(d, juego)}: ${razon ? `${razon}. Además, ` : ''}la he probado en ${d['total']} repartos posibles de las cartas que no ves, y sale mejor que las demás en ${d['ganadas']}.`;
    }
    case 'accion':
    case 'jugada': {
      const razon = razonDe(d, juego);
      if (razon) return `${jugada(d, juego)}: ${razon}.`;
      return c
        ? `Juega ${c}: ninguna carta gana esta jugada con claridad, y esta es la que mejor te deja para el resto de la mano.`
        : `${jugada(d, juego)}: es lo que mejor te deja para el resto de la mano.`;
    }
  }
}

/** Frase del comentario cuando la jugada hecha cuesta algo frente a la sugerida. */
export function fraseComentario(codigo: CodigoComentario, d: Datos): string {
  const c = carta(d);
  switch (codigo) {
    case 'puntos-regalados':
      return `Has dado ${puntos(d['puntos'])} más al rival: con ${c} perdías menos.`;
    case 'baza-perdida':
      return `Has perdido una baza que ganabas con ${c}${
        Number(d['puntos']) > 0 ? ` (${puntos(d['puntos'])})` : ''
      }.`;
    case 'triunfo-gastado':
      return `Has gastado un triunfo: con ${c} ganabas la baza igual y lo guardabas.`;
    case 'castigo-evitable':
      return `Te has llevado ${puntos(d['puntos'])} de castigo: con ${c} te librabas.`;
    case 'escoba-perdida':
      return `Con ${c} hacías escoba.`;
    case 'captura-menor':
      return `Con ${c} recogías ${cartas(d['n'])} más.`;
    case 'peor-simulada':
      return `En ${d['peores']} de ${d['total']} repartos posibles de las cartas que no ves, tu jugada sale peor que la que te sugería.`;
  }
}

// ── Lectura de las jugadas de los rivales ───────────────────────────────────

/**
 * La jugada de un rival en tercera persona y, cuando se puede decir sin ver sus cartas, lo que
 * suele querer decir. Se escriben como las leería alguien que mira la mesa: nunca afirman qué
 * cartas tiene.
 */
const ACCIONES_RIVAL: Readonly<Record<string, readonly [string, string?]>> = {
  pasar: ['pasa', 'no puede o no le conviene ir más allá'],
  paso: ['pasa', 'no puede o no le conviene ir más allá'],
  robar: ['roba'],
  robarMazo: ['roba del mazo', 'lo que hay en el descarte no le sirve'],
  robarDescarte: ['roba del descarte', 'esa carta le sirve para una combinación'],
  robarMonton: ['se lleva el montón', 'le sirven las cartas de arriba'],
  tomarPozo: ['se lleva el pozo', 'le sirven las cartas de arriba'],
  descartar: ['se descarta', 'es la carta que menos le sirve'],
  descarte: ['se descarta', 'es la carta que menos le sirve'],
  pujar: ['puja', 'confía en su mano'],
  apostar: ['apuesta', 'confía en su mano o quiere que lo parezca'],
  subir: ['sube', 'confía en su mano o quiere que lo parezca'],
  igualar: ['iguala', 'cree que puede ganar, pero sin arriesgar más'],
  retirarse: ['se retira', 'no le compensa seguir con su mano'],
  pedir: ['pide carta', 'cree que todavía puede acercarse más sin pasarse'],
  plantarse: ['se planta', 'prefiere no arriesgarse a pasarse'],
  doblar: ['dobla', 've muy buena su jugada'],
  separar: ['separa'],
  bajar: ['baja sus combinaciones', 'así se quita puntos de la mano'],
  anadir: ['añade a una combinación', 'así se quita cartas de la mano'],
  cerrar: ['cierra', 'cree que ya tiene la mano ganada'],
  cantar: ['canta', 'se suma los puntos del cante'],
  cantarTute: ['canta el tute'],
  cambiarSiete: ['cambia el siete de triunfo', 'se queda con la carta de la muestra, que vale más'],
  cambiarMuestra: ['cambia la muestra', 'se queda con la carta de la muestra, que vale más'],
  cambiar: ['cambia cartas', 'busca mejorar su mano'],
  envidar: ['envida', 'tiene buen juego o va de farol'],
  envido: ['canta envido', 'tiene buen tanto o va de farol'],
  realEnvido: ['canta real envido', 'tiene buen tanto o va de farol'],
  faltaEnvido: ['canta falta envido', 'tiene muy buen tanto o va de farol'],
  truco: ['canta truco', 'tiene cartas altas o va de farol'],
  trucar: ['truca', 'tiene cartas altas o va de farol'],
  quiero: ['dice «quiero»', 'cree que puede ganar'],
  noQuiero: ['dice «no quiero»', 'no lo ve claro y prefiere perder poco'],
  ordago: ['echa un órdago', 'va a por todas: o tiene muy buen juego o es un farol'],
  mus: ['pide mus', 'quiere cambiar cartas para mejorar'],
  triunfo: ['elige el triunfo', 'será el palo del que tiene más cartas'],
  elegir: ['elige'],
  contrato: ['elige el contrato', 'es el que mejor le encaja con su mano'],
  declarar: ['declara'],
  anunciar: ['anuncia'],
  aceptar: ['acepta', 'le encaja con su mano'],
  rehusar: ['rehúsa', 'no le encaja con su mano'],
  contro: ['dice contro', 'cree que el contrato no se va a cumplir'],
  redoblar: ['redobla', 'está seguro de cumplir'],
  recoger: ['recoge'],
  construir: ['construye', 'se prepara para recoger en su próximo turno'],
  atacar: ['ataca'],
  defender: ['se defiende'],
  tomar: ['se lleva las cartas', 'no puede o no le compensa defenderse'],
  coger: ['coge'],
  devolver: ['devuelve cartas'],
  desconfiar: ['dice «¡mentiroso!»', 'no se cree la bajada'],
  creer: ['se cree la bajada'],
  meVoy: ['se va', 'no le compensa seguir'],
  dar: ['da cartas'],
  llamar: ['llama'],
  go: ['dice «go»', 'no puede jugar sin pasarse de 31'],
  gin: ['cierra con gin', 'no le queda ninguna carta suelta'],
  dejar: ['deja una carta en la mesa', 'no puede recoger ni construir nada que le convenga'],
  echar: ['echa a la caja', 'son las cartas que menos le sirven para su mano'],
  marcar: ['marca'],
  vull: ['dice «vull»', 'cree que puede ganar'],
  noVull: ['dice «no vull»', 'no lo ve claro y prefiere perder poco'],
  reservar: ['reserva'],
  whist: ['dice «whist»', 'cree que el contrato no se va a cumplir'],
};

/** Acciones de los rivales que significan otra cosa en un juego concreto. */
const ACCIONES_RIVAL_JUEGO: Partial<
  Record<IdJuego, Readonly<Record<string, readonly [string, string?]>>>
> = {
  euchre: {
    pedir: ['pide que el repartidor recoja la carta de arriba', 'le conviene ese triunfo'],
  },
  pesca: { pedir: ['pide cartas a otro jugador', 'busca completar un grupo'] },
  corazones: { pasar: ['pasa', 'se quita una carta peligrosa o difícil de jugar'] },
  burro: { pasar: ['pasa', 'no le sirve para juntar cuatro iguales'] },
};

/** «Rival 1 juega el As de copas», «Rival se planta (prefiere…)». */
function jugadaRival(
  nombre: string,
  d: Datos,
  juego?: IdJuego,
): { frase: string; razon: string | null } {
  const { tipo, detalle } = tipoYDetalle(d);
  const c = carta(d);
  if (tipo === 'jugar' || tipo === 'jugarCarta') {
    return c
      ? { frase: `${nombre} juega ${c}`, razon: null }
      : { frase: `${nombre} decide jugar esta mano`, razon: 'confía en sus cartas' };
  }
  const [verbo, razon] = (juego && ACCIONES_RIVAL_JUEGO[juego]?.[tipo]) ??
    ACCIONES_RIVAL[tipo] ?? [`hace «${palabras(tipo)}»`];
  // Pasar una carta (Corazones, Burro) no es pasar el turno.
  if ((tipo === 'pasar' || tipo === 'paso') && c) {
    return { frase: `${nombre} pasa ${c}`, razon: razon ?? 'no quiere quedársela' };
  }
  const entre = [c, detalle].filter(Boolean).join(', ');
  return { frase: `${nombre} ${verbo}${entre ? ` (${entre})` : ''}`, razon: razon ?? null };
}

/** Por qué un rival hizo su jugada, con su nombre visto desde el jugador. */
export function fraseLectura(
  codigo: CodigoMotivo,
  d: Datos,
  nombre: string,
  juego?: IdJuego,
): string {
  const c = carta(d);
  switch (codigo) {
    case 'gana-baza-puntos':
      return `${nombre} juega ${c} para llevarse la baza, que vale ${puntos(d['puntos'])}.`;
    case 'gana-baza':
      return `${nombre} juega ${c} para llevarse la baza.`;
    case 'entrega-poco':
      return `${nombre} juega ${c}, que da poco: no le compensa pelear esta baza.`;
    case 'guarda-carta':
      return `${nombre} juega ${c} sin pelear la baza: prefiere reservar sus cartas para más adelante.`;
    case 'opciones-baza':
      return `${nombre} juega ${c} para intentar llevarse la baza.`;
    case 'arriesga-poco':
      return `${nombre} juega ${c}, que arriesga pocos puntos: la baza está difícil.`;
    case 'evita-baza':
    case 'evita-baza-probable':
      return `${nombre} juega ${c} para no llevarse la baza.`;
    case 'gana-sin-castigo':
      return `${nombre} se lleva la baza con ${c}: no trae ningún castigo.`;
    case 'escoba':
      return `${nombre} hace escoba con ${c}: se lleva ${Number(d['n']) === 1 ? 'la carta' : `las ${cartas(d['n'])}`} de la mesa.`;
    case 'captura-siete-oros':
      return `${nombre} se lleva el 7 de oros con ${c}: vale un punto por sí solo.`;
    case 'captura':
      return `${nombre} recoge ${cartas(d['n'])} con ${c}.`;
    case 'sin-captura':
      return `${nombre} deja ${c} en la mesa: no recoge nada que valga la pena.`;
    case 'unica':
    case 'mejor-simulada':
    case 'mejor-media':
    case 'accion':
    case 'jugada': {
      const { frase, razon } = jugadaRival(nombre, d, juego);
      return razon ? `${frase}: ${razon}.` : `${frase}.`;
    }
  }
}

/**
 * Consejos de las fases que comparten muchos juegos. La clave es el nombre de la fase en la
 * vista del juego; la fase principal de cada juego usa su consejo propio (`CONSEJOS_JUEGO`).
 */
export const CONSEJOS_FASE: Readonly<Record<string, string>> = {
  subasta:
    'Subasta: cada uno dice cuánto cree que puede ganar con su mano. Cuenta tus cartas altas y tus triunfos posibles antes de pujar, y no pidas más de lo que puedes cumplir: si no llegas, pierdes lo que pujaste.',
  pujar:
    'Subasta: cada uno dice cuánto cree que puede ganar con su mano. Cuenta tus cartas altas y tus triunfos posibles antes de pujar, y no pidas más de lo que puedes cumplir.',
  apuesta:
    'Apuesta: di cuántas bazas crees que vas a ganar. Cuenta las cartas que seguro ganan (ases, reyes con compañía, triunfos altos) y sé prudente con las dudosas.',
  triunfo:
    'Elección del triunfo: elige el palo del que tengas más cartas y más altas. Con muchos triunfos controlas las bazas.',
  contrato:
    'Contrato: elige el que mejor encaje con tu mano. Con cartas bajas, los contratos de no llevarse bazas o cartas; con cartas altas y largas, los de ganar bazas.',
  descarte:
    'Descarte: deshazte de las cartas que no forman nada ni van a formarlo, empezando por las que más puntos te restan si te quedan en la mano.',
  descartar:
    'Descarte: deshazte de las cartas que no forman nada ni van a formarlo, empezando por las que más puntos te restan si te quedan en la mano.',
  cambio:
    'Cambio de cartas: suelta las cartas que no te sirven para quedarte con un palo fuerte o con combinaciones. Piensa también en lo que le das al rival.',
  intercambio:
    'Intercambio: las cartas que das y recibes dependen del puesto de la mano anterior. Si devuelves, da tus peores cartas.',
  pase: 'Pase: pasa las cartas que más te pueden perjudicar (las altas del palo peligroso) y quédate con las bajas, que te ayudan a no llevarte bazas.',
  robar:
    'Robo: coge la carta del descarte solo si te forma o te acerca a una combinación; si no, roba del mazo y no des pistas a los rivales.',
  bajar:
    'Bajar: baja tus combinaciones cuando te acerquen a cerrar o cuando te arriesgues a quedarte con muchos puntos en la mano.',
  enterrar:
    'Enterrar: guarda las cartas con puntos que no vas a poder defender y deshazte de los palos cortos para poder fallar con triunfo.',
  eleccion:
    'Elección: decide si juegas la mano o pasas según cuántas bazas puedes ganar con seguridad.',
  decidir:
    'Decisión: entra en la mano solo si tus cartas te dan bazas seguras; si no, pasar sale más barato.',
};

/** Consejo de la jugada principal de cada juego con IA: lo que se decide y qué tener en cuenta. */
export const CONSEJOS_JUEGO: Readonly<Partial<Record<IdJuego, string>>> = {
  brisca:
    'Brisca: gana bazas con puntos (ases y treses valen mucho) y, si no puedes ganar, entrega cartas sin puntos. Guarda los triunfos para cazar las cartas gordas del rival.',
  tute: 'Tute: gana bazas con ases y treses y canta las cuarenta o las veinte en cuanto ganes una baza. Arrastrado el mazo, asiste al palo y sube si puedes.',
  guinote:
    'Guiñote: como en la Brisca, busca las bazas con puntos y canta en cuanto ganes una baza. Al final, asiste y sube: cuenta los triunfos que han salido.',
  escoba:
    'Escoba: suma 15 con tu carta y las de la mesa. Busca la escoba, los sietes y los oros, y no dejes en la mesa sumas que el rival pueda completar.',
  chinchon:
    'Chinchón: forma tríos y escaleras del mismo palo. Descarta las cartas sueltas altas y cierra en cuanto te quede poca puntuación suelta.',
  sieteYMedia:
    'Siete y media: acércate a 7,5 sin pasarte. Las figuras valen medio punto; plántate cuando el riesgo de pasarte sea mayor que lo que ganas pidiendo.',
  cinquillo:
    'Cinquillo: sigue las escaleras desde los cincos. Juega primero las cartas que bloquean a los rivales y guarda las que solo tú puedes continuar.',
  pocha:
    'Pocha: acierta exactamente las bazas que pides. Cuenta las cartas que seguro ganan y, una vez cumplido, evita ganar bazas de más.',
  mus: 'Mus: cada lance (grande, chica, pares y juego) se apuesta por separado. Envida en los lances en los que tu mano es buena y no tengas miedo a pasar en los demás.',
  corazones:
    'Corazones: evita llevarte corazones y la dama de picas. Suelta pronto las cartas altas y quédate sin un palo para poder descartarte de lo que te sobra.',
  burro:
    'Burro: reúne cuatro cartas iguales pasando las que no te sirven. Cuando alguien se plante, plántate rápido para no ser el último.',
  pinacle:
    'Pinacle: forma combinaciones y llévate el montón cuando te forme algo bueno. No descartes cartas que le sirvan al siguiente jugador.',
  butifarra:
    'Butifarra: el que elige el triunfo puede pasarlo a su compañero. En las bazas, los nueves y los ases valen mucho: asegúralos y juega con tu pareja.',
  truc: 'Truc: gana dos de tres manos. Envida con buena mano, farolea a veces y guarda tu carta más fuerte para la mano decisiva.',
  julepe:
    'Julepe: juega solo si puedes ganar al menos dos bazas. Si entras, cuenta los triunfos que salen y no te quedes con bazas de menos.',
  rummy500:
    'Rummy 500: baja combinaciones para sumar puntos y coge del descarte cuando puedas usar la carta enseguida. Las cartas que te quedan en la mano restan.',
  remigio:
    'Remigio: forma combinaciones para quedarte sin cartas. Roba del montón solo si te sirve y descarta lo que menos te acerca a cerrar.',
  tuteSubastado:
    'Tute subastado: puja según tus ases, treses y cantes posibles. Si ganas la subasta, elige el triunfo de tu palo más largo y canta en cuanto puedas.',
  cuatrola:
    'Cuatrola: quien gana la subasta llama a un compañero con una carta. Puja con fuerza y, en las bazas, busca a tu pareja secreta.',
  mentiroso:
    'Mentiroso: baja la verdad cuando puedas y miente con prudencia. Di «¡mentiroso!» cuando sepas, por las cartas que has visto, que no puede ser verdad.',
  ochoLoco:
    'Ocho loco: echa una carta del mismo palo o número. Guarda los ochos para cuando no tengas otra jugada y cambia al palo que más tengas.',
  picas:
    'Picas: apuesta las bazas que vas a ganar con tu pareja. Las picas siempre son triunfo; no las saques hasta que se hayan jugado.',
  blackjack:
    'Blackjack: acércate a 21 sin pasarte. Fíjate en la carta visible de la banca: con 12 a 16 contra un 7 o más, suele convenir pedir.',
  ginRummy:
    'Gin Rummy: forma combinaciones y cierra cuando tus puntos sueltos sean pocos. Descarta pronto las cartas altas que no ligan.',
  holdem:
    "Texas Hold'em: juega pocas manos y fuertes. Iguala solo cuando lo que puedes ganar compense lo que te cuesta, y retírate sin miedo.",
  culo: 'Culo: deshazte de tus cartas jugando por encima de la mesa. Guarda los doses para cortar y abre con tus cartas bajas.',
  canasta:
    'Canasta: forma canastas de siete cartas y llévate el pozo cuando puedas. Cuidado con descartar cartas que le sirvan al rival.',
  whist:
    'Whist: gana bazas con tu pareja. Sal de tu palo largo, asiste siempre y usa los triunfos para cortar los palos que te faltan.',
  sevens:
    'Sevens: sigue las escaleras desde los sietes. Juega las cartas que abren los palos que tú tienes y retén las que dejan bloqueados a los demás.',
  casino:
    'Casino: recoge cartas que sumen o igualen la tuya. Busca las picas, los ases y el 10 de diamantes, y construye solo si puedes recogerlo después.',
  durak:
    'Durak: defiéndete con cartas más altas del mismo palo o con triunfo. Ataca con tus cartas bajas y guarda los triunfos altos para el final.',
  euchre:
    'Euchre: con tu pareja tenéis que ganar tres de cinco bazas. Las jotas del triunfo son las más altas: cuéntalas antes de pedir el triunfo.',
  bigTwo:
    'Big Two: deshazte de tus cartas jugando por encima de la mesa. Abre con tus jugadas bajas y guarda los doses y las jugadas fuertes.',
  cribbage:
    'Cribbage: suma 15, parejas y escaleras al ir jugando. Guarda para tu mano las cartas que combinan y no regales quinces al rival.',
  belote:
    'Belote: gana bazas con tu pareja. La jota y el nueve del triunfo son las más fuertes: no las gastes sin necesidad.',
  schnapsen:
    'Schnapsen: llega a 66 puntos. Canta el rey y la dama cuando puedas y cierra el mazo cuando estés cerca de ganar.',
  skat: 'Skat: el declarante juega solo contra dos. Puja según tus jotas y tu palo largo; los ases y los dieces son los puntos.',
  ohHell:
    'Oh Hell: acierta exactamente tus bazas. Cuenta lo que ganas seguro y, cumplido el contrato, deshazte de las cartas que ganan.',
  spiteMalice:
    'Spite and Malice: vacía tu montón propio. Juega primero de él y usa los reyes como comodín para no darle paso al rival.',
  bridge:
    'Bridge: con tu pareja contratáis un número de bazas. Cuenta tus puntos de honores para pujar y planifica cómo ganar las bazas antes de jugar.',
  pesca:
    'Pesca: pide a los rivales las cartas que te faltan para completar grupos de cuatro. Recuerda lo que han pedido ellos.',
  kingsCorner:
    'Kings in the Corner: baja en escaleras alternando colores. Pon los reyes en las esquinas y vacía tu mano antes que los demás.',
  bezique:
    'Bezique: declara combinaciones al ganar bazas. Guarda las cartas que forman bezique y los ases y dieces para el final.',
  doppelkopf:
    'Doppelkopf: las damas y las jotas son triunfo. Averigua pronto quién es tu pareja y llévate las bazas con zorros y dieces.',
  tarot:
    'Tarot: el que toma juega solo contra los demás. Los oudlers (el 1, el 21 y la Excusa) bajan los puntos que necesitas; protégelos.',
  sueca: 'Sueca: gana bazas con tu pareja. Ases y sietes valen mucho: asegúralos y no los regales.',
  piquet:
    'Piquet: declara tus puntos, escaleras y grupos, y gana bazas. Descarta pensando en las combinaciones que puedes formar.',
  jass: 'Jass: la jota y el nueve del triunfo son las más altas. Gana bazas con tu pareja y declara tus combinaciones.',
  klaverjas:
    'Klaverjas: la jota y el nueve del triunfo mandan. Si eliges el triunfo, tu pareja tiene que llevarse más de la mitad de los puntos.',
  barbu:
    'Barbu: cada mano tiene un contrato. En los negativos evita las bazas o las cartas que castigan; en el de triunfo, gana todas las que puedas.',
  fiveHundred:
    'Five Hundred: puja un número de bazas con un triunfo. El comodín y las jotas son las cartas más fuertes: cuéntalas antes de pujar.',
  scopa:
    'Scopa: recoge cartas que sumen tu carta. Busca la scopa, los sietes (sobre todo el de oros) y los oros.',
  tressette:
    'Tressette: los treses, los doses y los ases son las cartas más fuertes. Gana bazas con tu pareja y avísale de tus palos.',
  schafkopf:
    'Schafkopf: las damas y las jotas son triunfo. Si juegas, busca a tu compañero con el as llamado y cuenta los puntos de las bazas.',
  truco:
    'Truco: gana dos de tres manos. Canta envido con buena suma del mismo palo y canta truco cuando tengas cartas altas o quieras farolear.',
  preference:
    'Préférence: el que gana la subasta juega solo. Puja según tus bazas seguras y defiende con cuidado si juegas en contra.',
  cuarenta:
    'Cuarenta: recoge la carta igual o las que siguen en escalera. Busca las caídas y la limpia, y no dejes cartas fáciles al rival.',
  pishti:
    'Pishti: recoge el montón con una carta igual o con una jota. Si el montón tiene una sola carta y la igualas, haces pishti.',
  ecarte:
    'Écarté: gana tres de cinco bazas. Cambia cartas si tu mano es floja y guarda el rey del triunfo.',
  sixtySix:
    'Sixty-six: llega a 66 puntos. Canta el rey y la dama cuando puedas y cierra el mazo cuando estés cerca de ganar.',
  tysiacha:
    'Tysiacha: llega a mil puntos. Canta los matrimonios (rey y dama del mismo palo) para cambiar el triunfo y sumar.',
  sheepshead:
    'Sheepshead: las damas y las jotas son triunfo. Si tomas el blind, juegas contra los demás con tu compañero secreto.',
  rentz:
    'Rentz: cada jugador elige contratos por turnos. En los negativos evita lo que castiga; en el positivo y el dominó, sé el primero.',
  bourre:
    'Bourré: gana bazas para quedarte con el bote. Si no tienes cartas buenas, es mejor no entrar en la mano.',
  tresillo:
    'Tresillo: el que gana la subasta juega solo contra dos. Las tres cartas más altas (espadilla, malilla y basto) deciden muchas bazas.',
  conquian:
    'Conquián: forma combinaciones con las cartas de la mesa. Coge una carta solo si la puedes bajar y no le regales nada al siguiente.',
  twentyNine:
    'Twenty-Nine: la jota y el nueve son las cartas más altas y las que más puntan. Puja con tu compañero en mente y pide el triunfo cuando la baza tenga puntos.',
  handAndFoot:
    'Hand and Foot: juega tu mano para llegar cuanto antes al pie, y termina libros de 7. Para cerrar, tu pareja necesita 2 libros limpios y 2 sucios.',
  briscolaChiamata:
    'Briscola Chiamata: puja con un palo largo y llama una carta que no tengas. Hasta que salga la carta llamada nadie sabe quién va con quién: carga puntos solo cuando sepas que la baza es de tu bando.',
  treintaYUno:
    'Treinta y uno: acércate a 31 con cartas del mismo palo. Llama cuando tu mano sea buena y no esperes demasiado.',
};

/** Consejo de una fase de un juego, o `null` si no hay ninguno. */
export function consejoDe(juego: IdJuego, clave: string): string | null {
  return clave === 'juego' ? (CONSEJOS_JUEGO[juego] ?? null) : (CONSEJOS_FASE[clave] ?? null);
}

/** La clave de consejo de una fase: la de las fases comunes, o la jugada principal. */
export const claveConsejo = (fase: string) => (fase in CONSEJOS_FASE ? fase : 'juego');

export const TEXTOS_ASISTENTE = {
  opcion: 'Modo asistido',
  opcionDesc:
    'Te sugiere la jugada, te explica por qué y te comenta las tuyas, para aprender a jugar.',
  activo: 'Asistido',
  activar: 'Activar el modo asistido',
  desactivar: 'Desactivar el modo asistido',
  pensando: 'Pensando una sugerencia…',
  sugerencia: 'Sugerencia',
  comentario: 'Tu jugada',
  lecturas: 'Los rivales',
  consejo: 'Consejo',
  cerrar: 'Cerrar',
} as const;
