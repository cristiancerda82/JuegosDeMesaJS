<script lang="ts">
  import Carta from '../cartas/Carta.svelte';
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
  }

  let { guardado, aviso, dorso, elegir, continuar, descartar, cambiarDorso, verCartas }: Props =
    $props();

  const juegos = [
    { id: 'klondike', desc: T.menu.klondikeDesc, cartas: ['picas-1', 'corazones-13', 'diamantes-12'] },
    { id: 'brisca', desc: T.menu.briscaDesc, cartas: ['oros-1', 'copas-3', 'espadas-12'] },
    { id: 'tute', desc: T.menu.tuteDesc, cartas: ['bastos-12', 'oros-11', 'copas-12'] },
    { id: 'guinote', desc: T.menu.guinoteDesc, cartas: ['espadas-12', 'espadas-10', 'oros-7'] },
    { id: 'escoba', desc: T.menu.escobaDesc, cartas: ['oros-7', 'copas-11', 'espadas-6'] },
    { id: 'chinchon', desc: T.menu.chinchonDesc, cartas: ['copas-5', 'copas-6', 'comodin-1'] },
  ] as const;
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

  <h2 class="elegir">{T.menu.elegir}</h2>
  <div class="juegos">
    {#each juegos as juego (juego.id)}
      <button class="juego" onclick={() => elegir(juego.id)} data-testid="juego-{juego.id}">
        <span class="abanico" aria-hidden="true">
          {#each juego.cartas as id (id)}
            <span class="hueco"><Carta {id} /></span>
          {/each}
        </span>
        <span class="titulo">{JUEGOS[juego.id].nombre}</span>
        <span class="desc">{juego.desc}</span>
        <span class="jugar">{T.menu.jugar}</span>
      </button>
    {/each}
  </div>

  <footer>
    <label>
      {T.menu.dorso}
      <select value={dorso} onchange={(e) => cambiarDorso(e.currentTarget.value)}>
        {#each Object.entries(T.dorsos) as [valor, texto] (valor)}
          <option value={valor}>{texto}</option>
        {/each}
      </select>
    </label>
    <button class="enlace" onclick={verCartas}>{T.menu.verCartas}</button>
  </footer>
</main>

<style>
  .menu {
    max-width: 720px;
    margin: 0 auto;
    padding: 24px 16px 32px;
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

  .juegos {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
    gap: 14px;
  }

  .juego {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 6px;
    padding: 18px 14px;
    text-align: center;
    background: rgb(0 0 0 / 0.22);
  }

  .abanico {
    display: flex;
    height: 92px;
    margin-bottom: 6px;
  }

  .hueco {
    width: 58px;
    aspect-ratio: 100 / 140;
    display: block;
  }

  .hueco + .hueco {
    margin-left: -22px;
  }

  .hueco:nth-child(1) {
    rotate: -10deg;
  }

  .hueco:nth-child(3) {
    rotate: 10deg;
  }

  .titulo {
    font-size: 1.35rem;
    font-weight: 700;
  }

  .desc {
    color: var(--texto-suave);
    font-size: 0.92rem;
  }

  .jugar {
    margin-top: 6px;
    padding: 6px 18px;
    border-radius: var(--radio);
    background: var(--acento);
    color: #2b2005;
    font-weight: 700;
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
