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
    titulo: { klondike: 'Cómo se juega al Klondike', brisca: 'Cómo se juega a la Brisca' },
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
  },
} as const;
