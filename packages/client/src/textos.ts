/** Un valor de la Siete y media en medios puntos, con coma decimal: 15 → «7,5». */
function formatoValor(medios: number): string {
  return medios % 2 === 0 ? `${medios / 2}` : `${(medios - 1) / 2},5`;
}

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
    cinquillo: 'Cinquillo',
    cinquilloDesc: 'Coloca tus cartas en escalera a partir de los cincos y quédate sin ninguna.',
    mus: 'Mus',
    musDesc: 'En parejas: grande, chica, pares y juego, con envites y órdagos.',
    pocha: 'Pocha',
    pochaDesc: 'Apuesta cuántas bazas harás en cada mano y acierta exactamente.',
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
  },

  opciones: {
    titulo: (juego: string) => `Opciones de ${juego}`,
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
      pocha: 'Cómo se juega a la Pocha',
      mus: 'Cómo se juega al Mus',
    },
    puntos: (n: number) => (n === 1 ? '1 punto' : `${n} puntos`),

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
  },
} as const;
