<script lang="ts">
  import { esJuegoEnRed, type IdJuegoRed } from '@juegos/engine';
  import { LARGO_CODIGO, NOMBRE_MAXIMO, normalizarCodigo } from '@juegos/server/protocolo';
  import Carta from '../cartas/Carta.svelte';
  import { abrirCapa } from '../interfaz/capas';
  import { CATALOGO, FAMILIAS, juegosDeFamilia, normalizar, type IdFamilia } from '../menu/catalogo';
  import TarjetaFamilia from '../menu/TarjetaFamilia.svelte';
  import { JUEGOS } from '../sesion/juegos';
  import {
    guardarNombre,
    guardarServidor,
    nombreGuardado,
    servidorAdmitido,
    servidorGuardado,
  } from '../sesion/red.svelte';
  import { T } from '../textos';
  import ComoSeJuega from './ComoSeJuega.svelte';

  interface Props {
    /** Aviso de conexión o del servidor, o `null`. */
    aviso: string | null;
    /** Elegido el juego, se pasa a sus opciones. */
    crear: (juego: IdJuegoRed) => void;
    unirse: (codigo: string) => void;
    volver: () => void;
    /** Código de una invitación por enlace: ya escrito, solo falta el nombre. */
    codigoInicial?: string;
  }

  let { aviso, crear, unirse, volver, codigoInicial = '' }: Props = $props();

  let nombre = $state(nombreGuardado());
  let servidor = $state(servidorGuardado());
  // Basta con el valor inicial: la pantalla se monta de nuevo con cada invitación.
  // svelte-ignore state_referenced_locally
  let codigo = $state(codigoInicial);
  let campoNombre: HTMLInputElement | undefined = $state();
  // Con una invitación y sin nombre, el cursor espera en el nombre.
  $effect(() => {
    if (codigoInicial !== '' && nombre.trim() === '') campoNombre?.focus();
  });
  let eligiendo = $state(false);
  let error: string | null = $state(null);
  let verAyuda = $state(false);

  // Eligiendo el juego de la sala, el botón atrás de Android vuelve a la pantalla de red.
  $effect(() => (eligiendo ? abrirCapa(() => (eligiendo = false)) : undefined));

  // ── Elegir el juego por familias (spec partidas-en-red) ──
  /** Las familias con juegos en red (todas menos los solitarios), con sus juegos en orden. */
  const familias = FAMILIAS.map((familia) => ({
    familia,
    juegos: juegosDeFamilia(familia.id).filter(esJuegoEnRed),
  })).filter((f) => f.juegos.length > 0);
  let familia: IdFamilia | null = $state(null);
  let buscar = $state('');
  const abierta = $derived(familias.find((f) => f.familia.id === familia) ?? null);
  const texto = $derived(normalizar(buscar));
  const encontrados = $derived(
    texto === ''
      ? []
      : familias.flatMap((f) => f.juegos).filter((id) => normalizar(JUEGOS[id].nombre).includes(texto)),
  );
  // Con una familia abierta, el botón atrás vuelve a las familias.
  $effect(() => (eligiendo && familia !== null ? abrirCapa(() => (familia = null)) : undefined));

  function volverAtras() {
    if (!eligiendo) volver();
    else if (familia !== null) familia = null;
    else eligiendo = false;
  }

  const nombreValido = $derived(nombre.trim().length >= 1 && nombre.trim().length <= NOMBRE_MAXIMO);

  /** Guarda el nombre y el servidor; devuelve si se puede seguir. */
  function preparar(): boolean {
    if (!nombreValido) {
      error = T.red.faltaNombre;
      return false;
    }
    if (!servidorAdmitido(servidor)) {
      error = T.red.servidorInseguro;
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
    <input
      bind:this={campoNombre}
      bind:value={nombre}
      maxlength={NOMBRE_MAXIMO}
      autocomplete="nickname"
      data-testid="nombre"
    />
  </label>

  {#if !eligiendo}
    <section>
      <h2>{T.red.crear}</h2>
      <p>{T.red.crearDesc}</p>
      <button
        class="principal"
        data-testid="crear-sala"
        onclick={() => {
          if (!preparar()) return;
          familia = null;
          buscar = '';
          eligiendo = true;
        }}
      >
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
      <label class="campo buscar">
        <span class="oculto-visual">{T.menu.buscar}</span>
        <input
          type="search"
          placeholder={T.menu.buscarEjemplo}
          bind:value={buscar}
          autocomplete="off"
          data-testid="red-buscar"
        />
      </label>
      {#if texto !== ''}
        {#if encontrados.length === 0}
          <p data-testid="red-sin-resultados">{T.menu.sinResultados(buscar.trim())}</p>
        {:else}
          {@render juegos(encontrados)}
        {/if}
      {:else if abierta}
        <div class="cabecera-familia">
          <button type="button" class="volver" onclick={() => (familia = null)} data-testid="volver-familias">
            ‹ {T.menu.volverFamilias}
          </button>
          <h3>{abierta.familia.nombre}</h3>
        </div>
        {@render juegos(abierta.juegos)}
      {:else}
        <div class="familias">
          {#each familias as f (f.familia.id)}
            <TarjetaFamilia familia={f.familia} juegos={f.juegos} abrir={() => (familia = f.familia.id)} />
          {/each}
        </div>
      {/if}
    </section>
  {/if}

  {#snippet juegos(ids: readonly IdJuegoRed[])}
    <div class="juegos">
      {#each ids as id (id)}
        <button class="juego" onclick={() => crear(id)} data-testid="red-juego-{id}">
          <span class="abanico" aria-hidden="true">
            {#each CATALOGO[id].cartas as carta (carta)}
              <span class="hueco"><Carta id={carta} /></span>
            {/each}
          </span>
          <span>{JUEGOS[id].nombre}</span>
        </button>
      {/each}
    </div>
  {/snippet}

  <button class="enlace" onclick={volverAtras} data-testid="volver">
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
    grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
    gap: 8px;
  }

  .juego {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 4px;
    padding: 10px 6px;
  }

  .abanico {
    display: flex;
    height: 56px;
  }

  .hueco {
    width: 36px;
    aspect-ratio: 100 / 140;
    display: block;
  }

  .hueco + .hueco {
    margin-left: -14px;
  }

  .hueco:nth-child(1) {
    rotate: -10deg;
  }

  .hueco:nth-child(3) {
    rotate: 10deg;
  }

  .familias {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
    gap: 10px;
  }

  .buscar {
    margin-bottom: 10px;
  }

  .cabecera-familia {
    display: flex;
    align-items: center;
    gap: 12px;
    margin: 0 0 10px;
  }

  h3 {
    margin: 0;
    font-size: 1rem;
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
