## ADDED Requirements

### Requirement: Invitar con un enlace
La sala de espera MUST tener un botón «Invitar» que comparta un mensaje con el nombre del juego, el código de la sala y su enlace. El enlace MUST ser la dirección pública de la web con el parámetro `sala` (el código) y, solo si el anfitrión usa un servidor distinto del de por defecto, el parámetro `servidor`. En la app Android, el enlace MUST ser también la dirección pública de la web, no la interna de la app.

Cómo se comparte el mensaje:
- en la app Android MUST usarse la hoja de compartir del sistema;
- en un navegador que pueda compartir, MUST usarse su hoja de compartir;
- si no hay ninguna, MUST aparecer un panel con «WhatsApp» (que abre WhatsApp con el mensaje escrito) y «Copiar enlace».

Si el jugador cancela la hoja de compartir, MUST NOT mostrarse ningún error.

#### Scenario: Compartir desde el móvil
- **WHEN** el anfitrión de la sala XCCRB de Escoba pulsa «Invitar» en un navegador que puede compartir
- **THEN** se abre la hoja de compartir con un mensaje que nombra la Escoba y el código XCCRB, y con el enlace `…/?sala=XCCRB`

#### Scenario: Compartir desde el escritorio
- **WHEN** el anfitrión pulsa «Invitar» en un navegador que no puede compartir
- **THEN** aparece un panel con «WhatsApp», que abre WhatsApp con el mensaje, y «Copiar enlace»

### Requirement: Entrar en la sala desde el enlace
Al abrir el juego con un enlace de invitación válido, el jugador MUST entrar en esa sala sin tener que escribir el código:
- si tiene un nombre guardado, MUST unirse directamente y ver la sala de espera;
- si no tiene nombre, MUST ver la pantalla de red con el código ya escrito, y le basta con escribir su nombre y pulsar «Entrar»;
- si el enlace es el de la sala en la que ya estaba, MUST volver a su asiento en lugar de ocupar otro. Si su asiento ya se liberó (antes de empezar, el servidor libera el asiento de quien se desconecta), MUST entrar de nuevo como en una invitación nueva, sin mostrar ningún error;
- si está en otra sala o en una partida en red, MUST confirmar antes que quiere salir de ella; si no confirma, MUST seguir donde estaba;
- si está en una partida local, esta MUST quedar guardada para retomarla desde el menú.

El parámetro de la invitación MUST quitarse de la dirección después de leerlo, para que recargar la página no repita la entrada. Un código mal formado MUST ignorarse. Un código bien formado que no corresponde a ninguna sala MUST dar el error habitual («No hay ninguna sala con ese código»). Un servidor del enlace que la plataforma no admite (por ejemplo, `ws://` en la app) MUST ignorarse: en su lugar se usa el servidor por defecto.

#### Scenario: Invitado con nombre
- **WHEN** Luis, que ya jugó en red como «Luis», abre el enlace de la sala de Ana
- **THEN** aparece en la sala de espera de Ana sin pasar por la pantalla de red, y la dirección ya no lleva `?sala=`

#### Scenario: Invitado sin nombre
- **WHEN** Eva abre el enlace por primera vez
- **THEN** ve la pantalla de red con el código escrito y, tras escribir su nombre y pulsar «Entrar», está en la sala de espera

#### Scenario: Sala que ya no existe
- **WHEN** un jugador con nombre guardado abre el enlace de una sala que ya se cerró
- **THEN** ve el error «No hay ninguna sala con ese código»

### Requirement: El enlace abre la app Android
Si la app Android está instalada y el dominio de la web publica su verificación de App Links, el enlace de invitación MUST abrir la app, y la app MUST entrar en la sala igual que la web. Esto MUST funcionar tanto si la app estaba cerrada como si ya estaba abierta. Si la app no está instalada o la verificación no está publicada, el enlace MUST abrir la web.

#### Scenario: App cerrada
- **WHEN** un jugador con la app instalada y cerrada toca en WhatsApp el enlace de una sala
- **THEN** se abre la app y entra en la sala

#### Scenario: App abierta en el menú
- **WHEN** la app está abierta en el menú y el jugador toca un enlace de invitación
- **THEN** la app pasa a la sala sin reiniciarse
