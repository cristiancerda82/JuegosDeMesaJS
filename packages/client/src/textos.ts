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
    piramide: 'Pirámide',
    golf: 'Golf',
    tripeaks: 'TriPeaks',
    yukon: 'Yukon',
    canfield: 'Canfield',
    cuarentaLadrones: 'Cuarenta ladrones',
    scorpion: 'Scorpion',
    scorpionDesc:
      'Solitario de una baraja: mueve cualquier carta con las de encima sobre la siguiente de su palo, y forma las cuatro escaleras.',
    cuarentaLadronesDesc:
      'Solitario de dos barajas: diez columnas por palo, ocho fundaciones y una sola vuelta al mazo.',
    canfieldDesc:
      'Solitario con reserva: las fundaciones empiezan por una carta al azar y dan la vuelta.',
    yukonDesc:
      'Solitario sin mazo: mueve grupos aunque no estén ordenados y sube los cuatro palos.',
    tripeaksDesc: 'Solitario: despeja tres picos subiendo o bajando una carta y encadena rachas.',
    golfDesc:
      'Solitario: pasa al descarte cartas que valgan una más o una menos y vacía las 7 columnas.',
    piramideDesc: 'Solitario: quita parejas de cartas que sumen 13 hasta deshacer la pirámide.',
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
    cuatrola: 'Cuatrola',
    mentiroso: 'Mentiroso',
    mentirosoDesc: 'De 3 a 6: baja cartas boca abajo diciendo qué son, y pilla al que miente.',
    ochoLoco: 'Ocho loco',
    picas: 'Picas',
    blackjack: 'Blackjack',
    ginRummy: 'Gin Rummy',
    rummy500: 'Rummy 500',
    holdem: 'Texas Hold’em',
    culo: 'Culo',
    canasta: 'Canasta',
    whist: 'Whist',
    sevens: 'Sevens',
    casino: 'Casino',
    durak: 'Durak',
    euchre: 'Euchre',
    bigTwo: 'Big Two',
    cribbage: 'Cribbage',
    ohHell: 'Oh Hell',
    ohHellDesc:
      'De 3 a 7 jugadores: acierta exactamente cuántas bazas harás en manos que menguan hasta 1 carta y vuelven a crecer.',
    skat: 'Skat',
    skatDesc:
      'El gran juego alemán para tres: puja, coge el Skat y juega solo contra los otros dos un palo, un Grand o un Nulo.',
    schnapsen: 'Schnapsen',
    schnapsenDesc:
      'El clásico austriaco para dos con 20 cartas: canta, cambia la J, cierra el mazo y llega a 66 antes que el rival.',
    belote: 'Belote',
    beloteDesc:
      'El clásico francés por parejas con 32 cartas: toma el triunfo, donde mandan la J y el 9, y canta belote. A 501.',
    cribbageDesc:
      'El clásico inglés para dos: quinces, parejas y escaleras al jugar y al contar, hasta 121.',
    bigTwoDesc:
      'Suelta sueltas, parejas, tríos y jugadas de póker que superen a las de la mesa; el 2 manda. A 50 puntos.',
    euchreDesc:
      'Bazas por parejas con 24 cartas: pide el triunfo, juega solo y aprovecha las jotas, que mandan. A 10 puntos.',
    durakDesc:
      'El clásico ruso de atacar y defender, de 2 a 6: el último que se queda con cartas es el tonto.',
    casinoDesc:
      'Recoge por número y por suma, construye montones y llévate el 10♦ y el 2♠: partida a 21.',
    sevensDesc:
      'El dominó de cartas, de 3 a 6: escaleras por palo desde los sietes; quien no puede, pasa.',
    whistDesc:
      'El clásico inglés de bazas por parejas: el triunfo lo marca la última carta y se juega al mejor de tres.',
    canastaDesc:
      'En parejas con dos barajas y comodines: haz canastas de siete, llévate el pozo y llega a 5.000.',
    culoDesc:
      'De 3 a 6: quítate las cartas jugando más alto que el anterior y sé el presidente, no el culo.',
    holdemDesc:
      'Póker sin límite de 2 a 6: apuesta, sube o retírate, y quédate con todas las fichas.',
    rummy500Desc:
      'De 2 a 4: baja combinaciones, añade a las de todos y llévate el descarte abierto. A 500.',
    ginRummyDesc:
      'Duelo de combinaciones: cierra con pocos puntos sueltos o haz Gin, y llega a 100.',
    blackjackDesc: 'De 1 a 4 contra la banca: llega a 21 sin pasarte, dobla y separa.',
    picasDesc: 'En parejas: apuesta cuántas bazas haréis; las picas siempre son triunfo.',
    ochoLocoDesc: 'De 2 a 5: suelta cartas del mismo palo o número; el 8 cambia de palo.',
    cuatrolaDesc: 'El Tresillo de 4: juega solo o llama a un rey, con espadilla, malilla y basto.',
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
    construccion: 'Construir en las columnas',
    construccionColores: 'Colores alternos (Yukon)',
    construccionPalo: 'Mismo palo (Solitario ruso)',
    vueltas: 'Vueltas al mazo',
    ilimitadas: 'Ilimitadas',
    vueltasN: (n: number) => (n === 0 ? 'Ninguna' : n === 1 ? '1 vuelta' : `${n} vueltas`),
    jugadores: 'Jugadores',
    dosJugadores: '2 jugadores',
    enParejas: 'En parejas (tu compañero, enfrente)',
    manosJulepe: 'Duración',
    manosJulepeN: (n: number) => `${n} manos`,
    pasadas: 'Pasadas por el mazo',
    pasadasN: (n: number | null) =>
      n === null ? 'Sin límite' : n === 1 ? '1 pasada' : `${n} pasadas`,
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
    rondas: 'Rondas',
    rondasN: (n: number) => `${n === 1 ? '1 ronda' : `${n} rondas`} (${3 * n} manos)`,
    capturaObligatoria: 'Recoger es obligatorio',
    capturaObligatoriaDesc: 'Si la carta que juegas puede sumar 15, tienes que recoger.',
    escobaInicial: 'Escoba del que reparte',
    vueltaGolf: 'La K y el As',
    vueltaGolfDesc: 'Con vuelta: sobre una K va un As, y sobre un As una K.',
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

  mentiroso: {
    rivalN: (n: number) => `Rival ${n}`,
    /** Nombre del valor, en singular o plural: «As», «2 doses», «3 reinas»… */
    valor: (v: number, cuantas: number) => {
      const nombres: Record<number, [string, string]> = {
        1: ['As', 'Ases'],
        2: ['dos', 'doses'],
        3: ['tres', 'treses'],
        4: ['cuatro', 'cuatros'],
        5: ['cinco', 'cincos'],
        6: ['seis', 'seises'],
        7: ['siete', 'sietes'],
        8: ['ocho', 'ochos'],
        9: ['nueve', 'nueves'],
        10: ['diez', 'dieces'],
        11: ['jota', 'jotas'],
        12: ['reina', 'reinas'],
        13: ['rey', 'reyes'],
      };
      return nombres[v]![cuantas === 1 ? 0 : 1];
    },
    toca: (valor: string) => `Toca: ${valor}`,
    cartas: (n: number) => (n === 1 ? '1 carta' : `${n} cartas`),
    monton: (n: number) => (n === 1 ? '1 carta en el montón' : `${n} cartas en el montón`),
    bajada: (quien: string, n: number, valor: string) => `${quien}: ${n} ${valor}`,
    leToca: (quien: string) => `Le toca a ${quien}`,
    tuTurno: (valor: string) => `Tu turno: marca de 1 a 4 cartas y bájalas como ${valor}`,
    ultimaBajada: (quien: string) => `${quien} se ha quedado sin cartas: ¿le crees?`,
    bajar: (n: number) => (n === 0 ? 'Bajar' : `Bajar ${n}`),
    desconfiar: '¡Mentiroso!',
    creer: 'Me lo creo',
    pillado: (quien: string) => (quien === 'Tú' ? '¡Te han pillado!' : `¡${quien} mentía!`),
    eraVerdad: (quien: string) =>
      quien === 'Tú' ? 'Decías la verdad' : `${quien} decía la verdad`,
    seLleva: (quien: string, n: number) =>
      `${quien === 'Tú' ? 'Te llevas' : `${quien} se lleva`} el montón (${n === 1 ? '1 carta' : `${n} cartas`})`,
    sinCartas: (quien: string) =>
      quien === 'Tú' ? 'Te has quedado sin cartas' : `${quien} se ha quedado sin cartas`,
    quedan: 'Cartas que les quedan',
  },

  ohHell: {
    rivalN: (n: number) => `Rival ${n}`,
    triunfo: (palo: string) =>
      `Triunfo: ${({ picas: '♠ picas', corazones: '♥ corazones', diamantes: '♦ diamantes', treboles: '♣ tréboles' } as Record<string, string>)[palo]}`,
    mano: (n: number, total: number, cartas: number) =>
      `Mano ${n} de ${total} · ${cartas === 1 ? '1 carta' : `${cartas} cartas`}`,
    detalle: (apuesta: number | null, bazas: number, puntos: number) =>
      apuesta === null ? `${puntos} pts` : `apuesta ${apuesta} · bazas ${bazas} · ${puntos} pts`,
    apuestaTitulo: '¿Cuántas bazas harás?',
    noPuedes: (n: number) => `Repartes tú: no puedes apostar ${n}`,
    apuesta: (quien: string, n: number) => {
      const bazas = n === 1 ? '1 baza' : `${n} bazas`;
      return quien === 'Tú' ? `Apuestas ${bazas}` : `${quien} apuesta ${bazas}`;
    },
    sumaApuestas: (suma: number, cartas: number) => `Apostadas ${suma} de ${cartas}`,
    reparte: (quien: string) => (quien === 'Tú' ? 'Repartes tú' : `Reparte ${quien}`),
    finMano: (n: number, total: number) => `Fin de la mano ${n} de ${total}`,
    jugador: 'Jugador',
    apuestaCol: 'Apuesta',
    bazasCol: 'Bazas',
    puntosCol: 'Mano',
    totalCol: 'Total',
    acierto: 'Acierta',
    fallo: 'Falla',
    siguienteMano: 'Siguiente mano',
    clasificacion: 'Puntos',
  },

  skat: {
    solista: 'Solista',
    reparte: 'Reparte',
    puntosPartida: (n: number) => `${n} pts`,
    juego: (juego: string) =>
      (
        ({
          picas: '♠ Picas',
          corazones: '♥ Corazones',
          diamantes: '♦ Diamantes',
          treboles: '♣ Tréboles',
          grand: 'Grand',
          nulo: 'Nulo',
        }) as Record<string, string>
      )[juego]!,
    subasta: (pujador: string, escucha: string, valor: number, tramo: number) =>
      tramo === 3
        ? `Nadie ha pujado: ${pujador === 'Tú' ? 'puedes' : `${pujador} puede`} jugar con 18`
        : `${pujador === 'Tú' ? 'Pujas' : `${pujador} puja`} a ${escucha === 'Tú' ? 'ti' : escucha}${valor > 0 ? ` · van ${valor}` : ''}`,
    eligiendo: (quien: string, puja: number) =>
      `${quien === 'Tú' ? 'Eres el solista' : `${quien} es el solista`} con ${puja}`,
    juegaSolista: (quien: string, juego: string, mano: boolean, anuncio: string, puja: number) => {
      const extras = [
        mano ? 'de mano' : '',
        anuncio === 'ninguno'
          ? ''
          : (
              {
                schneider: 'schneider anunciado',
                schwarz: 'schwarz anunciado',
                ouvert: 'ouvert',
              } as Record<string, string>
            )[anuncio]!,
      ].filter((x) => x !== '');
      return `${quien === 'Tú' ? 'Juegas' : `${quien} juega`} ${juego}${extras.length > 0 ? ` (${extras.join(', ')})` : ''} · puja ${puja}`;
    },
    bandos: (solista: number, defensores: number) =>
      `Solista ${solista} · Defensores ${defensores}`,
    cartasDe: (quien: string) => `Cartas de ${quien}:`,
    tuSkat: 'Tu Skat:',
    elSkat: 'Skat:',
    jugarCon: (n: number) => `Juego con ${n}`,
    si: (valor: number) => `Sí, ${valor}`,
    paso: 'Paso',
    cogerSkat: 'Coger el Skat',
    deMano: 'Jugar de mano',
    anuncio: 'Anuncio',
    nombreAnuncio: (a: string) =>
      (
        ({
          ninguno: 'Sin anuncio',
          schneider: 'Schneider',
          schwarz: 'Schwarz',
          ouvert: 'Ouvert',
        }) as Record<string, string>
      )[a]!,
    nuloOuvert: 'Nulo ouvert',
    descartate: 'Descártate de 2 cartas: toca una y después la mesa',
    puja: (quien: string, valor: number) =>
      `${quien === 'Tú' ? 'Pujas' : `${quien} puja`} ${valor}`,
    acepta: (quien: string, valor: number) =>
      `${quien === 'Tú' ? 'Aceptas' : `${quien} acepta`} ${valor}`,
    pasa: (quien: string) => (quien === 'Tú' ? 'Pasas' : `${quien} pasa`),
    cogeSkat: (quien: string) => (quien === 'Tú' ? 'Coges el Skat' : `${quien} coge el Skat`),
    seDescarta: (quien: string) => (quien === 'Tú' ? 'Te descartas' : `${quien} se descarta`),
    declara: (quien: string, juego: string, mano: boolean, anuncio: string) =>
      `${quien === 'Tú' ? 'Juegas' : `${quien} juega`} ${juego}${mano ? ' de mano' : ''}${anuncio === 'ninguno' ? '' : ` (${anuncio})`}`,
    finMano: (n: number) => `Fin de la mano ${n}`,
    puntosCartas: 'Puntos del solista',
    multiplicador: 'Multiplicador',
    conSin: (con: boolean, n: number) => `${con ? 'con' : 'sin'} ${n}`,
    bazasSolista: 'Bazas del solista',
    valor: 'Valor',
    resultado: (quien: string, gana: boolean, pasado: boolean, delta: number) =>
      `${quien === 'Tú' ? (gana ? 'Ganas' : 'Pierdes') : `${quien} ${gana ? 'gana' : 'pierde'}`}${pasado ? ' (se pasó en la puja)' : ''}: ${delta > 0 ? '+' : ''}${delta}`,
    siguienteMano: 'Siguiente mano',
    clasificacion: 'Puntos de la partida',
  },

  schnapsen: {
    reparte: 'Reparte',
    puntosYBazas: (puntos: number, bazas: number) =>
      `${puntos} puntos · ${bazas === 1 ? '1 baza' : `${bazas} bazas`}`,
    triunfo: (palo: string) =>
      `Triunfo: ${({ picas: '♠ picas', corazones: '♥ corazones', diamantes: '♦ diamantes', treboles: '♣ tréboles' } as Record<string, string>)[palo]}`,
    cerrado: 'Cerrado',
    cerradoPor: (quien: string) =>
      quien === 'Tú' ? 'Has cerrado el mazo' : `${quien} ha cerrado el mazo`,
    marcador: (mios: number, suyos: number) => `Partida: ${mios} a ${suyos} (a 7)`,
    cambiar: 'Cambiar la J',
    cerrar: 'Cerrar',
    cantar: (puntos: number, palo: string) =>
      `Cantar ${puntos} ${({ picas: '♠', corazones: '♥', diamantes: '♦', treboles: '♣' } as Record<string, string>)[palo]}`,
    cambia: (quien: string) =>
      quien === 'Tú'
        ? 'Cambias la J por la carta vuelta'
        : `${quien} cambia la J por la carta vuelta`,
    canta: (quien: string, puntos: number, palo: string) =>
      `${quien === 'Tú' ? 'Cantas' : `${quien} canta`} ${puntos} en ${({ picas: '♠ picas', corazones: '♥ corazones', diamantes: '♦ diamantes', treboles: '♣ tréboles' } as Record<string, string>)[palo]}`,
    cierra: (quien: string) => (quien === 'Tú' ? 'Cierras el mazo' : `${quien} cierra el mazo`),
    finMano: (n: number) => `Fin de la mano ${n}`,
    gana: (quien: string, motivo: '66' | 'ultima' | 'cierre', cerro: string | null) => {
      const gana = quien === 'Tú' ? 'Ganas' : `Gana ${quien}`;
      if (motivo === '66') return `${gana}: llega a 66${cerro ? ` con el mazo cerrado` : ''}`;
      if (motivo === 'ultima') return `${gana}: nadie llega a 66 y hace la última baza`;
      return `${gana}: ${cerro === 'Tú' ? 'cerraste' : `${cerro} cerró`} el mazo y no llegó a 66`;
    },
    puntosCol: 'Puntos',
    bazasCol: 'Bazas',
    partidaCol: 'Partida',
    totalCol: 'Total',
    siguienteMano: 'Siguiente mano',
    clasificacion: 'Puntos de partida (a 7)',
  },

  belote: {
    reparte: 'Reparte',
    tomo: 'Eligió el triunfo',
    cartaVuelta: 'Carta vuelta',
    sinTriunfo: 'Se elige el triunfo',
    triunfo: (palo: string) =>
      `Triunfo: ${({ picas: '♠ picas', corazones: '♥ corazones', diamantes: '♦ diamantes', treboles: '♣ tréboles' } as Record<string, string>)[palo]}`,
    paloCorto: (palo: string) =>
      (
        ({
          picas: '♠ Picas',
          corazones: '♥ Corazones',
          diamantes: '♦ Diamantes',
          treboles: '♣ Tréboles',
        }) as Record<string, string>
      )[palo]!,
    elige: (quien: string) => (quien === 'Tú' ? 'Eliges tú' : `Elige ${quien}`),
    pareja: (lado: string, bazas: number, puntos: number) =>
      `${lado}: ${bazas} en bazas · ${puntos} de 501`,
    tomar: 'Tomo',
    paso: 'Paso',
    toma: (quien: string) =>
      quien === 'Tú' ? 'Tomas la carta vuelta' : `${quien} toma la carta vuelta`,
    nombra: (quien: string, palo: string) =>
      `${quien === 'Tú' ? 'Nombras' : `${quien} nombra`} ${palo}`,
    pasa: (quien: string) => (quien === 'Tú' ? 'Pasas' : `${quien} pasa`),
    anuncia: (quien: string, tipo: 'belote' | 'rebelote') =>
      `${quien === 'Tú' ? 'Dices' : `${quien} dice`} «${tipo === 'belote' ? 'Belote' : 'Rebelote'}»`,
    finMano: (n: number) => `Fin de la mano ${n}`,
    eligio: (quien: string, palo: string) =>
      `${quien === 'Tú' ? 'Elegiste' : `Eligió ${quien}`}: ${palo}`,
    dentro: '¡Dentro! Quien eligió el triunfo hizo menos puntos y los rivales se apuntan 162',
    capot: (lado: string) => `¡Capot! ${lado} hacen las 8 bazas y se apuntan 252`,
    parejaCol: 'Pareja',
    cartasCol: 'Cartas',
    ultimasCol: 'Últimas',
    beloteCol: 'Belote',
    manoCol: 'Mano',
    totalCol: 'Total',
    siguienteMano: 'Siguiente mano',
    clasificacion: 'Puntos (a 501)',
  },

  cribbage: {
    mesa: 'Mesa',
    cartas: (n: number) => (n === 1 ? '1 carta' : `${n} cartas`),
    reparte: 'Reparte',
    crib: 'Crib',
    cribDe: (quien: string) => (quien === 'Tú' ? 'Tu crib' : `Crib de ${quien}`),
    starter: 'Starter',
    cuenta: (n: number) => `Cuenta: ${n}`,
    alCrib: 'Al crib',
    go: 'Go',
    echa: 'Echa 2 cartas al crib',
    tuTurno: 'Tu turno: juega una carta',
    sinCarta: 'No te cabe ninguna: di «Go»',
    puntos: (n: number) => (n === 1 ? '1 punto' : `${n} puntos`),
    motivos: {
      quince: '15',
      treintaYUno: '31',
      pareja: 'pareja',
      trio: 'trío',
      poker: 'póker',
      escalera: 'escalera',
      go: 'go',
      ultima: 'última carta',
      talones: 'J de starter',
    } as Record<string, string>,
    anota: (quien: string, motivos: string, n: number) =>
      `${quien === 'Tú' ? 'Sumas' : `${quien} suma`} ${n} (${motivos})`,
    juega: (quien: string, carta: string) =>
      quien === 'Tú' ? `Juegas ${carta}` : `${quien} juega ${carta}`,
    dice: (quien: string) => (quien === 'Tú' ? 'Dices go' : `${quien} dice go`),
    echaAviso: (quien: string) => (quien === 'Tú' ? 'Echas al crib' : `${quien} echa al crib`),
    finMano: (n: number) => `Recuento de la mano ${n}`,
    manoDe: (quien: string) => (quien === 'Tú' ? 'Tu mano' : `Mano de ${quien}`),
    quinces: 'Quinces',
    parejas: 'Parejas',
    escaleras: 'Escaleras',
    color: 'Color',
    nobs: 'Nobs',
    total: 'Total',
    juegoCartas: 'Al jugar las cartas',
    totales: 'Totales',
    siguienteMano: 'Siguiente mano',
    clasificacion: 'Puntos (a 121)',
  },

  bigTwo: {
    mesa: 'Mesa',
    cartas: (n: number) => (n === 1 ? '1 carta' : `${n} cartas`),
    puntos: (n: number) => (n === 1 ? '1 punto' : `${n} puntos`),
    pasa: 'Pasa',
    tipos: {
      suelta: 'Suelta',
      pareja: 'Pareja',
      trio: 'Trío',
      escalera: 'Escalera',
      color: 'Color',
      full: 'Full',
      poker: 'Póker',
      escaleraColor: 'Escalera de color',
    } as Record<string, string>,
    deQuien: (tipo: string, quien: string) => `${tipo} de ${quien === 'Tú' ? 'ti' : quien}`,
    mesaVacia: 'Mesa vacía: sale quien tiene la mano',
    jugar: 'Jugar',
    paso: 'Paso',
    tuSalidaTres: 'Sales tú: tu jugada tiene que llevar el 3♦',
    tuSalida: 'Sales tú: juega lo que quieras',
    tuTurno: 'Supera la jugada de la mesa o pasa',
    juega: (quien: string, tipo: string) =>
      quien === 'Tú' ? `Juegas: ${tipo.toLowerCase()}` : `${quien} juega: ${tipo.toLowerCase()}`,
    pasaAviso: (quien: string) => (quien === 'Tú' ? 'Pasas' : `${quien} pasa`),
    finMano: (n: number) => `Fin de la mano ${n}`,
    ganaMano: (quien: string) =>
      quien === 'Tú' ? '¡Te has quedado sin cartas!' : `Gana la mano: ${quien}`,
    quedan: 'Le quedan',
    puntosMano: 'Puntos',
    totalPartida: 'Total',
    siguienteMano: 'Siguiente mano',
    clasificacion: 'Puntos (menos es mejor)',
  },

  euchre: {
    reparte: 'Reparte',
    deja: 'Deja la mano',
    cartaVuelta: 'Carta vuelta',
    sinTriunfo: 'Se elige el triunfo',
    triunfo: (palo: string) =>
      `Triunfo: ${({ picas: '♠ picas', corazones: '♥ corazones', diamantes: '♦ diamantes', treboles: '♣ tréboles' } as Record<string, string>)[palo]}`,
    paloCorto: (palo: string) =>
      (
        ({
          picas: '♠ Picas',
          corazones: '♥ Corazones',
          diamantes: '♦ Diamantes',
          treboles: '♣ Tréboles',
        }) as Record<string, string>
      )[palo]!,
    elige: (quien: string, solo: boolean) =>
      `${quien === 'Tú' ? 'Eliges tú' : `Elige ${quien}`}${solo ? ' (solo)' : ''}`,
    pareja: (lado: string, bazas: number, puntos: number) =>
      `${lado}: ${bazas === 1 ? '1 baza' : `${bazas} bazas`} · ${puntos} de 10`,
    bazasDe: (n: number) => (n === 1 ? '1 baza' : `${n} bazas`),
    pedir: 'Pedir',
    pedirSolo: 'Pedir solo',
    soloSufijo: 'solo',
    paso: 'Paso',
    tuPrimera: 'Tu turno: ¿pides la carta vuelta?',
    tuSegunda: 'Tu turno: nombra un palo o pasa',
    tuDescarte: 'Descártate de una carta',
    pide: (quien: string, solo: boolean) =>
      `${quien === 'Tú' ? 'Pides' : `${quien} pide`} el triunfo${solo ? ' y juega solo' : ''}`,
    nombra: (quien: string, palo: string, solo: boolean) =>
      `${quien === 'Tú' ? 'Nombras' : `${quien} nombra`} ${palo}${solo ? ' y juega solo' : ''}`,
    pasa: (quien: string) => (quien === 'Tú' ? 'Pasas' : `${quien} pasa`),
    seDescarta: (quien: string) => (quien === 'Tú' ? 'Te descartas' : `${quien} se descarta`),
    finMano: (n: number) => `Fin de la mano ${n}`,
    eligio: (quien: string, palo: string, solo: boolean) =>
      `${quien === 'Tú' ? 'Elegiste' : `Eligió ${quien}`}: ${palo}${solo ? ', solo' : ''}`,
    euchre: '¡Euchre! Quien eligió el triunfo no llegó a 3 bazas',
    parejaCol: 'Pareja',
    bazasCol: 'Bazas',
    manoCol: 'Mano',
    totalCol: 'Total',
    siguienteMano: 'Siguiente mano',
    clasificacion: 'Puntos (a 10)',
  },

  durak: {
    mesa: 'Mesa',
    cartas: (n: number) => (n === 1 ? '1 carta' : `${n} cartas`),
    ataca: 'Ataca',
    defiende: 'Defiende',
    salido: 'Ha salido',
    triunfo: (palo: string) =>
      `Triunfo: ${({ picas: '♠ picas', corazones: '♥ corazones', diamantes: '♦ diamantes', treboles: '♣ tréboles' } as Record<string, string>)[palo]}`,
    enMazo: (n: number) => (n === 1 ? 'Queda 1 carta en el mazo' : `Quedan ${n} cartas en el mazo`),
    descarte: (n: number) => `Descarte: ${n}`,
    tomar: 'Me las llevo',
    paso: 'Paso',
    tuAtaque: 'Atacas: juega una carta',
    tuDefensa: 'Defiendes: gana la carta o llévatelas',
    echar: 'Puedes echar otra carta del mismo número',
    hasSalido: '¡Has salido! Ya estás a salvo',
    ataque: (quien: string, carta: string) =>
      quien === 'Tú' ? `Atacas con ${carta}` : `${quien} ataca con ${carta}`,
    defensa: (quien: string, carta: string) =>
      quien === 'Tú' ? `Ganas con ${carta}` : `${quien} gana con ${carta}`,
    seLasLleva: (quien: string) => (quien === 'Tú' ? 'Te las llevas' : `${quien} se las lleva`),
    pasa: (quien: string) => (quien === 'Tú' ? 'Pasas' : `${quien} pasa`),
    esDurak: (quien: string) => (quien === 'Tú' ? '¡Eres el durak!' : `${quien} es el durak`),
    sinDurak: 'Empate: nadie es el durak',
    ordenSalida: 'Orden de salida',
  },

  casino: {
    mesa: 'Mesa',
    recogidas: (n: number) => (n === 1 ? '1 carta recogida' : `${n} cartas recogidas`),
    barridas: (n: number) => (n === 1 ? '1 barrida' : `${n} barridas`),
    cartas: (n: number) => (n === 1 ? '1 carta' : `${n} cartas`),
    puntos: (n: number) => (n === 1 ? '1 punto' : `${n} puntos`),
    construccion: (valor: number) => `Construcción de ${valor}`,
    multiple: 'múltiple',
    de: (quien: string) => (quien === 'Tú' ? 'tuya' : `de ${quien}`),
    tuTurno: 'Tu turno: toca una carta',
    recoger: (n: number) => `Recoger (${n === 1 ? '1 carta' : `${n} cartas`})`,
    construir: (valor: number) => `Construir ${valor}`,
    subir: (valor: number) => `Subir a ${valor}`,
    hacerMultiple: (valor: number) => `Hacer múltiple de ${valor}`,
    dejar: 'Dejar en la mesa',
    recoge: (quien: string, n: number) =>
      `${quien === 'Tú' ? 'Recoges' : `${quien} recoge`} ${n === 1 ? '1 carta' : `${n} cartas`}`,
    barrida: (quien: string) => (quien === 'Tú' ? '¡Barrida!' : `¡Barrida de ${quien}!`),
    construye: (quien: string, valor: number) =>
      quien === 'Tú' ? `Construyes ${valor}` : `${quien} construye ${valor}`,
    deja: (quien: string, carta: string) =>
      quien === 'Tú' ? `Dejas ${carta}` : `${quien} deja ${carta}`,
    finMano: (n: number) => `Fin de la mano ${n}`,
    conceptoCartas: 'Más cartas',
    conceptoPicas: 'Más picas',
    bigCasino: '10♦ (Big Casino)',
    littleCasino: '2♠ (Little Casino)',
    ases: 'Ases',
    barridasConcepto: 'Barridas',
    totalMano: 'Mano',
    totalPartida: 'Total',
    siguienteMano: 'Siguiente mano',
    clasificacion: 'Puntos (a 21)',
  },

  sevens: {
    mesa: 'Mesa',
    paso: 'Paso',
    cartas: (n: number) => (n === 1 ? '1 carta' : `${n} cartas`),
    puntos: (n: number) => (n === 1 ? '1 punto' : `${n} puntos`),
    juega: (quien: string, carta: string) =>
      quien === 'Tú' ? `Juegas ${carta}` : `${quien} juega ${carta}`,
    pasa: (quien: string) => (quien === 'Tú' ? 'Pasas' : `${quien} pasa`),
    tuTurno: 'Tu turno: juega una carta',
    sinJugada: 'No tienes jugada: pasa',
    salida: 'Sale el 7 de diamantes',
    finMano: (n: number) => `Fin de la mano ${n}`,
    ganaMano: (quien: string) =>
      quien === 'Tú' ? '¡Te has quedado sin cartas!' : `Gana la mano: ${quien}`,
    quedan: 'Le quedan',
    totalPartida: 'Total',
    siguienteMano: 'Siguiente mano',
    clasificacion: 'Puntos (menos es mejor)',
  },

  whist: {
    reparte: 'Reparte',
    cartaTriunfo: 'Carta del triunfo',
    bazasDe: (n: number) => (n === 1 ? '1 baza' : `${n} bazas`),
    triunfo: (palo: string) =>
      `Triunfo: ${({ picas: '♠ picas', corazones: '♥ corazones', diamantes: '♦ diamantes', treboles: '♣ tréboles' } as Record<string, string>)[palo]}`,
    bazasPareja: (lado: string, n: number) => `${lado}: ${n === 1 ? '1 baza' : `${n} bazas`}`,
    puntos: (lado: string, puntos: number, juegos: number) =>
      `${lado}: ${puntos} de 5 · ${juegos === 1 ? '1 juego' : `${juegos} juegos`}`,
    finMano: (n: number) => `Fin de la mano ${n}`,
    parejaCol: 'Pareja',
    bazasCol: 'Bazas',
    manoCol: 'Mano',
    juegoCol: 'Juego',
    juegosCol: 'Juegos',
    ganaJuego: (lado: string) => `${lado}: ¡ganáis un juego!`,
    juegos: (n: number) => (n === 1 ? '1 juego' : `${n} juegos`),
    siguienteMano: 'Siguiente mano',
    clasificacion: 'Juegos ganados',
  },

  canasta: {
    puntos: (n: number) => (n === 1 ? '1 punto' : `${n} puntos`),
    mano: (n: number) => `Mano ${n} · a 5.000`,
    minimo: (n: number) => `Primera bajada: ${n}`,
    faltaMinimo: (n: number) => `Te faltan ${n} para la primera bajada`,
    cartas: (n: number) => (n === 1 ? '1 carta' : `${n} cartas`),
    robar: 'Robar',
    cogerPozo: 'Coger el pozo',
    acabar: 'Acabar la mano',
    bajar: 'Bajar',
    descartar: 'Descartar',
    deshacer: 'Deshacer',
    limpiar: 'Quitar selección',
    faseRobar: 'Tu turno: roba del mazo',
    faseRobarPozo: 'Tu turno: roba, o marca las cartas para coger el pozo',
    faseBajar: 'Baja o añade cartas, y descarta',
    tapado: 'Pozo tapado',
    congelado: 'Pozo congelado',
    congeladoParaTi: 'Congelado hasta tu primera bajada',
    treses: (n: number) => (n === 1 ? '1 tres rojo' : `${n} treses rojos`),
    sinCombinaciones: 'Sin combinaciones',
    combinacion: (valor: string, n: number) => `${n} cartas de ${valor}`,
    limpia: 'limpia',
    sucia: 'sucia',
    roba: (quien: string) => `${quien} roba del mazo`,
    seLleva: (quien: string) => `${quien} se lleva el pozo`,
    baja: (quien: string) => `${quien} baja`,
    anade: (quien: string) => `${quien} añade`,
    deshace: (quien: string) => `${quien} deshace su bajada`,
    acaba: (quien: string) => `${quien} acaba la mano`,
    descarta: (quien: string, carta: string) => `${quien} descarta ${carta}`,
    finMano: (n: number) => `Fin de la mano ${n}`,
    mazoAgotado: 'Se acabó el mazo',
    cierra: (quien: string) => (quien === 'Tú' ? 'Has cerrado' : `Cierra ${quien}`),
    enMesa: 'Cartas bajadas',
    canastas: 'Canastas',
    tresesRojos: 'Treses rojos',
    premioCierre: 'Cerrar',
    enMano: 'En la mano',
    totalMano: 'Total de la mano',
    acumulado: 'Marcador',
    detalleCanastas: (limpias: number, sucias: number) =>
      [
        limpias > 0 ? `${limpias} limpia${limpias > 1 ? 's' : ''}` : '',
        sucias > 0 ? `${sucias} sucia${sucias > 1 ? 's' : ''}` : '',
      ]
        .filter(Boolean)
        .join(' y '),
    siguienteMano: 'Siguiente mano',
    clasificacion: 'Marcador final',
  },

  culo: {
    mano: (n: number, de: number) => `Mano ${n} de ${de}`,
    cartas: (n: number) => (n === 1 ? '1 carta' : `${n} cartas`),
    cargos: {
      presidente: 'Presidente',
      vicepresidente: 'Vicepresidente',
      neutral: 'Neutral',
      viceculo: 'Viceculo',
      culo: 'Culo',
    } as Record<string, string>,
    pasa: 'Pasa',
    puesto: (p: number) => `${p}.º`,
    rondaLimpia: 'Ronda limpia: abre quien jugó el último',
    abre: (quien: string) => (quien === 'Tú' ? 'Abres tú' : `Abre ${quien}`),
    deQuien: (quien: string) => (quien === 'Tú' ? 'Tu jugada' : `De ${quien}`),
    tuTurno: 'Tu turno',
    tuTurnoAbrir: 'Tu turno: abre con cartas iguales',
    tuTurnoSuperar: (n: number) =>
      n === 1
        ? 'Tu turno: supera con una carta más alta'
        : `Tu turno: supera con ${n} cartas iguales más altas`,
    jugar: 'Jugar',
    pasar: 'Pasar',
    devolver: (n: number) => (n === 1 ? 'Devolver 1 carta' : `Devolver ${n} cartas`),
    eligeDevolver: (n: number) =>
      n === 1 ? 'Elige la carta que devuelves' : `Elige las ${n} cartas que devuelves`,
    esperaDevolver: (quien: string) => `${quien} elige qué cartas devolver`,
    hasRecibido: 'Has recibido',
    hasDado: 'Has dado',
    teDevuelven: 'Te han devuelto',
    hasDevuelto: 'Has devuelto',
    accion: (quien: string, tipo: string, cuantas: number, corta: boolean) => {
      if (tipo === 'pasar') return `${quien} pasa`;
      if (tipo === 'devolver') return `${quien} ha devuelto`;
      const que = cuantas === 1 ? 'una carta' : `${cuantas} cartas`;
      return corta ? `${quien} corta con ${que}` : `${quien} juega ${que}`;
    },
    finMano: (n: number) => `Fin de la mano ${n}`,
    puntos: (n: number) => (n === 1 ? '1 punto' : `${n} puntos`),
    masPuntos: (n: number) => `+${n}`,
    colPuesto: 'Puesto',
    colCargo: 'Cargo',
    colMano: 'Mano',
    colTotal: 'Total',
    siguienteMano: 'Siguiente mano',
    clasificacion: 'Clasificación',
  },

  holdem: {
    mano: (n: number) => `Mano ${n}`,
    ciegas: (p: number, g: number) => `Ciegas ${p}/${g}`,
    fichas: (n: number) => (n === 1 ? '1 ficha' : `${n} fichas`),
    apuesta: (n: number) => `apuesta ${n}`,
    botonTitulo: 'Botón',
    eliminado: 'Eliminado',
    retirado: 'Retirado',
    allIn: 'All-in',
    bote: (n: number) => `Bote: ${n}`,
    boteN: (i: number, n: number) => `Bote ${i}: ${n}`,
    tuTurno: 'Tu turno',
    retirarse: 'Retirarse',
    pasar: 'Pasar',
    igualar: (n: number) => `Igualar ${n}`,
    apostar: (n: number) => `Apostar ${n}`,
    subir: (n: number) => `Subir a ${n}`,
    cantidad: 'Cantidad',
    minimo: 'Mín.',
    medioBote: '½ bote',
    boteAtajo: 'Bote',
    allInAtajo: 'All-in',
    accion: (quien: string, tipo: string, cantidad: number) => {
      if (tipo === 'retirarse') return `${quien} se retira`;
      if (tipo === 'pasar') return `${quien} pasa`;
      if (tipo === 'igualar') return `${quien} iguala`;
      return `${quien} sube a ${cantidad}`;
    },
    finMano: (n: number) => `Fin de la mano ${n}`,
    sinShowdown: (quien: string, n: number) =>
      quien === 'Tú'
        ? `Te llevas el bote (${n}) sin enseñar`
        : `${quien} se lleva el bote (${n}) sin enseñar`,
    siguienteMano: 'Siguiente mano',
    clasificacion: 'Clasificación',
  },

  rummy500: {
    puntos: (n: number) => (n === 1 || n === -1 ? `${n} punto` : `${n} puntos`),
    objetivo: 'A 500',
    mano: (n: number) => `Mano ${n}`,
    detalle: (cartas: number, puntos: number) =>
      `${cartas === 1 ? '1 carta' : `${cartas} cartas`} · ${puntos} pts`,
    robarMazo: 'Robar del mazo',
    descarte: 'Descarte abierto',
    descarteVacio: 'Descarte vacío',
    cogerDesde: (carta: string, cuantas: number) =>
      cuantas === 1 ? `Coger ${carta}` : `Coger desde ${carta} (${cuantas} cartas)`,
    mesa: 'Combinaciones de la mesa',
    sinCombinaciones: 'Aún no hay combinaciones en la mesa',
    faseRobar: 'Roba del mazo o coge del descarte',
    faseBajar: 'Baja, añade o descarta',
    usaObligada: (carta: string) => `Tienes que bajar o añadir ${carta}`,
    noEncaja: 'Esa carta no encaja en esa combinación',
    dondeAs: '¿Dónde va el As?',
    arriba: 'Arriba (después de la K)',
    abajo: 'Abajo (antes del 2)',
    bajar: 'Bajar',
    descartar: 'Descartar',
    limpiar: 'Quitar selección',
    roba: (quien: string) => `${quien} roba del mazo`,
    coge: (quien: string, n: number) =>
      n === 1 ? `${quien} coge la carta del descarte` : `${quien} coge ${n} cartas del descarte`,
    baja: (quien: string) => `${quien} baja una combinación`,
    anade: (quien: string, carta: string) => `${quien} añade ${carta}`,
    descarta: (quien: string, carta: string) => `${quien} descarta ${carta}`,
    finMano: (n: number) => `Fin de la mano ${n}`,
    sinMazo: 'Se acabó el mazo',
    cierra: (quien: string) => (quien === 'Tú' ? 'Has cerrado tú' : `Ha cerrado ${quien}`),
    bajado: 'Bajado',
    enMano: 'En mano',
    manoCol: 'Mano',
    total: 'Total',
    siguienteMano: 'Siguiente mano',
    clasificacion: 'Puntos',
  },

  ginRummy: {
    marcador: (puntos: number, manos: number) =>
      `${puntos} puntos · ${manos === 1 ? '1 mano' : `${manos} manos`}`,
    fasePrimera: 'Coge la carta del descarte o pasa',
    faseRobarMazo: 'Roba una carta del mazo',
    pasar: 'Pasar',
    gin: '¡Gin!',
    pasa: (quien: string) => `${quien} pasa`,
    coge: (quien: string, carta: string) => `${quien} coge ${carta} del descarte`,
    cogidas: 'Cogió del descarte:',
    nula: 'Mano nula: se acabó el mazo y nadie suma',
    titular: (
      tipo: 'gin' | 'cierre' | 'undercut',
      cierra: string,
      gana: string,
      puntos: number,
    ) => {
      if (tipo === 'gin') {
        return cierra === 'Tú'
          ? `¡Gin! Ganas ${puntos} puntos`
          : `¡Gin de ${cierra}! Gana ${puntos} puntos`;
      }
      if (tipo === 'cierre') {
        return cierra === 'Tú'
          ? `Cierras y ganas ${puntos} puntos`
          : `Cierra ${cierra} y gana ${puntos} puntos`;
      }
      return gana === 'Tú'
        ? `¡Undercut! Ganas ${puntos} puntos`
        : `¡Undercut de ${gana}! Gana ${puntos} puntos`;
    },
    sueltos: 'Sueltos',
    colocadas: 'Colocadas en las combinaciones del rival',
    colocaN: (n: number) => (n === 1 ? 'Coloca 1 carta' : `Coloca ${n} cartas`),
    marcadorFinal: 'Marcador final',
    colPuntos: 'Puntos',
    colManos: 'Manos',
    colPartida: 'Partida',
    colTotal: 'Total',
    doble: '(doble)',
  },

  blackjack: {
    banca: 'Banca',
    mano: (n: number, total: number) => `Mano ${n} de ${total}`,
    fichas: (n: number) => (n === 1 ? '1 ficha' : `${n} fichas`),
    apuesta: (n: number) => `apuesta ${n}`,
    blanda: (n: number) => `${n - 10}/${n}`,
    doblada: 'doblada',
    leToca: (quien: string) => `Le toca a ${quien}`,
    tuApuesta: 'Tu turno: ¿cuántas fichas apuestas?',
    tuTurno: 'Tu turno: pide carta o plántate',
    pedir: 'Pedir',
    plantarse: 'Plantarse',
    doblar: 'Doblar',
    separar: 'Separar',
    finMano: (n: number) => `Fin de la mano ${n}`,
    siguienteMano: 'Siguiente mano',
    jugadorCol: 'Jugador',
    manosCol: 'Manos',
    ganaCol: 'Gana',
    fichasCol: 'Fichas',
    resultado: {
      gana: 'gana',
      blackjack: '¡blackjack!',
      empata: 'empata',
      pierde: 'pierde',
      pasa: 'se pasa',
    },
    clasificacion: 'Fichas',
  },

  picas: {
    rivalN: (n: number) => `Rival ${n}`,
    nil: 'Nil',
    detalle: (apuesta: number | null, bazas: number) =>
      apuesta === null
        ? `${bazas} bazas`
        : apuesta === 0
          ? `Nil · ${bazas}`
          : `${apuesta} / ${bazas}`,
    contrato: (lado: string, contrato: number, bazas: number) => `${lado} ${bazas} de ${contrato}`,
    puntos: (lado: string, puntos: number, sacos: number) =>
      `${lado}: ${puntos} (${sacos === 1 ? '1 saco' : `${sacos} sacos`})`,
    rotas: 'Picas rotas',
    apostar: '¿Cuántas bazas harás?',
    apostarNota: 'Nil: no hacer ninguna (±100). Tu pareja suma tu apuesta a la suya.',
    esperando: 'Esperando las apuestas…',
    yaApostaron: 'Apuestas',
    sinApostar: '—',
    apuesta: (n: number) => (n === 0 ? 'Nil' : String(n)),
    finMano: (n: number) => `Fin de la mano ${n}`,
    siguienteMano: 'Siguiente mano',
    jugadorCol: 'Jugador',
    apuestaCol: 'Apuesta',
    bazasCol: 'Bazas',
    parejaCol: 'Pareja',
    contratoCol: 'Contrato',
    manoCol: 'Mano',
    sacosCol: 'Sacos',
    totalCol: 'Total',
    penalizacion: (lado: string) => `${lado}: 10 sacos, −100`,
    finPartida: 'Gana la primera pareja que llega a 500 puntos.',
    clasificacion: 'Puntos',
  },

  ochoLoco: {
    rivalN: (n: number) => `Rival ${n}`,
    cartas: (n: number) => (n === 1 ? '1 carta' : `${n} cartas`),
    puntos: (n: number) => (n === 1 ? '1 punto' : `${n} puntos`),
    mazo: (n: number) => (n === 1 ? '1 carta en el mazo' : `${n} cartas en el mazo`),
    toca: (palo: string) => `Toca: ${palo}`,
    eligePalo: 'Elige el palo que sigue',
    robar: 'Robar',
    pasar: 'Pasar',
    leToca: (quien: string) => `Le toca a ${quien}`,
    tuTurno: 'Tu turno: juega una carta del mismo palo o número, o un 8',
    tuTurnoRobar: 'No tienes ninguna carta que case: roba una',
    tuRobada: 'Puedes jugar la carta que has robado o pasar',
    robadaNoCasa: 'La carta que has robado no casa: pasa',
    nadaQueRobar: 'No queda nada que robar: pasa',
    jugo: (carta: string, palo: string | null) => (palo === null ? carta : `${carta} → ${palo}`),
    robo: 'Roba',
    paso: 'Pasa',
    finMano: (n: number) => `Fin de la mano ${n}`,
    siguienteMano: 'Siguiente mano',
    ganaMano: (quien: string, puntos: number) =>
      `${quien === 'Tú' ? 'Ganas' : `Gana ${quien}`} la mano: ${puntos === 1 ? '1 punto' : `${puntos} puntos`}`,
    bloqueada: 'Mano bloqueada: nadie podía jugar ni robar',
    empate: 'Empate con menos puntos: nadie se apunta nada',
    jugadorCol: 'Jugador',
    enManoCol: 'En la mano',
    ganaCol: 'Gana',
    totalCol: 'Total',
    clasificacion: 'Puntos',
  },

  cuatrola: {
    rivalN: (n: number) => `Rival ${n}`,
    triunfo: 'Triunfo',
    sinTriunfo: 'por elegir',
    palo: (palo: string) => palo.charAt(0).toUpperCase() + palo.slice(1),
    mano: (n: number, total: number) => `Mano ${n} de ${total}`,
    fichas: (n: number) => fichasConSigno(n),
    numero: (n: number) => conSigno(n),
    modalidad: (m: 'rey' | 'solo') => (m === 'rey' ? 'con rey' : 'solo'),
    conRey: 'Con rey',
    solo: 'Solo',
    paso: 'Paso',
    sinPuja: 'Sin pujas',
    juega: (quien: string, m: 'rey' | 'solo') =>
      quien === 'Tú'
        ? `Juegas ${m === 'rey' ? 'con rey' : 'solo'}`
        : `Juega ${quien} ${m === 'rey' ? 'con rey' : 'solo'}`,
    llama: (carta: string) => `Llama al ${carta}`,
    companero: (quien: string) => `Compañero: ${quien}`,
    eresCompanero: 'Eres el compañero',
    bazasBando: (jugador: number, defensores: number) => `Bazas ${jugador} – ${defensores}`,
    subasta: 'Subasta',
    tuTurno: (m: 'rey' | 'solo' | null) =>
      m === null ? 'Nadie ha pujado: ¿juegas?' : 'Ya se juega con rey: ¿subes a solo?',
    eligeTriunfo: 'Has ganado la subasta: elige el triunfo',
    eligeLlamada: 'Elige el rey que llamas',
    detalle: (dicho: 'rey' | 'solo' | 'paso' | null, fichas: number) => {
      const saldo = fichasConSigno(fichas);
      return dicho === 'paso'
        ? `pasa · ${saldo}`
        : dicho === null
          ? saldo
          : `${dicho === 'rey' ? 'con rey' : 'solo'} · ${saldo}`;
    },
    detalleBazas: (papel: string, bazas: number, fichas: number) =>
      `${papel}${bazas === 1 ? '1 baza' : `${bazas} bazas`} · ${conSigno(fichas)}`,
    papelJugador: 'juega · ',
    papelCompanero: 'compañero · ',
    pasa: (quien: string) => (quien === 'Tú' ? 'Pasas' : `${quien} pasa`),
    pujaAviso: (quien: string, m: 'rey' | 'solo') =>
      quien === 'Tú'
        ? `Pujas ${m === 'rey' ? 'con rey' : 'solo'}`
        : `${quien} puja ${m === 'rey' ? 'con rey' : 'solo'}`,
    eligio: (quien: string, palo: string, carta: string | null) =>
      `${quien === 'Tú' ? 'Triunfo' : `${quien}: triunfo`} ${palo}${carta === null ? '' : `, llama al ${carta}`}`,
    descubre: (quien: string) =>
      quien === 'Tú' ? '¡Eres el compañero!' : `${quien} es el compañero`,
    todosPasaron: 'Pasaron todos: se reparte otra vez',
    finMano: (n: number) => (n === 1 ? 'Fin de la primera mano' : `Fin de la mano ${n}`),
    resultado: (quien: string, gana: boolean, bola: boolean) =>
      `${quien === 'Tú' ? (gana ? 'Ganas' : 'Pierdes') : `${quien} ${gana ? 'gana' : 'pierde'}`}${bola ? ' con bola' : ''}`,
    bazasMano: (jugador: number, defensores: number) =>
      `Bazas: jugador ${jugador} · defensores ${defensores}`,
    jugadorCol: 'Jugador',
    cambioCol: 'Mano',
    fichasCol: 'Fichas',
    clasificacion: 'Fichas',
    siguienteMano: 'Siguiente mano',
  },

  piramide: {
    sinLimite: 'Vueltas sin límite',
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

  scorpion: {
    reserva: (n: number) => (n === 0 ? 'Reserva repartida' : `Reserva: ${n} cartas`),
    repartirReserva: 'Repartir la reserva',
  },

  canfield: {
    base: 'Base',
    reserva: (n: number) => (n === 0 ? 'Reserva vacía' : `Reserva: ${n} cartas`),
    reservaRotulo: 'Reserva',
  },

  yukon: {
    porColores: 'Colores alternos',
    porPalo: 'Mismo palo',
  },

  tripeaks: {
    puntos: 'Puntos',
    racha: (n: number) => (n === 0 ? 'Sin racha' : `Racha ×${n}`),
    bocaAbajo: 'Carta boca abajo',
    puntosFin: (n: number) => (n === 1 ? '1 punto' : `${n} puntos`),
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
    mejorPuntuacion: 'Mejor puntuación',
    borrar: 'Borrar estadísticas',
    confirmarBorrar: '¿Seguro que quieres borrar todas las estadísticas? No se puede deshacer.',
    rachaEnCurso: (n: number) => `Llevas ${n} victorias seguidas`,
    nuevaMejorRacha: '¡Tu mejor racha!',
    recordTiempo: '¡Nuevo récord de tiempo!',
    recordMovimientos: '¡Nuevo récord de movimientos!',
    recordPuntos: '¡Nuevo récord de puntos!',
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
    resumenGolf: (movs: number, tiempo: string) => `${movs} movimientos en ${tiempo}`,
    resumenPiramide: (movs: number, tiempo: string) => `${movs} movimientos en ${tiempo}`,
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
      piramide: 'Cómo se juega a la Pirámide',
      golf: 'Cómo se juega al Golf',
      tripeaks: 'Cómo se juega a TriPeaks',
      yukon: 'Cómo se juega al Yukon',
      canfield: 'Cómo se juega al Canfield',
      cuarentaLadrones: 'Cómo se juega a Cuarenta ladrones',
      scorpion: 'Cómo se juega al Scorpion',
      corazones: 'Cómo se juega a los Corazones',
      pocha: 'Cómo se juega a la Pocha',
      mus: 'Cómo se juega al Mus',
      burro: 'Cómo se juega al Burro',
      pinacle: 'Cómo se juega al Pinacle',
      butifarra: 'Cómo se juega a la Butifarra',
      truc: 'Cómo se juega al Truc',
      julepe: 'Cómo se juega al Julepe',
      tuteSubastado: 'Cómo se juega al Tute subastado',
      cuatrola: 'Cómo se juega a la Cuatrola',
      mentiroso: 'Cómo se juega al Mentiroso',
      ochoLoco: 'Cómo se juega al Ocho loco',
      picas: 'Cómo se juega a Picas',
      blackjack: 'Cómo se juega al Blackjack',
      ginRummy: 'Cómo se juega al Gin Rummy',
      rummy500: 'Cómo se juega al Rummy 500',
      holdem: 'Cómo se juega al Texas Hold’em',
      culo: 'Cómo se juega al Culo',
      canasta: 'Cómo se juega a la Canasta',
      whist: 'Cómo se juega al Whist',
      sevens: 'Cómo se juega al Sevens',
      casino: 'Cómo se juega al Casino',
      durak: 'Cómo se juega al Durak',
      euchre: 'Cómo se juega al Euchre',
      bigTwo: 'Cómo se juega al Big Two',
      cribbage: 'Cómo se juega al Cribbage',
      belote: 'Cómo se juega al Belote',
      schnapsen: 'Cómo se juega al Schnapsen',
      skat: 'Cómo se juega al Skat',
      ohHell: 'Cómo se juega al Oh Hell',
      remigio: 'Cómo se juega al Remigio',
      red: 'Cómo se juega en red',
    },
    puntos: (n: number) => (n === 1 ? '1 punto' : `${n} puntos`),
    matadores: ['Espadilla', 'Malilla', 'Basto', 'Punto'],
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

    ohHell: [
      {
        titulo: 'El objetivo',
        texto: [
          'De 3 a 7 jugadores, cada uno por su cuenta, con la baraja francesa de 52. En cada mano tienes que acertar exactamente cuántas bazas harás.',
          'Gana quien tenga más puntos al acabar la última mano.',
        ],
      },
      {
        titulo: 'Las manos',
        texto: [
          'La primera mano reparte todas las cartas posibles dejando una (17 con 3 jugadores, 12 con 4, 10 con 5, 8 con 6 y 7 con 7). Cada mano reparte una carta menos hasta llegar a 1, y después vuelven a subir hasta el máximo.',
          'Tras repartir se pone boca arriba la siguiente carta: su palo es el triunfo.',
        ],
      },
      {
        titulo: 'Las apuestas',
        texto: [
          'Desde la izquierda del repartidor, cada uno dice cuántas bazas hará, de 0 a las cartas de la mano.',
          'El repartidor apuesta el último y no puede elegir el número que haría que la suma de las apuestas fuera igual a las cartas repartidas: siempre falla alguien.',
        ],
      },
      {
        titulo: 'Las bazas',
        texto: [
          'Sale el de la izquierda del repartidor. Hay que seguir el palo de salida si se puede; si no, se juega cualquier carta, sin obligación de fallar.',
          'La baza la gana el triunfo más alto o, si no hay, la carta más alta del palo de salida. El As es la carta más alta de cada palo.',
        ],
      },
      {
        titulo: 'Los puntos',
        texto: [
          'Si haces exactamente las bazas que apostaste, sumas 10 más lo apostado: apostar 0 y no hacer ninguna vale 10.',
          'Si haces más o menos, no sumas nada.',
        ],
      },
      {
        titulo: 'Consejos',
        texto: [
          'Cuenta como bazas seguras los Ases y los triunfos altos; los reyes solo valen si hay pocos jugadores.',
          'Cuando ya tengas tus bazas, juega la carta más alta que no gane para deshacerte del peligro.',
        ],
      },
    ],

    skat: [
      {
        titulo: 'El objetivo',
        texto: [
          'Tres jugadores con 32 cartas de la baraja francesa, del 7 al As. En cada mano, uno juega solo (el solista) contra los otros dos.',
          'El solista suma el valor de su juego si gana y resta el doble si pierde. Tras las rondas elegidas, gana quien tiene más puntos.',
        ],
      },
      {
        titulo: 'La subasta',
        texto: [
          'Cada uno recibe 10 cartas y quedan 2 boca abajo: el Skat. El de la izquierda del repartidor es Vorhand, el siguiente Mittelhand y el repartidor Hinterhand.',
          'Mittelhand puja a Vorhand (18, 20, 22, 23, 24, 27…) y Vorhand responde «sí» o pasa. El que queda se enfrenta a Hinterhand. Quien gana es el solista.',
          'Si nadie puja, Vorhand puede jugar con 18 o pasar, y se reparte de nuevo.',
        ],
      },
      {
        titulo: 'El Skat y el juego',
        texto: [
          'El solista puede coger el Skat y descartarse de 2 cartas, o jugar de mano sin mirarlo. Los puntos del Skat son suyos.',
          'Después elige el juego: un palo de triunfo, Grand (solo las J son triunfo) o Nulo (no hacer ninguna baza). Jugando de mano puede anunciar schneider, schwarz u ouvert.',
        ],
      },
      {
        titulo: 'Las cartas y las bazas',
        texto: [
          'Las cuatro J son los triunfos más altos: J♣, J♠, J♥ y J♦. Después van el As, el 10, el K, la Q, el 9, el 8 y el 7. Las J cuentan como triunfo, no como su palo.',
          'Hay que seguir el palo de salida si se puede, pero no hay obligación de fallar. Las cartas valen As 11, 10 10, K 4, Q 3 y J 2: 120 en total.',
          'En Nulo no hay triunfo y el orden es A, K, Q, J, 10, 9, 8 y 7.',
        ],
      },
      {
        titulo: 'Ganar y el valor del juego',
        texto: [
          'El solista gana con 61 puntos o más. Si el perdedor hace 30 o menos es schneider, y si no hace ninguna baza, schwarz.',
          'El valor es la base (♦ 9, ♥ 10, ♠ 11, ♣ 12, Grand 24) por el multiplicador: las J seguidas que tiene o le faltan desde la de tréboles, más 1 por el juego y 1 por mano, schneider, schwarz y cada anuncio. El Nulo vale 23, 35 de mano, 46 ouvert o 59 ouvert de mano.',
          'Si el juego vale menos de lo pujado, el solista pierde.',
        ],
      },
      {
        titulo: 'Consejos',
        texto: [
          'Puja con J y un palo largo, o con varias J y Ases para un Grand. Calcula el valor antes de seguir subiendo.',
          'Como defensor, si tu compañero va ganando la baza y juegas el último, échale tus cartas de más puntos.',
        ],
      },
    ],

    schnapsen: [
      {
        titulo: 'El objetivo',
        texto: [
          'Un juego de bazas para dos con 20 cartas de la baraja francesa: As, 10, K, Q y J de cada palo. Gana la mano quien llega antes a 66 puntos.',
          'Cada mano da 1, 2 o 3 puntos de partida, y gana la partida quien llega antes a 7.',
        ],
      },
      {
        titulo: 'Las cartas',
        texto: [
          'El orden es As (11 puntos), 10 (10), K (4), Q (3) y J (2). La carta vuelta, boca arriba bajo el mazo, marca el triunfo.',
          'La baza la gana el triunfo más alto o, si no hay, la más alta del palo de salida. Tras cada baza roba primero quien la ganó.',
        ],
      },
      {
        titulo: 'Con el mazo abierto',
        texto: [
          'Mientras quedan cartas en el mazo se puede jugar cualquier carta, sin seguir el palo.',
          'Al salir, si tienes la J del triunfo puedes cambiarla por la carta vuelta.',
          'Al salir, si tienes el K y la Q de un palo puedes cantarlos: 20 puntos, o 40 en el triunfo. Después sales con uno de los dos. Los puntos del cante cuentan cuando hayas ganado alguna baza.',
        ],
      },
      {
        titulo: 'Cerrar el mazo',
        texto: [
          'Al salir puedes cerrar el mazo: ya no se roba y se juega como cuando el mazo se acaba, con reglas estrictas.',
          'Con reglas estrictas hay que seguir el palo y ganar la baza si se puede; sin el palo, hay que fallar con triunfo.',
          'Si cierras, tienes que llegar a 66. Si no lo consigues, gana la mano el rival.',
        ],
      },
      {
        titulo: 'Los puntos de partida',
        texto: [
          'Quien gana la mano se apunta 3 si el rival no hizo ninguna baza, 2 si hizo menos de 33 puntos y 1 si no.',
          'Si nadie llega a 66 con el mazo agotado, gana quien hace la última baza. Si quien cerró no llega, el rival se apunta 2, o 3 si no tenía bazas al cerrar.',
        ],
      },
      {
        titulo: 'Consejos',
        texto: [
          'Con el mazo abierto, sal con cartas bajas y guarda los triunfos y las parejas para cantar.',
          'Cierra el mazo cuando tengas los 66 casi asegurados, sobre todo si el rival aún no ha hecho bazas.',
        ],
      },
    ],

    belote: [
      {
        titulo: 'El objetivo',
        texto: [
          'Cuatro jugadores en dos parejas: tu compañero se sienta enfrente. Se juega con 32 cartas de la baraja francesa, del 7 al As, y se trata de hacer con tu pareja más puntos que la otra en las bazas.',
          'Gana la pareja que tiene más puntos al terminar una mano en la que alguna llega a 501.',
        ],
      },
      {
        titulo: 'Elegir el triunfo',
        texto: [
          'Cada uno recibe 5 cartas y se pone una boca arriba: la carta vuelta. Por turno, cada jugador puede tomarla, y su palo es el triunfo. Si todos pasan, hay una segunda vuelta para nombrar cualquier otro palo; si vuelven a pasar todos, se reparte de nuevo.',
          'Quien elige el triunfo se lleva la carta vuelta y 2 cartas más, y los demás 3: todos acaban con 8.',
        ],
      },
      {
        titulo: 'Las cartas',
        texto: [
          'En el triunfo mandan la J (20 puntos) y el 9 (14), y después el As (11), el 10 (10), el K (4), la Q (3), el 8 y el 7.',
          'En los demás palos el orden es As (11), 10 (10), K (4), Q (3), J (2), 9, 8 y 7. Las cartas suman 152 puntos, y la última baza vale 10 más.',
        ],
      },
      {
        titulo: 'Jugar las bazas',
        texto: [
          'Hay que seguir el palo de salida. Si se sale de triunfo, hay que montar: jugar un triunfo más alto si se tiene.',
          'Si no tienes el palo, tienes que fallar con un triunfo (montando si ya hay otro), salvo que la baza la vaya ganando tu compañero.',
          'Si tienes el K y la Q del triunfo, al jugarlos dices «Belote» y «Rebelote» y tu pareja suma 20.',
        ],
      },
      {
        titulo: 'Los puntos',
        texto: [
          'La pareja que eligió el triunfo tiene que hacer al menos tantos puntos como la otra. Si lo consigue, cada pareja se apunta los suyos.',
          'Si no, está dentro: los rivales se apuntan los 162. Si una pareja hace las 8 bazas, es capot y se apunta 252.',
        ],
      },
      {
        titulo: 'Consejos',
        texto: [
          'Toma con la J o el 9 del triunfo y al menos dos triunfos más. Los Ases de otros palos ayudan mucho.',
          'Cuando la baza ya es de tu compañero y juegas el último, échale tus cartas de más valor.',
        ],
      },
    ],

    cribbage: [
      {
        titulo: 'El objetivo',
        texto: [
          'Dos jugadores con la baraja francesa. Se suman puntos al jugar las cartas y al contar la mano, y gana el primero que llega a 121, aunque sea a mitad de mano.',
          'Cada uno recibe 6 cartas y echa 2 al crib, una mano extra que cuenta para el que reparte. Después se descubre el starter, que cuenta para todas las manos; si es una J, el que reparte suma 2.',
        ],
      },
      {
        titulo: 'Jugar las cartas',
        texto: [
          'Por turnos, cada uno juega una carta y se suma su valor (el As 1, las figuras 10) sin pasar de 31. Sumas 2 si llegas a 15 o a 31, 2 por pareja con la carta anterior (6 por trío, 12 por póker) y 1 por carta si las últimas forman una escalera de 3 o más, aunque estén desordenadas.',
          'Si no te cabe ninguna carta, dices «go» y el otro sigue mientras pueda; el último en jugar suma 1. La cuenta vuelve a 0, y la última carta de la mano también suma 1.',
        ],
      },
      {
        titulo: 'El recuento',
        texto: [
          'Al acabar se cuentan, con el starter: primero la mano del que no reparte, después la del que reparte y al final su crib. Cada combinación que suma 15 vale 2; cada pareja, 2; cada escalera, 1 por carta; el color, 4 (5 con el starter; en el crib, solo 5), y la J del palo del starter, 1.',
        ],
      },
      {
        titulo: 'Consejos',
        texto: [
          'Guarda los cincos y las parejas, y si el crib es del otro, no le eches cincos ni cartas que sumen 15.',
          'Al jugar, evita dejar la cuenta en 5 o en 21: un 10 del otro le da 15 o 31.',
        ],
      },
    ],

    bigTwo: [
      {
        titulo: 'El objetivo',
        texto: [
          'Cuatro jugadores, cada uno por su cuenta, con la baraja francesa entera: 13 cartas cada uno. Hay que quedarse sin cartas antes que nadie.',
          'Al acabar cada mano, los demás suman un punto por cada carta que les queda (el doble con 10 o más, el triple con 13). Cuando alguien llega a 50, gana quien menos puntos tiene.',
        ],
      },
      {
        titulo: 'El orden',
        texto: [
          'De menor a mayor: 3, 4, 5, 6, 7, 8, 9, 10, J, Q, K, A y 2. A igual número desempata el palo: ♦, ♣, ♥ y ♠, de menor a mayor.',
        ],
      },
      {
        titulo: 'Las jugadas',
        texto: [
          'Puedes soltar una carta, una pareja, un trío o una jugada de 5. Las de 5, de menor a mayor: escalera (5 números seguidos, sin dar la vuelta), color (5 del mismo palo), full (trío y pareja), póker (cuatro iguales y otra) y escalera de color.',
          'Una jugada solo se supera con otra del mismo número de cartas y más alta.',
        ],
      },
      {
        titulo: 'Las rondas',
        texto: [
          'Empieza quien tiene el 3♦, y su primera jugada tiene que llevarlo. Por turno, cada uno supera la jugada de la mesa o pasa; pasar no impide jugar después.',
          'Cuando los otros tres pasan seguidos, quien hizo la última jugada sale con lo que quiera.',
        ],
      },
      {
        titulo: 'Consejos',
        texto: [
          'Suelta pronto tus cartas bajas en parejas o jugadas de 5, y guarda los 2 para recuperar la salida cuando haga falta.',
          'Si a un rival le quedan pocas cartas, no le dejes salir con sueltas: juega fuerte.',
        ],
      },
    ],

    euchre: [
      {
        titulo: 'El objetivo',
        texto: [
          'Cuatro jugadores en dos parejas: tu compañero se sienta enfrente. Se juega con 24 cartas de la baraja francesa, del 9 al As, y se trata de hacer al menos 3 de las 5 bazas de cada mano.',
          'Gana la pareja que llega antes a 10 puntos.',
        ],
      },
      {
        titulo: 'Elegir el triunfo',
        texto: [
          'Cada uno recibe 5 cartas y se pone una boca arriba: la carta vuelta. Por turno, cada jugador puede pedir su palo como triunfo; si alguien lo pide, el repartidor se queda la carta vuelta y se descarta de otra.',
          'Si todos pasan, hay una segunda vuelta para nombrar cualquier otro palo. Si vuelven a pasar todos, se reparte de nuevo. Quien elige el triunfo puede jugar solo: su compañero deja la mano.',
        ],
      },
      {
        titulo: 'Las jotas',
        texto: [
          'La J del triunfo es la carta más alta. La segunda es la J del otro palo del mismo color, que pasa a ser del triunfo: con corazones de triunfo, la J de diamantes es un corazón. Después van el As, el K, la Q, el 10 y el 9.',
          'Hay que seguir el palo de salida si se puede, y la baza la gana el triunfo más alto o la carta más alta del palo de salida.',
        ],
      },
      {
        titulo: 'Los puntos',
        texto: [
          'Si la pareja que eligió el triunfo hace 3 o 4 bazas, gana 1 punto; si hace las 5, 2 puntos, o 4 si jugaba solo.',
          'Si hace menos de 3, es un euchre: los rivales ganan 2 puntos.',
        ],
      },
      {
        titulo: 'Consejos',
        texto: [
          'Pide con las dos jotas o con tres triunfos buenos. Si el repartidor es rival, recuerda que la carta vuelta se la queda él.',
          'Si tu compañero eligió el triunfo, no gastes tus triunfos en bazas que ya lleva él.',
        ],
      },
    ],

    durak: [
      {
        titulo: 'El objetivo',
        texto: [
          'De 2 a 6 jugadores, cada uno por su cuenta, con una baraja francesa de 36 cartas: del 6 al As, y el As es la más alta. Hay que quedarse sin cartas: el último que se queda con ellas es el durak, el tonto, y pierde.',
          'Cada uno recibe 6 cartas. La última del mazo se pone boca arriba debajo de él y marca el triunfo.',
        ],
      },
      {
        titulo: 'Atacar y defender',
        texto: [
          'Empieza quien tiene el triunfo más bajo, atacando al de su izquierda con una carta cualquiera. El defensor tiene que ganarla con una más alta del mismo palo o con un triunfo, o llevarse las cartas de la mesa.',
          'Cuando ha ganado todo lo que hay, los demás pueden echar más cartas de un número que ya esté en la mesa, empezando por el atacante. Como mucho hay 6 ataques por ronda.',
        ],
      },
      {
        titulo: 'Fin de la ronda',
        texto: [
          'Si el defensor lo gana todo, las cartas van al descarte y él ataca después. Si se las lleva, pierde su turno de atacar.',
          'Después todos roban hasta tener 6, el defensor el último. Con el mazo vacío, quien se queda sin cartas sale y ya está a salvo.',
        ],
      },
      {
        titulo: 'Consejos',
        texto: [
          'Guarda los triunfos para el final: con el mazo vacío deciden la partida.',
          'Ataca con números que tengas repetidos, para echar después la pareja. A veces conviene llevarse cartas bajas al principio en vez de gastar un triunfo alto.',
        ],
      },
    ],

    casino: [
      {
        titulo: 'El objetivo',
        texto: [
          'De 2 a 4 jugadores con la baraja francesa de 52 cartas; con 4 se puede jugar en parejas. Se trata de recoger cartas de la mesa, sobre todo las que dan puntos.',
          'Cada uno recibe 4 cartas y se ponen 4 boca arriba en la mesa. Cuando todos se quedan sin cartas, se reparten otras 4 hasta acabar el mazo. Gana quien llega antes a 21 puntos.',
        ],
      },
      {
        titulo: 'Recoger',
        texto: [
          'En tu turno juegas una carta. El As vale 1 y del 2 al 10, su número. Con ella recoges las cartas iguales de la mesa, las combinaciones que suman su valor (un 8 recoge un 5 con un 3) y las construcciones de ese valor.',
          'Las figuras (J, Q y K) solo recogen otra igual. Si al recoger dejas la mesa vacía, haces barrida.',
        ],
      },
      {
        titulo: 'Construir',
        texto: [
          'También puedes juntar tu carta con cartas de la mesa en un montón con un valor, si tienes en la mano otra carta de ese valor para recogerlo después: con un 3 sobre un 5, teniendo un 8, construyes un 8.',
          'Puedes subir una construcción, también la de un rival (un 2 sobre un 6 la sube a 8), o hacerla múltiple añadiéndole cartas que sumen lo mismo; una múltiple ya no se sube. Mientras tengas una construcción en la mesa, no puedes dejar cartas sin más.',
        ],
      },
      {
        titulo: 'Los puntos',
        texto: [
          'Al acabar la mano, lo que queda en la mesa es del último que recogió. Más cartas: 3 puntos. Más picas: 1. El 10 de diamantes (Big Casino): 2. El 2 de picas (Little Casino): 1. Cada As: 1. Cada barrida: 1.',
        ],
      },
      {
        titulo: 'Consejos',
        texto: [
          'Construye para asegurarte cartas que nadie más puede llevarse, pero vigila: un rival puede subir tu construcción y quitártela.',
          'No dejes en la mesa Ases, picas ni los dos Casinos si puedes evitarlo.',
        ],
      },
    ],

    sevens: [
      {
        titulo: 'El objetivo',
        texto: [
          'De 3 a 6 jugadores, cada uno por su cuenta, con la baraja francesa de 52 cartas. Hay que quedarse sin cartas antes que nadie.',
          'Al acabar cada mano, los demás suman un punto por cada carta que les queda. Cuando alguien llega a 50, gana quien menos puntos tiene.',
        ],
      },
      {
        titulo: 'Las escaleras',
        texto: [
          'Abre la mano quien tiene el 7 de diamantes. Cada palo forma en la mesa una escalera que empieza por su 7.',
          'Puedes poner el 7 de un palo que aún no está, o alargar una escalera con la carta siguiente: hacia arriba hasta la K y hacia abajo hasta el As.',
        ],
      },
      {
        titulo: 'Jugar o pasar',
        texto: [
          'Si puedes jugar, tienes que hacerlo. Si no tienes ninguna carta que encaje, pasas.',
        ],
      },
      {
        titulo: 'Consejos',
        texto: [
          'Guarda las cartas que abren camino a los rivales y juega primero las que te acercan otras tuyas.',
          'Los sietes de palos donde tienes pocas cartas pueden esperar: abrirlos ayuda a los demás.',
        ],
      },
    ],

    whist: [
      {
        titulo: 'El objetivo',
        texto: [
          'Cuatro jugadores en dos parejas: tu compañero se sienta enfrente. Se juega con la baraja francesa de 52 cartas y se trata de hacer bazas.',
          'La partida se juega al mejor de tres juegos, y cada juego se gana al llegar a 5 puntos.',
        ],
      },
      {
        titulo: 'El triunfo',
        texto: [
          'Cada jugador recibe 13 cartas. La última es para el repartidor y se enseña: su palo es el triunfo de la mano.',
        ],
      },
      {
        titulo: 'Las bazas',
        texto: [
          'Sale el jugador a la izquierda del repartidor. Hay que seguir el palo de salida si se puede; si no, se juega cualquier carta.',
          'Gana la baza el triunfo más alto o, si no hay triunfos, la carta más alta del palo de salida (el As es la más alta). Quien la gana sale en la siguiente.',
        ],
      },
      {
        titulo: 'Los puntos',
        texto: [
          'Al acabar la mano, la pareja que ha hecho más de 6 bazas suma 1 punto por cada baza de más: con 9 bazas, 3 puntos.',
          'La primera pareja que llega a 5 gana el juego; los puntos que sobren se pierden y el juego siguiente empieza de 0.',
        ],
      },
      {
        titulo: 'Consejos',
        texto: [
          'Si tu compañero ya gana la baza, no se la quites: juega una carta baja.',
          'Sal de tu palo más largo y guarda los triunfos para fallar las cartas buenas de los rivales.',
        ],
      },
    ],

    canasta: [
      {
        titulo: 'El objetivo',
        texto: [
          'Cuatro jugadores en dos parejas, con dos barajas francesas y cuatro jokers. Se juega a 5.000 puntos: la pareja que llega primero gana.',
          'Los puntos se ganan bajando combinaciones de cartas del mismo valor, y sobre todo canastas: combinaciones de siete cartas.',
        ],
      },
      {
        titulo: 'El turno',
        texto: [
          'Roba una carta del mazo o llévate el pozo entero. Después baja combinaciones o añade cartas a las de tu pareja, y termina descartando una carta.',
          'Una combinación tiene 3 o más cartas del mismo valor, al menos dos naturales y como mucho tres comodines (jokers y doses). Una canasta de siete sin comodines es limpia (500) y con comodines, sucia (300).',
        ],
      },
      {
        titulo: 'La primera bajada',
        texto: [
          'La primera vez que tu pareja baja en cada mano, lo que bajes en ese turno tiene que sumar un mínimo: 50 al empezar, 90 desde 1.500 y 120 desde 3.000 (15 si vais en negativo).',
          'Mientras no llegues al mínimo puedes deshacer lo que has bajado.',
        ],
      },
      {
        titulo: 'El pozo',
        texto: [
          'Para llevarte el pozo tienes que bajar en el momento la carta de arriba con cartas de tu mano. Si está congelado (tiene un comodín, o tu pareja aún no ha bajado), necesitas dos naturales de ese valor.',
          'Con un 3 negro o un comodín arriba no se puede coger: descartar un 3 negro tapa el pozo para el siguiente.',
        ],
      },
      {
        titulo: 'Los treses rojos y cerrar',
        texto: [
          'Los treses rojos se bajan solos y valen 100 (800 los cuatro), a favor si tu pareja ha bajado y en contra si no.',
          'Para quedarte sin cartas y cerrar, tu pareja necesita al menos una canasta. Cerrar vale 100. Al final, lo que queda en la mano resta.',
        ],
      },
      {
        titulo: 'Consejos',
        texto: [
          'El pozo grande vale mucho: guarda parejas para poder llevártelo, y congélalo con un comodín si los rivales lo van a coger.',
          'No descartes cartas del valor de las combinaciones de los rivales.',
        ],
      },
    ],

    culo: [
      {
        titulo: 'El objetivo',
        texto: [
          'De 3 a 6 jugadores, cada uno por su cuenta, con la baraja española de 40 cartas. En cada mano hay que quedarse sin cartas antes que los demás.',
          'La partida dura 5 manos. Cada puesto da puntos: el último 0, el penúltimo 1, y así hasta el primero. Gana quien más puntos suma.',
        ],
      },
      {
        titulo: 'Las cartas',
        texto: [
          'De menor a mayor: 3, 4, 5, 6, 7, sota, caballo, rey, As y 2. Los palos no cuentan.',
        ],
      },
      {
        titulo: 'Las rondas',
        texto: [
          'Quien abre juega de 1 a 4 cartas del mismo valor. Los siguientes tienen que jugar el mismo número de cartas de un valor más alto, o pasar.',
          'Pasar no te saca de la ronda: si te vuelve a tocar, puedes jugar. Cuando todos los demás pasan, la ronda se limpia y abre quien jugó el último.',
          'Los doses cortan: limpian la ronda al instante y vuelve a abrir quien los jugó.',
          'En la primera mano abre quien tiene el 3 de oros; en las siguientes, el culo.',
        ],
      },
      {
        titulo: 'Los cargos y el intercambio',
        texto: [
          'El primero en quedarse sin cartas es el presidente y el último el culo. Con 4 o más, el segundo es el vicepresidente y el penúltimo el viceculo.',
          'Desde la segunda mano, el culo da sus 2 mejores cartas al presidente, que le devuelve 2 a su elección. El viceculo da su mejor carta al vicepresidente, que le devuelve 1.',
        ],
      },
      {
        titulo: 'Consejos',
        texto: [
          'Quítate pronto las cartas bajas, mejor por parejas o tríos, y no rompas los grupos si puedes evitarlo.',
          'Guarda los doses para el final: cortar y abrir con tus últimas cartas es la forma más segura de salir.',
          'Si eres presidente, devuelve las cartas sueltas más bajas.',
        ],
      },
    ],

    holdem: [
      {
        titulo: 'El objetivo',
        texto: [
          'Un torneo de póker de 2 a 6 jugadores. Cada uno empieza con 100 fichas; quien se queda sin ellas queda eliminado, y gana el último que queda.',
          'Las ciegas empiezan en 1/2 y suben cada 10 manos.',
        ],
      },
      {
        titulo: 'La mano',
        texto: [
          'Cada jugador recibe dos cartas tapadas. Hay cuatro rondas de apuestas: antes del flop, con el flop (tres cartas comunes), con el turn (una más) y con el river (la quinta).',
          'En tu turno puedes retirarte, pasar si no hay nada que igualar, igualar o subir. Sin límite: puedes subir lo que quieras, hasta todas tus fichas (all-in). La subida mínima es la última subida de la ronda.',
        ],
      },
      {
        titulo: 'El showdown',
        texto: [
          'Si todos se retiran menos uno, ese se lleva el bote. Si no, se enseñan las cartas y gana la mejor mano de cinco cartas entre tus dos y las cinco comunes.',
          'Si alguien va all-in, lo que los demás apuestan por encima va a un bote aparte que solo pueden ganar ellos.',
        ],
      },
      {
        titulo: 'Las manos',
        texto: [
          'De mayor a menor: escalera de color, póker, full, color, escalera, trío, doble pareja, pareja y carta alta. El As puede ir alto o bajo en una escalera (A-2-3-4-5).',
        ],
      },
      {
        titulo: 'Consejos',
        texto: [
          'Juega pocas manos antes del flop y apuesta fuerte las buenas.',
          'Fíjate en lo que te cuesta igualar frente a lo que hay en el bote: si es caro y tu mano es floja, retírate.',
        ],
      },
    ],

    rummy500: [
      {
        titulo: 'El objetivo',
        texto: [
          'De 2 a 4 jugadores, cada uno por su cuenta, con la baraja francesa. Se reparten 13 cartas a cada uno con 2 jugadores y 7 con 3 o 4.',
          'Gana quien más puntos tenga cuando alguien llega a 500.',
        ],
      },
      {
        titulo: 'Combinaciones',
        texto: [
          'Grupos de 3 o 4 cartas del mismo número, o escaleras de 3 o más cartas seguidas del mismo palo. El As va abajo (A-2-3) o arriba (Q-K-A), pero no da la vuelta (K-A-2 no vale).',
          'Puedes añadir cartas a cualquier combinación de la mesa, también a las de los demás: la cuarta de un grupo o la que alarga una escalera. Cada carta cuenta para quien la pone.',
        ],
      },
      {
        titulo: 'El turno',
        texto: [
          'Roba la carta de arriba del mazo, o coge cualquier carta del descarte (que está abierto) con todas las que tiene encima. Si te llevas más de una, tienes que bajar o añadir enseguida la de más abajo.',
          'Después baja y añade lo que quieras y termina descartando una carta. La que coges sola de arriba del descarte no la puedes soltar en el mismo turno.',
        ],
      },
      {
        titulo: 'Fin de la mano',
        texto: [
          'La mano termina cuando alguien descarta su última carta (siempre tiene que quedarte una para descartar) o cuando se acaba el mazo.',
          'Cada uno suma los puntos de lo que ha puesto en la mesa y resta los de lo que le queda en la mano. El As vale 15 (1 en A-2-3), las figuras 10 y el resto su número.',
        ],
      },
      {
        titulo: 'Consejos',
        texto: [
          'Baja pronto: lo que tengas en la mano cuando alguien cierre te resta.',
          'Mira el descarte entero: a veces compensa llevarse muchas cartas por una que te deja bajar.',
          'No sueltes cartas que encajen en la mesa: el siguiente se las apunta.',
        ],
      },
    ],

    ginRummy: [
      {
        titulo: 'El objetivo',
        texto: [
          'Un duelo de dos con la baraja francesa. Cada uno tiene 10 cartas y quiere ligarlas en combinaciones para quedarse con pocos puntos sueltos.',
          'Gana la partida quien llega antes a 100 puntos.',
        ],
      },
      {
        titulo: 'Combinaciones',
        texto: [
          'Grupos de 3 o 4 cartas del mismo número, o escaleras de 3 o más cartas seguidas del mismo palo. El As va siempre abajo: A-2-3 vale, Q-K-A no.',
          'Las cartas sueltas suman puntos: el As 1, del 2 al 10 su número, y la J, la Q y la K 10.',
        ],
      },
      {
        titulo: 'El turno',
        texto: [
          'Al empezar cada mano, quien no reparte puede quedarse la carta descubierta o pasar; si pasa, puede quedársela el otro.',
          'Después, en tu turno robas una carta (del mazo o la de arriba del descarte) y descartas otra. La que coges del descarte no la puedes soltar en el mismo turno, y el rival la ve.',
        ],
      },
      {
        titulo: 'Cerrar',
        texto: [
          'Si al descartar te quedan 10 puntos sueltos o menos, puedes cerrar. Con 0 es Gin.',
          'Al cerrar se destapan las dos manos. Si no es Gin, el rival coloca sus cartas sueltas en tus combinaciones (lo hace la máquina, lo mejor posible para él).',
        ],
      },
      {
        titulo: 'Puntos',
        texto: [
          'Si tienes menos puntos sueltos que el rival, ganas la diferencia. Si él tiene los mismos o menos, es un undercut: gana él la diferencia más 25. Con Gin ganas sus puntos sueltos más 25.',
          'Si en el mazo quedan solo 2 cartas y se descarta sin cerrar, la mano es nula.',
          'Al final, cada mano ganada suma 25 y el ganador suma 100 más; si el rival no ganó ninguna mano, el ganador dobla su marcador.',
        ],
      },
      {
        titulo: 'Consejos',
        texto: [
          'Suelta pronto las figuras que no te sirven: pesan mucho si el rival cierra.',
          'Fíjate en lo que coge el rival del descarte, y no le sueltes cartas que le liguen.',
        ],
      },
    ],

    blackjack: [
      {
        titulo: 'El objetivo',
        texto: [
          'Se juega con la baraja francesa contra la banca, que lleva la máquina. Cada jugador empieza con 100 fichas y gana quien más tenga al acabar las manos (jugando solo, si acabas con más de 100).',
          'En cada mano tienes que acercarte a 21 más que la banca, sin pasarte.',
        ],
      },
      {
        titulo: 'Valores',
        texto: [
          'Del 2 al 10, su número; la J, la Q y la K valen 10; el As vale 11 o 1, lo que más te convenga.',
          'Un As y una carta de 10 de entrada son un blackjack, la mejor mano: cobra 3 por cada 2 apostadas.',
        ],
      },
      {
        titulo: 'La mano',
        texto: [
          'Primero apuestas de 2 a 20 fichas. Recibes dos cartas boca arriba; la banca, una a la vista y otra tapada.',
          'Puedes pedir carta las veces que quieras o plantarte. Con tus dos primeras cartas también puedes doblar (doblas la apuesta y recibes una sola carta más) o, si son del mismo valor, separarlas en dos manos.',
        ],
      },
      {
        titulo: 'La banca',
        texto: [
          'Cuando todos han jugado, la banca descubre su carta y pide mientras tenga 16 o menos; con 17 o más se planta.',
          'Si te pasas de 21 pierdes aunque la banca también se pase. Si empatas, recuperas tu apuesta.',
        ],
      },
      {
        titulo: 'Consejos',
        texto: [
          'Si la banca enseña un 2 al 6, es fácil que se pase: con 12 o más, plántate.',
          'Dobla con 11, y separa siempre los ases y los ochos.',
        ],
      },
    ],

    picas: [
      {
        titulo: 'El objetivo',
        texto: [
          'Se juega con la baraja francesa entre 4, en dos parejas: tu compañero es el de enfrente. Cada uno recibe 13 cartas.',
          'Antes de jugar, cada pareja se compromete a hacer un número de bazas. Gana la primera pareja que llega a 500 puntos.',
        ],
      },
      {
        titulo: 'Apostar',
        texto: [
          'Por turnos, cada uno dice cuántas bazas hará, de 1 a 13. El contrato de la pareja es la suma de las dos apuestas.',
          'También puedes decir Nil: que no harás ninguna baza. Si lo cumples, tu pareja suma 100; si no, resta 100.',
        ],
      },
      {
        titulo: 'Las bazas',
        texto: [
          'Hay que seguir el palo de salida si se tiene; si no, puedes echar cualquier carta. Las picas son siempre triunfo: la pica más alta gana la baza, y si no hay picas, la más alta del palo de salida. El As es la carta más alta.',
          'No se puede salir de picas hasta que alguien haya echado una pica sobre otro palo («picas rotas»), salvo que solo te queden picas.',
        ],
      },
      {
        titulo: 'Puntos',
        texto: [
          'Si la pareja llega a su contrato, suma 10 por cada baza apostada y 1 por cada baza de más. Si no llega, resta 10 por cada baza apostada.',
          'Cada baza de más es un saco. Al juntar 10 sacos, la pareja pierde 100 puntos: no conviene pasarse.',
        ],
      },
      {
        titulo: 'Consejos',
        texto: [
          'Cuenta como bazas los ases, los reyes acompañados y las picas altas o largas.',
          'Si tu compañero dice Nil, intenta ganar tú las bazas que él podría llevarse.',
        ],
      },
    ],

    ochoLoco: [
      {
        titulo: 'El objetivo',
        texto: [
          'Se juega con la baraja francesa, de 2 a 5 jugadores, cada uno por su cuenta. Se reparten 7 cartas con 2 jugadores y 5 con más, y se pone una boca arriba para empezar el descarte.',
          'Quien se queda antes sin cartas gana la mano. Se juegan manos hasta que alguien llega a 100 puntos.',
        ],
      },
      {
        titulo: 'Jugar',
        texto: [
          'En tu turno juegas una carta del palo que toca o del mismo número que la de arriba del descarte. Por ejemplo, sobre el 9 de corazones vale cualquier corazón o cualquier 9.',
          'El 8 se juega siempre, encima de cualquier carta, y eliges el palo que sigue.',
        ],
      },
      {
        titulo: 'Robar',
        texto: [
          'Si no tienes ninguna carta que case, robas una del mazo. Si la robada casa, puedes jugarla; si no, pasas.',
          'Cuando se acaba el mazo, se baraja el descarte (menos la de arriba) para hacer uno nuevo.',
        ],
      },
      {
        titulo: 'Puntos',
        texto: [
          'Quien se queda sin cartas se apunta lo que les queda a los demás: el 8 vale 50, las figuras 10, el As 1 y el resto su número.',
          'Si nadie puede jugar ni robar, la mano se bloquea y la gana quien tenga menos puntos en la mano.',
        ],
      },
      {
        titulo: 'Consejos',
        texto: [
          'Guarda los ochos para cuando no tengas otra cosa: te salvan de robar. Pero si alguien está a punto de quedarse sin cartas, un 8 en la mano son 50 puntos para él.',
          'Al elegir palo con un 8, elige el que más tienes.',
        ],
      },
    ],

    mentiroso: [
      {
        titulo: 'El objetivo',
        texto: [
          'Se juega con la baraja francesa, de 3 a 6 jugadores, cada uno por su cuenta. Se reparten todas las cartas, y gana el primero que se queda sin ninguna.',
        ],
      },
      {
        titulo: 'Bajar cartas',
        texto: [
          'En cada turno toca un valor, en orden: Ases, doses, treses… hasta reyes, y vuelta a empezar. Bajas boca abajo de 1 a 4 cartas diciendo que son de ese valor.',
          'Puedes decir la verdad o mentir: nadie ve las cartas. Toca las cartas para marcarlas y pulsa «Bajar».',
        ],
      },
      {
        titulo: '¡Mentiroso!',
        texto: [
          'Antes de bajar, puedes decir «¡Mentiroso!» al jugador que acaba de bajar. Se descubren sus cartas: si alguna no era del valor que dijo, se lleva él todo el montón; si era verdad, te lo llevas tú.',
          'Después bajas tú, con el valor siguiente.',
        ],
      },
      {
        titulo: 'Ganar',
        texto: [
          'Cuando alguien baja sus últimas cartas, el siguiente decide: si le cree, gana. Si dice «¡Mentiroso!» y mentía, se lleva el montón y sigue jugando.',
        ],
      },
      {
        titulo: 'Consejos',
        texto: [
          'Fíjate en tus cartas: si tienes dos reyes y alguien dice que baja tres, miente seguro.',
          'Mentir con muchas cartas a la vez es arriesgado si el montón es grande: si te pillan, te lo llevas entero.',
        ],
      },
    ],

    cuatrola: [
      {
        titulo: 'El objetivo',
        texto: [
          'Es el Tresillo para 4 jugadores, con la baraja española de 40 cartas. Cada uno recibe 10. En cada mano, uno se compromete a hacer 6 bazas de 10: solo, o con un compañero que elige llamando a un rey.',
          'Se cobra en fichas. Todos empiezan con 0 y gana quien más tenga al acabar las manos (8 por defecto).',
        ],
      },
      {
        titulo: 'La subasta',
        texto: [
          'Empieza a hablar el siguiente al que reparte. En tu turno pasas, pujas «con rey» o pujas «solo», que vale más. Se puede subir de «con rey» a «solo», y quien pasa ya no vuelve a hablar.',
          'Gana quien hizo la última puja: es el jugador. Si pasan los cuatro, se reparte otra vez.',
        ],
      },
      {
        titulo: 'El triunfo y el rey',
        texto: [
          'El jugador elige el palo de triunfo. Si juega con rey, nombra un rey que no tenga: quien lo tenga es su compañero, pero nadie lo sabe hasta que lo juega. Los otros dos defienden juntos.',
        ],
      },
      {
        titulo: 'Los matadores',
        texto: [
          'Hay cartas que son siempre triunfo, aunque sean de otro palo: la espadilla (As de espadas), la malilla (el 7 del triunfo, o el 2 si es espadas o bastos), el basto (As de bastos) y, si el triunfo es oros o copas, el punto (su As). Son las más altas, en ese orden.',
          'Después van el Rey, el Caballo y la Sota del triunfo, y sus números. Ojo: en oros y copas los números van al revés, el 2 gana al 7, y el As va justo después de la Sota.',
        ],
        ejemplo: 'matadores',
      },
      {
        titulo: 'Las bazas',
        texto: [
          'Sale el siguiente al que reparte. Hay que seguir el palo si puedes; si no, echas lo que quieras: no hay obligación de fallar ni de superar. Gana el triunfo más alto o, si no hay, la carta más alta del palo que salió.',
          'Los matadores tienen privilegio: si se sale de triunfo con una carta más baja que tu matador, no estás obligado a echarlo.',
        ],
      },
      {
        titulo: 'El cobro',
        texto: [
          'El jugador (con su compañero) gana si hace 6 bazas o más. Con rey, si ganan, cada defensor paga 1 ficha a cada uno de la pareja; si pierden, solo paga el jugador: 2 a cada defensor. Solo, cobra o paga 2 a cada uno de los otros tres.',
          'Si un bando hace las 10 bazas, es bola y el cobro se dobla.',
        ],
      },
      {
        titulo: 'Consejos',
        texto: [
          'Cuenta tus matadores antes de pujar: con dos o tres y unos cuantos triunfos, ya puedes jugar con rey.',
          'Llama el rey del palo en que tienes menos cartas: tu compañero te ganará esas bazas.',
        ],
      },
    ],

    scorpion: [
      {
        titulo: 'El objetivo',
        texto: [
          'Con una baraja francesa, hay que formar en la mesa las cuatro escaleras, una por palo, de la K al As.',
        ],
      },
      {
        titulo: 'El reparto',
        texto: [
          'Hay 7 columnas de 7 cartas. En las 4 primeras, las 3 de abajo están tapadas. Las 3 cartas que sobran forman la reserva.',
        ],
      },
      {
        titulo: 'Mover',
        texto: [
          'Puedes mover cualquier carta descubierta, con todas las que tenga encima aunque estén desordenadas, sobre la siguiente de su palo: el 6 de picas sobre el 7 de picas.',
          'En una columna vacía solo puede ir una K, con lo que lleve encima. Cuando una carta tapada queda arriba, se descubre sola.',
        ],
      },
      {
        titulo: 'La reserva',
        texto: [
          'Cuando quieras, toca la reserva para repartirla: pone una carta encima de cada una de las 3 primeras columnas. Solo se reparte una vez.',
        ],
      },
      {
        titulo: 'Consejos',
        texto: [
          'Lo primero es descubrir las cartas tapadas: busca los movimientos que las dejan arriba.',
          'Una columna vacía es valiosa: guárdala para una K que tenga debajo cartas que necesitas.',
        ],
      },
    ],

    cuarentaLadrones: [
      {
        titulo: 'El objetivo',
        texto: [
          'Se juega con dos barajas francesas. Hay que subir las 104 cartas a las 8 fundaciones: dos por palo, del As a la K.',
        ],
      },
      {
        titulo: 'Las columnas',
        texto: [
          'Al empezar hay 10 columnas de 4 cartas, todas a la vista. Sobre cada carta va la de un número menos y del mismo palo: el 7 de picas sobre el 8 de picas.',
          'En una columna vacía puede ir cualquier carta.',
        ],
      },
      {
        titulo: 'Mover',
        texto: [
          'Se mueve una carta cada vez: la última de una columna o la de arriba del descarte.',
          'Para ahorrar pasos, puedes mover un grupo ordenado del mismo palo si podrías hacerlo carta a carta usando las columnas vacías: con una vacía, dos cartas; con dos, cuatro…',
        ],
      },
      {
        titulo: 'El mazo',
        texto: [
          'Toca el mazo para pasar una carta al descarte. El mazo solo se pasa una vez: cuando se acaba, no vuelve.',
          'Haz doble toque en una carta para subirla a una fundación. Si te atascas, pide una pista o deshaz movimientos.',
        ],
      },
      {
        titulo: 'Consejos',
        texto: [
          'Las columnas vacías valen oro: no las llenes con cualquier cosa.',
          'Antes de robar, mira si puedes mover algo: cada carta del mazo solo pasa una vez.',
        ],
      },
    ],

    canfield: [
      {
        titulo: 'El objetivo',
        texto: [
          'Subir las 52 cartas a las cuatro fundaciones, una por palo.',
          'Las fundaciones no empiezan por el As: la primera carta que sale va a una fundación y su número es la base de las cuatro. Después de la K va el As, hasta completar 13 cartas.',
        ],
      },
      {
        titulo: 'La mesa',
        texto: [
          'Hay una reserva de 13 cartas, de la que solo ves la de arriba, cuatro columnas de una carta y el mazo.',
          'Cuando una columna se queda vacía, la llena enseguida la carta de arriba de la reserva. Si la reserva ya está vacía, puedes poner ahí la carta que quieras.',
        ],
      },
      {
        titulo: 'Mover',
        texto: [
          'En las columnas se construye bajando y alternando colores, también con vuelta: una K puede ir sobre un As. Puedes mover una carta o un tramo ordenado.',
          'La carta de arriba de la reserva y la del descarte se pueden jugar a las columnas y a las fundaciones. Haz doble toque en una carta para subirla directamente.',
        ],
      },
      {
        titulo: 'El mazo',
        texto: [
          'Roba de 3 en 3 (o de 1 en 1, si lo eliges en las opciones) y vuelve a pasar el descarte al mazo cuantas veces quieras.',
          'Puedes deshacer, pedir una pista y, cuando no queda mazo, descarte ni reserva, autocompletar si todo puede subir.',
        ],
      },
      {
        titulo: 'Consejos',
        texto: [
          'Vacía la reserva cuanto antes: es lo que más cuesta del Canfield.',
          'Una columna vacía saca una carta de la reserva, así que a veces compensa vaciarla.',
        ],
      },
    ],

    yukon: [
      {
        titulo: 'El objetivo',
        texto: [
          'Subir las 52 cartas a las cuatro fundaciones, una por palo, del As al Rey.',
          'No hay mazo: todas las cartas están repartidas en las 7 columnas desde el principio, muchas boca abajo.',
        ],
      },
      {
        titulo: 'Mover',
        texto: [
          'Puedes mover cualquier carta boca arriba junto con todas las que tiene encima, aunque no estén ordenadas.',
          'La carta que mueves tiene que ir sobre una de un valor más y de color contrario (un 9 negro sobre un 10 rojo). En el Solitario ruso, del mismo palo.',
          'Solo un Rey, con lo que tenga encima, puede ocupar una columna vacía.',
        ],
      },
      {
        titulo: 'Fundaciones',
        texto: [
          'Sube a las fundaciones la última carta de una columna. Haz doble toque en una carta para subirla directamente.',
          'Al quedar boca abajo la última carta de una columna, se da la vuelta sola.',
        ],
      },
      {
        titulo: 'Ayudas',
        texto: [
          'Puedes deshacer, pedir una pista y, cuando todo está boca arriba y cada columna ordenada, autocompletar.',
          'Se guardan tu mejor tiempo y tus menos movimientos.',
        ],
      },
      {
        titulo: 'Consejos',
        texto: [
          'Destapa primero las columnas con más cartas boca abajo.',
          'No vacíes una columna si no tienes un Rey que poner en ella.',
        ],
      },
    ],

    tripeaks: [
      {
        titulo: 'El objetivo',
        texto: [
          'Hay tres picos de cartas en cuatro filas. Solo la fila de abajo empieza boca arriba. Hay que quitar las 28 cartas de los picos pasándolas al descarte.',
        ],
      },
      {
        titulo: 'Quitar cartas',
        texto: [
          'Puedes quitar una carta sin nada encima si vale uno más o uno menos que la de arriba del descarte, sea cual sea el palo. La K y el As se tocan: sobre una K va una Q o un As.',
          'Al quitar las dos cartas que tapan a otra, esa se vuelve boca arriba.',
        ],
      },
      {
        titulo: 'El mazo',
        texto: [
          'Si no puedes quitar nada, toca el mazo para pasar una carta al descarte. El mazo se recorre una sola vez.',
        ],
      },
      {
        titulo: 'Puntos',
        texto: [
          'Cada carta de una racha suma su número en la racha: la primera 1, la segunda 2, la tercera 3… Robar corta la racha.',
          'Despejar un pico suma 15, y despejar los tres, 30 más. La mejor puntuación queda como récord, aunque no ganes.',
        ],
      },
      {
        titulo: 'Consejos',
        texto: [
          'Antes de quitar, mira qué carta te deja encadenar más: una racha larga vale mucho más que varias cortas.',
          'Si puedes elegir, quita las cartas que destapan otras.',
        ],
      },
    ],

    golf: [
      {
        titulo: 'El objetivo',
        texto: [
          'Es un solitario con la baraja francesa. Hay 7 columnas de 5 cartas boca arriba, y ganas cuando las pasas todas al descarte, aunque queden cartas en el mazo.',
        ],
      },
      {
        titulo: 'Mover cartas',
        texto: [
          'Toca la última carta de una columna para pasarla al descarte. Solo se puede si vale exactamente una más o una menos que la de arriba del descarte, sea del palo que sea: sobre un 7 va un 6 o un 8.',
          'El As vale 1, la J 11, la Q 12 y la K 13. Sobre una K no va nada y sobre un As solo un 2, salvo que en las opciones elijas que la K y el As se toquen.',
        ],
      },
      {
        titulo: 'El mazo',
        texto: [
          'Cuando no puedas mover, toca el mazo: su carta de arriba pasa al descarte y puedes seguir desde ella. El mazo solo se recorre una vez.',
        ],
      },
      {
        titulo: 'Consejos',
        texto: [
          'Antes de mover, mira hasta dónde llega cada cadena: a veces conviene empezar por una carta que deja seguir más.',
          'No vacíes primero las columnas cortas: las cartas de las largas son las más difíciles de sacar.',
          'Si te atascas, puedes deshacer o pedir una pista.',
        ],
      },
    ],

    piramide: [
      {
        titulo: 'El objetivo',
        texto: [
          'Es un solitario con la baraja francesa. Hay 28 cartas boca arriba en forma de pirámide, y ganas cuando las quitas todas, aunque queden cartas en el mazo.',
        ],
      },
      {
        titulo: 'Quitar cartas',
        texto: [
          'Se quitan parejas de cartas que sumen 13. El As vale 1, los números lo que marcan, la J 11 y la Q 12. La K vale 13 y se quita sola.',
          'Solo se pueden quitar cartas libres: las de la pirámide que no tienen ninguna carta encima, y la de arriba del descarte. Toca una carta y luego la otra; la K se quita con un toque.',
        ],
      },
      {
        titulo: 'El mazo',
        texto: [
          'Toca el mazo para pasar su carta de arriba al descarte. Cuando se acaba, tócalo otra vez para darle la vuelta al descarte. Por defecto puedes recorrer el mazo 3 veces.',
        ],
      },
      {
        titulo: 'Consejos',
        texto: [
          'Antes de usar una carta del descarte, mira si hay en la pirámide otra que haga la pareja: liberar la pirámide es lo que importa.',
          'Fíjate en qué cartas tapan a otras: a veces conviene esperar para quitar una pareja que libera más cartas.',
          'Si te atascas, puedes deshacer o pedir una pista.',
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
