<script lang="ts">
  import { onMount } from 'svelte';
  import Muestrario from './cartas/Muestrario.svelte';
  import Menu from './pantallas/Menu.svelte';
  import Opciones from './pantallas/Opciones.svelte';
  import PantallaPartida from './pantallas/PantallaPartida.svelte';
  import { borrarGuardado, leerGuardado, type Guardado } from './sesion/guardado';
  import type { IdJuego } from './sesion/juegos';
  import {
    guardadoRepetible,
    nuevaPartida,
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
    | { readonly tipo: 'muestrario' };

  let pantalla: Pantalla = $state.raw({ tipo: 'menu' });
  let guardado: Guardado | null = $state(null);
  let aviso: string | null = $state(null);
  let dorso = $state(leerDorso());

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
    revisarGuardado();
    pantalla = { tipo: 'menu' };
  }

  function empezar(juego: IdJuego, config: ConfigJuego) {
    cerrarPartida();
    const r = nuevaPartida(juego, config);
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
    empezar(partida.id, partida.sesion.config);
  }

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
  />
{:else if pantalla.tipo === 'opciones'}
  {@const juego = pantalla.juego}
  <Opciones {juego} empezar={(config) => empezar(juego, config)} volver={irAlMenu} />
{:else if pantalla.tipo === 'partida'}
  {#key pantalla.partida}
    <PantallaPartida partida={pantalla.partida} menu={irAlMenu} {revancha} />
  {/key}
{:else}
  <Muestrario volver={irAlMenu} />
{/if}
