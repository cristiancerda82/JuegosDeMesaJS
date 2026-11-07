<script lang="ts">
  import AccesosRapidos from '../menu/AccesosRapidos.svelte';
  import {
    FAMILIAS,
    juegosDeFamilia,
    juegosEnOrden,
    normalizar,
    pasaFiltro,
  } from '../menu/catalogo';
  import { navegacion } from '../menu/navegacion.svelte';
  import { preferencias } from '../menu/preferencias.svelte';
  import TarjetaFamilia from '../menu/TarjetaFamilia.svelte';
  import TarjetaJuego from '../menu/TarjetaJuego.svelte';
  import { pwa } from '../pwa/registro.svelte';
  import type { Guardado } from '../sesion/guardado';
  import { JUEGOS, type IdJuego } from '../sesion/juegos';
  import { T } from '../textos';

  interface Props {
    guardado: Guardado | null;
    aviso: string | null;
    dorso: string;
    elegir: (juego: IdJuego) => void;
    continuar: () => void;
    descartar: () => void;
    cambiarDorso: (dorso: string) => void;
    verCartas: () => void;
    verEstadisticas: () => void;
    jugarEnRed: () => void;
    /** Código de la sala en red de la que se viene (al recargar), o 
ull. */
    salaRed: string | null;
    volverSala: () => void;
  }

  let {
    guardado,
    aviso,
    dorso,
    elegir,
    continuar,
    descartar,
    cambiarDorso,
    verCartas,
    verEstadisticas,
    jugarEnRed,
    salaRed,
    volverSala,
  }: Props = $props();

  const filtros = ['todas', 'espanola', 'francesa'] as const;

  /** Juegos de cada familia que pasan el filtro; las familias vacías no se muestran. */
  const familias = $derived(
    FAMILIAS.map((f) => ({
      familia: f,
      juegos: juegosDeFamilia(f.id).filter((id) => pasaFiltro(id, preferencias.filtro)),
    })).filter((f) => f.juegos.length > 0),
  );

  const busqueda = $derived(normalizar(navegacion.busqueda));

  const resultados = $derived(
    busqueda === ''
      ? []
      : juegosEnOrden().filter(
          (id) => pasaFiltro(id, preferencias.filtro) && normalizar(JUEGOS[id].nombre).includes(busqueda),
        ),
  );

  /** La familia abierta, si sigue teniendo juegos con el filtro actual. */
  const abierta = $derived(familias.find((f) => f.familia.id === navegacion.familia) ?? null);
</script>

