<script lang="ts">
  import type { IdJuegoRed, NivelIA } from '@juegos/engine';
  import type { MensajeCliente } from '@juegos/server/protocolo';
  import { onMount } from 'svelte';
  import Muestrario from './cartas/Muestrario.svelte';
  import Estadisticas from './pantallas/Estadisticas.svelte';
  import Menu from './pantallas/Menu.svelte';
  import Opciones from './pantallas/Opciones.svelte';
  import PantallaPartida from './pantallas/PantallaPartida.svelte';
  import PantallaRed from './pantallas/PantallaRed.svelte';
  import SalaEspera from './pantallas/SalaEspera.svelte';
  import {
    ClienteRed,
    nombreGuardado,
    salaGuardada,
    servidorGuardado,
  } from './sesion/red.svelte';
  import { SesionRed } from './sesion/sesion-red.svelte';
  import { pwa } from './pwa/registro.svelte';
  import { borrarGuardado, leerGuardado, type Guardado } from './sesion/guardado';
  import type { IdJuego } from './sesion/juegos';
  import {
    guardadoRepetible,
    nuevaPartida,
    partidaEnRed,
    partidaGuardada,
    type ConfigJuego,
    type Partida,
  } from './sesion/partida';
  import { T } from './textos';

  // Tres pantallas controladas por un estado simple, sin router (design, decisión 9).
  type Pantalla =
    | { readonly tipo: 'menu' }
    | { readonly tipo: 'opciones'; readonly juego: IdJuego }
    | { readonly tipo: 'partida'; readonly partida: Partida }
    | { readonly tipo: 'muestrario' }
    | { readonly tipo: 'estadisticas' }
    | { readonly tipo: 'red' }
    | { readonly tipo: 'opcionesRed'; readonly juego: IdJuegoRed }
    | { readonly tipo: 'espera'; readonly cliente: ClienteRed };

  let pantalla: Pantalla = $state.raw({ tipo: 'menu' });
  let guardado: Guardado | null = $state(null);
  let aviso: string | null = $state(null);
  let dorso = $state(leerDorso());
  /** Aviso de la pantalla de red (conexión), o 
ull. */
  let avisoRed: string | null = $state(null);
  /** Código de la sala en red de la que se viene al recargar. */
  let salaRed: string | null = $state(salaGuardada()?.codigo ?? null);

  /** Comprueba la partida guardada repitiéndola; si no se puede, se descarta con aviso. */
  function revisarGuardado() {
    const lectura = leerGuardado();
    guardado = null;
    if (lectura.tipo === 'nada') return;
    if (lectura.tipo === 'valido' && guardadoRepetible(lectura.guardado)) {
      guardado = lectura.guardado;
      return;
    }
    borrarGuardado();
    aviso = T.menu.guardadoInvalido;
  }

  function cerrarPartida() {
    if (pantalla.tipo === 'partida') pantalla.partida.sesion.cerrar();
  }

  function irAlMenu() {
    cerrarPartida();
    if (pantalla.tipo === 'espera') pantalla.cliente.cerrar();
    salaRed = salaGuardada()?.codigo ?? null;
    revisarGuardado();
    pantalla = { tipo: 'menu' };
  }

  function empezar(juego: IdJuego, config: ConfigJuego, nivel: NivelIA) {
    cerrarPartida();
    const r = nuevaPartida(juego, config, nivel);
    if (r.ok) {
      aviso = null;
      pantalla = { tipo: 'partida', partida: r.valor };
    } else {
      aviso = r.error;
    }
  }

  function continuar() {
    if (guardado === null) return;
    const r = partidaGuardada(guardado);
    if (r.ok) {
      aviso = null;
      pantalla = { tipo: 'partida', partida: r.valor };
    } else {
      borrarGuardado();
      guardado = null;
      aviso = T.menu.guardadoInvalido;
    }
  }

  function descartar() {
    borrarGuardado();
    guardado = null;
  }

  function revancha() {
    if (pantalla.tipo !== 'partida') return;
    const { partida } = pantalla;
    if (partida.sesion instanceof SesionRed) {
      partida.sesion.cliente.enviar({ tipo: 'revancha' });
      return;
    }
    empezar(partida.id, partida.sesion.config, partida.sesion.nivel);
  }

  // ── Partidas en red ──────────────────────────────────────────────────────────

  /** Conecta con el servidor, envía el primer mensaje y pasa a la sala de espera. */
  async function entrarEnRed(cliente: ClienteRed, mensaje: MensajeCliente) {
    avisoRed = T.red.conectando;
    try {
      await cliente.conectar();
    } catch {
      avisoRed = T.red.sinConexion;
      pantalla = { tipo: 'red' };
      return;
    }
    avisoRed = null;
    cliente.enviar(mensaje);
    pantalla = { tipo: 'espera', cliente };
  }

  function crearSala(juego: IdJuegoRed, config: ConfigJuego, nivel: NivelIA) {
    const nombre = nombreGuardado();
    void entrarEnRed(new ClienteRed(servidorGuardado()), { tipo: 'crear', juego, config, nivel, nombre });
  }

  function unirseSala(codigo: string) {
    const nombre = nombreGuardado();
    void entrarEnRed(new ClienteRed(servidorGuardado()), { tipo: 'unirse', codigo, nombre });
  }

  function volverSala() {
    const s = salaGuardada();
    if (!s) return;
    void entrarEnRed(new ClienteRed(s.servidor), { tipo: 'volver', codigo: s.codigo, testigo: s.testigo });
  }

  // Cuando el anfitrión empieza (o al volver a una partida en marcha), se pasa a la mesa.
  $effect(() => {
    if (pantalla.tipo !== 'espera') return;
    const { cliente } = pantalla;
    const primera = cliente.sala?.empezada ? cliente.ultimaPartida : null;
    if (primera && cliente.entrada) pantalla = { tipo: 'partida', partida: partidaEnRed(cliente, primera) };
  });

  // ── Dorso elegido (preferencia local, no imprescindible) ─────────────────────

  const CLAVE_DORSO = 'juegos-de-mesa/dorso';

  function leerDorso(): string {
    try {
      return localStorage.getItem(CLAVE_DORSO) ?? 'azul';
    } catch {
      return 'azul';
    }
  }

  function cambiarDorso(valor: string) {
    dorso = valor;
    try {
      localStorage.setItem(CLAVE_DORSO, valor);
    } catch {
      // Sin almacenamiento: vale solo para esta visita.
    }
  }

  $effect(() => {
    document.documentElement.dataset.dorso = dorso;
  });

  // ── Guardar al ocultar o cerrar la página ────────────────────────────────────

  onMount(() => {
    revisarGuardado();
    const guardarAhora = () => {
      if (pantalla.tipo === 'partida') pantalla.partida.sesion.guardarAhora();
    };
    const alCambiarVisibilidad = () => {
      if (document.visibilityState === 'hidden') guardarAhora();
    };
    window.addEventListener('pagehide', guardarAhora);
    document.addEventListener('visibilitychange', alCambiarVisibilidad);
    return () => {
      window.removeEventListener('pagehide', guardarAhora);
      document.removeEventListener('visibilitychange', alCambiarVisibilidad);
    };
  });
