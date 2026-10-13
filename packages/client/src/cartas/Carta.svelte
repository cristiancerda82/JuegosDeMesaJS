<script lang="ts">
  import { cartaDeId, esComodin, type IdCarta } from '@juegos/engine';
  import { T } from '../textos';
  import {
    colocar,
    COLOR_COMODIN,
    COMODIN,
    ESTRELLA,
    colorTinta,
    type DibujoPalo,
    figuraDe,
    FIGURAS,
    esFrancesa,
    indice,
    nombreCarta,
    PALOS,
    pips,
  } from './dibujo';

  interface Props {
    /** Carta a dibujar; `null` dibuja el dorso. */
    id?: IdCarta | null;
  }

  let { id = null }: Props = $props();

  const carta = $derived(id === null ? null : cartaDeId(id));
  const palo = $derived(carta === null ? null : PALOS[carta.palo]);
  const tinta = $derived(carta === null ? '' : colorTinta(carta.palo));
  const figura = $derived(carta === null ? null : figuraDe(carta.palo, carta.valor));
</script>

<svg
  class="carta"
  viewBox="0 0 100 140"
  role="img"
  aria-label={id === null ? T.cartas.dorso : nombreCarta(id)}
>
  {#if id !== null && esComodin(id)}
    <rect x="1" y="1" width="98" height="138" rx="8" fill="var(--papel)" stroke="var(--borde-carta)" stroke-width="1.5" />
    {#each [0, 1] as k (k)}
      <g transform={k === 0 ? '' : 'rotate(180 50 70)'}>
        <path d={ESTRELLA} fill={COLOR_COMODIN} transform={colocar(12, 16, 18)} />
      </g>
    {/each}
    <rect x="18" y="22" width="64" height="96" rx="6" fill={COLOR_COMODIN} fill-opacity="0.08" stroke={COLOR_COMODIN} stroke-width="2" />
    {#each COMODIN as capa, i (i)}
      <path
        d={capa.d}
        fill={capa.relleno === 'papel' ? 'var(--papel)' : capa.relleno === 'oro' ? '#d4a017' : COLOR_COMODIN}
        transform={colocar(50, 62, 54)}
      />
    {/each}
    <text x="50" y="108" text-anchor="middle" font-size="11" font-weight="800" letter-spacing="1" fill={COLOR_COMODIN}>
      {T.cartas.comodin.toUpperCase()}
    </text>
  {:else if carta === null || palo === null}
    <defs>
      <pattern id="trama-dorso" width="12" height="12" patternUnits="userSpaceOnUse">
        <path d="M6 0L12 6L6 12L0 6Z" fill="var(--dorso-claro)" opacity="0.55" />
      </pattern>
    </defs>
    <rect x="1" y="1" width="98" height="138" rx="8" fill="var(--dorso)" stroke="#fff" stroke-width="2" />
    <rect x="9" y="9" width="82" height="122" rx="4" fill="url(#trama-dorso)" stroke="var(--dorso-claro)" stroke-width="2" />
  {:else}
    <rect x="1" y="1" width="98" height="138" rx="8" fill="var(--papel)" stroke="var(--borde-carta)" stroke-width="1.5" />

    {#snippet esquina(texto: string, dibujo: DibujoPalo)}
      <text x="12" y="27" text-anchor="middle" font-size={texto.length > 1 ? 21 : 26} letter-spacing={texto.length > 1 ? -1.5 : 0} font-weight="700" fill={tinta}>
        {texto}
      </text>
      <path d={dibujo.d} fill={dibujo.color} fill-rule={dibujo.regla} transform={colocar(12, 41, 16)} />
    {/snippet}

    {@render esquina(indice(carta.palo, carta.valor), palo)}
    <g transform="rotate(180 50 70)">{@render esquina(indice(carta.palo, carta.valor), palo)}</g>

    {#if figura !== null}
      <rect x="27" y="14" width="46" height="112" rx="6" fill={palo.color} fill-opacity="0.1" stroke={palo.color} stroke-width="2" />
      {#each FIGURAS[figura] as capa, i (i)}
        <path
          d={capa.d}
          fill={capa.relleno === 'tinta' ? tinta : 'var(--papel)'}
          transform={colocar(50, 56, 42)}
        />
      {/each}
      <path d={palo.d} fill={palo.color} fill-rule={palo.regla} transform={colocar(50, 102, 22)} />
    {:else if carta.valor === 1}
      <path
        d={palo.d}
        fill={palo.color}
        fill-rule={palo.regla}
        transform={colocar(50, 70, esFrancesa(carta.palo) ? 40 : 54)}
      />
    {:else}
      {#each pips(carta.valor) as [x, y], i (i)}
        <path d={palo.d} fill={palo.color} fill-rule={palo.regla} transform={colocar(x, y, 20)} />
      {/each}
    {/if}
  {/if}
</svg>

<style>
  .carta {
    display: block;
    width: 100%;
    height: 100%;
    border-radius: 7%;
    box-shadow: var(--sombra);
    font-family: system-ui, 'Segoe UI', Roboto, Arial, sans-serif;
    user-select: none;
    -webkit-user-select: none;
  }
</style>