<main class="menu">
  <header>
    <h1>{T.app.titulo}</h1>
    <p>{T.app.subtitulo}</p>
  </header>

  {#if aviso}
    <p class="aviso" role="alert">{aviso}</p>
  {/if}

  {#if guardado}
    <section class="retomar" data-testid="retomar">
      <div>
        <h2>{T.menu.retomarTitulo}</h2>
        <p>{T.menu.retomar(JUEGOS[guardado.juego].nombre)}</p>
      </div>
      <div class="botones">
        <button class="principal" onclick={continuar}>{T.menu.continuar}</button>
        <button onclick={descartar}>{T.menu.descartar}</button>
      </div>
    </section>
  {/if}

  {#if salaRed}
    <section class="retomar" data-testid="volver-sala">
      <div>
        <h2>{T.menu.volverSala}</h2>
        <p>{T.menu.volverSalaDesc(salaRed)}</p>
      </div>
      <div class="botones">
        <button class="principal" onclick={volverSala}>{T.menu.volverSala}</button>
      </div>
    </section>
  {/if}

  <section class="retomar">
    <div>
      <h2>{T.menu.enRed}</h2>
      <p>{T.menu.enRedDesc}</p>
    </div>
    <div class="botones">
      <button class="principal" onclick={jugarEnRed} data-testid="jugar-en-red">{T.menu.enRed}</button>
    </div>
  </section>

  <div class="buscador">
    <label class="buscar">
      <span class="oculto-visual">{T.menu.buscar}</span>
      <input
        type="search"
        placeholder={T.menu.buscarEjemplo}
        bind:value={navegacion.busqueda}
        autocomplete="off"
        data-testid="buscar"
      />
    </label>
    <div class="filtros" role="group" aria-label={T.menu.baraja}>
      {#each filtros as f (f)}
        <button
          type="button"
          class="filtro"
          aria-pressed={preferencias.filtro === f}
          onclick={() => preferencias.cambiarFiltro(f)}
          data-testid="filtro-{f}">{T.menu.filtros[f]}</button
        >
      {/each}
    </div>
  </div>

  {#if busqueda !== ''}
    <h2 class="elegir" aria-live="polite">{T.menu.resultados(resultados.length)}</h2>
    {#if resultados.length === 0}
      <p class="sin-resultados" data-testid="sin-resultados">{T.menu.sinResultados(navegacion.busqueda.trim())}</p>
    {:else}
      <div class="juegos">
        {#each resultados as juego (juego)}
          <TarjetaJuego {juego} {elegir} />
        {/each}
      </div>
    {/if}
  {:else if abierta}
    <div class="cabecera-familia">
      <button type="button" class="volver" onclick={() => (navegacion.familia = null)} data-testid="volver-familias">
        ‹ {T.menu.volverFamilias}
      </button>
      <h2>{abierta.familia.nombre}</h2>
    </div>
    <div class="juegos">
      {#each abierta.juegos as juego (juego)}
        <TarjetaJuego {juego} {elegir} />
      {/each}
    </div>
  {:else}
    <h2 class="elegir">{T.menu.elegir}</h2>
    <div class="familias">
      {#each familias as f (f.familia.id)}
        <TarjetaFamilia familia={f.familia} juegos={f.juegos} abrir={() => (navegacion.familia = f.familia.id)} />
      {/each}
    </div>
  {/if}

  <footer>
    <label>
      {T.menu.dorso}
      <select value={dorso} onchange={(e) => cambiarDorso(e.currentTarget.value)}>
        {#each Object.entries(T.dorsos) as [valor, texto] (valor)}
          <option value={valor}>{texto}</option>
        {/each}
      </select>
    </label>
    <button class="enlace" onclick={verEstadisticas} data-testid="ver-estadisticas">{T.menu.estadisticas}</button>
    <button class="enlace" onclick={verCartas}>{T.menu.verCartas}</button>
  </footer>

  {#if !pwa.instalada}
    {#if pwa.puedeInstalar}
      <section class="instalar" data-testid="instalar">
        <p>{T.pwa.instalarDesc}</p>
        <button class="principal" onclick={() => pwa.instalar()}>{T.pwa.instalar}</button>
      </section>
    {:else if pwa.esIOS}
      <section class="instalar" data-testid="instalar-ios">
        <p>{T.pwa.instalarIOS}</p>
      </section>
    {/if}
  {/if}

  <AccesosRapidos {elegir} />
</main>

<style>
  .menu {
    max-width: 720px;
    margin: 0 auto;
    /* Hueco para los botones flotantes: la última tarjeta nunca queda tapada. */
    padding: 24px 16px calc(150px + env(safe-area-inset-bottom));
  }

  header {
    text-align: center;
    margin-bottom: 20px;
  }

  h1 {
    font-size: clamp(1.8rem, 7vw, 2.6rem);
    letter-spacing: 0.02em;
  }

  header p {
    margin: 6px 0 0;
    color: var(--texto-suave);
  }

  .aviso {
    padding: 10px 14px;
    border-radius: var(--radio);
    background: rgb(229 103 92 / 0.25);
    border: 1px solid var(--peligro);
  }

  .retomar {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    padding: 14px 16px;
    margin-bottom: 16px;
    border-radius: var(--radio);
    background: rgb(0 0 0 / 0.25);
    border: 1px solid rgb(242 193 78 / 0.6);
  }

  .retomar h2 {
    font-size: 1.05rem;
  }

  .retomar p {
    margin: 4px 0 0;
    color: var(--texto-suave);
  }

  .botones {
    display: flex;
    gap: 8px;
  }

  .elegir {
    font-size: 1rem;
    color: var(--texto-suave);
    margin: 8px 0 12px;
  }

  .buscador {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 10px 14px;
    margin-bottom: 14px;
  }

  .buscar {
    flex: 1 1 220px;
  }

  .buscar input {
    width: 100%;
    min-height: 44px;
    padding: 6px 12px;
    border-radius: var(--radio);
    background: rgb(0 0 0 / 0.3);
    border: 1px solid rgb(255 255 255 / 0.25);
  }

  .filtros {
    display: flex;
    gap: 6px;
  }

  .filtro {
    padding: 0.4rem 0.8rem;
    border-radius: 999px;
  }

  .filtro[aria-pressed='true'] {
    background: var(--acento);
    color: #2b2005;
    border-color: transparent;
    font-weight: 700;
  }

  .sin-resultados {
    color: var(--texto-suave);
  }

  .cabecera-familia {
    display: flex;
    align-items: center;
    gap: 12px;
    margin: 8px 0 12px;
  }

  .cabecera-familia h2 {
    font-size: 1.2rem;
  }

  .familias {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
    gap: 12px;
  }

  .juegos {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
    gap: 14px;
  }

  footer {
    display: flex;
    flex-wrap: wrap;
    justify-content: space-between;
    align-items: center;
    gap: 12px;
    margin-top: 28px;
    color: var(--texto-suave);
  }

  .instalar {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: space-between;
    gap: 10px 16px;
    margin-top: 18px;
    padding: 12px 14px;
    border-radius: 12px;
    background: rgb(0 0 0 / 0.2);
  }

  .instalar p {
    margin: 0;
    flex: 1 1 220px;
    color: var(--texto-suave);
  }

  select {
    margin-left: 8px;
    min-height: 40px;
    padding: 4px 8px;
    border-radius: 8px;
    background: rgb(0 0 0 / 0.3);
    border: 1px solid rgb(255 255 255 / 0.25);
  }

  .enlace {
    border: none;
    background: none;
    text-decoration: underline;
  }
</style>
