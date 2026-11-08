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
  go: 'di «go»',
  gin: 'cierra con gin',
};

/** Nombre de la jugada en imperativo; los tipos sin nombre se escriben tal cual («noQuiero» → «no quiero»). */
const palabras = (tipo: string) => tipo.replace(/([a-z])([A-Z])/g, '$1 $2').toLowerCase();

export const nombreAccion = (tipo: string) => ACCIONES[tipo] ?? palabras(tipo);

const carta = (d: Datos) =>
  typeof d['carta'] === 'string' ? nombreCarta(d['carta'] as IdCarta) : '';
const mayuscula = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

/** La jugada sugerida, para empezar la frase: «Juega el As de copas», «Plántate»… */
function jugada(d: Datos): string {
  const tipo = typeof d['tipo'] === 'string' ? d['tipo'] : 'jugar';
  const c = carta(d);
  if (tipo === 'jugar' || tipo === 'jugarCarta') return c ? `Juega ${c}` : 'Juega';
  const accion = mayuscula(nombreAccion(tipo));
  const detalle = d['detalle'] !== undefined ? String(d['detalle']) : '';
  const entre = [c, detalle].filter(Boolean).join(', ');
  return entre ? `${accion} (${entre})` : accion;
}

/** Frase de la sugerencia: qué jugar y por qué. */
export function fraseMotivo(codigo: CodigoMotivo, d: Datos): string {
  const c = carta(d);
  switch (codigo) {
    case 'unica':
      return `${jugada(d)}: es tu única jugada posible.`;
    case 'gana-baza-puntos':
      return `Juega ${c}: ganas la baza y te llevas ${d['puntos']} puntos${
        d['sinTriunfo'] ? ' sin gastar triunfo' : ''
      }.`;
    case 'gana-baza':
      return `Juega ${c}: ganas la baza${d['sinTriunfo'] ? ' sin gastar triunfo' : ''}.`;
    case 'entrega-poco':
      return `Juega ${c}: esta baza no la puedes ganar, así que entregas la carta que menos da${
        Number(d['puntos']) > 0 ? ` (la baza se lleva ${d['puntos']} puntos)` : ''
      }.`;
    case 'guarda-carta':
      return `Juega ${c}: podrías ganar la baza, pero te conviene guardar tu carta buena para más adelante.`;
    case 'evita-baza':
      return `Juega ${c}: así no te llevas la baza.`;
    case 'gana-sin-castigo':
      return `Juega ${c}: te llevas la baza, pero no trae ningún castigo.`;
    case 'escoba':
      return `Juega ${c}: te llevas las ${d['n']} cartas de la mesa y haces escoba.`;
    case 'captura-siete-oros':
      return `Juega ${c}: te llevas el 7 de oros, que vale un punto por sí solo.`;
    case 'captura':
      return `Juega ${c}: recoges ${d['n']} ${Number(d['n']) === 1 ? 'carta' : 'cartas'} de la mesa.`;
    case 'sin-captura':
      return `Juega ${c}: no puedes recoger nada que valga la pena, y es la carta que menos arriesgas en la mesa.`;
    case 'mejor-simulada':
      return `${jugada(d)}: la he probado en ${d['total']} repartos posibles de las cartas que no ves, y sale mejor que las demás en ${d['ganadas']}.`;
    case 'accion':
    case 'jugada':
      return `Te conviene: ${jugada(d).charAt(0).toLowerCase()}${jugada(d).slice(1)}.`;
  }
}

/** Frase del comentario cuando la jugada hecha cuesta algo frente a la sugerida. */
export function fraseComentario(codigo: CodigoComentario, d: Datos): string {
  const c = carta(d);
  switch (codigo) {
    case 'puntos-regalados':
      return `Has dado ${d['puntos']} puntos más al rival: con ${c} perdías menos.`;
    case 'baza-perdida':
      return `Has perdido una baza que ganabas con ${c}${
        Number(d['puntos']) > 0 ? ` (${d['puntos']} puntos)` : ''
      }.`;
    case 'triunfo-gastado':
      return `Has gastado un triunfo: con ${c} ganabas la baza igual y lo guardabas.`;
    case 'castigo-evitable':
      return `Te has llevado ${d['puntos']} puntos de castigo: con ${c} te librabas.`;
    case 'escoba-perdida':
      return `Con ${c} hacías escoba.`;
    case 'captura-menor':
      return `Con ${c} recogías ${d['n']} cartas más.`;
    case 'peor-simulada':
      return `En ${d['peores']} de ${d['total']} repartos posibles de las cartas que no ves, tu jugada sale peor que la que te sugería.`;
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
  consejo: 'Consejo',
  cerrar: 'Cerrar',
} as const;
