<script lang="ts">
  import { esJuegoEnRed, type IdJuegoRed, type NivelIA } from '@juegos/engine';
  import type { MensajeCliente } from '@juegos/server/protocolo';
  import { onMount } from 'svelte';
  import { cerrarUltimaCapa } from './interfaz/capas';
  import { navegacion } from './menu/navegacion.svelte';
  import { esNativa } from './plataforma';
  import { SIMULAR_ATRAS } from './ajustes';
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
  import { leerInvitacion, sinInvitacion, type Invitacion } from './sesion/invitacion';
  import { pwa } from './pwa/registro.svelte';
  import { preferencias } from './menu/preferencias.svelte';
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
  /** Aviso de la pantalla de red (conexión), o null. */
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

  function empezar(juego: IdJuego, config: ConfigJuego, nivel: NivelIA, asistido = false) {
    cerrarPartida();
    const r = nuevaPartida(juego, config, nivel, asistido);
    if (r.ok) {
      aviso = null;
      preferencias.registrarReciente(juego);
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
      preferencias.registrarReciente(guardado.juego);
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
    empezar(partida.id, partida.sesion.config, partida.sesion.nivel, partida.sesion.asistido);
  }

  // ── Partidas en red ──────────────────────────────────────────────────────────

  /** La invitación por enlace que se está atendiendo (su código y su servidor), o `null`. */
  let invitacion: Invitacion | null = $state(null);

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

  function crearSala(juego: IdJuegoRed, config: ConfigJuego, nivel: NivelIA, asistido: boolean) {
    const nombre = nombreGuardado();
    void entrarEnRed(new ClienteRed(servidorGuardado()), {
      tipo: 'crear',
      juego,
      config,
      nivel,
      nombre,
      asistido,
    });
  }

  function unirseSala(codigo: string) {
    const nombre = nombreGuardado();
    // El servidor de la invitación vale para su sala, sin guardarlo como preferencia.
    const servidor = (invitacion?.codigo === codigo ? invitacion.servidor : null) ?? servidorGuardado();
    void entrarEnRed(new ClienteRed(servidor), { tipo: 'unirse', codigo, nombre });
  }

  /** Código de la sala en la que se está (sala de espera o partida en red), o `null`. */
  function salaActual(): string | null {
    if (pantalla.tipo === 'espera') return pantalla.cliente.sala?.codigo ?? null;
    if (pantalla.tipo === 'partida' && pantalla.partida.sesion instanceof SesionRed)
      return pantalla.partida.sesion.cliente.sala?.codigo ?? null;
    return null;
  }

  /**
   * Entra en la sala de un enlace de invitación (spec partidas-en-red, «Entrar en la sala desde
   * el enlace»): directamente con el nombre guardado, o en la pantalla de red con el código
   * escrito si falta el nombre. Desde otra sala, pregunta antes de salir.
   */
  function abrirInvitacion(nueva: Invitacion) {
    const actual = salaActual();
    if (actual === nueva.codigo) return;
    if (actual !== null && !confirm(T.red.confirmarSalir)) return;
    // Cierra lo que hubiera: la partida local queda guardada, la sala se abandona.
    if (pantalla.tipo !== 'menu') irAlMenu();
    invitacion = nueva;
    avisoRed = null;
    if (salaGuardada()?.codigo === nueva.codigo) {
      volviendoPorInvitacion = true;
      volverSala();
    } else if (nombreGuardado() !== '') unirseSala(nueva.codigo);
    else pantalla = { tipo: 'red' };
  }

  /**
   * Volver con el testigo falla si el asiento se liberó (antes de empezar, el servidor lo libera
   * al desconectarse): con la invitación, se entra de nuevo en la sala.
   */
  let volviendoPorInvitacion = false;
  $effect(() => {
    if (pantalla.tipo !== 'espera' || !volviendoPorInvitacion) return;
    const { cliente } = pantalla;
    if (cliente.entrada !== null) {
      volviendoPorInvitacion = false;
    } else if (cliente.error?.codigo === 'testigo' && invitacion !== null) {
      volviendoPorInvitacion = false;
      const { codigo } = invitacion;
      cliente.cerrar();
      if (nombreGuardado() !== '') unirseSala(codigo);
      else pantalla = { tipo: 'red' };
    }
  });

  function volverSala() {
    const s = salaGuardada();
    if (!s) return;
    void entrarEnRed(new ClienteRed(s.servidor), { tipo: 'volver', codigo: s.codigo, testigo: s.testigo });
  }

  // Al crear una sala, unirse o volver, el juego de la sala pasa a los últimos jugados: quien
  // se une solo lo sabe cuando llega la sala (design, decisión 3).
  const salasRegistradas = new WeakSet<ClienteRed>();
  $effect(() => {
    if (pantalla.tipo !== 'espera') return;
    const { cliente } = pantalla;
    if (cliente.sala && !salasRegistradas.has(cliente)) {
      salasRegistradas.add(cliente);
      preferencias.registrarReciente(cliente.sala.juego);
    }
  });

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

  // ── Botón atrás de Android (spec app-android; design, decisión 9) ────────────

  /** Salir de la sala en red, previa confirmación. */
  function salirDeLaSala() {
    if (confirm(T.red.confirmarSalir)) irAlMenu();
  }

  /**
   * Lo que hace el botón atrás: cerrar la última capa abierta (guía, panel…) o, si no hay,
   * retroceder una pantalla. Devuelve `false` en el menú principal, donde la app se cierra.
   */
  function atras(): boolean {
    if (cerrarUltimaCapa()) return true;
    switch (pantalla.tipo) {
      case 'menu':
        if (navegacion.busqueda !== '') navegacion.busqueda = '';
        else if (navegacion.familia !== null) navegacion.familia = null;
        else return false;
        return true;
      case 'partida':
        // La partida local se guarda al cerrarla y el menú ofrece retomarla.
        if (pantalla.partida.sesion instanceof SesionRed) salirDeLaSala();
        else irAlMenu();
        return true;
      case 'espera':
        salirDeLaSala();
        return true;
      case 'opcionesRed':
        pantalla = { tipo: 'red' };
        return true;
      default:
        irAlMenu();
        return true;
    }
  }

  // ── Enlaces de invitación ──────────────────────────────────────────────────────

  onMount(() => {
    if (esNativa()) return;
    const nueva = leerInvitacion(location.href);
    if (nueva === null) return;
    // Sin `?sala=` en la barra: al recargar ya se vuelve con la sala guardada.
    history.replaceState(history.state, '', sinInvitacion(location.href));
    abrirInvitacion(nueva);
  });

  onMount(() => {
    if (SIMULAR_ATRAS && !esNativa()) {
      const alPulsarAtras = () => {
        if (!atras()) document.documentElement.dataset.appCerrada = '';
      };
      window.addEventListener('atras', alPulsarAtras);
      return () => window.removeEventListener('atras', alPulsarAtras);
    }
    if (!esNativa()) return;
    let quitar: (() => void) | null = null;
    let desmontado = false;
    void import('@capacitor/app').then(async ({ App: Nativa }) => {
      const escucha = await Nativa.addListener('backButton', () => {
        if (!atras()) void Nativa.exitApp();
      });
      // Enlaces de invitación: con la app abierta (appUrlOpen) y al abrirla con uno (en frío).
      const enlaces = await Nativa.addListener('appUrlOpen', ({ url }) => {
        const nueva = leerInvitacion(url);
        if (nueva) abrirInvitacion(nueva);
      });
      const quitarTodo = () => {
        void escucha.remove();
        void enlaces.remove();
      };
      if (desmontado) {
        quitarTodo();
        return;
      }
      quitar = quitarTodo;
      const inicio = await Nativa.getLaunchUrl();
      const nueva = inicio ? leerInvitacion(inicio.url) : null;
      if (nueva) abrirInvitacion(nueva);
    });
    return () => {
      desmontado = true;
      quitar?.();
    };
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
    codigoInicial={invitacion?.codigo ?? ''}
    crear={(juego) => (pantalla = { tipo: 'opcionesRed', juego })}
    unirse={unirseSala}
    volver={irAlMenu}
  />
{:else if pantalla.tipo === 'opcionesRed'}
  {@const juego = pantalla.juego}
  <Opciones
    {juego}
    red
    empezar={(config, nivel, asistido) => crearSala(juego, config, nivel, asistido)}
    volver={() => (pantalla = { tipo: 'red' })}
  />
{:else if pantalla.tipo === 'espera'}
  <SalaEspera cliente={pantalla.cliente} salir={irAlMenu} />
{:else if pantalla.tipo === 'opciones'}
  {@const juego = pantalla.juego}
  <Opciones
    {juego}
    empezar={(config, nivel, asistido) => empezar(juego, config, nivel, asistido)}
    empezarEnRed={esJuegoEnRed(juego)
      ? (config, nivel, asistido) => crearSala(juego, config, nivel, asistido)
      : undefined}
    volver={irAlMenu}
  />
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
