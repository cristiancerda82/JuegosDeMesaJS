# Desplegar el servidor de salas en Railway

El servidor de salas (`packages/server`) se publica en [Railway](https://railway.com) con el
`Dockerfile` del paquete. Railway pone el TLS, así que los clientes se conectan con `wss://`.

## Primera vez

1. En Railway, crea un proyecto nuevo a partir de este repositorio de GitHub. Railway lee
   `railway.json` de la raíz: construye con `packages/server/Dockerfile`, comprueba la salud en
   `/salud` y usa una sola réplica (las salas viven en memoria).
2. En el servicio, añade las variables:

   | Variable        | Valor                                           | Para qué                                                                                                                              |
   | --------------- | ----------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------- |
   | `ORIGENES`      | `https://<usuario>.github.io,https://localhost` | Orígenes permitidos: la web de GitHub Pages y la app Android (Capacitor).                                                             |
   | `CONFIAR_PROXY` | `1`                                             | La IP del cliente sale de `X-Forwarded-For`, que pone el proxy de Railway. Solo en Railway: sin proxy, la cabecera se podría falsear. |

   `PORT` la pone Railway; el servidor la lee antes que `PUERTO`.

3. En _Settings → Networking_, genera un dominio público. La dirección del servidor es
   `wss://<dominio>` (por ejemplo `wss://juegos-salas.up.railway.app`).
4. Comprueba que responde: `https://<dominio>/salud` debe devolver `ok`.

## Conectar la web publicada

En GitHub, _Settings → Secrets and variables → Actions → Variables_, crea la variable
`SERVIDOR_RED` con la dirección `wss://<dominio>`. El workflow de Pages la pasa al build como
`VITE_SERVIDOR_RED`, y la web publicada se conecta a ese servidor sin que el jugador configure nada.

## Límites

- Como mucho 500 salas, 20 conexiones simultáneas por IP y 5 salas abiertas por IP.
- Una conexión que no envía nada en 60 s se cierra (los clientes mandan un ping cada 10 s).
- Las salas se pierden si el servicio se reinicia o se redespliega: despliega fuera de las horas de juego.
