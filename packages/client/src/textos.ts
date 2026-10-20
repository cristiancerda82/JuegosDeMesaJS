/** Un valor de la Siete y media en medios puntos, con coma decimal: 15 → «7,5». */
function formatoValor(medios: number): string {
  return medios % 2 === 0 ? `${medios / 2}` : `${(medios - 1) / 2},5`;
}

/** Un número con el signo menos tipográfico, como en el resto de marcadores. */
const conSigno = (n: number) => (n < 0 ? `−${-n}` : `${n}`);
const fichasConSigno = (n: number) =>
  n === 1 || n === -1 ? `${conSigno(n)} ficha` : `${conSigno(n)} fichas`;

/**
 * Todos los textos visibles del cliente, en español. Centralizados aquí por si hace falta
 * traducir más adelante (design: no hay sistema de traducción todavía).
 */
export const T = {
  app: { titulo: 'Juegos de mesa', subtitulo: 'Naipes para jugar en cualquier parte' },

  pwa: {
    versionNueva: 'Hay una versión nueva',
    actualizar: 'Actualizar',
    instalar: 'Instalar',
    instalarDesc:
      'Instala la aplicación para abrirla desde tu pantalla de inicio, también sin conexión.',
    instalarIOS:
      'Para instalarla en el iPhone o el iPad: pulsa Compartir y después «Añadir a pantalla de inicio».',
  },

  menu: {
    elegir: 'Elige un juego',
    klondike: 'Klondike',
    klondikeDesc: 'El solitario clásico con baraja francesa.',
    freecell: 'FreeCell',
    freecellDesc: 'Solitario con 4 celdas libres y todas las cartas a la vista.',
    spider: 'Spider',
    spiderDesc: 'Solitario de dos barajas: ordena escaleras del Rey al As del mismo palo.',
    brisca: 'Brisca',
    briscaDesc: 'Bazas con baraja española, contra la máquina.',
    tute: 'Tute',
    tuteDesc: 'Bazas, cantes de 20 y 40 y el tute, con baraja española.',
    escoba: 'Escoba',
    escobaDesc: 'Recoge cartas de la mesa que sumen 15 y haz escobas.',
    chinchon: 'Chinchón',
    chinchonDesc: 'Roba, descarta y liga escaleras y tríos para cerrar antes que nadie.',
    guinote: 'Guiñote',
    guinoteDesc: 'Bazas, cantes con rey y sota y arrastre, en partidas a 101.',
    corazones: 'Corazones',
    corazonesDesc: 'Bazas con baraja francesa: evita los corazones y la Q de picas.',
    burro: 'Burro',
    burroDesc: 'Junta cuatro iguales pasando cartas y que no te pillen el último en plantarte.',
    cinquillo: 'Cinquillo',
    cinquilloDesc: 'Coloca tus cartas en escalera a partir de los cincos y quédate sin ninguna.',
    mus: 'Mus',
    musDesc: 'En parejas: grande, chica, pares y juego, con envites y órdagos.',
    pocha: 'Pocha',
    pochaDesc: 'Apuesta cuántas bazas harás en cada mano y acierta exactamente.',
    pinacle: 'Pinacle',
    enRed: 'Jugar en red',
    enRedDesc: 'Crea una sala o únete con un código para jugar con tus amigos.',
    volverSala: 'Volver a la sala',
    volverSalaDesc: (codigo: string) => `Estabas en la sala ${codigo}.`,
    pinacleDesc:
      'El rummy de dos barajas con comodines: llévate el montón y baja escaleras y grupos.',
    remigio: 'Remigio',
    remigioDesc: 'Rummy de dos barajas con comodines: baja, añade a la mesa y cierra de golpe.',
    julepe: 'Julepe',
    tuteSubastado: 'Tute subastado',
    tuteSubastadoDesc:
      'Subasta cuántos puntos harás, elige el triunfo y juega tú solo contra tres.',
    julepeDesc: 'De 3 a 6: decide si juegas la mano y haz dos bazas, o paga el julepe.',
    truc: 'Truc',
    trucDesc: 'Envit y truc con tres cartas: apuesta, farolea y gana dos de tres bazas.',
    butifarra: 'Butifarra',
    butifarraDesc: 'Bazas por parejas con la manilla: elige el triunfo, delega o juega butifarra.',
    sieteYMedia: 'Siete y media',
    sieteYMediaDesc: 'Pide cartas contra la banca y acércate a 7,5 sin pasarte.',
    jugar: 'Jugar',
    retomarTitulo: 'Tienes una partida a medias',
    retomar: (juego: string) => `Partida de ${juego} sin terminar.`,
    continuar: 'Continuar',
    descartar: 'Descartar',
    guardadoInvalido:
      'No se pudo recuperar la partida guardada (es de otra versión o está dañada) y se descartó.',
    dorso: 'Dorso de las cartas',
    verCartas: 'Ver todas las cartas',
    estadisticas: 'Estadísticas',
  },

  opciones: {
    titulo: (juego: string) => `Opciones de ${juego}`,
    nivelIA: 'Nivel de la IA',
    nivel: { facil: 'Fácil', normal: 'Normal', dificil: 'Difícil' },
    nivelDesc: {
      facil: 'se equivoca a menudo',
      normal: 'juega con sentido',
      dificil: 'piensa cada jugada',
    },
    empezar: 'Empezar partida',
    volver: 'Volver',
    robo: 'Robo',
    robo1: 'De 1 en 1',
    robo3: 'De 3 en 3',
    vueltas: 'Vueltas al mazo',
    ilimitadas: 'Ilimitadas',
    vueltasN: (n: number) => (n === 0 ? 'Ninguna' : n === 1 ? '1 vuelta' : `${n} vueltas`),
    jugadores: 'Jugadores',
    dosJugadores: '2 jugadores',
    manosJulepe: 'Duración',
    manosJulepeN: (n: number) => `${n} manos`,
    siempreCuatro: 'Siempre se juega con 4, cada uno por su cuenta.',
    dosCames: 'Dos cames de 12 (gana quien gane dos)',
    unaCame: 'Una came de 12',
    cuatroJugadores: '4 jugadores en parejas',
    cambioMuestra: 'Cambio de la muestra',
    cambioNo: 'No se permite',
    cambioLibre: 'Con el 7 (o el 2) de triunfo',
    cambioTrasBaza: 'Solo tras ganar una baza',
    arrastre: 'Arrastre al acabarse el mazo',
    arrastreDesc: 'Obliga a seguir el palo, a superar y a fallar con triunfo.',
    manos: 'Partida',
    manosN: (n: number) => (n === 1 ? 'Una mano' : `Al mejor de ${n} manos`),
    cambioSiete: 'Cambio del 7 de triunfo (solo con 2 jugadores)',
    cambioSieteLibre: 'Siempre que se tenga',
    cambioSieteTrasBaza: 'Tras ganar una baza',
    montar: 'Montar sobre el compañero (4 jugadores)',
    montarDesc: 'Obliga a superar la baza aunque ya la vaya ganando tu compañero.',
    cambioSieteGuinote: 'Cambio del 7 de triunfo',
    paseCorazones: 'Pase de cartas',
    paseCorazonesDesc: 'Pasar 3 cartas antes de cada mano (una de cada cuatro manos no hay pase).',
    palosSpider: 'Dificultad',
    palosN: (n: number) =>
      n === 1 ? '1 palo (fácil)' : n === 2 ? '2 palos (media)' : '4 palos (difícil)',
    repartirConVacias: 'Repartir con columnas vacías',
    repartirConVaciasDesc: 'Permitir repartir del mazo aunque haya alguna columna vacía.',
    partidaFreeCell: 'Partida',
    partidaAzar: 'Al azar',
    partidaNumero: 'Por número',
    numeroPartida: 'Número de partida (1 a 32.000)',
    celdas: 'Celdas libres',
    celdasN: (n: number) => (n === 1 ? '1 celda' : `${n} celdas`),
    autoFundacion: 'Ayuda',
    autoFundacionDesc: 'Llevar solas a las fundaciones las cartas que ya no hacen falta.',
    manosPartida: 'Duración',
    manosPartidaN: (n: number) => (n === 1 ? '1 mano' : `${n} manos`),
    fichasIniciales: 'Fichas de cada jugador',
    fichasN: (n: number) => `${n} fichas`,
    apuestaMaxima: 'Apuesta máxima',
    apuestaN: (n: number) => `Hasta ${n} fichas`,
    pagoDoble: 'Siete y media natural',
    pagoDobleDesc: 'Un 7 y una figura en las dos primeras cartas cobran el doble.',
    cambioBanca: 'La banca',
    bancaRotar: 'Pasa al siguiente cada mano',
    bancaSieteYMedia: 'Pasa a quien le gana con siete y media',
    montarArrastreDesc:
      'En el arrastre, obliga a superar la baza aunque ya la vaya ganando tu compañero.',
    puntosPartida: 'Partida',
    puntosN: (n: number) => `A ${n} puntos`,
    capturaObligatoria: 'Recoger es obligatorio',
    capturaObligatoriaDesc: 'Si la carta que juegas puede sumar 15, tienes que recoger.',
    escobaInicial: 'Escoba del que reparte',
    escobaInicialDesc: 'Si las 4 cartas iniciales de la mesa suman 15, son escoba del que reparte.',
    jugadoresN: (n: number) => `${n} jugadores`,
    baraja: 'Baraja',
    baraja40: 'Española de 40 cartas',
    baraja48: 'Española de 48 cartas (con 8 y 9)',
    comodines: 'Comodines',
    comodinesDesc: 'Jugar con 2 comodines, que sustituyen a cualquier carta.',
    limite: 'Eliminación',
    limiteN: (n: number) => `Al pasar de ${n} puntos`,
    duracionPocha: 'Duración',
    duracionCorta: 'Corta: de 1 a 5 cartas y vuelta (9 manos)',
    duracionCompleta: 'Completa: hasta repartir toda la baraja y vuelta',
    restriccionRepartidor: 'Apuesta del que reparte',
    restriccionRepartidorDesc:
      'El que reparte no puede apostar lo que haría que las apuestas sumen tantas bazas como cartas.',
    reyesMus: 'Reyes',
    ochoReyes: 'Ocho reyes (los treses son reyes y los doses ases)',
    cuatroReyes: 'Cuatro reyes',
    puntosJuegoMus: 'Cada juego',
    piedrasN: (n: number) => `A ${n} piedras`,
    juegosMus: 'Partida',
    juegosN: (n: number) => (n === 1 ? 'A un juego' : `Al mejor de ${n} juegos`),
    cierreMaximo: 'Para cerrar',
    cierreN: (n: number) =>
      n === 0 ? 'Solo con todo ligado' : `Con una carta suelta de ${n} o menos`,
  },

  partida: {
    menu: 'Menú',
    movimientos: 'Movimientos',
    tiempo: 'Tiempo',
    deshacer: 'Deshacer',
    autocompletar: 'Autocompletar',
    abandonar: 'Abandonar',
    confirmarAbandono: '¿Seguro que quieres abandonar esta partida?',
    pista: 'Pista',
    sinPista: 'No veo ningún movimiento útil: prueba a deshacer.',
    atasco: 'No quedan movimientos.',
    pistasUsadas: (n: number) => (n === 1 ? 'Pistas usadas: 1' : `Pistas usadas: ${n}`),
    mazo: 'Mazo',
    reciclar: 'Volver a pasar el descarte al mazo',
    robar: 'Robar del mazo',
    mazoVacio: 'Mazo vacío',
    vueltasRestantes: (n: number) => (n === 1 ? 'Queda 1 vuelta' : `Quedan ${n} vueltas`),
    columna: (n: number) => `Columna ${n}`,
    fundacion: (n: number) => `Fundación ${n}`,
    celda: (n: number) => `Celda ${n}`,
    partidaN: 'Partida',
    maxMovible: 'Puedes mover',
    repartos: (n: number) => (n === 1 ? 'Queda 1 reparto' : `Quedan ${n} repartos`),
    repartir: 'Repartir una carta en cada columna',
    escaleras: 'Escaleras',
    cartasN: (n: number) => (n === 1 ? '1 carta' : `${n} cartas`),
    descarte: 'Descarte',
  },

  brisca: {
    tu: 'Tú',
    rival: 'Rival',
    rivalN: (n: number) => `Rival ${n}`,
    companero: 'Compañero',
    triunfo: 'Triunfo',
    muestra: 'Muestra',
    enMazo: (n: number) => (n === 1 ? '1 carta en el mazo' : `${n} cartas en el mazo`),
    tuTurno: 'Tu turno',
    turnoDe: (quien: string) => `Turno de ${quien}`,
    pensando: 'Pensando…',
    bazas: (n: number) => (n === 1 ? '1 baza' : `${n} bazas`),
    ganaBaza: (quien: string) => (quien === 'Tú' ? 'Ganas la baza' : `Gana la baza: ${quien}`),
    cambiarMuestra: (carta: string) => `Cambiar la muestra por tu ${carta}`,
    mesa: 'Mesa',
    manosGanadas: (tuyas: number, suyas: number) => `Manos: ${tuyas} – ${suyas}`,
    finMano: (a: number, b: number) => `Fin de la mano: ${a} a ${b}`,
    nosotros: 'Tu pareja',
    ellos: 'Rivales',
  },

  tute: {
    cantar: (puntos: number, palo: string) => `Cantar las ${puntos} en ${palo}`,
    cantarTute: 'Cantar el tute',
    cambiarSiete: (carta: string) => `Cambiar la muestra por tu ${carta}`,
    canta: (quien: string, puntos: number, palo: string) =>
      quien === 'Tú'
        ? `Cantas las ${puntos} en ${palo}`
        : `${quien} canta las ${puntos} en ${palo}`,
    tuteGana: (quien: string) => `¡Tute! Gana la mano: ${quien}`,
    cantes: 'Cantes',
    cante: (quien: string, puntos: number, palo: string) => `${quien}: ${puntos} en ${palo}`,
    cartaTriunfo: 'Carta de triunfo',
  },

  escoba: {
    mesa: 'Mesa',
    recoger: 'Recoger',
    dejar: 'Dejar en la mesa',
    cancelar: 'Cancelar',
    suma: (n: number) => `${n} / 15`,
    elegirCaptura: '¿Qué quieres hacer con esta carta?',
    recogerCartas: (n: number) => (n === 1 ? 'Recoger 1 carta' : `Recoger ${n} cartas`),
    escobaDe: (quien: string) => (quien === 'Tú' ? '¡Escoba!' : `¡Escoba de ${quien}!`),
    recoge: (quien: string, n: number) =>
      quien === 'Tú' ? `Recoges ${n} cartas` : `${quien} recoge ${n} cartas`,
    montonCartas: (n: number) => (n === 1 ? '1 carta' : `${n} cartas`),
    montonEscobas: (n: number) => (n === 1 ? '1 escoba' : `${n} escobas`),
    puntos: (tuyos: number, suyos: number, meta: number) =>
      `Puntos: ${tuyos} – ${suyos} (a ${meta})`,
    finMano: 'Fin de la mano',
    siguienteMano: 'Siguiente mano',
    concepto: 'Concepto',
    escobas: 'Escobas',
    cartas: 'Más cartas',
    oros: 'Más oros',
    sieteOros: '7 de oros',
    sietes: 'Más sietes',
    totalMano: 'Total de la mano',
    totalPartida: 'Total de la partida',
  },

  chinchon: {
    mazo: 'Mazo',
    descarte: 'Descarte',
    robarMazo: 'Robar del mazo',
    robarDescarte: (carta: string) => `Robar del descarte: ${carta}`,
    faseRobar: 'Roba una carta del mazo o del descarte',
    faseDescartar: 'Descarta una carta o cierra',
    descartar: 'Descartar',
    cerrar: 'Cerrar',
    ordenar: 'Ordenar',
    porCombinaciones: 'Por combinaciones',
    porPalo: 'Por palo',
    porValor: 'Por valor',
    sueltas: (n: number) => (n === 0 ? 'Todo ligado' : `Sin ligar: ${n} puntos`),
    puntos: (n: number) => `${n} puntos`,
    eliminado: 'Eliminado',
    robaDe: (quien: string, desde: 'mazo' | 'descarte') =>
      `${quien} roba del ${desde === 'mazo' ? 'mazo' : 'descarte'}`,
    descarta: (quien: string, carta: string) => `${quien} descarta ${carta}`,
    finMano: 'Fin de la mano',
    cierra: (quien: string) => (quien === 'Tú' ? 'Has cerrado tú' : `Ha cerrado ${quien}`),
    chinchon: (quien: string) => (quien === 'Tú' ? '¡Chinchón!' : `¡Chinchón de ${quien}!`),
    puntosMano: 'Mano',
    total: 'Total',
    quedaEliminado: 'Queda eliminado',
    siguienteMano: 'Siguiente mano',
    clasificacion: 'Clasificación',
  },

  guinote: {
    marcador: (nuestros: number, suyos: number, meta: number) =>
      `${nuestros} – ${suyos} (a ${meta})`,
    puntos: 'Puntos',
    arrastre: 'Arrastre',
    arrastreDesc: 'Se acabó el mazo: hay que seguir el palo y superar.',
    canta: (quien: string, puntos: number, palo: string) =>
      quien === 'Tú'
        ? `Cantas las ${puntos} en ${palo}`
        : `${quien} canta las ${puntos} en ${palo}`,
    finMano: (n: number) => (n === 1 ? 'Fin de la primera mano' : `Fin de la mano ${n}`),
    concepto: 'Concepto',
    bazas: 'Bazas',
    cantes: 'Cantes',
    ultimas: '10 de últimas',
    totalMano: 'Total de la mano',
    totalPartida: 'Total de la partida',
    deVueltas: (meta: number) => `Nadie llega a ${meta}: se juega de vueltas.`,
    siguienteMano: 'Siguiente mano',
  },

  remigio: {
    puntos: (n: number) => (n === 1 ? '1 punto' : `${n} puntos`),
    limite: 'Eliminado al pasar de 100',
    mano: (n: number) => `Mano ${n}`,
    detalle: (cartas: number, puntos: number) =>
      `${cartas === 1 ? '1 carta' : `${cartas} cartas`} · ${puntos} pts`,
    robarMazo: 'Robar del mazo',
    robarMonton: (carta: string) => `Robar del montón (${carta})`,
    montonVacio: 'Montón vacío',
    verMonton: (n: number) => `Ver el montón (${n})`,
    montonTitulo: 'Cartas del montón',
    cerrarPanel: 'Cerrar',
    faseRobar: 'Roba del mazo o del montón',
    faseBajar: 'Elige cartas para bajar, o una para descartar',
    bajar: 'Bajar',
    descartar: 'Descartar',
    limpiar: 'Quitar selección',
    cancelar: 'Cancelar',
    eligeForma: '¿Cómo quieres bajarlas?',
    noEncaja: 'Esas cartas no encajan en esa combinación.',
    antesBaja: 'Para añadir a la mesa, primero tienes que bajar una combinación tuya.',
    grupoDe: (numero: string, n: number) => `Grupo de ${numero} (${n} cartas)`,
    escaleraDe: (desde: string, hasta: string, palo: string) =>
      `Escalera de ${palo} del ${desde} al ${hasta}`,
    ordenar: 'Ordenar',
    porPalo: 'Por palo',
    porNumero: 'Por número',
    propias: 'Tus combinaciones',
    de: (quien: string) => `De ${quien}`,
    sinCombinaciones: 'Ninguna todavía',
    roba: (quien: string) => `${quien} roba del mazo`,
    robaMonton: (quien: string, carta: string) => `${quien} roba ${carta} del montón`,
    baja: (quien: string) => `${quien} baja una combinación`,
    anade: (quien: string) => `${quien} añade una carta`,
    cambia: (quien: string) => `${quien} cambia un comodín`,
    descarta: (quien: string, carta: string) => `${quien} descarta ${carta}`,
    finMano: (n: number) => (n === 1 ? 'Fin de la primera mano' : `Fin de la mano ${n}`),
    cierra: (quien: string) => (quien === 'Tú' ? 'Has cerrado tú' : `Ha cerrado ${quien}`),
    remigio: (quien: string) =>
      quien === 'Tú'
        ? '¡Remigio! Has cerrado de golpe: los demás pagan doble'
        : `¡Remigio de ${quien}! Los demás pagan doble`,
    anulada: 'Nadie pudo cerrar: la mano se anula y nadie suma',
    jugador: 'Jugador',
    lesQueda: 'Le quedó',
    manoCol: 'Mano',
    totalCol: 'Total',
    eliminado: 'eliminado',
    clasificacion: 'Puntos',
    siguienteMano: 'Siguiente mano',
  },

  julepe: {
    rivalN: (n: number) => `Rival ${n}`,
    triunfo: 'Triunfo',
    bote: (n: number) => `Bote: ${n}`,
    mano: (n: number, total: number) => `Mano ${n} de ${total}`,
    fichas: (n: number) => (n === 1 ? '1 ficha' : `${n} fichas`),
    juego: 'Juego',
    paso: 'Paso',
    obligado: 'Estás obligado a jugar',
    decidir: '¿Juegas la mano?',
    marcaCambio: 'Toca las cartas que quieras cambiar',
    cambiar: (n: number) => (n === 0 ? 'No cambio' : n === 1 ? 'Cambiar 1' : `Cambiar ${n}`),
    mazo: (n: number) => (n === 1 ? 'Queda 1 carta en el mazo' : `Quedan ${n} cartas en el mazo`),
    detalle: (
      juega: boolean | null,
      bazas: number,
      fichas: number,
      cambios: number | null,
      eliminado: boolean,
    ) =>
      eliminado
        ? 'eliminado'
        : juega === false
          ? `pasa · ${fichas}`
          : juega === null
            ? `${fichas} fichas`
            : cambios !== null && bazas === 0
              ? `juega · cambió ${cambios} · ${fichas}`
              : `juega · ${bazas === 1 ? '1 baza' : `${bazas} bazas`} · ${fichas}`,
    juega: (quien: string) => (quien === 'Tú' ? 'Juegas la mano' : `${quien} juega`),
    pasa: (quien: string) => (quien === 'Tú' ? 'Pasas' : `${quien} pasa`),
    cambia: (quien: string, n: number) =>
      quien === 'Tú'
        ? n === 0
          ? 'No cambias ninguna carta'
          : `Cambias ${n}`
        : n === 0
          ? `${quien} no cambia`
          : `${quien} cambia ${n}`,
    nadieJuega: (quien: string) => `Nadie juega: el bote es para ${quien}`,
    finMano: (n: number) => (n === 1 ? 'Fin de la primera mano' : `Fin de la mano ${n}`),
    jugador: 'Jugador',
    bazasCol: 'Bazas',
    cobraCol: 'Cobra',
    julepeCol: 'Julepe',
    fichasCol: 'Fichas',
    pasoCelda: 'pasó',
    eliminado: 'eliminado',
    boteMano: (n: number, baza: number) => `Bote de ${n}: cada baza vale ${baza}`,
    clasificacion: 'Fichas',
    siguienteMano: 'Siguiente mano',
  },

  tuteSubastado: {
    rivalN: (n: number) => `Rival ${n}`,
    triunfo: 'Triunfo',
    sinTriunfo: 'por elegir',
    palo: (palo: string) => palo.charAt(0).toUpperCase() + palo.slice(1),
    mano: (n: number, total: number) => `Mano ${n} de ${total}`,
    numero: (n: number) => conSigno(n),
    fichas: (n: number) => fichasConSigno(n),
    puja: (puntos: number, quien: string) => `Puja: ${puntos} (${quien})`,
    sinPuja: 'Sin pujas',
    lleva: (lleva: number, puja: number) => `Pujador: ${lleva} de ${puja}`,
    subasta: 'Subasta',
    tuTurno: (puja: number | null) =>
      puja === null ? 'Nadie ha pujado: ¿cuánto pujas?' : `La puja va en ${puja}: ¿subes?`,
    paso: 'Paso',
    eligeTriunfo: 'Has ganado la subasta: elige el triunfo',
    detalle: (dicho: number | 'paso' | null, fichas: number) => {
      const saldo = fichasConSigno(fichas);
      return dicho === 'paso'
        ? `pasa · ${saldo}`
        : dicho === null
          ? saldo
          : `puja ${dicho} · ${saldo}`;
    },
    detalleBazas: (pujador: boolean, bazas: number, fichas: number) =>
      `${pujador ? 'pujador · ' : ''}${bazas === 1 ? '1 baza' : `${bazas} bazas`} · ${conSigno(fichas)}`,
    pasa: (quien: string) => (quien === 'Tú' ? 'Pasas' : `${quien} pasa`),
    puja2: (quien: string, puntos: number) =>
      quien === 'Tú' ? `Pujas ${puntos}` : `${quien} puja ${puntos}`,
    gana: (quien: string, puntos: number) =>
      quien === 'Tú' ? `Ganas la subasta con ${puntos}` : `${quien} gana la subasta con ${puntos}`,
    eligio: (quien: string, palo: string) =>
      quien === 'Tú' ? `Triunfo: ${palo}` : `${quien} elige ${palo} de triunfo`,
    todosPasaron: 'Pasaron todos: se reparte otra vez',
    finMano: (n: number) => (n === 1 ? 'Fin de la primera mano' : `Fin de la mano ${n}`),
    cumple: (quien: string, puja: number) =>
      quien === 'Tú' ? `Cumples tus ${puja}` : `${quien} cumple sus ${puja}`,
    falla: (quien: string, puja: number) =>
      quien === 'Tú' ? `No llegas a tus ${puja}` : `${quien} no llega a sus ${puja}`,
    tuteDe: (quien: string) => (quien === 'Tú' ? '¡Cantas el tute!' : `¡Tute de ${quien}!`),
    puntosMano: (pujador: number, defensores: number) =>
      `Pujador ${pujador} · defensores ${defensores}`,
    jugador: 'Jugador',
    cambioCol: 'Mano',
    fichasCol: 'Fichas',
    clasificacion: 'Fichas',
    siguienteMano: 'Siguiente mano',
  },

  truc: {
    piedras: 'Piedras',
    marcador: (nuestras: number, suyas: number) => `${nuestras} – ${suyas} (a 12)`,
    cames: (nuestras: number, suyas: number) => `Cames ${nuestras} – ${suyas}`,
    camesTitulo: 'Cames',
    valeMano: (n: number) => (n === 1 ? 'La mano vale 1' : `La mano vale ${n}`),
    pendiente: (que: string) => `${que} sin responder`,
    envit: 'Envit',
    torne: 'Torne',
    falta: 'Falta',
    trucs: ['Truc', 'Retruc', 'Quatre val', 'Joc fora'] as readonly string[],
    nivelesEnvit: ['', 'Envit', 'Torne', 'Falta'] as readonly string[],
    vull: 'Vull',
    noVull: 'No vull',
    meVoy: "Me'n vaig",
    parda: 'Baza parda',
    envitQuerido: (valor: number) => `Envit querido (${valor})`,
    envitNoQuerido: 'Envit no querido',
    puntosEnvit: (quien: string, puntos: number) => `${quien} ${puntos}`,
    bazas: (nuestras: number, suyas: number, pardas: number) =>
      pardas > 0
        ? `Bazas ${nuestras} – ${suyas} · ${pardas === 1 ? '1 parda' : `${pardas} pardas`}`
        : `Bazas ${nuestras} – ${suyas}`,
    detalleEnvit: (puntos: number) => `envit ${puntos}`,
    /** Lo que dice un jugador. `quien` es «Tú» para el propio. */
    dice: (quien: string, que: string) =>
      quien === 'Tú' ? `Dices «${que}»` : `${quien}: «${que}»`,
    seVa: (quien: string) => (quien === 'Tú' ? 'Te vas de la mano' : `${quien} se va de la mano`),
    finMano: (n: number) => (n === 1 ? 'Fin de la primera mano' : `Fin de la mano ${n}`),
    concepto: 'Concepto',
    filaEnvit: 'Envit',
    filaTruc: 'Truc',
    totalMano: 'Total de la mano',
    piedrasCame: 'Piedras de la came',
    sinEnvit: 'Nadie envidó.',
    envitResumen: (nivel: string, querido: boolean, gana: string) =>
      querido ? `${nivel} querido · lo gana: ${gana}` : `${nivel} no querido · lo cobra: ${gana}`,
    trucResumen: (nivel: string | null, gana: string) =>
      `${nivel ?? 'Sin truc'} · gana la mano: ${gana}`,
    seFueResumen: (quien: string, gana: string) =>
      `${quien === 'Tú' ? 'Te fuiste' : `${quien} se fue`} de la mano · cobra: ${gana}`,
    cameCerrada: (quien: string) => `Came cerrada · la gana: ${quien}`,
    siguienteMano: 'Siguiente mano',
  },

  butifarra: {
    marcador: (nuestros: number, suyos: number, objetivo: number) =>
      `${nuestros} – ${suyos} (a ${objetivo})`,
    puntos: 'Puntos',
    triunfo: 'Triunfo',
    sinTriunfo: 'Butifarra',
    palo: (palo: string) => palo.charAt(0).toUpperCase() + palo.slice(1),
    elige: (quien: string, delegada: boolean) =>
      delegada ? `eligió ${quien} (delegada)` : `eligió ${quien}`,
    eligiendo: (quien: string) => (quien === 'Tú' ? 'Te toca elegir' : `${quien} elige el triunfo`),
    reparte: (quien: string) => (quien === 'Tú' ? 'Repartes tú' : `Reparte ${quien}`),
    multiplicador: (n: number) => `×${n}`,
    eligeTitulo: 'Elige el triunfo',
    butifarra: 'Butifarra',
    delegar: 'Delegar',
    contros: ['Contro', 'Recontro', 'Sant Vicenç'] as readonly string[],
    paso: 'Paso',
    /** Lo que anuncia un jugador. `quien` es «Tú» para el propio. */
    eligio: (quien: string, triunfo: string | null) =>
      triunfo === null
        ? quien === 'Tú'
          ? 'Juegas butifarra'
          : `${quien} juega butifarra`
        : quien === 'Tú'
          ? `Eliges ${triunfo}`
          : `${quien} elige ${triunfo}`,
    delego: (quien: string) => (quien === 'Tú' ? 'Delegas en tu compañero' : `${quien} delega`),
    dijo: (quien: string, contro: string) =>
      quien === 'Tú' ? `Dices ${contro.toLowerCase()}` : `${quien}: «${contro}»`,
    paso_: (quien: string) => (quien === 'Tú' ? 'Pasas' : `${quien} pasa`),
    finMano: (n: number) => (n === 1 ? 'Fin de la primera mano' : `Fin de la mano ${n}`),
    concepto: 'Concepto',
    cartas: 'Puntos de cartas',
    bazas: 'Bazas',
    totalMano: 'Total de la mano',
    anotados: 'Se anota',
    totalPartida: 'Total de la partida',
    empate36: 'Empate a 36: nadie se anota.',
    siguienteMano: 'Siguiente mano',
  },

  mus: {
    nosotros: 'Tu pareja',
    ellos: 'Rivales',
    /** Las parejas dentro de una frase. */
    nosotrosEn: 'tu pareja',
    ellosEn: 'los rivales',
    marcador: (nuestras: number, suyas: number, puntos: number) =>
      `${nuestras} – ${suyas} (a ${puntos})`,
    juegos: (nuestros: number, suyos: number) => `Juegos ${nuestros} – ${suyos}`,
    mano: 'Mano',
    lances: { grande: 'Grande', chica: 'Chica', pares: 'Pares', juego: 'Juego', punto: 'Punto' },
    faseMus: '¿Mus o se corta?',
    faseDescarte: 'Descartes',
    pideMus: 'Mus',
    corta: 'Corta',
    descarta: (n: number) => `Descarta ${n}`,
    paso: 'Paso',
    envida: (n: number) => `Envida ${n}`,
    sube: (n: number) => `Sube ${n}`,
    ordago: '¡Órdago!',
    quiero: 'Quiero',
    noQuiero: 'No quiero',
    botonMus: 'Mus',
    botonCortar: 'Corto',
    botonDescartar: (n: number) => (n === 0 ? 'Elige cartas' : `Descartar ${n}`),
    eligeDescarte: 'Toca las cartas que quieres cambiar',
    botonEnvidar: (n: number) => `Envido ${n}`,
    botonSubir: (n: number) => `Subo ${n}`,
    botonOrdago: 'Órdago',
    botonPaso: 'Paso',
    estadoLance: {
      paso: 'En paso',
      querido: (n: number) => `${n} queridas`,
      noQuerido: (n: number, quien: string) => `No quiso: ${n} para ${quien}`,
      ordago: 'Órdago querido',
      sinApuesta: (quien: string) => `Solo ${quien}`,
      noSeJuega: 'Nadie tiene',
    },
    envite: (quien: string, n: number) => `Envite de ${quien}: ${n}`,
    enviteOrdago: (quien: string) => `Órdago de ${quien}`,
    tienen: (quienes: string) => `Tienen: ${quienes}`,
    nadie: 'nadie',
    dice: (quien: string, que: string) => (quien === 'Tú' ? `Dices: ${que}` : `${quien}: ${que}`),
    conteo: (n: number) => `Conteo de la mano ${n}`,
    porOrdago: (lance: string) => `La mano terminó con un órdago a ${lance}.`,
    lance: 'Lance',
    gana: 'Gana',
    ganaJuego: (quien: string) =>
      quien === 'Tu pareja' ? '¡Tu pareja gana el juego!' : 'Los rivales ganan el juego',
    siguienteMano: 'Siguiente mano',
    total: 'Total',
    clasificacion: 'Juegos ganados',
  },

  pocha: {
    rivalN: (n: number) => `Rival ${n}`,
    mano: (n: number, total: number, cartas: number) =>
      `Mano ${n} de ${total} · ${cartas === 1 ? '1 carta' : `${cartas} cartas`}`,
    detalle: (apuesta: number | null, bazas: number, puntos: number) =>
      apuesta === null ? `${puntos} pts` : `apuesta ${apuesta} · bazas ${bazas} · ${puntos} pts`,
    apuestaTitulo: '¿Cuántas bazas harás?',
    apostar: (n: number) => (n === 1 ? '1 baza' : `${n} bazas`),
    noPuedes: (n: number) => `Repartes tú: no puedes apostar ${n}`,
    apuesta: (quien: string, n: number) => {
      const bazas = n === 1 ? '1 baza' : `${n} bazas`;
      return quien === 'Tú' ? `Apuestas ${bazas}` : `${quien} apuesta ${bazas}`;
    },
    apostando: 'Apuestas',
    sumaApuestas: (suma: number, cartas: number) => `Apostadas ${suma} de ${cartas}`,
    reparte: 'reparte',
    finMano: (n: number, total: number) => `Fin de la mano ${n} de ${total}`,
    jugador: 'Jugador',
    apuestaCol: 'Apuesta',
    bazasCol: 'Bazas',
    puntosCol: 'Mano',
    totalCol: 'Total',
    acierto: 'Acierta',
    fallo: 'Falla',
    puntos: (n: number) => (n > 0 ? `+${n}` : `${n}`),
    siguienteMano: 'Siguiente mano',
    clasificacion: 'Puntos',
    ejemplo: 'Apuesta / bazas hechas → puntos',
  },

  corazones: {
    rivalN: (n: number) => `Rival ${n}`,
    detalle: (mano: number, total: number) => `${mano} pts · total ${total}`,
    mano: (n: number) => `Mano ${n}`,
    pasasA: (quien: string) => `Pasas a ${quien}`,
    sinPase: 'Sin pase',
    rotos: 'Corazones rotos',
    elige: (quien: string) => `Elige 3 cartas para pasar a ${quien}`,
    pasar: (n: number, quien: string) => (n === 3 ? `Pasar a ${quien}` : `Elige ${3 - n} más`),
    esperando: 'Esperando a que pasen los demás…',
    recibes: (quien: string) => `Recibes de ${quien}:`,
    finMano: (n: number) => `Fin de la mano ${n}`,
    jugador: 'Jugador',
    puntosMano: 'Mano',
    total: 'Total',
    luna: (quien: string) =>
      quien === 'Tú'
        ? '¡Has tirado la luna! Los demás suman 26.'
        : `${quien} ha tirado la luna: los demás suman 26.`,
    finPartida: (n: number) => `La partida termina al llegar a ${n} puntos.`,
    siguienteMano: 'Siguiente mano',
    clasificacion: 'Puntos (menos es mejor)',
  },

  red: {
    titulo: 'Jugar en red',
    nombre: 'Tu nombre',
    servidor: 'Servidor',
    servidorDesc: 'La dirección del servidor de salas (por ejemplo ws://192.168.1.20:8787).',
    crear: 'Crear sala',
    crearDesc: 'Elige el juego y sus opciones; los demás entrarán con el código.',
    unirse: 'Unirse',
    codigo: 'Código de la sala',
    entrar: 'Entrar',
    elegirJuego: 'Elige el juego',
    volver: '← Volver',
    conectando: 'Conectando…',
    reconectando: 'Se ha perdido la conexión. Reconectando…',
    sinConexion: 'No se puede conectar con el servidor',
    faltaNombre: 'Escribe tu nombre (de 1 a 20 caracteres)',
    faltaCodigo: 'Escribe el código de 5 letras',
    sala: (codigo: string) => `Sala ${codigo}`,
    copiar: 'Copiar código',
    copiado: 'Copiado',
    asiento: (n: number) => `Asiento ${n + 1}`,
    libre: 'IA',
    tu: 'tú',
    anfitrion: 'anfitrión',
    pareja: (n: number) => `Pareja ${n + 1}`,
    sentarse: 'Sentarse aquí',
    empezar: 'Empezar',
    esperandoAnfitrion: 'Esperando a que el anfitrión empiece la partida…',
    libresIA: 'Los asientos libres los jugará la IA.',
    nivel: (nivel: string) => `IA: ${nivel}`,
    conectado: 'conectado',
    desconectado: 'desconectado',
    relevado: 'juega la IA',
    ia: 'IA',
    revancha: 'Revancha',
    esperandoRevancha: 'Esperando a que el anfitrión pida la revancha…',
    salir: 'Salir de la sala',
  },

  pinacle: {
    mazo: 'Mazo',
    monton: 'Montón',
    robarMazo: 'Robar del mazo',
    llevarseMonton: (carta: string, n: number) =>
      `Llevarse el montón (${n === 1 ? '1 carta' : `${n} cartas`}, arriba ${carta})`,
    montonVacio: 'Montón vacío',
    verMonton: (n: number) => `Ver el montón (${n})`,
    montonTitulo: 'Cartas del montón',
    cerrarPanel: 'Cerrar',
    noMonton: 'No puedes llevarte el montón: no podrías bajar su carta de arriba.',
    faseRobar: 'Roba del mazo o llévate el montón',
    faseBajar: 'Elige cartas para bajar, o una para descartar',
    debeBajar: (carta: string) => `Lo primero que bajes tiene que llevar ${carta}`,
    bajar: 'Bajar',
    descartar: 'Descartar',
    limpiar: 'Quitar selección',
    eligeForma: '¿Cómo quieres bajarlas?',
    noEncaja: 'Esas cartas no encajan en esa combinación.',
    eligeExtremo: '¿A qué extremo pasa el comodín?',
    abajo: 'Abajo',
    arriba: 'Arriba',
    cancelar: 'Cancelar',
    grupoDe: (numero: string, n: number) => `Grupo de ${numero} (${n} cartas)`,
    escaleraDe: (desde: string, hasta: string, palo: string) =>
      `Escalera de ${palo} del ${desde} al ${hasta}`,
    ordenar: 'Ordenar',
    porPalo: 'Por palo',
    porNumero: 'Por número',
    propias: (parejas: boolean) => (parejas ? 'Vuestras combinaciones' : 'Tus combinaciones'),
    ajenas: (parejas: boolean) => (parejas ? 'Combinaciones rivales' : 'Combinaciones del rival'),
    sinCombinaciones: 'Ninguna todavía',
    conocidas: 'Se llevó del montón:',
    barbele: 'Barbelé',
    barbeleDesc: 'Su primera bajada de la mano tiene que sumar 70 o más.',
    avisoBarbele: (puntos: number) =>
      `Estás en barbelé y tu bajada suma ${puntos}: si descartas ahora, las cartas vuelven a tu mano y perdéis 50 puntos.`,
    descartarIgual: 'Descartar igualmente',
    seguirBajando: 'Seguir bajando',
    objetivo: 'a 1500',
    puntos: (n: number) => `${n} puntos`,
    mano: (n: number) => `Mano ${n}`,
    cartas: (n: number) => (n === 1 ? '1 carta' : `${n} cartas`),
    roba: (quien: string) => `${quien} roba del mazo`,
    seLleva: (quien: string) => `${quien} se lleva el montón`,
    baja: (quien: string) => `${quien} baja una combinación`,
    anade: (quien: string) => `${quien} añade una carta`,
    cambia: (quien: string) => `${quien} cambia un comodín`,
    descarta: (quien: string, carta: string) => `${quien} descarta ${carta}`,
    finMano: (n: number) => `Fin de la mano ${n}`,
    cierra: (quien: string) => (quien === 'Tú' ? 'Has cerrado tú' : `Ha cerrado ${quien}`),
    mazoAgotado: 'Se acabó el mazo: nadie cierra',
    enMesa: 'En la mesa',
    premioCerrar: 'Por cerrar',
    premioSinComodin: 'Cerrar sin comodín',
    premioDeGolpe: 'Cerrar de golpe',
    premioCambios: 'Cambios de comodín',
    enMano: 'Cartas en la mano',
    penalizacion: 'Barbelé',
    totalMano: 'Total de la mano',
    acumulado: 'Acumulado',
    siguienteMano: 'Siguiente mano',
    premios: {
      'pinacle-golpe': 'Pinacle de golpe',
      pinacle: 'Pinacle',
      'ocho-limpias': '8 limpias',
      'siete-limpias': '7 limpias',
      'seis-limpias': '6 limpias',
      'ocho-iguales': '8 iguales',
      'seis-con-comodin': '6 con un comodín',
      'escalera-limpia': 'Escalera limpia',
      'escalera-un-comodin': 'Escalera con un comodín',
      'escalera-dos-comodines': 'Escalera con dos comodines',
      'escalera-sucia': 'Escalera sucia',
    } as Record<string, string>,
    clasificacion: 'Puntos',
  },

  burro: {
    palabra: 'BURRO',
    /** Las letras que lleva, con puntos en las que faltan: 2 → «BU···». */
    letras: (n: number) => [...'BURRO'].map((l, i) => (i < n ? l : '·')).join(''),
    letrasDe: (n: number) => (n === 0 ? 'sin letras' : n === 1 ? '1 letra' : `${n} letras`),
    mano: (n: number) => `Mano ${n}`,
    pasasA: (quien: string) => `Pasas a ${quien}`,
    eligeCarta: (quien: string) => `Toca una carta para pasársela a ${quien}`,
    esperando: 'Esperando a los demás…',
    mePlanto: '¡Me planto!',
    plantado: 'Plantado',
    teHasPlantado: 'Te has plantado: espera a los demás',
    recibida: 'Recibida',
    finMano: (n: number) => `Fin de la mano ${n}`,
    nula: 'Mano nula: nadie se plantó en 50 intercambios. No hay letras.',
    primero: (quien: string) =>
      quien === 'Tú' ? 'Te plantaste el primero con:' : `${quien} se plantó el primero con:`,
    orden: 'Orden en que se plantaron',
    llevaLetra: (quien: string) =>
      quien === 'Tú' ? 'Eres el último: llevas letra' : `${quien} es el último y lleva letra`,
    letrasCol: 'Letras',
    siguienteMano: 'Siguiente mano',
    librado: '¡Te has librado!',
    eresBurro: '¡Eres el burro!',
    esBurro: (quien: string) => `${quien} es el burro.`,
  },

  cinquillo: {
    mesa: 'Mesa',
    paso: 'Paso',
    cartas: (n: number) => (n === 1 ? '1 carta' : `${n} cartas`),
    puntos: (n: number) => (n === 1 ? '1 punto' : `${n} puntos`),
    juega: (quien: string, carta: string) =>
      quien === 'Tú' ? `Juegas ${carta}` : `${quien} juega ${carta}`,
    pasa: (quien: string) => (quien === 'Tú' ? 'Pasas' : `${quien} pasa`),
    tuTurno: 'Tu turno: juega una carta',
    sinJugada: 'No tienes jugada: pasa',
    salidaOros: 'Sale el 5 de oros',
    finMano: (n: number) => `Fin de la mano ${n}`,
    ganaMano: (quien: string) =>
      quien === 'Tú' ? '¡Te has quedado sin cartas!' : `Gana la mano: ${quien}`,
    quedan: 'Le quedan',
    totalPartida: 'Total',
    siguienteMano: 'Siguiente mano',
    clasificacion: 'Puntos (menos es mejor)',
  },

  sieteYMedia: {
    banca: 'Banca',
    fichas: (n: number) => (n === 1 ? '1 ficha' : `${n} fichas`),
    apuesta: (n: number) => `apuesta ${n}`,
    valor: (medios: number) => formatoValor(medios),
    tuApuesta: 'Tu apuesta',
    menos: 'Menos',
    mas: 'Más',
    apostar: (n: number) => `Apostar ${n}`,
    pedir: 'Pedir carta',
    plantarse: 'Plantarse',
    faseApostar: 'Haz tu apuesta',
    faseJugar: 'Pide carta o plántate',
    eresBanca: 'Eres la banca: juegas la última',
    esperaApuestas: 'Los puntos están apostando',
    apuesta1: (quien: string, n: number) =>
      quien === 'Tú' ? `Apuestas ${n}` : `${quien} apuesta ${n}`,
    pide: (quien: string) => (quien === 'Tú' ? 'Pides carta' : `${quien} pide carta`),
    planta: (quien: string) => (quien === 'Tú' ? 'Te plantas' : `${quien} se planta`),
    sePasa: (quien: string) => (quien === 'Tú' ? '¡Te has pasado!' : `${quien} se pasa`),
    pasado: 'Pasado',
    plantado: 'Plantado',
    finMano: (n: number) => `Fin de la mano ${n}`,
    bancaEs: (quien: string) => (quien === 'Tú' ? 'Tú eras la banca' : `Banca: ${quien}`),
    variacion: (n: number) => (n > 0 ? `+${n}` : `${n}`),
    siguienteMano: 'Siguiente mano',
    clasificacion: 'Fichas finales',
    mazo: (n: number) => (n === 1 ? '1 carta' : `${n} cartas`),
  },

  estadisticas: {
    titulo: 'Estadísticas',
    vacio: 'Aún no has terminado ninguna partida. ¡Juega una y aquí verás cómo te va!',
    total: (jugadas: number, ganadas: number, porcentaje: number) =>
      `${jugadas} ${jugadas === 1 ? 'partida terminada' : 'partidas terminadas'}, ${ganadas} ${ganadas === 1 ? 'ganada' : 'ganadas'} (${porcentaje} %)`,
    jugadas: 'Jugadas',
    ganadas: 'Ganadas',
    empatadas: 'Empatadas',
    perdidas: 'Perdidas',
    victorias: 'Victorias',
    racha: 'Racha',
    mejorRacha: 'Mejor racha',
    mejorTiempo: 'Mejor tiempo',
    menosMovimientos: 'Menos movimientos',
    borrar: 'Borrar estadísticas',
    confirmarBorrar: '¿Seguro que quieres borrar todas las estadísticas? No se puede deshacer.',
    rachaEnCurso: (n: number) => `Llevas ${n} victorias seguidas`,
    nuevaMejorRacha: '¡Tu mejor racha!',
    recordTiempo: '¡Nuevo récord de tiempo!',
    recordMovimientos: '¡Nuevo récord de movimientos!',
  },

  fin: {
    victoria: '¡Has ganado!',
    derrota: 'Has perdido',
    empate: 'Empate',
    abandono: 'Partida abandonada',
    solitarioGanado: '¡Solitario completado!',
    puntos: 'Puntos',
    manos: 'Manos ganadas',
    revancha: 'Jugar otra vez',
    menu: 'Volver al menú',
    resumenKlondike: (movs: number, tiempo: string) => `${movs} movimientos en ${tiempo}`,
    resumenSpider: (escaleras: number, movs: number, tiempo: string) =>
      `${escaleras} de 8 escaleras, ${movs} movimientos en ${tiempo}`,
    resumenFreeCell: (numero: number, movs: number, tiempo: string) =>
      `Partida nº ${numero}: ${movs} movimientos en ${tiempo}`,
    porTute: (quien: string) =>
      quien === 'Tú' ? 'La mano terminó con tu tute.' : `La mano terminó con el tute de ${quien}.`,
    detallePuntos: 'Incluye los cantes y los 10 de últimas.',
    manosJugadas: (n: number) =>
      n === 1 ? 'Partida resuelta en una mano.' : `Partida resuelta en ${n} manos (de vueltas).`,
  },

  cartas: {
    figurasEspanolas: { 10: 'Sota', 11: 'Caballo', 12: 'Rey' } as Record<number, string>,
    figurasFrancesas: { 1: 'As', 11: 'Jota', 12: 'Reina', 13: 'Rey' } as Record<number, string>,
    as: 'As',
    comodin: 'Comodín',
    palos: {
      oros: 'oros',
      copas: 'copas',
      espadas: 'espadas',
      bastos: 'bastos',
      picas: 'picas',
      corazones: 'corazones',
      diamantes: 'diamantes',
      treboles: 'tréboles',
    } as Record<string, string>,
    nombre: (valor: string, palo: string) => `${valor} de ${palo}`,
    dorso: 'Carta boca abajo',
    muestrario: 'Todas las cartas',
    barajaEspanola: 'Baraja española',
    barajaFrancesa: 'Baraja francesa',
    dorsos: 'Dorsos',
  },

  dorsos: { azul: 'Azul', rojo: 'Rojo', verde: 'Verde' } as Record<string, string>,

  /** Guía para quien no ha jugado nunca. */
  ayuda: {
    boton: '¿Cómo se juega?',
    botonCorto: 'Cómo se juega',
    cerrar: 'Entendido',
    titulo: {
      klondike: 'Cómo se juega al Klondike',
      brisca: 'Cómo se juega a la Brisca',
      tute: 'Cómo se juega al Tute',
      escoba: 'Cómo se juega a la Escoba',
      chinchon: 'Cómo se juega al Chinchón',
      guinote: 'Cómo se juega al Guiñote',
      sieteYMedia: 'Cómo se juega a la Siete y media',
      freecell: 'Cómo se juega al FreeCell',
      cinquillo: 'Cómo se juega al Cinquillo',
      spider: 'Cómo se juega al Spider',
      corazones: 'Cómo se juega a los Corazones',
      pocha: 'Cómo se juega a la Pocha',
      mus: 'Cómo se juega al Mus',
      burro: 'Cómo se juega al Burro',
      pinacle: 'Cómo se juega al Pinacle',
      butifarra: 'Cómo se juega a la Butifarra',
      truc: 'Cómo se juega al Truc',
      julepe: 'Cómo se juega al Julepe',
      tuteSubastado: 'Cómo se juega al Tute subastado',
      remigio: 'Cómo se juega al Remigio',
      red: 'Cómo se juega en red',
    },
    puntos: (n: number) => (n === 1 ? '1 punto' : `${n} puntos`),
    envitEjemplo: '7 y 6 de copas: 20 + 7 + 6 = 33 de envit (el Rey no cuenta).',

    klondike: [
      {
        titulo: 'El objetivo',
        texto: [
          'Es un solitario: juegas tú solo. Ganas cuando consigues llevar las 52 cartas a las 4 pilas de arriba a la derecha, llamadas fundaciones.',
          'Cada fundación es de un solo palo (♠ ♥ ♦ ♣) y se llena en orden, empezando por el As: As, 2, 3… hasta la J, la Q y el K (Rey).',
        ],
      },
      {
        titulo: 'Las columnas',
        texto: [
          'Abajo hay 7 columnas. Puedes poner una carta sobre otra que valga uno más y sea del color contrario: un 6 rojo sobre un 7 negro, una Q negra sobre un K rojo…',
        ],
        ejemplo: 'escalera',
      },
      {
        titulo: '',
        texto: [
          'También puedes mover un grupo de cartas boca arriba si ya está bien ordenado.',
          'Cuando quitas la última carta descubierta de una columna, la de debajo se da la vuelta sola.',
          'En una columna vacía solo se puede poner un Rey (K), o un grupo que empiece por Rey.',
        ],
      },
      {
        titulo: 'El mazo',
        texto: [
          'Arriba a la izquierda está el mazo. Tócalo para sacar cartas: la de encima del descarte se puede jugar como cualquier otra.',
          'Cuando el mazo se acaba, tócalo otra vez para volver a usar las cartas del descarte.',
        ],
      },
      {
        titulo: 'Cómo mover las cartas',
        texto: [
          'Arrastra la carta hasta donde quieras ponerla, o tócala y luego toca el destino. Los sitios válidos se iluminan en amarillo.',
          'Con un doble toque, la carta va sola a su sitio (normalmente, a una fundación).',
          'Si te equivocas, usa Deshacer. Cuando todas las cartas están boca arriba aparece Autocompletar, que termina la partida por ti.',
        ],
      },
      {
        titulo: 'Consejo',
        texto: [
          'Intenta primero descubrir las cartas boca abajo de las columnas más largas: ahí suelen estar las que necesitas.',
        ],
      },
    ],

    brisca: [
      {
        titulo: 'El objetivo',
        texto: [
          'Juegas contra la máquina con la baraja española de 40 cartas, que tiene 4 palos: oros, copas, espadas y bastos.',
          'En total hay 120 puntos en la baraja. Ganas si al final has conseguido más de 60.',
        ],
      },
      {
        titulo: 'Lo que vale cada carta',
        texto: [
          'Solo cinco cartas dan puntos. Están ordenadas de la más fuerte a la más débil: el As, el Tres, el Rey (12), el Caballo (11) y la Sota (10). Las demás (7, 6, 5, 4 y 2) no valen puntos, y el 2 es la más débil.',
        ],
        ejemplo: 'valores',
      },
      {
        titulo: 'El triunfo',
        texto: [
          'Al empezar se pone una carta boca arriba debajo del mazo: es la muestra, y su palo es el triunfo. Una carta de triunfo, aunque sea un 2, gana a cualquier carta de otro palo.',
        ],
      },
      {
        titulo: 'Cómo se juega una baza',
        texto: [
          'Cada jugador tiene 3 cartas. Por turnos, cada uno pone una carta en la mesa: eso es una baza. Puedes jugar la carta que quieras, no hace falta seguir el palo.',
          'Gana la baza el triunfo más alto. Si nadie ha echado triunfo, gana la carta más fuerte del palo que salió primero; las cartas de otros palos no ganan.',
          'Quien gana se lleva las cartas de la baza con sus puntos, roba primero del mazo y sale en la siguiente baza. Cuando el mazo se acaba, se juegan las cartas que quedan en la mano.',
        ],
      },
      {
        titulo: 'Cambiar la muestra',
        texto: [
          'Si tienes el 7 del palo de triunfo, en tu turno puedes cambiarlo por la muestra (si la muestra es baja, se cambia con el 2). Cuando puedas, aparecerá un botón.',
        ],
      },
      {
        titulo: 'Cómo jugar una carta',
        texto: [
          'Arrastra la carta a la mesa, o tócala y toca la mesa. Con un doble toque también se juega.',
        ],
      },
      {
        titulo: 'Con 4 jugadores',
        texto: [
          'Se juega en parejas: tu compañero es el que está sentado enfrente, y vuestros puntos se suman.',
        ],
      },
      {
        titulo: 'Consejos',
        texto: [
          'No gastes un triunfo en una baza que no tiene puntos.',
          'Si no puedes ganar una baza, echa una carta que no valga nada.',
          'Guarda los Ases y los Treses: son los que dan casi todos los puntos.',
        ],
      },
    ],

    tute: [
      {
        titulo: 'El objetivo',
        texto: [
          'Se juega con la baraja española de 40 cartas (oros, copas, espadas y bastos), contra la máquina: con 2 jugadores, o con 4 en parejas.',
          'Gana la mano quien suma más puntos al final, contando las bazas que gana, los cantes y los 10 de últimas.',
        ],
      },
      {
        titulo: 'Lo que vale cada carta',
        texto: [
          'Igual que en la Brisca: de la más fuerte a la más débil, el As, el Tres, el Rey (12), el Caballo (11) y la Sota (10) dan puntos; el 7, 6, 5, 4 y 2 no valen nada. Quien gana la última baza suma 10 puntos más (los «10 de últimas»).',
        ],
        ejemplo: 'valores',
      },
      {
        titulo: 'El triunfo',
        texto: [
          'Con 2 jugadores, cada uno recibe 8 cartas y la siguiente se pone boca arriba debajo del mazo: es la muestra, y su palo es el triunfo.',
          'Con 4 jugadores se reparten todas las cartas (10 a cada uno); la última, que le toca al que reparte, marca el triunfo y todos la ven hasta que la juega.',
          'Una carta de triunfo, aunque sea un 2, gana a cualquier carta de otro palo.',
        ],
      },
      {
        titulo: 'Cómo se juega una baza',
        texto: [
          'Por turnos, cada jugador pone una carta en la mesa. Gana el triunfo más alto o, si nadie echó triunfo, la carta más fuerte del palo que salió primero. Quien gana se lleva la baza y sale en la siguiente.',
          'Con 2 jugadores, después de cada baza se roba del mazo (primero el que ganó) hasta que se acaba.',
        ],
      },
      {
        titulo: 'Las obligaciones',
        texto: [
          'Con 4 jugadores desde el principio, y con 2 en cuanto se acaba el mazo, hay que seguir el palo que salió y ganar la baza si se puede. Si no tienes ese palo, tienes que echar triunfo, y superar el triunfo que haya en la mesa si puedes.',
          'Con 4 jugadores, si la baza ya es de tu compañero no hace falta superarla (salvo que actives esa opción).',
          'No te preocupes: la mesa solo te deja jugar las cartas permitidas.',
        ],
      },
      {
        titulo: 'Los cantes',
        texto: [
          'Si tienes el Rey y el Caballo del mismo palo, puedes cantarlos justo después de ganar una baza, antes de salir: valen 20 puntos, o 40 si son del palo de triunfo (las «cuarenta»).',
          'Solo se canta una vez por cada baza ganada, y cada palo una vez por mano. Cuando puedas cantar, aparecerá un botón.',
        ],
        ejemplo: 'cante',
      },
      {
        titulo: 'El tute',
        texto: [
          'Si juntas los 4 Reyes o los 4 Caballos, cántalo tras ganar una baza: es el tute, y ganas la mano en el acto.',
        ],
      },
      {
        titulo: 'Cambiar la muestra',
        texto: [
          'Con 2 jugadores, si tienes el 7 de triunfo puedes cambiarlo por la muestra (por defecto, después de haber ganado alguna baza).',
        ],
      },
      {
        titulo: 'Cómo jugar una carta',
        texto: [
          'Arrastra la carta a la mesa, o tócala y toca la mesa. Con un doble toque también se juega.',
        ],
      },
      {
        titulo: 'Consejos',
        texto: [
          'No juegues el Rey ni el Caballo de una pareja que todavía puedes cantar.',
          'Ganar bazas no solo da puntos: también te da la oportunidad de cantar.',
          'Si no puedes ganar una baza, echa una carta que no valga nada.',
        ],
      },
    ],

    escoba: [
      {
        titulo: 'El objetivo',
        texto: [
          'Se juega con la baraja española de 40 cartas, contra la máquina: con 2 jugadores, o con 4 en parejas.',
          'Al jugar una carta, intentas recoger cartas de la mesa que, junto con la tuya, sumen exactamente 15. Al final de cada mano se reparten puntos, y gana quien llega primero a los puntos de la partida (21 por defecto).',
        ],
      },
      {
        titulo: 'Lo que vale cada carta para sumar',
        texto: [
          'El As vale 1, del 2 al 7 lo que dice su número, la Sota 8, el Caballo 9 y el Rey 10.',
        ],
        ejemplo: 'sumas',
      },
      {
        titulo: 'Cómo se juega',
        texto: [
          'Cada jugador recibe 3 cartas y se ponen 4 boca arriba en la mesa. Por turnos, cada uno juega una carta de su mano.',
          'Si tu carta suma 15 con una o varias cartas de la mesa, te las llevas junto con la tuya. Si no puedes (o no quieres) recoger, tu carta se queda en la mesa.',
          'Cuando todos se quedan sin cartas, se reparten 3 más, hasta que se acaba el mazo.',
        ],
        ejemplo: 'captura',
      },
      {
        titulo: 'La escoba',
        texto: [
          'Si al recoger dejas la mesa vacía, haces escoba: vale 1 punto.',
          'Al final de la mano, las cartas que queden en la mesa se las lleva el último que recogió (eso no es escoba).',
        ],
      },
      {
        titulo: 'Los puntos de cada mano',
        texto: [
          '1 punto por cada escoba, 1 para quien tenga más cartas, 1 para quien tenga más oros, 1 para quien tenga el 7 de oros y 1 para quien tenga más sietes. Si hay empate en cartas, oros o sietes, ese punto no es para nadie.',
        ],
      },
      {
        titulo: 'Cómo jugar una carta',
        texto: [
          'Toca una carta de tu mano: se iluminan las cartas de la mesa que puedes recoger con ella. Toca las que quieras llevarte (verás la suma) y pulsa Recoger, o pulsa Dejar en la mesa.',
          'También puedes arrastrar la carta a la mesa o tocarla dos veces: si hay varias formas de recoger, te preguntará cuál prefieres.',
        ],
      },
      {
        titulo: 'Consejos',
        texto: [
          'Cuida el 7 de oros y los sietes: dan puntos por sí solos.',
          'Si no recoges, intenta no dejar en la mesa una suma entre 5 y 14: al rival le bastaría una carta para hacer escoba.',
        ],
      },
    ],

    chinchon: [
      {
        titulo: 'El objetivo',
        texto: [
          'Se juega con la baraja española, contra la máquina, de 2 a 4 jugadores, cada uno por su cuenta.',
          'Intentas ligar tus 7 cartas en combinaciones para cerrar la mano antes que los demás. Las cartas que te queden sin ligar suman puntos en tu contra: quien pasa de 100 queda eliminado, y gana el último que queda.',
        ],
      },
      {
        titulo: 'Las combinaciones',
        texto: [
          'Escalera: 3 o más cartas seguidas del mismo palo (en la baraja de 40, después del 7 va la Sota). Trío o cuarteto: 3 o 4 cartas del mismo número.',
          'El comodín sustituye a cualquier carta, pero cada combinación puede llevar uno como mucho.',
        ],
        ejemplo: 'escaleraEspanola',
      },
      {
        titulo: '',
        texto: [],
        ejemplo: 'trioComodin',
      },
      {
        titulo: 'Cómo se juega un turno',
        texto: [
          'Primero robas una carta: la de arriba del mazo (boca abajo) o la de arriba del descarte (boca arriba). Después descartas una carta, para volver a tener 7.',
          'Si robas del descarte, no puedes devolver esa misma carta en el mismo turno.',
        ],
      },
      {
        titulo: 'Cerrar',
        texto: [
          'En vez de solo descartar, puedes cerrar si, tras el descarte, todas tus cartas quedan ligadas o te queda solo una suelta pequeña (de 3 o menos, por defecto). Al cerrar termina la mano.',
          'Si cierras con todo ligado, te restas 10 puntos. Si cierras con las 7 cartas en escalera del mismo palo y sin comodín, haces chinchón y ganas la partida.',
        ],
      },
      {
        titulo: 'Los puntos',
        texto: [
          'Al cerrar alguien, el resto suma lo que valen sus cartas sin ligar: el As 1, del 2 al 9 su número, las figuras 10 y el comodín 25. La mesa agrupa tus cartas de la mejor forma posible: no tienes que declarar nada.',
        ],
      },
      {
        titulo: 'En la mesa',
        texto: [
          'Toca el mazo o el descarte para robar (o arrastra la carta a tu mano). Para descartar, arrastra una carta al descarte, tócala dos veces, o elígela y pulsa Descartar o Cerrar.',
          'Tus combinaciones se marcan con colores y verás cuántos puntos te quedan sin ligar. Con «Ordenar» puedes agrupar la mano por combinaciones, por palo o por valor.',
        ],
      },
      {
        titulo: 'Consejos',
        texto: [
          'Deshazte pronto de las figuras sueltas: son las que más puntos suman.',
          'Fíjate en lo que descartan los rivales: te dice qué cartas no necesitan.',
        ],
      },
    ],

    guinote: [
      {
        titulo: 'El objetivo',
        texto: [
          'Se juega con la baraja española de 40 cartas contra la máquina: con 2 jugadores, o con 4 en parejas (tu compañero es el de enfrente y vuestros puntos se suman).',
          'Gana la partida el primero que llega a 101 puntos. Si al acabar una mano nadie llega, se juega otra «de vueltas» y los puntos se siguen sumando.',
        ],
      },
      {
        titulo: 'Lo que vale cada carta',
        texto: [
          'De la más fuerte a la más débil: el As, el Tres, el Rey (12), la Sota (10) y el Caballo (11) dan puntos; el 7, 6, 5, 4 y 2 no valen nada. Ojo: a diferencia del Tute, la Sota gana al Caballo.',
          'Quien gana la última baza suma 10 puntos más (los «10 de últimas»). En total, cada mano reparte 130 puntos más los cantes.',
        ],
        ejemplo: 'valoresGuinote',
      },
      {
        titulo: 'El triunfo',
        texto: [
          'Cada jugador recibe 6 cartas y la siguiente se pone boca arriba debajo del mazo: es la muestra, y su palo es el triunfo. Una carta de triunfo, aunque sea un 2, gana a cualquier carta de otro palo.',
        ],
      },
      {
        titulo: 'Cómo se juega una baza',
        texto: [
          'Por turnos, cada jugador pone una carta en la mesa. Gana el triunfo más alto o, si nadie echó triunfo, la carta más fuerte del palo que salió primero. Quien gana se lleva la baza y sale en la siguiente.',
          'Después de cada baza se roba del mazo, primero el que ganó. Mientras queda mazo puedes echar la carta que quieras.',
        ],
      },
      {
        titulo: 'El arrastre',
        texto: [
          'Cuando se acaba el mazo empieza el arrastre: hay que seguir el palo que salió y ganar la baza si se puede. Si no tienes ese palo, tienes que echar triunfo, y superar el triunfo que haya en la mesa si puedes.',
          'Con 4 jugadores, si la baza ya es de tu compañero no hace falta superarla (salvo que actives esa opción). La mesa solo te deja jugar las cartas permitidas.',
        ],
      },
      {
        titulo: 'Los cantes',
        texto: [
          'Si tienes el Rey y la Sota del mismo palo, puedes cantarlos justo después de ganar una baza, antes de salir: valen 20 puntos, o 40 si son del palo de triunfo (las «cuarenta»).',
          'Solo se canta mientras queda mazo, una vez por cada baza ganada y cada palo una vez por mano. Cuando puedas cantar, aparecerá un botón.',
        ],
        ejemplo: 'canteGuinote',
      },
      {
        titulo: 'Cambiar la muestra',
        texto: [
          'Si tienes el 7 de triunfo puedes cambiarlo por la muestra mientras queda mazo (por defecto, después de que tu bando haya ganado alguna baza). Si la muestra es un 7 o menos, se cambia con el 2.',
        ],
      },
      {
        titulo: 'Cómo jugar una carta',
        texto: [
          'Arrastra la carta a la mesa, o tócala y toca la mesa. Con un doble toque también se juega.',
        ],
      },
      {
        titulo: 'Consejos',
        texto: [
          'No gastes un triunfo en una baza que no tiene puntos.',
          'Guarda el Rey y la Sota de un palo hasta que puedas cantarlos.',
          'En el arrastre cuenta los triunfos que han salido: el que tenga el último manda.',
        ],
      },
    ],

    remigio: [
      {
        titulo: 'El objetivo',
        texto: [
          'Se juega con dos barajas españolas de 40 cartas y 4 comodines, de 2 a 5 jugadores. Cada uno recibe 7 cartas. Gana la mano quien se queda antes sin cartas, bajándolas a la mesa en combinaciones.',
          'Los demás suman los puntos de las cartas que les quedan: cada número lo que vale, las figuras 10 y el comodín 25. Quien pasa de 100 queda eliminado, y gana la partida el último que queda.',
        ],
      },
      {
        titulo: 'Las combinaciones',
        texto: [
          'Escalera: 3 o más cartas seguidas del mismo palo. El orden es As, 2, 3, 4, 5, 6, 7, Sota, Caballo y Rey: el 7 y la Sota van seguidos, y el As solo puede ir abajo.',
        ],
        ejemplo: 'escaleraRemigio',
      },
      {
        titulo: '',
        texto: [
          'Grupo: 3 o 4 cartas del mismo número, todas de palos distintos.',
          'El comodín sustituye a cualquier carta, pero cada combinación necesita al menos 2 cartas de verdad.',
        ],
        ejemplo: 'grupoRemigio',
      },
      {
        titulo: 'Tu turno',
        texto: [
          'Roba una carta del mazo o la de arriba del montón. Después puedes bajar combinaciones: elige las cartas y pulsa «Bajar». Al final, descarta una carta al montón.',
          'Cuando ya has bajado alguna combinación en la mano, puedes añadir cartas a las combinaciones de cualquier jugador (elige la carta y toca la combinación) y cambiar un comodín de la mesa por la carta que representa: el comodín se va a tu mano.',
        ],
      },
      {
        titulo: 'Cerrar y remigio',
        texto: [
          'Cierras cuando te quedas sin cartas, bajando o descartando la última. Si lo bajas todo en un mismo turno sin haber bajado nada antes, es «remigio»: los demás pagan el doble.',
        ],
      },
      {
        titulo: 'Consejos',
        texto: [
          'No tengas prisa por bajar si estás cerca de cerrarlo todo de golpe: un remigio hace mucho daño.',
          'Pero si un rival tiene pocas cartas, baja lo que puedas: los comodines y las figuras en la mano cuestan muchos puntos.',
        ],
      },
    ],

    julepe: [
      {
        titulo: 'El objetivo',
        texto: [
          'Se juega con la baraja española de 40 cartas, de 3 a 6 jugadores, cada uno por su cuenta. Todos empiezan con 50 fichas y gana quien más tenga al acabar las manos (12 por defecto). Quien se queda sin fichas queda eliminado.',
        ],
      },
      {
        titulo: 'El reparto y el bote',
        texto: [
          'Cada uno recibe 5 cartas. La última carta del que reparte se enseña a todos: su palo es el triunfo, y esa carta se queda en su mano.',
          'Al empezar cada mano, el que reparte pone 10 fichas en el bote.',
        ],
      },
      {
        titulo: '¿Juegas o pasas?',
        texto: [
          'Mirando tus cartas, decides si juegas la mano o pasas. Si pasas, ni ganas ni pierdes nada en esa mano. Decide primero el siguiente al que reparte, y el que reparte el último.',
          'Si antes del que reparte solo ha querido jugar uno, el que reparte está obligado a jugar. Si no ha querido nadie, el que reparte se lleva el bote.',
        ],
      },
      {
        titulo: 'El descarte',
        texto: [
          'Los que juegan pueden cambiar las cartas que quieran por otras del mazo, mientras queden. Toca las cartas que quieres cambiar y pulsa el botón.',
        ],
      },
      {
        titulo: 'Las bazas',
        texto: [
          'Se juegan 5 bazas entre los que juegan. El orden es el de la Brisca: As, 3, Rey, Caballo, Sota, 7, 6, 5, 4 y 2. Gana el triunfo más alto o, si no hay, la carta más alta del palo que salió.',
          'Hay que seguir el palo y superar la carta que va ganando si puedes. Si no tienes de ese palo, tienes que echar triunfo, y superar el triunfo de la mesa si puedes.',
        ],
      },
      {
        titulo: 'El cobro y el julepe',
        texto: [
          'Cada baza vale la quinta parte del bote. Pero quien juega y no hace al menos 2 bazas paga «julepe»: lo que valía el bote, que va al bote de la mano siguiente.',
          'Por ejemplo: con un bote de 10 juegan tres. Quien hace 3 bazas cobra 6, quien hace 2 cobra 4, y quien no hace ninguna paga 10 de julepe.',
        ],
      },
      {
        titulo: 'Consejos',
        texto: [
          'Juega cuando tengas triunfos altos o Ases: con el descarte puedes mejorar el resto.',
          'Con muchos jugadores en la mano, es más difícil hacer dos bazas: piénsalo antes de entrar.',
        ],
      },
    ],

    tuteSubastado: [
      {
        titulo: 'El objetivo',
        texto: [
          'Se juega con la baraja española de 40 cartas y 4 jugadores, sin parejas fijas. En cada mano se subastan los puntos que se van a hacer, y quien gana la subasta juega solo contra los otros tres, que esa mano son compañeros.',
          'Se cobra en fichas. Todos empiezan con 0 y gana quien más tenga al acabar las manos (8 por defecto).',
        ],
      },
      {
        titulo: 'Las cartas',
        texto: [
          'Cada uno recibe 10 cartas. El orden y los puntos son los del Tute: As (11), 3 (10), Rey (4), Caballo (3) y Sota (2); el 7, 6, 5, 4 y 2 no valen puntos. Las bazas suman 120, y la última vale 10 más.',
        ],
        ejemplo: 'valores',
      },
      {
        titulo: 'La subasta',
        texto: [
          'Empieza a hablar el siguiente al que reparte. En tu turno pasas o pujas: la primera puja es de 60 como mínimo y cada una sube la anterior de 10 en 10. Quien pasa ya no vuelve a pujar.',
          'Cuando los otros tres han pasado, el último que pujó gana la subasta: es el pujador. Si pasan los cuatro, se reparte otra vez.',
        ],
      },
      {
        titulo: 'El triunfo y las bazas',
        texto: [
          'El pujador mira su mano, elige el palo de triunfo y sale en la primera baza.',
          'Hay que seguir el palo y superar la carta que va ganando si puedes, aunque sea de un compañero. Si no tienes de ese palo, tienes que echar triunfo, y superar el triunfo de la mesa si puedes.',
        ],
      },
      {
        titulo: 'Los cantes',
        texto: [
          'Quien acaba de ganar una baza puede cantar, antes de salir, el Rey y el Caballo de un palo: 40 si es el triunfo y 20 si no. Los cantes suman al bando de quien canta.',
          'Con los 4 Reyes o los 4 Caballos se canta el tute: si lo canta el pujador, cumple en el acto; si lo canta otro, el pujador falla.',
        ],
        ejemplo: 'cante',
      },
      {
        titulo: 'El cobro',
        texto: [
          'El pujador cumple si sus bazas, sus cantes y las 10 de últimas llegan a lo que pujó. Si cumple, cobra de cada rival una ficha por cada 10 puntos pujados; si no, se las paga a cada uno.',
          'Por ejemplo: con una puja de 80 hace 85 puntos. Cobra 8 fichas de cada rival: gana 24 y cada uno pierde 8.',
        ],
      },
      {
        titulo: 'Consejos',
        texto: [
          'Cuenta tus Ases, tus Treses y tus cantes antes de pujar: es mejor pujar poco y cumplir que pujar mucho y pagar a los tres.',
          'Si defiendes y la baza ya es de un compañero, échale tus cartas de puntos.',
        ],
      },
    ],

    truc: [
      {
        titulo: 'El objetivo',
        texto: [
          'Se juega con la baraja española de 40 cartas, con 2 jugadores o con 4 en parejas (tu compañero es el de enfrente). Cada uno recibe solo 3 cartas.',
          'Cada mano reparte piedras y la primera pareja que llega a 12 gana una came. Gana la partida quien gana dos cames (o una, si lo eliges en las opciones).',
        ],
      },
      {
        titulo: 'Las cartas',
        texto: [
          'El orden no es el de otros juegos. De la más fuerte a la más débil: el As de espadas, el As de bastos, el 7 de espadas, el 7 de oros, los treses, los doses, los Ases de copas y oros, los Reyes, los Caballos, las Sotas, los 7 de copas y bastos, los seises, los cincos y los cuatros.',
          'No hay triunfo y puedes jugar la carta que quieras: no hay que seguir el palo.',
        ],
        ejemplo: 'jerarquiaTruc',
      },
      {
        titulo: 'Las bazas',
        texto: [
          'Gana la mano quien gana dos de las tres bazas. Si dos cartas iguales empatan, la baza es «parda»: si la primera es parda, decide la segunda; si la primera la ganó alguien y luego hay parda, gana ese.',
          'Si las tres bazas son pardas, gana quien es mano (el siguiente al que reparte). Sin apuestas, la mano vale 1 piedra.',
        ],
      },
      {
        titulo: 'El envit',
        texto: [
          'En la primera baza, antes de jugar tu carta, puedes «envidar»: apostar a que tienes más puntos de envit. Dos cartas del mismo palo valen 20 más sus números (las figuras valen 0); si no tienes dos del mismo palo, vale tu carta más alta.',
          'El rival puede decir «vull» (vale 2), «no vull» (cobras 1), «torne» (sube a 4) o «falta» (lo que le falta al que va ganando para acabar la came). Con empate gana el más cercano a la mano. El envit se cobra al terminar la mano.',
        ],
        ejemplo: 'envitTruc',
      },
      {
        titulo: 'El truc',
        texto: [
          'En tu turno puedes «trucar»: la mano pasa a valer 2. El rival dice «vull», «no vull» (y cobras 1) o sube con «retruc» (3). Después vienen «quatre val» (4) y «joc fora»: quien gana esa mano gana la came entera.',
          'Solo puede subir quien aceptó la última apuesta. Si en la primera baza te trucan y aún no has jugado, puedes envidar antes de responder: el envit va primero.',
          "Con «me'n vaig» te vas de la mano: el rival cobra lo que valga en ese momento.",
        ],
      },
      {
        titulo: 'Consejos',
        texto: [
          'Trucar con malas cartas es un farol: a veces el rival no quiere y te llevas la mano.',
          'Si ya ganaste una baza, tu mano vale más: con una carta alta guardada puedes subir.',
          'Fíjate en los puntos de envit que muestra el rival: te dicen qué cartas tiene.',
        ],
      },
    ],

    butifarra: [
      {
        titulo: 'El objetivo',
        texto: [
          'Se juega con la baraja española de 48 cartas (con ochos y nueves), 4 jugadores en dos parejas: tu compañero es el de enfrente. Cada uno recibe 12 cartas y se reparte toda la baraja.',
          'Gana la partida la pareja que antes llega a 101 puntos (o a 51 o 151, si lo cambias en las opciones).',
        ],
      },
      {
        titulo: 'Lo que vale cada carta',
        texto: [
          'De la más fuerte a la más débil: el 9 (la manilla), el As, el Rey, el Caballo, la Sota, y después el 8, 7, 6, 5, 4, 3 y 2.',
          'La manilla vale 5 puntos, el As 4, el Rey 3, el Caballo 2 y la Sota 1; las demás no valen nada. Además, cada baza vale 1 punto: en total, cada mano reparte 72 puntos.',
        ],
        ejemplo: 'valoresButifarra',
      },
      {
        titulo: 'Elegir el triunfo',
        texto: [
          'Antes de jugar, quien reparte elige el palo de triunfo mirando sus cartas. También puede jugar «butifarra»: sin triunfo, y la mano vale el doble.',
          'Si no tiene buen juego, puede «delegar» en su compañero, que entonces tiene que elegir él (no puede devolverlo).',
        ],
      },
      {
        titulo: 'Contro, recontro y Sant Vicenç',
        texto: [
          'Cuando se ha elegido el triunfo, los rivales pueden decir «contro» si creen que van a ganar la mano: entonces vale el doble. Si lo dicen, la pareja que eligió puede contestar con «recontro» (×4), y los rivales todavía con «Sant Vicenç» (×8).',
          'Cada pareja decide por turnos y basta con que uno de los dos lo diga. Si los dos pasan, empieza el juego.',
        ],
      },
      {
        titulo: 'Cómo se juega una baza',
        texto: [
          'Sale el jugador siguiente al que reparte. Gana la baza el triunfo más alto o, si no hay triunfos, la carta más fuerte del palo que salió. Quien la gana sale en la siguiente.',
          'Hay que seguir el palo que salió y, si puedes, superar la carta que va ganando. Si no tienes de ese palo, tienes que fallar con triunfo (y superar el triunfo más alto si puedes).',
          'Si la baza la va ganando tu compañero, solo tienes que seguir el palo: no hace falta superarle ni fallar. La mesa solo te deja jugar las cartas permitidas.',
        ],
      },
      {
        titulo: 'La puntuación',
        texto: [
          'Al acabar las 12 bazas, cada pareja cuenta sus puntos. La que pasa de 36 se anota lo que pasa, multiplicado por la butifarra y los contros; la otra no se anota nada. Con 36 a 36 nadie se anota.',
          'Por ejemplo: se juega butifarra con contro (×4) y tu pareja hace 42 puntos. Os anotáis (42 − 36) × 4 = 24.',
        ],
      },
      {
        titulo: 'Cómo jugar una carta',
        texto: [
          'Arrastra la carta a la mesa, o tócala y toca la mesa. Con un doble toque también se juega.',
        ],
      },
      {
        titulo: 'Consejos',
        texto: [
          'Elige de triunfo el palo en el que tengas más cartas y la manilla o el As.',
          'Si tu compañero va ganando la baza y nadie se la puede quitar, échale puntos.',
          'Cuenta las manillas que han salido: cuando ya no queda ninguna de un palo, su As manda.',
        ],
      },
    ],

    sieteYMedia: [
      {
        titulo: 'El objetivo',
        texto: [
          'Se juega con la baraja española de 40 cartas, contra la máquina, de 2 a 4 jugadores. Uno hace de banca y los demás juegan contra ella.',
          'Hay que acercarse lo más posible a 7 y medio sin pasarse. Al final de la partida gana quien tiene más fichas.',
        ],
      },
      {
        titulo: 'Lo que vale cada carta',
        texto: [
          'Del As al 7, cada carta vale su número. La Sota, el Caballo y el Rey valen medio punto.',
        ],
        ejemplo: 'valoresSyM',
      },
      {
        titulo: 'Cómo se juega una mano',
        texto: [
          'Primero, cada jugador que no es la banca apuesta unas fichas. Después todos reciben una carta boca abajo, que solo ve su dueño.',
          'Por turnos, cada uno pide cartas (llegan boca arriba, todos las ven) o se planta. Si pasas de 7 y medio, te has pasado y pierdes tu apuesta en el acto.',
          'La banca juega la última, viendo las cartas boca arriba de los demás (pero no su carta tapada).',
        ],
      },
      {
        titulo: 'Quién gana',
        texto: [
          'Al final se destapan las cartas. Si tienes más que la banca, o la banca se pasa, la banca te paga tu apuesta. Si tienes lo mismo o menos, la cobra la banca: los empates son para la banca.',
          'Si consigues siete y media con tus dos primeras cartas (un 7 y una figura), cobras el doble.',
        ],
        ejemplo: 'sieteYMedia',
      },
      {
        titulo: 'La banca y el final',
        texto: [
          'La banca pasa al siguiente jugador en cada mano (o, si lo eliges en las opciones, a quien le gana con siete y media).',
          'La partida termina al acabar las manos elegidas o cuando alguien se queda sin fichas.',
        ],
      },
      {
        titulo: 'En la mesa',
        texto: [
          'Elige tu apuesta con los botones − y + y pulsa «Apostar». En tu turno, pulsa «Pedir carta» o «Plantarse». Junto a tus cartas verás cuánto sumas.',
        ],
      },
      {
        titulo: 'Consejos',
        texto: [
          'Con 5 o más, lo normal es plantarse: hay muchas cartas que te harían pasarte.',
          'Fíjate en lo que enseñan los demás: su carta tapada suele ser alta si se plantan pronto.',
        ],
      },
    ],

    freecell: [
      {
        titulo: 'El objetivo',
        texto: [
          'Es un solitario con la baraja francesa de 52 cartas. Ganas cuando llevas todas las cartas a las 4 fundaciones de arriba a la derecha, cada una de un palo y en orden: As, 2, 3… hasta el Rey (K).',
          'Todas las cartas están boca arriba desde el principio, así que no depende de la suerte: casi todas las partidas tienen solución. Cada partida tiene un número, por si quieres repetirla o compartirla.',
        ],
      },
      {
        titulo: 'Las columnas',
        texto: [
          'Abajo hay 8 columnas. Solo se mueve la última carta de cada una. Puedes ponerla sobre otra carta que sea justo un valor más alta y de color contrario: un 9 negro sobre un 10 rojo. En una columna vacía puedes poner cualquier carta.',
        ],
        ejemplo: 'escalera',
      },
      {
        titulo: 'Las celdas libres',
        texto: [
          'Arriba a la izquierda hay 4 celdas. En cada una cabe una carta cualquiera, para apartarla un momento. Úsalas con cuidado: si se llenan, te quedas sin espacio para maniobrar.',
        ],
      },
      {
        titulo: 'Mover varias cartas',
        texto: [
          'Si al final de una columna hay una escalera ordenada y de colores alternos, puedes moverla entera de una vez. Cuantas más celdas libres y columnas vacías tengas, más cartas puedes mover: la mesa te dice cuántas.',
        ],
      },
      {
        titulo: 'En la mesa',
        texto: [
          'Arrastra una carta (o una escalera) a su destino, o tócala y toca el destino: se iluminan los sitios donde puede ir. Con un doble toque, la carta va a su fundación o, si no puede, a una celda libre.',
          'Las cartas que ya no hacen falta suben solas a las fundaciones (puedes quitarlo en las opciones). También puedes deshacer, y cuando todo esté ordenado aparecerá «Autocompletar».',
        ],
      },
      {
        titulo: 'Consejos',
        texto: [
          'Busca pronto los Ases y los 2: suelen estar enterrados.',
          'Una columna vacía vale más que una celda: te deja mover el doble de cartas.',
          'Antes de llenar la última celda, piensa si podrás vaciarla.',
        ],
      },
    ],

    cinquillo: [
      {
        titulo: 'El objetivo',
        texto: [
          'Se juega con la baraja española de 40 cartas, contra la máquina, de 2 a 4 jugadores. Se reparten todas las cartas.',
          'Gana la mano el primero que se queda sin cartas. Los demás se apuntan un punto por cada carta que les quede. Al final de la partida gana quien tiene menos puntos.',
        ],
      },
      {
        titulo: 'Cómo se empieza',
        texto: [
          'Empieza quien tiene el 5 de oros, y tiene que jugarlo: es la primera carta de la mesa.',
        ],
      },
      {
        titulo: 'Las escaleras',
        texto: [
          'En la mesa se forma una escalera por palo, que empieza siempre por el 5. En tu turno puedes poner el 5 de un palo que aún no esté en la mesa, o alargar una escalera por uno de sus extremos.',
          'Por arriba va el 6, el 7, la Sota, el Caballo y el Rey; por abajo, el 4, el 3, el 2 y el As. Siempre la carta justo siguiente: sin saltarse ninguna.',
        ],
        ejemplo: 'escaleraCinquillo',
      },
      {
        titulo: 'Jugar o pasar',
        texto: [
          'Si tienes alguna carta que se pueda poner, estás obligado a jugarla. Si no tienes ninguna, pasas y le toca al siguiente.',
        ],
      },
      {
        titulo: 'En la mesa',
        texto: [
          'Tus cartas jugables se iluminan. Arrastra una a la mesa, o tócala y toca la mesa; con un doble toque también se juega. Cuando no tengas jugada, pulsa «Paso».',
        ],
      },
      {
        titulo: 'Consejos',
        texto: [
          'Juega primero las cartas que te abren camino a ti: si tienes el 6 y el 7 de un palo, el 6 te deja jugar luego el 7.',
          'Retén los cincos y las cartas que abrirían camino a los demás si no te hacen falta.',
        ],
      },
    ],

    corazones: [
      {
        titulo: 'El objetivo',
        texto: [
          'Se juega con la baraja francesa de 52 cartas, cuatro jugadores cada uno por su cuenta, contra la máquina. Cada uno recibe 13 cartas.',
          'Aquí no interesa ganar bazas con puntos: cada corazón que te llevas suma 1 punto y la Q de picas 13. Cuando alguien llega a 100 puntos, termina la partida y gana quien tiene menos.',
        ],
        ejemplo: 'puntosCorazones',
      },
      {
        titulo: 'El pase',
        texto: [
          'Antes de jugar, cada uno elige 3 cartas para pasárselas a otro jugador: en la primera mano, al siguiente en el turno; en la segunda, al anterior; en la tercera, al de enfrente; y en la cuarta no se pasa. Aprovecha para librarte de las cartas peligrosas.',
        ],
      },
      {
        titulo: 'Cómo se juega una baza',
        texto: [
          'Empieza quien tiene el 2 de tréboles, que tiene que jugarlo. Por turnos, cada uno echa una carta y hay que seguir el palo de salida si se tiene. Gana la carta más alta de ese palo (el As es la más alta) y no hay triunfo. Quien gana sale en la siguiente.',
          'Si no tienes el palo, puedes echar cualquier carta: es el momento de soltar la Q de picas o tus corazones.',
        ],
      },
      {
        titulo: 'Restricciones',
        texto: [
          'En la primera baza no se pueden echar corazones ni la Q de picas, salvo que no tengas otra cosa.',
          'No se puede salir con corazones hasta que alguien haya echado uno (los corazones están «rotos»), salvo que solo te queden corazones.',
        ],
      },
      {
        titulo: 'Tirar la luna',
        texto: [
          'Si un jugador se lleva todos los corazones y la Q de picas (los 26 puntos), ha «tirado la luna»: él no suma nada y cada uno de los demás suma 26.',
        ],
      },
      {
        titulo: 'En la mesa',
        texto: [
          'Para pasar, toca 3 cartas y pulsa «Pasar». Para jugar, arrastra la carta a la mesa, o tócala y toca la mesa; con un doble toque también se juega. Solo se iluminan las cartas que puedes jugar.',
        ],
      },
      {
        titulo: 'Consejos',
        texto: [
          'Pasa la Q de picas, y el As y el Rey de picas si tienes pocas picas: con ellos te puede caer la Q.',
          'Quedarte sin un palo pronto te deja soltar cartas peligrosas.',
          'Vigila si alguien se está llevando todos los corazones: ¡puede ir a por la luna!',
        ],
      },
    ],

    burro: [
      {
        titulo: 'El objetivo',
        texto: [
          'Se juega con la baraja española, de 3 a 5 jugadores, contra la máquina. Cada uno recibe 4 cartas, y entre todas hay exactamente 4 de cada número en juego (por ejemplo, los cuatro reyes, los cuatro sietes…).',
          'Hay que juntar las 4 cartas de un mismo número. Pero lo importante es no ser el último en darse cuenta de que alguien lo ha conseguido.',
        ],
      },
      {
        titulo: 'Pasar cartas',
        texto: [
          'Todos a la vez eligen una carta de su mano y, cuando todos han elegido, cada uno se la pasa al siguiente jugador y recibe la del anterior. Se repite una y otra vez, sin turnos: elige rápido.',
        ],
      },
      {
        titulo: 'Plantarse',
        texto: [
          'Cuando juntas 4 cartas iguales, plántate pulsando «¡Me planto!». Lo hace en silencio: en la mesa solo se ve que tus cartas quedan tumbadas.',
          'En cuanto alguien se planta, todos los demás tienen que plantarse también, cuanto antes. El último en hacerlo pierde la mano y lleva una letra.',
          'Vigila las manos de los rivales: si ves unas cartas tumbadas, ¡plántate ya!',
        ],
      },
      {
        titulo: 'El burro',
        texto: [
          'Cada mano perdida suma una letra de B-U-R-R-O. Quien completa la palabra es el burro y pierde la partida; todos los demás ganan.',
          'Si en 50 intercambios nadie consigue plantarse, la mano se anula sin letras y se reparte otra.',
        ],
      },
      {
        titulo: 'En la mesa',
        texto: [
          'Toca la carta que quieras pasar. La que recibes se ve resaltada un momento. El botón «¡Me planto!» está siempre a la vista: si lo pulsas cuando no puedes plantarte, no pasa nada.',
        ],
      },
      {
        titulo: 'Consejos',
        texto: [
          'Quédate con el número del que más cartas tienes y pasa las sueltas.',
          'No te quedes mirando solo tu mano: el peligro está en las manos ajenas.',
        ],
      },
    ],

    spider: [
      {
        titulo: 'El objetivo',
        texto: [
          'Es un solitario con dos barajas francesas: 104 cartas. Ganas cuando formas 8 escaleras del Rey al As, cada una de un solo palo: al completarse, se retiran solas de la mesa.',
          'Con 1 palo todas las cartas son picas y es bastante asequible; con 2 o 4 palos es mucho más difícil.',
        ],
      },
      {
        titulo: 'Las columnas',
        texto: [
          'Hay 10 columnas con cartas boca abajo y solo la última a la vista. Puedes poner una carta sobre otra que valga justo uno más, sea del palo que sea: un 7 sobre cualquier 8. En una columna vacía puedes poner cualquier carta.',
          'Cuando una carta boca abajo queda al final de su columna, se da la vuelta sola.',
        ],
        ejemplo: 'escaleraSpider',
      },
      {
        titulo: 'Mover escaleras',
        texto: [
          'Varias cartas se pueden mover juntas solo si forman una escalera descendente del mismo palo, como 9, 8 y 7 de picas. Si se mezclan palos, solo se mueve la parte del final que es de un mismo palo.',
        ],
      },
      {
        titulo: 'El mazo',
        texto: [
          'Arriba está el mazo con las cartas que quedan. Al tocarlo, se reparte una carta boca arriba al final de cada columna (hay 5 repartos). No se puede repartir si hay alguna columna vacía, salvo que lo permitas en las opciones.',
        ],
      },
      {
        titulo: 'En la mesa',
        texto: [
          'Arrastra una carta (o una escalera) a su destino, o tócala y toca el destino: se iluminan los sitios donde puede ir. Con un doble toque va al mejor sitio posible.',
          'Puedes deshacer todos los movimientos que quieras, también los repartos.',
        ],
      },
      {
        titulo: 'Consejos',
        texto: [
          'Intenta vaciar una columna: es el mejor sitio para reorganizar.',
          'Antes de repartir, coloca todo lo que puedas: el reparto tapará tus escaleras.',
          'Cuando puedas elegir, pon las cartas sobre otras de su mismo palo.',
        ],
      },
    ],

    mus: [
      {
        titulo: 'El objetivo',
        texto: [
          'Se juega con la baraja española de 40 cartas, cuatro jugadores en dos parejas: tu compañero es el de enfrente. Cada uno recibe 4 cartas.',
          'Las parejas ganan piedras apostando en cuatro lances. La primera que llega a 40 piedras gana el juego, y la partida es al mejor de 3 juegos (se puede cambiar en las opciones).',
        ],
      },
      {
        titulo: 'La mano y el mus',
        texto: [
          'La «mano» es el jugador siguiente al que reparte: habla siempre el primero y gana todos los empates.',
          'Antes de apostar, cada uno dice «mus» si quiere cambiar cartas o «corto» si no. Si los cuatro dicen mus, cada uno descarta de 1 a 4 cartas y recibe otras tantas, y se vuelve a preguntar. En cuanto alguien corta, empiezan los lances.',
        ],
      },
      {
        titulo: 'Los ocho reyes',
        texto: [
          'Normalmente se juega con ocho reyes: los treses cuentan como reyes y los doses como ases. De más alta a más baja: Rey, Caballo, Sota, 7, 6, 5, 4 y As.',
        ],
      },
      {
        titulo: 'Los cuatro lances',
        texto: [
          'Grande: gana quien tiene las cartas más altas (se compara la más alta, luego la siguiente…). Chica: gana quien tiene las más bajas.',
          'Pares: una pareja (dos iguales), unas medias (tres iguales) o unos duples (dos parejas o cuatro iguales). Los duples ganan a las medias y las medias a la pareja.',
          'Juego: se suman las cartas (figuras 10, As 1, el resto su número). Hay juego con 31 o más, y el mejor es la 31, luego la 32, la 40, la 37, 36, 35, 34 y 33. Si nadie tiene juego se juega al Punto: gana la suma más alta.',
        ],
        ejemplo: 'jugadasMus',
      },
      {
        titulo: 'Las apuestas',
        texto: [
          'En cada lance, por turnos desde la mano, se puede pasar, envidar 2 o 5 piedras o echar un órdago. Ante un envite contesta primero el rival siguiente y, si no lo quiere, su compañero: puede querer, no querer, subir o echar un órdago.',
          'Si se quiere, lo cobra al final la pareja con la mejor jugada. Si no se quiere, la pareja que envidó cobra lo que ya estaba aceptado, o 1 piedra. Un órdago querido se resuelve en el acto: quien gana ese lance gana el juego entero.',
          'En Pares y Juego solo apuestan los que tienen la jugada; al llegar a esos lances se ve quién tiene.',
        ],
      },
      {
        titulo: 'El conteo',
        texto: [
          'Al final se enseñan las cartas y se cuentan los lances en orden. Grande y Chica en paso valen 1 piedra. En Pares, la pareja que gana cobra además 1 por pareja, 2 por medias y 3 por duples de cada uno; en Juego, 3 por la 31 y 2 por otro juego; el Punto vale 1.',
          'En cuanto una pareja llega a 40 gana el juego, aunque queden lances por contar.',
        ],
      },
      {
        titulo: 'En la mesa',
        texto: [
          'Pulsa «Mus» o «Corto». Para descartar, toca las cartas que quieres cambiar y pulsa «Descartar». En los lances, los botones muestran solo lo que puedes decir. En el centro verás cómo va cada lance y junto a cada jugador lo último que ha dicho.',
        ],
      },
      {
        titulo: 'Consejos',
        texto: [
          'Ser mano es una gran ventaja: con jugadas iguales, ganas tú.',
          'No quieras envites grandes con jugadas regulares: cada piedra cuenta.',
          'Un órdago de farol solo funciona si el rival no tiene buena jugada.',
        ],
      },
    ],

    pocha: [
      {
        titulo: 'El objetivo',
        texto: [
          'Se juega con la baraja española de 40 cartas, contra la máquina, con 3 o 4 jugadores. Cada uno juega por su cuenta.',
          'En cada mano tienes que adivinar cuántas bazas vas a ganar, ni una más ni una menos. Al final de la partida gana quien tiene más puntos.',
        ],
      },
      {
        titulo: 'Las manos',
        texto: [
          'En la primera mano se reparte 1 carta a cada uno, en la segunda 2, y así hasta el máximo; después se vuelve a bajar hasta 1. En la partida corta el máximo es 5 (9 manos); en la completa se llega a repartir toda la baraja.',
          'Cada mano reparte el siguiente jugador.',
        ],
      },
      {
        titulo: 'El triunfo',
        texto: [
          'Después de repartir se pone boca arriba la siguiente carta del mazo: su palo es el triunfo. Si se reparte toda la baraja, el triunfo lo marca la última carta del que reparte, que todos pueden ver.',
        ],
      },
      {
        titulo: 'Las apuestas',
        texto: [
          'Antes de jugar, cada uno dice cuántas bazas hará, empezando por el siguiente al que reparte. Se puede apostar desde 0 hasta el número de cartas de la mano.',
          'El que reparte apuesta el último y no puede elegir el número que haría que las apuestas sumen tantas bazas como cartas hay: así siempre falla alguien. Esta regla se puede quitar en las opciones.',
        ],
      },
      {
        titulo: 'Cómo se juega una baza',
        texto: [
          'Sale el siguiente al que reparte. Hay que seguir el palo que salió y, si puedes, ganar la baza. Si no tienes ese palo, tienes que echar triunfo y superar el triunfo de la mesa si puedes. Si no tienes ni palo ni triunfo, echas cualquier carta.',
          'Gana el triunfo más alto o, si no hay, la carta más fuerte del palo que salió. De más fuerte a menos: As, 3, Rey, Caballo, Sota, 7, 6, 5, 4 y 2. Quien gana sale en la siguiente.',
        ],
      },
      {
        titulo: 'Los puntos',
        texto: [
          'Si haces justo las bazas que apostaste, sumas 10 puntos más 5 por cada baza apostada. Si fallas, restas 5 puntos por cada baza de diferencia, por arriba o por abajo.',
        ],
        ejemplo: 'puntosPocha',
      },
      {
        titulo: 'En la mesa',
        texto: [
          'Para apostar, pulsa el botón con el número de bazas. Junto a cada jugador verás su apuesta, las bazas que lleva y sus puntos.',
          'Para jugar, arrastra la carta a la mesa, o tócala y toca la mesa; con un doble toque también se juega. Solo se iluminan las cartas que puedes jugar.',
        ],
      },
      {
        titulo: 'Consejos',
        texto: [
          'Los Ases y los triunfos altos suelen ganar baza; lo demás, casi nunca.',
          'Apostar 0 también vale 10 puntos: con una mano floja, intenta no ganar ninguna.',
          'Cuando ya tengas tus bazas, deshazte de las cartas altas en bazas que gane otro.',
        ],
      },
    ],
    pinacle: [
      {
        titulo: 'El objetivo',
        texto: [
          'Se juega con dos barajas francesas y 4 comodines (108 cartas), contra la máquina: con 2 jugadores, o con 4 en parejas (tu compañero es el de enfrente y vuestros puntos se suman).',
          'Se juegan manos hasta que alguien llega a 1500 puntos al terminar una mano. Gana quien más puntos tenga.',
        ],
      },
      {
        titulo: 'Las cartas',
        texto: [
          'Los 4 comodines y los 8 doses son comodines: sustituyen a cualquier carta en una combinación. Un dos nunca cuenta como carta normal.',
          'Valores: comodín 30, dos 20, As 15, del 8 al K 10, y del 3 al 7 5.',
        ],
      },
      {
        titulo: 'El turno',
        texto: [
          'Cada uno recibe 11 cartas, y una se pone boca arriba para empezar el montón.',
          'En tu turno, primero robas: la carta de arriba del mazo, o todo el montón. Solo puedes llevarte el montón si puedes bajar su carta de arriba ese mismo turno, y lo primero que bajes tiene que llevarla.',
          'Después puedes bajar combinaciones, añadir cartas a las tuyas (o a las de tu pareja) y cambiar comodines. El turno termina al descartar una carta en el montón.',
        ],
      },
      {
        titulo: 'Las combinaciones',
        texto: [
          'Grupo: 3 o más cartas del mismo número, del 3 al As, de cualquier palo (hasta 11).',
          'Escalera: 3 o más cartas seguidas del mismo palo, del 3 al As. El As va solo por arriba.',
          'Cada combinación lleva al menos 2 cartas normales. En una escalera, cada comodín ocupa un puesto concreto.',
          'Si tienes la carta que sustituye un comodín de tus combinaciones, puedes cambiarla: en una escalera la carta ocupa su sitio y el comodín pasa a un extremo; en un grupo la carta se añade. Cada cambio da premio.',
        ],
      },
      {
        titulo: 'Fin de la mano y puntos',
        texto: [
          'La mano termina cuando alguien se queda sin cartas (cierra) o se acaba el mazo.',
          'Cada bando suma el valor de sus combinaciones y resta lo que le queda en la mano. Cerrar da 20; si al cerrar no bajas comodines, lo que bajaste ese turno vale el doble; y si cierras bajándolo todo de golpe, sin haber bajado antes, todo lo de tu bando vale el doble (el cuádruple sin comodines).',
          'Algunas combinaciones tienen premio: el Pinacle (11 cartas iguales) vale 3000 bajado de golpe y 1500 poco a poco; la escalera completa del 3 al As, 1000 limpia, 800 o 750 con uno o dos comodines de su palo y 550 sucia; y 8, 7 o 6 Ases o figuras iguales sin comodines también tienen premio.',
        ],
      },
      {
        titulo: 'El barbelé',
        texto: [
          'Si tu bando empieza la mano con 750 puntos o más, está en barbelé: vuestra primera bajada de la mano tiene que sumar al menos 70. Si al descartar no llegas, las cartas vuelven a tu mano y perdéis 50 puntos.',
        ],
      },
      {
        titulo: 'En la mesa',
        texto: [
          'Toca el mazo o el montón para robar. Toca cartas de tu mano para elegirlas y pulsa «Bajar» para formar una combinación nueva, o toca una de tus combinaciones para añadirlas. Para cambiar un comodín, elige la carta y toca el comodín.',
          'Para descartar, elige una sola carta y pulsa «Descartar». Puedes ordenar la mano por palo o por número y ver todo el montón.',
        ],
      },
      {
        titulo: 'Consejos',
        texto: [
          'Un montón grande suele compensar: lo que bajas suma y lo que te queda en la mano resta.',
          'No descartes cartas que el rival pueda añadir a sus combinaciones.',
          'Guardar las combinaciones para cerrar de golpe puede doblar la mano, pero si el rival cierra antes, todo lo que tengas en la mano resta.',
        ],
      },
    ],
    red: [
      {
        titulo: 'El objetivo',
        texto: [
          'Jugar con tus amigos, cada uno desde su móvil o su ordenador, a cualquiera de los juegos con IA. Los asientos que nadie ocupe los juega la máquina.',
        ],
      },
      {
        titulo: 'El servidor',
        texto: [
          'Hace falta un servidor de salas. En casa, arráncalo en un ordenador con «pnpm servidor» y escribe su dirección en la pantalla de red, por ejemplo ws://192.168.1.20:8787. Todos tenéis que estar en la misma red.',
        ],
      },
      {
        titulo: 'Crear y unirse',
        texto: [
          'Quien crea la sala elige el juego, las opciones y el nivel de la IA, y recibe un código de 5 letras. Los demás eligen «Unirse» y escriben ese código y su nombre.',
          'En la sala de espera cada uno puede cambiarse a un asiento libre. Cuando estéis todos, el anfitrión pulsa «Empezar».',
        ],
      },
      {
        titulo: 'Si se corta la conexión',
        texto: [
          'Si alguien recarga la página o pierde la conexión, vuelve solo a su asiento. Si tarda más de 10 segundos, la IA juega por él hasta que vuelva.',
          'Al terminar, el anfitrión puede pedir la revancha con los mismos asientos.',
        ],
      },
    ],
  },
} as const;
