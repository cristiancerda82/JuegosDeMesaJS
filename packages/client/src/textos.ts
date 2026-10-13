/**
 * Todos los textos visibles del cliente, en español. Centralizados aquí por si hace falta
 * traducir más adelante (design: no hay sistema de traducción todavía).
 */
export const T = {
  app: { titulo: 'Juegos de mesa', subtitulo: 'Naipes para jugar en cualquier parte' },

  menu: {
    elegir: 'Elige un juego',
    klondike: 'Klondike',
    klondikeDesc: 'El solitario clásico con baraja francesa.',
    brisca: 'Brisca',
    briscaDesc: 'Bazas con baraja española, contra la máquina.',
    tute: 'Tute',
    tuteDesc: 'Bazas, cantes de 20 y 40 y el tute, con baraja española.',
    escoba: 'Escoba',
    escobaDesc: 'Recoge cartas de la mesa que sumen 15 y haz escobas.',
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
    puntosPartida: 'Partida',
    puntosN: (n: number) => `A ${n} puntos`,
    capturaObligatoria: 'Recoger es obligatorio',
    capturaObligatoriaDesc: 'Si la carta que juegas puede sumar 15, tienes que recoger.',
    escobaInicial: 'Escoba del que reparte',
    escobaInicialDesc: 'Si las 4 cartas iniciales de la mesa suman 15, son escoba del que reparte.',
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
    porTute: (quien: string) =>
      quien === 'Tú' ? 'La mano terminó con tu tute.' : `La mano terminó con el tute de ${quien}.`,
    detallePuntos: 'Incluye los cantes y los 10 de últimas.',
  },

  cartas: {
    figurasEspanolas: { 10: 'Sota', 11: 'Caballo', 12: 'Rey' } as Record<number, string>,
    figurasFrancesas: { 1: 'As', 11: 'Jota', 12: 'Reina', 13: 'Rey' } as Record<number, string>,
    as: 'As',
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
  },
} as const;
