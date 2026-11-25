<script lang="ts">
  import { abrirCapa } from '../interfaz/capas';
  import { esNativa } from '../plataforma';
  import { enlaceSala } from '../sesion/invitacion';
  import type { ClienteRed } from '../sesion/red.svelte';
  import { JUEGOS } from '../sesion/juegos';
  import { T } from '../textos';

  interface Props {
    cliente: ClienteRed;
    salir: () => void;
  }

  let { cliente, salir }: Props = $props();

  const sala = $derived(cliente.sala);
  const yo = $derived(cliente.entrada?.asiento ?? null);
  const soyAnfitrion = $derived(sala !== null && yo === sala.anfitrion);

  /** Juegos de 4 que se juegan por parejas (0 y 2 contra 1 y 3). */
  const PAREJAS = [
    'brisca',
    'tute',
    'guinote',
    'escoba',
    'mus',
    'pinacle',
    'butifarra',
    'truc',
    'picas',
    'canasta',
    'whist',
    'euchre',
    'belote',
    'bridge',
    'sueca',
    'jass',
    'klaverjas',
    'fiveHundred',
    'scopa',
    'tressette',
    'truco',
    'cuarenta',
    'pishti',
  ];
  const porParejas = $derived(
    sala !== null && sala.asientos.length === 4 && PAREJAS.includes(sala.juego),
  );

  // ── Invitar con un enlace (spec partidas-en-red, «Invitar con un enlace») ──
  const enlace = $derived(sala ? enlaceSala(sala.codigo, cliente.servidor) : '');
  const mensaje = $derived(sala ? T.red.invitacion(JUEGOS[sala.juego].nombre, sala.codigo, enlace) : '');
  /** Panel con WhatsApp y «Copiar enlace», cuando no hay hoja de compartir. */
  let panel = $state(false);
  let enlaceCopiado = $state(false);
  $effect(() => (panel ? abrirCapa(() => (panel = false)) : undefined));

  async function invitar() {
    if (!sala) return;
    const titulo = T.red.invitarTitulo;
    try {
      if (esNativa()) {
        const { Share } = await import('@capacitor/share');
        await Share.share({ title: titulo, text: mensaje, dialogTitle: titulo });
        return;
      }
      if (typeof navigator.share === 'function') {
        // El enlace va dentro del texto: WhatsApp recibe un único mensaje.
        await navigator.share({ title: titulo, text: mensaje });
        return;
      }
    } catch (e) {
      // Cancelar la hoja de compartir no es un error; si falla otra cosa, queda el panel.
      if ((e as Error).name === 'AbortError' || /cancel/i.test((e as Error).message)) return;
    }
    panel = true;
  }

  async function copiarEnlace() {
    try {
      await navigator.clipboard.writeText(enlace);
      enlaceCopiado = true;
      setTimeout(() => (enlaceCopiado = false), 1500);
    } catch {
      // Sin portapapeles: el enlace se ve en el panel.
    }
  }

  let copiado = $state(false);
  async function copiar() {
    if (!sala) return;
    try {
      await navigator.clipboard.writeText(sala.codigo);
      copiado = true;
      setTimeout(() => (copiado = false), 1500);
    } catch {
      // Sin portapapeles: el código se ve igualmente.
    }
  }
</script>

