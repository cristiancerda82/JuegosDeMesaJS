<script lang="ts">
  import { IDS_JUEGOS_EN_RED, type IdJuegoRed } from '@juegos/engine';
  import { LARGO_CODIGO, NOMBRE_MAXIMO, normalizarCodigo } from '@juegos/server/protocolo';
  import { JUEGOS } from '../sesion/juegos';
  import { guardarNombre, guardarServidor, nombreGuardado, servidorGuardado } from '../sesion/red.svelte';
  import { T } from '../textos';
  import ComoSeJuega from './ComoSeJuega.svelte';

  interface Props {
    /** Aviso de conexión o del servidor, o `null`. */
    aviso: string | null;
    /** Elegido el juego, se pasa a sus opciones. */
    crear: (juego: IdJuegoRed) => void;
    unirse: (codigo: string) => void;
    volver: () => void;
  }

  let { aviso, crear, unirse, volver }: Props = $props();

  let nombre = $state(nombreGuardado());
  let servidor = $state(servidorGuardado());
  let codigo = $state('');
  let eligiendo = $state(false);
  let error: string | null = $state(null);
  let verAyuda = $state(false);

  const nombreValido = $derived(nombre.trim().length >= 1 && nombre.trim().length <= NOMBRE_MAXIMO);

  /** Guarda el nombre y el servidor; devuelve si se puede seguir. */
  function preparar(): boolean {
    if (!nombreValido) {
      error = T.red.faltaNombre;
      return false;
    }
    error = null;
    guardarNombre(nombre);
    guardarServidor(servidor);
    return true;
  }

  function entrar(ev: SubmitEvent) {
    ev.preventDefault();
    if (!preparar()) return;
    const c = normalizarCodigo(codigo);
    if (c.length !== LARGO_CODIGO) {
      error = T.red.faltaCodigo;
      return;
    }
    unirse(c);
  }
</script>

<main class="red">
  <h1>{T.red.titulo}</h1>
  <button type="button" class="ayuda" onclick={() => (verAyuda = true)} data-testid="ver-ayuda">
    {T.ayuda.boton}
  </button>
  {#if verAyuda}
    <ComoSeJuega juego="red" cerrar={() => (verAyuda = false)} />
  {/if}

  {#if aviso || error}
    <p class="aviso" role="alert" data-testid="aviso-red">{error ?? aviso}</p>
  {/if}

  <label class="campo">
    {T.red.nombre}
    <input bind:value={nombre} maxlength={NOMBRE_MAXIMO} autocomplete="nickname" data-testid="nombre" />
  </label>

  {#if !eligiendo}
    <section>
      <h2>{T.red.crear}</h2>
      <p>{T.red.crearDesc}</p>
      <button class="principal" data-testid="crear-sala" onclick={() => preparar() && (eligiendo = true)}>
        {T.red.crear}
      </button>
    </section>

    <section>
      <h2>{T.red.unirse}</h2>
      <form onsubmit={entrar}>
        <label class="campo">
          {T.red.codigo}
          <input
            bind:value={codigo}
            maxlength={LARGO_CODIGO + 2}
            autocapitalize="characters"
            autocomplete="off"
            class="codigo"
            data-testid="codigo"
          />
        </label>
        <button class="principal" data-testid="unirse">{T.red.entrar}</button>
      </form>
    </section>

    <details>
      <summary>{T.red.servidor}</summary>
      <label class="campo">
        <span class="nota">{T.red.servidorDesc}</span>
        <input bind:value={servidor} autocomplete="off" spellcheck="false" data-testid="servidor" />
      </label>
    </details>
  {:else}
    <section>
      <h2>{T.red.elegirJuego}</h2>
      <div class="juegos">
        {#each IDS_JUEGOS_EN_RED as id (id)}
          <button onclick={() => crear(id)} data-testid="red-juego-{id}">{JUEGOS[id].nombre}</button>
        {/each}
      </div>
    </section>
  {/if}

  <button class="enlace" onclick={() => (eligiendo ? (eligiendo = false) : volver())} data-testid="volver">
    {T.red.volver}
  </button>
</main>

<style>
  .red {
    display: flex;
    flex-direction: column;
    gap: 14px;
    max-width: 520px;
    margin: 0 auto;
    padding: 24px 16px 32px;
  }

  h1 {
    margin: 0;
  }

  h2 {
    margin: 0 0 6px;
    font-size: 1.1rem;
  }

  section {
    padding: 14px;
    border-radius: 12px;
    background: rgb(0 0 0 / 0.18);
  }

  section p {
    margin: 0 0 10px;
    color: var(--texto-suave);
  }

  form {
    display: flex;
    flex-wrap: wrap;
    align-items: flex-end;
    gap: 10px;
  }

  .campo {
    display: flex;
    flex-direction: column;
    gap: 4px;
    flex: 1 1 200px;
  }

  input {
    min-height: 40px;
    padding: 6px 10px;
    border-radius: 8px;
    border: 1px solid rgb(255 255 255 / 0.3);
    background: rgb(0 0 0 / 0.3);
    color: inherit;
    font: inherit;
  }

  .codigo {
    text-transform: uppercase;
    letter-spacing: 0.25em;
    font-weight: 700;
  }

  .juegos {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
    gap: 8px;
  }

  .aviso {
    margin: 0;
    padding: 8px 12px;
    border-radius: 10px;
    background: rgb(160 40 40 / 0.5);
  }

  .nota {
    font-size: 0.85rem;
    color: var(--texto-suave);
  }

  .ayuda {
    align-self: flex-start;
  }

  .enlace {
    align-self: center;
  }
</style>