</script>

{#if pantalla.tipo === 'menu'}
  <Menu
    {guardado}
    {aviso}
    {dorso}
    elegir={(juego) => (pantalla = { tipo: 'opciones', juego })}
    {continuar}
    {descartar}
    {cambiarDorso}
    verCartas={() => (pantalla = { tipo: 'muestrario' })}
    verEstadisticas={() => (pantalla = { tipo: 'estadisticas' })}
    jugarEnRed={() => (pantalla = { tipo: 'red' })}
    {salaRed}
    {volverSala}
  />
{:else if pantalla.tipo === 'red'}
  <PantallaRed
    aviso={avisoRed}
    crear={(juego) => (pantalla = { tipo: 'opcionesRed', juego })}
    unirse={unirseSala}
    volver={irAlMenu}
  />
{:else if pantalla.tipo === 'opcionesRed'}
  {@const juego = pantalla.juego}
  <Opciones {juego} red empezar={(config, nivel) => crearSala(juego, config, nivel)} volver={() => (pantalla = { tipo: 'red' })} />
{:else if pantalla.tipo === 'espera'}
  <SalaEspera cliente={pantalla.cliente} salir={irAlMenu} />
{:else if pantalla.tipo === 'opciones'}
  {@const juego = pantalla.juego}
  <Opciones {juego} empezar={(config, nivel) => empezar(juego, config, nivel)} volver={irAlMenu} />
{:else if pantalla.tipo === 'partida'}
  {#key pantalla.partida}
    <PantallaPartida partida={pantalla.partida} menu={irAlMenu} {revancha} />
  {/key}
{:else if pantalla.tipo === 'estadisticas'}
  <Estadisticas volver={irAlMenu} />
{:else}
  <Muestrario volver={irAlMenu} />
{/if}

{#if pwa.hayActualizacion}
  <div class="actualizacion" role="status" data-testid="actualizacion">
    <span>{T.pwa.versionNueva}</span>
    <button
      class="principal"
      data-testid="actualizar"
      onclick={() => {
        // La partida en curso se guarda antes de recargar con la versión nueva.
        if (pantalla.tipo === 'partida') pantalla.partida.sesion.guardarAhora();
        pwa.actualizar();
      }}>{T.pwa.actualizar}</button
    >
  </div>
{/if}

<style>
  .actualizacion {
    position: fixed;
    left: 50%;
    bottom: calc(12px + env(safe-area-inset-bottom));
    translate: -50% 0;
    z-index: 3000;
    display: flex;
    align-items: center;
    gap: 12px;
    width: max-content;
    max-width: calc(100vw - 32px);
    padding: 8px 8px 8px 16px;
    border-radius: 14px;
    background: var(--tapete-oscuro);
    border: 1px solid rgb(255 255 255 / 0.25);
    box-shadow: var(--sombra-alta);
  }
</style>