<main class="espera" data-testid="sala-espera">
  {#if cliente.estado === 'reconectando'}
    <p class="aviso" role="status">{T.red.reconectando}</p>
  {/if}
  {#if cliente.error && cliente.entrada === null}
    <p class="aviso" role="alert" data-testid="aviso-red">{cliente.error.mensaje}</p>
    <button onclick={salir}>{T.red.volver}</button>
  {:else if sala === null}
    <p role="status">{T.red.conectando}</p>
  {:else}
    <header>
      <h1>{JUEGOS[sala.juego].nombre}</h1>
      <p class="codigo">
        {T.red.sala('')}<b data-testid="codigo-sala">{sala.codigo}</b>
        <button class="enlace" onclick={copiar}>{copiado ? T.red.copiado : T.red.copiar}</button>
      </p>
      <button class="principal invitar" onclick={invitar} data-testid="invitar">{T.red.invitar}</button>
      {#if panel}
        <div class="panel-invitar" role="dialog" aria-label={T.red.invitarTitulo} data-testid="panel-invitar">
          <p class="enlace-sala" data-testid="enlace-sala">{enlace}</p>
          <div class="acciones">
            <a
              class="boton whatsapp"
              href={`https://wa.me/?text=${encodeURIComponent(mensaje)}`}
              target="_blank"
              rel="noopener noreferrer"
              data-testid="invitar-whatsapp">{T.red.whatsapp}</a
            >
            <button onclick={copiarEnlace} data-testid="copiar-enlace">
              {enlaceCopiado ? T.red.enlaceCopiado : T.red.copiarEnlace}
            </button>
            <button class="enlace" onclick={() => (panel = false)}>{T.red.cerrar}</button>
          </div>
        </div>
      {/if}
      <p class="nota">{T.red.nivel(T.opciones.nivel[sala.nivel])} · {T.red.libresIA}</p>
      <p class="nota" data-testid="sala-asistido">{sala.asistido ? T.red.conAsistido : T.red.sinAsistido}</p>
    </header>

    <ol class="asientos">
      {#each sala.asientos as a, i (i)}
        <li class:mio={i === yo} data-testid="asiento-sala-{i}">
          <span class="num">
            {T.red.asiento(i)}{#if porParejas}<small> · {T.red.pareja(i % 2)}</small>{/if}
          </span>
          {#if a}
            <span class="quien">
              {a.nombre}
              {#if i === yo}<small>({T.red.tu})</small>{/if}
              {#if i === sala.anfitrion}<small>({T.red.anfitrion})</small>{/if}
              {#if !a.conectado}<small class="off">({T.red.desconectado})</small>{/if}
            </span>
          {:else}
            <span class="quien libre">{T.red.libre}</span>
            <button onclick={() => cliente.enviar({ tipo: 'asiento', asiento: i })} data-testid="sentarse-{i}">
              {T.red.sentarse}
            </button>
          {/if}
        </li>
      {/each}
    </ol>

    {#if cliente.error}
      <p class="aviso" role="alert">{cliente.error.mensaje}</p>
    {/if}

    {#if soyAnfitrion}
      <button class="principal" onclick={() => cliente.enviar({ tipo: 'empezar' })} data-testid="empezar-red">
        {T.red.empezar}
      </button>
    {:else}
      <p role="status" data-testid="esperando-anfitrion">{T.red.esperandoAnfitrion}</p>
    {/if}
    <button class="enlace" onclick={salir} data-testid="salir-sala">{T.red.salir}</button>
  {/if}
</main>

<style>
  .espera {
    display: flex;
    flex-direction: column;
    gap: 12px;
    max-width: 520px;
    margin: 0 auto;
    padding: 24px 16px 32px;
  }

  h1 {
    margin: 0;
  }

  .codigo {
    margin: 6px 0;
    font-size: 1.2rem;
  }

  .codigo b {
    letter-spacing: 0.2em;
    color: var(--acento);
  }

  .invitar {
    align-self: flex-start;
    margin: 4px 0;
  }

  .panel-invitar {
    margin-top: 8px;
    padding: 12px;
    border-radius: 12px;
    background: rgb(0 0 0 / 0.25);
  }

  .enlace-sala {
    margin: 0 0 10px;
    font-size: 0.85rem;
    word-break: break-all;
    color: var(--texto-suave);
  }

  .acciones {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 8px;
  }

  .boton {
    display: inline-flex;
    align-items: center;
    min-height: 40px;
    padding: 6px 14px;
    border-radius: 10px;
    text-decoration: none;
    font-weight: 600;
  }

  .whatsapp {
    background: #25d366;
    color: #0b2e17;
  }

  .nota {
    margin: 0;
    color: var(--texto-suave);
    font-size: 0.9rem;
  }

  .asientos {
    display: flex;
    flex-direction: column;
    gap: 6px;
    margin: 0;
    padding: 0;
    list-style: none;
  }

  .asientos li {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 6px 12px;
    padding: 8px 12px;
    border-radius: 10px;
    background: rgb(0 0 0 / 0.18);
  }

  .asientos li.mio {
    outline: 2px solid var(--acento);
  }

  .num {
    min-width: 7em;
    color: var(--texto-suave);
  }

  .quien {
    flex: 1;
    font-weight: 600;
  }

  .libre {
    color: var(--texto-suave);
    font-weight: 400;
  }

  .off {
    color: var(--peligro);
  }

  .aviso {
    margin: 0;
    padding: 8px 12px;
    border-radius: 10px;
    background: rgb(160 40 40 / 0.5);
  }

  .enlace {
    align-self: center;
  }
</style>
