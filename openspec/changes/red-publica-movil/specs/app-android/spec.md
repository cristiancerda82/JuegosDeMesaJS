## Purpose

Define la suite como app Android publicada en Google Play: cómo se empaqueta desde el cliente web, cómo se comporta como app nativa y qué requisitos de seguridad y de publicación cumple.

## ADDED Requirements

### Requirement: Mismo juego que la web
La app Android MUST construirse a partir del mismo build del cliente web, con los mismos juegos, opciones e IA. MUST funcionar completamente sin conexión contra la IA, con todos sus archivos incluidos en la app. Solo el juego en red MUST requerir conexión.

#### Scenario: Primera apertura sin conexión
- **WHEN** el jugador instala la app y la abre por primera vez en modo avión
- **THEN** ve el menú y puede jugar una partida completa contra la IA

### Requirement: Botón atrás del sistema
El botón o gesto atrás de Android MUST navegar dentro de la app, no cerrarla, salvo desde la pantalla principal del menú:
- con un panel, diálogo o guía abiertos, los cierra;
- en las opciones, el muestrario o las estadísticas, vuelve al menú;
- en una partida local, vuelve al menú, y la partida queda guardada para retomarla;
- en una partida en red o en la sala de espera, pide confirmación antes de salir de la sala;
- en la pantalla principal del menú, la app se cierra como cualquier app Android.

#### Scenario: Atrás durante una partida local
- **WHEN** el jugador pulsa atrás en mitad de un Klondike
- **THEN** vuelve al menú y aparece la opción de retomar la partida

#### Scenario: Atrás en una partida en red
- **WHEN** el jugador pulsa atrás en mitad de una partida de Mus en red
- **THEN** la app pregunta si quiere salir de la sala, y si cancela sigue en la partida

### Requirement: Ciclo de vida de la app
Al pasar la app a segundo plano, la partida local en curso MUST guardarse. Si el sistema cierra la app mientras está en segundo plano, al abrirla de nuevo el jugador MUST poder retomarla desde el menú. En una partida en red, al volver se aplica el requisito «Volver del segundo plano» de `partidas-en-red`.

#### Scenario: El sistema cierra la app
- **WHEN** el jugador deja la app en segundo plano a mitad de un Chinchón y el sistema la cierra para liberar memoria
- **THEN** al abrirla de nuevo, el menú ofrece retomar la partida en el mismo punto

### Requirement: Sin elementos de PWA en la app
Dentro de la app Android, el cliente MUST NOT registrar el service worker ni mostrar el botón o la indicación de instalar, ni el aviso de versión nueva de la PWA. Las actualizaciones llegan por Google Play.

#### Scenario: Menú de la app
- **WHEN** el jugador abre el menú dentro de la app
- **THEN** no ve ni el botón «Instalar» ni la indicación para añadir a la pantalla de inicio

### Requirement: Seguridad de red de la app
La versión de publicación de la app MUST NOT permitir tráfico sin cifrar ni contenido mixto: todas las conexiones de red MUST usar `https` o `wss`. Las excepciones para desarrollo, como conectar con un servidor local `ws://`, MUST existir solo en las versiones de depuración.

#### Scenario: Versión de publicación
- **WHEN** se inspecciona el paquete de publicación
- **THEN** no permite tráfico sin cifrar ni contenido mixto

### Requirement: Presentación nativa
La app MUST tener su icono adaptable, el nombre «Juegos de mesa» y una pantalla de inicio con los colores de la suite. MUST funcionar en vertical y en horizontal, y respetar las zonas del sistema (barra de estado, muesca y barra de navegación), de modo que ningún control quede debajo de ellas.

#### Scenario: Móvil con muesca en horizontal
- **WHEN** se juega al Spider en horizontal en un móvil con muesca
- **THEN** ninguna columna ni botón queda tapado por la muesca o por la barra de navegación

### Requirement: Requisitos de publicación en Google Play
Antes de publicar cada versión en producción, la app MUST:
- apuntar al nivel de API que exige Google Play en la fecha de la publicación (Android 16, API 36, para apps nuevas y actualizaciones desde el 31 de agosto de 2026);
- subirse como Android App Bundle firmado con la clave de subida, con la firma de apps de Google Play;
- tener publicada una política de privacidad y enlazarla en la ficha. La política debe explicar que el nombre del jugador y las acciones de la partida en red se envían al servidor de salas solo mientras dura la sala, y que no hay cuentas, anuncios ni seguimiento;
- tener completados el formulario de seguridad de datos, que debe coincidir con la política, y el cuestionario de clasificación por edades, declarando el juego de azar simulado sin dinero real;
- haber pasado por una pista de pruebas (interna o cerrada) con los e2e verdes y una prueba manual en al menos un dispositivo físico.

#### Scenario: Lista de comprobación de publicación
- **WHEN** se prepara la primera versión para producción
- **THEN** se cumplen todos los puntos de la lista y quedan anotados en la guía de publicación
